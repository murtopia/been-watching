import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET /api/feed
 * 
 * Returns unified feed with activities, recommendations, and release notifications
 * 
 * Query params:
 * - limit: number of items (default: 20)
 * - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get admin setting for feed visibility
    // NOTE: If admin_settings table doesn't exist, default to showing all users
    let showAllUsers = true // Default to true if table doesn't exist
    let settingError: any = null
    let feedSetting: any = null
    
    try {
      const result = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'feed_show_all_users')
        .single()
      
      feedSetting = result.data
      settingError = result.error
      
      if (!result.error && result.data) {
        showAllUsers = result.data.setting_value === 'true'
      }
    } catch (e) {
      // Table doesn't exist, use default
      console.log('admin_settings table not found, defaulting to showAllUsers=true')
    }

    console.log('Feed API - Admin setting query:', { feedSetting, settingError, showAllUsers })

    // Get activities based on admin setting
    // NOTE: activity_group_id column may not exist yet, so we don't query it
    let activitiesQuery = supabase
      .from('activities')
      .select(`
        id,
        user_id,
        media_id,
        activity_type,
        activity_data,
        created_at,
        profiles!activities_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),
        media:media_id (
          id,
          title,
          poster_path,
          backdrop_path,
          overview,
          release_date,
          vote_average,
          media_type,
          tmdb_data
        )
      `)
      .neq('user_id', user.id) // Always exclude current user's activities
      .order('created_at', { ascending: false })

    if (!showAllUsers) {
      // Only show activities from followed users
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .eq('status', 'accepted')
      
      const followedUserIds = follows?.map(f => f.following_id) || []
      if (followedUserIds.length > 0) {
        activitiesQuery = activitiesQuery.in('user_id', followedUserIds)
      } else {
        // No followed users, return empty result
        return NextResponse.json({
          items: [],
          hasMore: false,
          limit,
          offset,
          // DEBUG INFO - this is why it's empty!
          _debug: {
            reason: 'NO_FOLLOWED_USERS',
            showAllUsers,
            adminSettingValue: feedSetting?.setting_value,
            followedUserIds: []
          }
        })
      }
    }

    const { data: activities, error: activitiesError } = await activitiesQuery
      .range(offset, offset + limit - 1)

    console.log('Feed API - Activities query result:', { 
      count: activities?.length || 0, 
      error: activitiesError,
      firstActivity: activities?.[0]?.id 
    })

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
    }

    // Convert activities to feed items (no grouping for now - activity_group_id column may not exist)
    const feedItems: any[] = []

    for (const activity of (activities || [])) {
      // Try to get like/comment counts, but don't fail if tables don't exist
      let likeCount = 0
      let commentCount = 0
      let userLiked = false

      try {
        const { count } = await supabase
          .from('activity_likes')
          .select('*', { count: 'exact', head: true })
          .eq('activity_id', activity.id)
        likeCount = count || 0

        const { data: userLike } = await supabase
          .from('activity_likes')
          .select('id')
          .eq('activity_id', activity.id)
          .eq('user_id', user.id)
          .maybeSingle()
        userLiked = !!userLike
      } catch (e) {
        // activity_likes table may not exist
      }

      try {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('activity_id', activity.id)
        commentCount = count || 0
      } catch (e) {
        // comments table may not exist
      }

      feedItems.push({
        type: 'activity',
        id: activity.id,
        activityTypes: [activity.activity_type],
        activityData: [activity.activity_data],
        user: activity.profiles,
        media: activity.media,
        created_at: activity.created_at,
        like_count: likeCount,
        comment_count: commentCount,
        user_liked: userLiked
      })
    }

    // Get recommendations (interleave every 5th item)
    const recommendationLimit = Math.floor(limit / 5)
    const { data: recommendations } = await supabase
      .from('recommendations')
      .select(`
        *,
        media:media_id (
          id,
          title,
          poster_path,
          backdrop_path,
          overview,
          release_date,
          vote_average,
          media_type,
          tmdb_data
        )
      `)
      .eq('user_id', user.id)
      .order('score', { ascending: false })
      .limit(recommendationLimit)

    // Interleave recommendations every 5th position
    if (recommendations && recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        const position = (index + 1) * 5 - 1
        if (position < feedItems.length) {
          feedItems.splice(position, 0, {
            type: 'recommendation',
            id: rec.id,
            score: rec.score,
            algorithm_type: rec.algorithm_type,
            reason: rec.reason,
            media: rec.media,
            created_at: rec.created_at
          })
        } else {
          // Add at end if not enough activities
          feedItems.push({
            type: 'recommendation',
            id: rec.id,
            score: rec.score,
            algorithm_type: rec.algorithm_type,
            reason: rec.reason,
            media: rec.media,
            created_at: rec.created_at
          })
        }
      })
    }

    // Get release notifications (interleave every 10th item)
    const releaseLimit = Math.floor(limit / 10)
    const today = new Date().toISOString().split('T')[0]
    
    const { data: releases } = await supabase
      .from('release_notifications')
      .select(`
        *,
        media:media_id (
          id,
          title,
          poster_path,
          backdrop_path,
          overview,
          release_date,
          vote_average,
          media_type,
          tmdb_data
        )
      `)
      .eq('user_id', user.id)
      .gte('release_date', today)
      .order('release_date', { ascending: true })
      .limit(releaseLimit)

    // Interleave releases every 10th position
    if (releases && releases.length > 0) {
      releases.forEach((release, index) => {
        const position = (index + 1) * 10 - 1
        if (position < feedItems.length) {
          feedItems.splice(position, 0, {
            type: 'release_notification',
            id: release.id,
            season_number: release.season_number,
            release_date: release.release_date,
            notification_type: release.notification_type,
            streaming_service: release.streaming_service,
            media: release.media,
            created_at: release.created_at
          })
        } else {
          // Add at end if not enough items
          feedItems.push({
            type: 'release_notification',
            id: release.id,
            season_number: release.season_number,
            release_date: release.release_date,
            notification_type: release.notification_type,
            streaming_service: release.streaming_service,
            media: release.media,
            created_at: release.created_at
          })
        }
      })
    }

    // Sort by created_at descending
    feedItems.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Apply pagination
    const paginatedItems = feedItems.slice(offset, offset + limit)

    return NextResponse.json({
      items: paginatedItems,
      limit,
      offset,
      hasMore: feedItems.length > offset + limit,
      total: feedItems.length,
      // DEBUG INFO - remove after fixing
      _debug: {
        showAllUsers,
        adminSettingValue: feedSetting?.setting_value,
        adminSettingError: settingError?.message,
        activitiesCount: activities?.length || 0,
        activitiesError: activitiesError?.message,
        userId: user.id
      }
    })
  } catch (error) {
    console.error('Error in feed API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


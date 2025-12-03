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
    const { data: feedSetting, error: settingError } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'feed_show_all_users')
      .single()

    console.log('Feed API - Admin setting query:', { feedSetting, settingError })

    const showAllUsers = feedSetting?.setting_value === 'true'
    console.log('Feed API - showAllUsers:', showAllUsers)

    // Get activities based on admin setting
    let activitiesQuery = supabase
      .from('activities')
      .select(`
        id,
        user_id,
        media_id,
        activity_type,
        activity_data,
        activity_group_id,
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

    // Group activities by activity_group_id
    const groupedActivities = new Map<string, any[]>()
    const standaloneActivities: any[] = []

    activities?.forEach((activity: any) => {
      if (activity.activity_group_id) {
        if (!groupedActivities.has(activity.activity_group_id)) {
          groupedActivities.set(activity.activity_group_id, [])
        }
        groupedActivities.get(activity.activity_group_id)!.push(activity)
      } else {
        standaloneActivities.push(activity)
      }
    })

    // Convert grouped activities to feed items
    const feedItems: any[] = []

    // Add grouped activities
    for (const [groupId, groupActivities] of groupedActivities.entries()) {
      if (groupActivities.length === 0) continue

      const firstActivity = groupActivities[0]
      const activityTypes = groupActivities.map(a => a.activity_type)
      const activityDataArray = groupActivities.map(a => a.activity_data)

      // Get like/comment counts for the group (use first activity's ID)
      const { count: likeCount } = await supabase
        .from('activity_likes')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', firstActivity.id)

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', firstActivity.id)

      const { data: userLike } = await supabase
        .from('activity_likes')
        .select('id')
        .eq('activity_id', firstActivity.id)
        .eq('user_id', user.id)
        .maybeSingle()

      feedItems.push({
        type: 'activity',
        id: groupId,
        groupKey: groupId,
        activityTypes,
        activityData: activityDataArray,
        user: firstActivity.profiles,
        media: firstActivity.media,
        created_at: firstActivity.created_at,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        user_liked: !!userLike
      })
    }

    // Add standalone activities
    for (const activity of standaloneActivities) {
      const { count: likeCount } = await supabase
        .from('activity_likes')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activity.id)

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activity.id)

      const { data: userLike } = await supabase
        .from('activity_likes')
        .select('id')
        .eq('activity_id', activity.id)
        .eq('user_id', user.id)
        .maybeSingle()

      feedItems.push({
        type: 'activity',
        id: activity.id,
        groupKey: activity.id,
        activityTypes: [activity.activity_type],
        activityData: [activity.activity_data],
        user: activity.profiles,
        media: activity.media,
        created_at: activity.created_at,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        user_liked: !!userLike
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


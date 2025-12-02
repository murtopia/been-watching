/**
 * Preview Feed Live - Test new React cards with real API data
 * 
 * Purpose: Verify data transformation and card rendering before
 * replacing the main feed components
 * 
 * URL: /preview/feed-live
 */

'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserActivityCard, FeedCard, BADGE_PRESETS } from '@/components/feed/UserActivityCard'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'
import { 
  activityToUserActivityCardData, 
  recommendationToFeedCardData,
  getRecommendationBadge,
  APIActivity,
  APIFriendsActivity,
  APIShowComment
} from '@/utils/feedDataTransformers'

interface FeedItem {
  type: 'activity' | 'recommendation' | 'follow_suggestions'
  id: string
  data: any
}

interface DebugInfo {
  totalActivitiesInDB: number
  followsCount: number
  adminShowAll: boolean
  apiResponse: any
}

export default function PreviewFeedLivePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadFeed()
    }
  }, [user])

  const loadUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      setError('Please log in to view the feed')
      setLoading(false)
      return
    }
    setUser(user)
  }

  const loadFeed = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch feed from API
      console.log('Fetching feed...')
      const response = await fetch('/api/feed?limit=10&offset=0')
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Feed API Error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Feed API Response:', data)

      if (!data.items || data.items.length === 0) {
        console.log('No items in feed - checking why...')
        // Let's also check if there are ANY activities in the database
        const { data: allActivities, error: actError } = await supabase
          .from('activities')
          .select('id, user_id, activity_type, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
        
        console.log('Sample activities in DB:', allActivities, actError)
        
        // Check follows
        const { data: follows, error: followError } = await supabase
          .from('follows')
          .select('following_id, status')
          .eq('follower_id', user?.id)
        
        console.log('User follows:', follows, followError)
        
        // Check admin setting
        const { data: adminSetting } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'feed_show_all_users')
          .single()
        
        console.log('Admin setting feed_show_all_users:', adminSetting)
        
        // Store debug info for display
        setDebugInfo({
          totalActivitiesInDB: allActivities?.length || 0,
          followsCount: follows?.filter(f => f.status === 'accepted').length || 0,
          adminShowAll: adminSetting?.setting_value === 'true',
          apiResponse: data
        })
        
        setFeedItems([])
        setLoading(false)
        return
      }

      // Transform API items to FeedItem format
      const transformedItems: FeedItem[] = []

      for (const item of data.items) {
        if (item.type === 'activity') {
          // Fetch additional data for this activity
          const friendsActivity = await fetchFriendsActivity(item.media?.id)
          const showComments = await fetchShowComments(item.media?.id)
          
          transformedItems.push({
            type: 'activity',
            id: item.id,
            data: {
              activity: item,
              friendsActivity,
              showComments
            }
          })
        }
        // TODO: Handle other types (recommendations, follow_suggestions)
      }

      setFeedItems(transformedItems)
    } catch (err) {
      console.error('Error loading feed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendsActivity = async (mediaId: string): Promise<APIFriendsActivity | undefined> => {
    if (!mediaId || !user) return undefined

    try {
      // Get friends' watch statuses
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .eq('status', 'accepted')

      const friendIds = follows?.map(f => f.following_id) || []
      if (friendIds.length === 0) return undefined

      // Get friends' watch statuses for this media
      const { data: watchStatuses } = await supabase
        .from('watch_status')
        .select(`
          user_id,
          status,
          profiles!watch_status_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('media_id', mediaId)
        .in('user_id', friendIds)

      // Get friends' ratings for this media
      const { data: ratings } = await supabase
        .from('ratings')
        .select(`
          user_id,
          rating,
          profiles!ratings_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('media_id', mediaId)
        .in('user_id', friendIds)

      // Get current user's rating
      const { data: userRating } = await supabase
        .from('ratings')
        .select('rating')
        .eq('media_id', mediaId)
        .eq('user_id', user.id)
        .maybeSingle()

      // Get current user's status
      const { data: userStatus } = await supabase
        .from('watch_status')
        .select('status')
        .eq('media_id', mediaId)
        .eq('user_id', user.id)
        .maybeSingle()

      // Organize by status
      const watching: any[] = []
      const wantToWatch: any[] = []
      const watched: any[] = []

      watchStatuses?.forEach((ws: any) => {
        const profile = ws.profiles
        const item = {
          user_id: ws.user_id,
          display_name: profile?.display_name || 'Unknown',
          avatar_url: profile?.avatar_url
        }
        
        if (ws.status === 'watching') watching.push(item)
        else if (ws.status === 'want') wantToWatch.push(item)
        else if (ws.status === 'watched') watched.push(item)
      })

      // Count ratings
      let meh = 0, like = 0, love = 0
      ratings?.forEach((r: any) => {
        if (r.rating === 'dislike') meh++
        else if (r.rating === 'like') like++
        else if (r.rating === 'love') love++
      })

      return {
        watching,
        wantToWatch,
        watched,
        ratings: { meh, like, love },
        userRating: userRating?.rating as 'meh' | 'like' | 'love' | undefined,
        userStatus: userStatus?.status as 'want' | 'watching' | 'watched' | undefined
      }
    } catch (err) {
      console.error('Error fetching friends activity:', err)
      return undefined
    }
  }

  const fetchShowComments = async (mediaId: string): Promise<APIShowComment[]> => {
    if (!mediaId) return []

    try {
      const { data: comments } = await supabase
        .from('show_comments')
        .select(`
          id,
          user_id,
          comment_text,
          created_at,
          profiles!show_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false })
        .limit(20)

      return (comments || []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        comment_text: c.comment_text,
        created_at: c.created_at,
        user: {
          display_name: c.profiles?.display_name || 'Unknown',
          avatar_url: c.profiles?.avatar_url
        }
      }))
    } catch (err) {
      console.error('Error fetching show comments:', err)
      return []
    }
  }

  const handleTrack = (action: string, metadata?: any) => {
    console.log('Track:', action, metadata)
  }

  const handleLike = async (activityId: string) => {
    console.log('Like activity:', activityId)
    // TODO: Implement like toggle
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Loading feed...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>Error: {error}</div>
        <a href="/auth" style={{ color: '#3b82f6' }}>Go to Login</a>
      </div>
    )
  }

  if (feedItems.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '18px' }}>No activities in your feed yet.</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textAlign: 'center' }}>
          Follow some friends or wait for activity!
        </div>
        
        {debugInfo && (
          <div style={{ 
            marginTop: '20px', 
            background: 'rgba(0,0,0,0.5)', 
            padding: '16px', 
            borderRadius: '8px',
            fontSize: '13px',
            maxWidth: '350px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#3b82f6' }}>
              Debug Info:
            </div>
            <div>Activities in DB: {debugInfo.totalActivitiesInDB}</div>
            <div>Your accepted follows: {debugInfo.followsCount}</div>
            <div>Admin "show all users": {debugInfo.adminShowAll ? 'Yes' : 'No'}</div>
            <div style={{ marginTop: '10px', color: 'rgba(255,255,255,0.6)' }}>
              {debugInfo.totalActivitiesInDB === 0 && "No activities exist in the database."}
              {debugInfo.totalActivitiesInDB > 0 && debugInfo.followsCount === 0 && !debugInfo.adminShowAll && 
                "You need to follow someone OR enable 'show all users' in admin."}
              {debugInfo.totalActivitiesInDB > 0 && (debugInfo.followsCount > 0 || debugInfo.adminShowAll) &&
                "Activities exist but may be filtered out (e.g., your own activities)."}
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <a href="/admin" style={{ color: '#3b82f6', fontSize: '14px' }}>Admin Panel</a>
          <a href="/feed" style={{ color: '#3b82f6', fontSize: '14px' }}>Old Feed</a>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .feed-scroll-container {
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          background: #1a1a1a;
        }
        
        .card-snap-wrapper {
          scroll-snap-align: center;
          scroll-snap-stop: always;
          padding: 15px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .card-inner-wrapper {
          width: 100%;
          max-width: 398px;
          display: flex;
          justify-content: center;
        }
        
        .debug-info {
          position: fixed;
          top: 10px;
          left: 10px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 10px;
          font-size: 12px;
          border-radius: 8px;
          z-index: 1000;
        }
      `}</style>

      <div className="debug-info">
        <div>Feed Items: {feedItems.length}</div>
        <div>User: {user?.email}</div>
      </div>

      <div className="feed-scroll-container">
        {feedItems.map((item) => {
          if (item.type === 'activity') {
            const { activity, friendsActivity, showComments } = item.data
            
            // Transform to card data
            const cardData = activityToUserActivityCardData(
              activity as APIActivity,
              friendsActivity,
              showComments
            )

            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <UserActivityCard
                    data={cardData}
                    onLike={() => handleLike(activity.id)}
                    onComment={() => console.log('Comment')}
                    onShare={() => console.log('Share')}
                    onAddToWatchlist={() => console.log('Add to watchlist')}
                    onTrack={handleTrack}
                  />
                </div>
              </div>
            )
          }

          return null
        })}
      </div>
    </>
  )
}


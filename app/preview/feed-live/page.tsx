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

export default function PreviewFeedLivePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
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
      
      // Fetch feed from API
      const response = await fetch('/api/feed?limit=10&offset=0')
      
      if (!response.ok) {
        throw new Error('Failed to load feed')
      }

      const data = await response.json()
      console.log('Feed API Response:', data)

      if (!data.items || data.items.length === 0) {
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
        gap: '16px'
      }}>
        <div>No activities in your feed yet.</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          Follow some friends or wait for activity!
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


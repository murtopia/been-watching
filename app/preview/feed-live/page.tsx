/**
 * Preview Feed Live - Test new React cards with real API data
 * 
 * Purpose: Verify data transformation and card rendering before
 * replacing the main feed components
 * 
 * URL: /preview/feed-live
 */

'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserActivityCard, FeedCard, BADGE_PRESETS } from '@/components/feed/UserActivityCard'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'
import BottomNav from '@/components/navigation/BottomNav'
import AppHeader from '@/components/navigation/AppHeader'
import SearchModal from '@/components/search/SearchModal'
import { 
  activityToUserActivityCardData, 
  recommendationToFeedCardData,
  getRecommendationBadge,
  APIActivity,
  APIFriendsActivity,
  APIShowComment,
  APIComment
} from '@/utils/feedDataTransformers'

// Initial batch size and load more batch size
const INITIAL_BATCH_SIZE = 5
const LOAD_MORE_BATCH_SIZE = 5

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

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export default function PreviewFeedLivePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [apiTestResult, setApiTestResult] = useState<string | null>(null)
  
  // Infinite scroll state
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false) // Prevent duplicate calls
  
  // Track dismissed user suggestions (persist across card re-insertions)
  const [dismissedUsers, setDismissedUsers] = useState<Set<string>>(new Set())
  const followSuggestionsCount = useRef(0) // Track how many times we've shown the card
  
  const supabase = createClient()
  
  // Test API directly
  const testApi = async () => {
    setApiTestResult('Testing...')
    try {
      const response = await fetch('/api/feed?limit=10&offset=0')
      const data = await response.json()
      setApiTestResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setApiTestResult(`Error: ${err}`)
    }
  }

  // Scroll to top on page load (prevents scroll restoration putting content behind header)
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
    
    // Also scroll after a tiny delay to catch any late restoration attempts
    const timeout = setTimeout(() => window.scrollTo(0, 0), 50)
    return () => clearTimeout(timeout)
  }, [])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoadingRef.current) {
          loadMoreItems()
        }
      },
      {
        rootMargin: '200px', // Load more when 200px from bottom
        threshold: 0.1
      }
    )

    observer.observe(loaderRef.current)

    return () => observer.disconnect()
  }, [hasMore, loading])

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
    
    // Load user profile for header
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (profileData) {
      setProfile(profileData)
    }
  }

  const loadFeed = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // FIRST: Direct database query to see all activities
      console.log('Direct DB query - all activities...')
      const { data: directActivities, error: directError } = await supabase
        .from('activities')
        .select(`
          id,
          user_id,
          activity_type,
          created_at,
          profiles:user_id (display_name, username),
          media:media_id (title)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      
      console.log('Direct DB activities:', directActivities, directError)
      console.log('Current user ID:', user?.id)
      
      // Check how many are NOT from current user
      const otherUsersActivities = directActivities?.filter(a => a.user_id !== user?.id) || []
      console.log('Activities from OTHER users:', otherUsersActivities.length)
      
      // TEST MODE: Bypass API and render directly from DB
      // This helps us verify the cards work before fixing the API
      const useTestMode = true // Set to true to bypass API
      
      if (useTestMode && otherUsersActivities.length > 0) {
        console.log('TEST MODE: Rendering directly from DB, bypassing API')
        
        // Get full activity data for rendering
        const { data: fullActivities } = await supabase
          .from('activities')
          .select(`
            id,
            user_id,
            media_id,
            activity_type,
            activity_data,
            created_at,
            profiles:user_id (
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
          .neq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(INITIAL_BATCH_SIZE)
        
        console.log('Full activities for rendering:', fullActivities)
        
        if (fullActivities && fullActivities.length > 0) {
          // Set cursor to last item's created_at for pagination
          const lastActivity = fullActivities[fullActivities.length - 1]
          setCursor(lastActivity.created_at)
          setHasMore(fullActivities.length === INITIAL_BATCH_SIZE)
          // Fetch comments for each activity
          const transformedItems: FeedItem[] = await Promise.all(
            fullActivities.map(async (activity) => {
              const activityComments = await fetchActivityComments(activity.id)
              const showComments = await fetchShowComments(activity.media_id)
              const friendsActivity = await fetchFriendsActivity(activity.media_id)
              
              // Fetch watch providers (streaming platforms)
              const mediaType = (activity.media as any)?.media_type || (activity.media_id?.startsWith('movie-') ? 'movie' : 'tv')
              const streamingPlatforms = await fetchWatchProviders(activity.media_id, mediaType)
              
              // Fetch activity likes
              const { data: activityLikes } = await supabase
                .from('activity_likes')
                .select('user_id')
                .eq('activity_id', activity.id)
              
              const userLiked = user ? activityLikes?.some(like => like.user_id === user.id) : false
              const likeCount = activityLikes?.length || 0
              
              // Fetch user's rating and watch status for this media
              let userRating: string | null = null
              let userStatus: string | null = null
              
              if (user && activity.media_id) {
                const { data: ratingData } = await supabase
                  .from('ratings')
                  .select('rating')
                  .eq('user_id', user.id)
                  .eq('media_id', activity.media_id)
                  .maybeSingle()
                
                userRating = ratingData?.rating || null
                
                const { data: statusData } = await supabase
                  .from('watch_status')
                  .select('status')
                  .eq('user_id', user.id)
                  .eq('media_id', activity.media_id)
                  .maybeSingle()
                
                userStatus = statusData?.status || null
              }
              
              // Add like_count, comment_count, and user_liked to activity object for transformer
              const activityWithLikes = {
                ...activity,
                like_count: likeCount,
                comment_count: activityComments?.length || 0,
                user_liked: userLiked
              }
              
              return {
                type: 'activity' as const,
                id: activity.id,
                data: {
                  activity: activityWithLikes,
                  friendsActivity,
                  showComments,
                  activityComments,
                  userLiked,
                  likeCount,
                  userRating,
                  userStatus,
                  streamingPlatforms
                }
              }
            })
          )
          
          // Fetch user suggestions for Find New Friends card
          const userSuggestions = await fetchUserSuggestions()
          
          // Insert follow_suggestions card at position 2 (after first 2 activity cards)
          if (userSuggestions.length > 0) {
            const followSuggestionsCard: FeedItem = {
              type: 'follow_suggestions',
              id: 'follow-suggestions-1',
              data: {
                suggestions: userSuggestions
              }
            }
            
            // Insert at position 2 (index 2)
            if (transformedItems.length >= 2) {
              transformedItems.splice(2, 0, followSuggestionsCard)
            } else {
              transformedItems.push(followSuggestionsCard)
            }
          }
          
          setFeedItems(transformedItems)
          setLoading(false)
          return
        }
      }
      
      if (otherUsersActivities.length === 0 && directActivities && directActivities.length > 0) {
        // All activities are from current user
        setDebugInfo({
          totalActivitiesInDB: directActivities.length,
          followsCount: 0,
          adminShowAll: true,
          apiResponse: { message: 'All activities are yours - excluded from feed' },
          activitiesFromFollowed: 0,
          myActivities: directActivities.length,
          sampleActivities: directActivities.map(a => ({
            user: (a.profiles as any)?.display_name || (a.profiles as any)?.username || 'Unknown',
            type: a.activity_type,
            media: (a.media as any)?.title || 'Unknown',
            isMe: a.user_id === user?.id,
            isFollowed: false
          }))
        } as any)
        setFeedItems([])
        setLoading(false)
        return
      }
      
      // Fetch feed from API
      console.log('Fetching feed from API...')
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
        console.log('API returned no items')
        // Use the direct query results we already have
        setDebugInfo({
          totalActivitiesInDB: directActivities?.length || 0,
          followsCount: 0,
          adminShowAll: true,
          apiResponse: data,
          activitiesFromFollowed: 0,
          myActivities: directActivities?.filter(a => a.user_id === user?.id).length || 0,
          sampleActivities: directActivities?.map(a => ({
            user: (a.profiles as any)?.display_name || (a.profiles as any)?.username || 'Unknown',
            type: a.activity_type,
            media: (a.media as any)?.title || 'Unknown',
            isMe: a.user_id === user?.id,
            isFollowed: false
          }))
        } as any)
        
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
          
          // Fetch watch providers (streaming platforms)
          const mediaType = item.media?.media_type || 'tv'
          const streamingPlatforms = await fetchWatchProviders(item.media?.id, mediaType)
          
          // Fetch activity likes
          const { data: activityLikes } = await supabase
            .from('activity_likes')
            .select('user_id')
            .eq('activity_id', item.id)
          
          const userLiked = user ? activityLikes?.some(like => like.user_id === user.id) : false
          const likeCount = activityLikes?.length || 0
          
          // Fetch user's rating and watch status for this media
          let userRating: string | null = null
          let userStatus: string | null = null
          
          if (user && item.media?.id) {
            const { data: ratingData } = await supabase
              .from('ratings')
              .select('rating')
              .eq('user_id', user.id)
              .eq('media_id', item.media.id)
              .maybeSingle()
            
            userRating = ratingData?.rating || null
            
            const { data: statusData } = await supabase
              .from('watch_status')
              .select('status')
              .eq('user_id', user.id)
              .eq('media_id', item.media.id)
              .maybeSingle()
            
            userStatus = statusData?.status || null
          }
          
          // Add like_count, comment_count, and user_liked to activity object for transformer
          const activityWithLikes = {
            ...item,
            like_count: likeCount,
            comment_count: item.comments?.length || 0,
            user_liked: userLiked
          }
          
          transformedItems.push({
            type: 'activity',
            id: item.id,
            data: {
              activity: activityWithLikes,
              friendsActivity,
              showComments,
              activityComments: item.comments || [],
              userLiked,
              likeCount,
              userRating,
              userStatus,
              streamingPlatforms
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

  // Load more items when scrolling (infinite scroll)
  const loadMoreItems = async () => {
    if (isLoadingRef.current || !hasMore || !cursor || !user) return
    
    isLoadingRef.current = true
    setIsLoadingMore(true)
    
    try {
      console.log('Loading more items with cursor:', cursor)
      
      // Fetch more activities using cursor
      const { data: moreActivities } = await supabase
        .from('activities')
        .select(`
          id,
          user_id,
          media_id,
          activity_type,
          activity_data,
          created_at,
          profiles:user_id (
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
        .neq('user_id', user.id)
        .lt('created_at', cursor)
        .order('created_at', { ascending: false })
        .limit(LOAD_MORE_BATCH_SIZE)
      
      if (!moreActivities || moreActivities.length === 0) {
        setHasMore(false)
        return
      }
      
      // Update cursor for next load
      const lastActivity = moreActivities[moreActivities.length - 1]
      setCursor(lastActivity.created_at)
      setHasMore(moreActivities.length === LOAD_MORE_BATCH_SIZE)
      
      // Transform new activities
      const newItems: FeedItem[] = await Promise.all(
        moreActivities.map(async (activity) => {
          const activityComments = await fetchActivityComments(activity.id)
          const showComments = await fetchShowComments(activity.media_id)
          const friendsActivity = await fetchFriendsActivity(activity.media_id)
          
          const mediaType = (activity.media as any)?.media_type || (activity.media_id?.startsWith('movie-') ? 'movie' : 'tv')
          const streamingPlatforms = await fetchWatchProviders(activity.media_id, mediaType)
          
          const { data: activityLikes } = await supabase
            .from('activity_likes')
            .select('user_id')
            .eq('activity_id', activity.id)
          
          const userLiked = activityLikes?.some(like => like.user_id === user.id) || false
          const likeCount = activityLikes?.length || 0
          
          let userRating: string | null = null
          let userStatus: string | null = null
          
          if (activity.media_id) {
            const { data: ratingData } = await supabase
              .from('ratings')
              .select('rating')
              .eq('user_id', user.id)
              .eq('media_id', activity.media_id)
              .maybeSingle()
            
            userRating = ratingData?.rating || null
            
            const { data: statusData } = await supabase
              .from('watch_status')
              .select('status')
              .eq('user_id', user.id)
              .eq('media_id', activity.media_id)
              .maybeSingle()
            
            userStatus = statusData?.status || null
          }
          
          const activityWithLikes = {
            ...activity,
            like_count: likeCount,
            comment_count: activityComments?.length || 0,
            user_liked: userLiked
          }
          
          return {
            type: 'activity' as const,
            id: activity.id,
            data: {
              activity: activityWithLikes,
              friendsActivity,
              showComments,
              activityComments,
              userLiked,
              likeCount,
              userRating,
              userStatus,
              streamingPlatforms
            }
          }
        })
      )
      
      // Check if we should insert another Find New Friends card
      // Randomly insert after every ~10 cards (roughly 2 batches)
      followSuggestionsCount.current += 1
      let itemsToAdd = [...newItems]
      
      if (followSuggestionsCount.current % 2 === 0) {
        // Every 2nd batch, try to add a Find New Friends card
        const freshSuggestions = await fetchUserSuggestions()
        if (freshSuggestions.length > 0) {
          const followSuggestionsCard: FeedItem = {
            type: 'follow_suggestions',
            id: `follow-suggestions-${followSuggestionsCount.current}`,
            data: {
              suggestions: freshSuggestions
            }
          }
          // Insert at position 2 of the new batch
          if (itemsToAdd.length >= 2) {
            itemsToAdd.splice(2, 0, followSuggestionsCard)
          } else {
            itemsToAdd.push(followSuggestionsCard)
          }
          console.log('Inserted new Find Friends card with', freshSuggestions.length, 'suggestions')
        }
      }
      
      // Append new items to existing feed
      setFeedItems(prev => [...prev, ...itemsToAdd])
      console.log(`Loaded ${itemsToAdd.length} more items, total: ${feedItems.length + itemsToAdd.length}`)
      
    } catch (err) {
      console.error('Error loading more items:', err)
    } finally {
      setIsLoadingMore(false)
      isLoadingRef.current = false
    }
  }

  // Fetch user suggestions for Find New Friends card (Card 7)
  const fetchUserSuggestions = async (): Promise<any[]> => {
    if (!user) return []

    try {
      // Get users the current user already follows
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
      
      const followingIds = following?.map(f => f.following_id) || []
      
      // Get all users except current user and those already followed
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          bio
        `)
        .neq('id', user.id)
        .limit(10)
      
      if (!profiles || profiles.length === 0) return []
      
      // Filter out already followed users AND dismissed users
      const suggestions = profiles.filter(p => 
        !followingIds.includes(p.id) && !dismissedUsers.has(p.id)
      )
      
      // For each suggestion, get their watch stats and mutual friends
      const enrichedSuggestions = await Promise.all(
        suggestions.slice(0, 4).map(async (profile) => {
          // Get watch status counts
          const { data: watchStatuses } = await supabase
            .from('watch_status')
            .select('status')
            .eq('user_id', profile.id)
          
          const stats = {
            wantToWatch: watchStatuses?.filter(ws => ws.status === 'want').length || 0,
            watching: watchStatuses?.filter(ws => ws.status === 'watching').length || 0,
            watched: watchStatuses?.filter(ws => ws.status === 'watched').length || 0
          }
          
          // Get mutual friends (users that both current user and this profile follow)
          const { data: theirFollowing } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', profile.id)
            .eq('status', 'accepted')
          
          const theirFollowingIds = theirFollowing?.map(f => f.following_id) || []
          const mutualFriendIds = followingIds.filter(id => theirFollowingIds.includes(id))
          
          // Get avatars for mutual friends
          let mutualFriendAvatars: string[] = []
          if (mutualFriendIds.length > 0) {
            const { data: mutualProfiles } = await supabase
              .from('profiles')
              .select('avatar_url')
              .in('id', mutualFriendIds.slice(0, 3))
            
            mutualFriendAvatars = mutualProfiles?.map(p => p.avatar_url || '').filter(Boolean) || []
          }
          
          // Calculate a simple match percentage based on shared ratings
          // (In production, this would use the taste match algorithm)
          const matchPercentage = 75 + Math.floor(Math.random() * 20) // Placeholder: 75-95%
          
          return {
            id: profile.id,
            name: profile.display_name || profile.username || 'Unknown',
            username: profile.username || '',
            avatar: profile.avatar_url || '',
            matchPercentage,
            bio: profile.bio || '',
            stats,
            friendsInCommon: {
              count: mutualFriendIds.length,
              avatars: mutualFriendAvatars
            }
          }
        })
      )
      
      return enrichedSuggestions
    } catch (err) {
      console.error('Error fetching user suggestions:', err)
      return []
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

  const fetchActivityComments = async (activityId: string): Promise<APIComment[]> => {
    if (!activityId) return []

    try {
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          id,
          user_id,
          comment_text,
          created_at,
          profiles!comments_user_id_fkey (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })
        .limit(15)

      if (!comments || comments.length === 0) return []

      // Fetch like counts and user_liked status for each comment
      const commentIds = comments.map(c => c.id)
      let commentLikes: Record<string, { count: number; userLiked: boolean }> = {}
      
      if (user && commentIds.length > 0) {
        try {
          // Get all likes for these comments
          const { data: likes } = await supabase
            .from('activity_comment_likes')
            .select('comment_id, user_id')
            .in('comment_id', commentIds)

          // Count likes per comment and check if current user liked
          commentLikes = commentIds.reduce((acc, commentId) => {
            const commentLikesList = likes?.filter(l => l.comment_id === commentId) || []
            acc[commentId] = {
              count: commentLikesList.length,
              userLiked: commentLikesList.some(l => l.user_id === user.id)
            }
            return acc
          }, {} as Record<string, { count: number; userLiked: boolean }>)
        } catch (likeErr) {
          // If activity_comment_likes table doesn't exist, just continue without like data
          console.warn('Could not fetch activity comment likes:', likeErr)
        }
      } else {
        // No user or no comments, initialize with zeros
        commentLikes = commentIds.reduce((acc, commentId) => {
          acc[commentId] = { count: 0, userLiked: false }
          return acc
        }, {} as Record<string, { count: number; userLiked: boolean }>)
      }

      return comments.map((c: any) => {
        const likeData = commentLikes[c.id] || { count: 0, userLiked: false }
        return {
          id: c.id,
          user_id: c.user_id,
          comment_text: c.comment_text,
          created_at: c.created_at,
          like_count: likeData.count,
          user_liked: likeData.userLiked,
          user: {
            id: c.profiles?.id || c.user_id,
            display_name: c.profiles?.display_name || c.profiles?.username || 'Unknown',
            username: c.profiles?.username,
            avatar_url: c.profiles?.avatar_url || null
          }
        }
      })
    } catch (err) {
      console.error('Error fetching activity comments:', err)
      return []
    }
  }

  // Normalize and filter streaming platform names
  const normalizePlatformName = (name: string): string | null => {
    if (!name) return null
    
    // Filter out channel variations (Apple TV Channel, Amazon Channel, Roku Channel, etc.)
    if (name.toLowerCase().includes('channel')) {
      return null
    }
    
    // Normalize common platform name variations
    const normalized = name
      .replace(/\s*Plus\s*$/i, '+')  // "Paramount Plus" -> "Paramount+"
      .replace(/\s*plus\s*$/i, '+')  // lowercase variant
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .trim()
    
    return normalized
  }

  // Deduplicate and normalize platform names
  const filterPrimaryPlatforms = (platforms: string[]): string[] => {
    const seen = new Set<string>()
    const normalized: string[] = []
    
    for (const platform of platforms) {
      const normalizedName = normalizePlatformName(platform)
      if (!normalizedName) continue // Skip channel variations
      
      // Check if we've already seen this platform (case-insensitive)
      const lower = normalizedName.toLowerCase()
      if (seen.has(lower)) continue
      
      seen.add(lower)
      normalized.push(normalizedName)
    }
    
    return normalized
  }

  const fetchWatchProviders = async (mediaId: string, mediaType: 'tv' | 'movie'): Promise<string[]> => {
    if (!mediaId) {
      console.log('fetchWatchProviders: mediaId is empty')
      return []
    }

    try {
      // Extract TMDB ID from media_id format
      // TV: tv-12345-s1 -> 12345, Movie: movie-12345 -> 12345
      let tmdbId: number | null = null
      if (mediaType === 'tv') {
        const match = mediaId.match(/^tv-(\d+)/)
        if (match) tmdbId = parseInt(match[1])
      } else {
        const match = mediaId.match(/^movie-(\d+)/)
        if (match) tmdbId = parseInt(match[1])
      }

      if (!tmdbId) {
        console.log('fetchWatchProviders: Could not extract TMDB ID from', mediaId)
        return []
      }

      console.log(`fetchWatchProviders: Fetching providers for ${mediaType} ${tmdbId}`)

      // Fetch watch providers from TMDB via our proxy API
      const response = await fetch(`/api/tmdb/${mediaType}/${tmdbId}/watch/providers`)
      
      if (!response.ok) {
        console.error('Error fetching watch providers:', response.status)
        return []
      }

      const data = await response.json()
      const providers = data.results?.US || {}
      
      // Get streaming services (flatrate), not rent/buy
      const streamingServices = providers.flatrate || []
      
      if (streamingServices.length === 0) {
        console.log(`fetchWatchProviders: No streaming providers found for ${mediaId}`)
        return []
      }

      const platformNames = streamingServices.map((p: any) => p.provider_name || p.name).filter(Boolean)
      const filteredPlatforms = filterPrimaryPlatforms(platformNames)
      
      // Check admin allowlist
      let allowedPlatforms: string[] = []
      try {
        const { data: allowlistSetting } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'streaming_platforms_allowlist')
          .single()

        if (allowlistSetting?.setting_value) {
          try {
            const allowlist: string[] = JSON.parse(allowlistSetting.setting_value)
            console.log(`fetchWatchProviders: Allowlist from DB:`, allowlist)
            console.log(`fetchWatchProviders: Filtered platforms from TMDB:`, filteredPlatforms)
            
            // Normalize allowlist names to match normalized platform names
            const normalizedAllowlist = allowlist.map(p => normalizePlatformName(p)).filter(Boolean) as string[]
            const allowlistLower = new Set(normalizedAllowlist.map(p => p.toLowerCase()))
            
            // Only show platforms that are in the allowlist (case-insensitive matching)
            allowedPlatforms = filteredPlatforms.filter(p => {
              const isAllowed = allowlistLower.has(p.toLowerCase())
              if (!isAllowed) {
                console.log(`fetchWatchProviders: Filtered out "${p}" (not in allowlist)`)
              }
              return isAllowed
            })
            
            console.log(`fetchWatchProviders: Filtered to ${allowedPlatforms.length} allowed platforms (from ${filteredPlatforms.length} total)`)
            console.log(`fetchWatchProviders: Allowed platforms:`, allowedPlatforms)
          } catch (e) {
            console.error('Error parsing allowlist:', e)
            // If parsing fails, show all platforms as fallback
            allowedPlatforms = filteredPlatforms
          }
        } else {
          // If no allowlist setting exists, show all platforms (backward compatible)
          console.log('No allowlist found, showing all platforms')
          allowedPlatforms = filteredPlatforms
        }
      } catch (err) {
        // If allowlist doesn't exist or error, show all platforms (backward compatible)
        console.log('Error checking allowlist, showing all platforms:', err)
        allowedPlatforms = filteredPlatforms
      }
      
      console.log(`fetchWatchProviders: Found ${allowedPlatforms.length} platforms for ${mediaId}:`, allowedPlatforms)
      
      return allowedPlatforms
    } catch (err) {
      console.error('Exception fetching watch providers:', err)
      return []
    }
  }

  const fetchShowComments = async (mediaId: string): Promise<APIShowComment[]> => {
    if (!mediaId) {
      console.log('fetchShowComments: mediaId is empty')
      return []
    }

    console.log('fetchShowComments: Fetching comments for mediaId:', mediaId)

    try {
      // First, fetch the comments
      const { data: comments, error: commentsError } = await supabase
        .from('show_comments')
        .select('id, user_id, comment_text, created_at')
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (commentsError) {
        console.error('Error fetching show comments:', commentsError)
        return []
      }

      if (!comments || comments.length === 0) {
        console.log(`fetchShowComments: No comments found for ${mediaId}`)
        return []
      }

      // Get unique user IDs
      const userIds = [...new Set(comments.map(c => c.user_id))]
      
      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error fetching profiles for show comments:', profilesError)
        // Continue anyway, just use defaults
      }

      // Create a map of user_id -> profile
      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      )

      console.log(`fetchShowComments: Found ${comments.length} comments for ${mediaId}`)

      // Fetch like counts and user_liked status for each comment
      const commentIds = comments.map(c => c.id)
      let commentLikes: Record<string, { count: number; userLiked: boolean }> = {}
      
      if (user && commentIds.length > 0) {
        try {
          // Get all likes for these comments
          const { data: likes } = await supabase
            .from('comment_likes')
            .select('comment_id, user_id')
            .in('comment_id', commentIds)

          // Count likes per comment and check if current user liked
          commentLikes = commentIds.reduce((acc, commentId) => {
            const commentLikesList = likes?.filter(l => l.comment_id === commentId) || []
            acc[commentId] = {
              count: commentLikesList.length,
              userLiked: commentLikesList.some(l => l.user_id === user.id)
            }
            return acc
          }, {} as Record<string, { count: number; userLiked: boolean }>)
        } catch (likeErr) {
          // If comment_likes table doesn't exist, just continue without like data
          console.warn('Could not fetch show comment likes:', likeErr)
        }
      } else {
        // No user or no comments, initialize with zeros
        commentLikes = commentIds.reduce((acc, commentId) => {
          acc[commentId] = { count: 0, userLiked: false }
          return acc
        }, {} as Record<string, { count: number; userLiked: boolean }>)
      }

      return comments.map((c: any) => {
        const profile = profileMap.get(c.user_id)
        const likeData = commentLikes[c.id] || { count: 0, userLiked: false }
        
        return {
          id: c.id,
          user_id: c.user_id,
          comment_text: c.comment_text,
          created_at: c.created_at,
          like_count: likeData.count,
          user_liked: likeData.userLiked,
          user: {
            id: profile?.id || c.user_id,
            display_name: profile?.display_name || 'Unknown',
            username: profile?.username,
            avatar_url: profile?.avatar_url || null
          }
        }
      })
    } catch (err) {
      console.error('Exception fetching show comments:', err)
      return []
    }
  }

  const handleTrack = (action: string, metadata?: any) => {
    console.log('Track:', action, metadata)
  }

  // Handle following a user from the Find New Friends card
  const handleFollow = async (userId: string) => {
    if (!user) return
    console.log('Follow user:', userId)
    
    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from('follows')
        .select('id, status')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle()
      
      if (existingFollow) {
        console.log('Already following or pending:', existingFollow.status)
        return
      }
      
      // Create follow request
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
          status: 'accepted' // Auto-accept for now (could be 'pending' if private accounts)
        })
      
      if (error) {
        console.error('Error following user:', error)
        return
      }
      
      console.log('Successfully followed user:', userId)
      
      // Optimistically update the UI - remove this user from suggestions
      setFeedItems(prev => prev.map(item => {
        if (item.type === 'follow_suggestions') {
          return {
            ...item,
            data: {
              ...item.data,
              suggestions: item.data.suggestions.filter((s: any) => s.id !== userId)
            }
          }
        }
        return item
      }))
      
    } catch (err) {
      console.error('Error following user:', err)
    }
  }

  // Handle dismissing a user suggestion (don't show them again)
  const handleDismiss = (userId: string) => {
    console.log('Dismiss user suggestion:', userId)
    
    // Add to dismissed set
    setDismissedUsers(prev => new Set([...prev, userId]))
    
    // Remove from current suggestions in UI
    setFeedItems(prev => prev.map(item => {
      if (item.type === 'follow_suggestions') {
        return {
          ...item,
          data: {
            ...item.data,
            suggestions: item.data.suggestions.filter((s: any) => s.id !== userId)
          }
        }
      }
      return item
    }))
  }

  const handleLike = async (activityId: string) => {
    if (!user) return
    console.log('Like activity:', activityId)
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('activity_likes')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingLike) {
        // Unlike
        await supabase
          .from('activity_likes')
          .delete()
          .eq('id', existingLike.id)
        console.log('Unliked activity')
      } else {
        // Like
        await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: user.id
          })
        console.log('Liked activity')
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleRate = async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
    if (!user) return
    console.log('Rate media:', mediaId, rating)
    
    try {
      if (rating === null) {
        // Remove rating
        await supabase
          .from('ratings')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id)
        console.log('Removed rating')
      } else {
        // Upsert rating
        await supabase
          .from('ratings')
          .upsert({
            media_id: mediaId,
            user_id: user.id,
            rating: rating
          }, { onConflict: 'user_id,media_id' })
        console.log('Set rating to:', rating)
      }
    } catch (err) {
      console.error('Error setting rating:', err)
    }
  }

  const handleSetStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!user) return
    console.log('Set watch status:', mediaId, status)
    
    try {
      if (status === null) {
        // Remove status
        await supabase
          .from('watch_status')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id)
        console.log('Removed watch status')
      } else {
        // Upsert status
        await supabase
          .from('watch_status')
          .upsert({
            media_id: mediaId,
            user_id: user.id,
            status: status
          }, { onConflict: 'user_id,media_id' })
        console.log('Set status to:', status)
      }
    } catch (err) {
      console.error('Error setting watch status:', err)
    }
  }

  const handleLikeShowComment = async (commentId: string) => {
    if (!user) return
    console.log('Like show comment:', commentId)
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingLike) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id)
        console.log('Unliked show comment')
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
        console.log('Liked show comment')
      }
    } catch (err) {
      console.error('Error toggling show comment like:', err)
      throw err // Re-throw so component can handle error
    }
  }

  const handleLikeActivityComment = async (commentId: string) => {
    if (!user) {
      console.error('Cannot like comment: user not logged in')
      return
    }
    
    console.log('Like activity comment:', commentId)
    
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('activity_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing like:', checkError)
        // If table doesn't exist, show helpful error
        if (checkError.message?.includes('relation') && checkError.message?.includes('does not exist')) {
          console.error('❌ activity_comment_likes table does not exist!')
          console.error('Please run the migration: supabase/migrations/create-activity-comment-likes-table.sql')
          alert('Activity comment likes feature requires a database migration. Please run the migration first.')
          throw new Error('Table does not exist')
        }
        throw checkError
      }

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('activity_comment_likes')
          .delete()
          .eq('id', existingLike.id)
        
        if (deleteError) {
          console.error('Error unliking comment:', deleteError)
          throw deleteError
        }
        console.log('✅ Unliked activity comment')
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('activity_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
        
        if (insertError) {
          console.error('Error liking comment:', insertError)
          throw insertError
        }
        console.log('✅ Liked activity comment')
      }
    } catch (err: any) {
      console.error('❌ Error toggling activity comment like:', err)
      // Re-throw so component can handle error and revert optimistic update
      throw err
    }
  }

  const handleSubmitActivityComment = async (activityId: string, text: string) => {
    if (!user) {
      console.error('Cannot submit comment: user not logged in')
      return
    }
    
    if (!activityId) {
      console.error('Cannot submit comment: activityId is missing')
      return
    }
    
    console.log('Submit activity comment:', activityId, text)
    
    try {
      // Try 'comments' table first (existing table), then 'activity_comments'
      const { data, error } = await supabase
        .from('comments')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          comment_text: text
        })
        .select()
      
      if (error) {
        console.error('Error submitting activity comment:', error)
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          alert(`Comment feature not available: Database table 'comments' does not exist. Please create it first.`)
        } else {
          alert(`Comment failed: ${error.message}`)
        }
        // Don't throw - return early to prevent React crash
        return
      }
      
      console.log('Activity comment submitted successfully:', data)
    } catch (err: any) {
      console.error('Exception submitting activity comment:', err)
      // Don't re-throw - let the component handle it gracefully
      if (!err.message?.includes('relation')) {
        alert(`Failed to submit comment: ${err.message || 'Unknown error'}`)
      }
    }
  }

  const handleSubmitShowComment = async (mediaId: string, text: string) => {
    if (!user) {
      console.error('Cannot submit comment: user not logged in')
      return
    }
    
    if (!mediaId) {
      console.error('Cannot submit comment: mediaId is missing')
      return
    }
    
    console.log('Submit show comment:', mediaId, text)
    
    try {
      const { data, error } = await supabase
        .from('show_comments')
        .insert({
          media_id: mediaId,
          user_id: user.id,
          comment_text: text
        })
        .select()
      
      if (error) {
        console.error('Error submitting show comment:', error)
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          alert(`Comment feature not available: Database table 'show_comments' does not exist. Please create it first.`)
        } else {
          alert(`Comment failed: ${error.message}`)
        }
        // Don't throw - return early to prevent React crash
        return
      }
      
      console.log('Show comment submitted successfully:', data)
    } catch (err: any) {
      console.error('Exception submitting show comment:', err)
      // Don't re-throw - let the component handle it gracefully
      if (!err.message?.includes('relation')) {
        alert(`Failed to submit comment: ${err.message || 'Unknown error'}`)
      }
    }
  }

  const handleMediaSelect = (media: any, rating?: string, status?: string) => {
    console.log('Media selected:', media, rating, status)
    setSearchOpen(false)
    // TODO: Navigate to media detail or add to watchlist
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
            maxWidth: '400px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#3b82f6' }}>
              Debug Info:
            </div>
            <div>Activities in DB: {debugInfo.totalActivitiesInDB}</div>
            <div>Your accepted follows: {debugInfo.followsCount}</div>
            <div>Admin "show all users": {debugInfo.adminShowAll ? 'Yes' : 'No'}</div>
            <div>Activities from people you follow: {(debugInfo as any).activitiesFromFollowed || 0}</div>
            <div>Your own activities: {(debugInfo as any).myActivities || 0}</div>
            
            {(debugInfo as any).sampleActivities && (
              <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Sample Activities:</div>
                {(debugInfo as any).sampleActivities.map((a: any, i: number) => (
                  <div key={i} style={{ 
                    fontSize: '11px', 
                    color: a.isMe ? '#f87171' : a.isFollowed ? '#4ade80' : 'rgba(255,255,255,0.5)',
                    marginBottom: '4px'
                  }}>
                    <strong>{a.user}</strong>: {a.type}
                    {a.media && <span style={{ opacity: 0.7 }}> - {a.media}</span>}
                    {a.isMe && <span style={{ color: '#f87171' }}> (YOU)</span>}
                    {a.isFollowed && <span style={{ color: '#4ade80' }}> (FOLLOWED)</span>}
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '10px', color: 'rgba(255,255,255,0.6)' }}>
              {debugInfo.totalActivitiesInDB === 0 && "No activities exist in the database."}
              {(debugInfo as any).myActivities === debugInfo.totalActivitiesInDB && debugInfo.totalActivitiesInDB > 0 &&
                "All activities are yours (excluded from feed)."}
              {(debugInfo as any).activitiesFromFollowed === 0 && (debugInfo as any).myActivities < debugInfo.totalActivitiesInDB && !debugInfo.adminShowAll &&
                "Activities exist from users you don't follow. Enable 'show all users' in admin."}
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
    <div style={{ background: '#1a1a1a', minHeight: '100vh', paddingTop: '90px', paddingBottom: '120px' }}>
      <style>{`
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
          top: 70px;
          left: 10px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 10px;
          font-size: 12px;
          border-radius: 8px;
          z-index: 50;
        }
      `}</style>

      {/* Header - Instagram style: hides on scroll down, shows on scroll up */}
      <AppHeader profile={profile} hideOnScroll />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="debug-info">
        <div>Feed Items: {feedItems.length}</div>
        <div>Mode: Infinite Scroll</div>
        <div style={{ fontSize: '10px', opacity: 0.7 }}>
          {hasMore ? 'More available' : 'End reached'}
        </div>
        <button 
          onClick={testApi}
          style={{ marginTop: '8px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
        >
          Test API
        </button>
        {apiTestResult && (
          <pre style={{ 
            marginTop: '8px', 
            fontSize: '9px', 
            maxHeight: '200px', 
            overflow: 'auto',
            background: 'rgba(0,0,0,0.5)',
            padding: '4px',
            borderRadius: '4px',
            maxWidth: '300px',
            whiteSpace: 'pre-wrap'
          }}>
            {apiTestResult}
          </pre>
        )}
      </div>

      <div>
        {feedItems.map((item) => {
          if (item.type === 'activity') {
            const { activity, friendsActivity, showComments, activityComments } = item.data
            
            // Attach activity comments to the activity object (transformer expects activity.comments)
            const activityWithComments = {
              ...activity,
              comments: activityComments || []
            }
            
            // Transform to card data
            const cardData = activityToUserActivityCardData(
              activityWithComments as APIActivity,
              friendsActivity,
              showComments,
              item.data.userRating as 'meh' | 'like' | 'love' | null,
              item.data.userStatus as 'want' | 'watching' | 'watched' | null,
              item.data.userLiked,
              item.data.likeCount,
              item.data.streamingPlatforms
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
                    onRate={handleRate}
                    onSetStatus={handleSetStatus}
                    onSubmitActivityComment={handleSubmitActivityComment}
                    onSubmitShowComment={handleSubmitShowComment}
                    onLikeShowComment={handleLikeShowComment}
                    onLikeActivityComment={handleLikeActivityComment}
                    currentUser={profile ? { name: profile.display_name || profile.username, avatar: profile.avatar_url || '' } : undefined}
                    initialUserStatus={item.data.userStatus as 'want' | 'watching' | 'watched' | null}
                    onTrack={handleTrack}
                  />
                </div>
              </div>
            )
          }

          if (item.type === 'follow_suggestions') {
            // Don't render if all suggestions have been followed/dismissed
            if (!item.data.suggestions || item.data.suggestions.length === 0) {
              return null
            }
            
            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <FollowSuggestionsCard
                    suggestions={item.data.suggestions}
                    colorTheme="purple"
                    onFollow={handleFollow}
                    onDismiss={handleDismiss}
                    onUserClick={(userId) => {
                      // Navigate to user profile
                      window.location.href = `/${item.data.suggestions.find((s: any) => s.id === userId)?.username || userId}`
                    }}
                    onTrack={handleTrack}
                  />
                </div>
              </div>
            )
          }

          return null
        })}
      </div>

      {/* Infinite Scroll Loader */}
      <div 
        ref={loaderRef}
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60px'
        }}
      >
        {isLoadingMore && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px'
          }}>
            <div className="loading-spinner" style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading more...
          </div>
        )}
        {!hasMore && feedItems.length > 0 && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            You've reached the end
          </div>
        )}
      </div>

      {/* Spacer to ensure content doesn't get hidden behind fixed nav */}
      <div style={{ height: '20px' }} />

      {/* Bottom Navigation */}
      <BottomNav onSearchOpen={() => setSearchOpen(true)} />

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)}
        onSelectMedia={handleMediaSelect}
        user={user}
      />
    </div>
  )
}


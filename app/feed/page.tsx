/**
 * Enhanced Activity Feed
 * 
 * Features:
 * - New React card components with flip animations
 * - Infinite scroll with cursor-based pagination
 * - PostHog analytics integration
 * - Find New Friends suggestions
 * - Activity likes, comments, ratings, watch status
 * 
 * URL: /feed
 */

'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserActivityCard, FeedCard, BADGE_PRESETS, FeedCardData } from '@/components/feed/UserActivityCard'
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
import { 
  getUserExcludedMediaIds, 
  shouldShowCard, 
  recordCardImpression,
  getShowableMediaIds,
  findSimilarUsers
} from '@/utils/feedUtils'
import { getSimilarShows, getUpcomingSeasonInfo, TMDBShow } from '@/utils/tmdb'
import {
  trackFeedViewed,
  trackActivityLiked,
  trackActivityUnliked,
  trackActivityCommented,
  trackUserFollowed,
  trackMediaRated,
  trackWatchStatusChanged,
  trackShowCommentAdded,
  trackEvent
} from '@/utils/analytics'

// Initial batch size and load more batch size
const INITIAL_BATCH_SIZE = 5
const LOAD_MORE_BATCH_SIZE = 5

// Time window for grouping activities (5 minutes in milliseconds)
// This groups rating + status changes that happen close together
// Used as fallback for activities without activity_group_id
const ACTIVITY_GROUP_WINDOW_MS = 5 * 60 * 1000

// =====================================================
// Feed Pattern Configuration
// =====================================================
// Deterministic 13-card pattern that repeats
// Card 1 = Activity, Card 2 = Because You Liked, Card 3 = Friends Loved
// Card 7 = Find Friends, Card 8 = You Might Like
const FEED_PATTERN = [1, 1, 2, 1, 3, 1, 7, 1, 8, 1, 2, 3, 8]

// Bonus cards (4 = Coming Soon, 5 = Now Streaming) insert every N positions
const BONUS_CARD_INTERVAL = 4

// Fetch limits for each card type
const CARD_LIMITS = {
  BECAUSE_YOU_LIKED: 4,    // Card 2: need ~2 per cycle, with buffer
  FRIENDS_LOVED: 4,        // Card 3: need ~2 per cycle, with buffer
  COMING_SOON: 2,          // Card 4: on-demand
  NOW_STREAMING: 2,        // Card 5: on-demand
  YOU_MIGHT_LIKE: 4,       // Card 8: need ~2 per cycle, with buffer
}

// =====================================================
// TMDB Genre ID to Name Mapping
// =====================================================
// Used for displaying genre names on cards (TMDB returns genre_ids in discover/similar)
const GENRE_MAP: Record<number, string> = {
  // TV Genres
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
  // Movie Genres
  28: 'Action',
  12: 'Adventure',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War'
}

// Helper to map genre IDs to names
function mapGenreIds(genreIds: number[] | undefined): string[] {
  if (!genreIds) return []
  return genreIds
    .slice(0, 2) // Max 2 genres for display
    .map(id => GENRE_MAP[id])
    .filter(Boolean) as string[]
}

// =====================================================
// Recency Filter (12 months)
// =====================================================
function getRecencyCutoffDate(): string {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 1)
  return cutoff.toISOString().split('T')[0] // "2024-01-07"
}

// Helper to abbreviate seasons in badge text
function abbreviateSeason(text: string): string {
  return text.replace(/Season (\d+)/g, 'S$1')
}

interface FeedItem {
  type: 'activity' | 'recommendation' | 'follow_suggestions' | 'because_you_liked' | 'friends_loved' | 'coming_soon' | 'now_streaming' | 'you_might_like'
  id: string
  data: any
}

// Card 2: Because You Liked - recommendation based on user's liked shows
interface BecauseYouLikedData {
  media: TMDBShow
  sourceShowTitle: string
  sourceMediaId: string
}

// Card 3: Your Friends Loved - shows 3+ friends rated as love
interface FriendsLovedData {
  media: any
  friends: Array<{ id: string; display_name: string; avatar_url: string | null }>
  friendCount: number
}

// Card 4: Coming Soon - upcoming seasons for user's watchlist shows
interface ComingSoonData {
  media: any
  airDate: string
  seasonNumber: number
}

// Card 5: Now Streaming - shows where reminder set and air date arrived
interface NowStreamingData {
  media: any
  reminderId: string
}

// Card 8: You Might Like - taste match algorithm
interface YouMightLikeData {
  media: any
  matchPercentage: number
  similarUsers: number
}

// Group activities by activity_group_id (database-level) or user_id + media_id (fallback)
// This combines "rated" and "status_changed" activities into a single card
function groupActivities(activities: any[]): any[] {
  if (!activities || activities.length === 0) return []
  
  console.log('🔄 Grouping activities:', activities.map(a => ({
    id: a.id,
    group_id: a.activity_group_id || null,
    user: (a.profiles as any)?.display_name,
    media: (a.media as any)?.title,
    type: a.activity_type,
    created_at: a.created_at
  })))
  
  const grouped: Map<string, any[]> = new Map()
  
  for (const activity of activities) {
    // Use activity_group_id if available (database-level grouping)
    // Otherwise fall back to user_id + media_id (for historical activities)
    const groupKey = activity.activity_group_id 
      ? `group-${activity.activity_group_id}`
      : `${activity.user_id}-${activity.media_id}`
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, [])
    }
    grouped.get(groupKey)!.push(activity)
  }
  
  console.log('📦 Grouped:', Array.from(grouped.entries()).map(([key, acts]) => ({
    key,
    count: acts.length,
    types: acts.map(a => a.activity_type)
  })))
  
  // For each group, combine activities within the time window
  const result: any[] = []
  
  for (const [, groupActivities] of grouped) {
    // Sort by created_at desc
    groupActivities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    // Go through activities and combine those within the time window
    let i = 0
    while (i < groupActivities.length) {
      const primary = groupActivities[i]
      const combinedActivities = [primary]
      
      // Look for related activities within the time window
      let j = i + 1
      while (j < groupActivities.length) {
        const other = groupActivities[j]
        const timeDiff = Math.abs(
          new Date(primary.created_at).getTime() - 
          new Date(other.created_at).getTime()
        )
        
        if (timeDiff <= ACTIVITY_GROUP_WINDOW_MS) {
          combinedActivities.push(other)
          j++
        } else {
          break
        }
      }
      
      if (combinedActivities.length > 1) {
        // Merge activity_data from all combined activities
        // This ensures rating, status, etc. are all present
        const mergedData: any = {}
        for (const act of combinedActivities) {
          Object.assign(mergedData, act.activity_data)
        }
        mergedData.combined_activities = combinedActivities.map(a => ({
          type: a.activity_type,
          data: a.activity_data
        }))
        
        // Combine multiple activities into one
        const combined = {
          ...primary,
          // Use the most recent activity's ID as the main ID
          id: primary.id,
          // Combine activity types
          activity_type: combinedActivities.map(a => a.activity_type).join('+'),
          // Use merged data so rating AND status are both present
          activity_data: mergedData,
          // Use the most recent created_at
          created_at: primary.created_at
        }
        console.log('✅ Combined activities:', {
          media: (primary.media as any)?.title,
          types: combinedActivities.map(a => a.activity_type),
          mergedData
        })
        result.push(combined)
        i = j // Skip the combined activities
      } else {
        result.push(primary)
        i++
      }
    }
  }
  
  // Sort final result by created_at desc
  result.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  return result
}


interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

// =====================================================
// Card Fetching Functions
// =====================================================

// Helper to extract numeric TMDB ID from various media_id formats
// Handles: "tv-12345", "tv-12345-s1", "movie-67890", etc.
function extractTmdbId(mediaId: string, tmdbData?: { id?: number }): number | null {
  // First check tmdb_data.id if it's a valid number
  if (tmdbData?.id && typeof tmdbData.id === 'number') {
    return tmdbData.id
  }
  
  // Parse from media_id string
  // Format: "tv-12345" or "tv-12345-s1" or "movie-67890"
  const parts = mediaId.split('-')
  if (parts.length >= 2) {
    const idPart = parts[1] // Get the numeric part
    const parsed = parseInt(idPart, 10)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  
  return null
}

/**
 * Card 2: Because You Liked
 * Uses TRENDING shows filtered by user's preferred genres
 * 
 * Why? Trending shows are what's hot RIGHT NOW - culturally relevant content
 * that people are talking about. Filtered by genres you like for personalization.
 * 
 * Algorithm:
 * 1. Get user's liked shows to extract their preferred genres
 * 2. Fetch TMDB /trending/tv/week (what's hot this week)
 * 3. Filter to shows matching user's preferred genres
 * 4. Exclude shows already in user's watchlists
 */
async function fetchBecauseYouLiked(
  supabase: any,
  userId: string,
  excludedMediaIds: Set<string>,
  limit: number = CARD_LIMITS.BECAUSE_YOU_LIKED
): Promise<FeedItem[]> {
  try {
    console.time('fetchBecauseYouLiked')
    
    // Get user's liked/loved shows to extract preferred genres
    const { data: userRatings } = await supabase
      .from('ratings')
      .select('media_id, rating, media:media_id(id, title, media_type, tmdb_data)')
      .eq('user_id', userId)
      .in('rating', ['like', 'love'])
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!userRatings || userRatings.length === 0) {
      console.timeEnd('fetchBecauseYouLiked')
      return []
    }
    
    // Extract user's preferred genres from their liked shows
    const userGenres = new Set<number>()
    const sourceShowsByGenre = new Map<number, { title: string; mediaId: string }>()
    
    for (const rating of userRatings) {
      if (!rating.media?.tmdb_data?.genres) continue
      const genres = rating.media.tmdb_data.genres
      for (const genre of genres) {
        userGenres.add(genre.id)
        if (!sourceShowsByGenre.has(genre.id)) {
          sourceShowsByGenre.set(genre.id, {
            title: rating.media.title,
            mediaId: rating.media_id
          })
        }
      }
    }
    
    if (userGenres.size === 0) {
      console.timeEnd('fetchBecauseYouLiked')
      return []
    }
    
    // Fetch trending TV shows and movies in parallel
    const [tvTrending, movieTrending] = await Promise.all([
      fetch('/api/tmdb/trending/tv/week').then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] })),
      fetch('/api/tmdb/trending/movie/week').then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }))
    ])
    
    // Combine trending shows
    const allTrending = [
      ...(tvTrending.results || []).map((s: any) => ({ ...s, media_type: 'tv' })),
      ...(movieTrending.results || []).map((s: any) => ({ ...s, media_type: 'movie' }))
    ]
    
    // Get cutoff date for 12-month recency filter
    const cutoffDate = getRecencyCutoffDate()
    
    // Filter to:
    // 1. Shows released in last 12 months (fresh content)
    // 2. Shows matching user's preferred genres (personalized)
    const personalizedTrending = allTrending.filter((show: any) => {
      // Check recency - must be from last 12 months
      const releaseDate = show.first_air_date || show.release_date || ''
      if (releaseDate < cutoffDate) return false
      
      // Check genre match
      const showGenres = show.genre_ids || []
      return showGenres.some((g: number) => userGenres.has(g))
    })
    
    // Build results
    const results: FeedItem[] = []
    const usedGenres = new Set<number>() // Track genres used to get variety
    
    for (const show of personalizedTrending) {
      if (results.length >= limit) break
      
      const mediaId = `${show.media_type}-${show.id}`
      
      // Skip excluded media
      if (excludedMediaIds.has(mediaId)) continue
      
      // Find which genre matched and get the source show
      const matchedGenre = (show.genre_ids || []).find((g: number) => userGenres.has(g) && !usedGenres.has(g))
      if (!matchedGenre && results.length > 0) {
        // Allow repeat genres after we've shown at least one unique
        const anyMatchedGenre = (show.genre_ids || []).find((g: number) => userGenres.has(g))
        if (!anyMatchedGenre) continue
      }
      
      const sourceShow = sourceShowsByGenre.get(matchedGenre || (show.genre_ids || [])[0])
      if (!sourceShow) continue
      
      if (matchedGenre) usedGenres.add(matchedGenre)
      
      results.push({
        type: 'because_you_liked',
        id: `byl-${mediaId}-${sourceShow.mediaId}`,
        data: {
          media: show,
          sourceShowTitle: abbreviateSeason(sourceShow.title),
          sourceMediaId: sourceShow.mediaId
        } as BecauseYouLikedData
      })
    }
    
    console.timeEnd('fetchBecauseYouLiked')
    console.log(`✅ fetchBecauseYouLiked: Found ${results.length} trending shows matching your genres`)
    return results
  } catch (error) {
    console.error('Error fetching Because You Liked:', error)
    return []
  }
}

/**
 * Card 3: Your Friends Loved
 * Shows that 1+ friends have rated as "love" (lowered from 3 for more content)
 * Prioritizes shows released in the last 12 months, then by friend count
 */
async function fetchFriendsLoved(
  supabase: any,
  userId: string,
  excludedMediaIds: Set<string>,
  limit: number = CARD_LIMITS.FRIENDS_LOVED
): Promise<FeedItem[]> {
  try {
    const cutoffDate = getRecencyCutoffDate()
    
    // Get user's friends
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    
    if (!follows || follows.length === 0) return []
    
    const friendIds = follows.map((f: any) => f.following_id)
    
    // Get all "love" ratings from friends
    const { data: friendRatings } = await supabase
      .from('ratings')
      .select(`
        media_id,
        user_id,
        profiles:user_id(id, display_name, avatar_url),
        media:media_id(id, title, poster_path, overview, media_type, tmdb_data, release_date)
      `)
      .in('user_id', friendIds)
      .eq('rating', 'love')
    
    if (!friendRatings || friendRatings.length === 0) return []
    
    // Group by media_id and count friends
    const mediaMap = new Map<string, {
      media: any
      friends: Array<{ id: string; display_name: string; avatar_url: string | null }>
      releaseDate: string
    }>()
    
    for (const rating of friendRatings) {
      if (!rating.media || !rating.profiles) continue
      
      const mediaId = rating.media_id
      if (!mediaMap.has(mediaId)) {
        // Get release date from tmdb_data or release_date field
        const releaseDate = rating.media.release_date || 
          rating.media.tmdb_data?.first_air_date || 
          rating.media.tmdb_data?.release_date || ''
        
        mediaMap.set(mediaId, { media: rating.media, friends: [], releaseDate })
      }
      
      const entry = mediaMap.get(mediaId)!
      entry.friends.push({
        id: rating.profiles.id,
        display_name: rating.profiles.display_name,
        avatar_url: rating.profiles.avatar_url
      })
    }
    
    // Filter and sort:
    // 1. Must have 1+ friends who loved it
    // 2. Exclude user's media
    // 3. Prioritize shows from last 12 months
    // 4. Sort by recency, then friend count
    const sortedMedia = Array.from(mediaMap.entries())
      .filter(([mediaId, data]) => data.friends.length >= 1 && !excludedMediaIds.has(mediaId))
      .map(([mediaId, data]) => ({
        mediaId,
        data,
        isRecent: data.releaseDate >= cutoffDate
      }))
      .sort((a, b) => {
        // Prioritize recent shows
        if (a.isRecent && !b.isRecent) return -1
        if (!a.isRecent && b.isRecent) return 1
        
        // Within same recency tier, sort by release date (newest first)
        if (a.isRecent && b.isRecent) {
          const dateCmp = b.data.releaseDate.localeCompare(a.data.releaseDate)
          if (dateCmp !== 0) return dateCmp
        }
        
        // Then by friend count
        return b.data.friends.length - a.data.friends.length
      })
    
    const results: FeedItem[] = []
    
    for (const { mediaId, data } of sortedMedia) {
      if (results.length >= limit) break
      
      const canShow = await shouldShowCard(userId, 'friends_loved', mediaId)
      if (!canShow) continue
      
      results.push({
        type: 'friends_loved',
        id: `fl-${mediaId}`,
        data: {
          media: data.media,
          friends: data.friends.slice(0, 5), // Show max 5 friend avatars
          friendCount: data.friends.length
        } as FriendsLovedData
      })
    }
    
    console.log(`✅ fetchFriendsLoved: Found ${results.length} shows (prioritizing last 12 months)`)
    return results
  } catch (error) {
    console.error('Error fetching Friends Loved:', error)
    return []
  }
}

/**
 * Card 4: Coming Soon
 * TV shows in user's watchlist with upcoming seasons
 * OPTIMIZED: Limits checks and uses parallel fetching
 */
async function fetchComingSoon(
  supabase: any,
  userId: string,
  limit: number = CARD_LIMITS.COMING_SOON
): Promise<FeedItem[]> {
  try {
    console.time('fetchComingSoon')
    
    // Get user's TV shows in any watchlist - limit for performance
    const { data: watchStatus } = await supabase
      .from('watch_status')
      .select('media_id, media:media_id(id, title, poster_path, overview, media_type, tmdb_data)')
      .eq('user_id', userId)
      .like('media_id', 'tv-%')
      .limit(10) // Limit to 10 shows to check
    
    if (!watchStatus || watchStatus.length === 0) {
      console.timeEnd('fetchComingSoon')
      return []
    }
    
    // Prepare shows with valid TMDB IDs
    const showsToCheck = watchStatus
      .filter((item: any) => item.media)
      .map((item: any) => ({
        item,
        media: item.media,
        tmdbId: extractTmdbId(item.media.id, item.media.tmdb_data)
      }))
      .filter((s: any) => s.tmdbId !== null)
      .slice(0, 5) // Only check first 5 for performance
    
    if (showsToCheck.length === 0) {
      console.timeEnd('fetchComingSoon')
      return []
    }
    
    // Fetch upcoming season info in PARALLEL
    const upcomingResults = await Promise.all(
      showsToCheck.map(async (show: any) => {
        return getUpcomingSeasonInfo(show.tmdbId!)
      })
    )
    
    // Build results
    const results: FeedItem[] = []
    
    for (let i = 0; i < showsToCheck.length && results.length < limit; i++) {
      const { item, media } = showsToCheck[i]
      const upcoming = upcomingResults[i]
      
      if (upcoming.hasUpcoming && upcoming.airDate) {
        results.push({
          type: 'coming_soon',
          id: `cs-${item.media_id}-s${upcoming.seasonNumber}`,
          data: {
            media,
            airDate: upcoming.airDate,
            seasonNumber: upcoming.seasonNumber
          } as ComingSoonData
        })
      }
    }
    
    console.timeEnd('fetchComingSoon')
    return results
  } catch (error) {
    console.error('Error fetching Coming Soon:', error)
    return []
  }
}

/**
 * Card 5: Now Streaming
 * Shows where user set a reminder and air date has arrived
 */
async function fetchNowStreaming(
  supabase: any,
  userId: string,
  limit: number = CARD_LIMITS.NOW_STREAMING
): Promise<FeedItem[]> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get reminders that are due (air_date <= today) and not yet notified
    const { data: reminders } = await supabase
      .from('show_reminders')
      .select('id, media_id, season_number, air_date')
      .eq('user_id', userId)
      .lte('air_date', today)
      .is('notified_at', null)
      .is('dismissed_at', null)
      .limit(limit)
    
    if (!reminders || reminders.length === 0) return []
    
    const results: FeedItem[] = []
    
    for (const reminder of reminders) {
      // Fetch media details
      const { data: media } = await supabase
        .from('media')
        .select('id, title, poster_path, overview, media_type, tmdb_data')
        .eq('id', reminder.media_id)
        .single()
      
      if (!media) continue
      
      results.push({
        type: 'now_streaming',
        id: `ns-${reminder.id}`,
        data: {
          media,
          reminderId: reminder.id
        } as NowStreamingData
      })
      
      // Mark as notified (will also trigger bell notification)
      await supabase
        .from('show_reminders')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', reminder.id)
    }
    
    return results
  } catch (error) {
    console.error('Error fetching Now Streaming:', error)
    return []
  }
}

/**
 * Card 8: You Might Like
 * Recommendations based on taste match algorithm
 * OPTIMIZED: Simplified taste matching, skip expensive calculations
 */
async function fetchYouMightLike(
  supabase: any,
  userId: string,
  excludedMediaIds: Set<string>,
  limit: number = CARD_LIMITS.YOU_MIGHT_LIKE
): Promise<FeedItem[]> {
  try {
    console.time('fetchYouMightLike')
    
    // Card 8: General Trending - Discovery mode
    // Shows what's trending across ALL genres to help users discover new content
    // This exposes users to popular shows they might not normally search for
    
    // Fetch trending TV shows and movies in parallel
    const [tvTrending, movieTrending] = await Promise.all([
      fetch('/api/tmdb/trending/tv/week').then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] })),
      fetch('/api/tmdb/trending/movie/week').then(r => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }))
    ])
    
    // Combine all trending (no genre filter - this is discovery mode)
    const allTrendingRaw = [
      ...(tvTrending.results || []).map((s: any) => ({ ...s, media_type: 'tv' })),
      ...(movieTrending.results || []).map((s: any) => ({ ...s, media_type: 'movie' }))
    ]
    
    // Filter to shows from last 12 months only (fresh content)
    const cutoffDate = getRecencyCutoffDate()
    const allTrending = allTrendingRaw.filter((show: any) => {
      const releaseDate = show.first_air_date || show.release_date || ''
      return releaseDate >= cutoffDate
    })
    
    // Sort by popularity (TMDB trending is already sorted, but let's ensure)
    allTrending.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    
    // Get user's genres to calculate a "match percentage" for display
    const { data: userRatings } = await supabase
      .from('ratings')
      .select('media:media_id(tmdb_data)')
      .eq('user_id', userId)
      .in('rating', ['like', 'love'])
      .limit(20)
    
    const userGenres = new Set<number>()
    for (const rating of (userRatings || [])) {
      const genres = rating.media?.tmdb_data?.genres || []
      for (const genre of genres) {
        userGenres.add(genre.id)
      }
    }
    
    // Build results
    const results: FeedItem[] = []
    
    for (const show of allTrending) {
      if (results.length >= limit) break
      
      const mediaId = `${show.media_type}-${show.id}`
      
      // Skip excluded media
      if (excludedMediaIds.has(mediaId)) continue
      
      // Calculate match percentage based on genre overlap
      const showGenres = show.genre_ids || []
      const genreOverlap = showGenres.filter((g: number) => userGenres.has(g)).length
      const matchPercentage = userGenres.size > 0 
        ? Math.min(95, 60 + Math.round((genreOverlap / Math.min(showGenres.length, 3)) * 35))
        : 75 // Default for new users
      
      results.push({
        type: 'you_might_like',
        id: `yml-${mediaId}`,
        data: {
          media: show,
          matchPercentage,
          similarUsers: Math.floor(show.popularity / 10) || 1 // Estimate based on popularity
        } as YouMightLikeData
      })
    }
    
    console.timeEnd('fetchYouMightLike')
    console.log(`✅ fetchYouMightLike: Found ${results.length} trending shows for discovery`)
    return results
  } catch (error) {
    console.error('Error fetching You Might Like:', error)
    return []
  }
}

export default function PreviewFeedLivePage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  
  // Infinite scroll state
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false) // Prevent duplicate calls
  
  // Track dismissed user suggestions (persist across card re-insertions)
  const [dismissedUsers, setDismissedUsers] = useState<Set<string>>(new Set())
  const followSuggestionsCount = useRef(0) // Track how many times we've shown the card
  
  // Track media IDs shown in CURRENT batch (reset each load to allow recommendations to repeat)
  // Activities are always unique (cursor-based), but recommendations can repeat after a few loads
  const shownMediaIds = useRef<Set<string>>(new Set())
  
  // Track media IDs shown in LAST batch only (to prevent back-to-back duplicates)
  // Note: lastBatchMediaIds was removed - we now use shownMediaIds for all deduplication
  
  // Track pattern position for infinite scroll (persist across loads)
  const patternPosition = useRef(0)
  
  const supabase = createClient()
  
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
  // Trigger loading when user is ~2 cards from the end for seamless experience
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
        rootMargin: '1200px', // Load more when ~2 cards (1200px) from bottom
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
      
      // Check how many are NOT from current user
      const otherUsersActivities = directActivities?.filter(a => a.user_id !== user?.id) || []
      
      if (otherUsersActivities.length > 0) {
        
        // Get full activity data for rendering
        // Note: activity_group_id is optional - may not exist if migration hasn't been run
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
          .limit(INITIAL_BATCH_SIZE) // Fetch 5 activities
        
        if (fullActivities && fullActivities.length > 0) {
          // Group related activities (e.g., rating + status change on same show)
          const groupedActivities = groupActivities(fullActivities)
          console.log(`Grouped ${fullActivities.length} activities into ${groupedActivities.length} cards`)
          
          // Set cursor to last item's created_at for pagination
          const lastActivity = fullActivities[fullActivities.length - 1]
          setCursor(lastActivity.created_at)
          setHasMore(fullActivities.length >= INITIAL_BATCH_SIZE) // More content likely available
          // Fetch comments for each activity
          const transformedItems: FeedItem[] = await Promise.all(
            groupedActivities.map(async (activity) => {
              const activityComments = await fetchActivityComments(activity.id)
              const showComments = await fetchShowComments(activity.media_id)
              const friendsActivity = await fetchFriendsActivity(activity.media_id)
              
              // Fetch watch providers (streaming platforms)
              const mediaType = (activity.media as any)?.media_type || (activity.media_id?.startsWith('movie-') ? 'movie' : 'tv')
              const releaseDate = (activity.media as any)?.release_date || (activity.media as any)?.tmdb_data?.release_date
              const streamingPlatforms = await fetchWatchProviders(activity.media_id, mediaType, releaseDate)
              
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
          
          // Fetch all recommendation cards and user suggestions in parallel
          const excludedMediaIds = user ? await getUserExcludedMediaIds(user.id) : new Set<string>()
          
          const [
            userSuggestions,
            becauseYouLikedCards,
            friendsLovedCards,
            comingSoonCards,
            nowStreamingCards,
            youMightLikeCards
          ] = await Promise.all([
            fetchUserSuggestions(),
            user ? fetchBecauseYouLiked(supabase, user.id, excludedMediaIds) : [],
            user ? fetchFriendsLoved(supabase, user.id, excludedMediaIds) : [],
            user ? fetchComingSoon(supabase, user.id) : [],
            user ? fetchNowStreaming(supabase, user.id) : [],
            user ? fetchYouMightLike(supabase, user.id, excludedMediaIds) : []
          ])
          
          console.log('📦 Recommendation cards fetched:', {
            becauseYouLiked: becauseYouLikedCards.length,
            friendsLoved: friendsLovedCards.length,
            comingSoon: comingSoonCards.length,
            nowStreaming: nowStreamingCards.length,
            youMightLike: youMightLikeCards.length
          })
          
          // Enrich recommendation cards with streaming platforms (in parallel batches)
          const enrichWithStreamingPlatforms = async (cards: FeedItem[]): Promise<void> => {
            await Promise.all(cards.map(async (card) => {
              const media = card.data?.media
              if (!media) return
              
              // Get media ID and type
              let mediaId: string
              let mediaType: 'tv' | 'movie'
              let releaseDate: string | undefined
              
              if (card.type === 'because_you_liked' || card.type === 'you_might_like') {
                // TMDB data format
                mediaType = media.media_type || 'tv'
                mediaId = `${mediaType}-${media.id}`
                releaseDate = media.first_air_date || media.release_date
              } else if (card.type === 'friends_loved') {
                // Database format - id is already formatted
                mediaId = media.id
                mediaType = media.media_type || (mediaId.startsWith('movie-') ? 'movie' : 'tv')
                releaseDate = media.release_date || media.tmdb_data?.release_date
              } else {
                return
              }
              
              const platforms = await fetchWatchProviders(mediaId, mediaType, releaseDate)
              // Attach to media object for use during render
              ;(media as any).streamingPlatforms = platforms
            }))
          }
          
          // Enrich all recommendation cards in parallel
          await Promise.all([
            enrichWithStreamingPlatforms(becauseYouLikedCards),
            enrichWithStreamingPlatforms(friendsLovedCards),
            enrichWithStreamingPlatforms(youMightLikeCards)
          ])
          
          console.log('✅ Streaming platforms enriched for recommendation cards')
          
          // =====================================================
          // Smart Feed Builder: Deterministic 13-card Pattern
          // Pattern: 1, 1, 2, 1, 3, 1, 7, 1, 8, 1, 2, 3, 8
          // Where: 1=Activity, 2=BecauseYouLiked, 3=FriendsLoved, 7=FindFriends, 8=YouMightLike
          // Bonus: Cards 4/5 (Coming Soon/Now Streaming) insert every 4th position
          // =====================================================
          
          // Create buckets for each card type
          const buckets = {
            activities: [...transformedItems],
            becauseYouLiked: [...becauseYouLikedCards],
            friendsLoved: [...friendsLovedCards],
            comingSoon: [...comingSoonCards],
            nowStreaming: [...nowStreamingCards],
            youMightLike: [...youMightLikeCards],
            findFriends: userSuggestions.length > 0 ? [{
              type: 'follow_suggestions' as const,
              id: 'follow-suggestions-1',
              data: { suggestions: userSuggestions }
            }] : []
          }
          
          // =====================================================
          // Bucket-level deduplication: Ensure no show appears in multiple buckets
          // Priority: activities > becauseYouLiked > friendsLoved > comingSoon > nowStreaming > youMightLike
          // =====================================================
          const seenInBuckets = new Set<string>()
          
          // Helper to get normalized media ID from card
          const getCardMediaId = (card: FeedItem): string | null => {
            let rawId: string | null = null
            if (card.type === 'activity') {
              rawId = card.data?.activity?.media_id || null
            } else if (card.type === 'because_you_liked' || card.type === 'you_might_like') {
              const media = card.data?.media
              if (media) rawId = `${media.media_type || 'tv'}-${String(media.id)}`
            } else if (card.type === 'friends_loved' || card.type === 'coming_soon' || card.type === 'now_streaming') {
              rawId = card.data?.media?.id ? String(card.data.media.id) : null
            }
            if (!rawId) return null
            return rawId.replace(/-s\d+$/, '') // Normalize: remove season suffix
          }
          
          // Mark activity media IDs as seen first (highest priority)
          buckets.activities.forEach(card => {
            const mediaId = getCardMediaId(card)
            if (mediaId) seenInBuckets.add(mediaId)
          })
          
          // Dedupe becauseYouLiked, then add to seen
          buckets.becauseYouLiked = buckets.becauseYouLiked.filter(card => {
            const mediaId = getCardMediaId(card)
            if (!mediaId || seenInBuckets.has(mediaId)) return false
            seenInBuckets.add(mediaId)
            return true
          })
          
          // Dedupe friendsLoved, then add to seen
          buckets.friendsLoved = buckets.friendsLoved.filter(card => {
            const mediaId = getCardMediaId(card)
            if (!mediaId || seenInBuckets.has(mediaId)) return false
            seenInBuckets.add(mediaId)
            return true
          })
          
          // Dedupe comingSoon, then add to seen
          buckets.comingSoon = buckets.comingSoon.filter(card => {
            const mediaId = getCardMediaId(card)
            if (!mediaId || seenInBuckets.has(mediaId)) return false
            seenInBuckets.add(mediaId)
            return true
          })
          
          // Dedupe nowStreaming, then add to seen
          buckets.nowStreaming = buckets.nowStreaming.filter(card => {
            const mediaId = getCardMediaId(card)
            if (!mediaId || seenInBuckets.has(mediaId)) return false
            seenInBuckets.add(mediaId)
            return true
          })
          
          // Dedupe youMightLike (last priority)
          buckets.youMightLike = buckets.youMightLike.filter(card => {
            const mediaId = getCardMediaId(card)
            if (!mediaId || seenInBuckets.has(mediaId)) return false
            seenInBuckets.add(mediaId)
            return true
          })
          
          console.log('🧹 After bucket deduplication:', {
            activities: buckets.activities.length,
            becauseYouLiked: buckets.becauseYouLiked.length,
            friendsLoved: buckets.friendsLoved.length,
            comingSoon: buckets.comingSoon.length,
            nowStreaming: buckets.nowStreaming.length,
            youMightLike: buckets.youMightLike.length,
            uniqueShows: seenInBuckets.size
          })
          
          // Track media IDs already in feed to prevent duplicates
          const usedMediaIds = new Set<string>()
          
          // Normalize media ID to base format (tv-12345 or movie-12345)
          // Strips season suffix like -s1, -s2, etc.
          const normalizeMediaId = (mediaId: string): string => {
            // Remove season suffix: tv-12345-s1 -> tv-12345
            return mediaId.replace(/-s\d+$/, '')
          }
          
          // Helper to extract media_id from a card (normalized)
          const getMediaId = (card: FeedItem): string | null => {
            let rawId: string | null = null
            
            if (card.type === 'activity') {
              // Activity: media_id from database, already formatted as tv-12345 or tv-12345-s1
              rawId = card.data?.activity?.media_id || null
            } else if (card.type === 'because_you_liked' || card.type === 'you_might_like') {
              // TMDB trending data: media.id is numeric (12345), need to construct
              const media = card.data?.media
              if (media) {
                // Force string conversion of media.id to ensure consistent comparison
                rawId = `${media.media_type || 'tv'}-${String(media.id)}`
              }
            } else if (card.type === 'friends_loved' || card.type === 'coming_soon' || card.type === 'now_streaming') {
              // Database data: media.id is already formatted as tv-12345
              rawId = card.data?.media?.id ? String(card.data.media.id) : null
            }
            
            // Ensure rawId is a string before calling replace
            if (!rawId || typeof rawId !== 'string') return null
            return normalizeMediaId(rawId)
          }
          
          // Helper to get card from bucket by type, skipping duplicates
          const getCardFromBucket = (cardType: number): FeedItem | null => {
            const getBucket = () => {
              switch (cardType) {
                case 1: return buckets.activities
                case 2: return buckets.becauseYouLiked
                case 3: return buckets.friendsLoved
                case 7: return buckets.findFriends
                case 8: return buckets.youMightLike
                default: return null
              }
            }
            
            const bucket = getBucket()
            if (!bucket) return null
            
            // For non-media cards (like follow_suggestions), just return first
            if (cardType === 7) {
              return bucket.shift() || null
            }
            
            // For media cards, skip any that have already been shown
            while (bucket.length > 0) {
              const card = bucket.shift()!
              const mediaId = getMediaId(card)
              
              if (!mediaId || !usedMediaIds.has(mediaId)) {
                if (mediaId) {
                  usedMediaIds.add(mediaId)
                  console.log(`✅ Added card type ${cardType}: ${mediaId} (${card.data?.media?.title || card.data?.media?.name || 'unknown'})`)
                }
                return card
              }
              console.log(`⏭️ Skipping duplicate ${cardType}: ${mediaId} (already in feed)`)
            }
            
            return null
          }
          
          // Helper to get fallback card when activities run out (rotate 2->3->8)
          const getFallbackCard = (): FeedItem | null => {
            const fallbackOrder = [2, 3, 8]
            for (const cardType of fallbackOrder) {
              const card = getCardFromBucket(cardType)
              if (card) return card
            }
            return null
          }
          
          // Helper to get bonus card (4 or 5), skipping duplicates
          const getBonusCard = (): FeedItem | null => {
            // Priority: Now Streaming (5) before Coming Soon (4)
            while (buckets.nowStreaming.length > 0) {
              const card = buckets.nowStreaming.shift()!
              const mediaId = getMediaId(card)
              if (!mediaId || !usedMediaIds.has(mediaId)) {
                if (mediaId) usedMediaIds.add(mediaId)
                return card
              }
            }
            while (buckets.comingSoon.length > 0) {
              const card = buckets.comingSoon.shift()!
              const mediaId = getMediaId(card)
              if (!mediaId || !usedMediaIds.has(mediaId)) {
                if (mediaId) usedMediaIds.add(mediaId)
                return card
              }
            }
            return null
          }
          
          // Build the feed using the pattern
          const finalFeed: FeedItem[] = []
          let patternIndex = 0
          let positionCounter = 0
          
          // Continue while we have any content to show
          const hasMoreContent = () => {
            return buckets.activities.length > 0 ||
                   buckets.becauseYouLiked.length > 0 ||
                   buckets.friendsLoved.length > 0 ||
                   buckets.youMightLike.length > 0 ||
                   buckets.findFriends.length > 0
          }
          
          while (hasMoreContent() && finalFeed.length < INITIAL_BATCH_SIZE) { // Cap at 5 for initial load
            positionCounter++
            
            // Insert bonus card (4/5) every Nth position
            if (positionCounter % BONUS_CARD_INTERVAL === 0) {
              const bonusCard = getBonusCard()
              if (bonusCard) {
                finalFeed.push(bonusCard)
                console.log(`📍 Position ${finalFeed.length}: Bonus Card (${bonusCard.type})`)
                continue // Don't advance pattern index for bonus cards
              }
            }
            
            // Get the card type from the pattern
            const cardType = FEED_PATTERN[patternIndex % FEED_PATTERN.length]
            let card = getCardFromBucket(cardType)
            
            // If card type is Activity (1) but we're out, use fallback
            if (!card && cardType === 1) {
              card = getFallbackCard()
            }
            
            // If we got a card, add it
            if (card) {
              finalFeed.push(card)
              console.log(`📍 Position ${finalFeed.length}: Card ${cardType} (${card.type})`)
            }
            
            patternIndex++
          }
          
          console.log('🎯 Final feed built with', finalFeed.length, 'cards')
          
          // Track all media IDs shown in this session (for infinite scroll deduplication)
          shownMediaIds.current = new Set(usedMediaIds)
          console.log('📝 Tracking', shownMediaIds.current.size, 'media IDs for deduplication')
          
          // Track pattern position for infinite scroll continuation
          patternPosition.current = patternIndex
          console.log('📍 Pattern position:', patternPosition.current, '(next card type:', FEED_PATTERN[patternPosition.current % FEED_PATTERN.length], ')')
          
          setFeedItems(finalFeed)
          setLoading(false)
          return
        }
      }
      
      if (otherUsersActivities.length === 0 && directActivities && directActivities.length > 0) {
        // All activities are from current user - show empty feed
        setFeedItems([])
        setLoading(false)
        return
      }
      
      // Fetch feed from API as fallback
      const response = await fetch('/api/feed?limit=10&offset=0')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Feed API Error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

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
          
          // Fetch watch providers (streaming platforms)
          const mediaType = item.media?.media_type || 'tv'
          const releaseDate = item.media?.release_date || item.media?.tmdb_data?.release_date
          const streamingPlatforms = await fetchWatchProviders(item.media?.id, mediaType, releaseDate)
          
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
  // Follows the same pattern as initial load: 1,1,2,1,3,1,7,1,8,1,2,3,8
  const loadMoreItems = async () => {
    if (isLoadingRef.current || !hasMore || !cursor || !user) return
    
    isLoadingRef.current = true
    setIsLoadingMore(true)
    
    try {
      console.log('📦 Loading more items with pattern position:', patternPosition.current)
      
      // Normalize media ID helper
      const normalizeMediaId = (mediaId: string): string => {
        return mediaId.replace(/-s\d+$/, '')
      }
      
      // Get media ID from various card types
      const getCardMediaId = (card: FeedItem): string | null => {
        let rawId: string | null = null
        
        if (card.type === 'activity') {
          rawId = card.data?.activity?.media_id || null
        } else if (card.type === 'because_you_liked') {
          const media = card.data?.media
          if (media) rawId = `${media.media_type || 'tv'}-${media.id}`
        } else if (card.type === 'you_might_like') {
          // TMDB trending data has numeric id and media_type
          const media = card.data?.media
          if (media) rawId = `${media.media_type || 'tv'}-${media.id}`
        } else if (card.type === 'friends_loved') {
          // Database data already has formatted id like 'tv-12345'
          rawId = card.data?.media?.id || null
        }
        
        // Ensure rawId is a string before calling replace
        if (!rawId || typeof rawId !== 'string') return null
        return normalizeMediaId(rawId)
      }
      
      // Fetch excluded media IDs (user's own content + already shown in feed)
      const userExcludedIds = await getUserExcludedMediaIds(user.id)
      const excludedMediaIds = new Set([...userExcludedIds, ...shownMediaIds.current])
      console.log(`📝 Excluding ${excludedMediaIds.size} media IDs (${userExcludedIds.size} user + ${shownMediaIds.current.size} shown)`)
      
      // Fetch all content types in parallel
      const [moreActivities, becauseYouLikedCards, friendsLovedCards, youMightLikeCards, userSuggestions] = await Promise.all([
        // Activities
        supabase
          .from('activities')
          .select(`
            id, user_id, media_id, activity_type, activity_data, created_at,
            profiles:user_id (id, username, display_name, avatar_url),
            media:media_id (id, title, poster_path, backdrop_path, overview, release_date, vote_average, media_type, tmdb_data)
          `)
          .neq('user_id', user.id)
          .lt('created_at', cursor)
          .order('created_at', { ascending: false })
          .limit(LOAD_MORE_BATCH_SIZE),
        // Card 2: Because You Liked (fetch more for fallback when activities run out)
        fetchBecauseYouLiked(supabase, user.id, excludedMediaIds, 5),
        // Card 3: Friends Loved
        fetchFriendsLoved(supabase, user.id, excludedMediaIds, 5),
        // Card 8: You Might Like
        fetchYouMightLike(supabase, user.id, excludedMediaIds, 5),
        // Card 7: Follow Suggestions
        fetchUserSuggestions()
      ])
      
      const activities = moreActivities.data || []
      
      // Update cursor for next activity fetch
      if (activities.length > 0) {
        const lastActivity = activities[activities.length - 1]
        setCursor(lastActivity.created_at)
      }
      
      // Check if we have any content at all
      const totalContent = activities.length + becauseYouLikedCards.length + friendsLovedCards.length + youMightLikeCards.length + userSuggestions.length
      if (totalContent === 0) {
        setHasMore(false)
        return
      }
      
      // Keep hasMore true as long as we have activities OR can generate recommendations
      // Only stop if we ran out of activities AND couldn't build any cards
      setHasMore(activities.length > 0 || becauseYouLikedCards.length > 0 || friendsLovedCards.length > 0 || youMightLikeCards.length > 0)
      
      // Group and transform activities
      const groupedActivities = groupActivities(activities)
      const transformedActivities: FeedItem[] = await Promise.all(
        groupedActivities.map(async (activity) => {
          const [activityComments, showComments, friendsActivity] = await Promise.all([
            fetchActivityComments(activity.id),
            fetchShowComments(activity.media_id),
            fetchFriendsActivity(activity.media_id)
          ])
          
          const mediaType = (activity.media as any)?.media_type || (activity.media_id?.startsWith('movie-') ? 'movie' : 'tv')
          const releaseDate = (activity.media as any)?.release_date || (activity.media as any)?.tmdb_data?.release_date
          const streamingPlatforms = await fetchWatchProviders(activity.media_id, mediaType, releaseDate)
          
          const { data: activityLikes } = await supabase
            .from('activity_likes')
            .select('user_id')
            .eq('activity_id', activity.id)
          
          const userLiked = activityLikes?.some(like => like.user_id === user.id) || false
          const likeCount = activityLikes?.length || 0
          
          let userRating: string | null = null
          let userStatus: string | null = null
          
          if (activity.media_id) {
            const [ratingData, statusData] = await Promise.all([
              supabase.from('ratings').select('rating').eq('user_id', user.id).eq('media_id', activity.media_id).maybeSingle(),
              supabase.from('watch_status').select('status').eq('user_id', user.id).eq('media_id', activity.media_id).maybeSingle()
            ])
            userRating = ratingData.data?.rating || null
            userStatus = statusData.data?.status || null
          }
          
          return {
            type: 'activity' as const,
            id: activity.id,
            data: {
              activity: { ...activity, like_count: likeCount, comment_count: activityComments?.length || 0, user_liked: userLiked },
              friendsActivity, showComments, activityComments, userLiked, likeCount, userRating, userStatus, streamingPlatforms
            }
          }
        })
      )
      
      // Create buckets for pattern building
      const buckets = {
        activities: [...transformedActivities],
        becauseYouLiked: [...becauseYouLikedCards],
        friendsLoved: [...friendsLovedCards],
        youMightLike: [...youMightLikeCards],
        findFriends: userSuggestions.length > 0 ? [{
          type: 'follow_suggestions' as const,
          id: `follow-suggestions-${Date.now()}`,
          data: { suggestions: userSuggestions }
        }] : []
      }
      
      // Bucket-level deduplication: Remove anything already shown in this session
      // (shownMediaIds.current contains everything from initial load + previous lazy loads)
      const filterBucket = (cards: FeedItem[]): FeedItem[] => {
        return cards.filter(card => {
          const mediaId = getCardMediaId(card)
          return !mediaId || !shownMediaIds.current.has(mediaId)
        })
      }
      
      buckets.activities = filterBucket(buckets.activities)
      buckets.becauseYouLiked = filterBucket(buckets.becauseYouLiked)
      buckets.friendsLoved = filterBucket(buckets.friendsLoved)
      buckets.youMightLike = filterBucket(buckets.youMightLike)
      
      // Enrich lazy-loaded recommendation cards with streaming platforms
      const enrichWithStreamingPlatforms = async (cards: FeedItem[]): Promise<void> => {
        await Promise.all(cards.map(async (card) => {
          const media = card.data?.media
          if (!media) return
          
          let mediaId: string
          let mediaType: 'tv' | 'movie'
          let releaseDate: string | undefined
          
          if (card.type === 'because_you_liked' || card.type === 'you_might_like') {
            mediaType = media.media_type || 'tv'
            mediaId = `${mediaType}-${media.id}`
            releaseDate = media.first_air_date || media.release_date
          } else if (card.type === 'friends_loved') {
            mediaId = media.id
            mediaType = media.media_type || (mediaId.startsWith('movie-') ? 'movie' : 'tv')
            releaseDate = media.release_date || media.tmdb_data?.release_date
          } else {
            return
          }
          
          const platforms = await fetchWatchProviders(mediaId, mediaType, releaseDate)
          ;(media as any).streamingPlatforms = platforms
        }))
      }
      
      await Promise.all([
        enrichWithStreamingPlatforms(buckets.becauseYouLiked),
        enrichWithStreamingPlatforms(buckets.friendsLoved),
        enrichWithStreamingPlatforms(buckets.youMightLike)
      ])
      
      console.log('📦 LoadMore buckets (after dedup):', {
        activities: buckets.activities.length,
        becauseYouLiked: buckets.becauseYouLiked.length,
        friendsLoved: buckets.friendsLoved.length,
        youMightLike: buckets.youMightLike.length,
        findFriends: buckets.findFriends.length,
        totalShown: shownMediaIds.current.size
      })
      
      // Helper to get card from bucket
      // Activities: deduplicate against all shown (cursor ensures uniqueness anyway)
      // Recommendations: only deduplicate against LAST batch (allow repeats after a few loads)
      const getCardFromBucket = (cardType: number): FeedItem | null => {
        const getBucket = () => {
          switch (cardType) {
            case 1: return buckets.activities
            case 2: return buckets.becauseYouLiked
            case 3: return buckets.friendsLoved
            case 7: return buckets.findFriends
            case 8: return buckets.youMightLike
            default: return null
          }
        }
        
        const bucket = getBucket()
        if (!bucket) return null
        
        // Find Friends card - just return it
        if (cardType === 7) return bucket.shift() || null
        
        // Activities (cardType 1): strict dedup against all shown
        if (cardType === 1) {
          while (bucket.length > 0) {
            const card = bucket.shift()!
            const mediaId = getCardMediaId(card)
            
            if (!mediaId || !shownMediaIds.current.has(mediaId)) {
              if (mediaId) shownMediaIds.current.add(mediaId)
              return card
            }
            console.log(`⏭️ Skipping duplicate activity: ${mediaId}`)
          }
          return null
        }
        
        // Recommendations (2, 3, 8): check against ALL shown media to prevent duplicates
        while (bucket.length > 0) {
          const card = bucket.shift()!
          const mediaId = getCardMediaId(card)
          
          if (!mediaId || !shownMediaIds.current.has(mediaId)) {
            if (mediaId) shownMediaIds.current.add(mediaId)
            return card
          }
          console.log(`⏭️ Skipping duplicate recommendation: ${mediaId}`)
        }
        return null
      }
      
      // Fallback when activities run out
      const getFallbackCard = (): FeedItem | null => {
        for (const type of [2, 3, 8]) {
          const card = getCardFromBucket(type)
          if (card) return card
        }
        return null
      }
      
      // Build feed batch using pattern
      const newBatch: FeedItem[] = []
      const targetSize = LOAD_MORE_BATCH_SIZE
      
      const hasMoreContent = () => 
        buckets.activities.length > 0 || buckets.becauseYouLiked.length > 0 ||
        buckets.friendsLoved.length > 0 || buckets.youMightLike.length > 0 || buckets.findFriends.length > 0
      
      while (hasMoreContent() && newBatch.length < targetSize) {
        const cardType = FEED_PATTERN[patternPosition.current % FEED_PATTERN.length]
        let card = getCardFromBucket(cardType)
        
        if (!card && cardType === 1) {
          card = getFallbackCard()
        }
        
        if (card) {
          newBatch.push(card)
          console.log(`📍 LoadMore position ${newBatch.length}: Card ${cardType} (${card.type})`)
        }
        
        patternPosition.current++
      }
      
      console.log(`🎯 LoadMore built ${newBatch.length} cards, pattern now at position ${patternPosition.current}`)
      
      // Append to feed
      setFeedItems(prev => [...prev, ...newBatch])
      
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

  const fetchWatchProviders = async (mediaId: string, mediaType: 'tv' | 'movie', releaseDate?: string): Promise<string[]> => {
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
        
        // For movies released in the last 120 days with no streaming, show "In Theaters"
        if (mediaType === 'movie' && releaseDate) {
          const releaseDateObj = new Date(releaseDate)
          const daysSinceRelease = (Date.now() - releaseDateObj.getTime()) / (1000 * 60 * 60 * 24)
          
          if (daysSinceRelease >= 0 && daysSinceRelease <= 120) {
            console.log(`fetchWatchProviders: Movie "${mediaId}" is recent (${Math.round(daysSinceRelease)} days old), showing "In Theaters"`)
            return ['In Theaters']
          }
        }
        
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
    // Generic tracking for card-specific events
    trackEvent(action, metadata)
  }
  
  // Track feed viewed on initial load
  useEffect(() => {
    if (feedItems.length > 0 && !loading) {
      trackFeedViewed({
        feed_type: 'enhanced',
        items_shown: feedItems.length,
      })
    }
  }, [feedItems.length, loading])

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
      
      // Track follow event - get user info from feedItems
      const suggestionsItem = feedItems.find(item => item.type === 'follow_suggestions')
      const followedUser = suggestionsItem?.data?.suggestions?.find((s: any) => s.id === userId)
      if (followedUser) {
        trackUserFollowed({
          followed_user_id: userId,
          followed_username: followedUser.username,
          followed_display_name: followedUser.display_name,
          follow_type: 'public'
        })
      }
      
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
    
    // Track dismiss event - get user info from feedItems
    const suggestionsItem = feedItems.find(item => item.type === 'follow_suggestions')
    const dismissedUser = suggestionsItem?.data?.suggestions?.find((s: any) => s.id === userId)
    trackEvent('suggestion_dismissed', {
      dismissed_user_id: userId,
      dismissed_username: dismissedUser?.username,
      source: 'find_friends_card'
    })
    
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

  // Handle dismissing a media recommendation (Cards 2, 3, 8)
  // Persists to database so the show never appears again in recommendations
  const handleDismissMedia = async (mediaId: string, cardType: string) => {
    if (!user) return
    console.log('Dismiss media:', mediaId, 'from card type:', cardType)
    
    // Normalize media ID (strip season suffix)
    const normalizedMediaId = mediaId.replace(/-s\d+$/, '')
    
    try {
      // Insert into user_dismissed_media table
      const { error } = await supabase
        .from('user_dismissed_media')
        .insert({
          user_id: user.id,
          media_id: normalizedMediaId
        })
      
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error dismissing media:', error)
        return
      }
      
      // Track dismiss event
      trackEvent('media_dismissed', {
        media_id: normalizedMediaId,
        card_type: cardType,
        source: 'recommendation_card'
      })
      
      // Remove card from feed UI immediately
      setFeedItems(prev => prev.filter(item => {
        // Check if this item's media_id matches the dismissed one
        const itemMediaId = 
          item.data?.media?.id?.replace?.(/-s\d+$/, '') ||
          (item.type === 'because_you_liked' ? `${item.data?.media?.media_type || 'tv'}-${item.data?.media?.id}` : null)
        
        if (!itemMediaId) return true
        return itemMediaId.replace(/-s\d+$/, '') !== normalizedMediaId
      }))
      
      console.log('✅ Media dismissed and removed from feed')
    } catch (error) {
      console.error('Error dismissing media:', error)
    }
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

      // Get activity data for tracking
      const activityItem = feedItems.find(item => 
        item.type === 'activity' && item.data.activity?.id === activityId
      )
      const activity = activityItem?.data?.activity
      
      if (existingLike) {
        // Unlike
        await supabase
          .from('activity_likes')
          .delete()
          .eq('id', existingLike.id)
        console.log('Unliked activity')
        
        // Track unlike
        trackActivityUnliked({ activity_id: activityId })
      } else {
        // Like
        await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: user.id
          })
        console.log('Liked activity')
        
        // Track like
        if (activity) {
          trackActivityLiked({
            activity_id: activityId,
            activity_type: activity.activity_type || 'unknown',
            activity_user_id: activity.user_id || '',
            activity_username: activity.user?.username || ''
          })
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleRate = async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
    if (!user) return
    console.log('Rate media:', mediaId, rating)
    
    // Get media info for tracking
    const mediaItem = feedItems.find(item => item.data?.mediaId === mediaId)
    const mediaType = mediaId.startsWith('tv-') ? 'tv' : 'movie'
    const mediaTitle = mediaItem?.data?.show?.title || 'Unknown'
    
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
        
        // Track rating
        trackMediaRated({
          media_id: mediaId,
          media_type: mediaType,
          media_title: mediaTitle,
          rating: rating,
          has_comment: false
        })
      }
    } catch (err) {
      console.error('Error setting rating:', err)
    }
  }

  const handleSetStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!user) return
    console.log('Set watch status:', mediaId, status)
    
    // Get media info and current status for tracking
    const mediaItem = feedItems.find(item => item.data?.mediaId === mediaId)
    const mediaType = mediaId.startsWith('tv-') ? 'tv' : 'movie'
    const mediaTitle = mediaItem?.data?.show?.title || 'Unknown'
    const oldStatus = mediaItem?.data?.userStatus || null
    
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
      
      // Track status change
      trackWatchStatusChanged({
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        old_status: oldStatus,
        new_status: status
      })
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
      
      // Track activity comment
      const activityItem = feedItems.find(item => 
        item.type === 'activity' && item.data.activity?.id === activityId
      )
      trackActivityCommented({
        activity_id: activityId,
        activity_type: activityItem?.data?.activity?.activity_type || 'unknown',
        comment_length: text.length,
        has_mentions: text.includes('@')
      })
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
      
      // Track show comment
      const mediaItem = feedItems.find(item => item.data?.mediaId === mediaId)
      trackShowCommentAdded({
        media_id: mediaId,
        media_title: mediaItem?.data?.show?.title || 'Unknown',
        comment_length: text.length,
        is_public: true
      })
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
        
      `}</style>

      {/* Header - Instagram style: hides on scroll down, shows on scroll up */}
      <AppHeader profile={profile} hideOnScroll />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

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

          // Card 2: Because You Liked
          if (item.type === 'because_you_liked') {
            const { media, sourceShowTitle, sourceMediaId } = item.data as BecauseYouLikedData
            const mediaType = media.media_type || 'tv'
            const mediaId = `${mediaType}-${media.id}`
            
            // Transform TMDB data to FeedCardData format
            const releaseYear = parseInt((media.first_air_date || media.release_date || '').substring(0, 4)) || new Date().getFullYear()
            const cardData: FeedCardData = {
              id: item.id,
              media: {
                id: mediaId,
                title: media.title || media.name || 'Unknown',
                year: releaseYear,
                genres: mapGenreIds(media.genre_ids),
                rating: media.vote_average || 0,
                posterUrl: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '',
                synopsis: media.overview || '',
                creator: '',
                cast: [],
                mediaType: (mediaType === 'tv' ? 'TV' : 'Movie') as 'TV' | 'Movie',
                streamingPlatforms: (media as any).streamingPlatforms || [],
              },
              friends: { avatars: [], count: 0, text: '' },
              stats: { likeCount: 0, commentCount: 0, userLiked: false },
              friendsActivity: {
                watching: { count: 0, avatars: [] },
                wantToWatch: { count: 0, avatars: [] },
                watched: { count: 0, avatars: [] },
                ratings: { meh: 0, like: 0, love: 0 }
              },
              comments: [],
              showComments: []
            }
            
            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <FeedCard
                    data={cardData}
                    badges={[BADGE_PRESETS.BECAUSE_YOU_LIKED(abbreviateSeason(sourceShowTitle))]}
                    variant="b"
                    currentUser={{
                      id: user?.id || '',
                      name: profile?.display_name || 'Guest',
                      avatar: profile?.avatar_url || ''
                    }}
                    onRate={handleRate}
                    onSetStatus={handleSetStatus}
                    onLikeShowComment={(commentId) => handleLikeShowComment(commentId)}
                    onSubmitShowComment={(text) => handleSubmitShowComment(mediaId, text)}
                    onDismissRecommendation={(id) => handleDismissMedia(id, 'because_you_liked')}
                  />
                </div>
              </div>
            )
          }

          // Card 3: Your Friends Loved
          if (item.type === 'friends_loved') {
            const { media, friends: lovedByFriends, friendCount } = item.data as FriendsLovedData
            
            const releaseYear = parseInt((media.release_date || '').substring(0, 4)) || new Date().getFullYear()
            const mediaType = media.media_type || 'tv'
            // Get genres from tmdb_data (database records have genres as objects with name)
            const genreNames = media.tmdb_data?.genres?.map((g: any) => g.name).slice(0, 2) || []
            const cardData: FeedCardData = {
              id: item.id,
              media: {
                id: media.id,
                title: media.title || 'Unknown',
                year: releaseYear,
                genres: genreNames,
                rating: media.vote_average || 0,
                posterUrl: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '',
                synopsis: media.overview || '',
                creator: '',
                cast: [],
                mediaType: (mediaType === 'tv' ? 'TV' : 'Movie') as 'TV' | 'Movie',
                streamingPlatforms: (media as any).streamingPlatforms || [],
              },
              friends: { 
                avatars: lovedByFriends.map(f => ({
                  id: f.id,
                  name: f.display_name,
                  username: '',
                  avatar: f.avatar_url || null  // Pass null to trigger initials fallback
                })),
                count: friendCount,
                text: `${friendCount} friends loved this`
              },
              stats: { likeCount: 0, commentCount: 0, userLiked: false },
              friendsActivity: {
                watching: { count: 0, avatars: [] },
                wantToWatch: { count: 0, avatars: [] },
                watched: { count: 0, avatars: [] },
                ratings: { meh: 0, like: 0, love: friendCount }
              },
              comments: [],
              showComments: []
            }
            
            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <FeedCard
                    data={cardData}
                    badges={[BADGE_PRESETS.FRIENDS_LOVED(friendCount)]}
                    variant="b"
                    currentUser={{
                      id: user?.id || '',
                      name: profile?.display_name || 'Guest',
                      avatar: profile?.avatar_url || ''
                    }}
                    onRate={handleRate}
                    onSetStatus={handleSetStatus}
                    onLikeShowComment={(commentId) => handleLikeShowComment(commentId)}
                    onSubmitShowComment={(text) => handleSubmitShowComment(media.id, text)}
                    onDismissRecommendation={(id) => handleDismissMedia(id, 'friends_loved')}
                  />
                </div>
              </div>
            )
          }

          // Card 4: Coming Soon (uses backVariant="unreleased")
          if (item.type === 'coming_soon') {
            const { media, airDate, seasonNumber } = item.data as ComingSoonData
            
            // Format air date nicely
            const formattedDate = new Date(airDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
            
            const releaseYear = parseInt(airDate.substring(0, 4)) || new Date().getFullYear()
            // Get genres from tmdb_data (database records have genres as objects with name)
            const genreNames = media.tmdb_data?.genres?.map((g: any) => g.name).slice(0, 2) || []
            const cardData: FeedCardData = {
              id: item.id,
              media: {
                id: media.id,
                title: media.title || 'Unknown',
                year: releaseYear,
                genres: genreNames,
                rating: media.vote_average || 0,
                posterUrl: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '',
                synopsis: media.overview || '',
                creator: '',
                cast: [],
                mediaType: 'TV',
              },
              friends: { avatars: [], count: 0, text: '' },
              stats: { likeCount: 0, commentCount: 0, userLiked: false },
              friendsActivity: {
                watching: { count: 0, avatars: [] },
                wantToWatch: { count: 0, avatars: [] },
                watched: { count: 0, avatars: [] },
                ratings: { meh: 0, like: 0, love: 0 }
              },
              comments: [],
              showComments: []
            }
            
            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <FeedCard
                    data={cardData}
                    badges={[BADGE_PRESETS.COMING_SOON(formattedDate)]}
                    variant="b"
                    backVariant="unreleased"
                    currentUser={{
                      id: user?.id || '',
                      name: profile?.display_name || 'Guest',
                      avatar: profile?.avatar_url || ''
                    }}
                    onSetReminder={async () => {
                      // Save reminder to database
                      if (!user) return
                      try {
                        await supabase.from('show_reminders').upsert({
                          user_id: user.id,
                          media_id: media.id,
                          season_number: seasonNumber,
                          air_date: airDate
                        }, { onConflict: 'user_id,media_id,season_number' })
                        console.log('Reminder set for', media.title, 'Season', seasonNumber)
                      } catch (err) {
                        console.error('Error setting reminder:', err)
                      }
                    }}
                  />
                </div>
              </div>
            )
          }

          // Card 5: Now Streaming
          if (item.type === 'now_streaming') {
            const { media, reminderId } = item.data as NowStreamingData
            
            const releaseYear = parseInt((media.release_date || '').substring(0, 4)) || new Date().getFullYear()
            const mediaTypeVal = media.media_type || 'tv'
            // Get genres from tmdb_data (database records have genres as objects with name)
            const genreNames = media.tmdb_data?.genres?.map((g: any) => g.name).slice(0, 2) || []
            const cardData: FeedCardData = {
              id: item.id,
              media: {
                id: media.id,
                title: media.title || 'Unknown',
                year: releaseYear,
                genres: genreNames,
                rating: media.vote_average || 0,
                posterUrl: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '',
                synopsis: media.overview || '',
                creator: '',
                cast: [],
                mediaType: (mediaTypeVal === 'tv' ? 'TV' : 'Movie') as 'TV' | 'Movie',
              },
              friends: { avatars: [], count: 0, text: '' },
              stats: { likeCount: 0, commentCount: 0, userLiked: false },
              friendsActivity: {
                watching: { count: 0, avatars: [] },
                wantToWatch: { count: 0, avatars: [] },
                watched: { count: 0, avatars: [] },
                ratings: { meh: 0, like: 0, love: 0 }
              },
              comments: [],
              showComments: []
            }
            
            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <FeedCard
                    data={cardData}
                    badges={[BADGE_PRESETS.NOW_STREAMING]}
                    variant="b"
                    currentUser={{
                      id: user?.id || '',
                      name: profile?.display_name || 'Guest',
                      avatar: profile?.avatar_url || ''
                    }}
                    onRate={handleRate}
                    onSetStatus={handleSetStatus}
                    onLikeShowComment={(commentId) => handleLikeShowComment(commentId)}
                    onSubmitShowComment={(text) => handleSubmitShowComment(media.id, text)}
                    onDismiss={async () => {
                      // Mark reminder as dismissed
                      if (!user) return
                      try {
                        await supabase.from('show_reminders')
                          .update({ dismissed_at: new Date().toISOString() })
                          .eq('id', reminderId)
                        // Remove card from feed
                        setFeedItems(prev => prev.filter(i => i.id !== item.id))
                      } catch (err) {
                        console.error('Error dismissing notification:', err)
                      }
                    }}
                  />
                </div>
              </div>
            )
          }

          // Card 8: You Might Like
          if (item.type === 'you_might_like') {
            const { media, matchPercentage, similarUsers } = item.data as YouMightLikeData
            
            const releaseYear = parseInt((media.first_air_date || media.release_date || '').substring(0, 4)) || new Date().getFullYear()
            const mediaTypeVal = media.media_type || 'tv'
            // TMDB trending data has genre_ids (numbers), map to names
            const genreNames = mapGenreIds(media.genre_ids)
            const cardData: FeedCardData = {
              id: item.id,
              media: {
                id: media.id,
                title: media.title || 'Unknown',
                year: releaseYear,
                genres: genreNames,
                rating: media.vote_average || 0,
                posterUrl: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '',
                synopsis: media.overview || '',
                creator: '',
                cast: [],
                mediaType: (mediaTypeVal === 'tv' ? 'TV' : 'Movie') as 'TV' | 'Movie',
                streamingPlatforms: (media as any).streamingPlatforms || [],
              },
              friends: { avatars: [], count: 0, text: '' },
              stats: { likeCount: 0, commentCount: 0, userLiked: false },
              friendsActivity: {
                watching: { count: 0, avatars: [] },
                wantToWatch: { count: 0, avatars: [] },
                watched: { count: 0, avatars: [] },
                ratings: { meh: 0, like: 0, love: 0 }
              },
              comments: [],
              showComments: []
            }
            
            return (
              <div key={item.id} className="card-snap-wrapper">
                <div className="card-inner-wrapper">
                  <FeedCard
                    data={cardData}
                    badges={[BADGE_PRESETS.YOU_MIGHT_LIKE(matchPercentage, similarUsers)]}
                    variant="b"
                    currentUser={{
                      id: user?.id || '',
                      name: profile?.display_name || 'Guest',
                      avatar: profile?.avatar_url || ''
                    }}
                    onRate={handleRate}
                    onSetStatus={handleSetStatus}
                    onLikeShowComment={(commentId) => handleLikeShowComment(commentId)}
                    onSubmitShowComment={(text) => handleSubmitShowComment(media.id, text)}
                    onDismissRecommendation={(id) => handleDismissMedia(id, 'you_might_like')}
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


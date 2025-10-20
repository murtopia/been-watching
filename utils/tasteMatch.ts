/**
 * Taste Match Algorithm
 *
 * Calculates similarity between users based on their watch history and ratings.
 * This algorithm can be used for:
 * 1. Friend suggestions (find users with similar taste)
 * 2. Show recommendations (find shows liked by similar users)
 * 3. Social discovery (connect compatible viewers)
 *
 * Score ranges from 0-100, where:
 * - 90-100: Exceptional match (same taste)
 * - 70-89: Great match (very similar)
 * - 50-69: Good match (some overlap)
 * - 30-49: Fair match (different but compatible)
 * - 0-29: Poor match (very different taste)
 */

import { createClient } from '@/utils/supabase/client'

export interface UserTasteProfile {
  userId: string
  watchedShows: string[] // media_ids
  ratings: { mediaId: string; rating: string }[] // love, like, meh
  topGenres?: string[]
  watchCount: number
}

export interface TasteMatchResult {
  score: number // 0-100
  sharedShows: number
  ratingAgreement: number // 0-100
  category: 'exceptional' | 'great' | 'good' | 'fair' | 'poor'
  details: {
    totalOverlap: number
    agreedRatings: number
    disagreedRatings: number
  }
}

/**
 * Fetch a user's taste profile from the database
 */
export async function getUserTasteProfile(userId: string): Promise<UserTasteProfile | null> {
  const supabase = createClient()

  // Get watched shows
  const { data: watchedData } = await supabase
    .from('watch_status')
    .select('media_id')
    .eq('user_id', userId)
    .eq('status', 'watched')

  // Get ratings
  const { data: ratingsData } = await supabase
    .from('ratings')
    .select('media_id, rating')
    .eq('user_id', userId)

  if (!watchedData && !ratingsData) return null

  return {
    userId,
    watchedShows: watchedData?.map(w => w.media_id) || [],
    ratings: ratingsData?.map(r => ({ mediaId: r.media_id, rating: r.rating })) || [],
    watchCount: watchedData?.length || 0
  }
}

/**
 * Calculate taste match score between two users
 */
export function calculateTasteMatch(
  user1: UserTasteProfile,
  user2: UserTasteProfile
): TasteMatchResult {
  // Find shows both users have watched
  const sharedShows = user1.watchedShows.filter(mediaId =>
    user2.watchedShows.includes(mediaId)
  )

  // If no overlap, return poor match
  if (sharedShows.length === 0) {
    return {
      score: 0,
      sharedShows: 0,
      ratingAgreement: 0,
      category: 'poor',
      details: {
        totalOverlap: 0,
        agreedRatings: 0,
        disagreedRatings: 0
      }
    }
  }

  // Calculate rating agreement for shared shows
  let agreedRatings = 0
  let disagreedRatings = 0
  let ratedSharedShows = 0

  sharedShows.forEach(mediaId => {
    const user1Rating = user1.ratings.find(r => r.mediaId === mediaId)
    const user2Rating = user2.ratings.find(r => r.mediaId === mediaId)

    if (user1Rating && user2Rating) {
      ratedSharedShows++

      // Exact match (both love, both like, or both meh)
      if (user1Rating.rating === user2Rating.rating) {
        agreedRatings++
      }
      // Compatible match (love/like or like/meh are close enough)
      else if (
        (user1Rating.rating === 'love' && user2Rating.rating === 'like') ||
        (user1Rating.rating === 'like' && user2Rating.rating === 'love') ||
        (user1Rating.rating === 'like' && user2Rating.rating === 'meh') ||
        (user1Rating.rating === 'meh' && user2Rating.rating === 'like')
      ) {
        agreedRatings += 0.5 // Partial agreement
      }
      // Strong disagreement (love vs meh)
      else {
        disagreedRatings++
      }
    }
  })

  // Calculate rating agreement percentage (0-100)
  const ratingAgreement = ratedSharedShows > 0
    ? Math.round((agreedRatings / ratedSharedShows) * 100)
    : 50 // Neutral if no ratings overlap

  // Calculate overlap percentage
  const minWatchCount = Math.min(user1.watchCount, user2.watchCount)
  const overlapPercentage = minWatchCount > 0
    ? (sharedShows.length / minWatchCount) * 100
    : 0

  // Calculate final score (weighted average)
  // 60% weight on rating agreement, 40% weight on overlap
  const score = Math.round(
    (ratingAgreement * 0.6) + (overlapPercentage * 0.4)
  )

  // Determine category
  let category: TasteMatchResult['category']
  if (score >= 90) category = 'exceptional'
  else if (score >= 70) category = 'great'
  else if (score >= 50) category = 'good'
  else if (score >= 30) category = 'fair'
  else category = 'poor'

  return {
    score: Math.min(100, score), // Cap at 100
    sharedShows: sharedShows.length,
    ratingAgreement,
    category,
    details: {
      totalOverlap: sharedShows.length,
      agreedRatings: Math.floor(agreedRatings),
      disagreedRatings
    }
  }
}

/**
 * Get taste match between current user and another user
 * Convenience function that fetches profiles and calculates match
 */
export async function getTasteMatchBetweenUsers(
  userId1: string,
  userId2: string
): Promise<TasteMatchResult | null> {
  const [profile1, profile2] = await Promise.all([
    getUserTasteProfile(userId1),
    getUserTasteProfile(userId2)
  ])

  if (!profile1 || !profile2) return null

  return calculateTasteMatch(profile1, profile2)
}

/**
 * Find users with similar taste to the current user
 * Returns sorted list of users by taste match score
 */
export async function findSimilarUsers(
  userId: string,
  options: {
    limit?: number
    minScore?: number
    excludeUserIds?: string[]
  } = {}
): Promise<Array<{ userId: string; score: number; category: string }>> {
  const { limit = 10, minScore = 30, excludeUserIds = [] } = options

  const supabase = createClient()

  // Get current user's profile
  const userProfile = await getUserTasteProfile(userId)
  if (!userProfile) return []

  // Get all other users who have watched content
  const { data: otherUsers } = await supabase
    .from('profiles')
    .select('id')
    .neq('id', userId)
    .not('id', 'in', `(${excludeUserIds.join(',')})`)

  if (!otherUsers || otherUsers.length === 0) return []

  // Calculate taste match for each user
  const matches = await Promise.all(
    otherUsers.map(async (user) => {
      const otherProfile = await getUserTasteProfile(user.id)
      if (!otherProfile || otherProfile.watchCount === 0) return null

      const match = calculateTasteMatch(userProfile, otherProfile)

      return {
        userId: user.id,
        score: match.score,
        category: match.category,
        sharedShows: match.sharedShows
      }
    })
  )

  // Filter, sort, and limit results
  return matches
    .filter((m): m is NonNullable<typeof m> => m !== null && m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Get taste match category label and emoji
 */
export function getTasteMatchLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 90) return { label: 'Exceptional Match', emoji: '🔥', color: '#ff0050' }
  if (score >= 70) return { label: 'Great Match', emoji: '⭐', color: '#ff6b35' }
  if (score >= 50) return { label: 'Good Match', emoji: '👍', color: '#ffa500' }
  if (score >= 30) return { label: 'Fair Match', emoji: '✓', color: '#4caf50' }
  return { label: 'Different Taste', emoji: '•', color: '#999' }
}

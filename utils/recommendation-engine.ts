/**
 * Recommendation Engine
 * 
 * Generates personalized media recommendations using:
 * - Collaborative filtering (user similarity based on ratings)
 * - Content-based filtering (genre/cast matching)
 * - Hybrid scoring (combines both methods)
 */

import { createClient } from '@/utils/supabase/server'

interface Recommendation {
  media_id: string
  score: number
  algorithm_type: 'collaborative' | 'content_based' | 'hybrid'
  reason: string
}

interface UserRating {
  media_id: string
  rating: string // 'meh', 'like', 'love'
}

interface MediaMetadata {
  genres?: number[]
  cast?: number[]
  keywords?: number[]
}

/**
 * Calculate cosine similarity between two users based on their ratings
 */
function cosineSimilarity(user1Ratings: UserRating[], user2Ratings: UserRating[]): number {
  // Create rating vectors: meh = -1, like = 0, love = 1
  const ratingMap = { meh: -1, like: 0, love: 1 }
  
  // Get all unique media IDs
  const allMediaIds = new Set([
    ...user1Ratings.map(r => r.media_id),
    ...user2Ratings.map(r => r.media_id)
  ])

  if (allMediaIds.size === 0) return 0

  // Create vectors
  const vector1: number[] = []
  const vector2: number[] = []

  for (const mediaId of allMediaIds) {
    const rating1 = user1Ratings.find(r => r.media_id === mediaId)
    const rating2 = user2Ratings.find(r => r.media_id === mediaId)
    
    vector1.push(rating1 ? ratingMap[rating1.rating as keyof typeof ratingMap] : 0)
    vector2.push(rating2 ? ratingMap[rating2.rating as keyof typeof ratingMap] : 0)
  }

  // Calculate dot product
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i]
    magnitude1 += vector1[i] * vector1[i]
    magnitude2 += vector2[i] * vector2[i]
  }

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  if (magnitude1 === 0 || magnitude2 === 0) return 0

  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * Find similar users based on rating overlap
 */
async function findSimilarUsers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  minSimilarity: number = 0.3
): Promise<Array<{ userId: string; similarity: number }>> {
  // Get current user's ratings
  const { data: userRatings } = await supabase
    .from('ratings')
    .select('media_id, rating')
    .eq('user_id', userId)

  if (!userRatings || userRatings.length === 0) return []

  // Get all other users' ratings
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('user_id, media_id, rating')
    .neq('user_id', userId)

  if (!allRatings) return []

  // Group ratings by user
  const userRatingsMap = new Map<string, UserRating[]>()
  for (const rating of allRatings) {
    if (!userRatingsMap.has(rating.user_id)) {
      userRatingsMap.set(rating.user_id, [])
    }
    userRatingsMap.get(rating.user_id)!.push({
      media_id: rating.media_id,
      rating: rating.rating
    })
  }

  // Calculate similarity with each user
  const similarities: Array<{ userId: string; similarity: number }> = []
  
  for (const [otherUserId, otherRatings] of userRatingsMap.entries()) {
    const similarity = cosineSimilarity(userRatings, otherRatings)
    if (similarity >= minSimilarity) {
      similarities.push({ userId: otherUserId, similarity })
    }
  }

  // Sort by similarity descending
  return similarities.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Collaborative filtering: Recommend media liked by similar users
 */
async function collaborativeFiltering(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  similarUsers: Array<{ userId: string; similarity: number }>,
  limit: number = 50
): Promise<Recommendation[]> {
  if (similarUsers.length === 0) return []

  // Get media that similar users have rated highly
  const similarUserIds = similarUsers.map(u => u.userId)
  
  const { data: similarRatings } = await supabase
    .from('ratings')
    .select('media_id, rating, user_id')
    .in('user_id', similarUserIds)
    .in('rating', ['like', 'love'])

  if (!similarRatings) return []

  // Get current user's watched media (to exclude)
  const { data: userWatched } = await supabase
    .from('watch_status')
    .select('media_id')
    .eq('user_id', userId)
    .in('status', ['watching', 'watched'])

  const watchedMediaIds = new Set(userWatched?.map(w => w.media_id) || [])

  // Get user's existing ratings (to exclude)
  const { data: userRatings } = await supabase
    .from('ratings')
    .select('media_id')
    .eq('user_id', userId)

  const ratedMediaIds = new Set(userRatings?.map(r => r.media_id) || [])

  // Calculate weighted scores for each media
  const mediaScores = new Map<string, { score: number; reasons: string[] }>()

  for (const rating of similarRatings) {
    // Skip if user already watched or rated
    if (watchedMediaIds.has(rating.media_id) || ratedMediaIds.has(rating.media_id)) {
      continue
    }

    const userSimilarity = similarUsers.find(u => u.userId === rating.user_id)?.similarity || 0
    const ratingWeight = rating.rating === 'love' ? 1.0 : 0.7 // Love counts more than like
    
    const currentScore = mediaScores.get(rating.media_id) || { score: 0, reasons: [] }
    currentScore.score += userSimilarity * ratingWeight
    
    // Track reasons (which similar users liked it)
    if (!currentScore.reasons.includes(rating.user_id)) {
      currentScore.reasons.push(rating.user_id)
    }
    
    mediaScores.set(rating.media_id, currentScore)
  }

  // Convert to recommendations array
  const recommendations: Recommendation[] = []
  
  for (const [mediaId, data] of mediaScores.entries()) {
    const reason = `Liked by ${data.reasons.length} similar user${data.reasons.length > 1 ? 's' : ''}`
    
    recommendations.push({
      media_id: mediaId,
      score: data.score,
      algorithm_type: 'collaborative',
      reason
    })
  }

  // Sort by score descending and limit
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Content-based filtering: Recommend media with similar attributes
 */
async function contentBasedFiltering(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  limit: number = 50
): Promise<Recommendation[]> {
  // Get user's loved shows
  const { data: lovedRatings } = await supabase
    .from('ratings')
    .select('media_id')
    .eq('user_id', userId)
    .eq('rating', 'love')

  if (!lovedRatings || lovedRatings.length === 0) return []

  // Get media metadata for loved shows
  const lovedMediaIds = lovedRatings.map(r => r.media_id)
  
  const { data: lovedMedia } = await supabase
    .from('media')
    .select('id, tmdb_data')
    .in('id', lovedMediaIds)

  if (!lovedMedia) return []

  // Extract genres, cast, keywords from loved shows
  const favoriteGenres = new Set<number>()
  const favoriteCast = new Set<number>()
  const favoriteKeywords = new Set<number>()

  for (const media of lovedMedia) {
    const tmdbData = media.tmdb_data as any
    if (tmdbData?.genres) {
      tmdbData.genres.forEach((g: { id: number }) => favoriteGenres.add(g.id))
    }
    if (tmdbData?.credits?.cast) {
      tmdbData.credits.cast.slice(0, 5).forEach((c: { id: number }) => favoriteCast.add(c.id))
    }
    if (tmdbData?.keywords?.keywords) {
      tmdbData.keywords.keywords.forEach((k: { id: number }) => favoriteKeywords.add(k.id))
    }
  }

  if (favoriteGenres.size === 0 && favoriteCast.size === 0) return []

  // Get all media
  const { data: allMedia } = await supabase
    .from('media')
    .select('id, tmdb_data')
    .limit(1000) // Reasonable limit

  if (!allMedia) return []

  // Get user's watched/rated media to exclude
  const { data: userWatched } = await supabase
    .from('watch_status')
    .select('media_id')
    .eq('user_id', userId)
    .in('status', ['watching', 'watched'])

  const { data: userRatings } = await supabase
    .from('ratings')
    .select('media_id')
    .eq('user_id', userId)

  const excludedMediaIds = new Set([
    ...(userWatched?.map(w => w.media_id) || []),
    ...(userRatings?.map(r => r.media_id) || []),
    ...lovedMediaIds
  ])

  // Score each media based on attribute overlap
  const recommendations: Recommendation[] = []

  for (const media of allMedia) {
    if (excludedMediaIds.has(media.id)) continue

    const tmdbData = media.tmdb_data as any
    let score = 0
    let matches: string[] = []

    // Genre overlap
    if (tmdbData?.genres) {
      const mediaGenres = new Set(tmdbData.genres.map((g: { id: number }) => g.id))
      const genreOverlap = Array.from(favoriteGenres).filter(g => mediaGenres.has(g)).length
      if (genreOverlap > 0) {
        score += genreOverlap * 0.5
        matches.push(`${genreOverlap} genre${genreOverlap > 1 ? 's' : ''}`)
      }
    }

    // Cast overlap
    if (tmdbData?.credits?.cast) {
      const mediaCast = new Set(tmdbData.credits.cast.slice(0, 10).map((c: { id: number }) => c.id))
      const castOverlap = Array.from(favoriteCast).filter(c => mediaCast.has(c)).length
      if (castOverlap > 0) {
        score += castOverlap * 0.3
        matches.push(`${castOverlap} actor${castOverlap > 1 ? 's' : ''}`)
      }
    }

    // Keyword overlap
    if (tmdbData?.keywords?.keywords) {
      const mediaKeywords = new Set(tmdbData.keywords.keywords.map((k: { id: number }) => k.id))
      const keywordOverlap = Array.from(favoriteKeywords).filter(k => mediaKeywords.has(k)).length
      if (keywordOverlap > 0) {
        score += keywordOverlap * 0.2
        matches.push(`${keywordOverlap} keyword${keywordOverlap > 1 ? 's' : ''}`)
      }
    }

    if (score > 0) {
      recommendations.push({
        media_id: media.id,
        score,
        algorithm_type: 'content_based',
        reason: `Similar to your favorites: ${matches.join(', ')}`
      })
    }
  }

  // Sort by score descending and limit
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Hybrid recommendation: Combine collaborative and content-based
 */
export async function generateRecommendations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  limit: number = 50
): Promise<Recommendation[]> {
  // Find similar users
  const similarUsers = await findSimilarUsers(supabase, userId, 0.2)

  // Get collaborative recommendations
  const collaborativeRecs = await collaborativeFiltering(supabase, userId, similarUsers, limit * 2)

  // Get content-based recommendations
  const contentBasedRecs = await contentBasedFiltering(supabase, userId, limit * 2)

  // Combine and deduplicate
  const mediaMap = new Map<string, Recommendation>()

  // Add collaborative (weight: 0.6)
  for (const rec of collaborativeRecs) {
    const existing = mediaMap.get(rec.media_id)
    if (existing) {
      // Combine scores
      existing.score = existing.score * 0.6 + rec.score * 0.4
      existing.algorithm_type = 'hybrid'
      existing.reason = `${existing.reason} + ${rec.reason}`
    } else {
      mediaMap.set(rec.media_id, {
        ...rec,
        score: rec.score * 0.6
      })
    }
  }

  // Add content-based (weight: 0.4)
  for (const rec of contentBasedRecs) {
    const existing = mediaMap.get(rec.media_id)
    if (existing) {
      // Combine scores
      existing.score = existing.score + rec.score * 0.4
      existing.algorithm_type = 'hybrid'
      existing.reason = `${existing.reason} + ${rec.reason}`
    } else {
      mediaMap.set(rec.media_id, {
        ...rec,
        score: rec.score * 0.4
      })
    }
  }

  // Normalize scores to 0-1 range
  const allScores = Array.from(mediaMap.values()).map(r => r.score)
  const maxScore = Math.max(...allScores, 1)
  
  const normalizedRecs = Array.from(mediaMap.values()).map(rec => ({
    ...rec,
    score: rec.score / maxScore
  }))

  // Sort by score descending and limit
  return normalizedRecs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Save recommendations to database
 */
export async function saveRecommendations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  recommendations: Recommendation[]
): Promise<void> {
  const records = recommendations.map(rec => ({
    user_id: userId,
    media_id: rec.media_id,
    score: rec.score,
    algorithm_type: rec.algorithm_type,
    reason: rec.reason
  }))

  // Upsert recommendations (replace existing ones for this user)
  await supabase
    .from('recommendations')
    .upsert(records, {
      onConflict: 'user_id,media_id',
      ignoreDuplicates: false
    })
}


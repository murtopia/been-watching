/**
 * Feed Utilities
 * Helper functions for feed card generation and filtering
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Get all media IDs that should be excluded from recommendations
 * (shows user has already interacted with OR dismissed)
 */
export async function getUserExcludedMediaIds(userId: string): Promise<Set<string>> {
  const supabase = createClient()
  
  // Fetch all exclusion sources in parallel
  const [watchStatusResult, ratingsResult, dismissedResult] = await Promise.all([
    // Get shows in user's watchlist
    supabase
      .from('watch_status')
      .select('media_id')
      .eq('user_id', userId),
    
    // Get shows user has rated
    supabase
      .from('ratings')
      .select('media_id')
      .eq('user_id', userId),
    
    // Get shows user has dismissed
    supabase
      .from('user_dismissed_media')
      .select('media_id')
      .eq('user_id', userId)
  ])
  
  const excluded = new Set<string>()
  
  watchStatusResult.data?.forEach(w => {
    if (w.media_id) excluded.add(w.media_id)
  })
  
  ratingsResult.data?.forEach(r => {
    if (r.media_id) excluded.add(r.media_id)
  })
  
  dismissedResult.data?.forEach(d => {
    if (d.media_id) excluded.add(d.media_id)
  })
  
  return excluded
}

/**
 * Check if a card should be shown based on impression tracking
 * Returns true if card can be shown, false if on cooldown or maxed out
 */
export async function shouldShowCard(
  userId: string, 
  cardType: string, 
  mediaId: string,
  maxImpressions: number = 2,
  cooldownDays: number = 2
): Promise<boolean> {
  const supabase = createClient()
  
  const { data: impression } = await supabase
    .from('card_impressions')
    .select('impression_count, last_shown_at')
    .eq('user_id', userId)
    .eq('card_type', cardType)
    .eq('media_id', mediaId)
    .maybeSingle()
  
  if (!impression) return true  // Never shown before
  
  // Check cooldown (2 days by default)
  const lastShown = new Date(impression.last_shown_at)
  const daysSinceShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceShown < cooldownDays) return false
  
  // Check max impressions (skip for coming_soon which has no max)
  if (cardType !== 'coming_soon' && impression.impression_count >= maxImpressions) {
    return false
  }
  
  return true
}

/**
 * Record that a card was shown to a user
 */
export async function recordCardImpression(
  userId: string,
  cardType: string,
  mediaId: string,
  sourceMediaId?: string
): Promise<void> {
  const supabase = createClient()
  
  // Try to update existing impression
  const { data: existing } = await supabase
    .from('card_impressions')
    .select('id, impression_count')
    .eq('user_id', userId)
    .eq('card_type', cardType)
    .eq('media_id', mediaId)
    .maybeSingle()
  
  if (existing) {
    // Update existing
    await supabase
      .from('card_impressions')
      .update({
        impression_count: existing.impression_count + 1,
        last_shown_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    // Insert new
    await supabase
      .from('card_impressions')
      .insert({
        user_id: userId,
        card_type: cardType,
        media_id: mediaId,
        source_media_id: sourceMediaId,
        impression_count: 1,
        first_shown_at: new Date().toISOString(),
        last_shown_at: new Date().toISOString()
      })
  }
}

/**
 * Get valid impressions for a card type (not on cooldown, under max)
 * Returns a Set of media IDs that can be shown
 */
export async function getShowableMediaIds(
  userId: string,
  cardType: string,
  candidateMediaIds: string[],
  maxImpressions: number = 2,
  cooldownDays: number = 2
): Promise<Set<string>> {
  const supabase = createClient()
  
  if (candidateMediaIds.length === 0) return new Set()
  
  // Get all impressions for these media IDs
  const { data: impressions } = await supabase
    .from('card_impressions')
    .select('media_id, impression_count, last_shown_at')
    .eq('user_id', userId)
    .eq('card_type', cardType)
    .in('media_id', candidateMediaIds)
  
  const showable = new Set<string>(candidateMediaIds)
  const now = Date.now()
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000
  
  impressions?.forEach(imp => {
    const lastShown = new Date(imp.last_shown_at).getTime()
    const onCooldown = (now - lastShown) < cooldownMs
    const maxedOut = cardType !== 'coming_soon' && imp.impression_count >= maxImpressions
    
    if (onCooldown || maxedOut) {
      showable.delete(imp.media_id)
    }
  })
  
  return showable
}

/**
 * Calculate taste match score between two users
 * Returns a percentage (0-100)
 */
export async function calculateTasteMatch(userA: string, userB: string): Promise<number> {
  const supabase = createClient()
  
  // Get ratings for both users
  const [{ data: ratingsA }, { data: ratingsB }] = await Promise.all([
    supabase.from('ratings').select('media_id, rating').eq('user_id', userA),
    supabase.from('ratings').select('media_id, rating').eq('user_id', userB)
  ])
  
  if (!ratingsA || !ratingsB || ratingsA.length === 0 || ratingsB.length === 0) {
    return 0
  }
  
  // Create maps for efficient lookup
  const mapA = new Map(ratingsA.map(r => [r.media_id, r.rating]))
  const mapB = new Map(ratingsB.map(r => [r.media_id, r.rating]))
  
  // Find shared ratings
  let matches = 0
  let total = 0
  
  // Rating values for comparison
  const ratingValue: Record<string, number> = { meh: 1, like: 2, love: 3 }
  
  for (const [mediaId, ratingA] of mapA) {
    if (mapB.has(mediaId)) {
      total++
      const ratingBVal = mapB.get(mediaId)!
      const valA = ratingValue[ratingA] || 2
      const valB = ratingValue[ratingBVal] || 2
      
      if (ratingA === ratingBVal) {
        matches += 1.0  // Exact match
      } else if (Math.abs(valA - valB) === 1) {
        matches += 0.5  // Close match (meh/like or like/love)
      }
    }
  }
  
  if (total === 0) return 0
  
  return Math.round((matches / total) * 100)
}

/**
 * Find users with similar taste (above threshold)
 */
export async function findSimilarUsers(
  userId: string,
  minMatchScore: number = 75,
  minSharedRatings: number = 5
): Promise<Array<{ userId: string; matchScore: number }>> {
  const supabase = createClient()
  
  // Get all users who have rated at least minSharedRatings shows
  const { data: potentialUsers } = await supabase
    .from('profiles')
    .select('id')
    .neq('id', userId)
  
  if (!potentialUsers) return []
  
  // Calculate taste match for each user
  const results: Array<{ userId: string; matchScore: number }> = []
  
  for (const user of potentialUsers) {
    const matchScore = await calculateTasteMatch(userId, user.id)
    if (matchScore >= minMatchScore) {
      results.push({ userId: user.id, matchScore })
    }
  }
  
  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore)
}


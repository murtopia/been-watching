# Enhanced Feed: Algorithm Strategy

**Version:** 1.1
**Last Updated:** December 2025
**Status:** Implemented - Live in Production

## Overview

The Enhanced Activity Feed algorithm balances multiple objectives: keeping users connected with friends, helping them discover new content, and maintaining engagement. This document outlines the distribution strategy, recommendation engine logic, personalization approach, and future ML enhancements.

---

## Core Objectives

### Primary Goals
1. **Social Connection:** Keep users engaged with friends' activities (50% of feed)
2. **Content Discovery:** Help users find shows they'll love (35% of feed)
3. **Network Growth:** Facilitate finding compatible users (5% of feed)
4. **Timely Relevance:** Surface releases and new availability (10% of feed)

### Success Metrics
- **Engagement:** 10+ cards viewed per session (baseline: 5-7)
- **Conversion:** 30% of users rate/add shows from recommendations
- **Retention:** 50%+ users return within 7 days
- **Social Growth:** 15%+ increase in follows per month
- **Discovery:** 25%+ increase in watchlist additions from recommendations

---

## Distribution Strategy

### Initial Distribution Ratios

```typescript
const FEED_DISTRIBUTION = {
  // Friend Activity Pool (50%)
  friendActivity: {
    userActivity: 0.40,      // Card 1: Friend ratings/watchlist changes
    top3Updates: 0.10,       // Card 6: Friend Top 3 updates
  },

  // AI Recommendations Pool (20%)
  aiRecommendations: {
    becauseYouLiked: 0.12,   // Card 2: Based on user's likes
    youMightLike: 0.08,      // Card 8: Taste match algorithm
  },

  // Social Recommendations Pool (15%)
  socialRecommendations: {
    friendsLoved: 0.15,      // Card 3: Shows friends highly rated
  },

  // Release Notifications Pool (10%)
  releaseNotifications: {
    comingSoon: 0.06,        // Card 4: Upcoming releases
    nowStreaming: 0.04,      // Card 5: New streaming availability
  },

  // Follow Suggestions Pool (5%)
  followSuggestions: {
    findNewFriends: 0.05,    // Card 7: User discovery
  }
};
```

**Total:** 100% distribution across 8 card types

### Distribution Logic Flow

```
1. User requests feed (GET /api/feed-v2?limit=20)
   ↓
2. Calculate target card counts based on distribution:
   - Friend Activity: 10 cards (50%)
   - AI Recommendations: 4 cards (20%)
   - Social Recommendations: 3 cards (15%)
   - Release Notifications: 2 cards (10%)
   - Follow Suggestions: 1 card (5%)
   ↓
3. Fetch candidates for each category:
   - Query database for available cards
   - Apply filters (not dismissed, not already in watchlist, etc.)
   - Score and rank within category
   ↓
4. Select top cards per category:
   - Pick highest-scoring cards up to target count
   - If not enough cards, redistribute slots to other categories
   ↓
5. Deduplicate across buckets (Layer 1):
   - Remove shows that appear in multiple buckets
   - Priority: Activities > Card2 > Card3 > Card4 > Card5 > Card8
   - Normalize media IDs (strip season suffix)
   ↓
6. Interleave cards using 13-card pattern:
   - Pattern: 1,1,2,1,3,1,7,1,8,1,2,3,8
   - Where: 1=Activity, 2=BecauseYouLiked, 3=FriendsLoved, 7=FindFriends, 8=YouMightLike
   - Bonus cards (4,5) inserted every 4th position
   ↓
7. Apply deduplication during build (Layer 2):
   - Track shownMediaIds as cards are added
   - Skip any show already in feed
   ↓
8. Apply impression tracking:
   - 2-day cooldown: Don't show same recommendation card if shown in last 48 hours
   - Max 2 impressions: Cards 2, 3, 8 shown max 2 times total, then never again
   - Card 4: No max (keep showing every 2 days until released)
   - Card 7: Max 1 per session
   ↓
7. Personalize order (Phase 2):
   - Boost card types user engages with most
   - Front-load high-confidence recommendations
   ↓
8. Return sorted feed array
```

---

## Card Prioritization Rules

### Card 1: User Activity

**Scoring Factors:**
```typescript
function scoreUserActivity(activity: Activity): number {
  let score = 0;

  // Recency (most important for activity)
  const hoursAgo = (Date.now() - activity.created_at) / (1000 * 60 * 60);
  if (hoursAgo < 1) score += 100;
  else if (hoursAgo < 6) score += 80;
  else if (hoursAgo < 24) score += 60;
  else if (hoursAgo < 72) score += 40;
  else score += 20;

  // User closeness (taste match score)
  score += activity.user.compatibility_score * 0.5; // 0-50 points

  // Social proof (how many friends care about this show)
  score += Math.min(activity.friends_who_watched_count * 2, 30); // Max 30 points

  // Engagement potential (show popularity)
  score += Math.min(activity.media.vote_average * 3, 30); // Max 30 points

  // Activity type weight
  if (activity.activity_data.rating === 'love') score += 15;
  else if (activity.activity_data.rating === 'like') score += 10;

  // Grouped activities get bonus (more interesting)
  if (activity.activity_group_id) score += 10;

  return score;
}
```

**Max Score:** ~235 points
**Typical Range:** 60-180 points

**Display Rules:**
- Show all activities from followed users (no filtering by show)
- Sort by score descending
- Limit to 100 most recent per fetch (performance)

### Card 2: Because You Liked

**Scoring Factors:**
```typescript
function scoreBecauseYouLiked(rec: Recommendation): number {
  let score = 0;

  // Source show affinity (how much user loved the source)
  if (rec.source_show_rating === 'love') score += 50;
  else if (rec.source_show_rating === 'like') score += 30;

  // Recommendation confidence (algorithm confidence score)
  score += rec.confidence_score * 0.8; // 0-80 points

  // Genre overlap (how many genres match)
  score += rec.genre_overlap_count * 10; // Max 50 points (5 genres)

  // Cast overlap (shared actors)
  score += Math.min(rec.cast_overlap_count * 5, 25); // Max 25 points

  // Network match (same network as source)
  if (rec.network_match) score += 15;

  // Critical acclaim (TMDB rating)
  if (rec.media.vote_average >= 8.5) score += 20;
  else if (rec.media.vote_average >= 7.5) score += 10;

  // Social proof (friends who watched)
  score += Math.min(rec.friends_who_watched_count * 3, 30);

  // Freshness penalty (avoid stale recommendations)
  const daysOld = (Date.now() - rec.created_at) / (1000 * 60 * 60 * 24);
  if (daysOld > 7) score -= 20;
  if (daysOld > 30) score -= 40;

  return score;
}
```

**Max Score:** ~280 points
**Typical Range:** 80-200 points

**Display Rules:**
- Only show if user has rated 3+ shows (enough data)
- Filter out shows already in user's watchlist
- Filter out dismissed recommendations (past 30 days)
- Cap at 3 per session

### Card 3: Your Friends Loved

**Scoring Factors:**
```typescript
function scoreFriendsLoved(rec: SocialRecommendation): number {
  let score = 0;

  // Number of friends who loved it (primary signal)
  score += rec.friends_count * 15; // 3-10 friends typical

  // Average compatibility of those friends
  const avgCompatibility = rec.friends.reduce((sum, f) => sum + f.compatibility_score, 0) / rec.friends.length;
  score += avgCompatibility * 0.5; // 0-50 points

  // Recency of friend ratings (not too old)
  const avgDaysAgo = rec.friends.reduce((sum, f) => {
    const days = (Date.now() - f.rated_at) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0) / rec.friends.length;

  if (avgDaysAgo < 7) score += 30;
  else if (avgDaysAgo < 30) score += 20;
  else if (avgDaysAgo < 90) score += 10;

  // Show quality (TMDB rating)
  if (rec.media.vote_average >= 8.5) score += 25;
  else if (rec.media.vote_average >= 7.5) score += 15;

  // Genre match with user's preferences
  score += rec.genre_match_score * 0.3; // 0-30 points

  // Consensus (all friends loved vs mixed)
  if (rec.friends.every(f => f.rating === 'love')) score += 20;

  return score;
}
```

**Max Score:** ~280 points
**Typical Range:** 100-220 points

**Display Rules:**
- Minimum 3 friends must have "loved" the show
- Filter out shows in user's watchlist
- Prioritize high-compatibility friends
- Cap at 5 per session

### Card 4: Coming Soon

**Scoring Factors:**
```typescript
function scoreComingSoon(release: ReleaseNotification): number {
  let score = 0;

  // Time until release (sweet spot: 2-4 weeks)
  const daysUntil = release.days_until_release;
  if (daysUntil >= 7 && daysUntil <= 30) score += 50;
  else if (daysUntil >= 1 && daysUntil < 7) score += 40; // Coming very soon
  else if (daysUntil > 30 && daysUntil <= 60) score += 30;
  else if (daysUntil > 60) score += 10; // Too far out

  // User connection to show
  if (release.user_has_previous_season) score += 80; // Watching this series
  else if (release.genre_match_score > 75) score += 50; // Loves this genre
  else score += 20; // General interest

  // Friends interest (social proof)
  score += Math.min(release.friends_want_count * 3, 40);

  // Show quality/hype
  if (release.media.vote_average >= 8.5) score += 30;
  else if (release.media.vote_average >= 7.5) score += 20;

  // Premiere type (new season of existing show > new series)
  if (release.is_season_premiere) score += 25;
  else if (release.is_series_premiere) score += 15;

  return score;
}
```

**Max Score:** ~265 points
**Typical Range:** 70-200 points

**Display Rules:**
- Only show releases 1-90 days out
- Prioritize shows user is already watching
- Filter out if user dismissed
- Cap at 2 per session
- Boost on Fridays (release day)

### Card 5: Now Streaming

**Scoring Factors:**
```typescript
function scoreNowStreaming(streaming: StreamingNotification): number {
  let score = 0;

  // Recency of availability (fresher = better)
  const daysAvailable = (Date.now() - streaming.availability_date) / (1000 * 60 * 60 * 24);
  if (daysAvailable < 3) score += 60;
  else if (daysAvailable < 7) score += 50;
  else if (daysAvailable < 14) score += 30;
  else score += 10; // Older news

  // User connection
  if (streaming.user_has_in_want_list) score += 100; // They wanted this!
  else if (streaming.genre_match_score > 75) score += 60;
  else score += 30;

  // Friends activity (social proof)
  score += Math.min(streaming.friends_watched_count * 4, 50);

  // Show quality
  if (streaming.media.vote_average >= 8.5) score += 30;
  else if (streaming.media.vote_average >= 7.5) score += 20;

  // Streaming service popularity (more likely to have access)
  const popularServices = ['Netflix', 'Hulu', 'Prime Video', 'Disney+'];
  if (popularServices.includes(streaming.service_name)) score += 15;

  // Taste match with high-compatibility friends
  const matchedFriendsWhoLoved = streaming.friends_who_watched.filter(
    f => f.compatibility_score > 75 && f.rating === 'love'
  ).length;
  score += matchedFriendsWhoLoved * 10;

  return score;
}
```

**Max Score:** ~285 points
**Typical Range:** 60-210 points

**Display Rules:**
- Only show if available within past 14 days
- Prioritize shows in user's "Want to Watch"
- Filter out if user already watched
- Cap at 2 per session
- Boost on Fridays

### Card 6: Top 3 Update

**Scoring Factors:**
```typescript
function scoreTop3Update(activity: Top3Activity): number {
  let score = 0;

  // Recency (very important for social content)
  const hoursAgo = (Date.now() - activity.created_at) / (1000 * 60 * 60);
  if (hoursAgo < 6) score += 100;
  else if (hoursAgo < 24) score += 80;
  else if (hoursAgo < 72) score += 50;
  else score += 20;

  // User closeness
  score += activity.user.compatibility_score * 0.6; // 0-60 points

  // Top 3 is curated content (boost vs regular activity)
  score += 30;

  // Rank matters (#1 > #3)
  if (activity.top_3_data.rank === 1) score += 25;
  else if (activity.top_3_data.rank === 2) score += 20;
  else score += 15;

  // Show quality
  if (activity.media.vote_average >= 8.5) score += 25;
  else if (activity.media.vote_average >= 7.5) score += 15;

  // Social proof
  score += Math.min(activity.friends_who_watched_count * 2, 30);

  // Engagement on activity (comments/likes)
  score += Math.min(activity.like_count * 3, 20);
  score += Math.min(activity.comment_count * 5, 30);

  return score;
}
```

**Max Score:** ~315 points
**Typical Range:** 80-220 points

**Display Rules:**
- Show from all followed users
- Limit to 1 per friend per day (avoid spam)
- Recent updates prioritized (past 72 hours)
- No cap (part of friend activity pool)

### Card 7: Find New Friends

**Scoring Factors:**
```typescript
function scoreFollowSuggestion(suggestion: UserSuggestion): number {
  let score = 0;

  // Compatibility (most important)
  score += suggestion.compatibility_score; // 0-100 points

  // Mutual friends (strong social signal)
  score += Math.min(suggestion.mutual_friends_count * 8, 80);

  // Activity level (active users > inactive)
  if (suggestion.watchlist_stats.total_count > 100) score += 30;
  else if (suggestion.watchlist_stats.total_count > 50) score += 20;
  else if (suggestion.watchlist_stats.total_count > 20) score += 10;

  // Recent activity (posted in past 7 days)
  if (suggestion.last_activity_date < 7 * 24 * 60 * 60 * 1000) score += 20;

  // Profile completeness (bio, avatar, top 3)
  if (suggestion.has_bio) score += 10;
  if (suggestion.has_avatar) score += 10;
  if (suggestion.has_top_3) score += 10;

  // Not too many followers (avoid celebrities, prefer real connections)
  if (suggestion.follower_count < 100) score += 15;

  return score;
}
```

**Max Score:** ~265 points
**Typical Range:** 100-220 points

**Display Rules:**
- Show 4 users per card (carousel)
- Minimum 75% compatibility score
- Filter out users already following
- Filter out users who rejected follow request
- Cap at 1 card per session
- Trigger more frequently if user has <10 follows

### Card 8: You Might Like

**Scoring Factors:**
```typescript
function scoreYouMightLike(rec: CollaborativeRecommendation): number {
  let score = 0;

  // Collaborative filtering confidence (primary signal)
  score += rec.confidence_score * 1.2; // 0-120 points

  // Number of similar users who loved it
  score += Math.min(rec.similar_users_count * 10, 60);

  // Average compatibility of similar users
  const avgCompatibility = rec.similar_users.reduce((sum, u) => sum + u.compatibility_score, 0) / rec.similar_users.length;
  score += avgCompatibility * 0.5; // 0-50 points

  // Show quality
  if (rec.media.vote_average >= 8.5) score += 30;
  else if (rec.media.vote_average >= 7.5) score += 20;

  // Genre alignment with user's preferences
  score += rec.genre_match_score * 0.4; // 0-40 points

  // Novelty (not too mainstream, not too obscure)
  const popularityScore = rec.media.popularity; // TMDB metric
  if (popularityScore > 20 && popularityScore < 100) score += 20; // Sweet spot

  // Friends who watched (secondary social proof)
  if (rec.friends_who_watched_count > 0) {
    score += Math.min(rec.friends_who_watched_count * 5, 30);
  }

  return score;
}
```

**Max Score:** ~350 points
**Typical Range:** 120-280 points

**Display Rules:**
- Only show if user has rated 10+ shows (enough data)
- Requires 3+ similar users with 75%+ match
- Filter out shows in watchlist
- Filter out dismissed recommendations
- Cap at 5 per session
- Higher confidence threshold than Card 2 (85%+ vs 70%+)

---

## Impression Tracking

### Database Table

```sql
CREATE TABLE card_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  card_type TEXT,  -- 'because_you_liked', 'friends_loved', 'coming_soon', 'you_might_like'
  media_id TEXT,
  source_media_id TEXT,  -- For Card 2: the show they liked that triggered this
  impression_count INT DEFAULT 1,
  first_shown_at TIMESTAMPTZ DEFAULT NOW(),
  last_shown_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Rules

| Card Type | Cooldown | Max Impressions |
|-----------|----------|-----------------|
| Card 2: Because You Liked | 2 days | 2 total |
| Card 3: Friends Loved | 2 days | 2 total |
| Card 4: Coming Soon | 2 days | No max (until released) |
| Card 5: Now Streaming | N/A | Until dismissed |
| Card 7: Find Friends | Per session | 1 per session |
| Card 8: You Might Like | 2 days | 2 total |

### Logic

```typescript
async function shouldShowCard(userId: string, cardType: string, mediaId: string): Promise<boolean> {
  const impression = await getImpression(userId, cardType, mediaId)
  
  if (!impression) return true  // Never shown
  
  const daysSinceShown = (Date.now() - impression.last_shown_at) / (1000 * 60 * 60 * 24)
  
  // 2-day cooldown
  if (daysSinceShown < 2) return false
  
  // Max impressions (for Cards 2, 3, 8)
  if (['because_you_liked', 'friends_loved', 'you_might_like'].includes(cardType)) {
    if (impression.impression_count >= 2) return false
  }
  
  return true
}
```

---

## Interleaving Strategy

### Goal
Avoid monotony by mixing card types. Create natural variety in the feed.

### Smart Feed Builder (Updated)

After every 2-4 activity cards, insert from another bucket. The exact interval varies slightly for natural feel.

```typescript
function buildFeed(buckets: FeedBuckets): FeedItem[] {
  const feed: FeedItem[] = []
  let activityCount = 0
  const getNextInterval = () => 2 + Math.floor(Math.random() * 3) // 2-4
  let nextInsertAt = getNextInterval()
  
  // Rotate through non-activity buckets
  const otherBuckets = ['recommendations', 'releases', 'follow']
  let bucketIndex = 0
  
  while (hasMoreContent(buckets)) {
    // Pull from activities
    if (buckets.activities.length > 0) {
      feed.push(buckets.activities.shift())
      activityCount++
    }
    
    // After 2-4 activities, insert from another bucket
    if (activityCount >= nextInsertAt) {
      const bucket = otherBuckets[bucketIndex % otherBuckets.length]
      if (buckets[bucket]?.length > 0) {
        feed.push(buckets[bucket].shift())
        bucketIndex++
      }
      activityCount = 0
      nextInsertAt = getNextInterval()
    }
  }
  
  return feed
}
    'friendActivity', 'friendActivity',
    'releases',
    'friendActivity',
    'recommendations',
    'friendActivity', 'friendActivity',
    'releases',
    'friendActivity',
    'recommendations',
    'friendActivity', 'friendActivity'
  ];

  for (const bucketName of pattern) {
    const bucket = buckets[bucketName];
    if (bucket.length > 0) {
      feed.push(bucket.shift()!);
    } else {
      // Bucket empty, pull from largest remaining bucket
      const fallback = Object.entries(buckets)
        .sort(([, a], [, b]) => b.length - a.length)[0];
      if (fallback && fallback[1].length > 0) {
        feed.push(fallback[1].shift()!);
      }
    }
  }

  return feed;
}
```

**Pattern Principles:**
1. Friend activity is baseline (most cards)
2. Recommendations scattered evenly (every 3-4 cards)
3. Follow suggestions in middle (card 9 of 20)
4. Releases at strategic points (cards 12 and 17)
5. Never more than 2 of same type in a row (except friend activity)

---

## Recommendation Engine (Phase 1: Simple)

### Card 2: Because You Liked

**Data Source:** TMDB Similar Shows API

**Algorithm:**
```typescript
async function generateBecauseYouLikedRecommendations(userId: string): Promise<Recommendation[]> {
  // 1. Get user's "like" and "love" rated shows (past 90 days)
  const userRatings = await db.ratings
    .where('user_id', userId)
    .whereIn('rating', ['like', 'love'])
    .where('created_at', '>', Date.now() - 90 * 24 * 60 * 60 * 1000)
    .orderBy('created_at', 'desc')
    .limit(20); // Top 20 recent likes/loves

  const recommendations: Recommendation[] = [];

  for (const rating of userRatings) {
    // 2. Fetch TMDB similar shows
    const tmdbSimilar = await tmdb.getSimilarShows(rating.media.tmdb_id);

    for (const similar of tmdbSimilar.results.slice(0, 5)) { // Top 5 per source
      // 3. Check if already in user's watchlist
      const inWatchlist = await db.watch_status
        .where('user_id', userId)
        .where('media_id', similar.id)
        .first();

      if (inWatchlist) continue; // Skip

      // 4. Calculate confidence score
      const genreOverlap = countGenreOverlap(rating.media, similar);
      const castOverlap = await countCastOverlap(rating.media, similar);
      const networkMatch = rating.media.network === similar.network;

      let confidenceScore = 50; // Base
      confidenceScore += genreOverlap * 10; // +10 per genre
      confidenceScore += castOverlap * 5; // +5 per actor
      if (networkMatch) confidenceScore += 15;
      if (similar.vote_average >= 7.5) confidenceScore += 10;

      // 5. Get friends context
      const friendsWhoWatched = await getFriendsWhoWatched(userId, similar.id);

      // 6. Create recommendation
      recommendations.push({
        type: 'recommendation',
        subtype: 'because_you_liked',
        source_show_id: rating.media_id,
        source_show_title: rating.media.title,
        media: await enrichMediaData(similar),
        confidence_score: Math.min(confidenceScore, 100),
        algorithm_type: 'tmdb_similar',
        friends_who_watched: friendsWhoWatched,
        created_at: new Date()
      });
    }
  }

  // 7. Deduplicate and sort by confidence
  const unique = deduplicateByMediaId(recommendations);
  return unique.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 50);
}
```

**Caching:**
- Cache TMDB similar shows for 7 days
- Regenerate user recommendations daily (background job at 2am)

### Card 3: Your Friends Loved

**Data Source:** Supabase (ratings + follows tables)

**Algorithm:**
```typescript
async function generateFriendsLovedRecommendations(userId: string): Promise<SocialRecommendation[]> {
  // 1. Get user's friends (people they follow)
  const friends = await db.follows
    .where('follower_id', userId)
    .where('status', 'accepted')
    .join('profiles', 'follows.following_id', 'profiles.id');

  // 2. Get all "love" ratings from friends (past 90 days)
  const friendLoves = await db.ratings
    .whereIn('user_id', friends.map(f => f.id))
    .where('rating', 'love')
    .where('created_at', '>', Date.now() - 90 * 24 * 60 * 60 * 1000)
    .join('media', 'ratings.media_id', 'media.id');

  // 3. Group by media_id and count
  const grouped = groupBy(friendLoves, 'media_id');

  const recommendations: SocialRecommendation[] = [];

  for (const [mediaId, ratings] of Object.entries(grouped)) {
    // 4. Must have 3+ friends who loved it
    if (ratings.length < 3) continue;

    // 5. Check if in user's watchlist
    const inWatchlist = await db.watch_status
      .where('user_id', userId)
      .where('media_id', mediaId)
      .first();

    if (inWatchlist) continue;

    // 6. Calculate genre match score
    const media = ratings[0].media;
    const genreMatchScore = await calculateGenreMatchScore(userId, media);

    // 7. Get compatibility scores for friends
    const friendsWithScores = await Promise.all(
      ratings.map(async r => ({
        ...r.user,
        rated_at: r.created_at,
        rating: 'love',
        compatibility_score: await getCompatibilityScore(userId, r.user_id)
      }))
    );

    // 8. Create recommendation
    recommendations.push({
      type: 'recommendation',
      subtype: 'friends_loved',
      media: await enrichMediaData(media),
      friends: friendsWithScores.sort((a, b) => b.compatibility_score - a.compatibility_score),
      friends_count: friendsWithScores.length,
      genre_match_score: genreMatchScore,
      created_at: new Date()
    });
  }

  return recommendations.sort((a, b) => {
    // Sort by: number of friends (primary), then genre match
    if (a.friends_count !== b.friends_count) {
      return b.friends_count - a.friends_count;
    }
    return b.genre_match_score - a.genre_match_score;
  }).slice(0, 30);
}
```

**Caching:**
- Regenerate daily (background job)
- Invalidate when friends change (follow/unfollow)

### Card 8: You Might Like (Simple Version)

**Data Source:** Taste match algorithm + friends' loves

**Algorithm:**
```typescript
async function generateYouMightLikeRecommendations(userId: string): Promise<CollaborativeRecommendation[]> {
  // 1. Find users with 75%+ taste match
  const similarUsers = await db.raw(`
    SELECT
      u.id,
      u.display_name,
      calculate_taste_match(?, u.id) as compatibility_score
    FROM profiles u
    WHERE u.id != ?
    AND u.id IN (
      SELECT user_id FROM ratings
      GROUP BY user_id
      HAVING COUNT(*) >= 10
    )
    HAVING compatibility_score >= 75
    ORDER BY compatibility_score DESC
    LIMIT 50
  `, [userId, userId]);

  // 2. Get their "love" ratings
  const theirLoves = await db.ratings
    .whereIn('user_id', similarUsers.map(u => u.id))
    .where('rating', 'love')
    .where('created_at', '>', Date.now() - 120 * 24 * 60 * 60 * 1000) // Past 4 months
    .join('media', 'ratings.media_id', 'media.id');

  // 3. Filter out shows user has seen
  const userWatchlist = await db.watch_status
    .where('user_id', userId)
    .pluck('media_id');

  const unseen = theirLoves.filter(r => !userWatchlist.includes(r.media_id));

  // 4. Group by media and count
  const grouped = groupBy(unseen, 'media_id');

  const recommendations: CollaborativeRecommendation[] = [];

  for (const [mediaId, ratings] of Object.entries(grouped)) {
    // 5. Must have 3+ similar users who loved it
    if (ratings.length < 3) continue;

    const media = ratings[0].media;

    // 6. Calculate weighted confidence score
    const usersWhoLoved = ratings.map(r => {
      const user = similarUsers.find(u => u.id === r.user_id);
      return {
        user_id: r.user_id,
        compatibility_score: user.compatibility_score,
        rating: 'love'
      };
    });

    const avgCompatibility = usersWhoLoved.reduce((sum, u) => sum + u.compatibility_score, 0) / usersWhoLoved.length;
    const confidenceScore = Math.min(avgCompatibility + (usersWhoLoved.length * 5), 100);

    // 7. Genre match
    const genreMatchScore = await calculateGenreMatchScore(userId, media);

    // 8. Friends context (optional)
    const friendsWhoWatched = await getFriendsWhoWatched(userId, mediaId);

    recommendations.push({
      type: 'recommendation',
      subtype: 'you_might_like',
      media: await enrichMediaData(media),
      confidence_score: confidenceScore,
      similar_users: usersWhoLoved,
      similar_users_count: usersWhoLoved.length,
      genre_match_score: genreMatchScore,
      friends_who_watched_count: friendsWhoWatched.length,
      algorithm_type: 'collaborative_filtering',
      created_at: new Date()
    });
  }

  return recommendations.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 50);
}
```

**Threshold:** Requires user to have rated 10+ shows

**Caching:**
- Regenerate daily
- Expensive query - cache results for 24 hours

---

## Personalization Strategy (Phase 2)

### User Engagement Tracking

Track how users interact with each card type:

```typescript
interface UserEngagementProfile {
  user_id: string;
  engagement_by_card_type: {
    [cardType: string]: {
      views: number;
      flips: number;
      interactions: number; // likes, comments, ratings, adds
      avg_time_spent: number; // seconds
      swipe_aways: number; // dismissed without interaction
      conversion_rate: number; // interactions / views
    };
  };
  preferred_genres: string[];
  preferred_networks: string[];
  active_hours: number[]; // Hours of day when most active (0-23)
  last_updated: Date;
}
```

### Adaptive Distribution

Adjust distribution ratios based on engagement:

```typescript
function getPersonalizedDistribution(userId: string): FeedDistribution {
  const profile = getUserEngagementProfile(userId);
  const base = FEED_DISTRIBUTION; // Default ratios

  // Boost card types with high engagement
  const boosted = { ...base };

  for (const [cardType, metrics] of Object.entries(profile.engagement_by_card_type)) {
    if (metrics.conversion_rate > 0.30) { // 30%+ conversion
      // Boost by 20%
      boosted[cardType] *= 1.2;
    } else if (metrics.conversion_rate < 0.10) { // <10% conversion
      // Reduce by 20%
      boosted[cardType] *= 0.8;
    }
  }

  // Normalize to 100%
  const total = Object.values(boosted).reduce((sum, val) => sum + val, 0);
  for (const key of Object.keys(boosted)) {
    boosted[key] = boosted[key] / total;
  }

  return boosted;
}
```

### Time-Based Adjustments

Show different content at different times:

```typescript
function getTimeBasedBoosts(hour: number, dayOfWeek: number): Partial<FeedDistribution> {
  const boosts: Partial<FeedDistribution> = {};

  // Fridays: More release notifications (new content day)
  if (dayOfWeek === 5) {
    boosts.comingSoon = 1.5;
    boosts.nowStreaming = 1.5;
  }

  // Weekends: More social content (people watching with friends)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    boosts.friendActivity = 1.2;
    boosts.friendsLoved = 1.3;
  }

  // Weekdays: More recommendations (planning what to watch)
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    boosts.becauseYouLiked = 1.2;
    boosts.youMightLike = 1.2;
  }

  // Evening (7pm-11pm): Peak viewing time, more releases
  if (hour >= 19 && hour <= 23) {
    boosts.nowStreaming = 1.3;
  }

  // Late night (11pm-2am): Social content (people posting)
  if (hour >= 23 || hour <= 2) {
    boosts.friendActivity = 1.3;
  }

  return boosts;
}
```

---

## Advanced Recommendation Engine (Phase 3)

### Collaborative Filtering with Matrix Factorization

**Goal:** Predict user ratings for unseen shows

**Approach:** Alternating Least Squares (ALS)

```python
# Pseudocode for future ML implementation

from pyspark.ml.recommendation import ALS

def train_als_model(ratings_df):
    """
    ratings_df: DataFrame with columns [user_id, media_id, rating]
    rating: 1 (meh), 2 (like), 3 (love)
    """

    als = ALS(
        maxIter=10,
        regParam=0.1,
        userCol="user_id",
        itemCol="media_id",
        ratingCol="rating_numeric",
        coldStartStrategy="drop"
    )

    model = als.fit(ratings_df)
    return model

def generate_ml_recommendations(user_id, model, k=50):
    """
    Generate top-k recommendations for user
    """
    user_df = spark.createDataFrame([(user_id,)], ["user_id"])
    recommendations = model.recommendForUserSubset(user_df, k)

    return recommendations.collect()[0].recommendations
```

**Integration:**
- Train model weekly on full ratings dataset
- Cache predictions for all users
- Fallback to simple algorithm if model fails

### Content-Based Filtering with Embeddings

**Goal:** Find shows similar based on plot, cast, genre

**Approach:** Sentence embeddings + cosine similarity

```python
from sentence_transformers import SentenceTransformer

def generate_show_embeddings(shows):
    """
    Create vector representation of each show
    """
    model = SentenceTransformer('all-MiniLM-L6-v2')

    embeddings = []
    for show in shows:
        # Combine metadata into text
        text = f"{show.title} {show.overview} {' '.join(show.genres)} {' '.join(show.cast)}"
        embedding = model.encode(text)
        embeddings.append((show.id, embedding))

    return embeddings

def find_similar_shows(show_id, embeddings, k=10):
    """
    Find k most similar shows using cosine similarity
    """
    from sklearn.metrics.pairwise import cosine_similarity

    target_embedding = embeddings[show_id]
    similarities = cosine_similarity([target_embedding], list(embeddings.values()))

    top_k = np.argsort(similarities[0])[-k-1:-1][::-1]
    return [show_ids[i] for i in top_k]
```

### Hybrid Recommendation System

**Combine multiple signals:**

```typescript
function generateHybridRecommendations(userId: string): Recommendation[] {
  const collaborative = getCollaborativeFilteringRecs(userId);  // 40% weight
  const contentBased = getContentBasedRecs(userId);             // 20% weight
  const social = getSocialRecommendations(userId);              // 30% weight
  const trending = getTrendingShows();                          // 10% weight

  // Combine with weights
  const combined = mergeAndWeightRecommendations([
    { recs: collaborative, weight: 0.4 },
    { recs: contentBased, weight: 0.2 },
    { recs: social, weight: 0.3 },
    { recs: trending, weight: 0.1 }
  ]);

  return combined.sort((a, b) => b.score - a.score);
}
```

---

## A/B Testing Framework (Phase 2)

### Test Variations

**Distribution Ratios:**
- Test A: 50/20/15/10/5 (baseline)
- Test B: 60/15/15/5/5 (more friend activity)
- Test C: 40/30/15/10/5 (more recommendations)

**Interleaving Patterns:**
- Pattern A: Current algorithm
- Pattern B: More recommendations upfront (front-load)
- Pattern C: Random shuffle (control)

**Recommendation Algorithms:**
- Algorithm A: TMDB similar shows
- Algorithm B: Collaborative filtering
- Algorithm C: Hybrid (both)

### Experiment Setup

```typescript
interface ABTestConfig {
  experiment_id: string;
  name: string;
  variations: Array<{
    id: string;
    name: string;
    traffic_percentage: number; // 0-100
    config: any; // Variation-specific config
  }>;
  start_date: Date;
  end_date: Date;
  metrics: string[]; // Metrics to track
  status: 'draft' | 'running' | 'completed';
}

function assignUserToVariation(userId: string, experimentId: string): string {
  // Consistent hashing for stable assignment
  const hash = hashCode(userId + experimentId);
  const bucket = hash % 100;

  const experiment = getExperiment(experimentId);
  let cumulative = 0;

  for (const variation of experiment.variations) {
    cumulative += variation.traffic_percentage;
    if (bucket < cumulative) {
      return variation.id;
    }
  }

  return experiment.variations[0].id; // Default
}
```

### Metrics to Track

**Primary:**
- Cards viewed per session
- Interaction rate (% of cards interacted with)
- Session duration
- Return rate (7-day retention)

**Secondary:**
- Flip rate
- Average time per card
- Swipe-away rate
- Watchlist additions
- Rating completions
- Follow conversions (Card 7)

**Statistical Significance:**
- Minimum 1000 users per variation
- Run for 14 days minimum
- Use two-tailed t-test (p < 0.05)

---

## Performance Considerations

### Database Query Optimization

**Indexes Required:**
```sql
-- Activity grouping
CREATE INDEX idx_activities_group_id ON activities(activity_group_id);
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);

-- Recommendations
CREATE INDEX idx_ratings_user_rating_created ON ratings(user_id, rating, created_at DESC);
CREATE INDEX idx_watch_status_user_media ON watch_status(user_id, media_id);

-- Friends context
CREATE INDEX idx_follows_follower ON follows(follower_id) WHERE status = 'accepted';
CREATE INDEX idx_ratings_media_rating ON ratings(media_id, rating);

-- Taste match
CREATE INDEX idx_ratings_user_media ON ratings(user_id, media_id);
```

### Materialized Views

**Friends Ratings Summary:**
```sql
CREATE MATERIALIZED VIEW friends_ratings_summary AS
SELECT
  media_id,
  user_id as friend_id,
  COUNT(*) FILTER (WHERE rating = 'meh') as meh_count,
  COUNT(*) FILTER (WHERE rating = 'like') as like_count,
  COUNT(*) FILTER (WHERE rating = 'love') as love_count
FROM ratings
GROUP BY media_id, user_id;

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY friends_ratings_summary;
```

### Caching Strategy

**Redis Cache Keys:**
```
feed:user:{userId}:recs:because_you_liked   (TTL: 24h)
feed:user:{userId}:recs:friends_loved       (TTL: 24h)
feed:user:{userId}:recs:you_might_like      (TTL: 24h)
feed:user:{userId}:follow_suggestions       (TTL: 7d)
feed:global:releases:upcoming               (TTL: 6h)
feed:global:streaming:new                   (TTL: 6h)
tmdb:similar:{tmdbId}                       (TTL: 7d)
tmdb:show:{tmdbId}                          (TTL: 7d)
user:{userId}:compatibility:{otherUserId}   (TTL: 7d)
```

**Cache Invalidation:**
- User ratings change → Invalidate recommendation caches
- User follows/unfollows → Invalidate friends caches
- Show releases → Invalidate release caches

### Background Jobs (Cron)

```typescript
// Daily at 2:00 AM (low traffic)
cron.schedule('0 2 * * *', async () => {
  await generateRecommendationsForAllUsers();
  await refreshMaterializedViews();
  await cleanupOldDismissedRecommendations(); // Delete 30+ day old
});

// Daily at 6:00 AM (before morning usage)
cron.schedule('0 6 * * *', async () => {
  await checkUpcomingReleases();
  await checkNewStreamingContent();
  await updateTasteMatchScores();
});

// Weekly on Sundays at 3:00 AM
cron.schedule('0 3 * * 0', async () => {
  await retrainMLModels(); // If ML is implemented
  await cleanupOldActivities(); // Archive >90 day old
  await optimizeDatabaseIndexes();
});
```

---

## Monitoring & Analytics

### Algorithm Performance Metrics

**Track via PostHog:**
```typescript
// When card is viewed
analytics.track('feed_card_viewed', {
  card_type: 'recommendation',
  card_subtype: 'because_you_liked',
  score: 165, // Internal score
  position: 5, // Position in feed
  media_id: 'tv-12345-s3'
});

// When user interacts
analytics.track('feed_card_interaction', {
  card_type: 'recommendation',
  interaction_type: 'add_to_watchlist',
  time_to_interaction: 12.5, // Seconds from view to interaction
  was_flipped: true
});

// When recommendation is dismissed
analytics.track('feed_card_dismissed', {
  card_type: 'recommendation',
  card_subtype: 'because_you_liked',
  source_show: 'Breaking Bad',
  recommended_show: 'Better Call Saul'
});
```

### Dashboard Metrics

**Daily Review:**
- Distribution ratio actuals vs targets
- Conversion rate per card type
- Average session length
- Cards viewed per session
- User retention (7-day)

**Weekly Review:**
- Recommendation acceptance rate
- Follow suggestion conversion
- Genre distribution in recommendations
- Quality scores (TMDB ratings) in feed
- User growth from Card 7

**Monthly Review:**
- A/B test results
- Algorithm performance trends
- Content diversity metrics
- User satisfaction (surveys)

---

## Success Criteria

### Phase 1 Launch (Weeks 1-10)
- ✅ All 8 card types rendering correctly
- ✅ Distribution ratios adhered to (±5%)
- ✅ Recommendations generated for 100% of users
- ✅ Feed loads in < 2 seconds
- ✅ 0 critical bugs

### Month 1 Post-Launch
- 🎯 10+ cards viewed per session (vs 5-7 baseline)
- 🎯 25%+ recommendation interaction rate
- 🎯 15%+ increase in watchlist additions
- 🎯 10%+ increase in friend follows (from Card 7)
- 🎯 50%+ user retention at 7 days

### Month 3 Post-Launch
- 🎯 30%+ recommendation interaction rate
- 🎯 20%+ increase in rating completions
- 🎯 60%+ user retention at 7 days
- 🎯 5+ return visits per week per active user
- 🎯 User satisfaction score > 4/5

### Month 6 (Maturity)
- 🎯 Advanced ML recommendations live
- 🎯 Personalized distribution working
- 🎯 A/B testing framework deployed
- 🎯 70%+ user retention at 30 days
- 🎯 Platform growth to 10,000+ users

---

## Future Enhancements

### Phase 4: Advanced Features
1. **Real-time Personalization:** Adjust feed during session based on behavior
2. **Contextual Recommendations:** "Watch with [Friend]" suggestions
3. **Temporal Patterns:** "Shows trending this weekend"
4. **Mood-Based Discovery:** "Feeling happy? Try these comedies"
5. **Watch Party Integration:** Group viewing recommendations

### Phase 4.5: Onboarding & Engagement Cards (Future)

Special card types to encourage engagement and network building without requiring explicit onboarding flows:

1. **"Rate Your First Show" Card**
   - Appears after user adds first show to watchlist
   - Gentle prompt: "What did you think of [Show]?"
   - Helps algorithm understand preferences

2. **Progress Nudge Cards**
   - "3 friends are watching Severance - follow them to see more"
   - Shows friends who share taste to encourage follows
   - Personalized based on user's watch history

3. **Achievement Cards**
   - "You've rated 5 shows! Here's what we recommend based on your taste"
   - Milestone celebrations that unlock features
   - Gamification without being pushy

4. **Network Building Cards**
   - "Your friend Sarah just joined - welcome them!"
   - "5 users with 90%+ match discovered this week"
   - Social proof to encourage exploration

5. **First Steps Cards**
   - "Add a show to get personalized recommendations"
   - "Complete your profile to help friends find you"
   - Contextual guidance without blocking flow

**Implementation Notes:**
- Cards appear contextually based on user state
- Never block the feed - always optional
- Track engagement to avoid fatigue
- A/B test card frequency and messaging

### Phase 5: ML Sophistication
1. **Deep Learning Embeddings:** Better content understanding
2. **Reinforcement Learning:** Optimize for long-term engagement
3. **Multi-Armed Bandits:** Dynamic distribution optimization
4. **Graph Neural Networks:** Leverage social graph structure
5. **Explainable AI:** "Why this recommendation?" insights

---

## Related Documentation

- [Enhanced Feed Architecture](/docs/features/enhanced-feed-architecture.md)
- [Card Type Specifications](/docs/features/card-type-specifications.md)
- [Component Library Spec](/docs/design/component-library-spec.md)

---

**Maintained by:** Data Science & Engineering Teams
**Questions?** See [Been Watching Documentation Index](/docs/README.md)

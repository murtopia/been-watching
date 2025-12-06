# Feed Cards Implementation Plan

**Created:** December 2024  
**Status:** Ready for Implementation

## Overview

This document outlines the implementation plan for all 8 feed card types, including data sources, impression tracking, and the smart feed builder algorithm.

---

## Card Status Summary

| Card | Name | Status | Data Source |
|------|------|--------|-------------|
| 1 | User Activity | ✅ Working | `activities` table |
| 2 | Because You Liked | 🔨 To Build | TMDB Similar API |
| 3 | Your Friends Loved | 🔨 To Build | `ratings` table (friends) |
| 4 | Coming Soon | 🔨 To Build | TMDB `next_episode_to_air` |
| 5 | Now Streaming | 🔨 To Build | `show_reminders` table |
| 6 | Top 3 Update | ⚠️ Needs Fix | `activities` table (missing activity creation) |
| 7 | Find New Friends | ✅ Working | `profiles` + suggestions |
| 8 | You Might Like | 🔨 To Build | Taste match algorithm |

---

## New Database Tables

### card_impressions

Tracks when recommendation cards are shown to prevent spam.

```sql
CREATE TABLE card_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  media_id TEXT NOT NULL,
  source_media_id TEXT,  -- For Card 2: the show that triggered this rec
  impression_count INT DEFAULT 1,
  first_shown_at TIMESTAMPTZ DEFAULT NOW(),
  last_shown_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_type, media_id)
);

CREATE INDEX idx_card_impressions_user ON card_impressions(user_id, card_type);
```

### show_reminders

Stores reminders set from Card 4 bell icon, triggers Card 5.

```sql
CREATE TABLE show_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  season_number INT,
  air_date DATE NOT NULL,
  reminder_set_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,  -- When notification was sent
  dismissed_at TIMESTAMPTZ,  -- When user dismissed Card 5
  UNIQUE(user_id, media_id, season_number)
);

CREATE INDEX idx_show_reminders_user ON show_reminders(user_id);
CREATE INDEX idx_show_reminders_date ON show_reminders(air_date);
```

---

## Impression Tracking Rules

| Card Type | Cooldown | Max Impressions | Notes |
|-----------|----------|-----------------|-------|
| Card 2 | 2 days | 2 total | Never show again after 2 |
| Card 3 | 2 days | 2 total | Never show again after 2 |
| Card 4 | 2 days | No max | Keep showing until released |
| Card 5 | N/A | 1 | Shows until dismissed |
| Card 7 | Per session | 1 | Already implemented |
| Card 8 | 2 days | 2 total | Never show again after 2 |

---

## Card Implementation Details

### Card 2: Because You Liked

**Data Flow:**
```
User's liked/loved shows (ratings table)
    ↓
TMDB Similar Shows API for each
    ↓
Filter: exclude user's watchlist + impression limits
    ↓
Display with badge: "Because You Liked [Source Show]"
```

**Implementation:**
```typescript
async function fetchBecauseYouLiked(userId: string): Promise<Card2Data[]> {
  // 1. Get user's liked shows (past 90 days)
  const likedShows = await supabase
    .from('ratings')
    .select('media_id, rating, media:media_id(title, tmdb_data)')
    .eq('user_id', userId)
    .in('rating', ['like', 'love'])
    .order('created_at', { ascending: false })
    .limit(10)

  // 2. Get excluded media IDs
  const excluded = await getUserExcludedMediaIds(userId)

  // 3. Get valid impressions (not shown in 2 days, count < 2)
  const validImpressions = await getValidImpressions(userId, 'because_you_liked')

  // 4. For each liked show, fetch TMDB similar
  const recommendations = []
  for (const show of likedShows) {
    const similar = await tmdb.getSimilarShows(show.media.tmdb_data.id)
    for (const rec of similar.results) {
      if (!excluded.has(rec.id) && validImpressions.has(rec.id)) {
        recommendations.push({
          media: rec,
          sourceShow: show.media.title,
          cardType: 'because_you_liked'
        })
      }
    }
  }

  return recommendations
}
```

### Card 3: Your Friends Loved

**Data Flow:**
```
User's friends (follows table)
    ↓
Their "love" ratings (ratings table)
    ↓
Group by media_id, filter to 3+ friends
    ↓
Filter: exclude user's watchlist + impression limits
    ↓
Display with friend avatars
```

### Card 4: Coming Soon

**Scope:** TV shows only (movies excluded for now)

**Data Flow:**
```
User's TV shows from watchlist
    ↓
Check TMDB for next_episode_to_air with future date
    ↓
Filter: not shown in last 2 days
    ↓
Display with "Coming Soon on [Date]"
```

**Bell Icon Action:** Save to `show_reminders` table

### Card 5: Now Streaming

**Trigger:** `show_reminders` where `air_date <= today` AND `notified_at IS NULL`

**Actions:**
1. Create Card 5 in feed
2. Insert notification into `notifications` table
3. Update `notified_at` timestamp
4. **Notification tap:** Opens show as card overlay (like /myshows)

### Card 6: Top 3 Update

**Fix Required:** Add activity creation to `TopShowModal.tsx`

```typescript
// After saving to profile, create activity
await supabase.from('activities').insert({
  user_id: userId,
  media_id: mediaData.id,
  activity_type: 'top_spot_updated',
  activity_data: { 
    top_spot_rank: slotNumber,
    action: previousShow ? 'replaced' : 'added'
  }
})
```

### Card 8: You Might Like (Taste Match)

**Algorithm:**
1. Calculate taste match scores between users (rating overlap)
2. Find users with 75%+ match
3. Get shows they loved that current user hasn't seen
4. Display with match percentage

**Implementation:**
```typescript
async function calculateTasteMatch(userA: string, userB: string): Promise<number> {
  // Get shows both users have rated
  const aRatings = await getRatingsMap(userA)
  const bRatings = await getRatingsMap(userB)
  
  let matches = 0
  let total = 0
  
  for (const [mediaId, ratingA] of aRatings) {
    if (bRatings.has(mediaId)) {
      total++
      const ratingB = bRatings.get(mediaId)
      if (ratingA === ratingB) matches += 1.0  // Exact
      else if (Math.abs(ratingA - ratingB) === 1) matches += 0.5  // Close
    }
  }
  
  return total > 0 ? (matches / total) * 100 : 0
}
```

**Requirements:**
- User needs 10+ ratings
- Need 3+ similar users (75%+ match) who loved the show

---

## Smart Feed Builder

After every 2-4 activity cards, insert from another bucket (rotating).

```typescript
function buildFeed(buckets: FeedBuckets): FeedItem[] {
  const feed: FeedItem[] = []
  let activityCount = 0
  const getInterval = () => 2 + Math.floor(Math.random() * 3) // 2-4
  let nextInsertAt = getInterval()
  
  const otherBuckets = ['recommendations', 'releases', 'follow']
  let bucketIndex = 0
  
  while (hasMoreContent(buckets)) {
    if (buckets.activities.length > 0) {
      feed.push(buckets.activities.shift())
      activityCount++
    }
    
    if (activityCount >= nextInsertAt && hasOtherContent(buckets)) {
      const bucket = otherBuckets[bucketIndex % otherBuckets.length]
      if (buckets[bucket]?.length > 0) {
        feed.push(buckets[bucket].shift())
        bucketIndex++
      }
      activityCount = 0
      nextInsertAt = getInterval()
    }
  }
  
  return feed
}
```

---

## Global Exclusion Filter

Shows user has interacted with should never appear in Cards 2, 3, or 8.

```typescript
async function getUserExcludedMediaIds(userId: string): Promise<Set<string>> {
  const { data: watchStatus } = await supabase
    .from('watch_status')
    .select('media_id')
    .eq('user_id', userId)
  
  const { data: ratings } = await supabase
    .from('ratings')
    .select('media_id')
    .eq('user_id', userId)
  
  return new Set([
    ...(watchStatus?.map(w => w.media_id) || []),
    ...(ratings?.map(r => r.media_id) || [])
  ])
}
```

---

## Files to Modify

1. **`app/feed/page.tsx`** - Fetch all card types, impression tracking, feed builder
2. **`utils/tmdb.ts`** - Add `getSimilarShows()` function
3. **`utils/feedDataTransformers.ts`** - Transformers for Cards 2-5, 8
4. **`components/profile/TopShowModal.tsx`** - Add activity creation for Card 6
5. **New migrations** - `card_impressions`, `show_reminders` tables
6. **New utility** - `calculateTasteMatch()` function

---

## Implementation Order

1. Database migrations (card_impressions, show_reminders)
2. TMDB getSimilarShows() utility
3. getUserExcludedMediaIds() utility
4. Card 2: Because You Liked
5. Card 3: Your Friends Loved
6. Card 4: Coming Soon + bell icon
7. Card 5: Now Streaming + notification
8. Card 6: Fix activity creation
9. Card 8: Taste match algorithm
10. Smart feed builder integration
11. Testing all card types

---

## Related Documentation

- [Card Type Specifications](./card-type-specifications.md)
- [Feed Algorithm Strategy](./feed-algorithm-strategy.md)
- [Feed Card Architecture](../design/FEED-CARD-ARCHITECTURE.md)


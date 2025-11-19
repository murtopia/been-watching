# Enhanced Feed: Card Type Specifications

**Version:** 1.0
**Last Updated:** January 2025
**Status:** In Development

## Overview

The Enhanced Activity Feed features **8 distinct card types**, each designed to serve specific user needs: staying connected with friends, discovering new shows, tracking releases, and finding new connections. This document provides complete specifications for each card type.

---

## Card Template Summary

### Three Design Templates

| Template | Used By | Key Features |
|----------|---------|--------------|
| **Template A** | Cards 1, 6 | User header, activity bubbles, comments tab, like button |
| **Template B** | Cards 2, 3, 4, 5, 8 | Type-specific badge, friend avatars, no comments tab |
| **Template C** | Card 7 | Unique carousel, no flip, follow buttons |

### Two Back Types

| Back Type | Used By | Key Features |
|-----------|---------|--------------|
| **Back A** | Cards 1, 2, 3, 5, 6, 8 | Standard show details: synopsis, cast, friends watching, ratings, comments, similar shows |
| **Back B** | Card 4 | Coming Soon variant: only shows "Want to Watch" friends, adds reminder bell |

---

##

 Card 1: User Activity

### Purpose
Display when a friend rates a show or adds/moves it between watchlists. This is the core social engagement card that keeps users connected to their friends' viewing activity.

### Display Rules

**Card is created when:**
1. User A rates a show (meh, like, love)
2. User A adds a show to a watchlist (want, watching, watched)
3. User A moves a show from one watchlist to another

**Activity Grouping:**
- If a rating AND watchlist change happen within **10 seconds**, combine into single activity card
- Examples:
  - "Sarah loved and added Breaking Bad to Watching"
  - "Mike rated The Bear as meh and moved it to Watched"
- Grouped activities share same `activity_group_id` in database

**Who sees this card:**
- Users who follow User A
- (Optional) All users if admin setting `feed_show_all_users` is enabled

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │ ← Flip button (top-right)
│                             │
│    POSTER BACKGROUND        │ ← Show poster, full-bleed
│    with gradient overlay    │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Avatar] Sarah Miller   │ │ ← User header
│ │ 2 hours ago             │ │
│ │                         │ │
│ │ The Bear - Season 3     │ │ ← Show title
│ │ 2024 • Drama • ⭐ 8.7   │ │ ← Metadata
│ │                         │ │
│ │ [Activity Bubbles]      │ │ ← "loved" + "currently watching"
│ │ [👤👤👤] 5 friends...   │ │ ← Social proof
│ └─────────────────────────┘ │
│                      [❤️]   │ ← Side actions
│                      [+]    │   (like, add, comment)
│                      [💬]   │
└─────────────────────────────┘
```

**Activity Bubbles:**
- Rating badge: "loved" (pink), "liked" (blue), "meh" (gray)
- Status badge: "want to watch", "currently watching", "watched"
- Maximum 2 bubbles (rating + status)

**Social Proof:**
- Friend avatars (3 visible, max 24px each)
- Text: "5 friends watched this" or "12 friends loved this"

**Side Actions:**
1. **Heart (❤️):** Like this activity
   - State: Outline (default), Filled pink (liked)
   - Liking means "I like that you did this"
2. **Plus (+):** Quick action modal (rate/add to watchlist)
3. **Comment (💬):** Opens comments tab on this activity

**Comments Tab:**
- Slides up from bottom when comment icon tapped
- Semi-transparent dark background with blur
- Max height: 70% of card
- Contains:
  - "X Comments" header
  - Scrollable comment list
  - Comment input field (280 char limit with counter)
  - "Post Comment" button

### Card Back

**Type:** Back A (Standard Show Details)

**Sections (top to bottom):**
1. **Header**
   - Show title (22px bold)
   - Metadata (2024 • Drama • 8 episodes)
   - Badges: [S3] [TV] [HBO] [▶ Trailer]

2. **Synopsis**
   - 3 lines collapsed with "Read more →"
   - Expandable to full text

3. **Action Icons**
   - Plus (+): Opens quick action modal
   - Comment (💬): Scrolls to show comments section
   - Share: Share functionality (hide for Phase 1)

4. **Info Grid**
   - Creator: Vince Gilligan
   - Genre: Drama, Comedy
   - Director, Runtime, etc.

5. **Cast**
   - Pill buttons with actor names
   - Horizontal scrollable if many

6. **Friends Watching**
   - 3 expandable categories:
     - [👤👤👤] 8 friends watching
     - [👤👤👤] 12 friends want to watch
     - [👤👤👤] 42 friends watched
   - Click to expand and see full list

7. **Friends Ratings**
   - Three rating icons: 😐 Meh, 👍 Like, ❤️ Love
   - Badge counts on each
   - Active rating highlighted with pink border (current user's rating)

8. **Show Comments**
   - "Comment on this show" input (280 char limit)
   - Scrollable comments list
   - Each comment has Like button with count
   - "Load More Comments" button

9. **Similar Shows**
   - Horizontal scroll carousel
   - 100×150px poster cards
   - Click opens MediaDetailModal (Phase 2: Navigate to card)

### Data Requirements

```typescript
interface Card1Data {
  // Core Activity
  id: string;
  activity_type: 'rated' | 'status_changed';
  activity_data: {
    rating?: 'meh' | 'like' | 'love';
    status?: 'want' | 'watching' | 'watched';
    previous_status?: 'want' | 'watching' | 'watched'; // For moves
  };
  activity_group_id?: string; // If grouped with another action
  created_at: string;

  // User Who Posted
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };

  // Media (Full TMDB Data)
  media: {
    id: string; // 'tv-12345-s3' or 'movie-67890'
    tmdb_id: number;
    media_type: 'tv' | 'movie';
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date: string;
    vote_average: number;
    tmdb_data: {
      season_number?: number;
      number_of_episodes?: number;
      created_by?: Array<{ id: number; name: string }>;
      genres?: Array<{ id: number; name: string }>;
      networks?: Array<{ id: number; name: string; logo_path: string }>;
      cast?: Array<{ name: string; character: string; profile_path: string }>;
      videos?: { results: Array<{ key: string; type: string; site: string }> };
      similar?: { results: Array<{ id: number; title: string; poster_path: string }> };
    };
  };

  // Social Engagement (Activity Comments/Likes)
  like_count: number;
  comment_count: number;
  user_liked: boolean; // Has current user liked this activity?
  comments: Array<{
    id: string;
    user_id: string;
    comment_text: string;
    created_at: string;
    user: {
      display_name: string;
      avatar_url: string;
    };
    like_count: number;
    user_liked: boolean;
  }>;
  likes: Array<{
    id: string;
    user: {
      id: string;
      display_name: string;
      avatar_url: string;
    };
  }>;

  // Friends Context
  friends_who_acted: Array<{
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    action: 'watched' | 'loved' | 'want'; // What they did
    timestamp: string;
  }>;
  friends_count_text: string; // "5 friends watched this"

  // Friends Ratings (for back side)
  friends_ratings_summary: {
    meh: { count: number; users: Array<string> }; // user_ids
    like: { count: number; users: Array<string> };
    love: { count: number; users: Array<string> };
  };

  // Friends by Status (for back side)
  friends_by_status: {
    watching: Array<{
      user: { id: string; display_name: string; avatar_url: string };
      timestamp: string;
    }>;
    want: Array<{ user: any; timestamp: string }>;
    watched: Array<{ user: any; timestamp: string }>;
  };

  // Current User State
  user_rating: 'meh' | 'like' | 'love' | null;
  user_status: 'want' | 'watching' | 'watched' | null;

  // Show Comments (for back side - different from activity comments)
  show_comments: Array<{
    id: string;
    user: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
    comment_text: string;
    created_at: string;
    like_count: number;
    user_liked: boolean;
  }>;
}
```

### User Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| **Tap Card** | Anywhere on card (except buttons) | No action (passive viewing) |
| **Tap Menu (•••)** | Top-right button | Flip card to back side |
| **Tap Heart** | Side action | Toggle like on activity, update count |
| **Tap Plus** | Side action | Open quick action modal (rate/add to watchlist) |
| **Tap Comment** | Side action | Slide up comments tab |
| **Post Comment** | In comments tab | Add comment to activity, update count |
| **Like Comment** | Heart on comment | Toggle like on comment |
| **Tap Close (X)** | On card back | Flip back to front |
| **Scroll Back** | On card back | Scroll through show details |
| **Tap Trailer** | Back side badge | Open trailer modal (YouTube embed) |
| **Tap Cast Member** | Back side pill | Open actor detail modal (Phase 2) |
| **Tap Friends Watching** | Back side category | Expand to show full friend list |
| **Tap Rating Icon** | Back side | Set user's rating (opens modal if not rated) |
| **Post Show Comment** | Back side input | Add comment to show itself |
| **Tap Similar Show** | Back side carousel | Open MediaDetailModal (Phase 2: Navigate to card) |

---

## Card 2: Because You Liked

### Purpose
Algorithmic recommendation to help users discover new shows based on their existing likes/loves. Personalized content discovery without social pressure.

### Display Rules

**Card is created when:**
1. User has rated a show as "like" or "love"
2. TMDB has similar shows for that media
3. Similar show is NOT already in user's watchlist
4. User hasn't dismissed this recommendation before

**Frequency:**
- Appears in feed at 20% distribution (AI Recommendations pool)
- Maximum 3 "Because You Liked" cards per feed session
- Prioritize recent likes (past 30 days)

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │
│                             │
│    POSTER BACKGROUND        │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Badge: Purple Gradient]│ │ ← "Because You Liked Breaking Bad"
│ │                         │ │
│ │ Better Call Saul - S1   │ │
│ │ 2015 • Drama • ⭐ 8.9   │ │
│ │                         │ │
│ │ [👤👤👤] 8 friends...   │ │ ← Social proof (if applicable)
│ └─────────────────────────┘ │
│                      [+]    │ ← Side actions
│                      [↗]   │   (add, share)
└─────────────────────────────┘
```

**NO User Header** (system-generated)
**NO Heart Icon** (can't like a recommendation)
**NO Comment Icon on Front** (will be added to template)

**Badge:**
- Purple gradient background: `rgba(168, 85, 247, 0.25)`
- Text: "Because You Liked [Source Show Title]"
- Font size: 13px, white text

**Social Proof (Optional):**
- If friends also watched: "8 friends watched this"
- If no friends: omit this line

### Card Back

**Type:** Back A (Standard Show Details)

Same as Card 1 back, with one difference:
- **No activity comments** (this is not an activity post)
- Show comments still present

### Data Requirements

```typescript
interface Card2Data {
  type: 'recommendation';
  subtype: 'because_you_liked';
  id: string;

  // Recommendation Metadata
  recommendation_data: {
    source_show_id: string;
    source_show_title: string;
    algorithm_type: 'genre_match' | 'cast_overlap' | 'network_match' | 'tmdb_similar';
    confidence_score: number; // 0-100
    created_at: string;
  };

  // Media (Full TMDB Data - same as Card 1)
  media: { /* Same structure as Card 1 */ };

  // Current User State
  user_rating: 'meh' | 'like' | 'love' | null;
  user_status: 'want' | 'watching' | 'watched' | null;

  // Social Context (Light)
  friends_who_watched_count: number;
  friends_who_watched: Array<{
    user: { id: string; display_name: string; avatar_url: string };
    rating?: 'meh' | 'like' | 'love';
  }>;

  // Back Side Data (same as Card 1)
  friends_ratings_summary: { /* ... */ };
  friends_by_status: { /* ... */ };
  show_comments: Array<{ /* ... */ }>;
}
```

### User Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| **Tap Menu (•••)** | Top-right button | Flip card to back side |
| **Tap Plus** | Side action | Open quick action modal (rate/add to watchlist) |
| **Tap Comment** | Side action (TO ADD) | Open show comments section on back |
| **Tap Share** | Side action | Share functionality (hide for Phase 1) |
| **Swipe Away** | Vertical swipe without interaction | Dismiss recommendation (track event) |
| *(All back-side interactions same as Card 1)* |

---

## Card 3: Your Friends Loved

### Purpose
Social proof recommendation. Show the user content their friends have highly rated to leverage trust and social influence.

### Display Rules

**Card is created when:**
1. 3+ friends have rated a show as "love"
2. Show is NOT already in user's watchlist
3. User hasn't dismissed this recommendation before

**Frequency:**
- Appears in feed at 15% distribution (Social Recommendations pool)
- Prioritize shows with most friends who loved it
- Prioritize recent friend activity (past 60 days)

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │
│                             │
│    POSTER BACKGROUND        │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Badge: Pink Gradient]  │ │ ← "Your Friends Loved This"
│ │ [👤👤👤👤👤]           │ │ ← Friend avatars (up to 5)
│ │                         │ │
│ │ Succession - Season 4   │ │
│ │ 2023 • Drama • ⭐ 9.1   │ │
│ │                         │ │
│ │ 12 friends loved this   │ │ ← Count of all friends
│ └─────────────────────────┘ │
│                      [+]    │
│                      [↗]   │
└─────────────────────────────┘
```

**Badge:**
- Pink gradient background: `rgba(255, 59, 92, 0.25)`
- Text: "Your Friends Loved This"
- Font size: 13px, white text

**Friend Avatars:**
- Show up to 5 friend avatars (24×24px, overlapping)
- Pick friends with highest compatibility scores first
- 1.5px white border on each

**Friend Count:**
- Text: "12 friends loved this"
- If only 3 friends: "3 friends loved this"

### Card Back

**Type:** Back A (Standard Show Details)

Same as Card 1 back.

### Data Requirements

```typescript
interface Card3Data {
  type: 'recommendation';
  subtype: 'friends_loved';
  id: string;

  // Friends Who Loved It
  friends: Array<{
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    rating: 'love'; // All must be 'love' for this card
    rated_at: string;
    compatibility_score: number; // For sorting
  }>;
  friends_count: number;

  // Media (Full TMDB Data)
  media: { /* Same as Card 1 */ };

  // Current User State
  user_rating: string | null;
  user_status: string | null;

  // Back Side Data
  friends_ratings_summary: { /* ... */ };
  friends_by_status: { /* ... */ };
  show_comments: Array<{ /* ... */ }>;
}
```

### User Interactions

Same as Card 2, plus:
- **Tap Friend Avatar:** Opens friend's profile (Phase 2)

---

## Card 4: Coming Soon / New Season Alert

### Purpose
Build anticipation for upcoming releases. Help users discover new shows or remember when new seasons of shows they like are dropping.

### Display Rules

**Card is created when:**
1. Show has a confirmed release date in the next 90 days
2. Show is relevant to user:
   - New season of show in user's watchlist, OR
   - New show in genre user loves (80%+ of ratings), OR
   - New show friends are excited about (5+ friends have it in "Want to Watch")
3. User hasn't dismissed this release notification

**Frequency:**
- Appears in feed at 10% distribution (Release Notifications pool)
- More frequent on Fridays (new release day)
- Maximum 2 release cards per feed session

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │
│                             │
│    POSTER BACKGROUND        │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Badge: Purple + Clock] │ │ ← "Coming Soon on Mar 15, 2025"
│ │                         │ │
│ │ Stranger Things - S5    │ │
│ │ 2025 • Sci-Fi • 10 eps  │ │
│ │                         │ │
│ │ [👤👤👤] 23 friends...  │ │ ← "23 friends want to watch this"
│ └─────────────────────────┘ │
│                      [🔖]   │ ← Side actions
│                      [🔔]   │   (bookmark, remind me)
└─────────────────────────────┘
```

**Badge:**
- Purple gradient with clock icon
- Text: "Coming Soon on [Date]" or "Coming in 5 Days"
- Font size: 13px

**Social Proof:**
- "23 friends want to watch this"
- Only show friends with status = "want"

**Side Actions:**
1. **Bookmark (🔖):** Add to "Want to Watch" (one-click, no modal)
2. **Bell (🔔):** Remind Me (sets notification reminders)

**NO Plus Icon** (replaced by bookmark)
**NO Comment Icon**
**NO Share Icon**

### Card Back

**Type:** Back B (Coming Soon Variant)

**Differences from Back A:**
1. **Action Icons:**
   - Plus icon → Bookmark icon (Want to Watch only)
   - Bell icon added (Remind Me)
   - Comment/Share icons remain

2. **Friends Watching:**
   - Only show "Want to Watch" category
   - Hide "Watching" and "Watched" (show not released yet)

3. **Release Info Section** (New)
   - Release date countdown: "Releases in 23 days"
   - Episode count: "10 episodes"
   - Streaming service (if known): "On Netflix"

All other sections same as Back A.

### Data Requirements

```typescript
interface Card4Data {
  type: 'release_notification';
  subtype: 'coming_soon';
  id: string;

  // Release Data
  release_data: {
    release_date: string; // ISO date
    days_until_release: number;
    season_number?: number;
    episode_count?: number;
    is_series_premiere: boolean;
    is_season_premiere: boolean;
    streaming_service?: string; // 'Netflix', 'HBO', etc.
  };

  // Media (Full TMDB Data)
  media: { /* Same as Card 1 with season-specific poster */ };

  // Friends Context (Want to Watch Only)
  friends_want_to_watch: Array<{
    user: { id: string; display_name: string; avatar_url: string };
    added_at: string;
  }>;
  friends_want_count: number;

  // Current User State
  user_status: 'want' | 'watching' | 'watched' | null;
  user_notification_enabled: boolean; // Has user set reminder?

  // Back Side Data (Limited)
  friends_ratings_summary: { /* (will be empty until release) */ };
  friends_by_status: {
    want: Array<{ /* ... */ }>;
    // watching/watched omitted
  };
  show_comments: Array<{ /* ... */ }>;
}
```

### User Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| **Tap Menu (•••)** | Top-right button | Flip card to back side |
| **Tap Bookmark** | Side action | Add to "Want to Watch" (one-click, no modal) |
| **Tap Bell** | Side action | Open reminder settings modal |
| **Set Reminder** | In modal | Schedule notifications (1 week before, 1 day before, release day) |
| *(Back-side interactions similar to Card 1, minus watching/watched friends)* |

---

## Card 5: Now Streaming

### Purpose
Alert users when shows they might like become available on streaming platforms. Helps with content discovery and reduces decision fatigue.

### Display Rules

**Card is created when:**
1. Show recently added to streaming platform (past 7 days)
2. Show is relevant to user:
   - In user's "Want to Watch" list, OR
   - Friends with 75%+ match score loved it, OR
   - Genre user frequently watches
3. User hasn't dismissed this notification

**Frequency:**
- Appears in feed at 10% distribution (Release Notifications pool)
- More frequent on Fridays (new content day)

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │
│                             │
│    POSTER BACKGROUND        │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Badge: Purple + TV]    │ │ ← "Now Streaming on Netflix"
│ │ [Netflix Logo]          │ │ ← Service logo (optional)
│ │                         │ │
│ │ The Last of Us - S2     │ │
│ │ 2025 • Action • ⭐ 9.0  │ │
│ │                         │ │
│ │ [👤👤👤] 15 friends...  │ │ ← "15 friends watched this"
│ └─────────────────────────┘ │
│                      [+]    │
│                      [↗]   │
└─────────────────────────────┘
```

**Badge:**
- Purple gradient with TV icon
- Text: "Now Streaming on [Service]"
- Font size: 13px

**Service Logo:**
- Optional 40×20px logo (Netflix, HBO, Hulu, etc.)
- Positioned below badge

**Social Proof:**
- "15 friends watched this"
- Only show friends who have status = "watched" or rating

### Card Back

**Type:** Back A (Standard Show Details)

Same as Card 1 back, with one addition:
- **Streaming Info Section** (before Info Grid)
  - "Available on Netflix"
  - "Added 3 days ago"
  - "Watch Now" button (opens streaming service - Phase 2)

### Data Requirements

```typescript
interface Card5Data {
  type: 'streaming_notification';
  subtype: 'now_streaming';
  id: string;

  // Streaming Data
  streaming_data: {
    service_name: 'Netflix' | 'Hulu' | 'Prime Video' | 'HBO Max' | 'Disney+' | string;
    service_logo_path?: string; // URL to logo
    availability_date: string;
    availability_region: string; // 'US', 'UK', etc.
    is_new_to_service: boolean;
    watch_url?: string; // Deep link (Phase 2)
  };

  // Media (Full TMDB Data)
  media: { /* Same as Card 1 */ };

  // Friends Context
  friends_who_watched: Array<{
    user: { id: string; display_name: string; avatar_url: string };
    watched_at: string;
    rating?: 'meh' | 'like' | 'love';
  }>;
  friends_watched_count: number;

  // Current User State
  user_rating: string | null;
  user_status: string | null;

  // Back Side Data
  friends_ratings_summary: { /* ... */ };
  friends_by_status: { /* ... */ };
  show_comments: Array<{ /* ... */ }>;
}
```

### User Interactions

Same as Card 2, plus:
- **Tap "Watch Now"** (Phase 2): Deep link to streaming service

---

## Card 6: Top 3 Update

### Purpose
Social engagement around friends' curated lists. Shows when a friend updates their Top 3 featured shows on their profile, creating conversation starters.

### Display Rules

**Card is created when:**
1. User A adds or replaces a show in their Top 3 list
2. Change is published (not draft)
3. Current user follows User A

**Frequency:**
- Appears in feed at 50% distribution (Friend Activity pool)
- Less frequent than regular activity (max 1 per friend per day)

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │
│                             │
│    POSTER BACKGROUND        │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Avatar] Mike Thompson  │ │ ← User header
│ │ 1 day ago               │ │
│ │                         │ │
│ │ [Badge: Gold + Trophy]  │ │ ← "Updated Top 3"
│ │ Added to #1 Top Show!   │ │ ← Activity text
│ │                         │ │
│ │ The Wire - Complete     │ │
│ │ 2002 • Drama • ⭐ 9.3   │ │
│ │                         │ │
│ │ [👤👤👤] 89 friends...  │ │
│ └─────────────────────────┘ │
│                      [❤️]   │ ← Same as Card 1
│                      [+]    │   (like, add, comment)
│                      [💬]   │
└─────────────────────────────┘
```

**Badge:**
- Gold gradient with trophy icon
- Background: `linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3))`
- Text: "Updated Top 3"

**Activity Text:**
- "Added to #1 Top Show!"
- "Added to #2 Top Show!"
- "Added to #3 Top Show!"
- "Replaced #1 Top Show!"

**Design Note:** Card 6 uses Template A (same as Card 1) - only difference is the gold badge and activity text.

### Card Back

**Type:** Back A (Standard Show Details)

Same as Card 1 back.

**Optional Enhancement (Phase 2):**
- Show all 3 shows in Top 3 list
- Highlight which one changed
- Link to friend's full profile

### Data Requirements

```typescript
interface Card6Data {
  type: 'activity';
  subtype: 'top_3_update';
  id: string;

  // User Who Posted
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };

  // Top 3 Data
  top_3_data: {
    list_id: string;
    rank: 1 | 2 | 3; // Which position changed
    action: 'added' | 'replaced';
    previous_show_id?: string; // If replaced
    updated_at: string;
  };

  // Media (Featured Show - Full TMDB Data)
  media: { /* Same as Card 1 */ };

  // Social Engagement (Same as Card 1)
  like_count: number;
  comment_count: number;
  user_liked: boolean;
  comments: Array<{ /* ... */ }>;
  likes: Array<{ /* ... */ }>;

  // Friends Context
  friends_who_acted: Array<{ /* ... */ }>;
  friends_count_text: string;

  // Current User State
  user_rating: string | null;
  user_status: string | null;

  // Back Side Data (Same as Card 1)
  friends_ratings_summary: { /* ... */ };
  friends_by_status: { /* ... */ };
  show_comments: Array<{ /* ... */ }>;
}
```

### User Interactions

Same as Card 1 (it's Template A).

---

## Card 7: Find New Friends

### Purpose
User discovery and network growth. Suggest people to follow based on taste match, mutual friends, and similar viewing habits.

### Display Rules

**Card is created when:**
1. User has fewer than 10 follows (need more connections), OR
2. User has engaged with 20+ cards without following anyone (re-engage), OR
3. New highly compatible users have joined (75%+ match)

**Frequency:**
- Appears in feed at 5% distribution (Follow Suggestions pool)
- Maximum 1 per feed session
- Each card shows 4 suggested users in carousel

### Card Front

**UNIQUE DESIGN - No flip functionality**

**Visual Elements:**
```
┌─────────────────────────────┐
│ [🔗] Find New Friends       │ ← Badge at top
│                             │
│ ┌───────────────────────┐   │
│ │ ┌─────────────────────┐│  │
│ │ │  [Profile Photo]    ││  │ ← User card (carousel)
│ │ │                     ││  │
│ │ │  Jamie Chen         ││  │
│ │ │  @jamiechen         ││  │
│ │ │  [FOLLOW] button    ││  │
│ │ │                     ││  │
│ │ │  92% Match          ││  │ ← Large, prominent
│ │ │                     ││  │
│ │ │  "Loves sci-fi and  ││  │ ← Bio (2 lines)
│ │ │   dark comedies..." ││  │
│ │ │                     ││  │
│ │ │  5 Want | 14 Watching│  │ ← Stats grid
│ │ │     187 Watched      │  │
│ │ │                     ││  │
│ │ │  [👤👤👤] 8 mutual ││  │ ← Friends in common
│ │ └─────────────────────┘│  │
│ └───────────────────────┘   │
│                             │
│      • ━ • • •              │ ← Carousel dots (4 users)
└─────────────────────────────┘
```

**Container:**
- Yellow gradient outer border: `rgba(255, 215, 0, 0.2)`
- Dark glassmorphic user cards: `rgba(20, 20, 20, 0.98)`

**Badge:**
- Link chain icon + "Find New Friends"
- Top of card, centered

**User Card (per suggested user):**
1. **Profile Photo:** 90×90px circular
2. **Name + Username:** Display name (16px bold), @username (13px)
3. **Follow Button:**
   - Default state: Pink background `#FF6B6B`, "FOLLOW"
   - Following state: Gray border, "FOLLOWING"
   - Toggles on tap
4. **Match Percentage:** Large (32px), bold, gradient color
5. **Bio:** 2 lines truncated, 13px
6. **Stats Grid:** 3 values (Want/Watching/Watched counts)
7. **Mutual Friends:** Avatar stack (3 visible) + "8 mutual friends"

**Carousel Behavior:**
- Swipe left/right to navigate
- Auto-rotates every 6 seconds (pauses on interaction)
- Dots indicate position (filled = current)
- Shows 1 user at a time

### Data Requirements

```typescript
interface Card7Data {
  type: 'follow_suggestions';
  id: string;

  // Array of Suggested Users (4 max)
  suggested_users: Array<{
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    bio: string; // Truncate to 80 chars

    // Match Data
    compatibility_score: number; // 0-100
    match_reasons: Array<string>; // ['Similar taste in dramas', 'Both loved Breaking Bad']

    // Watchlist Stats
    watchlist_stats: {
      want_to_watch_count: number;
      watching_count: number;
      watched_count: number;
    };

    // Mutual Friends
    mutual_friends: Array<{
      user_id: string;
      username: string;
      display_name: string;
      avatar_url: string;
    }>; // Limited to 3 for display
    mutual_friends_count: number; // Total count

    // Follow State
    is_following: boolean;
    follow_request_pending: boolean; // If they're private
  }>;

  // Total suggestions available
  total_suggestions: number;
}
```

### User Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| **Swipe Left/Right** | Touch gesture | Navigate carousel |
| **Tap Follow** | Follow button | Follow user, button → "FOLLOWING" |
| **Tap Profile Photo** | User avatar | Navigate to user's profile page |
| **Tap Username** | @username text | Navigate to user's profile page |
| **Tap Mutual Friends** | Avatar stack | Open modal with full mutual friends list |
| **Tap Dot** | Carousel indicator | Jump to that user |
| **Auto-rotate** | Every 6 seconds | Next user (pauses on interaction) |

**NO Flip:** This card doesn't flip (unique design).

---

## Card 8: You Might Like

### Purpose
Advanced algorithmic recommendation based on taste match with similar users. Helps users discover shows they wouldn't find otherwise.

### Display Rules

**Card is created when:**
1. User has rated 10+ shows (enough data for algorithm)
2. System finds users with 75%+ taste match score
3. Matched user loved a show current user hasn't seen
4. Show is not already in user's watchlist

**Frequency:**
- Appears in feed at 20% distribution (AI Recommendations pool)
- Shares distribution pool with Card 2
- Prioritize high-confidence recommendations (85%+ match scores)

### Card Front

**Visual Elements:**
```
┌─────────────────────────────┐
│ [Menu •••]                  │
│                             │
│    POSTER BACKGROUND        │
│                             │
├─────────────────────────────┤
│ Glassmorphic Content Area   │
│ ┌─────────────────────────┐ │
│ │ [Badge: Blue Gradient]  │ │ ← "You Might Like This"
│ │ [✨] 87% Match          │ │ ← Match score (prominent)
│ │                         │ │
│ │ Fleabag - Season 1      │ │
│ │ 2016 • Comedy • ⭐ 8.7  │ │
│ │                         │ │
│ │ Based on users like you │ │ ← Algorithm explanation
│ └─────────────────────────┘ │
│                      [+]    │
│                      [↗]   │
└─────────────────────────────┘
```

**Badge:**
- Blue gradient background: `rgba(59, 130, 246, 0.25)`
- Text: "You Might Like This"
- Font size: 13px

**Match Score:**
- Large sparkles icon (✨)
- Match percentage (87%)
- Font: 18px, bold

**Algorithm Explanation:**
- "Based on users like you"
- "Users with similar taste loved this"
- Builds trust in recommendation

**Template:** Template B (same as Cards 2, 3, 5)

### Card Back

**Type:** Back A (Standard Show Details)

Same as Card 1 back.

### Data Requirements

```typescript
interface Card8Data {
  type: 'recommendation';
  subtype: 'you_might_like';
  id: string;

  // Recommendation Metadata
  recommendation_data: {
    algorithm_type: 'collaborative_filtering' | 'taste_match';
    confidence_score: number; // 0-100 (match percentage)
    similar_users: Array<{
      user_id: string;
      compatibility_score: number;
      rating: 'love'; // What they rated this show
    }>;
    match_explanation: string; // "Based on users like you"
    created_at: string;
  };

  // Media (Full TMDB Data)
  media: { /* Same as Card 1 */ };

  // Current User State
  user_rating: string | null;
  user_status: string | null;

  // Social Context (Optional)
  friends_who_watched_count?: number;

  // Back Side Data
  friends_ratings_summary: { /* ... */ };
  friends_by_status: { /* ... */ };
  show_comments: Array<{ /* ... */ }>;
}
```

### User Interactions

Same as Card 2.

---

## Card 9: Shared Show (FUTURE)

### Purpose
Direct peer-to-peer show recommendations. When a friend explicitly shares a show with you via native share or in-app share.

### Status
**Planned for Phase 2 - Not in initial release**

### Display Rules (Proposed)

**Card is created when:**
1. User A clicks Share icon on a card
2. Chooses to share with User B (direct message or native share)
3. User B receives notification
4. Card appears at top of User B's feed

### Card Front (Proposed)

Similar to Card 1 (Template A), but with:
- Badge: "Shared by [Friend Name]"
- Optional personal message from sender
- Higher priority in feed (always near top)

### Future Considerations
- Deep linking to specific card
- Share via SMS, email, or in-app
- Track conversion (did recipient watch it?)
- Thank/react to share

**Note:** Share icons are hidden in Phase 1 until this feature is fully designed.

---

## Summary Tables

### Card Distribution

| Card Type | Distribution | Frequency Cap |
|-----------|--------------|---------------|
| Card 1: User Activity | 50% | No limit |
| Card 2: Because You Liked | 20% | 3 per session |
| Card 3: Friends Loved | 15% | 5 per session |
| Card 4: Coming Soon | 10% | 2 per session |
| Card 5: Now Streaming | 10% | 2 per session |
| Card 6: Top 3 Update | 50% | 1 per friend per day |
| Card 7: Find New Friends | 5% | 1 per session |
| Card 8: You Might Like | 20% | 5 per session |

**Distribution Pool Totals:**
- Friend Activity (Cards 1, 6): 50%
- AI Recommendations (Cards 2, 8): 20%
- Social Recommendations (Card 3): 15%
- Release Notifications (Cards 4, 5): 10%
- Follow Suggestions (Card 7): 5%

### Template Usage

| Template | Cards | Key Features |
|----------|-------|--------------|
| **A** | 1, 6 | User header, comments tab, activity bubbles, like button |
| **B** | 2, 3, 4, 5, 8 | Type-specific badge, friend avatars, no comments tab, no like button |
| **C** | 7 | Carousel, no flip, follow buttons, match percentage |

### Back Type Usage

| Back Type | Cards | Differences |
|-----------|-------|-------------|
| **A** | 1, 2, 3, 5, 6, 8 | Standard show details: full friends watching, all interactions |
| **B** | 4 | Coming Soon variant: only "Want to Watch" friends, bookmark + bell icons |

---

## Character Limits

**Enforced across all card types:**
- Show comments: 280 characters
- Activity comments: 280 characters
- Bio (Card 7): 280 characters (displayed truncated at 80 chars)
- Show notes: 280 characters (future feature)

**Display Format:**
- Character counter: "X/280"
- Real-time count updates
- Prevent submission over limit
- Visual indicator at 260+ characters (warning color)

---

## Next Steps

1. Review this spec with stakeholders
2. Create design mockups for any unclear interactions
3. Build data models in TypeScript
4. Implement feed algorithm distribution logic
5. Build card templates (3 components)
6. Test with sample data
7. Iterate based on feedback

---

**Related Documentation:**
- [Enhanced Feed Architecture](/docs/features/enhanced-feed-architecture.md)
- [Feed Algorithm Strategy](/docs/features/feed-algorithm-strategy.md)
- [Component Library Spec](/docs/design/component-library-spec.md)

**Maintained by:** Product & Engineering Teams
**Last Review:** January 2025

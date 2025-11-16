# Enhanced Activity Feed - Implementation Documentation

**Last Updated**: January 2025  
**Status**: Partially Implemented - Ready for Completion  
**Architecture**: Next.js 15 (App Router) + Supabase PostgreSQL

---

## Table of Contents

1. [Overview](#overview)
2. [Goals & Objectives](#goals--objectives)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Status](#implementation-status)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Components](#components)
8. [Background Jobs](#background-jobs)
9. [Key Features](#key-features)
10. [What's Been Implemented](#whats-been-implemented)
11. [What Still Needs Work](#what-still-needs-work)
12. [Testing Guide](#testing-guide)
13. [Deployment Notes](#deployment-notes)
14. [Future Enhancements](#future-enhancements)

---

## Overview

The Enhanced Activity Feed transforms the simple chronological activity list into a personalized, recommendation-driven experience. The feed now includes:

- **Grouped Activities**: Related activities (rating + status change) combined into single feed items
- **Personalized Recommendations**: AI-powered suggestions based on user preferences
- **Release Notifications**: Notifications for upcoming TV seasons, movie releases, and streaming availability
- **Infinite Scroll**: Paginated feed with automatic loading
- **Admin Controls**: Toggle between showing all users vs. only followed users
- **Smart Filtering**: User's own activities excluded from feed

---

## Goals & Objectives

### Primary Goals
1. ✅ Remove trending section (replaced with personalized content)
2. ✅ Aggregate related activities within 1-minute window
3. ✅ Exclude user's own activities from feed
4. ✅ Add personalized recommendations
5. ✅ Add release notifications (TV seasons, movies, streaming)
6. ✅ Implement infinite scroll pagination
7. ✅ Create admin toggle for feed visibility

### User Experience Goals
- Reduce feed clutter by grouping related actions
- Increase engagement through personalized recommendations
- Keep users informed about releases they care about
- Improve discoverability of new content

---

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **External APIs**: TMDB (The Movie Database) for media data
- **Deployment**: Vercel

### Data Flow
```
User Action (Rate/Status) 
  → Database Trigger 
  → Activity Creation/Aggregation 
  → Feed API Query 
  → Feed Page Component 
  → ActivityCard/RecommendationCard/ReleaseNotificationCard
```

### Feed Composition Algorithm
1. Fetch activities (grouped by `activity_group_id`)
2. Fetch recommendations (interleaved every 5th position)
3. Fetch release notifications (interleaved every 10th position)
4. Merge and sort chronologically
5. Apply pagination (limit/offset)
6. Return unified feed items

---

## Implementation Status

### ✅ Completed

#### Phase 1: Database Schema ✅
- ✅ Activity grouping table and columns
- ✅ Recommendations table
- ✅ Release notifications table (with streaming support)
- ✅ Admin settings table
- ✅ Ad slots table (foundation)
- ✅ Activity aggregation triggers (1-minute window)

#### Phase 2: API Routes ✅
- ✅ `/api/feed` - Unified feed endpoint with pagination
- ✅ `/api/recommendations` - Recommendations endpoint
- ✅ `/api/releases/upcoming` - Release notifications endpoint
- ✅ `/api/releases/upcoming` POST - Mark release as seen

#### Phase 3: Core Components ✅
- ✅ `RecommendationCard.tsx` - Recommendation display component
- ✅ `ReleaseNotificationCard.tsx` - Release notification component
- ✅ `ActivityCard.tsx` - Updated for grouped activities
- ✅ `app/feed/page.tsx` - Updated to use new API, infinite scroll
- ✅ `app/admin/settings/page.tsx` - Admin feed toggle

#### Phase 4: Utilities ✅
- ✅ `utils/recommendation-engine.ts` - Collaborative + content-based filtering
- ✅ `utils/release-notification-service.ts` - TMDB polling and notification creation

#### Phase 5: Background Jobs ✅
- ✅ `scripts/generate-recommendations.ts` - Recommendation generation script
- ✅ `scripts/check-upcoming-releases.ts` - Release checking script

### ⚠️ Partially Completed

#### Phase 6: Feed Features
- ✅ Trending section removed from UI
- ⚠️ Activity aggregation triggers created but may need testing/tuning
- ✅ Infinite scroll implemented
- ✅ Feed filtering (exclude own activities) implemented
- ✅ Admin toggle created

### ❌ Not Yet Implemented

#### Phase 7: Background Job Automation
- ❌ Cron job setup for recommendation generation (daily at 2 AM)
- ❌ Cron job setup for release checking (daily at 6 AM)
- ❌ Supabase Edge Functions or external cron service integration

#### Phase 8: Testing & Optimization
- ❌ Unit tests for recommendation engine
- ❌ Integration tests for feed API
- ❌ Performance testing with large datasets
- ❌ Recommendation accuracy validation

---

## Database Schema

### New Tables

#### `activity_groups`
Groups related activities together.
```sql
CREATE TABLE activity_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_activity_groups_user_media` on `(user_id, media_id)`

#### `recommendations`
Stores personalized recommendations for each user.
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id),
  score REAL NOT NULL,
  algorithm_type TEXT CHECK (algorithm_type IN ('collaborative', 'content_based', 'hybrid')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shown_at TIMESTAMPTZ,
  interacted_at TIMESTAMPTZ,
  UNIQUE(user_id, media_id)
);
```

**Indexes:**
- `idx_recommendations_user_score` on `(user_id, score DESC)`
- `idx_recommendations_user_shown` on `(user_id, shown_at)`

#### `release_notifications`
Stores release notifications for TV seasons, movies, and streaming availability.
```sql
CREATE TABLE release_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id),
  season_number INTEGER,
  release_date DATE NOT NULL,
  notification_type TEXT CHECK (notification_type IN (
    'announcement', 
    'week_before', 
    'day_of', 
    'theatrical_release', 
    'streaming_available'
  )),
  streaming_service TEXT, -- e.g., 'Netflix', 'Max', 'Apple TV+'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ
);
```

**Indexes:**
- `idx_release_notifications_user_date` on `(user_id, release_date)`
- `idx_release_notifications_media` on `(media_id)`
- `idx_release_notifications_type` on `(notification_type)`

#### `admin_settings`
Application-wide settings controlled by administrators.
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);
```

**Default Settings:**
- `feed_show_all_users`: `'true'` - Controls whether feed shows all users or only followed users

**RLS Policies:**
- Everyone can SELECT (needed for feed filtering)
- Only admins can INSERT/UPDATE (checks `profiles.is_admin`)

#### `ad_slots` (Foundation)
Future ad placement system.
```sql
CREATE TABLE ad_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL, -- e.g., 'feed_top', 'feed_middle', 'feed_bottom'
  media_id TEXT REFERENCES media(id),
  advertiser_id UUID,
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Modified Tables

#### `activities`
Added `activity_group_id` column:
```sql
ALTER TABLE activities 
ADD COLUMN activity_group_id UUID REFERENCES activity_groups(id) ON DELETE SET NULL;

CREATE INDEX idx_activities_group_id ON activities(activity_group_id);
```

### Database Triggers

#### Activity Aggregation Triggers
Located in: `supabase/migrations/add-activity-aggregation-triggers.sql`

**Function**: `handle_rating_activity()`
- Triggered on `ratings` INSERT
- Checks for recent `status_changed` activity (< 1 minute) on same media
- Groups activities via `activity_group_id` if found

**Function**: `handle_watch_status_activity()`
- Triggered on `watch_status` INSERT/UPDATE
- Checks for recent `rated` activity (< 1 minute) on same media
- Groups activities via `activity_group_id` if found
- Only creates activity if status actually changed

**Time Window**: 1 minute (configurable in trigger function)

---

## API Endpoints

### GET `/api/feed`

Unified feed endpoint that returns activities, recommendations, and release notifications.

**Query Parameters:**
- `limit` (optional, default: 20) - Number of items to return
- `offset` (optional, default: 0) - Pagination offset

**Authentication**: Required (user must be logged in)

**Response Format:**
```json
{
  "items": [
    {
      "type": "activity",
      "id": "uuid",
      "groupKey": "uuid",
      "activityTypes": ["rated", "status_changed"],
      "activityData": [
        {"rating": "love"},
        {"status": "want"}
      ],
      "user": {
        "id": "uuid",
        "username": "john_doe",
        "display_name": "John Doe",
        "avatar_url": "https://..."
      },
      "media": {
        "id": "tv-123",
        "title": "Breaking Bad",
        "poster_path": "/path.jpg",
        "vote_average": 9.5,
        "release_date": "2008-01-20",
        "media_type": "tv"
      },
      "created_at": "2025-01-31T12:00:00Z",
      "like_count": 12,
      "comment_count": 3,
      "user_liked": true
    },
    {
      "type": "recommendation",
      "id": "uuid",
      "score": 0.85,
      "algorithm_type": "hybrid",
      "reason": "Because you loved Breaking Bad",
      "media": { /* media object */ },
      "created_at": "2025-01-31T11:00:00Z"
    },
    {
      "type": "release_notification",
      "id": "uuid",
      "season_number": 2,
      "release_date": "2025-03-17",
      "notification_type": "week_before",
      "streaming_service": null,
      "media": { /* media object */ },
      "created_at": "2025-01-31T10:00:00Z"
    }
  ],
  "limit": 20,
  "offset": 0,
  "hasMore": true,
  "total": 45
}
```

**Feed Filtering Logic:**
1. Always excludes current user's activities: `WHERE activities.user_id != current_user_id`
2. Checks `admin_settings` table for `feed_show_all_users` setting
3. If `true`: Shows all users' activities
4. If `false`: Shows only activities from followed users (`WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = current_user_id AND status = 'accepted')`)

**Interleaving Algorithm:**
- Recommendations: Every 5th position
- Release notifications: Every 10th position
- Activities fill remaining positions

**Sorting:**
- Primary: Chronological (newest first) by `created_at`
- Grouped activities sorted by most recent activity in group

### GET `/api/recommendations`

Returns personalized recommendations for the authenticated user.

**Query Parameters:**
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "media_id": "tv-456",
      "score": 0.92,
      "algorithm_type": "hybrid",
      "reason": "Liked by 3 similar users + Similar to your favorites: 2 genres",
      "media": { /* media object */ },
      "created_at": "2025-01-31T10:00:00Z",
      "shown_at": null,
      "interacted_at": null
    }
  ],
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

**Behavior:**
- Updates `shown_at` timestamp when recommendations are fetched
- Orders by `score DESC`
- Filters out media user has already watched/rated

### GET `/api/releases/upcoming`

Returns upcoming release notifications for the authenticated user.

**Query Parameters:**
- `limit` (optional, default: 20)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "releases": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "media_id": "tv-123",
      "season_number": 2,
      "release_date": "2025-03-17",
      "notification_type": "week_before",
      "streaming_service": null,
      "media": { /* media object */ },
      "created_at": "2025-01-31T10:00:00Z",
      "seen_at": null
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "media_id": "movie-789",
      "season_number": null,
      "release_date": "2025-02-15",
      "notification_type": "streaming_available",
      "streaming_service": "Netflix",
      "media": { /* media object */ },
      "created_at": "2025-01-31T09:00:00Z",
      "seen_at": null
    }
  ],
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

**Filters:**
- Only returns releases with `release_date >= today`
- Orders by `release_date ASC`
- Groups by `media_id` (handled in service, not API)

### POST `/api/releases/upcoming`

Marks a release notification as seen.

**Request Body:**
```json
{
  "notificationId": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Security:**
- Only allows updating user's own notifications
- Validates `user_id` matches authenticated user

---

## Components

### `components/feed/ActivityCard.tsx`

Displays individual activity items in the feed.

**Props:**
```typescript
interface ActivityCardProps {
  activity: {
    id: string
    user: { username: string; display_name: string; avatar_url?: string }
    media: { /* media object */ }
    activity_type: 'rated' | 'status_changed' | 'commented'
    activity_data: any
    created_at: string
    like_count: number
    comment_count: number
    user_liked: boolean
    comments?: any[]
    likes?: any[]
  }
  activityTypes?: string[] // For grouped activities
  activityData?: any[] // For grouped activities
  onLike: (activityId: string) => void
  onComment: (activityId: string, comment: string) => void
  onDeleteComment?: (commentId: string) => void
  onQuickRate?: (mediaId: string, rating: string) => void
  onQuickStatus?: (mediaId: string, status: string) => void
  onUserClick?: (username: string) => void
  onMediaClick?: (media: any) => void
  userRating?: string | null
  userStatus?: string | null
  currentUserId?: string
}
```

**Features:**
- ✅ Handles grouped activities (multiple `activityTypes`/`activityData`)
- ✅ Shows combined action text: "loved and added to Want to Watch"
- ✅ Quick rate buttons (Meh, Like, Love) - **NOTE: Currently missing from component but exists in mockups**
- ✅ Quick status buttons (Want to Watch, Watching, Watched) - **NOTE: Currently missing from component but exists in mockups**
- ✅ Expandable comments section
- ✅ Expandable likes section
- ✅ Comment reporting/flagging (dropdown menu with Report option)
- ✅ Media badges (TV/Movie, network, trailer)
- ✅ Overview text with "Read more" expand/collapse
- ✅ Double-tap poster to like

**Current State:**
- ✅ Grouped activity display working
- ✅ Comments/likes expandable sections working
- ✅ Comment moderation (delete/report) working
- ❌ Quick rate/status buttons **NOT YET IMPLEMENTED** (but props exist)

### `components/feed/RecommendationCard.tsx`

Displays personalized recommendations.

**Props:**
```typescript
interface RecommendationCardProps {
  recommendation: {
    id: string
    score: number
    algorithm_type: string
    reason: string
    media: { /* media object */ }
    user_rating?: string | null
    user_status?: string | null
  }
  onAddToWantToWatch?: (mediaId: string) => void
  onRate?: (mediaId: string, rating: string) => void
  onDismiss?: (recommendationId: string) => void
  onMediaClick?: (media: any) => void
}
```

**Features:**
- ✅ "For You" badge
- ✅ Recommendation reason display
- ✅ Media poster and info
- ✅ "Add to Want to Watch" button
- ✅ "Rate if Seen" button
- ✅ "Dismiss" button
- ✅ Gradient yellow/orange styling

### `components/feed/ReleaseNotificationCard.tsx`

Displays release notifications for TV seasons, movies, and streaming availability.

**Props:**
```typescript
interface ReleaseNotificationCardProps {
  release: {
    id: string
    season_number?: number
    release_date: string
    notification_type: 'announcement' | 'week_before' | 'day_of' | 'theatrical_release' | 'streaming_available'
    streaming_service?: string
    media: { /* media object */ }
    user_status?: string | null
  }
  onAddToWantToWatch?: (mediaId: string) => void
  onMarkSeen?: (releaseId: string) => void
  onMediaClick?: (media: any) => void
}
```

**Features:**
- ✅ Dynamic badges based on notification type:
  - TV Season: "📺 Season X"
  - Theatrical Release: "🎬 In Theaters"
  - Streaming: "🎬 Now Streaming"
- ✅ Countdown display (days until release or "Available Now")
- ✅ Streaming service badge (for streaming notifications)
- ✅ "Add to Want to Watch" button
- ✅ "Mark as seen" button
- ✅ Gradient purple styling

### `app/feed/page.tsx`

Main feed page component.

**Key Features:**
- ✅ Uses `/api/feed` endpoint (no direct Supabase queries)
- ✅ Infinite scroll with Intersection Observer
- ✅ Pagination state management (`offset`, `hasMore`)
- ✅ Enriches feed items with comments/likes/user ratings
- ✅ Handles different feed item types (activity, recommendation, release)
- ✅ Refresh feed after user actions (like, comment, rate, status)
- ✅ Removed trending section
- ✅ Loading states and empty states

**State Management:**
```typescript
const [feedItems, setFeedItems] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [hasMore, setHasMore] = useState(true)
const [offset, setOffset] = useState(0)
```

**Key Functions:**
- `loadFeed(reset: boolean)` - Fetches feed items from API
- `handleLike(activityId)` - Likes/unlikes activity, refreshes feed
- `handleComment(activityId, comment)` - Posts comment, refreshes feed
- `handleQuickRate(mediaId, rating)` - Quick rate action, refreshes feed
- `handleQuickStatus(mediaId, status)` - Quick status action, refreshes feed
- `handleDismissRecommendation(recommendationId)` - Dismisses recommendation
- `handleMarkReleaseSeen(releaseId)` - Marks release notification as seen

**Infinite Scroll:**
- Uses `IntersectionObserver` API
- Observes `#feed-sentinel` element
- Loads more when sentinel is visible and `hasMore === true`

### `app/admin/settings/page.tsx`

Admin panel for feed settings.

**Features:**
- ✅ Toggle for `feed_show_all_users` setting
- ✅ Reads current setting from `admin_settings` table
- ✅ Updates setting via Supabase upsert
- ✅ Admin-only access (checks `profiles.is_admin`)

**Setting Values:**
- `'true'` - Show all users' activities in feed
- `'false'` - Show only followed users' activities

---

## Background Jobs

### Recommendation Generation

**File**: `scripts/generate-recommendations.ts`

**Purpose**: Generate personalized recommendations for all users.

**Algorithm:**
1. Find similar users (cosine similarity on ratings)
2. Collaborative filtering (media liked by similar users)
3. Content-based filtering (genre/cast/keyword matching)
4. Hybrid scoring (combines both methods)
5. Save top 50 recommendations per user

**Usage:**
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Run script
npx tsx scripts/generate-recommendations.ts
```

**Recommended Schedule**: Daily at 2 AM

**Status**: ✅ Script created, ❌ Cron job not configured

### Release Notification Checking

**File**: `scripts/check-upcoming-releases.ts`

**Purpose**: Check for upcoming releases and create notifications.

**Checks:**
1. **TV Seasons**: For shows user has watched (`status='watched'`)
   - Polls TMDB `/tv/{id}` endpoint
   - Finds next season
   - Creates notifications: `announcement`, `week_before`, `day_of`

2. **Movie Theatrical Releases**: Upcoming movies
   - Polls TMDB `/movie/upcoming` endpoint
   - Filters popular movies (vote_average >= 7.0)
   - Creates `theatrical_release` notifications

3. **Streaming Availability**: Movies user has watched
   - Polls TMDB `/movie/{id}/watch/providers` endpoint
   - Checks for new streaming services
   - Creates `streaming_available` notifications with `streaming_service` field

**Usage:**
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
export NEXT_PUBLIC_TMDB_API_KEY="your-tmdb-key"

# Run script
npx tsx scripts/check-upcoming-releases.ts
```

**Recommended Schedule**: Daily at 6 AM

**Status**: ✅ Script created, ❌ Cron job not configured

### Cron Job Setup Options

#### Option 1: Vercel Cron Jobs
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-recommendations",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/check-releases",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Then create API routes:
- `app/api/cron/generate-recommendations/route.ts`
- `app/api/cron/check-releases/route.ts`

#### Option 2: Supabase Edge Functions
Create edge functions and schedule via Supabase dashboard.

#### Option 3: External Cron Service
Use services like:
- GitHub Actions (scheduled workflows)
- EasyCron
- Cron-job.org

---

## Key Features

### 1. Activity Aggregation

**How It Works:**
- When a user rates a show AND changes status within 1 minute, activities are grouped
- Database trigger (`handle_rating_activity` / `handle_watch_status_activity`) detects related activities
- Creates `activity_group` record and links activities via `activity_group_id`
- Feed API groups activities by `activity_group_id` before returning

**Display:**
- Grouped activities show combined text: "Sarah Miller loved and added Breaking Bad to Want to Watch"
- Single activity shows: "Sarah Miller loved Breaking Bad"

**Time Window**: 1 minute (configurable in trigger function)

### 2. Feed Filtering

**User's Own Activities:**
- Always excluded from feed
- Query: `WHERE activities.user_id != current_user_id`

**All Users vs. Followed Users:**
- Controlled by `admin_settings.feed_show_all_users`
- If `true`: Shows all users' activities
- If `false`: Shows only followed users (`WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = current_user_id AND status = 'accepted')`)

**Admin Toggle:**
- Located at `/admin/settings`
- Only accessible to users with `profiles.is_admin = true`

### 3. Recommendation Algorithm

**Collaborative Filtering:**
- Finds similar users using cosine similarity on ratings
- Recommends media liked by similar users
- Weighted by similarity score and rating type (love > like)

**Content-Based Filtering:**
- Analyzes user's loved shows
- Extracts genres, cast, keywords
- Recommends media with similar attributes
- Scores based on attribute overlap

**Hybrid Scoring:**
- Combines collaborative (60% weight) + content-based (40% weight)
- Normalizes scores to 0-1 range
- Provides reason combining both methods

**Recommendation Reasons:**
- Collaborative: "Liked by 3 similar users"
- Content-based: "Similar to your favorites: 2 genres, 1 actor"
- Hybrid: "Liked by 3 similar users + Similar to your favorites: 2 genres"

### 4. Release Notifications

**TV Season Notifications:**
- Checks shows user has watched (`watch_status.status = 'watched'` AND `media_type = 'tv'`)
- Polls TMDB for next season release date
- Creates notifications at different time windows:
  - `announcement`: > 7 days before release
  - `week_before`: 1-7 days before release
  - `day_of`: Day of release

**Movie Theatrical Releases:**
- Polls TMDB `/movie/upcoming` endpoint
- Filters popular movies (vote_average >= 7.0)
- Creates `theatrical_release` notifications for movies releasing in next 30 days

**Streaming Availability:**
- Checks movies user has watched (`watch_status.status = 'watched'` AND `media_type = 'movie'`)
- Polls TMDB `/movie/{id}/watch/providers` endpoint
- Detects when movie becomes available on streaming services
- Creates `streaming_available` notification with `streaming_service` field

**Notification Types:**
- `announcement` - TV season announced (> 7 days out)
- `week_before` - TV season releasing soon (1-7 days)
- `day_of` - TV season releasing today
- `theatrical_release` - Movie opening in theaters
- `streaming_available` - Movie now on streaming

### 5. Feed Interleaving

**Positioning:**
- Recommendations: Every 5th position (items 4, 9, 14, 19, ...)
- Release notifications: Every 10th position (items 9, 19, 29, ...)
- Activities: Fill remaining positions

**Logic:**
```typescript
// Recommendations every 5th position
recommendations.forEach((rec, index) => {
  const position = (index + 1) * 5 - 1
  if (position < feedItems.length) {
    feedItems.splice(position, 0, recommendationItem)
  }
})

// Releases every 10th position
releases.forEach((release, index) => {
  const position = (index + 1) * 10 - 1
  if (position < feedItems.length) {
    feedItems.splice(position, 0, releaseItem)
  }
})
```

---

## What's Been Implemented

### ✅ Database Migrations

All migration files created and ready to run:

1. **`supabase/migrations/add-activity-grouping.sql`**
   - Creates `activity_groups` table
   - Adds `activity_group_id` column to `activities`
   - Creates indexes

2. **`supabase/migrations/create-recommendations-table.sql`**
   - Creates `recommendations` table with all fields
   - Creates indexes for performance

3. **`supabase/migrations/create-release-notifications-table.sql`**
   - Creates `release_notifications` table
   - Includes `streaming_service` column
   - Supports all notification types

4. **`supabase/migrations/create-admin-settings-table.sql`**
   - Creates `admin_settings` table
   - Sets up RLS policies
   - Inserts default `feed_show_all_users` setting

5. **`supabase/migrations/create-ad-slots-table.sql`**
   - Creates `ad_slots` table (foundation for future)

6. **`supabase/migrations/add-activity-aggregation-triggers.sql`**
   - Creates `handle_rating_activity()` function
   - Creates `handle_watch_status_activity()` function
   - Sets up triggers on `ratings` and `watch_status` tables
   - Implements 1-minute grouping window

### ✅ API Routes

1. **`app/api/feed/route.ts`** ✅
   - GET endpoint with pagination
   - Groups activities by `activity_group_id`
   - Fetches recommendations and releases
   - Interleaves items
   - Applies feed filtering (exclude own activities, admin setting)

2. **`app/api/recommendations/route.ts`** ✅
   - GET endpoint with pagination
   - Updates `shown_at` timestamp
   - Filters out watched/rated media

3. **`app/api/releases/upcoming/route.ts`** ✅
   - GET endpoint with pagination
   - POST endpoint to mark as seen
   - Filters by `release_date >= today`

### ✅ Components

1. **`components/feed/RecommendationCard.tsx`** ✅
   - Fully implemented with all features
   - Styled with gradient background
   - Action buttons working

2. **`components/feed/ReleaseNotificationCard.tsx`** ✅
   - Fully implemented with all features
   - Supports all notification types
   - Dynamic badges and countdown

3. **`components/feed/ActivityCard.tsx`** ⚠️
   - ✅ Grouped activity display working
   - ✅ Comments/likes sections working
   - ✅ Comment moderation working
   - ❌ Quick rate/status buttons **NOT IMPLEMENTED** (props exist, UI missing)

4. **`app/feed/page.tsx`** ✅
   - ✅ Uses new `/api/feed` endpoint
   - ✅ Infinite scroll implemented
   - ✅ Trending section removed
   - ✅ Handles all feed item types
   - ✅ Enriches items with additional data

5. **`app/admin/settings/page.tsx`** ✅
   - ✅ Admin feed toggle implemented
   - ✅ Reads/writes `admin_settings` table

### ✅ Utilities

1. **`utils/recommendation-engine.ts`** ✅
   - Collaborative filtering algorithm
   - Content-based filtering algorithm
   - Hybrid scoring
   - User similarity calculation
   - Save recommendations function

2. **`utils/release-notification-service.ts`** ✅
   - TV season checking
   - Movie release checking
   - Streaming availability checking
   - Batch processing for all users

### ✅ Scripts

1. **`scripts/generate-recommendations.ts`** ✅
   - Processes all users
   - Generates recommendations
   - Saves to database
   - Error handling and logging

2. **`scripts/check-upcoming-releases.ts`** ✅
   - Processes all users
   - Checks for releases
   - Creates notifications
   - Error handling and logging

### ✅ Mockups

1. **`public/feed-component-mockups.html`** ✅
   - Complete component mockups
   - Shows all features including quick actions
   - Comment moderation examples
   - Report modal example

2. **`public/feed-comparison-mockup.html`** ✅
   - Side-by-side comparison
   - Current feed vs. enhanced feed
   - Shows all features

---

## What Still Needs Work

### 🔴 Critical (Must Complete)

#### 1. Add Quick Rate/Status Buttons to ActivityCard
**File**: `components/feed/ActivityCard.tsx`

**Current State**: Props exist (`onQuickRate`, `onQuickStatus`, `userRating`, `userStatus`) but UI is missing.

**What to Add:**
```tsx
{/* Quick Rate Buttons */}
{onQuickRate && (
  <div className="quick-rate">
    <button
      className={`quick-rate-btn meh ${userRating === 'meh' ? 'active' : ''}`}
      onClick={() => onQuickRate(activity.media.id, 'meh')}
    >
      😐 Meh
    </button>
    <button
      className={`quick-rate-btn like ${userRating === 'like' ? 'active' : ''}`}
      onClick={() => onQuickRate(activity.media.id, 'like')}
    >
      👍 Like
    </button>
    <button
      className={`quick-rate-btn love ${userRating === 'love' ? 'active' : ''}`}
      onClick={() => onQuickRate(activity.media.id, 'love')}
    >
      ❤️ Love
    </button>
  </div>
)}

{/* Quick Status Buttons */}
{onQuickStatus && (
  <div className="quick-status">
    <div className="status-btn-group">
      <button
        className={`quick-status-btn ${userStatus === 'want' ? 'active' : ''}`}
        onClick={() => onQuickStatus(activity.media.id, 'want')}
      >
        ➕ Want to Watch
      </button>
    </div>
    <div className="status-btn-group">
      <button
        className={`quick-status-btn ${userStatus === 'watching' ? 'active' : ''}`}
        onClick={() => onQuickStatus(activity.media.id, 'watching')}
      >
        ▶️ Watching
      </button>
    </div>
    <div className="status-btn-group">
      <button
        className={`quick-status-btn ${userStatus === 'watched' ? 'active' : ''}`}
        onClick={() => onQuickStatus(activity.media.id, 'watched')}
      >
        ✓ Watched
      </button>
    </div>
  </div>
)}
```

**Styles**: Already exist in `app/globals.css` (lines 359-433)

**Reference**: See `components/feed/ActivityCard.tsx.backup` for example implementation

#### 2. Run Database Migrations
**Action Required**: Execute all migration files in Supabase dashboard or via CLI.

**Migration Order:**
1. `add-activity-grouping.sql`
2. `create-recommendations-table.sql`
3. `create-release-notifications-table.sql`
4. `create-admin-settings-table.sql`
5. `create-ad-slots-table.sql`
6. `add-activity-aggregation-triggers.sql`

**How to Run:**
```bash
# Via Supabase CLI
supabase migration up

# Or manually in Supabase SQL Editor
# Copy/paste each migration file content
```

#### 3. Set Up Background Jobs
**Options:**

**Option A: Vercel Cron Jobs** (Recommended)
1. Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-recommendations",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/check-releases",
      "schedule": "0 6 * * *"
    }
  ]
}
```

2. Create `app/api/cron/generate-recommendations/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { generateRecommendationsForAllUsers } from '@/scripts/generate-recommendations'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await generateRecommendationsForAllUsers()
  return NextResponse.json({ success: true })
}
```

3. Create `app/api/cron/check-releases/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { runReleaseCheck } from '@/scripts/check-upcoming-releases'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await runReleaseCheck()
  return NextResponse.json({ success: true })
}
```

4. Add `CRON_SECRET` to Vercel environment variables

**Option B: External Cron Service**
- Use GitHub Actions, EasyCron, or similar
- Schedule HTTP requests to the cron endpoints

### 🟡 Important (Should Complete Soon)

#### 4. Test Activity Aggregation
**What to Test:**
- Rate a show, then change status within 1 minute → Should group
- Rate a show, wait 2 minutes, change status → Should NOT group
- Change status, then rate within 1 minute → Should group
- Verify grouped activities show combined text in feed

**How to Test:**
1. Rate a show (`ratings` table INSERT)
2. Immediately add to Want to Watch (`watch_status` table INSERT)
3. Check `activities` table - should have same `activity_group_id`
4. Check feed - should show combined activity

#### 5. Test Recommendation Generation
**What to Test:**
- Run `generate-recommendations.ts` script manually
- Verify recommendations appear in `recommendations` table
- Verify recommendations appear in feed
- Check recommendation reasons are accurate

**Prerequisites:**
- Need at least 2 users with overlapping ratings for collaborative filtering
- Need users with ratings for content-based filtering

#### 6. Test Release Notifications
**What to Test:**
- Run `check-upcoming-releases.ts` script manually
- Verify notifications created in `release_notifications` table
- Verify notifications appear in feed
- Test marking notifications as seen

**Prerequisites:**
- Users need watched shows/movies (`watch_status.status = 'watched'`)
- TMDB API key must be configured

#### 7. Test Feed Filtering
**What to Test:**
- User's own activities excluded (should not appear in feed)
- Admin toggle works (toggle between all users vs. followed only)
- Followed users' activities appear when toggle is off
- All users' activities appear when toggle is on

### 🟢 Nice to Have (Future Enhancements)

#### 8. Feed Filter Dropdown
Add client-side filtering:
- All
- Activities Only
- Recommendations Only
- Releases Only

**File**: `app/feed/page.tsx`

#### 9. Recommendation Accuracy Tracking
- Track click-through rates
- Track "Add to Want to Watch" conversions
- A/B test different algorithms
- Store metrics in `recommendations.interacted_at`

#### 10. Performance Optimization
- Add Redis caching for recommendations
- Add database query optimization
- Add pagination cursor-based instead of offset
- Add prefetching for next page

#### 11. Ad Slots Integration
- Implement ad slot insertion in feed
- Track impressions/clicks
- Admin interface for managing ads

---

## Testing Guide

### Manual Testing Checklist

#### Activity Aggregation
- [ ] Rate a show → Check `activities` table has new record
- [ ] Rate a show, immediately add to Want to Watch → Check both activities have same `activity_group_id`
- [ ] Check feed → Should show combined activity: "loved and added to Want to Watch"
- [ ] Rate a show, wait 2 minutes, add to Want to Watch → Should NOT group (separate activities)

#### Feed API
- [ ] GET `/api/feed?limit=20&offset=0` → Returns feed items
- [ ] Check response includes activities, recommendations, releases
- [ ] Verify user's own activities NOT in response
- [ ] Check pagination works (`hasMore`, `offset`)
- [ ] Verify infinite scroll loads more items

#### Recommendations
- [ ] Run `generate-recommendations.ts` script
- [ ] Check `recommendations` table has records
- [ ] GET `/api/recommendations` → Returns recommendations
- [ ] Check recommendations appear in feed
- [ ] Test "Add to Want to Watch" button
- [ ] Test "Dismiss" button → Should remove from feed

#### Release Notifications
- [ ] Run `check-upcoming-releases.ts` script
- [ ] Check `release_notifications` table has records
- [ ] GET `/api/releases/upcoming` → Returns releases
- [ ] Check releases appear in feed
- [ ] Test "Mark as seen" → Should update `seen_at`
- [ ] Verify countdown displays correctly

#### Admin Settings
- [ ] Access `/admin/settings` as admin user
- [ ] Toggle `feed_show_all_users` setting
- [ ] Check feed changes (all users vs. followed only)
- [ ] Verify setting persists in database

#### ActivityCard Component
- [ ] Test grouped activity display
- [ ] Test expandable comments
- [ ] Test expandable likes
- [ ] Test comment reporting (if implemented)
- [ ] Test quick rate buttons (if implemented)
- [ ] Test quick status buttons (if implemented)

### Integration Testing

#### Test Feed Flow
1. User A rates "Breaking Bad" → Activity created
2. User A adds "Breaking Bad" to Want to Watch → Activities grouped
3. User B views feed → Sees grouped activity
4. User B likes activity → Like count updates
5. User B comments → Comment appears
6. User B quick rates → Rating saved, feed refreshes

#### Test Recommendation Flow
1. User A rates multiple shows
2. Run recommendation generation script
3. User A views feed → Sees recommendations
4. User A clicks "Add to Want to Watch" → Status updated
5. User A dismisses recommendation → Removed from feed

#### Test Release Notification Flow
1. User A watches "House of the Dragon" Season 1
2. Run release check script
3. Check TMDB for Season 2 release date
4. User A views feed → Sees release notification
5. User A marks as seen → Notification hidden

### Performance Testing

#### Load Testing
- Test feed API with 1000+ activities
- Test feed API with 100+ recommendations
- Test feed API with 50+ release notifications
- Verify pagination performance
- Check query execution time (< 500ms)

#### Stress Testing
- Test infinite scroll with 10,000+ items
- Test recommendation generation for 1000+ users
- Test release checking for 1000+ users
- Monitor database connection pool

---

## Deployment Notes

### Environment Variables Required

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for background jobs)

**TMDB:**
- `NEXT_PUBLIC_TMDB_API_KEY` - TMDB API key

**Vercel Cron (if using):**
- `CRON_SECRET` - Secret for cron endpoint authentication

### Database Migration Order

1. Run migrations in this order:
   ```
   add-activity-grouping.sql
   create-recommendations-table.sql
   create-release-notifications-table.sql
   create-admin-settings-table.sql
   create-ad-slots-table.sql
   add-activity-aggregation-triggers.sql
   ```

2. Verify migrations:
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'activity_groups', 
     'recommendations', 
     'release_notifications', 
     'admin_settings', 
     'ad_slots'
   );

   -- Check activity_group_id column exists
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'activities' 
   AND column_name = 'activity_group_id';

   -- Check triggers exist
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name IN (
     'on_rating_created', 
     'on_watch_status_changed'
   );
   ```

### Post-Deployment Steps

1. **Run Initial Recommendation Generation**
   ```bash
   npx tsx scripts/generate-recommendations.ts
   ```

2. **Run Initial Release Check**
   ```bash
   npx tsx scripts/check-upcoming-releases.ts
   ```

3. **Set Up Cron Jobs**
   - Configure Vercel cron jobs OR
   - Set up external cron service

4. **Verify Admin Settings**
   - Check `admin_settings` table has `feed_show_all_users` entry
   - Verify default value is `'true'`

5. **Test Feed**
   - Visit `/feed` page
   - Verify no trending section
   - Verify activities load
   - Test infinite scroll
   - Verify user's own activities excluded

---

## Future Enhancements

### Short-Term (Next Sprint)

1. **Feed Filter Dropdown**
   - Add UI filter for Activities/Recommendations/Releases
   - Store preference in localStorage
   - Filter client-side

2. **Recommendation Feedback Loop**
   - Track when users interact with recommendations
   - Use feedback to improve algorithm
   - Store interaction data

3. **Release Notification Preferences**
   - Allow users to configure notification types
   - Allow users to configure time windows
   - Add user preference table

### Medium-Term (Next Quarter)

1. **Advanced Recommendation Algorithms**
   - Matrix factorization
   - Deep learning models
   - Real-time recommendations

2. **Social Recommendations**
   - "Friends also watched" recommendations
   - Friend activity boost in feed
   - Social proof indicators

3. **Personalized Feed Ordering**
   - Machine learning for feed ordering
   - User engagement prediction
   - A/B testing framework

### Long-Term (Future)

1. **Ad Platform Integration**
   - Implement ad slot system
   - Revenue tracking
   - Ad performance analytics

2. **Feed Analytics**
   - Track feed engagement metrics
   - A/B test feed algorithms
   - User retention analysis

3. **Content Discovery**
   - Trending algorithms (replacing old trending section)
   - Genre-based discovery
   - Time-based discovery (weekly/monthly highlights)

---

## File Reference

### Migration Files
- `supabase/migrations/add-activity-grouping.sql`
- `supabase/migrations/create-recommendations-table.sql`
- `supabase/migrations/create-release-notifications-table.sql`
- `supabase/migrations/create-admin-settings-table.sql`
- `supabase/migrations/create-ad-slots-table.sql`
- `supabase/migrations/add-activity-aggregation-triggers.sql`

### API Routes
- `app/api/feed/route.ts`
- `app/api/recommendations/route.ts`
- `app/api/releases/upcoming/route.ts`

### Components
- `components/feed/ActivityCard.tsx`
- `components/feed/RecommendationCard.tsx`
- `components/feed/ReleaseNotificationCard.tsx`
- `app/feed/page.tsx`
- `app/admin/settings/page.tsx`

### Utilities
- `utils/recommendation-engine.ts`
- `utils/release-notification-service.ts`

### Scripts
- `scripts/generate-recommendations.ts`
- `scripts/check-upcoming-releases.ts`

### Mockups
- `public/feed-component-mockups.html`
- `public/feed-comparison-mockup.html`

---

## Developer Notes

### Key Design Decisions

1. **1-Minute Aggregation Window**: Chosen to balance grouping vs. separation. Activities more than 1 minute apart are likely separate actions.

2. **Feed Excludes Own Activities**: User sees their own actions immediately (through UI feedback), don't need to see them in feed.

3. **Admin Toggle Default**: Defaults to `true` (show all users) for launch, can be changed to `false` later for more curated experience.

4. **Interleaving Ratios**: Recommendations every 5th, releases every 10th. These ratios can be adjusted based on engagement data.

5. **Recommendation Caching**: Top 50 recommendations cached per user, refreshed daily. This balances freshness vs. performance.

### Common Issues & Solutions

**Issue**: Activities not grouping
- **Check**: Trigger functions exist and are enabled
- **Check**: `activity_group_id` column exists
- **Check**: Activities created within 1 minute
- **Solution**: Run migration `add-activity-aggregation-triggers.sql`

**Issue**: Recommendations not appearing
- **Check**: `recommendations` table has data
- **Check**: Recommendation generation script ran successfully
- **Check**: User has sufficient rating data for algorithm
- **Solution**: Run `generate-recommendations.ts` script

**Issue**: Release notifications not appearing
- **Check**: `release_notifications` table has data
- **Check**: Release check script ran successfully
- **Check**: User has watched shows/movies
- **Check**: TMDB API key is valid
- **Solution**: Run `check-upcoming-releases.ts` script

**Issue**: Feed shows user's own activities
- **Check**: Feed API query includes `WHERE user_id != current_user_id`
- **Check**: User ID is correctly passed to API
- **Solution**: Verify authentication and user ID in API route

**Issue**: Admin toggle not working
- **Check**: User has `is_admin = true` in profiles table
- **Check**: `admin_settings` table exists
- **Check**: RLS policies allow admin updates
- **Solution**: Verify admin status and RLS policies

### Performance Considerations

1. **Feed Query Optimization**: Uses indexes on `user_id`, `created_at`, `activity_group_id`
2. **Recommendation Caching**: Pre-calculated and stored, not computed on-demand
3. **Pagination**: Uses limit/offset, consider cursor-based for very large datasets
4. **Batch Processing**: Background jobs process users in batches to avoid timeout

### Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Admin Access**: Admin settings protected by `is_admin` check
3. **User Isolation**: Users can only see/modify their own data
4. **API Authentication**: All endpoints require authentication

---

## Contact & Support

For questions or issues related to the Enhanced Feed implementation:

1. Check this documentation first
2. Review the original plan: `ENHANCED-FEED-PLAN.md`
3. Check mockups: `public/feed-component-mockups.html`
4. Review code comments in implementation files

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Ready for completion - Critical items identified


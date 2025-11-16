# Enhanced Activity Feed Implementation Plan (v2 Architecture)

## Overview
Transform the activity feed from a simple chronological list into a personalized, recommendation-driven experience. Remove trending section, add intelligent recommendations, release notifications, activity aggregation, and infinite scroll. Adapted for Next.js 15 + Supabase architecture.

## Current State Analysis (v2)

### Existing Infrastructure
- **Feed Page**: `app/feed/page.tsx` - React component with Supabase queries
- **Activity Component**: `components/feed/ActivityCard.tsx` - Renders individual activities
- **Database**: Supabase PostgreSQL with triggers for activity creation
- **Activity Types**: `rated`, `status_changed`, `commented`, `top_spot_updated`
- **Feed Query**: Currently fetches all activities (line 130-143 in feed/page.tsx)
- **Trending Section**: Exists at lines 840-866, needs removal

### What's Missing
- No recommendation system
- No release notifications
- No pagination/infinite scroll (currently hardcoded limit 20)
- No activity aggregation (separate activities for rating + status change)
- No filtering options
- Feed shows all users, not filtered by follows
- User's own activities are currently shown (should be excluded)

### Database Schema Status
- ✅ `activities` table exists (UUID id, JSONB activity_data)
- ✅ `activity_likes` and `comments` tables exist
- ❌ `activity_group_id` column missing from activities table
- ❌ `recommendations` table doesn't exist
- ❌ `release_notifications` table doesn't exist
- ❌ `admin_settings` table doesn't exist
- ❌ `ad_slots` table doesn't exist (future)

## Phase 1: Database Schema Enhancements

### 1.1 Add Activity Grouping Support
**File**: `supabase/migrations/add-activity-grouping.sql`
- Add `activity_group_id UUID` column to `activities` table
- Create `activity_groups` table:
  ```sql
  CREATE TABLE activity_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    media_id TEXT REFERENCES media(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- Add index: `CREATE INDEX idx_activities_group_id ON activities(activity_group_id)`

### 1.2 Create Recommendations Table
**File**: `supabase/migrations/create-recommendations-table.sql`
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

CREATE INDEX idx_recommendations_user_score ON recommendations(user_id, score DESC);
CREATE INDEX idx_recommendations_user_shown ON recommendations(user_id, shown_at);
```

### 1.3 Create Release Notifications Table
**File**: `supabase/migrations/create-release-notifications-table.sql`
```sql
CREATE TABLE release_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id),
  season_number INTEGER,
  release_date DATE NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('announcement', 'week_before', 'day_of', 'theatrical_release', 'streaming_available')),
  streaming_service TEXT, -- e.g., 'Netflix', 'Disney Plus', 'HBO Max'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ
);

CREATE INDEX idx_release_notifications_user_date ON release_notifications(user_id, release_date);
CREATE INDEX idx_release_notifications_media ON release_notifications(media_id);
CREATE INDEX idx_release_notifications_type ON release_notifications(notification_type);
```

### 1.4 Create Admin Settings Table
**File**: `supabase/migrations/create-admin-settings-table.sql`
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default feed setting
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('feed_show_all_users', 'true', 'Show all users activities in feed (true) or only followed users (false)');
```

### 1.5 Ad Slots Table (Foundation for Future)
**File**: `supabase/migrations/create-ad-slots-table.sql`
```sql
CREATE TABLE ad_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL,
  media_id TEXT REFERENCES media(id),
  advertiser_id UUID,
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Phase 2: Recommendation Algorithm Implementation

### 2.1 Create Recommendation Engine Module
**File**: `utils/recommendation-engine.ts` (NEW)
- User similarity calculation (cosine similarity on ratings)
- Collaborative filtering algorithm
- Content-based filtering (genre/cast matching)
- Hybrid scoring (combine both methods)
- Generate recommendation records

### 2.2 Create Recommendation API Route
**File**: `app/api/recommendations/route.ts` (NEW)
- GET endpoint with pagination (`limit`, `offset`)
- Returns recommendations for authenticated user
- Filters out media user has already watched
- Orders by score DESC

### 2.3 Background Job Setup
**File**: `scripts/generate-recommendations.ts` (NEW)
- Script to refresh recommendations for all users
- Run via cron job or scheduled function
- Cache top 50 recommendations per user

## Phase 3: Release Notifications System

### 3.1 Create Release Notification Service
**File**: `utils/release-notification-service.ts` (NEW)
- Poll TMDB API for:
  - **TV Seasons**: Upcoming seasons for shows user has watched (`status='watched'`)
  - **Movie Releases**: New theatrical releases via `/movie/upcoming` and `/movie/now_playing`
  - **Streaming Availability**: Movies added to streaming via `/movie/{id}/watch/providers` endpoint
    - Track movies user has watched (`status='watched'`)
    - Check when they become available on streaming services
    - Create notifications for new streaming availability
- Query TMDB TV details for next season info
- Query TMDB watch providers for streaming service changes
- Create notification records for all three types:
  - `theatrical_release` - New movie in theaters
  - `streaming_available` - Movie now on streaming (with `streaming_service` field)
  - `announcement`/`week_before`/`day_of` - Upcoming TV seasons

### 3.2 Create Release Notification API Route
**File**: `app/api/releases/upcoming/route.ts` (NEW)
- GET endpoint returns upcoming releases for user
- Filters by `release_date` >= today
- Groups by media_id

### 3.3 Background Job for Release Checking
**File**: `scripts/check-upcoming-releases.ts` (NEW)
- Daily cron job
- Polls TMDB for watched shows and movies
- Checks streaming availability changes
- Creates notification records

## Phase 4: Activity Aggregation

### 4.1 Update Activity Creation Logic
**Files to Modify**:
- `supabase/schema.sql` - Update triggers
- Create new function: `handle_aggregated_activity()`

**Logic**:
- When rating created, check for recent status change (< 1 minute) on same media
- If found, group activities via `activity_group_id`
- When status changed, check for recent rating (< 1 minute) on same media
- Combine into single feed item

### 4.2 Update Feed Query
**File**: `app/feed/page.tsx`
- Modify `loadFeed()` function (lines 127-442)
- Group activities by `activity_group_id` when present
- Combine activity data for display
- Show richer descriptions: "John rated and added Breaking Bad to Want to Watch"

## Phase 5: Feed Pagination & Infinite Scroll

### 5.1 Create Feed API Route
**File**: `app/api/feed/route.ts` (NEW)
- Extract feed logic from `app/feed/page.tsx`
- Add pagination: `limit` (default 20), `offset` query params
- Return unified feed: activities + recommendations + release notifications
- Ordering: chronological with priority boosts
- **Feed Filtering Logic**:
  - Check admin setting `feed_show_all_users` from `admin_settings` table
  - If `true`: Show all users' activities (current behavior)
  - If `false`: Show only followed users' activities (future default)
  - **Always exclude**: Current user's own activities from feed
  - Filter: `WHERE activities.user_id != current_user_id`

### 5.2 Update Feed Page Component
**File**: `app/feed/page.tsx`
- Replace direct Supabase queries with API calls
- Implement Intersection Observer for infinite scroll
- Add loading skeleton component
- Track `hasMore` state for pagination

### 5.3 Feed Ordering Algorithm
- Primary: chronological (newest first)
- Interleave: recommendations every 5th item, releases every 10th item
- Priority boost:
  - Recent releases (within 30 days)
  - High-scored recommendations (> 0.7)
  - Followed users' activities

## Phase 6: Remove Trending Section

### 6.1 Remove Trending Code
**File**: `app/feed/page.tsx`
- Remove `trending` state (line 25)
- Remove `loadTrending()` function (lines 444-452)
- Remove trending useEffect call (line 71)
- Remove trending section JSX (lines 840-866)

### 6.2 Update Feed Focus
- Feed now exclusively shows:
  - User activities (from followed users only, NOT self)
  - Recommendations
  - Release notifications
  - Ad slots (future, placeholder)
- Admin toggle in admin panel controls whether to show all users or only followed users

## Phase 7: UI/UX Enhancements

### 7.1 Create Recommendation Card Component
**File**: `components/feed/RecommendationCard.tsx` (NEW)
- Display recommended media with poster
- Show recommendation reason ("Because you liked Breaking Bad")
- Quick actions: "Add to Want to Watch", "Rate if Seen", "Dismiss"
- Show if friends have watched/rated it
- Highlight if new release (badge)

### 7.2 Create Release Notification Card Component
**File**: `components/feed/ReleaseNotificationCard.tsx` (NEW)
- Distinct styling (gradient background, countdown)
- Show time until release
- "Add to Want to Watch" button
- Season number display (for TV)
- Streaming service badge (for streaming availability)

### 7.3 Update ActivityCard Component
**File**: `components/feed/ActivityCard.tsx`
- Handle grouped activities (multiple activity_types)
- Display combined action text
- Show multiple activity indicators

### 7.4 Feed Filtering (Optional)
**File**: `app/feed/page.tsx`
- Add filter dropdown: All, Activities Only, Recommendations Only, Releases Only
- Save preference in localStorage
- Filter feed items client-side

### 7.5 Admin Panel Toggle
**File**: `app/admin/settings/page.tsx` (or add to existing admin page)
- Add toggle for `feed_show_all_users` setting
- Update `admin_settings` table when toggled
- Show current setting state

## Phase 8: Performance Optimization

### 8.1 Recommendation Caching
- Pre-calculate top 50 recommendations per user
- Refresh daily via background job
- Store in `recommendations` table with `shown_at` tracking

### 8.2 Database Indexes
- Already have indexes on activities
- Add composite indexes for feed queries:
  ```sql
  CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);
  CREATE INDEX idx_follows_follower_status ON follows(follower_id, status);
  ```

### 8.3 Background Jobs
- Recommendation refresh: Daily at 2 AM
- Release notification checker: Daily at 6 AM
- Use Supabase Edge Functions or external cron service

## Implementation Files Summary

### Backend/Database
- `supabase/migrations/add-activity-grouping.sql` - NEW
- `supabase/migrations/create-recommendations-table.sql` - NEW
- `supabase/migrations/create-release-notifications-table.sql` - NEW
- `supabase/migrations/create-admin-settings-table.sql` - NEW
- `supabase/migrations/create-ad-slots-table.sql` - NEW
- `supabase/schema.sql` - UPDATE (add aggregation triggers)

### API Routes
- `app/api/feed/route.ts` - NEW (unified feed endpoint)
- `app/api/recommendations/route.ts` - NEW
- `app/api/releases/upcoming/route.ts` - NEW

### Utilities
- `utils/recommendation-engine.ts` - NEW
- `utils/release-notification-service.ts` - NEW

### Components
- `components/feed/RecommendationCard.tsx` - NEW
- `components/feed/ReleaseNotificationCard.tsx` - NEW
- `components/feed/ActivityCard.tsx` - UPDATE (grouped activities)
- `app/feed/page.tsx` - UPDATE (remove trending, add infinite scroll, filtering)
- `app/admin/settings/page.tsx` - UPDATE (add feed toggle)

### Scripts
- `scripts/generate-recommendations.ts` - NEW
- `scripts/check-upcoming-releases.ts` - NEW

## Testing Considerations
- Test recommendation accuracy with sample user data
- Verify release notifications trigger correctly (TV seasons, movie releases, streaming availability)
- Test activity aggregation timing window (1 minute)
- Verify user's own activities are excluded from feed
- Test admin toggle for feed visibility (all users vs followed only)
- Load test infinite scroll with large datasets
- Verify trending section completely removed
- Test feed filtering options
- Verify feed performance with indexes

## Migration Path
1. Run database migrations (Phase 1)
2. Implement recommendation engine (Phase 2)
3. Implement release notifications (Phase 3)
4. Add activity aggregation (Phase 4)
5. Add pagination/infinite scroll (Phase 5)
6. Remove trending (Phase 6)
7. UI enhancements (Phase 7)
8. Performance optimization (Phase 8)

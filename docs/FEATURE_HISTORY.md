# Been Watching - Feature History

This document tracks the development history of major features and important changes.

## Recent Updates (December 2025)

### Session: December 19, 2025 - Quick Action Modal Fixes
**Duration**: Partial session
**Status**: ✅ Complete

#### Issues Fixed

1. **Quick Action Modal Section Titles**
   - Added "Rate This Show" title above rating icons (Meh, Like, Love)
   - Added "Add to a Watchlist" title above watchlist icons (Want To, Watching, Watched)
   - Added visual divider between sections
   - Styled with uppercase, letter-spacing, centered alignment

2. **Rating Not Displaying in Quick Action Modal**
   - **Problem**: When opening Quick Action modal for already-rated shows, the rating wasn't highlighted
   - **Root Causes**: 
     - State initialization: `userRating` state was only set on component mount, not updated when props changed
     - My Shows page: Property name typo (`mediaItem.rating` vs `mediaItem.user_rating`)
     - Top 3 shows: Not fetching user's rating/status from database
     - Feed page: Recommendation cards not receiving cached ratings
   - **Solution**:
     - Added `useEffect` hooks in `FeedCard` to sync `userRating` and `watchlistStatus` when props change
     - Fixed property name in `handlePosterClick` on My Shows page
     - Added database fetch for rating/status in `handleViewTopShow` for Top 3 shows
     - Added `userRatingsMap` and `userStatusMap` caches in feed page

3. **Dismissed Cards Reappearing After Refresh**
   - **Problem**: Dismissed recommendation cards would reappear after page refresh
   - **Root Cause**: `getUserExcludedMediaIds` wasn't checking `user_dismissed_media` table
   - **Solution**: Updated `utils/feedUtils.ts` to include `user_dismissed_media` in exclusions

#### Technical Details

**State Syncing in FeedCard** (`components/feed/UserActivityCard.tsx`):
```typescript
// Sync userRating when data prop changes
useEffect(() => {
  setUserRating(data.friendsActivity.ratings.userRating || null)
}, [data.friendsActivity.ratings.userRating])

// Sync watchlistStatus when initialUserStatus prop changes  
useEffect(() => {
  if (initialUserStatus) {
    setWatchlistStatus(new Set([initialUserStatus]))
  }
}, [initialUserStatus])
```

**Rating/Status Caching** (`app/feed/page.tsx`):
- `userRatingsMap`: Map of media IDs to ratings (meh/like/love)
- `userStatusMap`: Map of media IDs to statuses (want/watching/watched)
- Loaded when feed loads, updated immediately when user takes action
- Passed to recommendation cards for proper display

#### Files Modified
- `components/feed/UserActivityCard.tsx` - Section titles, state syncing useEffects
- `app/feed/page.tsx` - Rating/status caching system, pass `initialUserStatus` prop
- `app/myshows/page.tsx` - Fixed property name, added rating fetch for Top 3
- `utils/feedUtils.ts` - Added `user_dismissed_media` to exclusion query

---

## Recent Updates (October 2025)

### Session: October 18, 2025 - Authentication & UX Improvements
**Duration**: Full session
**Status**: ✅ Complete

#### Features Implemented

1. **Logout Functionality**
   - Added logout button to profile page header
   - Added user profile section to admin dashboard with logout
   - Added user profile section to invite-test page with logout
   - Consistent `handleLogout` pattern across all pages
   - Redirects to `/auth` after successful logout

2. **Google OAuth Authentication Fix**
   - **Problem**: Google OAuth was redirecting to 404 error page
   - **Root Cause**: OAuth redirect was going to `/auth/callback` (non-existent route) instead of `/api/auth/callback`
   - **Solution**:
     - Updated `handleGoogleLogin` in `/app/auth/page.tsx` to use `/api/auth/callback`
     - Created OAuth error page at `/app/auth/error/page.tsx`
     - Added Supabase redirect URL configuration
   - **Files Modified**:
     - `/app/auth/page.tsx` (line 150: changed redirect URL)
     - `/app/auth/error/page.tsx` (created new error page)

3. **Auth Error Page**
   - Location: `/app/auth/error/page.tsx`
   - Features:
     - Displays OAuth error messages from URL parameters
     - Styled error icon and message
     - "Try Again" button (redirects to `/auth`)
     - "Join Waitlist" button (redirects to `/waitlist`)
     - Light/dark mode support
     - Matches site's liquid glass design

4. **Admin Dashboard User Profile Section**
   - Added user profile display in top-right corner
   - Shows avatar (or initials if no avatar)
   - Shows username
   - Includes logout button
   - Aligned with content max-width instead of viewport edge
   - Consistent with admin page styling

5. **Admin Link on Profile Page**
   - Location: `/app/profile/page.tsx` (lines 473-499)
   - Only visible to users with `is_admin: true`
   - Purple gradient button: "🔧 Go to Admin Dashboard"
   - Positioned above the Invites section

6. **Invite-Test Page Security**
   - Added authentication check (redirects to `/auth` if not logged in)
   - Added admin check (redirects to `/` if not admin)
   - Added user profile section matching admin dashboard
   - Added loading state with spinner
   - Files Modified: `/app/invite-test/page.tsx`

7. **Interactive Top 3 Shows**
   - Location: `/app/myshows/page.tsx`
   - **Problem**: Users wanted to click poster to view show details, not change selection
   - **Solution**:
     - Clicking poster image now opens MediaDetailModal with show details
     - Added separate "✏️ Edit" button for changing selections
     - `handleViewTopShow()` function fetches full TMDB data
     - Detail modal displays above search forms
   - Features:
     - View show details and ratings by clicking poster
     - Edit selection with dedicated button
     - Proper event handling to prevent conflicts
     - Loading of full media data from TMDB API

#### Technical Decisions

- **OAuth Redirect**: Using API route (`/api/auth/callback`) instead of page route for better server-side handling
- **User Profile Alignment**: Changed from `position: fixed; right: 1rem` to `maxWidth: 1200px; margin: 0 auto; justify-content: flex-end` for consistent alignment
- **Top 3 Shows Interaction**: Separated view (click poster) from edit (click button) actions for better UX
- **Consistent Logout Pattern**: All logout handlers use same pattern: `supabase.auth.signOut()` → `router.push('/auth')`

#### Files Created
- `/app/auth/error/page.tsx` - OAuth error handling page

#### Files Modified
- `/app/auth/page.tsx` - Fixed Google OAuth redirect URL
- `/app/profile/page.tsx` - Added logout button and admin link
- `/app/admin/page.tsx` - Added user profile section, fixed alignment
- `/app/invite-test/page.tsx` - Added auth checks and user profile section
- `/app/myshows/page.tsx` - Made Top 3 shows interactive with detail view

#### User Experience Improvements
- ✅ Consistent logout functionality across all pages
- ✅ Working Google OAuth login
- ✅ Proper error messaging for OAuth failures
- ✅ Admin users can easily navigate to admin dashboard from profile
- ✅ Admin pages show current user and allow logout
- ✅ Better alignment of UI elements on admin pages
- ✅ Top 3 shows are now fully interactive with detail viewing

---

## Previous Updates (January 2025)

### Top 3 Shows Feature
**Status**: In Progress (70% complete)

#### What We Built
1. **Database Schema**
   - Added three JSONB columns to profiles table: `top_show_1`, `top_show_2`, `top_show_3`
   - Migration file: `/supabase/add-profile-features.sql`
   - Each column stores: id, title, poster_path, media_type, season_number, tmdb_id

2. **TopShowModal Component**
   - Location: `/components/profile/TopShowModal.tsx`
   - Features:
     - Search functionality (TV shows and movies)
     - Media type filter (All, TV, Movies)
     - Season-by-season display for TV shows
     - Direct database save on selection
   - Architecture mirrors SearchModal for consistency

3. **Custom Components in TopShowModal**
   - `TVShowWithSeasons`: Fetches and displays all seasons for a TV show
   - `SeasonSelectCard`: Displays individual season with "Add to Top #N" button
   - `MovieResultCard`: Displays movie with "Add to Top #N" button

#### What's Complete
- ✅ Database migration
- ✅ Modal UI and search
- ✅ Season fetching and display
- ✅ Database save functionality
- ✅ Error handling

#### What's Remaining
- ⏳ Display Top 3 shows on profile page
- ⏳ Remove/change functionality
- ⏳ Better loading states
- ⏳ Fallback for missing posters

#### Technical Details
```typescript
// Season ID format for TV shows
id: `tv-${tmdbId}-s${seasonNumber}`
// Example: "tv-110492-s1" for High Potential Season 1

// Data structure saved to database
{
  id: string,
  title: string,
  poster_path: string,
  media_type: 'tv' | 'movie',
  season_number?: number,
  tmdb_id: number
}
```

#### Known Issues
- Modal doesn't show loading state during initial search
- No validation to prevent selecting the same show multiple times

---

## Earlier Features (2024)

### Authentication System
**Status**: Complete

Built with Supabase Auth:
- Email/password signup
- Email/password login
- Session management
- Protected routes (partial)

**Files**:
- `/components/auth/LoginModal.tsx`
- `/components/auth/SignupModal.tsx`

### Home Page
**Status**: Complete

Features:
- Trending shows carousel
- Video trailers
- Quick add to tracking
- Responsive layout

**Files**:
- `/app/page.tsx`
- `/components/media/MediaCard.tsx`
- `/components/media/VideoModal.tsx`

### Search Functionality
**Status**: Complete

Features:
- Real-time search via TMDB API
- TV/Movie filtering
- Season-by-season results for TV shows
- Add to tracking from search
- Rate and set status on add

**Files**:
- `/components/search/SearchModal.tsx`
- `/components/search/SearchResultCard.tsx`
- `/components/search/TVSeasonCard.tsx`

**Architecture**:
```
SearchModal
├── Search input + filters
├── Results loop
    ├── For TV shows: TVShowWithSeasons
    │   └── Fetches seasons → TVSeasonCard for each
    └── For movies: SearchResultCard
```

### My Shows Page
**Status**: Complete (basic version)

Features:
- Grid display of tracked shows
- Update rating
- Update status
- Remove from tracking
- Season-specific tracking

**Files**:
- `/app/myshows/page.tsx`

**Needs Enhancement**:
- Filtering by status
- Sorting options
- Statistics view
- Bulk actions

### Profile Page
**Status**: In Progress

**Complete**:
- Basic page structure
- User info display
- Top 3 shows section (UI only)

**In Progress**:
- Top 3 shows functionality

**Planned**:
- Avatar upload
- Bio editing
- Privacy settings
- Public profile view

**Files**:
- `/app/profile/page.tsx`
- `/components/profile/TopShowModal.tsx`

### API Routes
**Status**: Complete (core functionality)

**TMDB Proxy Routes**:
- `/api/tmdb/search/multi` - Search
- `/api/tmdb/trending/[mediaType]/[timeWindow]` - Trending
- `/api/tmdb/tv/[id]` - TV show details
- `/api/tmdb/movie/[id]` - Movie details
- `/api/tmdb/[type]/[id]/videos` - Trailers

**User Media Routes**:
- `GET /api/user-media` - Fetch user's tracked media
- `POST /api/user-media` - Add media
- `PATCH /api/user-media/[id]` - Update media
- `DELETE /api/user-media/[id]` - Remove media

**Known Issue**:
- `/api/tmdb/[type]/[id]/videos` needs async params fix for Next.js 15

### Design System
**Status**: Complete (core patterns)

**Liquid Glass Aesthetic**:
- Semi-transparent white panels
- Backdrop blur effects
- Gradient accents (pink to orange)
- Smooth animations

**Components Using Design System**:
- All modals (SearchModal, TopShowModal, VideoModal)
- MediaCard
- NavBar
- Profile cards

---

## Migration History

### Migration 1: Initial Schema
**Date**: Early 2024
**File**: Not documented

Created:
- `profiles` table
- `user_media` table
- Basic RLS policies

### Migration 2: Profile Features
**Date**: January 2025
**File**: `/supabase/add-profile-features.sql`

Changes:
- Added `top_show_1`, `top_show_2`, `top_show_3` JSONB columns to profiles
- Added `is_private` boolean to profiles
- Created `follows` table for social features
- Added indexes on follows table
- Added RLS policies for follows table

---

## Bug Fixes

### Fixed: Top 3 Modal TypeError
**Date**: January 2025
**Issue**: Modal crashed when trying to display TV seasons
**Root Cause**: Using wrong component (TVSeasonCard) with wrong props
**Fix**: Created custom components (SeasonSelectCard, MovieResultCard) specific to Top 3 selection
**Files Changed**: `/components/profile/TopShowModal.tsx`

### Fixed: Database Column Not Found
**Date**: January 2025
**Issue**: "Could not find the 'top_show_1' column"
**Root Cause**: Migration not executed
**Fix**: Ran migration SQL in Supabase dashboard
**Files**: `/supabase/add-profile-features.sql`

---

## Technical Decisions

### Why Season-Specific IDs?
**Decision**: Use format `tv-{tmdbId}-s{seasonNumber}` for TV seasons
**Reasoning**:
- Allows tracking individual seasons
- More granular than whole-show tracking
- Users often want to rate seasons differently
- Common pattern in media tracking apps

### Why Proxy TMDB API?
**Decision**: All TMDB calls go through Next.js API routes
**Reasoning**:
- Keep API key secret (not exposed to client)
- Add caching layer in future
- Transform/filter data if needed
- Track usage

### Why JSONB for Top Shows?
**Decision**: Store Top 3 shows as JSONB instead of foreign keys
**Reasoning**:
- Simpler schema (no need for top_shows table)
- Faster reads (no joins needed)
- Flexible structure (can add fields without migration)
- Top 3 is display-only data (not used for queries)

### Why Inline Styles?
**Decision**: Use inline styles (CSS-in-JS) instead of CSS modules
**Reasoning**:
- Co-location of styles with components
- Dynamic styling easier
- No CSS class name conflicts
- Simpler for AI-assisted development
**Trade-off**: Less separation of concerns, but acceptable for this project size

---

## Lessons Learned

### Component Architecture
- **Lesson**: Mirror existing patterns when building similar features
- **Example**: TopShowModal mirrors SearchModal architecture
- **Benefit**: Consistency, easier maintenance

### Error Messages
- **Lesson**: Log detailed error info in development
- **Example**: Console.log attempted data when save fails
- **Benefit**: Faster debugging

### TypeScript
- **Lesson**: Use `any` sparingly, but it's okay for rapid prototyping
- **Plan**: Add proper types in refactoring phase
- **Trade-off**: Speed vs type safety (speed won in early phase)

### Database Design
- **Lesson**: JSONB is powerful but use wisely
- **Good for**: Display-only data, flexible schemas
- **Bad for**: Data you need to query/filter on

---

## Future Considerations

### Scalability
- Monitor database query performance
- Consider caching TMDB responses
- Optimize image loading
- Implement pagination

### User Experience
- Add loading skeletons
- Better error messages
- Offline support
- Progressive Web App features

### Code Quality
- Add TypeScript strict mode
- Write tests for critical paths
- Refactor large components
- Document complex logic

### Features
- Social features (highest priority)
- Enhanced filtering/sorting
- Statistics dashboard
- Mobile app (future)

---

**Document Started**: January 2025
**Last Updated**: January 2025

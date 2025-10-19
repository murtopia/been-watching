# Changelog

All notable changes to the Been Watching project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### In Progress
- Avatar upload functionality (modal and UI complete, storage integration pending)
- Friend/follow system
- Activity feed
- Enhanced filtering on My Shows page
- Statistics dashboard

### Recently Completed (2025-10-18)
- ✅ Logout functionality across all pages
- ✅ Google OAuth authentication fix
- ✅ Admin page security and UX improvements
- ✅ Interactive Top 3 shows on My Shows page
- ✅ Auth error page for OAuth failures

## [0.1.0] - 2025-01-XX (Current Development)

### Added
- **Authentication & Security (2025-10-18)**
  - OAuth error page at `/auth/error` for handling authentication failures
  - Logout functionality on profile page
  - Logout functionality on admin dashboard with user profile display
  - Admin link on profile page (visible only to admin users)
  - Authentication and admin checks on invite-test page
  - User profile section on admin pages (avatar/initials, username, logout)

- **Google OAuth Integration (2025-10-18)**
  - Fixed Google OAuth redirect URL configuration
  - Updated OAuth callback from `/auth/callback` to `/api/auth/callback`
  - Added proper error handling for OAuth failures
  - Styled error page with retry and waitlist options

- **Admin Dashboard Improvements (2025-10-18)**
  - User profile display in top-right corner
  - Avatar or initials display for logged-in admin
  - Theme toggle and logout button alignment with content
  - Consistent styling across admin and invite-test pages

- **Top 3 Shows Feature**
  - Database migration for top_show_1, top_show_2, top_show_3 columns
  - TopShowModal component with search functionality
  - Season-by-season selection for TV shows
  - Direct database save on selection
  - Interactive poster images - click to view show details (2025-10-18)
  - Separate "Edit" button to change selections (2025-10-18)
  - Media detail modal integration on My Shows page (2025-10-18)
  - Custom components: TVShowWithSeasons, SeasonSelectCard, MovieResultCard

- **Documentation**
  - Created comprehensive TODO.md with prioritized tasks
  - Added PROJECT_OVERVIEW.md with architecture details
  - Added DEVELOPER_GUIDE.md for onboarding
  - Added FEATURE_HISTORY.md tracking development history
  - Added CHANGELOG.md (this file)
  - Added README updates
  - Added API_DOCUMENTATION.md
  - Added ARCHITECTURE.md with diagrams
  - Added GIT_CONVENTIONS.md
  - Added setup.sh script
  - Updated documentation for 2025-10-18 session (2025-10-18)

### Changed
- TopShowModal now mirrors SearchModal architecture for consistency
- Improved error handling in TopShowModal with detailed logging
- OAuth redirect URL changed from client-side `/auth/callback` to API route `/api/auth/callback` (2025-10-18)
- Admin page user controls aligned with content instead of viewport edge (2025-10-18)
- Top 3 shows now clickable for viewing details instead of only for selection (2025-10-18)

### Fixed
- Fixed TypeError in TopShowModal when displaying TV seasons
- Fixed database column not found error by running migration
- Fixed component prop mismatches in season display
- Fixed Google OAuth login redirecting to 404 error page (2025-10-18)
- Fixed missing authentication on invite-test page (2025-10-18)
- Fixed admin page layout alignment issues (2025-10-18)

### Technical
- Next.js 15.5.4 with Turbopack
- React 19.x
- Supabase for database and auth
- TMDB API integration

## [0.0.1] - 2024-12-XX (Initial Development)

### Added
- **Authentication System**
  - Email/password signup
  - Email/password login
  - Session management with Supabase
  - LoginModal and SignupModal components
  - Protected routes (basic implementation)

- **Home Page**
  - Trending shows carousel
  - Video trailer playback
  - Quick add to tracking from home
  - MediaCard component with liquid glass design
  - VideoModal for trailer viewing

- **Search Functionality**
  - SearchModal with real-time TMDB search
  - TV/Movie filtering
  - Season-by-season display for TV shows
  - Add to tracking directly from search
  - Rating and status selection on add
  - SearchResultCard and TVSeasonCard components

- **My Shows Page**
  - Grid display of tracked shows
  - Update rating functionality
  - Update status functionality
  - Remove from tracking
  - Season-specific tracking support

- **Profile Page**
  - Basic profile structure
  - User info display
  - Top 3 shows section (UI placeholder)
  - Profile header with avatar placeholder

- **API Routes**
  - `/api/tmdb/*` - TMDB proxy routes
  - `/api/user-media` - User media CRUD operations
  - `/api/tmdb/search/multi` - Multi-search endpoint
  - `/api/tmdb/trending/[type]/[window]` - Trending content
  - `/api/tmdb/tv/[id]` - TV show details
  - `/api/tmdb/movie/[id]` - Movie details
  - `/api/tmdb/[type]/[id]/videos` - Video/trailer endpoints

- **Database Schema**
  - `profiles` table with user data
  - `user_media` table for tracked shows
  - Row Level Security policies
  - Indexes for performance

- **Design System**
  - Liquid glass aesthetic (semi-transparent panels)
  - Gradient color scheme (pink #e94d88 to orange #f27121)
  - Backdrop blur effects
  - Smooth animations and transitions
  - Responsive grid layouts

### Technical Decisions
- Chose Next.js 15 App Router for modern React patterns
- Used Supabase for backend simplicity
- Implemented TMDB API proxy for security
- Season-specific IDs format: `tv-{tmdbId}-s{seasonNumber}`
- JSONB storage for Top 3 shows for flexibility
- Inline styles for rapid development

### Known Issues
- API route params need async handling for Next.js 15 compatibility
- Protected routes need better auth enforcement
- TypeScript uses `any` in many places (needs refactoring)
- Mobile responsiveness needs improvement
- Missing loading states in some components

---

## Version History Summary

- **v0.1.0** (Current) - Top 3 Shows feature + Documentation
- **v0.0.1** (Initial) - Core tracking functionality + Authentication

---

## Upcoming Versions (Planned)

### [0.2.0] - Social Features
- Follow/unfollow users
- Activity feed
- Friend suggestions
- Profile privacy controls

### [0.3.0] - Enhanced Tracking
- Advanced filtering and sorting
- Statistics dashboard
- Watchlist management
- Custom lists

### [0.4.0] - Polish & Performance
- Mobile optimization
- Performance improvements
- Accessibility enhancements
- SEO optimization

### [1.0.0] - Production Release
- All core features complete
- Full test coverage
- Production deployment
- Public launch

---

**Changelog Maintained By**: Development Team
**Last Updated**: January 2025

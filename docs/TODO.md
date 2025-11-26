# Been Watching - TODO List

## Priority 1: Critical Features & Bug Fixes

### Authentication & Security
- [x] Fix unauthenticated access to protected routes ✅ (2025-10-18)
  - [x] Added auth checks to admin pages
  - [x] Added auth checks to invite-test page
  - [x] Proper session validation and redirects
  - [x] OAuth error handling page created
- [x] Fix Google OAuth login ✅ (2025-10-18)
  - [x] Fixed redirect URL configuration
  - [x] Created auth error page
  - [x] Updated callback route path
- [x] Add logout functionality ✅ (2025-10-18)
  - [x] Logout on profile page
  - [x] Logout on admin dashboard
  - [x] Logout on invite-test page
- [x] Admin page security ✅ (2025-10-18)
  - [x] User profile display with avatar/initials
  - [x] Admin-only access enforcement
  - [x] Consistent UX across admin pages

### Profile Features
- [x] Complete Top 3 Shows functionality ✅ (2025-10-18)
  - [x] Database migration for top_show_1, top_show_2, top_show_3 columns
  - [x] TopShowModal search and selection UI
  - [x] Season-specific selection for TV shows
  - [x] Display Top 3 shows on My Shows page
  - [x] Interactive click to view details
  - [x] Edit button to change selections
  - [x] Media detail modal integration
  - [ ] Display Top 3 shows on profile page (still pending)
  - [ ] Handle poster image fallbacks

- [ ] Avatar Upload & Management
  - [x] AvatarUploadModal component created
  - [x] Avatar display with fallback to initials
  - [ ] Implement file upload to storage bucket
  - [ ] Add image cropping/resizing
  - [ ] Update profile with avatar URL
  - [ ] Handle avatar deletion

- [x] Privacy Settings ✅ (Partially complete)
  - [x] Toggle for private/public profile (UI complete)
  - [ ] Update RLS policies based on privacy setting
  - [x] Show privacy indicator on profile

### Social Features
- [ ] Friend System
  - [ ] Follow/unfollow users
  - [ ] View followers/following lists
  - [ ] Privacy controls for who can follow
  - [ ] Notifications for new followers

- [ ] Activity Feed Cards (IN PROGRESS - Jan 2025)
  - [x] Card 1: UserActivityCard - React component created
  - [x] Card 1: Mobile test page at /preview/card-1
  - [x] Card 1: iOS input zoom fix (16px fonts)
  - [x] Card 1: Touch icon states working
  - [x] Card 1: Back card scroll working (JS-based)
  - [ ] Card 1: Fine-tune iOS momentum scroll physics
  - [ ] Card 1: Friends list expansion feature
  - [ ] Cards 2-8: Convert remaining HTML designs to React
  - [ ] Feed: Implement vertical scroll with card snap
  - [ ] Feed: Show friend activity (new shows watched, ratings)
  - [ ] Feed: Filter by friends vs all users
  - [ ] Feed: Implement pagination

### My Shows Page
- [ ] Enhanced Filtering
  - [ ] Filter by status (Watching, Completed, Plan to Watch, etc.)
  - [ ] Filter by rating
  - [ ] Filter by media type (TV vs Movies)
  - [ ] Sort options (Recently Added, Title, Rating, Release Date)

- [ ] Bulk Actions
  - [ ] Select multiple shows
  - [ ] Bulk status update
  - [ ] Bulk delete

- [ ] Statistics Dashboard
  - [ ] Total shows/movies tracked
  - [ ] Hours watched calculation
  - [ ] Rating distribution chart
  - [ ] Favorite genres

## Priority 2: UX Improvements

### Search Experience
- [ ] Recent searches history
- [ ] Search suggestions/autocomplete
- [ ] Filter search results by year, genre
- [ ] "Trending" section in search
- [ ] Better loading states with skeleton screens

### Media Cards & Display
- [ ] Add hover effects with more info
- [ ] Quick actions on hover (rate, change status)
- [ ] Better poster image quality handling
- [ ] Fallback images for missing posters

### Responsive Design
- [ ] Mobile optimization for all pages
- [ ] Touch-friendly UI elements
- [ ] Mobile navigation menu
- [ ] Test on various screen sizes

### Performance
- [ ] Implement image lazy loading
- [ ] Optimize TMDB API calls (caching)
- [ ] Reduce bundle size
- [ ] Add loading indicators consistently

## Priority 3: Polish & Enhancement

### UI/UX Polish
- [ ] Consistent spacing and typography
- [ ] Animation refinements
- [ ] Better error messages
- [ ] Empty states for all sections
- [ ] Confirmation dialogs for destructive actions

### Accessibility
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast checks
- [ ] Focus indicators
- [ ] ARIA labels

### SEO & Metadata
- [ ] Add proper meta tags
- [ ] Open Graph tags for social sharing
- [ ] Sitemap generation
- [ ] robots.txt

## Priority 4: Future Features

### Advanced Features
- [ ] Watchlist management
- [ ] Custom lists (e.g., "Best Sci-Fi", "Summer Binge")
- [ ] Show recommendations based on viewing history
- [ ] Export data (CSV, JSON)
- [ ] Import from other platforms (IMDB, Letterboxd)

### Community Features
- [ ] Reviews system
- [ ] Comments on shows
- [ ] User-generated lists (shareable)
- [ ] Badges/achievements

### Notifications
- [ ] Email notifications for new episodes
- [ ] Push notifications for friend activity
- [ ] Reminder for shows releasing soon

### Analytics
- [ ] Track user engagement
- [ ] Popular shows tracking
- [ ] User retention metrics

## Technical Debt

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] Fix all TypeScript `any` types
- [ ] Add proper error boundaries
- [ ] Implement logging system
- [ ] Add unit tests for critical functions
- [ ] Add integration tests for API routes

### Next.js 15 Compatibility
- [ ] Fix async params usage in API routes
  - Currently getting warnings about `params.type` and `params.id` not being awaited
  - Affects: `/api/tmdb/[type]/[id]/videos/route.ts`
- [ ] Audit all dynamic routes for proper async handling

### Database
- [ ] Add database indexes for performance
- [ ] Set up database backups
- [ ] Implement soft deletes
- [ ] Add created_at/updated_at timestamps consistently

### Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Contributing guide

## Bugs to Fix

### Known Issues
- [ ] TopShowModal doesn't show loading state during search
- [ ] Season cards sometimes show undefined for missing data
- [ ] Video modal auto-play can be jarring
- [ ] Profile page doesn't refresh after avatar upload
- [ ] Search modal doesn't clear on close

### Next.js Warnings
- [ ] Fix params async warnings in video API route
- [ ] Address any hydration warnings
- [ ] Fix console warnings in development

## Completed Features ✓

### Core Functionality
- [x] Basic authentication (Supabase)
- [x] Email/password authentication
- [x] Google OAuth authentication
- [x] Logout functionality across all pages
- [x] Protected routes with auth checks
- [x] OAuth error handling
- [x] Home page with trending shows
- [x] Search functionality
- [x] Add shows to tracking
- [x] Rate shows (1-5 stars)
- [x] Update show status
- [x] My Shows page
- [x] Profile page structure
- [x] Database schema for profiles

### Top 3 Shows Feature
- [x] Top 3 shows database migration
- [x] TopShowModal with season selection
- [x] Interactive Top 3 shows on My Shows page
- [x] Click poster to view show details
- [x] Edit button to change selections
- [x] Media detail modal integration

### Admin Features
- [x] Admin dashboard
- [x] Invite system test page
- [x] Admin-only access control
- [x] User profile display on admin pages
- [x] Logout on admin pages
- [x] Admin link on profile page for admin users

### UI/UX
- [x] Liquid glass design system
- [x] Video player modal
- [x] TV season card display
- [x] Search modal with TV/Movie filtering
- [x] Avatar display with initials fallback
- [x] Light/dark mode toggle
- [x] Privacy settings toggle
- [x] Responsive layouts

---

**Last Updated**: October 18, 2025
**Version**: 0.1.0

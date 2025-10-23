# Been Watching - Complete Project Overview

**Version:** 0.1.0 (Alpha)
**Last Updated:** January 23, 2025
**Status:** Active Development - Private Alpha Testing

---

## What is Been Watching?

Been Watching is a **social TV and movie tracking application** that helps users keep track of what they've been watching, share their opinions with friends, and discover new content through people they trust. Think of it as a combination of Instagram's social features with IMDb's content database, designed specifically for TV and movie enthusiasts.

### Elevator Pitch
"Track what you've been watching. Share your favorites. Discover what's next through friends with similar taste."

---

## Core Philosophy

### Social-First Approach
- **Quick Notes + Taste Matching + Real-Time Discovery**
- Public-first (no DMs by design - encourages open community)
- Real relationships through shared content
- Discovery through trusted recommendations

### Key Differentiators
1. **Season-Specific Tracking** - Track individual TV seasons, not just full series (unique feature)
2. **Taste Match Algorithm** - 0-100% compatibility score based on watch history and ratings
3. **Show Notes** - Twitter-like 280-character micro-reviews (KILLER FEATURE)
4. **Invite-Only Alpha** - BOOZEHOUND code system for controlled early access
5. **Mobile-First Design** - 600px max width, Instagram-inspired UI

---

## Technology Stack

### Frontend
- **Next.js 15.5.4** - App Router with Turbopack for fast development
- **React 19.x** - Latest React with Server Components
- **TypeScript** - Full type safety throughout application
- **Inline Styles** - No Tailwind dependency, custom glassmorphic design

### Backend
- **Supabase** - PostgreSQL database with Row-Level Security (RLS)
- **Supabase Auth** - Google OAuth authentication
- **Supabase Realtime** - Live updates for social features

### External APIs
- **TMDB API** - The Movie Database for show/movie metadata
- **API Proxy** - All TMDB calls proxied through `/api/tmdb/[...path]` to hide keys

### Deployment
- **Vercel** - Automatic deployments from GitHub main branch
- **Production URL:** https://beenwatching.com
- **Staging URL:** https://been-watching-v2.vercel.app

---

## Core Features

### 1. Authentication & Onboarding
- Google OAuth login
- Invite code system (BOOZEHOUND code for alpha access)
- Profile setup with username validation (no timestamps allowed)
- Username suggestions based on display name/email

### 2. Show & Movie Tracking
- **Search** - Find any TV show or movie via TMDB integration
- **Season-Specific Tracking** - Each TV season tracked individually (tv-{tmdbId}-s{seasonNumber})
- **Rating System** - Meh (1 star), Like (2 stars), Love (3 stars)
- **Watch Status** - Want to Watch, Watching, Watched
- **My Shows Page** - List view with search and filters
- **Profile Lists** - Grid view organized by status tabs

### 3. Social Features
- **Activity Feed** - Instagram-style feed showing friend activities
- **Likes** - Like/unlike activities with heart icon
- **Comments** - Comment on activities, delete own comments
- **Follow System** - Follow/unfollow users, mutual friends
- **Taste Match** - 0-100% compatibility score with other users
- **User Profiles** - Public profiles at `/user/[username]`

### 4. Discovery
- **Trending Shows** - Top 3 trending from TMDB
- **Friend Suggestions** - Smart suggestions based on:
  - Mutual friends (highest priority)
  - Taste match score (70%+)
  - Same invite tier (Boozehounds)
  - Recent activity
- **Search Friends** - Real-time search by username or display name

### 5. Theme System
- **3-State Toggle** - Auto (system), Light, Dark
- **Glassmorphic Design** - Liquid glass aesthetic with backdrop blur
- **Theme Persistence** - Saved to user profile in database
- **Dark Mode Default** - Optimized for OLED screens

### 6. Top 3 Shows
- Users can set their 3 favorite shows
- Displayed on profile with numbered badges (1, 2, 3)
- Stored in `top_shows` table (normalized schema)
- Clickable to open detail modal

---

## Database Schema

### Core Tables

#### profiles
```sql
- id: UUID (primary key, references auth.users)
- username: TEXT (unique, lowercase)
- display_name: TEXT
- bio: TEXT
- avatar_url: TEXT
- is_private: BOOLEAN (default: false)
- is_approved: BOOLEAN (default: false, for invite system)
- invite_tier: TEXT (e.g., 'boozehound')
- invited_by_master_code: TEXT
- is_admin: BOOLEAN
- theme_preference: TEXT (default: 'dark')
- created_at: TIMESTAMPTZ
```

#### media
```sql
- id: TEXT (primary key, format: 'movie-{tmdbId}' or 'tv-{tmdbId}-s{season}')
- tmdb_id: INTEGER
- media_type: TEXT ('movie' or 'tv')
- title: TEXT
- poster_path: TEXT
- overview: TEXT
- release_date: DATE
- vote_average: NUMERIC
- tmdb_data: JSONB (full TMDB response cached)
```

#### watch_status
```sql
- user_id: UUID (references profiles)
- media_id: TEXT (references media)
- status: TEXT ('want', 'watching', 'watched')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
PRIMARY KEY (user_id, media_id)
```

#### ratings
```sql
- user_id: UUID (references profiles)
- media_id: TEXT (references media)
- rating: TEXT ('meh', 'like', 'love')
- my_take: TEXT (optional short review)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
PRIMARY KEY (user_id, media_id)
```

#### activities
```sql
- id: UUID (primary key)
- user_id: UUID (references profiles)
- media_id: TEXT (references media)
- activity_type: TEXT ('rating', 'status_change')
- activity_data: JSONB (rating, status, etc.)
- created_at: TIMESTAMPTZ
```

#### follows
```sql
- id: UUID (primary key)
- follower_id: UUID (references profiles)
- following_id: UUID (references profiles)
- status: TEXT (default: 'accepted')
- created_at: TIMESTAMPTZ
UNIQUE (follower_id, following_id)
```

#### comments
```sql
- id: UUID (primary key)
- activity_id: UUID (references activities)
- user_id: UUID (references profiles)
- comment_text: TEXT
- created_at: TIMESTAMPTZ
```

#### activity_likes
```sql
- id: UUID (primary key)
- activity_id: UUID (references activities)
- user_id: UUID (references profiles)
- created_at: TIMESTAMPTZ
UNIQUE (activity_id, user_id)
```

#### top_shows
```sql
- id: UUID (primary key)
- user_id: UUID (references profiles)
- media_id: TEXT (references media)
- position: INTEGER (1, 2, or 3)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
UNIQUE (user_id, position)
UNIQUE (user_id, media_id)
```

#### notifications
```sql
- id: UUID (primary key)
- user_id: UUID (references profiles)
- type: TEXT ('like', 'comment', 'follow', 'show_note')
- actor_id: UUID (user who triggered notification)
- activity_id: UUID (optional)
- show_note_id: UUID (optional)
- is_read: BOOLEAN (default: false)
- created_at: TIMESTAMPTZ
```

#### show_notes (planned, not yet implemented)
```sql
- id: UUID (primary key)
- user_id: UUID (references profiles)
- media_id: TEXT (references media)
- note_text: TEXT (max 280 chars)
- visibility: TEXT ('public' or 'private')
- created_at: TIMESTAMPTZ
```

---

## Key Technical Patterns

### 1. Season-Specific Media IDs
**Critical:** TV shows are ALWAYS tracked by individual season, never as full series.

```typescript
// Format examples:
'movie-157336'           // Movie: Interstellar
'tv-110492-s1'          // TV: High Potential Season 1
'tv-1396-s5'            // TV: Breaking Bad Season 5

// When adding from "Want to Watch", default to Season 1
// When watching/watched, use specific season number
```

### 2. Taste Match Algorithm
Located in `utils/tasteMatch.ts`:

```typescript
// Score calculation (0-100):
- 60% weight on rating agreement
- 40% weight on watch overlap

// Categories:
- 90-100: Exceptional Match 🔥
- 70-89: Great Match ⭐
- 50-69: Good Match 👍
- 30-49: Fair Match ✓
- 0-29: Different Taste •
```

### 3. Username Validation
Located in `utils/usernameValidation.ts`:

```typescript
// Rules:
- 3-20 characters
- Lowercase letters, numbers, underscores only
- NO timestamps (username_1234567890123)
- NO numbers-only usernames
- Must be unique in database

// Auto-generated usernames are forced to customize
```

### 4. Theme System
Located in `contexts/ThemeContext.tsx`:

```typescript
// Three states:
'auto'  - Follows system preference
'light' - Force light mode
'dark'  - Force dark mode (default)

// Persisted to user profile, syncs across devices
```

### 5. Privacy Controls
```typescript
// Profile visibility:
is_private = true  → Activities only visible to followers
is_private = false → Activities public to all users

// Activity visibility check:
canViewActivities = !profile.is_private || isFollowing || isOwnProfile
```

---

## File Structure

```
been-watching-v2/
├── app/
│   ├── api/
│   │   ├── auth/callback/route.ts        # OAuth callback handler
│   │   ├── tmdb/[...path]/route.ts       # TMDB API proxy
│   │   └── debug/                        # Debug endpoints (dev only)
│   ├── about/page.tsx                     # About page
│   ├── admin/page.tsx                     # Admin dashboard (requires is_admin)
│   ├── auth/page.tsx                      # Login page
│   ├── ccpa/page.tsx                      # CCPA compliance page
│   ├── community-guidelines/page.tsx      # Community guidelines
│   ├── contact/page.tsx                   # Contact page
│   ├── cookies/page.tsx                   # Cookie policy
│   ├── help/page.tsx                      # Help/FAQ
│   ├── myshows/page.tsx                   # My Shows (list view)
│   ├── privacy/page.tsx                   # Privacy policy
│   ├── profile/page.tsx                   # Own profile (tabs view)
│   ├── terms/page.tsx                     # Terms of service
│   ├── user/[username]/page.tsx           # Public user profiles
│   ├── welcome/page.tsx                   # Landing page
│   ├── page.tsx                           # Home feed
│   ├── layout.tsx                         # Root layout with ThemeProvider
│   └── globals.css                        # Global styles + CSS variables
├── components/
│   ├── auth/                              # Auth components
│   ├── feed/
│   │   └── ActivityCard.tsx               # Feed activity items
│   ├── friends/
│   │   └── UserCard.tsx                   # User discovery cards
│   ├── media/
│   │   ├── MediaCard.tsx                  # Show/movie cards
│   │   ├── MediaDetailModal.tsx           # Detail modal with rate/status
│   │   └── MediaBadges.tsx                # Rating/status badges
│   ├── navigation/
│   │   ├── BottomNav.tsx                  # Mobile bottom nav
│   │   └── Footer.tsx                     # Footer component
│   ├── onboarding/
│   │   ├── InviteCodeGate.tsx             # Invite code validation
│   │   └── ProfileSetup.tsx               # Username/profile setup
│   ├── profile/
│   │   └── TopShowModal.tsx               # Top 3 shows selector
│   ├── search/
│   │   ├── SearchModal.tsx                # Global search modal
│   │   └── TVSeasonCard.tsx               # Individual season cards
│   └── theme/
│       └── ThemeToggle.tsx                # Theme switcher button
├── contexts/
│   └── ThemeContext.tsx                   # Theme state management
├── utils/
│   ├── supabase/
│   │   ├── client.ts                      # Browser Supabase client
│   │   └── server.ts                      # Server Supabase client
│   ├── tasteMatch.ts                      # Taste match algorithm
│   └── usernameValidation.ts              # Username validation utilities
├── hooks/
│   └── useDebounce.ts                     # Debounce hook for search
├── supabase/
│   ├── schema.sql                         # Full database schema
│   ├── migration-*.sql                    # Individual migrations
│   └── add-theme-preference.sql           # Theme column migration
├── scripts/
│   ├── migrate-*.js                       # Data migration scripts
│   ├── setup-boozehounds.js               # Alpha user setup
│   └── check-*.js                         # Database inspection utilities
├── public/
│   └── footer-preview.html                # Footer design preview
├── .env.local                              # Environment variables (gitignored)
├── .env.example                            # Example environment template
├── middleware.ts                           # Auth middleware
├── next.config.mjs                         # Next.js configuration
├── tsconfig.json                           # TypeScript configuration
└── package.json                            # Dependencies and scripts
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]  # For migrations only

# TMDB API
TMDB_API_KEY=[your-tmdb-api-key]

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Dev
NEXT_PUBLIC_APP_URL=https://beenwatching.com  # Production
```

---

## Design System

### Colors

#### Brand Gradient
```css
linear-gradient(135deg, #e94d88 0%, #f27121 100%)
```

#### Dark Mode
```css
Background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)
Card Background: rgba(255, 255, 255, 0.05)
Card Border: rgba(255, 255, 255, 0.1)
Text Primary: #ffffff
Text Secondary: rgba(255, 255, 255, 0.6)
Text Tertiary: rgba(255, 255, 255, 0.4)
```

#### Light Mode
```css
Background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)
Card Background: rgba(255, 255, 255, 0.95)
Card Border: rgba(0, 0, 0, 0.1)
Text Primary: #1a1a1a
Text Secondary: #666666
Text Tertiary: #999999
```

#### Status/Rating Colors
```css
Love (3 stars): #FF2D55
Like (2 stars): #007AFF
Meh (1 star): #8E8E93
Want to Watch: #007AFF
Watching: #34C759
Watched: #8E8E93
```

### Typography
```css
Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Headers: 700 weight
Body: 400 weight
Links: 600 weight
```

### Spacing & Borders
```css
Border Radius: 12px (consistent across all cards)
Max Width: 600px (mobile-first constraint)
Backdrop Blur: 20px (glassmorphic effect)
Shadow: 0 20px 60px rgba(0, 0, 0, 0.5) (dark mode)
```

---

## Current Status (January 2025)

### Completed Features ✅
- Authentication with Google OAuth
- Invite code system (BOOZEHOUND)
- Profile setup and username validation
- Season-specific TV show tracking
- Rating system (Meh/Like/Love)
- Watch status tracking (Want/Watching/Watched)
- Activity feed with likes and comments
- Follow/unfollow system
- Taste match algorithm
- User profile pages
- Search and discovery
- Theme system (Auto/Light/Dark)
- Top 3 Shows feature
- Admin dashboard with social metrics
- Custom domain (beenwatching.com)
- Privacy controls
- Legal pages (Privacy, Terms, CCPA, etc.)

### In Testing 🧪
- Migration scripts for Boozehounds data import
- Notification system (database ready, UI pending)
- Show notes feature (database ready, UI pending)

### Not Yet Built ❌
- Direct Messages (INTENTIONALLY NOT BUILDING - public-first approach)
- Push notifications
- Email notifications
- Episode-level tracking (currently season-level)
- Show recommendations algorithm
- Advanced search filters
- Export user data
- Account deletion flow

---

## Known Issues & Technical Debt

### Minor Issues
1. **Next.js 15 Params Warnings** - Console warnings about async params (not breaking, Sentry filters)
2. **Avatar URLs** - Google OAuth sometimes doesn't provide avatar URLs (fallback to initials works)
3. **TMDB Rate Limiting** - 40 requests/10 seconds (need request queuing for bulk imports)

### Technical Debt
1. **ActivityCard Component** - Still using global CSS instead of inline styles (needs refactor for theme consistency)
2. **Media Detail Modal** - Not fully theme-aware (works but could be improved)
3. **Mobile Responsiveness** - Some pages need better mobile optimization
4. **Type Safety** - Some `any` types need proper TypeScript interfaces
5. **Error Handling** - Need more comprehensive error boundaries

### Security Considerations
1. **RLS Policies** - All tables have Row-Level Security enabled
2. **Service Role Key** - Only used server-side, never exposed to client
3. **TMDB API Key** - Proxied through API route, never exposed
4. **OAuth Tokens** - Managed by Supabase Auth, httpOnly cookies

---

## User Roles & Permissions

### Regular User
- Can add/rate shows
- Can follow other users
- Can like/comment on activities
- Can view public profiles
- Can see own followers/following

### Admin User (`is_admin = true`)
- All regular user permissions
- Access to `/admin` dashboard
- View user statistics
- View social metrics
- Cannot directly modify other users' data (by design)

### Private Profile User (`is_private = true`)
- Activities only visible to followers
- Profile visible to all (but activities hidden)
- Can still follow others and see public content

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000

# Build for production (test)
npm run build

# TypeScript check
npx tsc --noEmit
```

### Git Workflow
```bash
# Make changes
git add .
git commit -m "Description of changes

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

### Deployment
- **Automatic:** Push to GitHub main branch → Vercel deploys
- **Manual:** Use Vercel dashboard to trigger deployment
- **Rollback:** Use Vercel dashboard to revert to previous deployment

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Sign in with Google OAuth
- [ ] Enter invite code (BOOZEHOUND)
- [ ] Set up username and profile
- [ ] Search for a TV show
- [ ] Add Season 1 to Want to Watch
- [ ] Rate it (Like)
- [ ] Move to Watching
- [ ] Move to Watched
- [ ] See activity in feed
- [ ] Like own activity
- [ ] Comment on activity
- [ ] Search for friends
- [ ] Follow a user
- [ ] View their profile
- [ ] Check taste match score
- [ ] Set Top 3 Shows
- [ ] Toggle theme (Auto/Light/Dark)
- [ ] Check mobile responsiveness

### Database Integrity Checks
```sql
-- Check for orphaned activities (media_id doesn't exist in media table)
SELECT a.* FROM activities a
LEFT JOIN media m ON a.media_id = m.id
WHERE m.id IS NULL;

-- Check for duplicate follows
SELECT follower_id, following_id, COUNT(*)
FROM follows
GROUP BY follower_id, following_id
HAVING COUNT(*) > 1;

-- Check for users without usernames
SELECT * FROM profiles
WHERE username IS NULL OR username = '';

-- Check for auto-generated usernames (need to be fixed)
SELECT * FROM profiles
WHERE username ~ '_[0-9]{13}$';
```

---

## Monitoring & Analytics

### Admin Dashboard Metrics
- Total users
- Total shows/movies tracked
- Total activities
- Total follows
- Most active users (30 days)
- Most followed users
- Orphaned users (0 follows)
- Average follows per user

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking
- Geographic distribution

### Supabase Dashboard
- Database size
- API request volume
- Active connections
- Query performance

---

## Support & Maintenance

### Common User Issues

**Issue:** "I can't log in"
- **Solution:** Check that Google OAuth is configured in Supabase dashboard
- Verify redirect URLs include both localhost and production domain

**Issue:** "My activities aren't showing"
- **Solution:** Check privacy settings (is_private)
- Verify activity triggers are working in database

**Issue:** "Search isn't finding my show"
- **Solution:** TMDB API might be down or rate-limited
- Try searching on TMDB directly to verify show exists
- Check TMDB API key is valid

**Issue:** "Theme won't stay dark"
- **Solution:** Clear browser cache
- Check theme_preference in profiles table
- Verify theme state is saving to database

### Database Maintenance

#### Weekly Tasks
- Review error logs in Vercel
- Check Supabase disk usage
- Review slow queries in Supabase performance dashboard

#### Monthly Tasks
- Backup database (Supabase handles automatic backups)
- Review and archive old notifications (if > 10,000 rows)
- Check for orphaned media records (no watch_status or ratings)

#### As Needed
- Update TMDB API key if rotated
- Rotate Supabase service role key
- Update OAuth credentials if changed

---

## Future Considerations

### Scalability
- **Current Capacity:** ~1,000 active users (Supabase free tier)
- **Database Size:** ~500MB with current schema
- **Next Tier:** Supabase Pro ($25/mo) at ~10,000 users

### Performance Optimizations
- Implement request queuing for TMDB API calls
- Add Redis cache for frequently accessed data
- Optimize activity feed queries with pagination
- Add indexes for common query patterns

### Feature Requests (from users)
- Episode-level tracking (instead of just seasons)
- Show recommendations based on taste match
- Export watch history to CSV
- Import from other platforms (Letterboxd, IMDb)
- Browser extension for quick adding

---

## Contact & Resources

### Production
- **Website:** https://beenwatching.com
- **Support Email:** support@beenwatching.com
- **General Inquiries:** hello@beenwatching.com

### Development
- **GitHub:** https://github.com/murtopia/been-watching
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard/project/udfhqiipppybkuxpycay

### APIs
- **TMDB Docs:** https://developer.themoviedb.org/docs
- **Supabase Docs:** https://supabase.com/docs

---

**Document Version:** 1.0
**Created:** January 23, 2025
**Purpose:** Comprehensive overview for new developers joining the project

# Been Watching - Project Overview

## Project Description

**Been Watching** is a modern, social TV show and movie tracking application. Users can search for shows, track what they're watching, rate content, and share their viewing habits with friends. The app features a beautiful "liquid glass" design aesthetic with smooth animations and an intuitive user experience.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **Build Tool**: Turbopack
- **Language**: TypeScript
- **Styling**: CSS-in-JS (inline styles), Tailwind CSS
- **React Version**: 19.x

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **External API**: The Movie Database (TMDB) API

### Hosting & Deployment
- **Platform**: TBD (Vercel recommended for Next.js)
- **Database Hosting**: Supabase Cloud
- **Storage**: Supabase Storage (for avatars, planned)

## Project Structure

```
been-watching-v2/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── tmdb/                 # TMDB API proxy routes
│   │   └── user-media/           # User media tracking endpoints
│   ├── myshows/                  # User's tracked shows page
│   ├── profile/                  # User profile page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── media/                    # Media display components
│   ├── navigation/               # Navigation components
│   ├── profile/                  # Profile-specific components
│   └── search/                   # Search modal and components
├── docs/                         # Project documentation
├── lib/                          # Utility functions
├── public/                       # Static assets
├── supabase/                     # Supabase migrations and config
├── scripts/                      # Utility scripts
├── .env.local                    # Environment variables (not in git)
└── package.json
```

## Key Features

### Current Features
1. **Authentication**
   - Email/password signup and login
   - Session management via Supabase
   - Protected routes (partial implementation)

2. **Content Discovery**
   - Search TV shows and movies via TMDB API
   - Browse trending content on home page
   - View detailed show information
   - Watch trailers in-app

3. **Content Tracking**
   - Add shows to personal collection
   - Rate shows (1-5 stars)
   - Set viewing status (Watching, Completed, Plan to Watch, etc.)
   - Track TV shows by season

4. **Profile**
   - User profile page
   - Top 3 shows selection (in progress)
   - Avatar upload (planned)
   - Privacy settings (planned)

5. **Design System**
   - "Liquid glass" aesthetic (semi-transparent white backgrounds with backdrop blur)
   - Gradient accents (pink to orange)
   - Smooth animations and transitions
   - Responsive layout (needs mobile optimization)

### Planned Features
- Social features (following, activity feed)
- Enhanced filtering and sorting
- Statistics dashboard
- Watchlist management
- Custom lists
- Notifications
- Recommendations

## Database Schema

### Core Tables

#### `profiles`
Stores user profile information.
```sql
- id (uuid, primary key, references auth.users)
- username (text, unique)
- display_name (text)
- bio (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
- top_show_1 (jsonb) - Top show #1
- top_show_2 (jsonb) - Top show #2
- top_show_3 (jsonb) - Top show #3
- is_private (boolean) - Privacy setting
```

#### `user_media`
Tracks shows/movies added by users.
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> profiles)
- tmdb_id (integer) - TMDB ID
- media_type (text) - 'tv' or 'movie'
- title (text)
- poster_path (text)
- rating (integer) - 1-5 stars
- status (text) - viewing status
- season_number (integer, nullable) - For TV shows
- created_at (timestamp)
- updated_at (timestamp)
```

#### `follows` (planned)
Social following system.
```sql
- id (uuid, primary key)
- follower_id (uuid, foreign key -> profiles)
- following_id (uuid, foreign key -> profiles)
- created_at (timestamp)
```

### Row Level Security (RLS)

RLS policies are enabled on all tables to ensure users can only access their own data and public profiles.

## API Architecture

### TMDB API Proxy
All TMDB API calls are proxied through Next.js API routes to keep the API key secure.

**Endpoints:**
- `/api/tmdb/search/multi` - Search for shows/movies
- `/api/tmdb/trending/[mediaType]/[timeWindow]` - Get trending content
- `/api/tmdb/tv/[id]` - Get TV show details
- `/api/tmdb/movie/[id]` - Get movie details
- `/api/tmdb/[type]/[id]/videos` - Get trailers/videos

### User Media API
Handles user's tracked shows.

**Endpoints:**
- `GET /api/user-media` - Fetch user's tracked media
- `POST /api/user-media` - Add new media
- `PATCH /api/user-media/[id]` - Update rating/status
- `DELETE /api/user-media/[id]` - Remove media

## Design System

### Color Palette
- **Background**: Dark gradient (#0a0a0a to #1a0a1a)
- **Glass Panels**: rgba(255, 255, 255, 0.05-0.1) with backdrop-blur
- **Accent Gradient**: Linear gradient from #e94d88 (pink) to #f27121 (orange)
- **Text**: White primary, rgba(255,255,255,0.7) secondary

### Typography
- **Primary Font**: System fonts (Inter-based)
- **Headings**: Bold, white
- **Body**: Regular, semi-transparent white

### Component Patterns
- **Modal**: Fixed overlay with centered glass panel, max-height 85vh
- **Card**: White background, subtle shadow, rounded corners
- **Button**: Gradient background for primary, glass for secondary
- **Input**: Glass background with border, focus state with gradient

## Development Workflow

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- TMDB API key

### Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Add Supabase and TMDB credentials
5. Run migrations in Supabase SQL Editor
6. Start dev server: `npm run dev`

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TMDB_API_KEY=
```

### Development Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Common Patterns & Conventions

### Data Flow for Media Selection
1. User searches in SearchModal or TopShowModal
2. For TV shows, fetch all seasons from TMDB
3. Display each season as a separate selectable card
4. On selection, create media object with format:
   ```typescript
   {
     id: 'tv-{tmdbId}-s{seasonNumber}' | movieId,
     title: string,
     poster_path: string,
     media_type: 'tv' | 'movie',
     season_number?: number,
     tmdb_id: number
   }
   ```
5. Save to database via API route

### Component Architecture
- **Container Components**: Handle data fetching and state management
- **Presentation Components**: Receive props and render UI
- **Modal Components**: Use portal pattern, handle own open/close state
- **Card Components**: Reusable across search, my shows, profile

### State Management
- Local component state with `useState`
- Server state via Supabase realtime (not yet implemented)
- No global state management library (keep it simple)

## Testing Strategy (To Be Implemented)

### Unit Tests
- Utility functions
- API route handlers
- Component logic

### Integration Tests
- API endpoints with database
- Authentication flows
- Media tracking operations

### E2E Tests
- User signup/login
- Search and add show
- Rate and update status
- Profile management

## Deployment Strategy (Planned)

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set up automatic deployments on push to main
4. Configure preview deployments for PRs

### Database Migrations
- Run migrations manually in Supabase dashboard
- Consider using Supabase CLI for automated migrations
- Keep migration history in `/supabase` folder

## Performance Considerations

### Optimization Opportunities
1. **Image Optimization**
   - Use Next.js Image component for posters
   - Implement lazy loading
   - Serve appropriately sized images from TMDB

2. **API Caching**
   - Cache TMDB responses (trending, show details)
   - Implement stale-while-revalidate pattern
   - Consider Redis for production caching

3. **Database Queries**
   - Add indexes on frequently queried columns
   - Optimize RLS policies
   - Implement pagination for large datasets

4. **Bundle Size**
   - Code splitting by route (automatic with App Router)
   - Dynamic imports for heavy components (modals)
   - Tree shaking for unused code

## Security Considerations

### Current Security Measures
- API keys hidden on server-side
- Row Level Security on database
- Session-based authentication

### Additional Security Needed
- Rate limiting on API routes
- Input validation and sanitization
- CSRF protection
- Content Security Policy headers
- SQL injection prevention (Supabase handles this)

## Known Issues & Technical Debt

### Next.js 15 Compatibility
- **Issue**: API routes using `params` synchronously
- **Warning**: "params should be awaited before using its properties"
- **Affected Files**: `/api/tmdb/[type]/[id]/videos/route.ts`
- **Fix**: Update to `const { type, id } = await params`

### TypeScript
- Many components use `any` types
- Need to create proper interfaces for TMDB responses
- Need to create proper types for user media

### Error Handling
- Inconsistent error handling across components
- Need centralized error boundary
- Need better user-facing error messages

### Accessibility
- Missing ARIA labels
- Keyboard navigation not fully implemented
- Color contrast needs verification

## Resources & Documentation

### External APIs
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)

### Design References
- "Liquid glass" design inspiration
- Gradient color scheme: Pink (#e94d88) to Orange (#f27121)

### Key Dependencies
- next@15.5.4
- react@19.x
- @supabase/supabase-js
- typescript

---

**Project Start Date**: 2024
**Current Version**: 0.1.0 (Alpha)
**Status**: Active Development
**Primary Developer**: Claude AI + User collaboration

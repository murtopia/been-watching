# Architecture Documentation

This document provides a detailed overview of the Been Watching application architecture.

## Table of Contents
- [System Overview](#system-overview)
- [Architecture Diagrams](#architecture-diagrams)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)

---

## System Overview

Been Watching is a full-stack web application built with modern technologies for tracking TV shows and movies with social features.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React 19 + Next.js 15 App               │  │
│  │                    (App Router)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Routes Layer                    │  │
│  │  ┌──────────────┐         ┌──────────────┐          │  │
│  │  │  TMDB Proxy  │         │  User Media  │          │  │
│  │  │    Routes    │         │    Routes    │          │  │
│  │  └──────┬───────┘         └──────┬───────┘          │  │
│  └─────────┼────────────────────────┼──────────────────┘  │
└────────────┼────────────────────────┼─────────────────────┘
             │                        │
             │ REST API               │ PostgreSQL Protocol
             ▼                        ▼
  ┌──────────────────┐    ┌──────────────────────┐
  │   TMDB API       │    │   Supabase Backend   │
  │  (External)      │    │  ┌────────────────┐  │
  │                  │    │  │   PostgreSQL   │  │
  └──────────────────┘    │  │    Database    │  │
                          │  └────────────────┘  │
                          │  ┌────────────────┐  │
                          │  │  Supabase Auth │  │
                          │  └────────────────┘  │
                          │  ┌────────────────┐  │
                          │  │ Storage Bucket │  │
                          │  │   (Planned)    │  │
                          │  └────────────────┘  │
                          └──────────────────────┘
```

---

## Architecture Diagrams

### Request Flow Diagram

#### User Searches for a Show

```
User Types in Search Box
        ┃
        ┃ Debounced input
        ▼
  SearchModal Component
        ┃
        ┃ fetch('/api/tmdb/search/multi?query=...')
        ▼
  Next.js API Route: /api/tmdb/search/multi
        ┃
        ┃ Uses server-side TMDB_API_KEY
        ▼
  TMDB External API
        ┃
        ┃ Returns JSON results
        ▼
  Next.js API Route
        ┃
        ┃ Returns to client
        ▼
  SearchModal Component
        ┃
        ┃ Renders results
        ▼
  User Sees Search Results
```

#### User Adds Show to Tracking

```
User Clicks "Add" on Season Card
        ┃
        ┃ onSelect(mediaData, rating, status)
        ▼
  SearchModal / TVSeasonCard
        ┃
        ┃ POST /api/user-media
        ┃ Body: { tmdb_id, title, rating, status, ... }
        ▼
  Next.js API Route: /api/user-media
        ┃
        ┃ 1. Check authentication
        ┃    supabase.auth.getUser()
        ┃
        ┃ 2. Validate input
        ┃
        ┃ 3. Insert to database
        ┃    supabase.from('user_media').insert()
        ▼
  Supabase Database
        ┃
        ┃ Row Level Security checks
        ┃ Returns created record
        ▼
  Next.js API Route
        ┃
        ┃ Returns success response
        ▼
  SearchModal Component
        ┃
        ┃ Shows success message
        ┃ Refreshes data
        ▼
  User Sees Updated UI
```

---

## Data Flow

### Authentication Flow

```
1. User visits app
   └─> Supabase checks for session cookie
       ├─> If valid: User authenticated
       └─> If invalid: Redirect to login

2. User logs in
   └─> LoginModal sends credentials
       └─> Supabase Auth validates
           ├─> Success: Set session cookie, redirect
           └─> Failure: Show error

3. Authenticated requests
   └─> API routes call supabase.auth.getUser()
       └─> Supabase validates session token
           ├─> Valid: Proceed with request
           └─> Invalid: Return 401
```

### Data Fetching Flow

```
Component Mount
     ┃
     ┃ useEffect()
     ▼
Fetch Data from API
     ┃
     ┃ Loading state shown
     ▼
API Route Processes Request
     ┃
     ├─> External API (TMDB)
     └─> Database (Supabase)
     ┃
     ▼
Return Data
     ┃
     ▼
Component Updates State
     ┃
     ▼
Render UI with Data
```

---

## Component Architecture

### Component Hierarchy

```
App Layout (layout.tsx)
├── NavBar
│   ├── Logo
│   ├── Navigation Links
│   └── User Menu
│       ├── Login Button (if not authenticated)
│       └── User Avatar + Dropdown (if authenticated)
│
├── Home Page (page.tsx)
│   ├── Hero Section
│   └── Trending Shows
│       └── MediaCard (multiple)
│           ├── Poster Image
│           ├── Title
│           ├── Video Play Button
│           └── Quick Add Button
│
├── My Shows Page (myshows/page.tsx)
│   ├── Page Header
│   ├── Filter Controls (planned)
│   └── Media Grid
│       └── MediaCard (multiple)
│           ├── Poster
│           ├── Title
│           ├── Rating Display
│           ├── Status Badge
│           └── Action Buttons
│               ├── Edit Rating
│               ├── Change Status
│               └── Remove
│
├── Profile Page (profile/page.tsx)
│   ├── Profile Header
│   │   ├── Avatar
│   │   ├── Display Name
│   │   └── Bio
│   ├── Top 3 Shows Section
│   │   └── Top Show Slots (3)
│   │       ├── Empty Slot (if not set)
│   │       └── Media Card (if set)
│   └── Statistics (planned)
│
└── Modals (rendered at root level)
    ├── SearchModal
    │   ├── Search Input
    │   ├── Media Type Filter
    │   ├── Results List
    │   │   ├── For TV Shows:
    │   │   │   └── TVShowWithSeasons
    │   │   │       └── TVSeasonCard (multiple)
    │   │   └── For Movies:
    │   │       └── SearchResultCard
    │   └── Rating/Status Selectors
    │
    ├── TopShowModal
    │   ├── Search Input
    │   ├── Media Type Filter
    │   ├── Results List
    │   │   ├── For TV Shows:
    │   │   │   └── TVShowWithSeasons
    │   │   │       └── SeasonSelectCard (multiple)
    │   │   └── For Movies:
    │   │       └── MovieResultCard
    │   └── "Add to Top #N" Buttons
    │
    ├── VideoModal
    │   └── YouTube Embed
    │
    ├── LoginModal
    │   └── Email/Password Form
    │
    └── SignupModal
        └── Email/Password/Confirm Form
```

### Component Communication Patterns

#### Parent-Child Props Flow
```typescript
// Parent passes data down
<MediaCard
  media={showData}
  onRate={handleRate}
  onRemove={handleRemove}
/>

// Child calls callbacks
const MediaCard = ({ media, onRate, onRemove }) => {
  return (
    <div>
      <button onClick={() => onRate(media.id, 5)}>Rate 5 Stars</button>
      <button onClick={() => onRemove(media.id)}>Remove</button>
    </div>
  )
}
```

#### Modal Pattern
```typescript
// Parent manages modal state
const [showModal, setShowModal] = useState(false)

// Parent renders modal conditionally
{showModal && (
  <Modal onClose={() => setShowModal(false)}>
    <ModalContent />
  </Modal>
)}
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │ (Supabase Auth)
│─────────────────────│
│ id (uuid, PK)       │
│ email               │
│ created_at          │
└──────────┬──────────┘
           │ 1:1
           │
┌──────────┴──────────┐
│   profiles          │
│─────────────────────│
│ id (uuid, PK, FK)   │◄────┐
│ username            │     │
│ display_name        │     │ 1:N
│ bio                 │     │
│ avatar_url          │     │
│ top_show_1 (jsonb)  │     │
│ top_show_2 (jsonb)  │     │
│ top_show_3 (jsonb)  │     │
│ is_private (bool)   │     │
│ created_at          │     │
│ updated_at          │     │
└─────────────────────┘     │
                            │
                            │
┌─────────────────────┐     │
│   user_media        │     │
│─────────────────────│     │
│ id (uuid, PK)       │     │
│ user_id (uuid, FK)  │─────┘
│ tmdb_id (int)       │
│ title (text)        │
│ poster_path (text)  │
│ media_type (text)   │
│ season_number (int) │
│ rating (int)        │
│ status (text)       │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│   follows           │ (Planned)
│─────────────────────│
│ id (uuid, PK)       │
│ follower_id (FK)    │───┐
│ following_id (FK)   │   │
│ created_at          │   │
└─────────────────────┘   │
           │              │
           └──────────────┘
              Both reference profiles.id
```

### Data Types & Constraints

#### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  top_show_1 JSONB,
  top_show_2 JSONB,
  top_show_3 JSONB,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
```

#### user_media table
```sql
CREATE TABLE user_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('tv', 'movie')),
  season_number INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: user can only track the same show/season once
  UNIQUE(user_id, tmdb_id, season_number)
);

-- Indexes
CREATE INDEX idx_user_media_user_id ON user_media(user_id);
CREATE INDEX idx_user_media_tmdb_id ON user_media(tmdb_id);
```

### JSONB Structure for Top Shows

```json
{
  "id": "tv-110492-s1",
  "title": "High Potential - Season 1",
  "poster_path": "/path/to/poster.jpg",
  "media_type": "tv",
  "season_number": 1,
  "tmdb_id": 110492
}
```

---

## Security Architecture

### Authentication Security

```
┌─────────────────────────────────────────────────────────┐
│                  Authentication Layer                    │
│                                                           │
│  1. User Login                                            │
│     └─> Supabase Auth validates credentials              │
│         └─> JWT token issued                             │
│             └─> HttpOnly cookie set                      │
│                                                           │
│  2. API Request                                           │
│     └─> Cookie automatically sent                        │
│         └─> Supabase validates JWT                       │
│             ├─> Valid: Request proceeds                  │
│             └─> Invalid: 401 Unauthorized                │
│                                                           │
│  3. Session Expiry                                        │
│     └─> JWT expires after configured time                │
│         └─> Refresh token used to get new JWT            │
│             └─> User stays logged in                     │
└─────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS)

Supabase Row Level Security ensures users can only access their own data.

#### Example RLS Policy for user_media

```sql
-- Users can only see their own media
CREATE POLICY "Users can view own media"
  ON user_media FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own media
CREATE POLICY "Users can insert own media"
  ON user_media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own media
CREATE POLICY "Users can update own media"
  ON user_media FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own media
CREATE POLICY "Users can delete own media"
  ON user_media FOR DELETE
  USING (auth.uid() = user_id);
```

### API Security

```
┌────────────────────────────────────────────┐
│           API Security Layers               │
│                                             │
│  1. Environment Variables                   │
│     └─> API keys stored in .env.local       │
│         └─> Never committed to git          │
│                                             │
│  2. Server-Side API Routes                  │
│     └─> TMDB calls only from server         │
│         └─> API key never exposed to client │
│                                             │
│  3. Authentication Checks                   │
│     └─> User identity verified on each req  │
│         └─> Unauthorized requests rejected  │
│                                             │
│  4. Input Validation (Partial)              │
│     └─> Request body validated              │
│         └─> Invalid input rejected          │
│                                             │
│  5. CORS Policy                             │
│     └─> Same-origin requests only           │
│         └─> Cross-origin blocked            │
└────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Limitations
- No caching layer
- Synchronous API calls
- Single database region
- No CDN for static assets

### Future Optimizations

#### Caching Strategy
```
┌─────────────────────────────────────────────────────────┐
│                    Caching Architecture                  │
│                                                           │
│  Client (Browser)                                         │
│    └─> Browser Cache (Images)                            │
│                                                           │
│  Server (Next.js)                                         │
│    └─> Redis Cache                                       │
│        ├─> TMDB responses (5 min TTL)                    │
│        ├─> User media lists (invalidate on write)        │
│        └─> Trending data (1 hour TTL)                    │
│                                                           │
│  CDN (Planned)                                            │
│    └─> Static assets (posters, videos)                   │
└─────────────────────────────────────────────────────────┘
```

#### Database Optimization
- Add composite indexes for common queries
- Implement connection pooling
- Use read replicas for heavy read operations
- Partition large tables by date

#### Performance Monitoring
```
Application Performance Monitoring (APM)
├── API Response Times
├── Database Query Performance
├── Error Rates
├── User Engagement Metrics
└── Resource Usage (CPU, Memory)
```

---

## Deployment Architecture

### Production Environment (Planned)

```
┌─────────────────────────────────────────────────────────┐
│                         Users                            │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│  ┌────────────────────────────────────────────────┐    │
│  │               Next.js Application               │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │        Edge Functions (API Routes)       │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────┘    │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
             │                          │
             ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────┐
│   Supabase Cloud     │    │      TMDB API           │
│  ┌────────────────┐  │    │   (Third-party)         │
│  │   PostgreSQL   │  │    └──────────────────────────┘
│  │    Database    │  │
│  └────────────────┘  │
│  ┌────────────────┐  │
│  │ Storage Bucket │  │
│  │   (Avatars)    │  │
│  └────────────────┘  │
└──────────────────────┘
```

### CI/CD Pipeline (Planned)

```
Developer Push to GitHub
        ┃
        ┃ Webhook triggers
        ▼
    GitHub Actions
        ┃
        ├─> Run Linting
        ├─> Run Type Checking
        ├─> Run Tests
        └─> Build Application
        ┃
        ┃ If all pass
        ▼
   Deploy to Vercel Preview
        ┃
        ┃ Manual approval for main branch
        ▼
   Deploy to Production
        ┃
        ▼
    Live on Vercel Edge
```

---

## Technology Decisions

### Why Next.js 15?
- Server-side rendering for SEO
- API routes eliminate need for separate backend
- App Router for modern React patterns
- Automatic code splitting
- Built-in image optimization
- Strong TypeScript support

### Why Supabase?
- PostgreSQL for robust data storage
- Built-in authentication
- Row Level Security for data protection
- Real-time subscriptions (planned)
- Storage for user-uploaded content
- Simple REST API
- Good free tier

### Why TMDB API?
- Comprehensive movie/TV database
- Free API with generous limits
- High-quality images
- Detailed metadata
- Active maintenance
- Good documentation

### Why Inline Styles?
- Co-location with components
- Dynamic styling simple
- No CSS conflicts
- Faster prototyping
- Trade-off: Less separation, acceptable for project size

---

**Last Updated**: January 2025
**Architecture Version**: 0.1.0

# Been Watching - Developer Onboarding Guide

**Welcome to the Been Watching development team!**

This guide will help you understand the project, set up your development environment, and start contributing effectively.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Architecture](#project-architecture)
3. [Development Workflow](#development-workflow)
4. [Key Concepts](#key-concepts)
5. [Common Tasks](#common-tasks)
6. [Testing & Debugging](#testing--debugging)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

Before you begin, ensure you have:

```bash
# Required
- Node.js 18+ (we use v22.20.0)
- npm or yarn
- Git
- Code editor (VS Code recommended)

# Accounts Needed
- GitHub account (for code access)
- Supabase account (for database)
- TMDB account (for API key)
- Vercel account (for deployment)
```

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/murtopia/been-watching.git
cd been-watching-v2

# Install dependencies
npm install
```

### Step 2: Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Copy from template
cp .env.example .env.local

# Edit with your values
# Ask team lead for Supabase and TMDB credentials
```

Required variables:
```bash
# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# TMDB (get from https://www.themoviedb.org/settings/api)
TMDB_API_KEY=your-tmdb-api-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run the Development Server

```bash
# Start the dev server
npm run dev

# Open browser
# Navigate to http://localhost:3000

# You should see the welcome page!
```

### Step 4: Test Authentication

```bash
# You'll need to configure OAuth in Supabase:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add redirect URL: http://localhost:3000/api/auth/callback
4. Save credentials to .env.local
```

### Step 5: Verify Database Connection

```bash
# Run a simple check script
node scripts/check-schema.js

# Should show all tables and confirm connection
```

---

## Project Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                     User Browser                     │
│                   (React 19 + Next.js 15)           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│                  Vercel Edge Network                 │
│            (Hosting + Edge Functions)                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├──→ Supabase (Database + Auth)
                   │    ├── PostgreSQL Database
                   │    ├── Row-Level Security
                   │    └── Google OAuth
                   │
                   └──→ TMDB API (via proxy)
                        └── Movie/TV Show Data
```

### Technology Choices & Why

**Next.js 15.5.4 with App Router**
- Chosen for: Server components, excellent DX, Vercel integration
- Turbopack in dev for fast HMR

**React 19**
- Latest features, server components, better performance
- `use()` hook for handling async params in Next.js 15

**TypeScript**
- Type safety prevents runtime errors
- Better IDE autocomplete and refactoring
- Self-documenting code

**Supabase**
- PostgreSQL with modern API
- Built-in authentication
- Row-Level Security for data protection
- Real-time subscriptions for live features
- Generous free tier

**TMDB API**
- Comprehensive movie/TV database
- Free tier sufficient for our needs
- Better than alternatives (OMDB, TVMaze)

**Inline Styles (No Tailwind)**
- Design decision: Full control over glassmorphic aesthetic
- No CSS-in-JS library needed
- Theme system implemented with React Context
- Easier to maintain consistency

---

## Development Workflow

### Git Branching Strategy

```bash
# Main branch = production
main

# For new features, create branches:
git checkout -b feature/episode-tracking
git checkout -b fix/theme-bug
git checkout -b refactor/activity-card

# Push your branch
git push -u origin feature/episode-tracking

# Create PR on GitHub for review
# After approval, squash and merge to main
```

### Commit Message Format

```bash
# Format: Type: Brief description (max 72 chars)

git commit -m "feat: Add episode-level tracking for TV shows

- Added episode_number column to watch_status
- Updated MediaDetailModal with episode selector
- Added episode progress indicator to cards

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring (no behavior change)
- `docs:` Documentation update
- `style:` Code style/formatting
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Review Process

1. **Self-Review First**
   - Check TypeScript errors: `npx tsc --noEmit`
   - Test locally: `npm run dev`
   - Review your own diff on GitHub

2. **Request Review**
   - Tag relevant team members
   - Explain what changed and why
   - Include screenshots for UI changes
   - Link to related issue/feature request

3. **Address Feedback**
   - Respond to all comments
   - Make requested changes
   - Push updates to same branch
   - Re-request review when ready

4. **Merge**
   - Squash commits for clean history
   - Delete feature branch after merge
   - Vercel auto-deploys to production

---

## Key Concepts

### 1. Season-Specific Media IDs

**This is the most important concept in the codebase.**

TV shows are **NEVER** tracked as full series, only individual seasons.

```typescript
// ✅ Correct formats:
'movie-157336'           // Movie (Interstellar)
'tv-110492-s1'          // TV Season (High Potential S1)
'tv-1396-s5'            // TV Season (Breaking Bad S5)

// ❌ NEVER do this:
'tv-110492'             // Wrong! Missing season number

// Why?
// Users want to track seasons separately:
// - Rate Season 1 as "love"
// - Rate Season 2 as "meh"
// - Still watching Season 3
```

**Key Functions:**
```typescript
// utils/mediaHelpers.ts (you might need to create this)
export function constructMediaId(
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  seasonNumber?: number
): string {
  if (mediaType === 'movie') {
    return `movie-${tmdbId}`
  }
  if (!seasonNumber) {
    throw new Error('TV shows require season number')
  }
  return `tv-${tmdbId}-s${seasonNumber}`
}

export function parseMediaId(mediaId: string): {
  mediaType: 'movie' | 'tv'
  tmdbId: number
  seasonNumber?: number
} {
  const parts = mediaId.split('-')

  if (parts[0] === 'movie') {
    return {
      mediaType: 'movie',
      tmdbId: parseInt(parts[1])
    }
  }

  const seasonMatch = parts[2]?.match(/s(\d+)/)
  return {
    mediaType: 'tv',
    tmdbId: parseInt(parts[1]),
    seasonNumber: seasonMatch ? parseInt(seasonMatch[1]) : undefined
  }
}
```

### 2. Taste Match Algorithm

Located in `utils/tasteMatch.ts`.

Calculates 0-100 compatibility score between users based on:
- **60% weight:** Rating agreement (do they rate same shows similarly?)
- **40% weight:** Watch overlap (do they watch same shows?)

```typescript
// Example usage:
import { calculateTasteMatch, getTasteMatchLabel } from '@/utils/tasteMatch'

const score = await calculateTasteMatch(user1Id, user2Id)
// Returns: 0-100 number

const label = getTasteMatchLabel(score)
// Returns: { label: 'Great Match', emoji: '⭐', color: '#34C759' }
```

**Score Categories:**
- 90-100: Exceptional Match 🔥
- 70-89: Great Match ⭐
- 50-69: Good Match 👍
- 30-49: Fair Match ✓
- 0-29: Different Taste •

### 3. Theme System

Located in `contexts/ThemeContext.tsx`.

Three-state theme: Auto (system) → Light → Dark

```typescript
import { useTheme } from '@/contexts/ThemeContext'

export default function MyComponent() {
  const { resolvedTheme, themeMode, cycleTheme } = useTheme()

  // resolvedTheme is always 'light' or 'dark'
  const isDark = resolvedTheme === 'dark'

  // Use for styling:
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const cardBg = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.95)'

  return (
    <div style={{ background: cardBg, color: textColor }}>
      <button onClick={cycleTheme}>Toggle Theme</button>
    </div>
  )
}
```

**Theme Persistence:**
- Saved to `profiles.theme_preference` column
- Syncs across devices automatically
- Falls back to 'dark' if not set

### 4. Privacy Controls

Users can make profiles private:

```typescript
// Check if viewer can see user's activities:
const canViewActivities =
  !profile.is_private ||           // Profile is public, OR
  isFollowing ||                   // Viewer follows them, OR
  isOwnProfile                     // Viewing own profile

// Use in components:
{canViewActivities && (
  <ActivityFeed userId={profile.id} />
)}
```

### 5. Row-Level Security (RLS)

Supabase automatically enforces security policies:

```sql
-- Example: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- This means you DON'T need to check permissions in code
-- Database handles it automatically!
```

**Important:** Service role key bypasses RLS (use carefully, only in server code).

---

## Common Tasks

### Add a New Page

```bash
# 1. Create page file
touch app/my-new-page/page.tsx

# 2. Create component
cat > app/my-new-page/page.tsx << 'EOF'
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function MyNewPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'

  return (
    <div style={{
      minHeight: '100vh',
      background: bgGradient,
      padding: '2rem'
    }}>
      <h1>My New Page</h1>
    </div>
  )
}
EOF

# 3. Navigate to http://localhost:3000/my-new-page
```

### Add a New Database Table

```bash
# 1. Create migration file
touch supabase/add-my-table.sql

# 2. Write SQL
cat > supabase/add-my-table.sql << 'EOF'
-- Create table
CREATE TABLE IF NOT EXISTS public.my_table (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Users can read own data"
ON public.my_table FOR SELECT
USING (auth.uid() = user_id);

-- Add index
CREATE INDEX idx_my_table_user_id ON public.my_table(user_id);
EOF

# 3. Run in Supabase SQL Editor
# Copy contents of file and paste into:
# https://supabase.com/dashboard/project/[your-project]/sql
```

### Add a New API Route

```bash
# 1. Create route file
mkdir -p app/api/my-endpoint
touch app/api/my-endpoint/route.ts

# 2. Implement handler
cat > app/api/my-endpoint/route.ts << 'EOF'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_table')
    .select('*')
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('my_table')
    .insert(body)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
EOF

# 3. Test endpoint
curl http://localhost:3000/api/my-endpoint
```

### Query the Database

```typescript
// In a Server Component (app/*/page.tsx without 'use client')
import { createClient } from '@/utils/supabase/server'

export default async function MyPage() {
  const supabase = createClient()

  const { data: shows } = await supabase
    .from('media')
    .select('*')
    .eq('media_type', 'tv')
    .limit(10)

  return <div>{/* render shows */}</div>
}

// In a Client Component (with 'use client')
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MyComponent() {
  const [shows, setShows] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const loadShows = async () => {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('media_type', 'tv')
        .limit(10)

      setShows(data || [])
    }

    loadShows()
  }, [])

  return <div>{/* render shows */}</div>
}
```

### Call TMDB API

```typescript
// NEVER call TMDB directly from client!
// ❌ Bad:
fetch('https://api.themoviedb.org/3/...')

// ✅ Good: Use our proxy
fetch('/api/tmdb/search/tv?query=Breaking+Bad')

// In component:
const searchShows = async (query: string) => {
  const res = await fetch(
    `/api/tmdb/search/tv?query=${encodeURIComponent(query)}`
  )
  const data = await res.json()
  return data.results
}
```

---

## Testing & Debugging

### Manual Testing Checklist

Before submitting a PR, test:

```bash
# Authentication
- [ ] Can sign in with Google
- [ ] Profile setup appears for new users
- [ ] Username validation works

# Core Features
- [ ] Can search for shows/movies
- [ ] Can add to Want/Watching/Watched
- [ ] Can rate (Meh/Like/Love)
- [ ] Activities appear in feed
- [ ] Can like/comment on activities

# Social Features
- [ ] Can follow/unfollow users
- [ ] User profiles load correctly
- [ ] Taste match score displays
- [ ] Privacy settings work

# Theme
- [ ] Theme toggle works (Auto/Light/Dark)
- [ ] Theme persists after refresh
- [ ] All text is readable in both themes

# Mobile
- [ ] Test on phone (or Chrome DevTools mobile view)
- [ ] Bottom nav works
- [ ] Modals are full-screen on mobile
- [ ] Touch targets are large enough
```

### Debugging Tips

**Problem: "Supabase query returns empty array"**
```typescript
// Add error checking:
const { data, error } = await supabase.from('media').select('*')
console.log('Error:', error)       // Check for errors
console.log('Data:', data)         // Check actual data
console.log('Count:', data?.length) // Check count

// Check RLS policies:
// Query might be blocked by Row-Level Security
// Try with service role key (server-side only)
```

**Problem: "Theme not applying"**
```typescript
// Check ThemeProvider is wrapping app:
// app/layout.tsx should have:
<ThemeProvider>
  {children}
</ThemeProvider>

// Check if component uses useTheme:
const { resolvedTheme } = useTheme()
console.log('Current theme:', resolvedTheme)
```

**Problem: "Media ID format wrong"**
```typescript
// Always log media IDs to verify format:
console.log('Media ID:', mediaId)
// Should be: 'movie-12345' or 'tv-12345-s1'
// NOT: 'tv-12345' or '12345' or 'tv-12345-season1'

// Use helper functions to construct IDs
```

### Browser DevTools

**React DevTools:**
```bash
# Install extension:
# Chrome: https://chrome.google.com/webstore (search "React Developer Tools")

# Use to inspect:
- Component props
- State values
- Context values (ThemeContext, etc.)
```

**Network Tab:**
```bash
# Check API calls:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Trigger action (search, add show, etc.)
4. Click request to see:
   - Request URL
   - Request headers
   - Response data
   - Status code
```

**Console Tab:**
```bash
# Useful console methods:
console.log('Data:', data)                    # Basic logging
console.table(data)                           # Table format
console.error('Error:', error)                # Red error
console.warn('Warning:', message)             # Yellow warning
console.group('My Feature')                   # Grouping
console.log('Step 1')
console.log('Step 2')
console.groupEnd()
```

---

## Deployment

### Automatic Deployment (Recommended)

```bash
# 1. Commit your changes
git add .
git commit -m "feat: Add new feature"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically:
#    - Detects push
#    - Builds project
#    - Runs tests
#    - Deploys to production
#    - Updates https://beenwatching.com

# 4. Monitor deployment:
# https://vercel.com/dashboard
```

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Production

```bash
# Set via Vercel Dashboard:
# https://vercel.com/dashboard/[project]/settings/environment-variables

# Or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add TMDB_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### Rollback

```bash
# If deployment breaks production:

# Option 1: Vercel Dashboard
# 1. Go to Deployments tab
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Option 2: Git revert
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version
```

---

## Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install

# If still broken, clear Next.js cache:
rm -rf .next
npm run dev
```

#### TypeScript errors in IDE but builds fine
```bash
# Solution: Restart TypeScript server

# VS Code:
# 1. Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
# 2. Type "TypeScript: Restart TS Server"
# 3. Press Enter
```

#### Supabase connection fails
```bash
# Check environment variables:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Should output your values, not empty

# If empty, check .env.local exists:
ls -la .env.local

# If missing, create from template:
cp .env.example .env.local
# Then edit with your values
```

#### OAuth redirect not working
```bash
# Check redirect URL in Supabase:
# 1. Go to Authentication → URL Configuration
# 2. Site URL should be: http://localhost:3000
# 3. Redirect URLs should include:
#    http://localhost:3000/api/auth/callback
#    https://beenwatching.com/api/auth/callback

# Also check Google OAuth console:
# Authorized redirect URIs must match exactly
```

#### TMDB API calls failing
```bash
# Check API key is set:
echo $TMDB_API_KEY

# Test directly:
curl "https://api.themoviedb.org/3/search/tv?query=breaking+bad&api_key=$TMDB_API_KEY"

# Should return JSON with results

# If 401 error: API key invalid
# If 429 error: Rate limit exceeded (40 requests/10 seconds)
```

---

## Resources

### Documentation
- **Project Docs:** See other .md files in this repo
- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **Supabase:** https://supabase.com/docs
- **TMDB API:** https://developer.themoviedb.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs

### Tools
- **VS Code:** https://code.visualstudio.com
- **GitHub Desktop:** https://desktop.github.com (if you prefer GUI)
- **Postman:** https://www.postman.com (for API testing)
- **DB Browser:** https://dbeaver.io (for database inspection)

### Team Communication
- **Email:** Ask team lead for contact
- **Slack/Discord:** (Set up if team grows)
- **GitHub Issues:** Use for bug reports and feature requests
- **GitHub Discussions:** Use for questions and ideas

---

## Next Steps

Now that you're set up:

1. **Read these files:**
   - `PROJECT-COMPLETE-OVERVIEW.md` - Full project details
   - `ROADMAP-CURRENT.md` - What we're building next
   - `CHANGELOG.md` - Recent changes

2. **Pick a starter task:**
   - Fix a small bug (check GitHub Issues)
   - Improve documentation
   - Add unit tests for utilities
   - Refactor a component for better readability

3. **Ask questions:**
   - No question is too small!
   - Better to ask than make wrong assumptions
   - Document answers for future developers

4. **Have fun!**
   - This is a real product with real users
   - Your work will directly impact user experience
   - Build something you're proud of

---

**Welcome to the team! 🎉**

If you have any questions, reach out to the team lead or check our other documentation files.

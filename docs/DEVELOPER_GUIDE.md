# Been Watching - Developer Guide

## Getting Started

This guide will help you (or another developer) understand the codebase and start contributing.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd been-watching-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and TMDB credentials

# Run database migrations
# Go to your Supabase dashboard > SQL Editor
# Run the migrations in /supabase/add-profile-features.sql

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (via Supabase)
- **External API**: TMDB (The Movie Database)

### Folder Structure

```
been-watching-v2/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── myshows/           # My Shows page
│   ├── profile/           # Profile page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Login, signup
│   ├── media/            # MediaCard, VideoModal
│   ├── navigation/       # NavBar
│   ├── profile/          # TopShowModal
│   └── search/           # SearchModal, TVSeasonCard
├── lib/                  # Utilities
├── supabase/             # Database migrations
└── docs/                 # Documentation
```

## Key Concepts

### 1. Media Data Model

Media items (TV shows/movies) have two contexts:

#### TMDB Context (Search Results)
```typescript
{
  id: number,              // TMDB ID
  title?: string,          // For movies
  name?: string,           // For TV shows
  poster_path: string,
  media_type: 'tv' | 'movie',
  // ... other TMDB fields
}
```

#### User Media Context (Tracked Shows)
```typescript
{
  id: string,              // UUID in our database
  user_id: string,
  tmdb_id: number,
  title: string,
  poster_path: string,
  media_type: 'tv' | 'movie',
  rating?: number,         // 1-5
  status?: string,         // 'watching', 'completed', etc.
  season_number?: number,  // For TV shows
}
```

#### Season-Specific IDs
TV seasons use a special ID format: `tv-{tmdbId}-s{seasonNumber}`

Example: `tv-110492-s1` represents "High Potential - Season 1"

This allows users to track individual seasons separately.

### 2. Component Patterns

#### Modal Pattern
All modals follow this structure:
```typescript
interface ModalProps {
  onClose: () => void
  // ... other props
}

export default function Modal({ onClose }: ModalProps) {
  return (
    <div style={{ /* overlay styles */ }} onClick={onClose}>
      <div style={{ /* modal content */ }} onClick={(e) => e.stopPropagation()}>
        {/* Modal content */}
      </div>
    </div>
  )
}
```

#### TV Show Season Display Pattern
When displaying TV shows, always:
1. Fetch full show details from TMDB: `/api/tmdb/tv/{id}`
2. Extract seasons array
3. Filter out "Season 0" (specials): `seasons.filter(s => s.season_number > 0)`
4. Render each season as a separate selectable item

See `SearchModal.tsx` and `TopShowModal.tsx` for examples.

### 3. API Route Patterns

#### TMDB Proxy Routes
```typescript
// app/api/tmdb/[...path]/route.ts
export async function GET(request: Request) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY
  const response = await fetch(
    `https://api.themoviedb.org/3/${path}?api_key=${TMDB_API_KEY}`
  )
  const data = await response.json()
  return NextResponse.json(data)
}
```

#### User Media Routes
```typescript
// app/api/user-media/route.ts
export async function POST(request: Request) {
  const supabase = createClient()

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Validate user
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle request
  // ...
}
```

### 4. Authentication Flow

```typescript
// 1. Check if user is authenticated
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  // Redirect to login or show login modal
}

// 2. User is authenticated, proceed with request
```

### 5. Database Queries

#### Fetch User Media
```typescript
const { data: userMedia } = await supabase
  .from('user_media')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

#### Add Media
```typescript
const { data, error } = await supabase
  .from('user_media')
  .insert({
    user_id: user.id,
    tmdb_id: mediaData.tmdb_id,
    title: mediaData.title,
    poster_path: mediaData.poster_path,
    media_type: mediaData.media_type,
    season_number: mediaData.season_number,
    rating: rating,
    status: status
  })
  .select()
```

#### Update Media
```typescript
const { error } = await supabase
  .from('user_media')
  .update({ rating: newRating, status: newStatus })
  .eq('id', mediaId)
  .eq('user_id', user.id) // Ensure user owns this media
```

## Common Tasks

### Adding a New Page

1. Create page file in `app/`:
```typescript
// app/newpage/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

2. Add to navigation:
```typescript
// components/navigation/NavBar.tsx
<Link href="/newpage">New Page</Link>
```

### Adding a New API Endpoint

1. Create route file:
```typescript
// app/api/newroute/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Handle GET request
  return NextResponse.json({ data: 'result' })
}
```

2. Call from component:
```typescript
const response = await fetch('/api/newroute')
const data = await response.json()
```

### Adding a New Component

1. Create component file:
```typescript
// components/category/NewComponent.tsx
interface NewComponentProps {
  title: string
}

export default function NewComponent({ title }: NewComponentProps) {
  return <div>{title}</div>
}
```

2. Import and use:
```typescript
import NewComponent from '@/components/category/NewComponent'

<NewComponent title="Hello" />
```

### Working with TMDB API

1. **Search for shows**:
```typescript
const response = await fetch(
  `/api/tmdb/search/multi?query=${encodeURIComponent(query)}`
)
const data = await response.json()
```

2. **Get show details**:
```typescript
const response = await fetch(`/api/tmdb/tv/${tmdbId}`)
const showData = await response.json()
```

3. **Get trending**:
```typescript
const response = await fetch('/api/tmdb/trending/all/week')
const trending = await response.json()
```

### Database Migrations

1. Write SQL migration in `/supabase/`:
```sql
-- supabase/new-migration.sql
ALTER TABLE profiles ADD COLUMN new_field TEXT;
```

2. Run in Supabase Dashboard:
   - Go to SQL Editor
   - Paste migration SQL
   - Execute

3. Document in migration history (this guide)

## Design System

### Colors

```typescript
const colors = {
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  gradient: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
}
```

### Glass Panel Style

```typescript
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
}
```

### Gradient Button

```typescript
const buttonStyle = {
  background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer',
}
```

## Debugging Tips

### Common Issues

#### 1. "Cannot read properties of undefined"
- Check if data exists before accessing properties
- Use optional chaining: `data?.property`
- Add null checks: `if (data) { ... }`

#### 2. "Hydration mismatch"
- Ensure server and client render the same HTML
- Avoid using `window` or `document` during initial render
- Use `useEffect` for client-only code

#### 3. "User not authenticated"
- Check if user session is valid
- Ensure auth middleware is properly configured
- Verify cookies are being sent with requests

#### 4. API Route Errors
- Check environment variables are set
- Verify API key is valid
- Check network tab in browser DevTools
- Add console.log statements to debug

### Useful Debugging Commands

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint

# Check bundle size
npm run build

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Browser DevTools

- **Network Tab**: Monitor API calls
- **Console**: Check for errors and warnings
- **React DevTools**: Inspect component state
- **Application Tab**: Check local storage, cookies, session

## Testing (To Be Implemented)

### Unit Tests
```typescript
// __tests__/utils.test.ts
import { formatDate } from '@/lib/utils'

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024')
  })
})
```

### Integration Tests
```typescript
// __tests__/api/user-media.test.ts
describe('POST /api/user-media', () => {
  it('creates user media', async () => {
    const response = await fetch('/api/user-media', {
      method: 'POST',
      body: JSON.stringify({ /* media data */ })
    })
    expect(response.status).toBe(200)
  })
})
```

## Code Style Guide

### TypeScript
- Use TypeScript for all new code
- Define interfaces for props and data structures
- Avoid `any` type - use `unknown` if necessary
- Use type inference where possible

### React
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use descriptive prop names

### Naming Conventions
- **Components**: PascalCase (`MediaCard.tsx`)
- **Functions**: camelCase (`fetchUserMedia`)
- **Constants**: UPPER_SNAKE_CASE (`TMDB_API_KEY`)
- **Files**: kebab-case for utilities (`format-date.ts`)

### File Organization
- One component per file
- Co-locate related files (component + styles + tests)
- Use barrel exports (`index.ts`) for cleaner imports

## Performance Best Practices

1. **Use Next.js Image component** for images
2. **Implement pagination** for large lists
3. **Cache API responses** where appropriate
4. **Lazy load** heavy components
5. **Debounce** search inputs
6. **Optimize database queries** with indexes

## Security Best Practices

1. **Never commit `.env.local`** to git
2. **Always validate user input** on server side
3. **Use Row Level Security** in Supabase
4. **Keep API keys secret** (use API routes as proxy)
5. **Implement rate limiting** for API routes
6. **Sanitize user-generated content**

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All features tested manually
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Error tracking configured
- [ ] Monitoring set up

## Getting Help

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TMDB API Docs](https://developers.themoviedb.org/3)

### Project-Specific Docs
- `TODO.md` - Task list and priorities
- `PROJECT_OVERVIEW.md` - High-level architecture
- `CHANGELOG.md` - Version history (to be created)

### Common Questions

**Q: How do I add a new field to the database?**
A: Write a migration SQL file and run it in Supabase SQL Editor.

**Q: How do I fetch data from TMDB?**
A: Use the proxy API routes in `/api/tmdb/` to keep the API key secure.

**Q: Why are seasons displayed separately?**
A: This allows users to track TV shows on a per-season basis, which is more granular and useful.

**Q: How do I test authentication locally?**
A: Use Supabase local development or test with a real Supabase project.

**Q: Can I use a different styling solution?**
A: Yes, but maintain consistency with the liquid glass design system.

---

**Last Updated**: January 2025

# User Profile Enhancements Plan

**Date:** October 20, 2025
**Goal:** Make user profiles more engaging by showing Top 3 Shows and Watch Lists (similar to My Shows page)

---

## 🔍 Research Findings

### Current State

**My Shows Page (`app/myshows/page.tsx`):**
- ✅ Shows "My Top 3 Shows" section with numbered badges (1, 2, 3)
- ✅ Shows watch list tabs: Want to Watch / Watching / Watched
- ✅ Has counts for each list (29 / 13 / 97)
- ✅ Supports both grid and list view modes
- ✅ Shows poster images with media badges (rating indicators)
- ✅ Top shows are editable with pencil icon overlay

**User Profile Page (`app/user/[username]/page.tsx`):**
- ✅ Shows avatar, username, display name, bio
- ✅ Shows follow/unfollow button
- ✅ Shows taste match score (if following)
- ✅ Shows watch stats (want/watching/watched counts)
- ⚠️ **ISSUE:** Shows "Recent Activity" but Taylor's profile shows 0 activities despite having activity in the main feed
- ❌ **MISSING:** No Top 3 Shows section
- ❌ **MISSING:** No watch lists display

### Database Schema Issues

**Current Schema (`supabase/schema.sql`):**
- The `profiles` table does NOT have `top_show_1`, `top_show_2`, `top_show_3` columns
- There IS a `top_shows` table in `migration-friends.sql` but it's not being used
- The `myshows/page.tsx` is trying to save to non-existent columns

**Top Shows Table (from migration-friends.sql):**
```sql
CREATE TABLE IF NOT EXISTS public.top_shows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT REFERENCES public.media(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, position),
    UNIQUE(user_id, media_id)
);
```

### Activity Feed Issue

The activity feed query in `loadActivities()` looks correct:
```typescript
const { data } = await supabase
  .from('activities')
  .select(`
    id,
    type,
    created_at,
    rating,
    status,
    media:media_id (
      id,
      title,
      poster_path,
      media_type
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)
```

**Possible causes:**
1. Taylor's activities might not be in the database
2. The media join might be failing (media records don't exist)
3. Privacy settings might be blocking (but canViewActivities is true)

---

## 📋 Enhancement Plan

### Option A: Use Existing `top_shows` Table (Recommended)
**Pros:**
- Already has proper schema with RLS policies
- Normalizes data (better for multiple top shows per user)
- More flexible for future features

**Cons:**
- Need to update `myshows/page.tsx` to use the table instead of columns
- Slightly more complex queries

### Option B: Add Columns to `profiles` Table
**Pros:**
- Simpler queries (one SELECT gets everything)
- Matches current myshows implementation

**Cons:**
- Denormalized data
- Need migration to add columns
- Less flexible for future expansion

---

## ✅ Recommended Implementation

### Phase 1: Fix Database Schema (Choose Option A)

**1.1. Update My Shows Page to Use `top_shows` Table**

Change from:
```typescript
// OLD - saving to non-existent columns
const column = `top_show_${selectedSlot}`
await supabase
  .from('profiles')
  .update({ [column]: media })
  .eq('id', user.id)
```

To:
```typescript
// NEW - using top_shows table
await supabase
  .from('top_shows')
  .upsert({
    user_id: user.id,
    media_id: media.id,
    position: selectedSlot
  }, {
    onConflict: 'user_id,position'
  })
```

**1.2. Update `loadProfile()` to Load from `top_shows` Table**

Change from:
```typescript
// OLD - loading from non-existent columns
if (data.top_show_1) setTopShows(prev => [data.top_show_1, prev[1], prev[2]])
if (data.top_show_2) setTopShows(prev => [prev[0], data.top_show_2, prev[2]])
if (data.top_show_3) setTopShows(prev => [prev[0], prev[1], data.top_show_3])
```

To:
```typescript
// NEW - loading from top_shows table
const { data: topShowsData } = await supabase
  .from('top_shows')
  .select(`
    position,
    media:media_id (*)
  `)
  .eq('user_id', userId)
  .order('position')

if (topShowsData) {
  const shows = [null, null, null]
  topShowsData.forEach(item => {
    shows[item.position - 1] = item.media
  })
  setTopShows(shows)
}
```

---

### Phase 2: Add Top 3 Shows to User Profiles

**2.1. Create Reusable Component: `components/profile/TopShowsDisplay.tsx`**

```typescript
interface TopShowsDisplayProps {
  userId: string
  isEditable?: boolean // false for viewing other profiles
}

export default function TopShowsDisplay({ userId, isEditable = false }: TopShowsDisplayProps) {
  // Load top shows from top_shows table
  // Display in same style as My Shows page
  // If isEditable=false, no pencil icon overlay
}
```

**2.2. Add to User Profile Page**

Location: After the header section, before watch stats

```tsx
{/* Top 3 Shows */}
{canViewContent && (
  <TopShowsDisplay userId={profile.id} isEditable={false} />
)}
```

---

### Phase 3: Add Watch Lists to User Profiles

**3.1. Create Component: `components/profile/UserWatchLists.tsx`**

```typescript
interface UserWatchListsProps {
  userId: string
  isOwnProfile: boolean
}

export default function UserWatchLists({ userId, isOwnProfile }: UserWatchListsProps) {
  const [activeTab, setActiveTab] = useState<'want' | 'watching' | 'watched'>('want')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [counts, setCounts] = useState({ want: 0, watching: 0, watched: 0 })

  // Load media for active tab
  // Display in grid or list mode
  // Show counts like My Shows page (29 / 13 / 97)
  // No edit functionality (view-only)
}
```

**3.2. Add to User Profile Page**

Location: After Top 3 Shows, before Recent Activity

```tsx
{/* Watch Lists */}
{canViewContent && (
  <UserWatchLists userId={profile.id} isOwnProfile={isOwnProfile} />
)}
```

---

### Phase 4: Fix Activity Feed Issue

**4.1. Debug Activity Loading**

Add logging to identify the issue:
```typescript
const loadActivities = async (userId: string) => {
  try {
    console.log('[DEBUG] Loading activities for user:', userId)

    const { data, error } = await supabase
      .from('activities')
      .select(`
        id,
        type,
        created_at,
        rating,
        status,
        media:media_id (
          id,
          title,
          poster_path,
          media_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('[DEBUG] Activities data:', data)
    console.log('[DEBUG] Activities error:', error)
    console.log('[DEBUG] Activities count:', data?.length)

    setActivities(data || [])
  } catch (error) {
    console.error('Error loading activities:', error)
  }
}
```

**4.2. Verify Media Records Exist**

The issue might be that activities exist but their media records don't:
```typescript
// Check if media records exist
const { data: activitiesWithoutMedia } = await supabase
  .from('activities')
  .select('*')
  .eq('user_id', userId)
  .is('media_id', null)
```

**4.3. Alternative Query (if join is failing)**

Try a two-step load:
```typescript
// Step 1: Get activities
const { data: activitiesData } = await supabase
  .from('activities')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)

// Step 2: Get media for each activity
const activitiesWithMedia = await Promise.all(
  activitiesData.map(async (activity) => {
    const { data: mediaData } = await supabase
      .from('media')
      .select('*')
      .eq('id', activity.media_id)
      .maybeSingle()

    return {
      ...activity,
      media: mediaData
    }
  })
)

setActivities(activitiesWithMedia)
```

---

## 🎨 Design Specifications

### Top 3 Shows Section
```
+--------------------------------------------------+
|  My Top 3 Shows                                  |
|                                                  |
|  [1]           [2]           [3]                |
|  [Poster]      [Poster]      [Poster]           |
|  [Image]       [Image]       [Image]            |
|                                                  |
+--------------------------------------------------+
```

- 3 cards side-by-side
- Numbered badges (1, 2, 3) in top-left corner
- Poster images (same size as My Shows page)
- NO edit button for other users' profiles
- "Empty" state shows gray placeholder with "Not set yet" text

### Watch Lists Section
```
+--------------------------------------------------+
|        29              13              97        |
|   Want to Watch    Watching        Watched       |
|                                                  |
|  [View Toggle: Grid | List]                      |
|                                                  |
|  [Grid of posters with badges]                   |
|                                                  |
+--------------------------------------------------+
```

- Same tab design as My Shows page
- Same counts display
- Same grid/list toggle
- Same media badges (rating indicators)
- NO ability to edit (view-only)
- Clicking a poster opens detail modal

---

## 🚀 Implementation Order

1. ✅ **Research complete** - Understand current implementation
2. **Fix My Shows page** - Update to use `top_shows` table
3. **Create TopShowsDisplay component** - Reusable for both My Shows and user profiles
4. **Create UserWatchLists component** - View-only version of watch lists
5. **Add components to user profile page** - Integrate both new sections
6. **Debug activity feed** - Figure out why Taylor's activities don't show
7. **Test everything locally** - Verify all profiles work correctly
8. **Deploy to production** - Git commit and Vercel deploy

---

## 🔧 Technical Notes

### Privacy Considerations
- Top 3 shows should respect `is_private` setting
- Watch lists should respect `is_private` setting
- Activities already respect privacy (only shown if public OR following)

### Performance
- Watch lists might have 100+ items - use pagination or lazy loading
- Consider limiting initial display to 12-20 items per tab
- Load more on scroll or "Show More" button

### Data Loading Strategy
```typescript
// Load all data in parallel for better performance
const loadUserContent = async (userId: string) => {
  const [topShows, watchStats, activities, want, watching, watched] = await Promise.all([
    loadTopShows(userId),
    loadWatchStats(userId),
    loadActivities(userId),
    loadWatchList(userId, 'want', 12), // First 12 only
    loadWatchList(userId, 'watching', 12),
    loadWatchList(userId, 'watched', 12)
  ])
}
```

---

## 🎯 Success Criteria

- [  ] Top 3 Shows display on user profiles
- [  ] Watch lists (want/watching/watched) display on user profiles
- [  ] Activity feed shows Taylor's recent activity
- [  ] Privacy settings are respected for all content
- [  ] My Shows page correctly saves to `top_shows` table
- [  ] All features work in both light and dark mode
- [  ] No performance issues with large watch lists
- [  ] Mobile-responsive design

---

## 📊 Expected User Flow

1. User visits `/user/taylormurto`
2. Sees Taylor's Top 3 favorite shows (Mobland, Nobody Wants This, etc.)
3. Scrolls down to see Taylor's watch lists (29 want, 13 watching, 97 watched)
4. Clicks on "Want to Watch" tab → sees first 12 shows in grid view
5. Scrolls down to see Taylor's recent activity (added Sicario, rated Alien, etc.)
6. Clicks on a show poster → detail modal opens
7. Can follow Taylor or view mutual friends

---

**Next Steps:** Proceed with implementation starting with Phase 1 (fix database schema).

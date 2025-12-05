# Feed Card Architecture

**Last Updated:** January 2025  
**Status:** ✅ ALL 8 CARDS COMPLETE AND APPROVED

---

## Current State

All 8 React card components have been built, tested on mobile, and approved:

| Card | Type | Status | Test URL |
|------|------|--------|----------|
| 1 | User Activity | ✅ Approved | `/preview/card-1` |
| 2 | Because You Liked | ✅ Approved | `/preview/card-2` |
| 3 | Your Friends Loved | ✅ Approved | `/preview/card-3` |
| 4 | Coming Soon | ✅ Approved | `/preview/card-4` |
| 5 | Now Streaming | ✅ Approved | `/preview/card-5` |
| 6 | Top 3 Update | ✅ Approved | `/preview/card-6` |
| 7 | Find New Friends | ✅ Approved | `/preview/card-7` |
| 8 | You Might Like | ✅ Approved | `/preview/card-8` |

**Test Feeds:**
- `/preview/feed-v2` - All 8 cards with mock data and scroll-snap behavior
- `/preview/feed-live` - **NEW** Live data integration test with real API data

---

## Live Feed Integration (In Progress)

### Current Status
The `/preview/feed-live` page demonstrates the new cards with real database data:

**Features Implemented:**
- ✅ Real activities from database (bypassing API in TEST MODE)
- ✅ AppHeader with Instagram-style hide-on-scroll behavior
- ✅ BottomNav with search functionality  
- ✅ Natural page scroll (no scroll-snap)
- ✅ Data transformation layer (`utils/feedDataTransformers.ts`)
- ✅ Scroll-to-top on page load
- ✅ Mock comments on first card for scroll testing
- ✅ Clickable usernames and avatars (navigate to profile pages)
- ✅ Initials avatars with consistent colors (when no photo uploaded)
- ✅ Activity comment likes (front of card)
- ✅ Show comment likes (back of card)
- ✅ Trailer modal overlay (YouTube embed)
- ✅ Streaming platforms display (with admin allowlist)

**Header Behavior:**
- Visible on page load
- Hides when scrolling down (past 60px)
- Shows when scrolling back up
- Uses `hideOnScroll` prop on AppHeader component

**Activity Grouping:**
- Database trigger groups rating + status activities within 1 minute
- API handles `activity_group_id` for merged display
- Cards show multiple badges for grouped activities

**Completed Features:**
- ✅ Activity likes (saving to database)
- ✅ Activity comments (front of card) with likes
- ✅ Show comments (back of card) with likes
- ✅ Trailer playback in modal overlay
- ✅ Streaming platforms with admin allowlist
- ✅ Clickable usernames/avatars for profile navigation
- ✅ Initials avatars with consistent color generation

**Next Steps:**
- Replace old feed components in `/feed` page
- Test Find New Friends card (Card 7) with real data
- Implement remaining card types (2, 3, 4, 5, 8) in feed

**Known Behavior to Track:**
- When quick action modal opens on card back, page scroll becomes unlocked
- May be intentional (focus shifts to modal) or may need fixing
- Revisit during full integration testing

---

## Overview

Been Watching uses 8 different card types in the activity feed. Through careful analysis, we identified that these cards share significant structure and can be efficiently built using **3 templates** with **configurable variations**.

---

## Template System

### Template A - User Activity Cards
**Cards:** 1 (User Activity), 6 (Top 3 Update)

**Characteristics:**
- Has user header (avatar, name, timestamp)
- Has heart action button (to like the user's activity)
- Shows friend activity on a specific show
- Full flip animation with standard back

**Differences between Card 1 and Card 6:**
- Only the **badges** change
- Card 1: Activity badges (Loved, Currently Watching, etc.)
- Card 6: Top 3 badge (#1 Top Show!, #2, #3)

---

### Template B - Recommendation Cards  
**Cards:** 2, 3, 4, 5, 8

**Characteristics:**
- NO user header (system/algorithm generated)
- NO heart action button (no user activity to like)
- Shows recommendations from various sources
- Full flip animation with back

**Differences are only in badges:**
| Card | Badge | Color |
|------|-------|-------|
| 2 | "Because you liked [Show]" | Purple |
| 3 | "Your Friends Loved" | Pink |
| 4 | "Coming Soon on [Date]" | Purple |
| 5 | "Now Streaming on [Platform]" | Purple |
| 8 | "You Might Like This" | Blue |

**Special Case - Card 4 (Coming Soon):**
- Uses modified back (no + quick action icon)
- Replaced with "Want to Watch" bookmark icon
- Because: Can't rate/watch unreleased content

---

### Template C - Unique Cards
**Cards:** 7 (Find New Friends)

**Characteristics:**
- Completely different layout
- Carousel of user profile cards
- NO back / NO flip animation
- Gold/yellow glassmorphic container

---

## Component Architecture

### Single Flexible Component

Instead of 8 separate components, we use ONE main component with props:

```typescript
interface FeedCardProps {
  // Core variant control
  variant: 'a' | 'b'           // Template A (user activity) or B (recommendation)
  
  // Badge configuration
  badges: Badge[]              // Array of badge configs
  
  // Back variant
  backVariant?: 'standard' | 'unreleased'  // Card 4 uses 'unreleased'
  
  // Data
  data: FeedCardData
  
  // Optional user info (only for variant 'a')
  user?: {
    id: string
    name: string
    avatar: string
  }
  timestamp?: string
  
  // Callbacks
  onLike?: () => void          // Only shown for variant 'a'
  onComment?: () => void
  onShare?: () => void
  onAddToWatchlist?: () => void
}
```

### Badge Configuration

```typescript
interface Badge {
  text: string
  icon?: string               // Icon name from sprite
  color: string               // Background color (rgba)
  borderColor: string         // Border color (rgba)
  textColor?: string          // Default: white
}
```

### Preset Badge Types

```typescript
// Card 1 - Activity badges
const BADGE_LOVED = { text: 'Loved', icon: 'heart', color: 'rgba(255, 59, 92, 0.25)', ... }
const BADGE_WATCHING = { text: 'Currently Watching', icon: 'play', color: 'rgba(59, 130, 246, 0.25)', ... }
const BADGE_WANT_TO_WATCH = { text: 'Want to Watch', icon: 'bookmark', color: 'rgba(168, 85, 247, 0.25)', ... }
const BADGE_WATCHED = { text: 'Watched', icon: 'check', color: 'rgba(52, 211, 153, 0.25)', ... }

// Card 2 - Recommendation
const BADGE_BECAUSE_YOU_LIKED = (showName: string) => ({ 
  text: `Because you liked ${showName}`, 
  icon: 'thumbs-up',
  color: 'rgba(139, 92, 246, 0.25)', 
  ... 
})

// Card 3 - Social
const BADGE_FRIENDS_LOVED = { text: 'Your Friends Loved', icon: 'heart', color: 'rgba(236, 72, 153, 0.25)', ... }

// Card 4 - Coming Soon
const BADGE_COMING_SOON = (date: string) => ({ 
  text: `Coming Soon on ${date}`, 
  icon: 'clock',
  color: 'rgba(168, 85, 247, 0.25)', 
  ... 
})

// Card 5 - Now Streaming
const BADGE_NOW_STREAMING = (platform: string) => ({ 
  text: `Now Streaming on ${platform}`, 
  icon: 'tv',
  color: 'rgba(139, 92, 246, 0.25)', 
  ... 
})

// Card 6 - Top 3
const BADGE_TOP_3 = (rank: 1 | 2 | 3) => ({ 
  text: `Added to #${rank} Top Show!`, 
  icon: 'star',
  color: 'rgba(255, 215, 0, 0.25)', 
  ... 
})

// Card 8 - You Might Like
const BADGE_YOU_MIGHT_LIKE = { text: 'You Might Like This', icon: 'sparkles', color: 'rgba(59, 130, 246, 0.25)', ... }
```

---

## Back of Card

### Standard Back (Cards 1, 2, 3, 5, 6, 8)
- Close button
- Show synopsis
- Cast & creator info
- Friends activity sections:
  - Watching
  - Want to Watch
  - Watched
- Rating breakdown (Meh, Like, Love)
- Show comments with Load More
- Quick action button (+) opens modal with rating and watchlist options

### Unreleased Back (Card 4 only)
- Same as standard EXCEPT:
- NO quick action button (+)
- Replaced with "Want to Watch" bookmark button
- NO "Watching" or "Watched" sections (can't watch unreleased content)
- Only "Want to Watch" section shown

---

## Side Actions

### Template A (Cards 1, 6)
```
[Heart]  - Like the user's activity
[Plus]   - Open quick action modal (rate + add to lists)
[Comment] - Open comments
```

### Template B (Cards 2, 3, 5, 8)
```
[Plus]   - Open quick action modal
[Share]  - Share the show
```

### Template B - Unreleased (Card 4)
```
[Bookmark] - Add to Want to Watch (direct action, no modal)
[Bell]     - Remind Me (notification when released)
```

---

## File Structure

```
components/feed/
├── FeedCard.tsx              # Main flexible component (renamed from UserActivityCard)
├── FeedCardBack.tsx          # Shared back component
├── FeedCardBadges.tsx        # Badge presets and helpers
├── FollowSuggestionsCard.tsx # Card 7 (completely separate)
└── index.ts                  # Exports
```

---

## Usage Examples

### Card 1 - User Activity
```tsx
<FeedCard
  variant="a"
  badges={[BADGE_LOVED, BADGE_WATCHING]}
  user={{ name: 'Sarah Miller', avatar: '...', id: '123' }}
  timestamp="2 hours ago"
  data={showData}
  onLike={handleLike}
/>
```

### Card 2 - Because You Liked
```tsx
<FeedCard
  variant="b"
  badges={[BADGE_BECAUSE_YOU_LIKED('Breaking Bad')]}
  data={showData}
/>
```

### Card 4 - Coming Soon
```tsx
<FeedCard
  variant="b"
  badges={[BADGE_COMING_SOON('March 15')]}
  backVariant="unreleased"
  data={showData}
/>
```

### Card 6 - Top 3 Update
```tsx
<FeedCard
  variant="a"
  badges={[BADGE_TOP_3(1)]}
  user={{ name: 'Mike Chen', avatar: '...', id: '456' }}
  timestamp="5 hours ago"
  data={showData}
  onLike={handleLike}
/>
```

---

## Implementation Status

All card phases complete, now in integration phase:

1. ✅ **Phase 1:** Refactored UserActivityCard → FeedCard with variant prop
2. ✅ **Phase 2:** Extracted badge presets (BADGE_PRESETS object)
3. ✅ **Phase 3:** Added backVariant support for Card 4 (unreleased)
4. ✅ **Phase 4:** Built Card 7 (FollowSuggestionsCard) separately
5. ✅ **Phase 5:** Created data transformation layer (`feedDataTransformers.ts`)
6. ✅ **Phase 6:** Built `/preview/feed-live` with real data
7. ✅ **Phase 7:** Added Instagram-style hideOnScroll header
8. 🚧 **Phase 8:** Wire up interactions (like, comment, rate, watchlist)
9. ⏳ **Phase 9:** Replace old feed components in `/feed` page

---

## Key Technical Decisions

### Why One Component vs Many?
- 90% of the code is shared (flip, scroll, comments, back content)
- Only differences are: user header, heart button, badges
- Easier to maintain and keep consistent
- Bug fixes apply to all card types automatically

### Why Separate Card 7?
- Completely different layout (no show poster background)
- Carousel behavior unique to this card
- No flip animation
- Different data structure (users vs shows)

### iOS Compatibility
All cards inherit the iOS fixes from Card 1:
- JavaScript-based scroll for back of card
- `translateZ(0)` for Safari compositing
- GPU acceleration hints
- 16px input font-size

---

*This architecture enables efficient development of all 8 card types while maintaining consistency and reusing tested code.*


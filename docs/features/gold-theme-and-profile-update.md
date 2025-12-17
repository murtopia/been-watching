# Gold Theme & Profile/Friends Update

**Last Updated:** December 17, 2025
**Status:** Complete (including Admin Area)

---

## Overview

Major visual refresh replacing pink/orange gradients with Electric Gold (#FFC125) accent color throughout the app, plus improvements to the profile page Friends section.

---

## ⚠️ Important Design Guidelines

### Background Colors
- **Dark mode background:** Always use solid `#0d0d0d` (soft dark) - **NEVER a gradient**
- **Light mode background:** Use `#ffffff`
- **Content containers:** Should have **no fill color** - content floats directly on the page background
- The `#0d0d0d` color is defined in:
  - `hooks/useThemeColors.ts` → `background` and `bgGradient`
  - `app/globals.css` → `--bg-primary` and body background
  - Individual pages use `document.body.style.backgroundColor = '#0d0d0d'`

### What to Avoid
- ❌ Gradient backgrounds on pages
- ❌ Using pure black (`#000000`) - it's too harsh
- ❌ Container boxes with fill colors around main content (content should float)
- ❌ Using `colors.cardBg` for main content containers

---

## ✅ Landing & Auth Pages (`app/page.tsx`, `app/auth/page.tsx`)

### Background Image
- **Fixed background:** `landing-bg.webp` (1290x2800px WebP, ~500KB)
- **Dark overlay:** `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.65) 100%)`
- **Mobile-friendly:** Uses `position: fixed` divs (not `background-attachment: fixed` which breaks on iOS)
- **iOS overscroll fix:** `useEffect` sets black html/body background to prevent white flash when overscrolling

### Landing Page (`app/page.tsx`)
- **Hero copy:** "What Have You Been Watching?" / "Track what you watch, find out what your friends are watching, and never miss a great show."
- **Waitlist modal:** Updated copy, circular close button (`close-c-default` icon)
- **Gold theme:** All buttons and accents use gold

### Auth Page (`app/auth/page.tsx`)
- **Same background image** as landing page
- **Theme toggle removed:** Users use system settings by default, can change in Settings → Appearance
- **Back button:** Links to `/` (was `/welcome` which is deprecated)
- **Footer width:** Fixed to match landing page (uses `width: 100vw` with negative margins to break out of padding constraint)

### Technical Implementation
```typescript
// iOS overscroll fix - add before any early returns
// Always use #0d0d0d (soft dark) - never pure black or gradients
useEffect(() => {
  document.documentElement.style.backgroundColor = '#0d0d0d'
  document.body.style.backgroundColor = '#0d0d0d'
  return () => {
    document.documentElement.style.backgroundColor = ''
    document.body.style.backgroundColor = ''
  }
}, [])

// Background layers with positive z-index
<div style={{ position: 'fixed', zIndex: 0, backgroundImage: `url('/landing-bg.webp')`, ... }} />
<div style={{ position: 'fixed', zIndex: 1, background: 'linear-gradient(...)', ... }} />
// Content uses zIndex: 2+
```

---

## ✅ Gold Theme Implementation

### Color System Updates (`hooks/useThemeColors.ts`)
- **Primary Accent:** Electric Gold `#FFC125`
- **Gold Borders:** `goldBorder` (1px), `goldBorderThin` (0.5px)
- **Gold Glass:** `goldGlassBg` with subtle gold tint
- **Dividers:** Changed to subtle gray `rgba(255, 255, 255, 0.2)`

### Components Updated
| Component | Changes |
|-----------|---------|
| `AppHeader` | Grey glass fill, gold border, **white text** (removed gradient) |
| `Footer` | Grey glass fill, gold border |
| `BottomNav` | Gold glass fill, gold borders, renamed "SHOWS" → "LISTS" |
| `FeedCard` | 0.5px gold border, gold glass action buttons |
| `SearchModalEnhanced` | Gold border on modal |
| `InviteSection` | Gold accents, gold share button, gold bullets |
| **Loading Spinners** | Changed from pink to gold across all pages |

### Files with Spinner Updates
- `app/profile/page.tsx`
- `app/myshows/page.tsx`
- `components/search/SearchModalEnhanced.tsx`
- `components/search/SearchModal.tsx`
- `components/profile/TopShowModal.tsx`
- `components/media/MediaDetailModal.tsx`

---

## ✅ Profile Page Redesign (`app/profile/page.tsx`)

### Visual Changes
- **Background:** Softer dark `#0d0d0d` instead of pure black
- **Width:** Mobile-first `398px` max-width
- **Containers:** Removed glassmorphic boxes, content floats on background
- **Avatar "+":** Changed from blue to gold
- **Tabs:** Gold active state (was pink)
- **Dividers:** Subtle gray dividers between sections
- **Admin Section:** Removed "Admin" heading, centered button with equal spacing

### Friends Tab System
- **Following / Followers / Discover** tabs with gold active state
- **Requests tab** appears conditionally for private accounts with pending requests
- When 4 tabs visible, "Discover" shows only search icon (no text)

---

## ✅ UserCard Component Redesign (`components/friends/UserCard.tsx`)

### New Layout
```
[Avatar] [ Name                   Button  Menu ]
         [ @username                           ]
         [ 69% match  [avatars] 5 mutual       ]
```

### Features
- **Button alignment:** Top row with name/username (was spanning all 3 lines)
- **Full width bottom row:** Taste match + mutual friends no longer wrap
- **Follow button states:**
  - Gold: Follow, Follow Back (action buttons)
  - Gray: Following, Mutual, Requested (status indicators)
- **Overlapping avatars:** Up to 3 mutual friends shown
- **Clickable mutual friends:** Opens MutualFriendsModal

### Taste Match Colors
- **Green (`#22c55e`):** Good/Great/Exceptional (50%+)
- **Yellow (`#eab308`):** Fair (30-49%)
- **Red (`#ef4444`):** Poor (0-29%)

---

## ✅ MutualFriendsModal (`components/friends/MutualFriendsModal.tsx`)

### Features
- **Fixed size:** 400px height for consistency
- **Scroll lock:** Body scrolling disabled when open
- **Scroll containment:** `overscrollBehavior: contain` prevents scroll chaining
- **Gold border:** Matches theme
- **Backdrop blur:** Visual separation from page

---

## ✅ My Lists Page (`app/myshows/page.tsx`)

### Renamed
- Page title: "My Shows" → "My Lists"
- Bottom nav: "SHOWS" → "LISTS"

### Visual Changes
- **Background:** Softer dark `#0d0d0d`
- **No container box:** Content floats on background
- **Top 3 Shows:** Gold border (was orange glow)
- **Tabs:** Gold active state (was blue)
- **Default tab:** "Watching" (was "Want to Watch")

---

## ✅ Performance Improvements

### Parallel Data Loading (`app/profile/page.tsx`)
- Taste matches and mutual friends load in parallel
- Progressive UI updates as each user's data arrives
- Fixed stale state overwrite bug in `loadSuggestedFriends`

```typescript
// Before: Sequential loading
for (const userId of uniqueUserIds) {
  const match = await getTasteMatchBetweenUsers(...)
  // slow
}

// After: Parallel loading with progressive updates
const loadPromises = uniqueUserIds.map(async (userId) => {
  const [matchResult, mutuals] = await Promise.all([...])
  setTasteMatches(prev => new Map(prev).set(userId, matchResult.score))
})
await Promise.all(loadPromises)
```

---

## 🎨 Design Tokens Reference

```typescript
// Gold accents
goldAccent: '#FFC125'
goldBorder: '1px solid #FFC125'
goldBorderThin: '0.5px solid #FFC125'
goldGlassBg: 'rgba(255, 193, 37, 0.15)' // dark mode

// Dividers
dividerColor: 'rgba(255, 255, 255, 0.2)' // dark mode

// Text (header)
textPrimary: '#ffffff' // "Been Watching" text is now white
```

---

## 📁 Key Files Modified

### Core App
- `hooks/useThemeColors.ts` - Gold color tokens
- `components/navigation/AppHeader.tsx` - White text, grey glass
- `components/navigation/BottomNav.tsx` - Gold styling, "LISTS" label
- `components/navigation/Footer.tsx` - Gold styling
- `components/feed/UserActivityCard.tsx` - Gold borders, 42px buttons
- `components/friends/UserCard.tsx` - Redesigned layout
- `components/friends/MutualFriendsModal.tsx` - Scroll lock, fixed size
- `components/profile/InviteSection.tsx` - Gold accents, updated copy
- `app/profile/page.tsx` - Mobile redesign, parallel loading
- `app/myshows/page.tsx` - Gold accents, renamed to "My Lists"
- `app/page.tsx` - Landing page with background image, gold theme
- `app/auth/page.tsx` - Auth page with background image, removed theme toggle
- `public/landing-bg.webp` - Background image for landing/auth pages

### Admin Area (26 files)
- `app/admin/layout.tsx` - Mobile nav, gold theme
- `components/admin/MetricCard.tsx` - Gold icons/hovers
- `app/admin/page.tsx` - Gold dashboard
- `app/admin/*/Nav.tsx` (6 files) - Gold active states
- `app/admin/users/*.tsx` (4 files) - Gold user management
- `app/admin/invites/InviteCodeManager.tsx` - Gold toggles
- `app/admin/content/ContentOverview.tsx` - Gold cards
- `app/admin/moderation/ModerationOverview.tsx` - Gold hovers
- `app/admin/messaging/email/EmailDashboard.tsx` - Gold button
- `app/admin/*/AnnouncementForm.tsx` (2 files) - Gold forms
- Design assets pages, streaming-platforms, content/top, content/ratings

---

## ✅ Admin Area Mobile Redesign (`app/admin/`)

### Mobile Navigation (< 768px)
- **Hamburger menu** in fixed top header bar (56px height)
- **Slide-in sidebar** from left (280px wide)
- **Dark backdrop overlay** with blur when menu open
- **Tap to close** - clicking overlay or nav item closes menu
- **Current section name** displayed in mobile header

### Desktop Navigation (≥ 768px)
- **Collapsible sidebar** - click chevron to toggle (240px ↔ 80px)
- Same behavior as before, no changes

### Gold Theme in Admin
All pink/gradient colors replaced with gold across 26 files:

| Component | Gold Changes |
|-----------|-------------|
| Layout | Gold loading spinner, gold active nav states |
| MetricCard | Gold icon backgrounds, gold hover shadows |
| Dashboard | Gold buttons, PostHog section styling |
| Sub-navs (all 6) | Gold active tab borders and text |
| User tables | Gold avatar placeholders, admin badges |
| GrantRoleModal | Gold selected state, submit button |
| InviteCodeManager | Gold toggle buttons, code display |
| ContentOverview | Gold card hovers, action buttons |
| ModerationOverview | Gold hover shadows |
| EmailDashboard | Gold send button |
| AnnouncementForm | Gold emoji selection, submit buttons |
| Design assets pages | Gold toggle buttons |

### Files Modified
- `app/admin/layout.tsx` (complete rewrite for mobile)
- `components/admin/MetricCard.tsx`
- `app/admin/page.tsx`
- All 6 sub-nav components
- `UsersTableClient.tsx`, `UserCard.tsx`, `GrantRoleModal.tsx`, `UsersTable.tsx`
- `InviteCodeManager.tsx`, `ContentOverview.tsx`, `ModerationOverview.tsx`
- `EmailDashboard.tsx`, both `AnnouncementForm.tsx` files
- Design assets pages (icons, cards, feed-cards, components)
- `streaming-platforms/page.tsx`, `content/top/page.tsx`, `content/ratings/page.tsx`

---

## 🧪 Testing Notes

- Test all loading spinners (should be gold, not pink)
- Test UserCard layout with long names and 69%+ match (shouldn't wrap)
- Test MutualFriendsModal scroll on mobile (page shouldn't scroll)
- Test follow button states (gold for actions, gray for status)
- Verify "Been Watching" header text is white (not gradient)
- **Landing page:** Background image fixed on mobile scroll (doesn't move with content)
- **Landing page:** No white flash when overscrolling on iOS
- **Auth page:** No theme toggle visible
- **Auth page:** "Back" button returns to home page (not /welcome)
- **Both pages:** Footer widths match
- **Admin (mobile):** Hamburger menu opens slide-in nav
- **Admin (mobile):** Overlay closes menu on tap
- **Admin (mobile):** Header shows current section name
- **Admin (all):** All accents are gold (not pink)


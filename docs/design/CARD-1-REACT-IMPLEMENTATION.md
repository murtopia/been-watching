# Card 1: User Activity Card - React Implementation

**Status:** ✅ APPROVED  
**Last Updated:** January 2025  
**Component:** `components/feed/UserActivityCard.tsx`  
**Individual Test:** `/preview/card-1`  
**Full Feed Test:** `/preview/feed-v2` (all 8 cards with 15 front + 23 back comments for scroll testing)

---

## Overview

Card 1 is the "User Activity Card" - shown when a friend rates or adds a show to their list. This is the foundational card type that all other cards build upon.

**Source HTML:** `/public/card-1-standalone.html`  
**React Component:** `/components/feed/UserActivityCard.tsx`

---

## Dimensions & Layout

- **Card Size:** 398px × 645px
- **Flip Animation:** Full 3D flip with `rotateY(180deg)`
- **Front/Back:** Both sides fully implemented

---

## Intentional Deviations from HTML Template

During mobile testing and iteration, we made the following intentional changes from the original HTML template:

### 1. Removed "Related Shows" Section

**Decision:** Removed the "Similar Shows" / "Related Shows" horizontal scroll section from the back of the card.

**Reasons:**
- Added unnecessary complexity with nested horizontal scroll inside vertical scroll
- Navigation issues (opening a card on top of another card)
- Related shows will appear naturally in the activity feed
- Simplified the scroll implementation for iOS compatibility

### 2. JavaScript-Based Scroll on Card Back

**Decision:** Replaced native CSS scroll with custom JavaScript touch handlers.

**Reason:** iOS Safari does not support native scroll inside `rotateY(180deg)` 3D transformed containers. Native scroll simply doesn't work.

**Implementation:**
- Custom touch handlers: `handleBackTouchStart`, `handleBackTouchMove`, `handleBackTouchEnd`
- Uses `transform: translate3d(0, -${offset}px, 0)` for GPU-accelerated scroll
- Momentum physics with deceleration rate `0.92` per frame
- Max velocity capped at `50` for natural feel

### 3. Swipe-to-Expand Comments Modal (Front)

**Addition:** Added swipe gesture support to expand/collapse the comments modal on the front of the card.

**Implementation:**
- Touch handlers detect vertical swipe on comments tab
- 20px threshold triggers expansion
- Full content slides with finger (not just header)

---

## Technical Decisions

### iOS Scroll Physics

The back card uses tuned iOS-style momentum scrolling:

```typescript
const decelerationPerFrame = 0.92  // More friction than default
const maxVelocity = 50             // Cap initial velocity
```

These values were tuned through extensive mobile testing to feel natural without overshooting.

### Safari 3D Transform Fix

**Problem:** Safari has a rendering bug where dynamically loaded content inside `rotateY(180deg)` transforms collapses to zero height.

**Solution:** Add `translateZ(0)` to force a new compositing layer:

```css
.comments-list {
  transform: translateZ(0);
}

.card-back-inner {
  transform: translateZ(0);
}
```

### GPU Acceleration

For smooth scroll without jitter/flicker:

```css
.card-back-content {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back-inner {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```

### Input Zoom Prevention (iOS)

**Problem:** iOS zooms in on inputs with font-size < 16px.

**Solution:** Keep input at 16px, style placeholder separately:

```css
.comment-input {
  font-size: 16px;  /* Prevents iOS zoom */
}

.comment-input::placeholder {
  font-size: 13px;  /* Matches comment text size */
}
```

---

## Features Implemented

### Front of Card
- [x] User header (avatar, name, timestamp)
- [x] Activity badges (Loved, Currently Watching, etc.)
- [x] Show poster background with gradient overlay
- [x] Show title and metadata (year, genres, rating)
- [x] Friend avatars ("8 friends also loved this")
- [x] Side action buttons (Heart, Plus, Comment)
- [x] Action overlay modal (6-option grid: Meh, Like, Love, Want To, Watching, Watched)
- [x] Comments tab (expandable)
- [x] Swipe-to-expand comments
- [x] Comment input with send button

### Back of Card
- [x] Close button
- [x] Show synopsis
- [x] Cast & creator info
- [x] Friends activity sections (Watching, Want to Watch, Watched)
- [x] Rating breakdown (Meh, Like, Love counts)
- [x] Show comments with Load More
- [x] JavaScript-based touch scroll with momentum
- [x] Desktop mouse wheel support

### Interactions
- [x] 3D flip animation
- [x] Touch/click to flip
- [x] Action modal with state management (ratings exclusive, watchlist multi-select)
- [x] Like/unlike comments
- [x] Expandable/collapsible comments section

---

## Test Data

The component includes sample data with:
- 12 FPO comments for testing "Load More" functionality
- Initially shows 10 comments, loads 10 more on click
- Sample user: Sarah Miller
- Sample show: Breaking Bad Season 5

---

## Known Limitations

1. **Desktop Scroll:** Uses `onWheel` handler since touch handlers don't fire for mouse
2. **Page Bounce:** Parent page must have `overscroll-behavior: none` to prevent iOS bounce
3. **Comment Likes:** Currently visual only - needs backend integration

---

## Files Reference

| File | Purpose |
|------|---------|
| `components/feed/UserActivityCard.tsx` | Main React component |
| `app/preview/card-1/page.tsx` | Isolated test page |
| `app/preview/card-1a/page.tsx` | Alternative test page for debugging |
| `public/card-1-standalone.html` | Original HTML template |

---

## Session Notes

### Mobile Testing Sessions (Jan 2025)

**Issues Fixed:**
1. Back card not scrolling - Implemented JS touch scroll
2. Input zoom on focus - Set font-size to 16px
3. Icon states in action modal - Added pressed/active states
4. Comments cut off after Load More - Added `translateZ(0)` Safari fix
5. Jerky scroll - Added GPU acceleration hints
6. Page bouncing - Added overscroll-behavior CSS

**Key Learning:** iOS Safari's 3D transforms break many standard CSS behaviors. Always test on actual iOS devices, not just simulators.

---

## Next Steps

1. ~~Build Cards 2-8 using this as foundation~~ ✅ COMPLETE
2. Implement friends list expansion feature (clicking friend avatars) - PENDING
3. Connect to real data/API - NEXT PRIORITY
4. Add analytics tracking for interactions - PENDING

---

## Test Feed: /preview/feed-v2

All 8 approved cards are now integrated in a scrollable test feed:

- **Scroll-snap:** Cards snap to center with `scroll-snap-type: y mandatory`
- **Card 1 Comments:** 15 front + 23 back comments for scroll/load-more testing
- **Mobile tested:** All cards verified on iOS Safari
- **Scroll lock:** Page scroll locks when viewing back of flipped card

**Known Issue:** Grey bars at top/bottom of page (iOS safe areas) - will be addressed when integrating into real feed with actual header/footer.

---

*This document captures the approved React implementation as of January 2025.*


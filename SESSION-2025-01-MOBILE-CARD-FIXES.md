# Session Notes: Mobile Card 1 Fixes
**Date:** January 2025

## Summary
Major progress on React Card 1 mobile compatibility. Created isolated test page, fixed critical iOS issues, and implemented JavaScript-based scroll for 3D transformed elements.

## What Was Accomplished

### 1. Isolated Test Page ✅
- Created `/preview/card-1` route for mobile testing
- No auth required, no database calls
- Self-contained with sample data
- Live at: https://beenwatching.com/preview/card-1

### 2. iOS Input Zoom Fix ✅
- **Problem:** iOS Safari auto-zooms on input focus when font-size < 16px
- **Solution:** Changed comment input font-size from 13px to 16px
- Files: `components/feed/UserActivityCard.tsx`

### 3. Quick Action Modal Icon States ✅
- **Problem:** On touch, only inner icon turned red, not outer circle
- **Root cause:** CSS `:active` doesn't work reliably on iOS Safari
- **Solution:** 
  - Added `pressedIcon` state to track which icon is pressed
  - Added `onTouchStart` handlers to set pressed state
  - Clear pressed state in click handlers after setting active state
  - Added `.pressed` and `.active` CSS classes with `!important`

### 4. Back Card Scroll Fix ✅ (needs tuning)
- **Problem:** Back card content wouldn't scroll on iOS
- **Root cause:** CSS `overflow: scroll` breaks inside 3D transformed elements on iOS
- **Solution:** JavaScript-based touch scroll implementation
  - `handleBackTouchStart` - captures initial position
  - `handleBackTouchMove` - calculates delta and sets scrollTop
  - `handleBackTouchEnd` - applies momentum animation
- **Current state:** Working but scroll physics need fine-tuning

### 5. iOS Momentum Scroll (in progress)
- Implemented velocity tracking during touchMove
- Using iOS `UIScrollViewDecelerationRateNormal = 0.998` per frame
- Velocity smoothing: 80% previous + 20% current
- **Needs work:** User reports scroll doesn't feel quite right yet

## What's Left To Do

### High Priority
1. **Fine-tune scroll physics** - The momentum/friction doesn't feel native yet
   - Consider researching Apple's exact scroll implementation more
   - May need to adjust velocity calculation or deceleration curve
   - Previous agent work exists somewhere with iOS scroll specs

### Medium Priority  
2. **Friends list expansion** - User requested feature
   - Clicking "8 friends also loved this" should expand to show list
   - Could be sliding panel from bubble or modal
   - Show avatars + names (maybe follow buttons?)
   - Similar to Instagram's "followed by X, Y, and Z others"

3. **Swipe up to expand comments** - User requested
   - Currently only tap "view X comments" expands
   - Add gesture detection on comment modal header
   - Swipe up = expand, swipe down = collapse

### Future (keep in mind)
4. **Feed with scroll snap** - For future activity feed
   - Cards stacked vertically
   - Swipe up moves card out of frame, next card centers
   - User mentioned previous work on this exists somewhere

## Technical Notes

### Why CSS Scroll Breaks on iOS with 3D Transforms
When an element has `transform: rotateY(180deg)` (like our card flip), iOS Safari breaks native scrolling inside that element. The scroll container's touch events get captured by the transform layer.

**Workaround:** Implement scroll manually with JavaScript touch handlers.

### iOS Scroll Physics Reference
- `UIScrollViewDecelerationRateNormal = 0.998` per frame
- `UIScrollViewDecelerationRateFast = 0.99` per frame
- Apple PastryKit uses ~325ms time constant
- Velocity should be tracked during move, not calculated at end

### Page Scroll Lock for Testing
The preview page currently has page scroll locked for isolated testing:
```css
html, body {
  overflow: hidden !important;
  position: fixed !important;
}
```
Remember to remove this when scroll is working correctly.

## Files Modified
- `app/preview/card-1/page.tsx` - Test page
- `components/feed/UserActivityCard.tsx` - Main card component

## Commits Made
1. Create /preview/card-1 isolated test page
2. Fix useSearchParams Suspense boundary (Next.js 15)
3. Fix mobile issues (input zoom, icon states)
4. Multiple scroll fix attempts (v1-v6)
5. iOS momentum scroll implementation

## Next Session Recommendations
1. Start by testing scroll on mobile - see if overnight deploy changed anything
2. If scroll still needs work, consider:
   - Searching codebase for previous iOS scroll work
   - Testing different deceleration values
   - Adding console logs to debug velocity values
3. Once scroll feels right, tackle friends list expansion
4. Then move to remaining 7 cards!

---
*Card 1 is ~95% complete. Scroll tuning is the last piece before moving to Card 2.*


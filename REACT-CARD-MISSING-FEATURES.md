# React Card Missing Features - Pixel-Perfect Conversion Checklist

**Date:** January 16, 2025
**Status:** In Progress - Major components missing

## Summary

The React conversion of card-1-minimal.html is missing several critical features that exist in the approved HTML version. This document lists everything that needs to be added to achieve pixel-perfect accuracy.

---

## ❌ MISSING MAJOR FEATURES

### 1. **Action Overlay Modal** (CRITICAL - Completely Missing)

The entire quick action modal is missing from the React component. This is a major feature that appears when clicking the "+" button.

**Location in HTML:** Lines 1990-2076
**Triggered by:** Clicking the plus (+) button on side actions

**Components:**
- Overlay background with blur
- Modal with 6 action items in 3x2 grid
- Divider line between ratings and watchlist sections

**Grid Items:**
1. **Meh** (meh-face icon) - Rating option
2. **Like** (thumbs-up icon) - Rating option
3. **Love** (heart icon) - Rating option
4. **Want To** (bookmark icon + plus badge) - Watchlist action
5. **Watching** (play icon + plus badge) - Watchlist action
6. **Watched** (check-circle icon + plus badge) - Watchlist action

**Missing Icons Needed:**
- `bookmark` (20px)
- `check` or `check-circle` (20px)
- `plus-small` (10px for badges)

**CSS Classes Missing:**
```css
.action-overlay
.action-modal
.action-modal-grid
.action-modal-item
.action-modal-icon
.action-modal-label
.action-modal-divider
.watchlist-badge
```

**Special Behavior:**
- Modal rotates with card flip (needs rotateY(180deg) counter-rotation)
- Scale animation (0.9 to 1.0)
- Plus badges positioned absolute on top-right of icons
- Gradient background on plus badges

---

### 2. **Star Icons for Ratings**

Currently using emoji ⭐ instead of SVG star icons.

**Locations:**
- Front card: Show metadata ("⭐ 9.5")
- Back card: Metadata section ("⭐ 9.5")

**Should be:**
- `Icon name="star" state="filled" size={14} color="#FFD700"`

---

### 3. **Proper Play Icon in Badge**

The "Currently Watching" badge might not be using the correct play icon style.

**Should verify:**
- Icon: `play` (not `play-triangle`)
- Size: 14px
- State: `filled`

---

## ⚠️ STYLING ISSUES TO FIX

### Icon Sizing Inconsistencies

Review all icon sizes to match HTML exactly:

| Location | Icon | HTML Size | React Size | Status |
|----------|------|-----------|------------|--------|
| Menu button | menu-dots | 20px | 20px | ✅ |
| Activity badges | heart, play | 16px | 14px | ❌ Need to fix |
| Side actions | heart, plus, comment | 24px | 24px | ✅ |
| Comments close | close | 14px | 14px | ✅ |
| Comment likes | heart | 14px | 14px | ✅ |
| Send button | send | 16px | 16px | ✅ |
| Back close | close | 16px (in 36px container) | 16px | ✅ |
| Back actions | plus, comment, share | 22px, 22px, 20px | 22px, 22px, 20px | ✅ |
| Friends ratings | meh, thumbs, heart | 28px (in 42px container) | 28px | ✅ |
| Show comments | heart | 14px | 14px | ✅ |

### CSS Refinements Needed

1. **Activity Badge Icons** - Size should be 16px, not 14px
2. **Icon stroke widths** - Verify all match (should be 1.5 for most, 2 for small icons)
3. **Container sizes** - Verify all circular button containers match HTML

---

## 📋 COMPLETE ICON INVENTORY

### Icons Currently Used ✅
- `menu-dots` (1 instance)
- `heart` (11 instances - various states)
- `play` (3 instances)
- `plus` (2 instances)
- `comment` (3 instances)
- `close` (3 instances)
- `send` (1 instance)
- `meh-face` (1 instance on back)
- `thumbs-up` (1 instance on back)
- `share` (1 instance on back)

### Icons Still Missing ❌
- `star` (should replace ⭐ emoji - 2 instances)
- `bookmark` (for Want to Watch in modal)
- `check` or `check-circle` (for Watched in modal)
- `plus-small` (10px badges on watchlist items - 3 instances)

---

## 🔧 IMPLEMENTATION PRIORITY

### High Priority (Blocking pixel-perfect accuracy)
1. ❌ **Add Action Overlay Modal** - Major feature missing
2. ❌ **Add bookmark icon** to icon sprite
3. ❌ **Add check-circle icon** to icon sprite
4. ❌ **Add plus-small icon** (10px version) to icon sprite
5. ❌ **Replace star emoji** with SVG icon
6. ❌ **Fix activity badge icon sizing** (14px → 16px)

### Medium Priority (Visual polish)
7. ⚠️ **Verify all icon stroke widths**
8. ⚠️ **Verify all container sizes**
9. ⚠️ **Test flip animation** with modal rotation
10. ⚠️ **Test all interactive states**

### Low Priority (Nice to have)
11. 📝 Add hover states to match HTML
12. 📝 Add proper transitions/animations
13. 📝 Test on mobile with touch events

---

## 🎯 NEXT STEPS

1. **Check icon sprite** - Verify these icons exist:
   - bookmark
   - check or check-circle
   - plus-small (10px version)
   - star (with filled state)

2. **Add Action Overlay Modal** to React component:
   - Create modal component
   - Add overlay backdrop
   - Implement 3x2 grid layout
   - Add all 6 action items
   - Add plus badges to watchlist items
   - Implement show/hide animation
   - Add counter-rotation for card flip

3. **Fix Icon Sizing:**
   - Activity badges: 14px → 16px
   - Verify all other sizes match HTML

4. **Replace Emoji Characters:**
   - ⭐ → `<Icon name="star" state="filled" size={14} color="#FFD700" />`
   - 💬 → Keep as is (decorative text)
   - ▶ → Keep as is (part of "Trailer" text)

5. **Test Everything:**
   - Compare side-by-side with HTML version
   - Test all interactions
   - Verify on mobile
   - Check flip animations

---

## 📸 Visual Comparison Checklist

When comparing React vs HTML, check:

- [ ] Card dimensions (398×645px)
- [ ] All icons present and correct size
- [ ] Badge styling matches
- [ ] Button sizes match
- [ ] Flip animation smooth
- [ ] Modal appears/animates correctly
- [ ] Comments tab functions properly
- [ ] Scroll behavior on back card
- [ ] All interactive elements work
- [ ] Mobile touch interactions work

---

## 🔗 References

- **HTML File:** `/public/card-1-minimal.html`
- **React Component:** `/components/feed/UserActivityCard.tsx`
- **Icon Library:** `/app/admin/design-assets/icons/page.tsx`
- **Icon Sprite:** `/public/icons/feed-sprite.svg`
- **Preview Page:** `/app/admin/design-assets/feed-cards/page.tsx`

---

**Last Updated:** January 16, 2025
**Completion Status:** ~60% - Major features still missing

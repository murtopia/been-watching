# Activity Card Design Session - January 2025

**Date:** January 2025
**Status:** In Progress - Finalizing Approved Design
**Files:** `single-card-interactive.html`, `feed-mockup-all-cards-inset.html`

---

## Current Status

### ✅ Approved Design
**File:** `public/single-card-interactive.html`
**Card Type:** User Activity Card (Card 1)

**Approved Features:**
- Full-screen card design (398×645px)
- Card flip functionality (front ↔ back)
- Glassmorphic bottom content area
- Three-dot menu button (triggers flip)
- Side action buttons (like, +, comment)
- Activity comments tab (slides up from bottom)
- Complete back side with show details
- + modal with ratings and watchlist options

### 🔄 In Progress - Enhancements
**Current Work:** Adding missing features to approved card

**Missing Features Being Added:**
1. **+ Modal on Back Side** - Currently only works on front
2. **Like Buttons on Comments** - Both activity comments AND show comments need like functionality
3. **Reusable CSS Classes** - Creating standardized classes for all cards

---

## Design Requirements (Finalized)

### Card Structure

**Front Side:**
- Poster background (full bleed)
- Gradient overlay (bottom fade)
- Three-dot menu (top right) - triggers flip
- Bottom content area (glassmorphic)
- User header (avatar, name, timestamp)
- Show title and metadata
- Friend avatars (who also watched/loved)
- Side actions (right side):
  - Like button (only on activity cards)
  - + button (add to watchlist) - triggers modal
  - Comment button (only on activity cards) - opens comments tab
  - Share button (only on release cards)
- Comments tab (slides up from bottom - activity cards only)

**Back Side:**
- Dark gradient background
- Close button (top right) - triggers flip
- Show title + metadata
- Badges (season, type, network, trailer)
- Synopsis (collapsible)
- Action icons:
  - + button (add to watchlist) - **NEEDS MODAL**
  - Comment button (show comments)
  - Share button
- Info grid (creator, genre)
- Cast list
- Friends watching (by status)
- Friends ratings stats
- Show comments section **NEEDS LIKE BUTTONS**
- Similar shows

### Interactive Elements

**+ Modal (Add to Watchlist):**
- Appears on overlay with blur
- 3×2 grid layout
- Top row: Rating options (Meh, Like, Love)
- Divider line
- Bottom row: Watchlist options (Want To, Watching, Watched)
- Each has icon + label
- Small + badge on watchlist icons
- **Must work on BOTH front and back**

**Comments with Likes:**
- Activity comments (front - glass tab)
- Show comments (back - comments section)
- Each comment needs:
  - Avatar
  - Username + timestamp
  - Comment text
  - **Like button with count** ← MISSING

---

## Card Types to Be Updated

Using approved Card 1 structure as template:

### Card 1: User Activity ✅ APPROVED (with enhancements in progress)
- Has: Full flip, activity comments, all actions
- Needs: + modal on back, like buttons on comments

### Card 2: "Because You Liked" Recommendation ⏳ TO BE EDITED
- Front: Recommendation badge, no user header
- Actions: + button, share button (NO heart, NO comment)
- Back: Same as Card 1

### Card 3: "Your Friends Loved" ⏳ TO BE EDITED
- Front: Social recommendation badge, friend avatars
- Actions: + button, share button (NO heart, NO comment)
- Back: Same as Card 1

### Card 4: New Season Alert ⏳ TO BE EDITED
- Front: New season badge, countdown timer
- Actions: + button, share button (NO heart, NO comment)
- Back: Same as Card 1

### Card 5: Now Streaming ⏳ TO BE EDITED
- Front: Streaming badge, streaming service badge
- Actions: + button, share button (NO heart, NO comment)
- Back: Same as Card 1

### Card 6: Top 3 Update ⏳ TO BE EDITED
- Front: Trophy badge, user header (friend's update)
- Actions: Heart button, + button, comment button
- Comments tab: YES (activity comments)
- Back: Same as Card 1

### Card 7: Follow Suggestions ⏳ TO BE EDITED
- NO flip (no show content)
- NO poster background
- Gradient background
- User profile cards
- Follow buttons
- Different structure entirely

---

## Technical Implementation Plan

### Phase 1: Fix Approved Card (In Progress)
1. Add + modal to back side
2. Add like buttons to all comments
3. Create reusable CSS classes
4. Test thoroughly

### Phase 2: Apply to All Cards
1. Copy approved structure to Cards 2-6
2. Customize front content per card type
3. Keep back side identical for all
4. Card 7 gets unique treatment

### Phase 3: Production Optimization (Future)
- Convert inline SVGs to sprite sheet
- Minimize CSS
- Optimize for React components

---

## Reusable Components

### CSS Classes (To Be Created)
```css
.card-back-standard         /* Complete back template */
.comment-item-with-likes    /* Comment with like button */
.action-modal-standard      /* +/rating modal */
.side-actions-standard      /* Right side buttons */
.comments-tab-standard      /* Slide-up comments */
```

### JavaScript Functions (To Be Created)
```javascript
toggleActionOverlay(event, cardId, isBackSide)  // Works anywhere
toggleCommentLike(commentId)                    // All comments
toggleCardFlip(cardId)                          // Any card flip
```

---

## Design System Reference

### Typography
- Title: 16px / 600 weight
- Username: 14px / 600 weight
- Meta: 12px / 400 weight
- Timestamp: 11px / 400 weight
- Back Title: 22px / 700 weight
- Back Body: 14px / 400 weight

### Colors
- Glass badge: `rgba(255, 255, 255, 0.15)`
- Gradient primary: `linear-gradient(135deg, #FF006E, #FF8E53)`
- Gradient gold: `linear-gradient(135deg, #FFD700, #FFA500)`
- Background overlay: `rgba(0, 0, 0, 0) 0%` → `rgba(0, 0, 0, 0.9) 100%`

### Spacing
- Card padding: 20px
- Bottom padding: 40px
- Element gap: 10px
- Action button gap: 12px
- Action button size: 40×40px
- Menu button size: 40×40px

### Effects
- Backdrop blur: 10px (buttons), 20px (glass elements)
- Border radius: 16px (card), 50% (buttons)
- Border: 1.5px solid rgba(255, 255, 255, 0.2)

---

## File Locations

### Mockup Files
- **Approved Card:** `public/single-card-interactive.html`
- **All 7 Cards:** `public/feed-mockup-all-cards-inset.html`
- **Comparison:** `public/feed-comparison-mockup.html`
- **TikTok Style:** `public/tiktok-activity-cards-complete.html`

### Documentation
- **Card Types:** `docs/design/activity-card-types.md`
- **Templates:** `docs/design/activity-card-templates.md`
- **Session Notes:** This file

---

## Reusable CSS Classes

The following utility classes have been added to `single-card-interactive.html` for reuse across all card types:

### Glassmorphism
- `.glass-light` - Light glass effect (10% white, 10px blur)
- `.glass-medium` - Medium glass (15% white, 15px blur)
- `.glass-heavy` - Heavy glass (20% white, 20px blur)
- `.glass-dark` - Dark glass (40% black, 10px blur)

### Buttons
- `.action-btn-base` - 40×40px circular button base
- `.action-btn-primary` - Primary action button (glass background)
- `.action-btn-liked` - Liked state (pink background)
- `.icon-btn-base` - 32×32px icon button base
- `.icon-btn-glass` - Glass icon button

### Typography
- `.text-title` - 16px/600 title text
- `.text-username` - 14px/600 username text
- `.text-meta` - 13px/0.7 opacity meta text
- `.text-body` - 14px body text
- `.text-small` - 12px small text
- `.text-tiny` - 11px tiny text

### Badges
- `.badge-base` - Base badge styling
- `.badge-glass` - Glass badge
- `.badge-accent` - Pink accent badge
- `.badge-success` - Green success badge

### Avatars
- `.avatar-small` - 28×28px avatar
- `.avatar-medium` - 36×36px avatar
- `.avatar-large` - 48×48px avatar

### Comments
- `.comment-header-base` - Comment header layout
- `.comment-actions-base` - Comment actions layout
- `.comment-like-btn-base` - Comment like button styling

### Layout
- `.flex-center` - Centered flexbox
- `.flex-between` - Space-between flexbox
- `.flex-gap-sm/md/lg` - 8px/12px/16px gaps

### Spacing
- `.p-sm/md/lg/xl` - Padding utilities
- `.mb-sm/md/lg` - Margin-bottom utilities

### Other
- `.rounded-sm/md/lg/full` - Border radius utilities
- `.transition-base/medium` - Transition utilities
- `.overlay-dark` - Dark gradient overlay
- `.overlay-black` - Black blur overlay

---

## Next Steps

1. ✅ Add + modal functionality to back of Card 1
2. ✅ Add like buttons to all comments
3. ✅ Create reusable CSS classes
4. 🔄 Test and finalize Card 1
5. ⏳ Apply template to Cards 2-6
6. ⏳ Create unique Card 7 design
7. ⏳ Add status labels to all cards
8. 🔮 Future: Convert to SVG sprite sheet

---

## Questions Resolved

**Q:** Should all cards flip?
**A:** Cards 1-6 flip (show content). Card 7 does not (follow suggestions).

**Q:** Which cards have which actions?
**A:**
- Heart: Cards 1, 6 (user activities)
- + button: Cards 1-6 (all show cards)
- Comment: Cards 1, 6 (user activities)
- Share: Cards 2-5 (recommendations/releases)

**Q:** Should we use SVG sprites?
**A:** Future optimization. Keep inline for mockup phase, convert for production.

**Q:** Where do likes on comments appear?
**A:** Both activity comments (front glass tab) AND show comments (back side).

---

**Last Updated:** January 2025
**Next Review:** After Card 1 enhancements complete

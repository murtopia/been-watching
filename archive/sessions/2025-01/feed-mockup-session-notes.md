# Feed Mockup Refinement Session Notes
*Session Date: January 2025*

## Overview
This session focused on refining the TikTok-style activity feed mockup for Been Watching, transitioning from heavy design elements to lighter, more refined Instagram/TikTok-inspired aesthetics.

---

## Key Design Decisions

### 1. Typography Refinement
**Goal**: Match Instagram Reels and TikTok's lighter, more refined typography

**Changes Made**:
- **Username**: 15px → 14px, font-weight 600 (was heavier)
- **Timestamp**: 12px → 11px, font-weight 400
- **Show Title**: 22px → 16px, font-weight 600 (down from 700)
- **Show Meta**: 14px → 12px, font-weight 400 (down from 600)
- **Glass Badge**: 12px → 11px, font-weight 600 (down from 700), padding reduced to 6px 12px

**Rationale**: The original design felt too "chunky" and bold. Instagram and TikTok use surprisingly small, refined text that creates a modern, clean aesthetic while maintaining readability against dark backgrounds.

---

### 2. Action Button Refinement
**Goal**: Lighter glassmorphism with outline-only icons, no color fills except for active states

**Changes Made**:
- **Button Size**: 46px → 40px circles
- **Background**: Changed to `rgba(60, 60, 60, 0.4)` with lighter blur (10px instead of 20px)
- **Border**: Added 1.5px solid `rgba(255, 255, 255, 0.2)` for definition
- **Icon Size**: 26px → 24px
- **Icon Style**: Outline-only with `stroke-width: 1.5` (down from 2), `fill: none`
- **Active State**: Heart button gets `fill: #FF3B5C` and `stroke: #FF3B5C` when liked

**Rationale**: Instagram Reels uses very subtle, outline-only icons with no background fills. The lighter glassmorphism with a thin border creates definition without being heavy-handed. Only the liked state uses color to indicate active engagement.

---

### 3. Info Icon Selection
**Options Evaluated**: 8 different icon concepts created in [info-icon-options.html](public/info-icon-options.html)

**Selected**: Option 3 - Three Vertical Dots (ellipsis menu)

**Rationale**:
- More versatile than a simple "info" icon
- Can serve dual purpose: flip card AND open menu for additional actions
- Universal pattern users recognize for "more options"
- Matches Instagram's three-dot menu pattern

**Implementation**:
```svg
<svg viewBox="0 0 24 24">
    <circle cx="12" cy="6" r="1.5" fill="white"/>
    <circle cx="12" cy="12" r="1.5" fill="white"/>
    <circle cx="12" cy="18" r="1.5" fill="white"/>
</svg>
```

---

### 4. Card Sizing Discussion

**Standard Poster Dimensions**: 2:3 aspect ratio
- Mobile example: 430px width × 645px height
- This is the standard movie poster ratio used by TMDB and theatrical releases

**Layout Considerations**:
- **Full-screen approach (TikTok)**: Cards fill entire viewport height (100vh), backgrounds bleed edge-to-edge
- **Poster-sized approach (Hybrid)**: Cards maintain 2:3 ratio, vertically centered with peek effect
- **Comments Positioning**: Bottom of comments bar should align with bottom of poster artwork, not bottom of screen

---

### 5. Layout Comparison: Full Width vs Inset

**Option A - Full Width (TikTok Style)**:
- Edge-to-edge cards filling entire viewport
- Backgrounds bleed to screen edges
- Immersive, content-first experience
- No visual separation between cards

**Option B - Inset Cards (Instagram Reels Style)**:
- 16px margins on left/right
- Black background visible around cards
- Cards have 16px border-radius for rounded corners
- Visual rhythm created by card boundaries
- Better supports "peek" effect for adjacent cards
- Cards feel like distinct content items

**Implementation**: Created side-by-side comparison mockup in [layout-comparison.html](public/layout-comparison.html)

**Recommendation**: Option B (Inset) provides:
- Better visual hierarchy
- More elegant card transitions
- Clear content boundaries
- Works better with scroll-snap-align: center
- Matches modern Instagram Reels aesthetic

---

## Technical Specifications

### Glassmorphism Formula
```css
background: rgba(60, 60, 60, 0.4);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1.5px solid rgba(255, 255, 255, 0.2);
```

### Scroll Snap Configuration
```css
/* Container */
scroll-snap-type: y mandatory;
-webkit-overflow-scrolling: touch;

/* Cards */
scroll-snap-align: center;
```

### Text Hierarchy
```css
/* Primary text (show titles) */
color: #FFFFFF;
font-size: 16px;
font-weight: 600;

/* Secondary text (usernames) */
color: #FFFFFF;
font-size: 14px;
font-weight: 600;

/* Tertiary text (metadata) */
color: rgba(255, 255, 255, 0.8);
font-size: 12px;
font-weight: 400;

/* Timestamp/subtle text */
color: rgba(255, 255, 255, 0.7);
font-size: 11px;
font-weight: 400;
```

### Background Overlay Gradient
```css
background: linear-gradient(to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.9) 100%
);
```

---

## Card Dimensions for Inset Layout

### Mobile (iPhone 15 Pro example)
- **Viewport Width**: 430px
- **Card Width**: 398px (430px - 32px for margins)
- **Card Height**: 645px (2:3 ratio based on width + rounded to ~645)
- **Vertical Margins**: 20px top/bottom
- **Horizontal Margins**: 16px left/right
- **Border Radius**: 16px

### Peek Effect Calculation
```css
/* Spacer height to center card and show peek */
height: calc((100vh - 645px) / 2 - 20px);
```

This ensures:
- Card is vertically centered
- ~10-15% of adjacent cards peek into view
- Smooth scroll-snap alignment

---

## File Updates Made

### 1. [tiktok-activity-cards-complete.html](public/tiktok-activity-cards-complete.html)
**Status**: Updated with refined typography, action buttons, and three-dot menu icon
**Key Changes**:
- All typography sizes and weights updated
- Action button glassmorphism lightened
- Icon stroke-width reduced to 1.5
- Border added to action buttons
- Info icon replaced with three-dot vertical ellipsis
- All 6 card instances updated consistently

### 2. [info-icon-options.html](public/info-icon-options.html)
**Status**: Created as selection tool
**Purpose**: Showcase 8 different info icon options for user selection
**Result**: User selected Option 3 (three vertical dots)

### 3. [layout-comparison.html](public/layout-comparison.html)
**Status**: Newly created
**Purpose**: Side-by-side comparison of full-width vs inset card layouts
**Features**:
- Horizontal scroll between two options
- Navigation dots to switch between layouts
- Each option has 2 sample cards with scroll
- Full-width option on left, inset option on right
- Maintains all refined styling from main mockup

---

## Design Philosophy Evolution

### From → To
- **Bold & Heavy** → **Light & Refined**
- **Large Typography** → **Subtle, Readable Text**
- **Filled Action Buttons** → **Outline-Only Icons**
- **Heavy Glassmorphism** → **Subtle Glass Effects**
- **Static Info Icon** → **Versatile Menu Icon**
- **Full-Screen Cards** → **Poster-Sized Cards with Peek**

### Inspiration Sources
- **Instagram Reels**: Outline icons, subtle UI, text refinement
- **TikTok**: Immersive backgrounds, vertical scrolling, right-side actions
- **Movie Posters**: 2:3 aspect ratio, visual framing

---

## Next Steps & Recommendations

### Immediate Implementation
1. **Choose Layout**: Review [layout-comparison.html](public/layout-comparison.html) and finalize full-width vs inset decision
2. **Card Height**: Confirm 645px height works across target devices (iPhone 14/15 Pro as baseline)
3. **Peek Behavior**: Test scroll-snap with actual device to ensure smooth transitions

### Phase 1 Development
1. Convert mockup to React component structure
2. Implement scroll-snap behavior with gesture handling
3. Add state management for like/add/comment actions
4. Connect to TMDB API for poster images
5. Implement three-dot menu dropdown functionality

### Phase 2 Enhancements
1. Add card flip animation when info/menu is tapped
2. Implement smooth transitions between cards
3. Add haptic feedback on action button taps (mobile)
4. Optimize image loading (lazy load, progressive JPEGs)
5. Add "pull to refresh" gesture at feed top

### Performance Considerations
- Preload 1 card above and below current card
- Use intersection observer for lazy loading
- Hardware accelerate transforms
- Cache TMDB poster images
- Debounce scroll events for analytics

---

## Technical Debt & Known Issues

### Current Mockup Limitations
- Static HTML/CSS only (no interactivity)
- Hardcoded poster URLs (not pulling from TMDB)
- No actual dropdown menu implementation
- No card flip animation
- No data structure for different card types

### To Address in Implementation
1. Create TypeScript interfaces for 7 card types (see [potential_activitycards.md](potential_activitycards.md))
2. Build reusable `ActivityCard` component with type discrimination
3. Implement dropdown menu system (watchlist options, rating options)
4. Add proper touch gesture handling
5. Create loading states and skeleton screens

---

## Card Type Reference

Seven card types to implement (detailed in [potential_activitycards.md](potential_activitycards.md)):

1. **User Activity Card** - Friend rates/adds content
2. **"Because You Liked" Recommendation** - Personalized suggestions
3. **"Your Friends Loved" Social Recommendation** - Popular among friends
4. **New Season Alert** - New season availability
5. **Now Streaming** - Streaming platform availability
6. **Top 3 Update** - Friend updates their Top 3
7. **Follow Suggestions** - Friend discovery (no poster background)

---

## Measurements Quick Reference

### Typography
| Element | Size | Weight | Opacity |
|---------|------|--------|---------|
| Show Title | 16px | 600 | 100% |
| Username | 14px | 600 | 100% |
| Show Meta | 12px | 400 | 80% |
| Timestamp | 11px | 400 | 70% |
| Glass Badge | 11px | 600 | 100% |

### Spacing
| Element | Value |
|---------|-------|
| Card Height (Inset) | 645px |
| Card Width (Mobile) | 398px (430 - 32) |
| Horizontal Margin | 16px |
| Vertical Margin | 20px |
| Border Radius | 16px |
| Action Button Gap | 12px |
| Content Padding Bottom | 80px |
| Content Padding Horizontal | 20px |

### Action Buttons
| Property | Value |
|----------|-------|
| Size | 40px × 40px |
| Icon Size | 24px × 24px |
| Stroke Width | 1.5 |
| Border | 1.5px solid rgba(255,255,255,0.2) |
| Background | rgba(60,60,60,0.4) |
| Backdrop Blur | 10px |

---

## Questions for User Decision

1. **Layout Choice**: Full-width (Option A) or Inset with margins (Option B)?
2. **Card Height**: Is 645px appropriate, or should we adjust for better screen fit?
3. **Peek Amount**: Current ~10-15% of adjacent cards - increase or decrease?
4. **Menu Functionality**: Should three-dot menu flip card, open menu, or both (context-dependent)?
5. **Comments Behavior**: Slide up from bottom, or expand in place?

---

## Resources & References

### Project Files
- Main Mockup: [tiktok-activity-cards-complete.html](public/tiktok-activity-cards-complete.html)
- Layout Comparison: [layout-comparison.html](public/layout-comparison.html)
- Icon Options: [info-icon-options.html](public/info-icon-options.html)
- Card Specifications: [potential_activitycards.md](potential_activitycards.md)
- Implementation Guide: [ENHANCED-FEED-IMPLEMENTATION.md](ENHANCED-FEED-IMPLEMENTATION.md)

### External Resources
- TMDB API: https://developers.themoviedb.org/3
- Standard Poster Ratios: 2:3 (theatrical), 27:40 (TMDB original)
- CSS Scroll Snap Spec: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll_Snap

---

## Session Summary

**What We Accomplished**:
1. ✅ Refined typography across all text elements (lighter, smaller, more refined)
2. ✅ Updated action buttons with subtle glassmorphism and outline-only icons
3. ✅ Selected three-dot vertical ellipsis as info/menu icon
4. ✅ Clarified standard poster dimensions (2:3 ratio, ~645px height on mobile)
5. ✅ Created side-by-side layout comparison mockup
6. ✅ Documented all design decisions and specifications

**Design Direction**:
Moving from bold, heavy TikTok-inspired design toward more refined Instagram Reels aesthetic while maintaining immersive, full-bleed poster backgrounds. The inset card layout (Option B) provides the best balance of immersion and visual clarity.

**Next User Decision**:
Review [layout-comparison.html](public/layout-comparison.html) to finalize full-width vs inset approach before beginning React implementation.

---

*Session Notes Last Updated: January 2025*
*Ready for Implementation Phase*

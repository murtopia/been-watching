# Feed Card Design System

**Created:** 2025-11-23
**Based on:** UserActivityCard (React Card 1) and approved HTML templates
**Status:** Production-ready design tokens and specifications

---

## 📋 Overview

This document captures the complete design system for Been Watching's feed cards, extracted from the elegant and carefully crafted UserActivityCard component. All specifications are pixel-perfect, production-tested, and represent the approved design language for the entire application.

**Card Dimensions:** 398px × 645px
**Design Style:** Glassmorphism with dark mode optimization
**Animation:** 3D flip card with smooth transitions

---

## 🔤 Typography System

### Font Family (System Stack)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```
Use this for all text elements to ensure native platform rendering.

### Font Size Hierarchy

| Size | Weight | Line Height | Usage | Example |
|------|--------|-------------|-------|---------|
| **22px** | 700 | 1.3 | Back card title | "Nobody Wants This" |
| **18px** | - | - | Back icon button labels | Icon badges |
| **16px** | 600 | 1.3 | Show title (front) | Primary media title |
| **14px** | 600/400 | 1.5 | Username, meta, values | "@username", "Drama" |
| **13px** | 700/400 | 1.4 | Badges, comments, input | "Loved", Comment text |
| **12px** | 400/600 | - | Show meta, cast, buttons | "2024 • Drama", Cast names |
| **11px** | 400/500/600 | 1 | Timestamps, labels | "2 days ago", "CAST" |
| **10px** | 400/500/600 | 1 | Counter, small labels | "0/280", Badge counts |

### Font Weight Scale

- **700** - Bold/Heavy (activity badges, back card title)
- **600** - Semibold (usernames, show titles, buttons)
- **500** - Medium (subtle labels, rating indicators)
- **400** - Regular (body text, meta info, timestamps)

### Letter Spacing

```css
/* Uppercase section titles */
letter-spacing: 1px;
text-transform: uppercase;

/* Tight title spacing */
letter-spacing: -0.5px;  /* For 22px back card title */
```

### Typography Patterns

**Section Title:**
```css
font-size: 11px;
text-transform: uppercase;
letter-spacing: 1px;
opacity: 0.6;
margin-bottom: 10px;
```

**Username:**
```css
font-size: 14px;
font-weight: 600;
color: white;
margin-bottom: 1px;
```

**Timestamp:**
```css
font-size: 11px;
opacity: 0.6;
```

**Body Text:**
```css
font-size: 13px;
line-height: 1.4;
opacity: 0.9;
```

---

## 🎨 Color Palette

### Primary Brand Gradient

```css
background: linear-gradient(135deg, #FF006E, #FF8E53);
```

**Individual Colors:**
- **Pink:** `#FF006E` (brand-primary)
- **Orange:** `#FF8E53` (brand-secondary)

**Usage:** Submit buttons, rating badges, watchlist badges, accent elements

### Accent Colors

```css
--heart-red: #FF3B5C;        /* Like/heart active state */
--instagram-blue: #0095f6;   /* Instagram brand */
```

### Background System (Dark Mode)

**Card Backgrounds:**
```css
/* Back card gradient */
background: linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%);

/* Overlay darkness levels */
rgba(0, 0, 0, 0.5)     /* Modal overlay (50%) */
rgba(0, 0, 0, 0.4)     /* Glass dark */
rgba(20, 20, 20, 0.95) /* Comments tab (near-opaque) */
rgba(20, 20, 20, 0.85) /* Action modal */
```

**Front Card Overlay (Image gradient):**
```css
background: linear-gradient(to bottom,
  rgba(0, 0, 0, 0) 0%,      /* Transparent top */
  rgba(0, 0, 0, 0.3) 50%,   /* Subtle middle */
  rgba(0, 0, 0, 0.9) 100%   /* Solid bottom */
);
```

### White Opacity Scale (Glass & Text)

This is the foundation of the glassmorphism design language:

```css
/* Backgrounds & Glass */
rgba(255, 255, 255, 0.03)  /* Subtle tint - comment backgrounds */
rgba(255, 255, 255, 0.05)  /* Light - input backgrounds, hover */
rgba(255, 255, 255, 0.08)  /* Medium-light - hover states */
rgba(255, 255, 255, 0.1)   /* Glass light - borders, backgrounds */
rgba(255, 255, 255, 0.15)  /* Glass medium - borders */
rgba(255, 255, 255, 0.18)  /* Active state - navigation */
rgba(255, 255, 255, 0.2)   /* Glass heavy - borders, buttons */
rgba(255, 255, 255, 0.3)   /* Focus borders, hover states */
rgba(255, 255, 255, 0.4)   /* Strong borders */

/* Text Opacity */
rgba(255, 255, 255, 0.5)   /* Placeholder text */
rgba(255, 255, 255, 0.6)   /* Muted text, counters, timestamps */
rgba(255, 255, 255, 0.7)   /* Meta information */
rgba(255, 255, 255, 0.8)   /* Labels */
rgba(255, 255, 255, 0.85)  /* Secondary text */
rgba(255, 255, 255, 0.9)   /* Primary body text */
rgba(255, 255, 255, 1.0)   /* Headings, important text */
```

### Active/Selected States

```css
/* Active rating icon */
background: rgba(255, 59, 92, 0.15);
border: 2px solid #FF3B5C;

/* Liked comment/action */
color: #FF3B5C;
```

---

## 📏 Spacing System

### Padding Scale

Consistent padding values used throughout:

```css
20px  /* Card content, modal interiors, section padding */
16px  /* Action modal, grid gaps, friends section */
12px  /* Badge spacing, side actions, comment gaps */
11px  /* Comments preview padding, divider top */
10px  /* User header, friend avatars, back icon spacing */
8px   /* Activity badge internals, meta, cast list */
6px   /* Button padding, small gaps, icon + text */
5px   /* Negative margin adjustments */
4px   /* Micro gaps, icon spacing, minimal padding */
2px   /* Avatar fine-tuning, info item gaps */
```

### Margin Patterns

**Vertical Spacing:**
```css
margin-bottom: 20px;  /* Major sections */
margin-bottom: 16px;  /* Comment items, badges */
margin-bottom: 14px;  /* Back card badges */
margin-bottom: 12px;  /* Activity badges, meta */
margin-bottom: 10px;  /* User header, section titles */
margin-bottom: 8px;   /* Synopsis, input wrapper */
margin-bottom: 6px;   /* Titles, meta, actions */
margin-bottom: 1px;   /* Tight username spacing */
```

**Top Spacing:**
```css
margin-top: 10px;     /* Friend avatars */
margin-top: 8px;      /* Load more button */
margin-top: 6px;      /* Comment actions */
margin-top: 2px;      /* Action count fine-tuning */
margin-top: -5px;     /* Pull up (input container) */
```

**Edge-to-Edge Divider:**
```css
/* Extends beyond parent's 20px padding */
margin: 11px -20px 12px -20px;
```

### Gap Scale (Flexbox/Grid)

```css
gap: 20px;  /* Reserved for large section spacing */
gap: 16px;  /* Action modal grid, info grid, friends ratings */
gap: 12px;  /* Side actions, categories, comments list */
gap: 10px;  /* User header, input container, back icons */
gap: 8px;   /* Activity badges, avatars, meta, comment header */
gap: 6px;   /* Icon + text combos, badge internals, cast */
gap: 4px;   /* Micro spacing, comment like, send button */
gap: 2px;   /* Info item label/value */
```

---

## 🔲 Border Radius Scale

| Value | Usage | Example |
|-------|-------|---------|
| **50%** | Circular elements | Avatars, action buttons, icon buttons, rating icons |
| **20px** | Large rounded | Tab bar buttons (bottom navigation) |
| **16px** | Card borders | Card outer, comments tab top, cast pill, action modal |
| **12px** | Medium rounded | Activity badges, comment like, quick rate, media cards |
| **10px** | Small rounded | Back badges, categories, input container, friends ratings |
| **9px** | Tiny circular | Rating count badge (18px diameter ÷ 2) |
| **8px** | Standard rounded | Textareas, inputs, comment items, similar shows, load more |
| **6px** | Subtle rounded | Submit button (gradient button) |

---

## 🧩 Component Specifications

### Buttons

#### Action Buttons (Side Actions - Like/Comment/Add)
```css
width: 40px;
height: 40px;
border-radius: 50%;
background: rgba(60, 60, 60, 0.4);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1.5px solid rgba(255, 255, 255, 0.2);
transition: all 0.2s;
```
**Icon:** 24px, white
**Active state:** `transform: scale(0.9);`

#### Menu Button (Three Dots)
```css
position: absolute;
top: 20px;
right: 12px;
width: 40px;
height: 40px;
border-radius: 50%;
background: rgba(60, 60, 60, 0.4);
backdrop-filter: blur(10px);
border: 1.5px solid rgba(255, 255, 255, 0.2);
```
**Icon:** 20px menu-dots

#### Back Icon Buttons
```css
width: 42px;
height: 42px;
border-radius: 50%;
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
font-size: 18px;
transition: all 0.2s ease;
```
**Icon:** 22px, white
**Active:** `transform: scale(0.9);`

#### Submit Button (Post Comment - Gradient)
```css
padding: 6px 16px;
background: linear-gradient(135deg, #FF006E, #FF8E53);
border: none;
border-radius: 6px;
color: white;
font-size: 12px;
font-weight: 600;
cursor: pointer;
transition: transform 0.2s;
```
**Active:** `transform: scale(0.95);`

#### Send Button (Activity Comments - Circular)
```css
width: 32px;
height: 32px;
border-radius: 50%;
background: rgba(255, 255, 255, 0.2);
border: none;
cursor: pointer;
transition: background 0.2s;
```
**Icon:** 16px send, white
**Hover:** `background: rgba(255, 255, 255, 0.3);`

#### Load More Button
```css
width: 100%;
padding: 10px;
margin-top: 8px;
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 8px;
color: white;
font-size: 13px;
font-weight: 600;
cursor: pointer;
transition: background 0.2s;
```
**Hover:** `background: rgba(255, 255, 255, 0.08);`

#### Comment Like Button
```css
display: flex;
align-items: center;
gap: 4px;
background: none;
border: none;
color: rgba(255, 255, 255, 0.6);
font-size: 11px;
font-weight: 600;
padding: 4px 8px;
border-radius: 12px;
transition: all 0.2s;
```
**Hover:** `background: rgba(255, 255, 255, 0.05);`
**Liked:** `color: #FF3B5C;`
**Icon:** 14px heart

#### Close Buttons
```css
/* Standard close */
width: 24px;
height: 24px;
border-radius: 50%;
background: rgba(255, 255, 255, 0.1);
transition: background 0.2s;

/* Hover */
background: rgba(255, 255, 255, 0.2);
```
**Icon:** 16px close, white, stroke-width: 2

### Input Fields

#### Textarea (Back Card - Show Comments)
```css
width: 100%;
padding: 0.75rem;  /* 12px */
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 8px;
background: rgba(255, 255, 255, 0.05);
color: white;
font-size: 13px;
font-family: [system font stack];
outline: none;
resize: none;
min-height: 80px;
```
**Placeholder:** `color: rgba(255, 255, 255, 0.5);`
**Focus:** `border-color: rgba(255, 255, 255, 0.3);`

#### Textarea (Front Card - Activity Comments)
```css
width: 100%;
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 8px;
padding: 8px 12px;
color: white;
font-size: 13px;
outline: none;
resize: none;
min-height: 40px;  /* Compact 2-row */
```

#### Character Counter
```css
font-size: 10px;
color: rgba(255, 255, 255, 0.6);
font-weight: 400;
line-height: 1;
```
**Format:** `{current}/280`
**Position:** Top-right above textarea or bottom-left below

### Avatars

| Size | Dimensions | Border | Usage |
|------|------------|--------|-------|
| **Small** | 24px × 24px | 1.5px solid #000 | Friend avatars stack (front) |
| **Medium** | 28px × 28px | 1px solid rgba(255,255,255,0.2) | Comment avatars, input avatars |
| **Standard** | 32px × 32px | 1.5px solid white (front)<br>2px solid #1a1a1a (back) | User header, back friends |

**Base styles:**
```css
border-radius: 50%;
object-fit: cover;
flex-shrink: 0;
```

**Stacked Avatars (Friends):**
```css
margin-left: -6px;  /* Overlap effect */
```
**First avatar:** `margin-left: 0;`

### Badges

#### Activity Badges (Front Card)
```css
padding: 8px 14px;
border-radius: 12px;
font-size: 13px;
font-weight: 700;
display: inline-flex;
align-items: center;
gap: 6px;
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```
**With icon:** 16px icon, matches text color

**Badge variants:**
- Loved: `background: rgba(255, 59, 92, 0.2); color: #FF3B5C;`
- Liked: `background: rgba(255, 152, 0, 0.2); color: #FF9800;`
- Meh: `background: rgba(158, 158, 158, 0.2); color: #9E9E9E;`

#### Back Card Badges
```css
padding: 8px 14px;
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 10px;
font-size: 12px;
font-weight: 600;
text-align: center;
min-width: 36px;
```

#### Watchlist Badge (Small)
```css
position: absolute;
top: -2px;
right: -2px;
width: 16px;
height: 16px;
border-radius: 50%;
background: linear-gradient(135deg, #FF006E, #FF8E53);
border: 2px solid rgba(20, 20, 20, 0.98);
```
**Icon:** 10px plus-small, white

#### Rating Count Badge
```css
position: absolute;
top: -4px;
right: -4px;
background: linear-gradient(135deg, #FF006E, #FF8E53);
color: white;
font-size: 10px;
font-weight: 600;
min-width: 18px;
height: 18px;
border-radius: 9px;
display: flex;
align-items: center;
justify-content: center;
padding: 0 4px;
border: 2px solid #1a1a1a;
```

### Modals & Overlays

#### Action Overlay (Background)
```css
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border-radius: 16px;
opacity: 0;
pointer-events: none;
transition: opacity 0.2s ease;
```
**Visible:** `opacity: 1; pointer-events: auto;`

#### Action Modal (Rating/Watchlist Menu)
```css
position: absolute;
bottom: 90px;
right: 60px;
background: rgba(20, 20, 20, 0.85);
backdrop-filter: blur(30px);
-webkit-backdrop-filter: blur(30px);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 16px;
padding: 16px;
width: 240px;
transform: scale(0.9);
opacity: 0;
transition: all 0.2s ease;
```
**Visible:** `transform: scale(1); opacity: 1;`

**Grid layout:**
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 12px;
```

#### Action Modal Item
```css
display: flex;
flex-direction: column;
align-items: center;
gap: 6px;
cursor: pointer;
transition: transform 0.2s;
```
**Active:** `transform: scale(0.95);`

**Icon container:**
```css
width: 48px;
height: 48px;
border-radius: 50%;
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
transition: all 0.2s;
```
**Hover:** `background: rgba(255, 255, 255, 0.15);`
**Active:** `background: rgba(255, 59, 92, 0.15); border-color: #FF3B5C;`

**Label:**
```css
font-size: 10px;
font-weight: 500;
opacity: 0.8;
text-align: center;
line-height: 1.2;
```

#### Comments Tab (Front Card)
```css
position: absolute;
bottom: 0;
left: 10px;
right: 10px;
background: rgba(20, 20, 20, 0.95);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-top-left-radius: 16px;
border-top-right-radius: 16px;
border-top: 1px solid rgba(255, 255, 255, 0.1);
max-height: 70%;
transform: translateY(100%);
opacity: 0;
pointer-events: none;
transition: transform 0.3s ease, opacity 0.3s ease;
```

**Visible (collapsed):**
```css
transform: translateY(13px);
opacity: 1;
pointer-events: auto;
overflow: hidden;
```

**Expanded:**
```css
overflow-y: scroll;
-webkit-overflow-scrolling: touch;
```

**Header:**
```css
padding: 11px 20px;
cursor: pointer;
font-size: 13px;
font-weight: 500;
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
border-bottom: 3px solid rgba(255, 255, 255, 0.1);
```

### Comments

#### Comment Item (Activity Comments - Front)
```css
margin-bottom: 16px;
padding-bottom: 16px;
border-bottom: 1px solid rgba(255, 255, 255, 0.1);
```
**Last child:** `border-bottom: none;`

**Header:**
```css
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 6px;
```

**Username:**
```css
font-size: 13px;
font-weight: 600;
color: white;
```

**Timestamp:**
```css
font-size: 11px;
color: rgba(255, 255, 255, 0.6);
```

**Text:**
```css
font-size: 13px;
line-height: 1.4;
color: rgba(255, 255, 255, 0.9);
margin-left: 38px;  /* Indent to align with username */
```

#### Comment Item (Show Comments - Back)
```css
display: flex;
gap: 10px;
padding: 10px;
background: rgba(255, 255, 255, 0.03);
border-radius: 8px;
```

**Avatar:** 32px × 32px

**Content wrapper:**
```css
flex: 1;
```

**Actions (right side):**
```css
justify-content: flex-end;  /* Aligns heart icon to right */
```

### Icons

Standard icon sizes and usage:

| Size | Stroke | Usage |
|------|--------|-------|
| **10px** | - | Plus-small (watchlist badge) |
| **14px** | 1.5 | Heart (comment like), star-gold |
| **16px** | - | Badge icons, send button, comment icon (small) |
| **20px** | 1.5/2 | Menu-dots, rating icons (meh/like/love), watchlist, check |
| **22px** | - | Back icon buttons (plus, comment) |
| **24px** | - | Side action buttons (heart-nav, plus, comment) |
| **42px** | - | Large back buttons |

**Color:** White or `currentColor`
**Fill:** Generally `none` (outline style)

---

## 📐 Layout Patterns

### Card Structure

```css
.card-container {
  width: 398px;
  height: 645px;
  perspective: 1000px;
  border-radius: 16px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  touch-action: none;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Content Padding

**Front card:**
```css
padding: 20px;
padding-bottom: 40px;  /* Extra space at bottom */
```

**Back card:**
```css
padding: 20px 16px;    /* Narrower horizontal */
padding-top: 50px;     /* Space for back button */
padding-bottom: 20px;
```

### Scrolling Areas

```css
overflow-y: scroll;
overflow-x: hidden;
-webkit-overflow-scrolling: touch;  /* Smooth iOS scrolling */
overscroll-behavior: contain;       /* Prevent parent scroll */
```

### Grid Layouts

**Info Grid (2-column):**
```css
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 16px;
```

**Action Modal Grid (3-column):**
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 12px;
```

### Flexbox Patterns

**User Header:**
```css
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 10px;
```

**Friends Ratings:**
```css
display: flex;
align-items: flex-start;
justify-content: space-between;
padding: 16px;
background: rgba(255, 255, 255, 0.03);
border-radius: 10px;
```

**Cast List (Pill Layout):**
```css
display: flex;
flex-wrap: wrap;
gap: 6px;
```

**Cast Member Pill:**
```css
padding: 5px 10px;
background: rgba(255, 255, 255, 0.05);
border-radius: 16px;
font-size: 12px;
```

**Similar Shows (Horizontal Scroll):**
```css
display: flex;
gap: 12px;
overflow-x: auto;
padding-bottom: 10px;
```

**Similar Show Card:**
```css
flex-shrink: 0;
width: 100px;
height: 150px;
border-radius: 8px;
position: relative;
overflow: hidden;
```

### Special Layout Techniques

**Edge-to-Edge Divider:**
```css
margin: 11px -20px 12px -20px;
background: rgba(255, 255, 255, 0.1);
height: 1px;
```
Extends beyond parent's 20px padding using negative margins.

**Text Truncation (Synopsis):**
```css
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
```
**Expanded:** `display: block; -webkit-line-clamp: unset;`

---

## 🎭 Interaction Patterns

### Hover States

**Buttons:**
```css
transform: scale(1.05);  /* Slight grow */
```

**Backgrounds (lighten):**
```css
background: rgba(255, 255, 255, 0.15);  /* +0.05 from 0.1 */
background: rgba(255, 255, 255, 0.3);   /* +0.1 from 0.2 */
```

**Activity Cards:**
```css
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

### Active/Pressed States

```css
/* Most buttons */
transform: scale(0.9);

/* Submit/gradient buttons */
transform: scale(0.95);

/* Modal items */
transform: scale(0.95);
```

### Focus States

```css
/* Input fields */
outline: none;
border-color: rgba(255, 255, 255, 0.3);  /* From 0.15 base */
```

### Transition Timing

```css
/* Standard interactions */
transition: all 0.2s;
transition: all 0.2s ease;

/* Medium duration */
transition: all 0.3s ease;

/* Card flip (special) */
transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

/* Comments tab (dual property) */
transition: transform 0.3s ease, opacity 0.3s ease;

/* Opacity fade */
transition: opacity 0.2s ease;

/* Transform only */
transition: transform 0.2s;
```

### Transform Effects

**Scale:**
- `scale(0.9)` - Pressed state (most buttons)
- `scale(0.95)` - Gentle press (submit, modal items)
- `scale(1.05)` - Hover grow

**Translate:**
- `translateY(-2px)` - Hover lift
- `translateY(13px)` - Comments tab positioning
- `translateY(100%)` - Hide below (comments tab initial)

**Rotate:**
- `rotateY(180deg)` - Card flip

---

## ✨ Glassmorphism System

The signature visual style of the feed cards. Always include both `-webkit-backdrop-filter` and `backdrop-filter` for cross-browser support.

### Light Glass
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```
**Usage:** Badges, back icon buttons, standard glass elements

### Medium Glass
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(15px);
-webkit-backdrop-filter: blur(15px);
```
**Usage:** Hover states, emphasized elements

### Heavy Glass
```css
background: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```
**Usage:** Modal icon containers, strong glass elements

### Dark Glass
```css
background: rgba(60, 60, 60, 0.4);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
```
**Usage:** Action buttons, menu button

### Modal Glass (Extra Heavy)
```css
background: rgba(20, 20, 20, 0.85);
backdrop-filter: blur(30px);
-webkit-backdrop-filter: blur(30px);
```
**Usage:** Action modal, near-opaque glass overlays

### Comments Tab Glass
```css
background: rgba(20, 20, 20, 0.95);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```
**Usage:** Comments tab (near-solid for readability)

---

## 🌈 Gradient System

### Primary Brand Gradient
```css
background: linear-gradient(135deg, #FF006E, #FF8E53);
```
**Angle:** 135deg (diagonal top-left to bottom-right)
**Usage:** Submit buttons, rating badges, watchlist badges, accent elements

### Card Back Background
```css
background: linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%);
```
**Usage:** Back of card, dark gradient base

### Front Card Overlay
```css
background: linear-gradient(to bottom,
  rgba(0, 0, 0, 0) 0%,      /* Transparent top */
  rgba(0, 0, 0, 0.3) 50%,   /* Subtle middle */
  rgba(0, 0, 0, 0.9) 100%   /* Solid bottom */
);
```
**Usage:** Over background image to ensure text readability

### Similar Show Overlay
```css
background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
```
**Usage:** Bottom-to-top overlay for show cards

---

## 📱 Responsive & Accessibility

### Touch Targets

**Minimum recommended:** 40px × 40px
**Comfortable:** 42px × 42px
**Acceptable for secondary actions:** 24px × 24px

Examples:
- Action buttons (like/comment/add): 40px × 40px ✓
- Back icon buttons: 42px × 42px ✓
- Close button: 24px × 24px (acceptable - secondary action)

### Color Contrast

All text meets WCAG accessibility standards:

- **White on dark background:** AAA (primary text)
- **White 60% opacity:** AA for large text (muted text)
- **White 50% opacity:** AA for large text (placeholders)
- **Gradient buttons:** AA (white text on pink/orange)

### Focus Indicators

```css
/* Custom focus state */
outline: none;  /* Remove default browser outline */
border-color: rgba(255, 255, 255, 0.3);  /* Visible custom indicator */
```

### Touch Optimization

```css
/* Card flip - prevent accidental scroll */
touch-action: none;

/* Scrollable areas - allow vertical scroll */
touch-action: pan-y;

/* Smooth iOS scrolling */
-webkit-overflow-scrolling: touch;

/* Prevent overscroll affecting parent */
overscroll-behavior: contain;
```

---

## 🎯 Design Tokens Summary

### Quick Reference Tables

**Spacing Scale:**
```
2px, 4px, 5px, 6px, 8px, 10px, 11px, 12px, 14px, 16px, 20px
```

**Border Radius Scale:**
```
6px, 8px, 9px, 10px, 12px, 16px, 20px, 50%
```

**Font Size Scale:**
```
10px, 11px, 12px, 13px, 14px, 16px, 18px, 22px
```

**Font Weight Scale:**
```
400 (regular), 500 (medium), 600 (semibold), 700 (bold)
```

**White Opacity Scale:**
```
0.03, 0.05, 0.08, 0.1, 0.15, 0.18, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 0.9
```

**Text Opacity Scale:**
```
0.5 (placeholder), 0.6 (muted), 0.7 (meta), 0.8 (labels), 0.85 (secondary), 0.9 (body), 1.0 (headings)
```

**Icon Sizes:**
```
10px, 14px, 16px, 20px, 22px, 24px, 42px
```

**Avatar Sizes:**
```
24px (small), 28px (medium), 32px (standard)
```

**Button Sizes:**
```
24px (close), 32px (send), 40px (action), 42px (back icon), 48px (modal icon)
```

---

## 🔑 Consistency Patterns

### Reused Patterns Across Components

1. **10px gap** - Avatar + text combos everywhere (user header, friend avatars, comment header, input container)

2. **13px font** - Standard body text size for comments, badges, inputs (visual consistency)

3. **rgba(255,255,255,0.1) background + rgba(255,255,255,0.2) border** - Default glass element pattern

4. **8px border-radius** - Standard for inputs, textareas, comment items, pills

5. **6px gap** - Icon + text within badges and buttons

6. **11px font** - All timestamps, small labels, uppercase section titles

7. **28px avatars** - All comment-related avatars (consistent across front/back)

8. **40px circular buttons** - All side action buttons (like, add, comment, menu)

9. **Linear gradient 135deg** - Brand gradient always at same angle

10. **0.6 opacity** - Muted text standard (timestamps, labels, character counter)

### Design Principles

1. **Glassmorphism First:** Use glass effects for depth, not solid backgrounds
2. **Consistent Spacing:** Use the spacing scale, don't introduce random values
3. **Circular for Actions:** All interactive buttons are circular (50% border-radius)
4. **Subtle Hierarchy:** Use opacity, not drastic color changes for hierarchy
5. **Smooth Transitions:** All interactions have 0.2s transitions
6. **Touch-Friendly:** Minimum 40px touch targets
7. **Edge-to-Edge When Needed:** Use negative margins for full-width dividers
8. **System Font:** Always use the system font stack for native feel

---

## 🎨 Unique Design Elements

### Two-Stage Modal Interaction (Comments Tab)

**Stage 1 - Collapsed (`.visible`):**
- Shows header + input form
- Hides comments list
- Positioned 13px down to hide divider
- No scrolling

**Stage 2 - Expanded (`.expanded`):**
- Shows full comments list
- Enables scrolling
- Same glass backdrop

```css
/* Stage 1 */
.comments-tab.visible {
  transform: translateY(13px);
  opacity: 1;
  pointer-events: auto;
  overflow: hidden;
}

.comments-tab.visible:not(.expanded) .activity-comment-item {
  display: none;
}

/* Stage 2 */
.comments-tab.expanded {
  overflow-y: scroll;
}
```

### Stacked Avatars with Overlap

```css
.friend-avatar {
  margin-left: -6px;  /* Creates overlap */
  border: 1.5px solid #000;  /* Front card */
  z-index: [decreasing];  /* Stack order */
}

.friend-avatar:first-child {
  margin-left: 0;  /* No overlap on first */
}
```

### Section Title Pattern

Uppercase labels with letter-spacing for visual hierarchy:

```css
font-size: 11px;
text-transform: uppercase;
letter-spacing: 1px;
opacity: 0.6;
margin-bottom: 10px;
```

### Read More Link

```css
color: #FF006E;
font-size: 13px;
font-weight: 500;
cursor: pointer;
margin-bottom: 16px;
display: block;
text-align: right;
```

### Meta Dot Separator

```css
.show-meta-item:not(:last-child)::after {
  content: "•";
  margin: 0 4px;
  opacity: 0.5;
}
```

---

## 📦 Component Composition Guide

### Building a Glass Button

```css
/* Base */
width: 40px;
height: 40px;
border-radius: 50%;
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);

/* Icon inside */
font-size: 24px;
color: white;

/* Interaction */
transition: all 0.2s;
cursor: pointer;

/* Hover */
background: rgba(255, 255, 255, 0.15);

/* Active */
transform: scale(0.9);
```

### Building a Badge

```css
/* Container */
padding: 8px 14px;
border-radius: 12px;
font-size: 13px;
font-weight: 700;
display: inline-flex;
align-items: center;
gap: 6px;
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);

/* Color (example: loved) */
background: rgba(255, 59, 92, 0.2);
color: #FF3B5C;

/* Icon (if present) */
font-size: 16px;
```

### Building a Comment Item

```css
/* Container */
margin-bottom: 16px;
padding-bottom: 16px;
border-bottom: 1px solid rgba(255, 255, 255, 0.1);

/* Header */
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 6px;

/* Avatar */
width: 28px;
height: 28px;
border-radius: 50%;
border: 1px solid rgba(255, 255, 255, 0.2);

/* Username */
font-size: 13px;
font-weight: 600;
color: white;

/* Timestamp */
font-size: 11px;
color: rgba(255, 255, 255, 0.6);

/* Text */
font-size: 13px;
line-height: 1.4;
color: rgba(255, 255, 255, 0.9);
margin-left: 38px;  /* Indent to align with username */
```

---

## 📚 Implementation Checklist

When creating new components based on this design system:

### Typography
- [ ] Use system font stack
- [ ] Choose font size from scale (10, 11, 12, 13, 14, 16, 18, 22)
- [ ] Use appropriate font weight (400, 500, 600, 700)
- [ ] Set proper line-height (1 for labels, 1.3-1.5 for body)
- [ ] Use opacity for hierarchy (0.6 muted, 0.9 body, 1.0 headings)

### Colors
- [ ] Use white opacity scale for backgrounds/glass
- [ ] Use brand gradient (135deg, #FF006E → #FF8E53) for accents
- [ ] Text colors use white with opacity for hierarchy
- [ ] Dark backgrounds use rgba(20, 20, 20, X) pattern

### Spacing
- [ ] Use spacing scale (2, 4, 6, 8, 10, 12, 16, 20)
- [ ] Gap between avatar + text: 10px
- [ ] Gap between icon + text: 6px
- [ ] Card content padding: 20px
- [ ] Section spacing: 20px margin-bottom

### Border Radius
- [ ] Circular elements: 50%
- [ ] Standard elements: 8px
- [ ] Larger elements: 12px or 16px
- [ ] Buttons: 6px (gradient) or 50% (icon)

### Glassmorphism
- [ ] Include both `backdrop-filter` and `-webkit-backdrop-filter`
- [ ] Use blur(10px) for light, blur(20px) for medium, blur(30px) for heavy
- [ ] Pair with rgba background (0.1, 0.15, 0.2, or darker for modals)
- [ ] Add subtle border: rgba(255, 255, 255, 0.2)

### Interactions
- [ ] Transitions: 0.2s for standard, 0.3s for medium, 0.6s for special
- [ ] Hover: scale(1.05) or lighten background by +0.05 opacity
- [ ] Active: scale(0.9) or scale(0.95) for gentler effect
- [ ] Focus: border-color to rgba(255, 255, 255, 0.3)

### Accessibility
- [ ] Touch targets minimum 40px × 40px
- [ ] Text contrast meets WCAG AA minimum
- [ ] Focus states visible
- [ ] Touch optimization: `-webkit-overflow-scrolling: touch`

---

## 🔗 Related Documentation

- **Component Implementation:** `/components/feed/UserActivityCard.tsx`
- **HTML Templates:** `/public/card-1-standalone.html`
- **Global Styles:** `/app/globals.css`
- **Session Notes:** `/claude.md`

---

## 📝 Maintenance Notes

**Last Updated:** 2025-11-23
**Extracted From:** UserActivityCard v1.0 (production)
**Status:** ✅ Production-ready

This design system is extracted from production code and represents battle-tested, pixel-perfect specifications. All values have been validated in the UserActivityCard component.

**When updating this document:**
1. Reference actual implementation in UserActivityCard.tsx
2. Test values in production environment
3. Update "Last Updated" date
4. Document any new patterns discovered
5. Maintain consistency with existing token scales

---

## 💡 Design Philosophy

The UserActivityCard design embodies several key principles:

1. **Elegance Through Simplicity** - Clean layouts, minimal decoration, purposeful spacing
2. **Depth Without Heaviness** - Glassmorphism creates layers without visual weight
3. **Consistency Creates Calm** - Repeated patterns and scales feel intentional and refined
4. **Smooth, Never Jarring** - All transitions are eased, all interactions feel natural
5. **Touch-First, Always** - Everything is sized and spaced for finger interaction
6. **Dark Mode Native** - Designed for dark environments, not adapted from light
7. **Content Hero** - The design supports content, never competes with it

Use these principles when extending the design system to new components.

---

**End of Design System Documentation**

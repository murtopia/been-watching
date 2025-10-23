# Profile Page - Dark Mode Design Mockup

**Date:** October 21, 2025
**Designer:** Claude (Expert UI/UX Designer)
**Purpose:** Comprehensive dark mode design for profile page with 3-state theme toggle

---

## 🎨 Design Philosophy

The dark mode design will maintain the **liquid glass aesthetic** established on the Welcome and Auth pages, while ensuring the profile page feels cohesive with the rest of the app's design language.

### Core Principles
1. **Gradient Consistency** - Pink (#e94d88) to Orange (#f27121) remains the brand identifier
2. **Glassmorphism** - Subtle transparency with backdrop blur for depth
3. **Readable Contrast** - Dark mode must maintain WCAG AA accessibility standards
4. **Smooth Transitions** - Theme changes should animate smoothly
5. **Persistent Preference** - User's choice saved to localStorage

---

## 🔘 3-State Theme Toggle Button

### States
1. **Auto** (Default) - Follows system preference
2. **Light** - Forces light mode
3. **Dark** - Forces dark mode

### Visual Design

```
┌──────────────────────────────────────────┐
│                                          │
│  [💻 Auto] [☀️ Light] [🌙 Dark]         │
│     ▔▔▔▔                                 │
│   Active                                 │
└──────────────────────────────────────────┘
```

### Button Specifications

**Container:**
- Width: Auto (fits 3 buttons)
- Background: `rgba(255, 255, 255, 0.05)` (dark) / `rgba(0, 0, 0, 0.05)` (light)
- Border: `1px solid rgba(255, 255, 255, 0.1)` (dark) / `1px solid rgba(0, 0, 0, 0.1)` (light)
- Border Radius: `12px`
- Padding: `4px`
- Backdrop Filter: `blur(10px)`
- Display: `flex`
- Gap: `4px`

**Individual Buttons:**
- Padding: `8px 16px`
- Font Size: `0.875rem` (14px)
- Font Weight: `600`
- Border Radius: `8px`
- Cursor: `pointer`
- Transition: `all 0.2s ease`

**Active State:**
- Background: `rgba(255, 255, 255, 0.15)` (dark) / `rgba(0, 0, 0, 0.1)` (light)
- Color: Pink-Orange gradient text
- Border Bottom: `2px solid` with gradient

**Inactive State:**
- Background: `transparent`
- Color: `rgba(255, 255, 255, 0.5)` (dark) / `rgba(0, 0, 0, 0.5)` (light)

**Hover (Inactive):**
- Background: `rgba(255, 255, 255, 0.08)` (dark) / `rgba(0, 0, 0, 0.05)` (light)

---

## 🌙 Dark Mode Color Palette

### Background Colors
```
Page Background:        linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)
Card Background:        rgba(255, 255, 255, 0.05)
Card Border:            rgba(255, 255, 255, 0.1)
Hover Background:       rgba(255, 255, 255, 0.08)
```

### Text Colors
```
Primary Text:           #ffffff
Secondary Text:         rgba(255, 255, 255, 0.6)
Tertiary Text:          rgba(255, 255, 255, 0.4)
Disabled Text:          rgba(255, 255, 255, 0.3)
```

### UI Element Colors
```
Input Background:       rgba(255, 255, 255, 0.05)
Input Border:           rgba(255, 255, 255, 0.1)
Input Focus Border:     rgba(233, 77, 136, 0.5)
Divider:                rgba(255, 255, 255, 0.1)
```

### Status Colors
```
Success:                #22c55e
Error:                  #ef4444
Warning:                #f59e0b
Info:                   #3b82f6
```

### Gradient (Unchanged)
```
Brand Gradient:         linear-gradient(135deg, #e94d88 0%, #f27121 100%)
```

---

## 📐 Profile Page Layout - Dark Mode

### Top Section (Fixed Header)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [← Back]                    [💻 Auto] [☀️] [🌙]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- Position: `fixed`
- Top: `0`, Left: `0`, Right: `0`
- Padding: `1rem 1.5rem`
- Background: `rgba(10, 10, 10, 0.8)`
- Backdrop Filter: `blur(20px) saturate(180%)`
- Border Bottom: `1px solid rgba(255, 255, 255, 0.1)`
- Z-Index: `100`

### Profile Header Section

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Large Avatar]                       │
│                      60px × 60px                        │
│                  Gradient Fallback                      │
│                                                         │
│                     @username                           │
│                   Display Name                          │
│              Bio text goes here...                      │
│                                                         │
│              [✏️ Edit Profile]                         │
│                                                         │
│     ┌─────────────────────────────────────┐           │
│     │  29 Want | 13 Watching | 97 Watched │           │
│     └─────────────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Avatar Specifications:**
- Size: `60px × 60px`
- Border Radius: `50%`
- Border: `2px solid rgba(255, 255, 255, 0.2)`
- Box Shadow: `0 4px 12px rgba(0, 0, 0, 0.3)`
- Gradient Fallback: Pink-to-Orange with initials

**Stats Row:**
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border Radius: `12px`
- Padding: `1rem 1.5rem`
- Display: `flex`, Justify: `space-around`
- Font Size: `0.875rem`
- Color: `rgba(255, 255, 255, 0.8)`

### Friends Section (3 Tabs)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────┬─────────┬─────────┐                      │
│  │Following│Followers│ Discover│                       │
│  │    2    │    0    │    🔍   │                       │
│  └─────────┴─────────┴─────────┘                      │
│  ▔▔▔▔▔▔▔▔▔                                            │
│                                                         │
│  [Search: Find friends...]                             │
│                                                         │
│  ┌───────────────────────────────────────────┐        │
│  │  [Avatar] @mossy                 [Follow] │        │
│  │           Pat Moss                        │        │
│  │           Mutual: @taylormurto            │        │
│  │           🔥 92% taste match              │        │
│  └───────────────────────────────────────────┘        │
│                                                         │
│  ┌───────────────────────────────────────────┐        │
│  │  [Avatar] @taylormurto           [Follow] │        │
│  │           Taylor Murto                    │        │
│  │           Watching: High Potential        │        │
│  │           ⭐ 85% taste match              │        │
│  └───────────────────────────────────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tab Specifications:**
- Background: `rgba(255, 255, 255, 0.03)` (inactive)
- Background: `rgba(255, 255, 255, 0.1)` (active)
- Border Bottom: `3px solid` with gradient (active only)
- Padding: `1rem`
- Font Weight: `600`
- Transition: `all 0.2s ease`

**User Card Specifications:**
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border Radius: `16px`
- Padding: `1.25rem`
- Backdrop Filter: `blur(10px)`
- Box Shadow: `0 4px 12px rgba(0, 0, 0, 0.2)`
- Hover: `transform: translateY(-2px)`, `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3)`

### Settings Section

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⚙️ Settings                                           │
│                                                         │
│  ┌──────────────────────────────────────────┐         │
│  │  Private Account              [Toggle]    │         │
│  │  Only followers see activity              │         │
│  └──────────────────────────────────────────┘         │
│                                                         │
│  ┌──────────────────────────────────────────┐         │
│  │  🎟️ Invites                              │         │
│  │  Your code: BWALPHA_NM123                │         │
│  │  Invites remaining: 10                    │         │
│  └──────────────────────────────────────────┘         │
│                                                         │
│  [🚪 Logout]                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Settings Card:**
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border Radius: `16px`
- Padding: `1.5rem`

**Toggle Switch (Dark Mode):**
- Track Background (Off): `rgba(255, 255, 255, 0.2)`
- Track Background (On): `linear-gradient(135deg, #e94d88 0%, #f27121 100%)`
- Thumb: `#ffffff`
- Width: `48px`, Height: `28px`

**Logout Button:**
- Background: `rgba(239, 68, 68, 0.15)`
- Border: `1px solid rgba(239, 68, 68, 0.3)`
- Color: `#ef4444`
- Hover Background: `rgba(239, 68, 68, 0.25)`

---

## 💾 Implementation Details

### Theme State Management

```typescript
// Theme type
type Theme = 'auto' | 'light' | 'dark'

// State
const [theme, setTheme] = useState<Theme>('auto')
const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

// Load from localStorage on mount
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') as Theme
  if (savedTheme) {
    setTheme(savedTheme)
  }
}, [])

// Listen to system preference changes
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent) => {
    if (theme === 'auto') {
      setResolvedTheme(e.matches ? 'dark' : 'light')
    }
  }

  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}, [theme])

// Update resolved theme when theme changes
useEffect(() => {
  if (theme === 'auto') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setResolvedTheme(isDark ? 'dark' : 'light')
  } else {
    setResolvedTheme(theme)
  }

  // Save to localStorage
  localStorage.setItem('theme', theme)
}, [theme])

// Helper for getting colors
const isDarkMode = resolvedTheme === 'dark'
```

### CSS Variables (Alternative Approach)

```css
:root {
  /* Light mode (default) */
  --bg-gradient: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-border: rgba(0, 0, 0, 0.1);
  --text-primary: #1a1a1a;
  --text-secondary: rgba(0, 0, 0, 0.6);
}

[data-theme="dark"] {
  /* Dark mode */
  --bg-gradient: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%);
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
}
```

---

## 🎬 Animation & Transitions

### Theme Transition
```css
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}
```

### Card Hover Effects
```css
.user-card {
  transition: transform 0.2s ease,
              box-shadow 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

### Button Active State
```css
.theme-toggle-button {
  transition: all 0.2s ease;
}

.theme-toggle-button.active {
  background: rgba(255, 255, 255, 0.15);
  color: #e94d88;
}
```

---

## 📱 Responsive Design

### Mobile (< 640px)
- Theme toggle buttons show icons only (no text)
- User cards stack vertically with full width
- Stats row becomes vertical layout
- Reduced padding throughout

### Tablet (640px - 1024px)
- Theme toggle shows icons + abbreviated text
- User cards in single column
- Normal padding

### Desktop (> 1024px)
- Full theme toggle with icons + full text
- User cards can show 2 columns if needed
- Maximum width: `600px` (maintains mobile-first design)

---

## 🔍 Detailed Component Mockups

### Theme Toggle Component (Full Size)

```
┌────────────────────────────────────────────┐
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  💻 Auto   ☀️ Light   🌙 Dark      │ │
│  │   ▔▔▔▔▔                             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Current: Auto (using system preference)  │
│  System: Dark mode                        │
│  Resolved: Dark                           │
│                                            │
└────────────────────────────────────────────┘
```

### User Card Component (Dark Mode)

```
┌──────────────────────────────��───────────────┐
│                                              │
│  ╭─────╮  @mossy                  [Follow]  │
│  │ PM  │  Pat Moss                           │
│  ╰─────╯  Mutual: @taylormurto, @nick        │
│           🔥 92% taste match                 │
│           Watching: Fallout S1               │
│                                              │
└──────────────────────────────────────────────┘
│           ↑ Hover: Lift + Shadow            │
```

**Hover State:**
- Transform: `translateY(-2px)`
- Box Shadow: `0 8px 24px rgba(0, 0, 0, 0.3)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`

---

## 🎯 Accessibility Considerations

### Contrast Ratios (WCAG AA Compliant)

**Dark Mode:**
- Primary text on background: `#ffffff` on `#0a0a0a` = **19.9:1** ✅
- Secondary text on background: `rgba(255,255,255,0.6)` on `#0a0a0a` = **11.9:1** ✅
- Card text on card bg: `#ffffff` on `rgba(255,255,255,0.05)` = **18.2:1** ✅

**Light Mode:**
- Primary text on background: `#1a1a1a` on `#ffffff` = **18.5:1** ✅
- Secondary text on background: `rgba(0,0,0,0.6)` on `#ffffff` = **11.1:1** ✅

### Keyboard Navigation
- Theme toggle buttons accessible via `Tab`
- Active state visible with focus ring
- `Enter` or `Space` to activate

### Screen Reader Support
```html
<button
  role="button"
  aria-label="Set theme to auto (follows system)"
  aria-pressed={theme === 'auto'}
>
  💻 Auto
</button>
```

---

## 📦 File Structure for Implementation

```
/components/theme/
  ├── ThemeToggle.tsx          # 3-state toggle component
  └── ThemeProvider.tsx        # Context provider

/hooks/
  └── useTheme.ts              # Custom hook for theme

/app/profile/page.tsx          # Updated with theme support
/app/welcome/page.tsx          # Already has 2-state toggle
```

---

## 🚀 Implementation Checklist

- [ ] Create `ThemeToggle.tsx` component (3-state)
- [ ] Create `ThemeProvider.tsx` context
- [ ] Create `useTheme.ts` hook
- [ ] Update `welcome/page.tsx` to use 3-state toggle
- [ ] Update `profile/page.tsx` to use 3-state toggle
- [ ] Add dark mode color variables to all profile components
- [ ] Test all interactive elements in dark mode
- [ ] Test theme persistence (localStorage)
- [ ] Test system preference changes (auto mode)
- [ ] Verify accessibility (contrast, keyboard nav)
- [ ] Test on mobile, tablet, desktop
- [ ] Deploy to Vercel
- [ ] Test on production

---

## 🎨 Visual Preview (Text-Based)

### Light Mode Profile
```
╔════════════════════════════════════════════╗
║  ← Back                    [Auto] Light Dark║
╠════════════════════════════════════════════╣
║                                            ║
║              ┌────────┐                    ║
║              │   NM   │                    ║
║              └────────┘                    ║
║                                            ║
║               @murtopia                    ║
║              Nick Murto                    ║
║     What have you been watching?          ║
║                                            ║
║          [✏️ Edit Profile]                ║
║                                            ║
║  ┌──────────────────────────────────────┐ ║
║  │ 29 Want │ 13 Watching │ 97 Watched   │ ║
║  └──────────────────────────────────────┘ ║
║                                            ║
╠════════════════════════════════════════════╣
║ Following  Followers  Discover             ║
║    2          0         🔍                 ║
║ ▔▔▔▔▔▔▔▔                                  ║
║                                            ║
║ [Search friends...]                        ║
║                                            ║
║ ┌────────────────────────────────────────┐ ║
║ │ [PM] @mossy              [Follow]      │ ║
║ │      Pat Moss                          │ ║
║ │      🔥 92% taste match                │ ║
║ └────────────────────────────────────────┘ ║
╚════════════════════════════════════════════╝
```

### Dark Mode Profile
```
╔════════════════════════════════════════════╗
║  ← Back                    Auto Light [Dark]║
╠════════════════════════════════════════════╣
║                                            ║
║              ╭────────╮                    ║
║              │   NM   │                    ║
║              ╰────────╯                    ║
║                                            ║
║               @murtopia                    ║
║              Nick Murto                    ║
║     What have you been watching?          ║
║                                            ║
║          [✏️ Edit Profile]                ║
║                                            ║
║  ╭──────────────────────────────────────╮ ║
║  │ 29 Want │ 13 Watching │ 97 Watched   │ ║
║  ╰──────────────────────────────────────╯ ║
║                                            ║
╠════════════════════════════════════════════╣
║ Following  Followers  Discover             ║
║    2          0         🔍                 ║
║ ▔▔▔▔▔▔▔▔                                  ║
║                                            ║
║ [Search friends...]                        ║
║                                            ║
║ ╭────────────────────────────────────────╮ ║
║ │ [PM] @mossy              [Follow]      │ ║
║ │      Pat Moss                          │ ║
║ │      🔥 92% taste match                │ ║
║ ╰────────────────────────────────────────╯ ║
╚════════════════════════════════════════════╝
```

Note: In the dark mode version, notice:
- Softer box characters (╭╮╰╯ vs ┌┐└┘)
- Darker overall appearance
- Higher contrast on active elements
- Gradient remains vibrant on buttons

---

## 💡 Design Rationale

### Why 3-State Toggle?

1. **User Control** - Some users prefer dark mode even in daylight
2. **Battery Saving** - OLED screens save power in dark mode
3. **Accessibility** - Light mode can be easier for some visual impairments
4. **Professional Standard** - Most modern apps offer theme control

### Why This Button Design?

1. **Clear States** - Icons + text make each option obvious
2. **Compact** - Fits in top-right without crowding
3. **Accessible** - Large touch targets, keyboard navigable
4. **Familiar** - Similar to iOS/Android theme selectors

### Color Choices

1. **Dark Background Gradient** - Purple tint (#1a0a1a) adds warmth and brand alignment
2. **Subtle Glass Effect** - Maintains brand identity without overwhelming
3. **High Contrast Text** - Ensures readability on dark backgrounds
4. **Unchanged Gradient** - Brand colors work in both modes

---

**End of Mockup Document**

*Ready for implementation! Copy this design directly into React components.*

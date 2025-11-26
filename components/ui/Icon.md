# Icon Component

A flexible SVG icon component that uses a sprite sheet for optimal performance.

## Features

- 🎨 **32 base icons** with 80+ sprite variants
- 🔄 **Multiple states** (default, active, filled)
- 🔵 **Circle variants** (built-in glassmorphic containers)
- 🌓 **Theme support** (light, dark)
- 🎯 **Custom colors**
- 📏 **Flexible sizing**
- ♿ **Accessible** (ARIA labels)
- ⚡ **Performant** (~92% smaller than inline SVGs)
- 💎 **Unified red active theme**

## Circle Variants (Built-in Glassmorphic Containers)

Many icons have circle variants with glassmorphic containers built directly into the sprite. Use the `variant="circle"` prop to access these:

```tsx
// Standalone icon (no circle)
<Icon name="close" size={20} />

// Icon WITH built-in circle (from sprite)
<Icon name="close" variant="circle" size={42} />
```

### Manual Circular Container Usage

For icons without circle variants, you can wrap them in a glassmorphic container:

```tsx
// Standard glassmorphic circle for action buttons
<div style={{
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'rgba(60, 60, 60, 0.4)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1.5px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s'
}}>
  <Icon name="plus" size={24} />
</div>
```

**Circle sizes by use case:**
- Side action buttons: 40×40px circle, 24px icon
- Modal action buttons: 48×48px circle, 24px icon
- Compact action buttons: 42×42px circle, 24px icon
- Close buttons: 36×36px circle, 20px icon
- Send buttons: 32×32px circle, 18px icon

**When to use circles:**
- All interactive action buttons (heart, plus, comment, share, etc.)
- Navigation buttons (menu, close)
- Watchlist status selectors
- Rating selectors

**When NOT to use circles:**
- Badge icons (16px inline with text)
- Small comment like hearts (14px)
- Navigation arrows/chevrons
- Status icons in badges

## Basic Usage

```tsx
import { Icon } from '@/components/ui/Icon';

// Simple icon
<Icon name="heart" />

// Custom size
<Icon name="star" size={32} />

// With state
<Icon name="heart" state={isLiked ? 'active' : 'default'} />

// Custom color
<Icon name="trophy" color="#FFD700" />

// Clickable
<Icon
  name="close"
  onClick={handleClose}
  ariaLabel="Close modal"
/>
```

## Pre-defined Sizes

```tsx
import { Icon, IconSize } from '@/components/ui/Icon';

<Icon name="heart" size={IconSize.xs} />   // 12px
<Icon name="heart" size={IconSize.sm} />   // 16px
<Icon name="heart" size={IconSize.md} />   // 20px
<Icon name="heart" size={IconSize.lg} />   // 24px (default)
<Icon name="heart" size={IconSize.xl} />   // 32px
<Icon name="heart" size={IconSize['2xl']} /> // 40px
<Icon name="heart" size={IconSize['3xl']} /> // 48px

// Or use convenience components
<Icon.Small name="heart" />  // 16px
<Icon.Medium name="heart" /> // 20px
<Icon.Large name="heart" />  // 24px
```

## Available Icons

### Action Icons

| Icon Name | States | Circle Variant | Usage |
|-----------|--------|----------------|-------|
| `heart` | default, active | ✅ Yes | Like/love actions |
| `heart-nav` | default, active | ✅ Yes | Side action like button |
| `plus` | default | No | Add to watchlist |
| `plus-small` | default | No | Badge overlays (12px) |
| `comment` | default | No | Comment button |
| `share` | default | ✅ Yes | Share button |
| `close` | default | ✅ Yes | Close/dismiss |
| `menu-dots` | default | No | Menu/more options |
| `send` | default | No | Submit comment |

**Examples:**
```tsx
<Icon name="heart" state="default" />  // Outline heart
<Icon name="heart" state="active" />   // Filled red heart
<Icon name="heart-nav" state="active" variant="circle" />  // With circle
<Icon name="close" variant="circle" />  // Close with circle
<Icon name="share" variant="circle" />  // Share with circle
```

### Rating Icons

| Icon Name | States | Circle Variant | Usage |
|-----------|--------|----------------|-------|
| `thumbs-up` | default, active | ✅ Yes | Like rating |
| `meh-face` | default, active | ✅ Yes | Meh rating |

**Examples:**
```tsx
// Rating buttons with circles
<Icon name="meh-face" state="default" variant="circle" />
<Icon name="thumbs-up" state="active" variant="circle" />
<Icon name="heart" state="active" variant="circle" />  // Love rating
```

### Status Icons

| Icon Name | States | Circle Variant | Usage |
|-----------|--------|----------------|-------|
| `bookmark` | default, active | ✅ Yes | Want to Watch |
| `bookmark-plus` | default | No | Want to Watch action |
| `play` | default, active | ✅ Yes | Watching status |
| `check` | default, active | ✅ Yes | Watched status |

**Examples:**
```tsx
<Icon name="bookmark" state="default" variant="circle" />
<Icon name="bookmark" state="active" variant="circle" />
<Icon name="play" variant="circle" />
<Icon name="check" state="active" variant="circle" />
```

### Badge/Info Icons

| Icon Name | States | Circle Variant | Usage |
|-----------|--------|----------------|-------|
| `clock` | default | No | Coming Soon badge |
| `bell` | default, active | ✅ Yes | Notifications/Remind Me |
| `tv-screen` | default | No | Now Streaming badge |
| `trophy` | default | No | Top 3 badge |
| `link-chain` | default | No | Find New Friends badge |
| `star` | default, active, half | No | Ratings/featured |
| `star-gold` | default | No | Gold rating star |
| `star-featured` | default | No | Featured gold/orange star |
| `sparkles` | default | No | AI recommendations |

**Examples:**
```tsx
<Icon name="clock" size={16} />              // Coming Soon
<Icon name="bell" state="active" variant="circle" />  // With circle
<Icon name="tv-screen" size={20} />          // Streaming icon
<Icon name="trophy" color="#FFD700" />       // Gold trophy
<Icon name="star" state="active" />          // Active star (gold)
<Icon name="star-gold" size={16} />          // Gold rating star
```

### Navigation Icons

| Icon Name | States | Usage |
|-----------|--------|-------|
| `arrow-right` | default | Forward navigation |
| `chevron-down` | default | Dropdown/expand |
| `chevron-up` | default | Collapse |
| `chevron-left` | default | Back |
| `chevron-right` | default | Next |

**Examples:**
```tsx
<Icon name="chevron-down" size={16} />       // Dropdown
<Icon name="arrow-right" size={20} />        // Go forward
```

### Social Icons

| Icon Name | States | Usage |
|-----------|--------|-------|
| `user` | default | Single user/profile |
| `users` | default | Multiple users/friends |

**Examples:**
```tsx
<Icon name="user" size={24} />               // Profile icon
<Icon name="users" size={20} />              // Friends icon
```

### Utility Icons

| Icon Name | States | Usage |
|-----------|--------|-------|
| `info` | default | Information |
| `flag` | default | Report content |
| `trash` | default | Delete |
| `search` | default | Search |
| `filter` | default | Filter options |

**Examples:**
```tsx
<Icon name="info" size={18} />               // Info icon
<Icon name="flag" color="#EF4444" />         // Report
<Icon name="trash" size={20} />              // Delete
```

## State Management

Some icons have multiple states (outline, filled, active). Use the `state` prop to toggle between them:

```tsx
const [isLiked, setIsLiked] = useState(false);

<Icon
  name="heart"
  state={isLiked ? 'active' : 'default'}
  onClick={() => setIsLiked(!isLiked)}
/>
```

### Icons with States

- `heart` - outline → filled
- `bookmark` - outline → filled
- `bell` - outline → filled
- `thumbs-up` - outline → filled
- `meh-face` - outline → filled
- `check` - outline → filled
- `star` - outline → filled

## Theming

Icons automatically adapt to theme, or you can specify custom colors:

```tsx
// Dark theme (default - white icons)
<Icon name="heart" theme="dark" />

// Light theme (black icons)
<Icon name="heart" theme="light" />

// Custom color (overrides theme)
<Icon name="heart" color="#FF3B5C" />
```

### Unified Red Active Theme (January 2025)

**IMPORTANT:** Active states for most icons are now hardcoded in the sprite sheet with a unified red color scheme. You do NOT need to pass color props for active states.

```tsx
// Active states - colors are built into the sprite
<Icon name="heart" state="active" />      // Red theme applied automatically
<Icon name="thumbs-up" state="active" />  // Red theme applied automatically
<Icon name="meh-face" state="active" />   // Red theme applied automatically
<Icon name="bookmark" state="active" />   // Red theme applied automatically
<Icon name="play" state="active" />       // Red theme applied automatically
<Icon name="check" state="active" />      // Red theme applied automatically
<Icon name="bell" state="active" />       // Red theme applied automatically
```

**Color values in sprite:**
- Standalone active: `fill="rgba(239,68,68,0.2)"` + `stroke="rgba(239,68,68,1)"`
- Circle variants: `stroke="rgba(239,68,68,0.4)"` for inner elements

**Exception - Gold Stars:**
```tsx
// Stars use gold, also hardcoded in sprite
<Icon name="star" state="active" />  // #FFD700 gold
```

### Legacy Accent Colors (Deprecated)

The following patterns are **deprecated**:

```tsx
// ❌ Don't do this - colors are now in sprite
<Icon name="heart" state="active" color="#FF3B5C" />
<Icon name="thumbs-up" state="active" color="#3B82F6" />
<Icon name="check" state="filled" color="#34D399" />

// ✅ Do this instead - sprite handles colors
<Icon name="heart" state="active" />
<Icon name="thumbs-up" state="active" />
<Icon name="check" state="active" />
```

### Other Icon Colors

For non-stateful icons, you can still use custom colors:

```tsx
// Gold (top 3, premium badges)
<Icon name="trophy" color="#FFD700" />

// Purple (AI recommendations)
<Icon name="sparkles" color="#A855F7" />

// Red (report/flag)
<Icon name="flag" color="#EF4444" />
```

## Accessibility

### ARIA Labels

Always provide `ariaLabel` for clickable icons or icons without accompanying text:

```tsx
// Good
<Icon
  name="close"
  onClick={handleClose}
  ariaLabel="Close modal"
/>

// Good (with text)
<button>
  <Icon name="heart" ariaHidden />
  <span>Like</span>
</button>

// Bad (no label for clickable icon)
<Icon name="close" onClick={handleClose} />
```

### Decorative Icons

If an icon is purely decorative (has accompanying text), mark it as `ariaHidden`:

```tsx
<button>
  <Icon name="plus" ariaHidden />
  <span>Add to Watchlist</span>
</button>
```

## Common Patterns

### Like Button

```tsx
function LikeButton({ isLiked, count, onLike }) {
  return (
    <button
      onClick={onLike}
      className={isLiked ? 'liked' : ''}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Icon
        name="heart"
        state={isLiked ? 'active' : 'default'}
        size={24}
      />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
```

### Rating Selector

```tsx
function RatingSelector({ value, onChange }) {
  const ratings = [
    { key: 'meh', icon: 'meh-face', label: 'Meh' },
    { key: 'like', icon: 'thumbs-up', label: 'Like' },
    { key: 'love', icon: 'heart', label: 'Love' },
  ];

  return (
    <div className="rating-selector">
      {ratings.map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          aria-label={`Rate as ${label}`}
        >
          <Icon
            name={icon}
            state={value === key ? 'active' : 'default'}
            size={32}
          />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
```

### Status Indicator

```tsx
function WatchStatus({ status }) {
  const statusConfig = {
    want: { icon: 'bookmark', label: 'Want to Watch' },
    watching: { icon: 'play', label: 'Watching' },
    watched: { icon: 'check', label: 'Watched' },
  };

  const config = statusConfig[status];

  return (
    <div className="status">
      <Icon name={config.icon} size={16} ariaHidden />
      <span>{config.label}</span>
    </div>
  );
}
```

### Action Button with Icon

```tsx
function ActionButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={active ? 'active' : ''}
      aria-label={label}
    >
      <Icon
        name={icon}
        state={active ? 'active' : 'default'}
        size={24}
      />
    </button>
  );
}
```

## Performance

The icon system uses a sprite sheet which provides:

- **~65% file size reduction** vs inline SVGs
- **Single HTTP request** for all icons
- **Browser caching** (1 year cache with immutable header)
- **Lazy loading** via `<use>` element
- **No JavaScript bundle impact** (pure SVG)

### Before (Inline SVGs):
- 8 cards × 15 icons × 150 bytes = ~15.7 KB per card
- Total: ~126 KB across all cards

### After (Sprite Sheet):
- Sprite file: ~3.4 KB (minified & gzipped)
- `<use>` reference: ~50 bytes per use
- Total: ~8.6 KB across all cards

**Savings: ~101 KB (~92% reduction)**

## Browser Support

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ iOS Safari (all versions)
- ✅ Android Chrome (all versions)

The sprite sheet uses standard SVG features supported by all modern browsers.

## Troubleshooting

### Icon not displaying

**Problem:** Icon shows as empty box or doesn't appear

**Solutions:**
1. Check icon name is correct (see list above)
2. Verify sprite sheet is loaded: `/icons/feed-sprite.svg`
3. Check browser console for 404 errors
4. Hard refresh to clear cache (Cmd+Shift+R)

### Icon wrong color

**Problem:** Icon shows wrong color or doesn't respond to `color` prop

**Solutions:**
1. Verify sprite uses `currentColor` for fill/stroke
2. Check if icon has hardcoded color in sprite
3. Try setting color explicitly: `<Icon name="..." color="#FF0000" />`

### Icon wrong size

**Problem:** Icon doesn't match specified size

**Solutions:**
1. Check parent element CSS (might override)
2. Use `IconSize` constants for consistency
3. Verify `viewBox` is set correctly in sprite symbol

## Naming Conventions

### Sprite Symbol IDs

Icons in the sprite sheet follow these naming patterns:

**Stateful Icons (in STATEFUL_ICONS array):**
```
{name}-default         → Standalone default state
{name}-active          → Standalone active state
{name}-c-default       → With circle, default state
{name}-c-active        → With circle, active state
```

**Example: heart-nav**
- `heart-nav-default` → White outline heart (standalone)
- `heart-nav-active` → Red filled heart (standalone)
- `heart-nav-c-default` → White outline heart in circle
- `heart-nav-c-active` → Red filled heart in circle

**Non-Stateful Icons:**
```
{name}                 → Single symbol, no variants
```

**Example: plus**
- `plus` → Single plus icon (no states or circle variants)

### Icons with Circle Variants

These icons have `-c-default` (and sometimes `-c-active`) variants with built-in glassmorphic circles:

- `heart` / `heart-c-default` / `heart-c-active`
- `heart-nav` / `heart-nav-c-default` / `heart-nav-c-active`
- `thumbs-up` / `thumbs-up-c-default` / `thumbs-up-c-active`
- `meh-face` / `meh-face-c-default` / `meh-face-c-active`
- `bookmark` / `bookmark-c-default` / `bookmark-c-active`
- `play` / `play-c-default` / `play-c-active`
- `check` / `check-c-default` / `check-c-active`
- `bell` / `bell-c-default` / `bell-c-active`
- `close` / `close-c-default`
- `share` / `share-c-default`

## Updating Icons

When designs change or new icons are needed:

1. **Extract new SVG** from design file
2. **Convert to symbol** in sprite sheet:
   ```xml
   <symbol id="new-icon" viewBox="0 0 24 24">
     <path d="..." fill="currentColor"/>
   </symbol>
   ```
3. **Add to this documentation**
4. **Update Icon component** if new states are needed
5. **Add to STATEFUL_ICONS array** if icon has states
6. **Test** across all usage contexts

See `/docs/design/icon-sprite-system.md` for detailed workflow.

## Related

- [Icon Sprite System Documentation](/docs/design/icon-sprite-system.md)
- [Component Library Spec](/docs/design/component-library-spec.md)
- [Design Tokens](/styles/tokens.ts)

---

**Maintained by:** Design & Engineering Teams
**Last Updated:** January 2025

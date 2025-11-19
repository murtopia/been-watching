# Icon Component

A flexible SVG icon component that uses a sprite sheet for optimal performance.

## Features

- 🎨 **40+ icons** from sprite sheet
- 🔄 **Multiple states** (default, active, filled)
- 🌓 **Theme support** (light, dark)
- 🎯 **Custom colors**
- 📏 **Flexible sizing**
- ♿ **Accessible** (ARIA labels)
- ⚡ **Performant** (~92% smaller than inline SVGs)
- 💎 **Glassmorphic circles** for interactive icons

## Circular Container Usage

Most icons in the app appear inside circular glassmorphic containers. Here's the standard styling:

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

| Icon Name | States | Usage |
|-----------|--------|-------|
| `heart` | outline, filled | Like/love actions |
| `plus` | default | Add to watchlist |
| `plus-small` | default | Badge overlays (12px) |
| `comment` | default | Comment button |
| `share` | default | Share button |
| `close` | default | Close/dismiss |
| `menu-dots` | default | Menu/more options |
| `send` | default | Submit comment |

**Examples:**
```tsx
<Icon name="heart" state="default" />  // Outline heart
<Icon name="heart" state="active" />   // Filled pink heart
<Icon name="plus" size={40} />         // Add button
<Icon name="comment" size={24} />      // Comment icon
```

### Rating Icons

| Icon Name | States | Usage |
|-----------|--------|-------|
| `thumbs-up` | outline, filled | Like rating |
| `meh-face` | outline, filled | Meh rating |

**Examples:**
```tsx
// Rating buttons
<Icon name="meh-face" state="default" />     // Not selected
<Icon name="thumbs-up" state="active" />     // Selected
<Icon name="heart" state="filled" />         // Love rating
```

### Status Icons

| Icon Name | States | Usage |
|-----------|--------|-------|
| `bookmark` | outline, filled | Want to Watch |
| `bookmark-plus` | default | Want to Watch action |
| `play` | default | Watching status |
| `check` | outline, filled | Watched status |

**Examples:**
```tsx
<Icon name="bookmark" state="default" />     // Not in watchlist
<Icon name="bookmark" state="filled" />      // In watchlist
<Icon name="play" size={20} />               // Watching
<Icon name="check" state="filled" />         // Watched
```

### Badge/Info Icons

| Icon Name | States | Usage |
|-----------|--------|-------|
| `clock` | default | Coming Soon badge |
| `bell` | outline, filled | Notifications/Remind Me |
| `tv-screen` | default | Now Streaming badge |
| `trophy` | default | Top 3 badge |
| `link-chain` | default | Find New Friends badge |
| `star` | outline, filled, half | Ratings/featured |
| `sparkles` | default | AI recommendations |

**Examples:**
```tsx
<Icon name="clock" size={16} />              // Coming Soon
<Icon name="bell" state="filled" />          // Notification active
<Icon name="tv-screen" size={20} />          // Streaming icon
<Icon name="trophy" color="#FFD700" />       // Gold trophy
<Icon name="star" state="filled" color="#FFA500" /> // Rating star
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
- 7 cards × 15 icons × 150 bytes = ~15.7 KB per card
- Total: ~110 KB across all cards

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
5. **Test** across all usage contexts

See `/docs/design/icon-sprite-system.md` for detailed workflow.

## Related

- [Icon Sprite System Documentation](/docs/design/icon-sprite-system.md)
- [Component Library Spec](/docs/design/component-library-spec.md)
- [Design Tokens](/styles/tokens.ts)

---

**Maintained by:** Design & Engineering Teams
**Last Updated:** January 2025

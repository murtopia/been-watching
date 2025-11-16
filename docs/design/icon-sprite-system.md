# Icon Sprite System

**Version:** 1.0
**Last Updated:** January 2025
**Status:** In Development

## Overview

The Enhanced Activity Feed uses an SVG sprite sheet system for all icons, providing centralized management, reduced file sizes, and easy theming. This document details the icon inventory, sprite implementation, React component usage, and update workflow.

---

## Why Sprite Sheets?

### Benefits

1. **Performance:** ~92% file size reduction vs inline SVGs (110KB → 8.6KB)
2. **Caching:** Single sprite file cached by browser
3. **Consistency:** One source of truth for all icons
4. **Maintainability:** Update icon once, affects all instances
5. **Theming:** Centralized color/state management
6. **Version Control:** Track icon changes in single file

### Trade-offs

- **Initial Setup:** Requires sprite generation workflow
- **Build Process:** Needs integration with build pipeline
- **Dynamic Icons:** Can't use external icon URLs (rare case)

**Verdict:** Benefits far outweigh costs for this project.

---

## Glassmorphic Circular Containers

### Overview

Most interactive icons in the Enhanced Feed appear inside circular glassmorphic containers. This provides:
- Visual consistency across all action buttons
- Modern frosted-glass aesthetic
- Clear interaction affordance
- Depth and layering

### Standard Styling

```css
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(60, 60, 60, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-circle:active {
  transform: scale(0.9);
}
```

### Size Variants

| Use Case | Circle Size | Icon Size | Context |
|----------|-------------|-----------|---------|
| Side action buttons | 40×40px | 24px | Main card actions (heart, plus, comment, share) |
| Modal action buttons | 48×48px | 24px | Watchlist status, rating selectors |
| Compact actions | 42×42px | 24px | Back card actions, rating displays |
| Close buttons | 36×36px | 20px | Card back close, modal dismiss |
| Send buttons | 32×32px | 18px | Comment input submit |

### When to Use Circles

**Always use circular containers for:**
- Interactive action buttons (heart, plus, comment, share, bookmark, bell)
- Navigation buttons (menu-dots, close)
- Watchlist status selectors (bookmark, play, check)
- Rating selectors (meh-face, thumbs-up, heart)
- Send/submit buttons

**Never use circular containers for:**
- Badge icons (16px inline with text: clock, tv-screen, trophy, sparkles)
- Small comment like hearts (14px next to counts)
- Navigation arrows/chevrons in text
- Star ratings in metadata displays
- Info icons in tooltips

---

## Icon Inventory

### Total Icons: 28+

Extracted from approved HTML card designs in `/public/` directory.

### Action Icons (Main Interactions)

| Icon Name | Usage | States | Cards |
|-----------|-------|--------|-------|
| `heart` | Like/Love | outline, filled | 1, 6 (like activity), 1-6 (love rating) |
| `plus` | Add to watchlist | default | 1-6 (quick action) |
| `comment` | Comments | default | 1-6 |
| `share` | Share (Phase 2) | default | 2-5 |
| `bookmark` | Want to Watch | outline, filled | 4 (coming soon) |
| `bell` | Notifications/Remind Me | outline, filled | 4 (coming soon) |
| `play` | Watching status | default | All (back side) |
| `check` | Watched status | default | All (back side) |
| `menu-dots` | Flip card menu | default | 1-6 (three vertical dots) |
| `close-x` | Close/Back | default | 1-6 (card back) |

### Rating Icons

| Icon Name | Usage | States | Cards |
|-----------|-------|--------|-------|
| `meh-face` | Meh rating (😐) | outline, filled | All (ratings) |
| `thumbs-up` | Like rating (👍) | outline, filled | All (ratings) |
| `heart-solid` | Love rating (❤️) | outline, filled | All (ratings) |

### Badge/Info Icons

| Icon Name | Usage | States | Cards |
|-----------|-------|--------|-------|
| `clock` | Coming Soon badge | default | 4 |
| `tv-screen` | Now Streaming badge | default | 5 |
| `trophy` | Top 3 badge | default | 6 |
| `link-chain` | Follow Suggestions badge | default | 7 |
| `star` | TMDB rating | default | All (metadata) |
| `calendar` | Release date | default | 4, 5 |
| `sparkles` | AI recommendation | default | 2, 8 |

### UI Icons

| Icon Name | Usage | States | Cards |
|-----------|-------|--------|-------|
| `send` | Post comment | default | All (comment input) |
| `arrow-right` | Navigation/expand | default | Various |
| `chevron-down` | Expand/collapse | default, up | Various |
| `info` | Information | default | Various |
| `flag` | Report content | default | Moderation |

### Social Icons

| Icon Name | Usage | States | Cards |
|-----------|-------|--------|-------|
| `user` | Profile | default | 7 |
| `users` | Friends/mutual | default | 7 |

---

## Sprite Sheet Structure

### File Location

```
/public/icons/feed-sprite.svg
```

### SVG Format

```xml
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <!-- Action Icons -->
  <symbol id="heart-outline" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>

  <symbol id="heart-filled" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
  </symbol>

  <symbol id="plus" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </symbol>

  <symbol id="comment" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>

  <!-- More icons... -->
</svg>
```

### Naming Convention

**Format:** `{icon-name}-{state}`

**Examples:**
- `heart-outline` - Default outline state
- `heart-filled` - Active/filled state
- `bookmark-outline` - Default bookmark
- `bookmark-filled` - Active bookmark
- `meh-face` - No state suffix (single state)

**Rules:**
1. Use kebab-case for icon names
2. Suffix with state only if multiple states exist
3. Default state is usually "outline" or no suffix
4. Active state is "filled" or "active"

---

## React Icon Component

### Component Implementation

**File:** `/components/ui/Icon.tsx`

```tsx
import React from 'react';

interface IconProps {
  name: string;
  size?: number | string;
  state?: 'default' | 'active';
  theme?: 'light' | 'dark';
  color?: string;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  state = 'default',
  theme = 'dark',
  color,
  className = '',
  onClick,
  ariaLabel,
}) => {
  // Determine icon ID based on name and state
  const getIconId = () => {
    // Icons with state variants
    const statefulIcons = ['heart', 'bookmark', 'bell', 'meh-face', 'thumbs-up'];

    if (statefulIcons.includes(name)) {
      return state === 'active' ? `${name}-filled` : `${name}-outline`;
    }

    // Single-state icons
    return name;
  };

  // Determine color based on theme and custom color
  const getColor = () => {
    if (color) return color;

    // Default colors by theme
    if (theme === 'light') {
      return '#1a1a1a'; // Dark text on light background
    }
    return '#ffffff'; // Light text on dark background
  };

  const iconId = getIconId();
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      className={`icon ${className}`}
      width={sizeValue}
      height={sizeValue}
      onClick={onClick}
      aria-label={ariaLabel || name}
      role={onClick ? 'button' : 'img'}
      style={{ color: getColor(), cursor: onClick ? 'pointer' : 'default' }}
    >
      <use xlinkHref={`/icons/feed-sprite.svg#${iconId}`} />
    </svg>
  );
};
```

### Usage Examples

**Basic Usage:**
```tsx
<Icon name="heart" size={24} />
```

**With State:**
```tsx
<Icon
  name="heart"
  state={isLiked ? 'active' : 'default'}
  onClick={handleLike}
/>
```

**Custom Color:**
```tsx
<Icon name="star" color="#FFD700" size={16} />
```

**In Components:**
```tsx
// Like button
<CircularActionButton
  icon={<Icon name="heart" state={isLiked ? 'active' : 'default'} />}
  count={likeCount}
  active={isLiked}
  onClick={handleLike}
/>

// Rating icon
<Icon
  name="heart"
  state="active"
  size={24}
  color="#FF3B5C"
/>
```

---

## Icon States & Theming

### State Management

**Two-State Icons:**
```tsx
// Heart (like/love)
<Icon name="heart" state="default" /> // Outline
<Icon name="heart" state="active" />  // Filled pink

// Bookmark (want to watch)
<Icon name="bookmark" state="default" /> // Outline
<Icon name="bookmark" state="active" />  // Filled

// Bell (notifications)
<Icon name="bell" state="default" /> // Outline
<Icon name="bell" state="active" />  // Filled with dot indicator
```

**Single-State Icons:**
```tsx
<Icon name="plus" />      // Always same
<Icon name="comment" />   // Always same
<Icon name="menu-dots" /> // Always same
```

### Theme Variations

**Dark Background (Default):**
```tsx
<Icon name="heart" theme="dark" /> // White color
```

**Light Background:**
```tsx
<Icon name="heart" theme="light" /> // Dark color
```

**Custom Theme:**
```tsx
<Icon name="heart" color="#FF3B5C" /> // Pink, regardless of theme
```

### Accent Colors

**By Action Type:**
```tsx
// Like/Love actions
<Icon name="heart" state="active" color="#FF3B5C" />

// Success actions
<Icon name="check" color="#34D399" />

// Warning actions
<Icon name="flag" color="#FFC107" />

// Info actions
<Icon name="info" color="#3B82F6" />
```

---

## Extraction Workflow

### Step 1: Identify Icons in HTML

**Source Files:**
- `/public/feed-single-card-interactive.html` (Card 1)
- `/public/feed-card-2.html` through `/public/feed-card-7.html`

**Search for:**
```html
<svg viewBox="0 0 24 24" ...>
  <path d="..." />
</svg>
```

### Step 2: Extract SVG Paths

**For each unique icon:**
1. Copy the SVG element
2. Note the `viewBox` attribute
3. Extract all `<path>`, `<line>`, `<circle>`, etc. elements
4. Identify fill/stroke properties
5. Note usage context (where it appears)

### Step 3: Create Symbol

**Template:**
```xml
<symbol id="{icon-name}-{state}" viewBox="0 0 24 24">
  <!-- Paste path elements here -->
  <!-- Replace hardcoded colors with "currentColor" -->
</symbol>
```

**Example Conversion:**

**Before (inline in HTML):**
```html
<svg viewBox="0 0 24 24" style="width: 24px; height: 24px;">
  <path d="M20.84 4.61..." fill="none" stroke="white" stroke-width="1.5"/>
</svg>
```

**After (in sprite):**
```xml
<symbol id="heart-outline" viewBox="0 0 24 24">
  <path d="M20.84 4.61..." fill="none" stroke="currentColor" stroke-width="1.5"/>
</symbol>
```

**Key Changes:**
- Removed style attribute (size controlled by component)
- Changed `stroke="white"` to `stroke="currentColor"`
- Changed `fill="white"` to `fill="currentColor"` (where applicable)

### Step 4: Build Sprite Sheet

**File:** `/public/icons/feed-sprite.svg`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: none;">
  <defs>
    <!-- Action Icons -->
    <symbol id="heart-outline" viewBox="0 0 24 24">
      <!-- ... -->
    </symbol>

    <symbol id="heart-filled" viewBox="0 0 24 24">
      <!-- ... -->
    </symbol>

    <!-- Add all 28+ icons here -->
  </defs>
</svg>
```

### Step 5: Validate

**Check:**
1. All icons display correctly in browser
2. `currentColor` works for theming
3. Icon sizes scale properly
4. States toggle correctly
5. No visual regressions vs HTML mockups

---

## Update Workflow

### When Designs Change

**Scenario:** Designer updates heart icon shape

**Steps:**
1. **Receive new SVG** from designer
2. **Extract path** from new SVG
3. **Update symbol** in sprite sheet:
   ```xml
   <symbol id="heart-outline" viewBox="0 0 24 24">
     <!-- Replace with new path -->
     <path d="NEW_PATH_HERE" stroke="currentColor" .../>
   </symbol>
   ```
4. **Commit to git** with message: `Update heart icon design`
5. **Deploy** - all instances auto-update
6. **QA test** all cards with heart icon

### Version Control

**Track Changes:**
```bash
git log --follow -- public/icons/feed-sprite.svg
```

**Sprite Sheet Versions:**
- v1.0 - Initial sprite (January 2025)
- v1.1 - Updated heart icon (TBD)
- v1.2 - Added new icons for feature X (TBD)

**Admin UI Integration:**
- View version history in Admin > Design Assets > Icons
- Download specific version
- Diff view between versions

---

## Build Process Integration

### Development

**No build step required** - sprite is static SVG file

**Usage:**
```tsx
import { Icon } from '@/components/ui/Icon';

<Icon name="heart" size={24} />
```

Browser loads `/public/icons/feed-sprite.svg` once, caches it.

### Production

**Optimizations:**

1. **Minify Sprite:**
```bash
npx svgo public/icons/feed-sprite.svg -o public/icons/feed-sprite.min.svg
```

2. **Gzip Compression:**
```
# Handled by Vercel automatically
Content-Encoding: gzip
```

3. **Cache Headers:**
```typescript
// next.config.js
{
  headers: [
    {
      source: '/icons/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

**Result:** Icon sprite loads once, cached for 1 year

---

## Testing & Quality Assurance

### Visual Testing

**Storybook:**
```tsx
// Icon.stories.tsx
export default {
  title: 'UI/Icon',
  component: Icon,
};

export const AllIcons = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
    {iconNames.map(name => (
      <div key={name} style={{ textAlign: 'center' }}>
        <Icon name={name} size={32} />
        <div style={{ fontSize: '12px', marginTop: '8px' }}>{name}</div>
      </div>
    ))}
  </div>
);

export const States = () => (
  <div>
    <Icon name="heart" state="default" size={48} />
    <Icon name="heart" state="active" size={48} />
  </div>
);

export const Themes = () => (
  <div>
    <div style={{ background: '#000', padding: '20px' }}>
      <Icon name="heart" theme="dark" size={48} />
    </div>
    <div style={{ background: '#fff', padding: '20px' }}>
      <Icon name="heart" theme="light" size={48} />
    </div>
  </div>
);
```

### Automated Tests

**Unit Test:**
```typescript
// Icon.test.tsx
import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders with correct size', () => {
    const { container } = render(<Icon name="heart" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24px');
    expect(svg).toHaveAttribute('height', '24px');
  });

  it('uses correct symbol for state', () => {
    const { container } = render(<Icon name="heart" state="active" />);
    const use = container.querySelector('use');
    expect(use).toHaveAttribute('xlink:href', '/icons/feed-sprite.svg#heart-filled');
  });

  it('applies custom color', () => {
    const { container } = render(<Icon name="heart" color="#FF3B5C" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ color: '#FF3B5C' });
  });
});
```

### Visual Regression

**Percy/Chromatic:**
```bash
npm run test:visual
```

Compare icon renders against baseline screenshots.

---

## Admin UI Integration

### Icon Library Page

**Route:** `/admin/design-assets/icons`

**Features:**

1. **Grid Display:**
   ```tsx
   <div className="icon-grid">
     {allIcons.map(icon => (
       <IconCard
         key={icon.name}
         name={icon.name}
         states={icon.states}
         onCopy={() => copyIconName(icon.name)}
       />
     ))}
   </div>
   ```

2. **Icon Card:**
   ```
   ┌─────────────────────┐
   │  heart              │ ← Icon name (copyable)
   │                     │
   │  [Icon Preview]     │ ← Large render
   │                     │
   │  ○ Default ● Active │ ← State toggles
   │                     │
   │  Dark | Light       │ ← Theme toggles
   └─────────────────────┘
   ```

3. **Preview Matrix:**
   ```
   Icon Name | Dark BG Default | Dark BG Active | Light BG Default | Light BG Active
   -----------------------------------------------------------------------
   heart     | [white outline] | [pink filled]  | [black outline]  | [pink filled]
   bookmark  | [white outline] | [white filled] | [black outline]  | [black filled]
   ```

4. **Download/Upload:**
   ```tsx
   <button onClick={downloadSprite}>
     Download Current Sprite Sheet
   </button>

   <input
     type="file"
     accept=".svg"
     onChange={handleUploadNewSprite}
   />
   ```

5. **Version History:**
   ```
   Version | Date       | Changed By | Changes
   -------------------------------------------
   1.2     | 2025-01-20 | Nick       | Added sparkles icon
   1.1     | 2025-01-15 | Designer   | Updated heart shape
   1.0     | 2025-01-10 | Nick       | Initial sprite
   ```

6. **Validation:**
   - Check all symbols have valid viewBox
   - Verify no hardcoded colors (except where intended)
   - Confirm no duplicate IDs
   - Validate SVG syntax

---

## Performance Metrics

### File Size Comparison

**Before (Inline SVGs in 7 cards):**
- Card 1: 83 inline SVG instances × ~150 bytes = 12.5 KB
- Cards 2-7: Similar
- **Total:** ~87.5 KB of SVG code

**After (Sprite Sheet):**
- Sprite file: 28 icons × 120 bytes = ~3.4 KB (minified)
- Reference per use: `<use xlinkHref=...>` = ~50 bytes
- **Total:** 3.4 KB + (7 cards × 15 uses × 50 bytes) = ~8.6 KB

**Savings:** ~78.9 KB (~90% reduction)

### Load Time Impact

**Metrics:**
- Sprite loads once: ~50ms (gzipped)
- Browser caches for 1 year
- Subsequent page loads: 0ms (cached)

---

## Migration Plan

### Phase 1: Extract Icons (Week 1)
1. Audit all HTML cards for unique icons
2. Create initial sprite sheet with 28+ icons
3. Test sprite in isolation (Storybook)
4. Validate all icons render correctly

### Phase 2: Build React Component (Week 2)
1. Implement `<Icon>` component
2. Add prop types and validation
3. Write unit tests
4. Create Storybook stories
5. Document usage

### Phase 3: Replace Inline SVGs (Weeks 3-4)
1. Update Card 1 template to use `<Icon>`
2. Update Cards 2-6 templates
3. Update Card 7 template
4. Visual regression testing
5. Performance benchmarking

### Phase 4: Admin Integration (Week 5)
1. Build Icon Library admin page
2. Add upload/download functionality
3. Implement version history
4. Create validation checks
5. User acceptance testing

---

## Best Practices

### Do's ✅
- Use `currentColor` for all fill/stroke values
- Name icons descriptively
- Group related icons in sprite
- Maintain consistent viewBox (0 0 24 24 preferred)
- Version control sprite changes
- Test icons in all usage contexts
- Cache sprite aggressively

### Don'ts ❌
- Don't hardcode colors in sprite (use currentColor)
- Don't create icons larger than needed (performance)
- Don't duplicate icons with different IDs
- Don't mix icon styles (maintain consistency)
- Don't forget to update state variants together
- Don't skip accessibility (aria-labels)

---

## Troubleshooting

### Icon Not Displaying

**Check:**
1. Icon ID exists in sprite sheet
2. Sprite file path is correct (`/icons/feed-sprite.svg`)
3. `<use>` xlinkHref attribute is formatted correctly
4. Sprite is not cached with old version (hard refresh)

### Icon Wrong Color

**Check:**
1. Icon uses `currentColor` in sprite
2. Component has correct color prop
3. CSS `color` property is set correctly
4. No hardcoded fill/stroke in sprite overriding currentColor

### Icon Wrong Size

**Check:**
1. `viewBox` attribute exists in symbol
2. `width` and `height` set on `<svg>` element
3. No conflicting CSS

---

## Future Enhancements

### Phase 2
- **Animated Icons:** Loading spinners, transitions
- **Icon Variants:** Different weights (light, regular, bold)
- **Custom Icons:** User-uploaded icons for premium users

### Phase 3
- **Icon Search:** Search icons by keyword in Admin UI
- **Icon Tags:** Categorize icons for easier discovery
- **Bulk Operations:** Update multiple icons at once
- **Icon Analytics:** Track most-used icons

---

## Related Documentation

- [Component Library Spec](/docs/design/component-library-spec.md)
- [Enhanced Feed Architecture](/docs/features/enhanced-feed-architecture.md)
- [Card Type Specifications](/docs/features/card-type-specifications.md)

---

**Maintained by:** Design & Engineering Teams
**Questions?** See [Been Watching Documentation Index](/docs/README.md)

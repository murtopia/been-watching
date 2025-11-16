# Enhanced Feed: Component Library Specification

**Version:** 1.0
**Last Updated:** January 2025
**Status:** In Development

## Overview

This document catalogs all reusable UI components extracted from the approved HTML card designs. These components form the design system for the Enhanced Activity Feed, ensuring visual consistency, code reusability, and maintainability across all 8 card types.

---

## Design Philosophy

### Core Principles
1. **Glassmorphism:** Semi-transparent panels with backdrop blur
2. **Mobile-First:** Optimized for touch interactions and small screens
3. **Accessibility:** WCAG 2.1 AA compliant
4. **Performance:** Lightweight, hardware-accelerated animations
5. **Consistency:** Shared design tokens across all components

### Design Tokens

```typescript
// /styles/tokens.ts

export const tokens = {
  // Colors
  colors: {
    // Primary Gradient
    gradientPink: '#e94d88',
    gradientOrange: '#f27121',

    // Accent Colors
    accentPink: '#FF3B5C',     // Likes, love ratings
    accentBlue: '#3B82F6',     // Like ratings
    accentPurple: '#A855F7',   // Recommendations
    accentGold: '#FFD700',     // Top 3
    accentYellow: '#FFC107',   // Follow suggestions
    accentGreen: '#34D399',    // Success states

    // Neutrals
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.85)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',

    // Backgrounds (Glassmorphism)
    glassLight: 'rgba(255, 255, 255, 0.1)',
    glassMedium: 'rgba(255, 255, 255, 0.15)',
    glassHeavy: 'rgba(255, 255, 255, 0.2)',
    glassDark: 'rgba(20, 20, 20, 0.95)',

    // Borders
    borderLight: 'rgba(255, 255, 255, 0.2)',
    borderMedium: 'rgba(255, 255, 255, 0.3)',

    // Overlays
    overlayDark: 'rgba(0, 0, 0, 0.4)',
    overlayBlack: 'rgba(0, 0, 0, 0.7)',
  },

  // Spacing (4px base unit)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },

  // Typography
  fontSize: {
    tiny: '11px',
    small: '12px',
    body: '13px',
    base: '14px',
    medium: '16px',
    large: '18px',
    title: '22px',
    display: '32px',
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Border Radius
  borderRadius: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Animations
  animation: {
    fast: '150ms',
    base: '300ms',
    slow: '600ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
```

---

## Layout Components

### 1. Card Container

**Purpose:** Wrapper for all feed cards with consistent dimensions and snap behavior.

**Usage:**
```tsx
<CardContainer>
  <Card type="activity" data={cardData} />
</CardContainer>
```

**Props:**
```typescript
interface CardContainerProps {
  children: React.ReactNode;
  cardIndex?: number;
  onVisible?: () => void; // Callback when card enters viewport
}
```

**Styles:**
```css
.card-container {
  width: 398px;
  max-width: calc(100vw - 40px);
  height: 645px;
  max-height: 80vh;
  margin: 0 auto 20px;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  position: relative;
}

@media (max-width: 430px) {
  .card-container {
    max-width: calc(100vw - 20px);
  }
}

@media (max-height: 700px) {
  .card-container {
    scroll-snap-align: start;
  }
}
```

---

### 2. Card Front Layout

**Purpose:** Shared front-side structure for Cards 1-6 (show cards).

**Usage:**
```tsx
<CardFront
  posterUrl={media.backdrop_path}
  badge={<Badge type="recommendation" text="Because You Liked Breaking Bad" />}
  userHeader={user && <UserHeader user={user} timestamp={created_at} />}
  title={media.title}
  metadata={`${media.release_date.slice(0,4)} • ${media.genres[0]} • ⭐ ${media.vote_average}`}
  friendAvatars={<FriendAvatars friends={friends} count={friends_count} />}
  sideActions={<SideActions onLike={} onAdd={} onComment={} />}
  commentsTab={showComments && <CommentsTab comments={} onPost={} />}
  onFlip={() => setIsFlipped(true)}
/>
```

**Structure:**
```
┌─────────────────────────────┐
│ [MenuButton - onFlip]       │
│                             │
│  <PosterBackground />       │
│  <GradientOverlay />        │
│                             │
├─────────────────────────────┤
│ <GlassmorphicPanel>         │
│   {badge}                   │
│   {userHeader}              │
│   <ShowTitle>{title}        │
│   <Metadata>{metadata}      │
│   {friendAvatars}           │
│ </GlassmorphicPanel>        │
│                   {actions} │
└─────────────────────────────┘
```

---

### 3. Card Back Layout

**Purpose:** Shared back-side structure for all show cards.

**Usage:**
```tsx
<CardBack
  title={media.title}
  metadata={metadata}
  badges={<BadgePills season={3} type="TV" network="HBO" trailerUrl={} />}
  synopsis={media.overview}
  infoGrid={<InfoGrid creator={} genre={} />}
  cast={media.cast}
  friendsWatching={<FriendsWatchingSection friends={} />}
  friendsRatings={<FriendsRatingsSection ratings={} />}
  showComments={<ShowCommentsSection comments={} onPost={} />}
  similarShows={media.similar}
  onClose={() => setIsFlipped(false)}
  variant="standard" // or "coming_soon" for Card 4
/>
```

**Scrollable:** Yes (overflow-y: scroll)

---

## Glassmorphic Components

### 4. GlassmorphicPanel

**Purpose:** Semi-transparent panel with backdrop blur, used throughout cards.

**Variants:**
- `light` - rgba(255, 255, 255, 0.1)
- `medium` - rgba(255, 255, 255, 0.15)
- `heavy` - rgba(255, 255, 255, 0.2)
- `dark` - rgba(20, 20, 20, 0.95)

**Usage:**
```tsx
<GlassmorphicPanel variant="light" blur={20} border={true}>
  Content goes here
</GlassmorphicPanel>
```

**Props:**
```typescript
interface GlassmorphicPanelProps {
  variant: 'light' | 'medium' | 'heavy' | 'dark';
  blur?: number; // Backdrop blur in px (default: 20)
  border?: boolean; // Show 1.5px white border (default: true)
  borderRadius?: keyof typeof tokens.borderRadius;
  padding?: keyof typeof tokens.spacing;
  children: React.ReactNode;
  className?: string;
}
```

**Implementation:**
```tsx
export const GlassmorphicPanel: React.FC<GlassmorphicPanelProps> = ({
  variant,
  blur = 20,
  border = true,
  borderRadius = 'lg',
  padding = 'xl',
  children,
  className,
}) => {
  const backgrounds = {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(20, 20, 20, 0.95)',
  };

  return (
    <div
      className={className}
      style={{
        background: backgrounds[variant],
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: border ? '1.5px solid rgba(255, 255, 255, 0.2)' : 'none',
        borderRadius: tokens.borderRadius[borderRadius],
        padding: tokens.spacing[padding],
      }}
    >
      {children}
    </div>
  );
};
```

---

### 5. GradientOverlay

**Purpose:** Overlay for poster backgrounds to ensure text readability.

**Usage:**
```tsx
<PosterBackground url={posterUrl}>
  <GradientOverlay direction="bottom" />
</PosterBackground>
```

**Props:**
```typescript
interface GradientOverlayProps {
  direction: 'bottom' | 'top' | 'both';
  intensity?: 'light' | 'medium' | 'heavy';
}
```

**Presets:**
```css
/* Bottom (most common) */
.gradient-overlay-bottom {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
}

/* Top */
.gradient-overlay-top {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
}

/* Both (vignette) */
.gradient-overlay-both {
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}
```

---

## Badge Components

### 6. BadgePill

**Purpose:** Colored pill badges for categories, badges, tags.

**Usage:**
```tsx
<BadgePill variant="recommendation" icon="sparkles">
  Because You Liked Breaking Bad
</BadgePill>

<BadgePill variant="season">S3</BadgePill>
<BadgePill variant="type">TV</BadgePill>
<BadgePill variant="network">HBO</BadgePill>
```

**Props:**
```typescript
interface BadgePillProps {
  variant: 'recommendation' | 'social' | 'release' | 'top3' | 'season' | 'type' | 'network' | 'trailer';
  icon?: string; // Icon name from sprite
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Variants:**
```typescript
const badgeStyles = {
  // Card type badges (large, with gradients)
  recommendation: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(139, 92, 246, 0.25))',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    padding: '8px 14px',
    fontSize: '13px',
  },
  social: {
    background: 'linear-gradient(135deg, rgba(255, 59, 92, 0.25), rgba(251, 113, 133, 0.25))',
    border: '1px solid rgba(255, 59, 92, 0.4)',
    padding: '8px 14px',
    fontSize: '13px',
  },
  release: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(139, 92, 246, 0.25))',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    padding: '8px 14px',
    fontSize: '13px',
  },
  top3: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.3))',
    border: '1px solid rgba(255, 215, 0, 0.5)',
    padding: '8px 14px',
    fontSize: '13px',
  },

  // Metadata badges (small, subtle)
  season: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 12px',
    fontSize: '12px',
  },
  type: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 12px',
    fontSize: '12px',
  },
  network: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '6px 12px',
    fontSize: '12px',
  },
  trailer: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};
```

---

### 7. ActivityBubble

**Purpose:** Visual indicators for user actions (ratings, status changes).

**Usage:**
```tsx
<ActivityBubble type="rating" value="loved" />
<ActivityBubble type="status" value="currently watching" />
```

**Props:**
```typescript
interface ActivityBubbleProps {
  type: 'rating' | 'status';
  value: 'loved' | 'liked' | 'meh' | 'want to watch' | 'currently watching' | 'watched';
}
```

**Styles:**
```tsx
const bubbleStyles = {
  rating: {
    loved: {
      background: 'linear-gradient(135deg, rgba(255, 59, 92, 0.3), rgba(251, 113, 133, 0.3))',
      border: '1.5px solid rgba(255, 59, 92, 0.5)',
      icon: 'heart',
      text: 'loved',
    },
    liked: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.3))',
      border: '1.5px solid rgba(59, 130, 246, 0.5)',
      icon: 'thumbs-up',
      text: 'liked',
    },
    meh: {
      background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.3), rgba(209, 213, 219, 0.3))',
      border: '1.5px solid rgba(156, 163, 175, 0.5)',
      icon: 'meh-face',
      text: 'meh',
    },
  },
  status: {
    'want to watch': {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1.5px solid rgba(255, 255, 255, 0.25)',
      icon: 'bookmark',
      text: 'want to watch',
    },
    'currently watching': {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1.5px solid rgba(255, 255, 255, 0.25)',
      icon: 'play',
      text: 'currently watching',
    },
    'watched': {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1.5px solid rgba(255, 255, 255, 0.25)',
      icon: 'check',
      text: 'watched',
    },
  },
};
```

**Layout:**
```css
.activity-bubble {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.activity-bubble-icon {
  width: 14px;
  height: 14px;
}
```

---

## Action Button Components

### 8. CircularActionButton

**Purpose:** Circular glassmorphic buttons for side actions and card corners.

**Usage:**
```tsx
<CircularActionButton
  icon="heart"
  size="md"
  active={isLiked}
  count={likeCount}
  onClick={handleLike}
  ariaLabel="Like this activity"
/>
```

**Props:**
```typescript
interface CircularActionButtonProps {
  icon: string; // Icon name from sprite
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  count?: number; // Optional badge count
  onClick?: () => void;
  ariaLabel: string;
  disabled?: boolean;
}
```

**Sizes:**
```typescript
const sizes = {
  sm: { button: '36px', icon: '20px' },
  md: { button: '40px', icon: '24px' },
  lg: { button: '48px', icon: '28px' },
};
```

**States:**
```css
/* Default */
.circular-action-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(60, 60, 60, 0.4);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Hover */
.circular-action-button:hover {
  background: rgba(60, 60, 60, 0.6);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Active (liked, etc.) */
.circular-action-button.active {
  background: rgba(255, 59, 92, 0.2);
  border-color: #FF3B5C;
}

/* Disabled */
.circular-action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Badge Count:**
```tsx
{count && count > 0 && (
  <span className="action-button-badge">
    {count > 99 ? '99+' : count}
  </span>
)}
```

```css
.action-button-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #e94d88, #f27121);
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #000;
}
```

---

### 9. PrimaryActionButton

**Purpose:** Larger, prominent buttons for primary actions (Follow, Watch Now, etc.).

**Usage:**
```tsx
<PrimaryActionButton
  variant="primary"
  size="md"
  onClick={handleFollow}
  loading={isLoading}
>
  FOLLOW
</PrimaryActionButton>

<PrimaryActionButton variant="secondary" active={true}>
  FOLLOWING
</PrimaryActionButton>
```

**Props:**
```typescript
interface PrimaryActionButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}
```

**Variants:**
```css
/* Primary (pink gradient) */
.button-primary {
  background: linear-gradient(135deg, #e94d88, #f27121);
  color: white;
  border: none;
}

/* Secondary (bordered, transparent) */
.button-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
}

/* Success */
.button-success {
  background: rgba(52, 211, 153, 0.2);
  color: #34D399;
  border: 1.5px solid #34D399;
}

/* Danger */
.button-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
  border: 1.5px solid #EF4444;
}
```

**Sizes:**
```css
.button-sm { padding: 8px 16px; font-size: 12px; }
.button-md { padding: 10px 20px; font-size: 14px; }
.button-lg { padding: 12px 24px; font-size: 16px; }
```

---

## Avatar Components

### 10. Avatar

**Purpose:** Circular profile images with fallback initials.

**Usage:**
```tsx
<Avatar
  src={user.avatar_url}
  alt={user.display_name}
  size="md"
  border={true}
  fallback={user.display_name.slice(0,2)}
/>
```

**Props:**
```typescript
interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  borderColor?: string;
  fallback?: string; // Initials
  onClick?: () => void;
}
```

**Sizes:**
```typescript
const avatarSizes = {
  xs: '24px',
  sm: '28px',
  md: '36px',
  lg: '48px',
  xl: '90px', // Card 7 only
};
```

**Implementation:**
```tsx
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  border = false,
  borderColor = '#fff',
  fallback,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="avatar"
      style={{
        width: avatarSizes[size],
        height: avatarSizes[size],
        borderRadius: '50%',
        border: border ? `1.5px solid ${borderColor}` : 'none',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="avatar-fallback">
          {fallback || alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
};
```

---

### 11. AvatarStack

**Purpose:** Overlapping avatars to show multiple users compactly.

**Usage:**
```tsx
<AvatarStack
  users={[
    { id: '1', avatar_url: '...', display_name: 'Sarah' },
    { id: '2', avatar_url: '...', display_name: 'Mike' },
    { id: '3', avatar_url: '...', display_name: 'Jamie' },
  ]}
  max={3}
  size="sm"
  onClick={() => showFullList()}
/>
```

**Props:**
```typescript
interface AvatarStackProps {
  users: Array<{
    id: string;
    avatar_url: string | null;
    display_name: string;
  }>;
  max?: number; // Max avatars to show (default: 3)
  size?: 'xs' | 'sm' | 'md';
  onClick?: () => void;
}
```

**Layout:**
```css
.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar-stack .avatar {
  margin-left: -6px; /* Overlap */
  border: 1.5px solid #000; /* Separation */
}

.avatar-stack .avatar:first-child {
  margin-left: 0;
}

.avatar-stack-more {
  margin-left: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 1.5px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}
```

**"+N" Indicator:**
```tsx
{users.length > max && (
  <div className="avatar-stack-more">
    +{users.length - max}
  </div>
)}
```

---

## Content Components

### 12. UserHeader

**Purpose:** User attribution header for activity cards (Cards 1, 6).

**Usage:**
```tsx
<UserHeader
  user={{
    avatar_url: '...',
    display_name: 'Sarah Miller',
    username: 'sarahm',
  }}
  timestamp="2024-01-25T14:30:00Z"
  onClick={() => navigateToProfile()}
/>
```

**Layout:**
```
┌────────────────────────────────┐
│ [Avatar] Sarah Miller          │
│          2 hours ago           │
└────────────────────────────────┘
```

**Implementation:**
```tsx
export const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  timestamp,
  onClick,
}) => {
  const timeAgo = formatTimeAgo(timestamp);

  return (
    <div className="user-header" onClick={onClick}>
      <Avatar
        src={user.avatar_url}
        alt={user.display_name}
        size="sm"
        border={true}
      />
      <div className="user-header-text">
        <div className="user-header-name">{user.display_name}</div>
        <div className="user-header-time">{timeAgo}</div>
      </div>
    </div>
  );
};
```

**Styles:**
```css
.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}

.user-header-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.user-header-time {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}
```

---

### 13. ShowTitle

**Purpose:** Show/movie title with consistent styling.

**Usage:**
```tsx
<ShowTitle
  title="The Bear - Season 3"
  size="md" // or "lg" for card back
/>
```

**Sizes:**
```css
/* Front (md) */
.show-title-md {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}

/* Back (lg) */
.show-title-lg {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}
```

---

### 14. Metadata

**Purpose:** Show metadata row (year, genre, rating).

**Usage:**
```tsx
<Metadata
  items={[
    '2024',
    'Drama',
    '⭐ 8.7',
  ]}
/>
```

**Layout:**
```
2024 • Drama • ⭐ 8.7
```

**Implementation:**
```tsx
export const Metadata: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <div className="metadata">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span>{item}</span>
          {i < items.length - 1 && <span className="metadata-dot">•</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
```

**Styles:**
```css
.metadata {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.metadata-dot {
  opacity: 0.5;
  font-size: 8px;
}
```

---

### 15. Synopsis

**Purpose:** Expandable show description.

**Usage:**
```tsx
<Synopsis
  text={media.overview}
  maxLines={3}
  onToggle={(expanded) => trackEvent('synopsis_toggled', { expanded })}
/>
```

**Props:**
```typescript
interface SynopsisProps {
  text: string;
  maxLines?: number; // Lines before truncation (default: 3)
  onToggle?: (expanded: boolean) => void;
}
```

**States:**
```tsx
const [isExpanded, setIsExpanded] = useState(false);

// Collapsed: Show first 3 lines + "Read more"
// Expanded: Show full text + "Show less"
```

**Styles:**
```css
.synopsis {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

.synopsis.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.synopsis-toggle {
  color: #FF3B5C;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  display: inline-block;
}
```

---

## Social Components

### 16. FriendAvatarsRow

**Purpose:** Show friend avatars with count text.

**Usage:**
```tsx
<FriendAvatarsRow
  friends={friendsWhoWatched.slice(0, 3)}
  totalCount={friendsWhoWatched.length}
  text="friends watched this"
  onClick={() => showFullList()}
/>
```

**Layout:**
```
[👤👤👤] 12 friends watched this
```

**Implementation:**
```tsx
export const FriendAvatarsRow: React.FC<FriendAvatarsRowProps> = ({
  friends,
  totalCount,
  text,
  onClick,
}) => {
  return (
    <div className="friend-avatars-row" onClick={onClick}>
      <AvatarStack users={friends} max={3} size="xs" />
      <span className="friend-avatars-text">
        {totalCount} {text}
      </span>
    </div>
  );
};
```

**Styles:**
```css
.friend-avatars-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: opacity 0.2s;
}

.friend-avatars-row:hover {
  opacity: 0.8;
}
```

---

### 17. FriendsWatchingSection

**Purpose:** Expandable categories showing friends by watchlist status.

**Usage:**
```tsx
<FriendsWatchingSection
  categories={[
    {
      status: 'watching',
      icon: 'play',
      label: 'friends watching',
      friends: [...],
      count: 8,
    },
    {
      status: 'want',
      icon: 'bookmark',
      label: 'friends want to watch',
      friends: [...],
      count: 12,
    },
    {
      status: 'watched',
      icon: 'check',
      label: 'friends watched',
      friends: [...],
      count: 42,
    },
  ]}
  onCategoryClick={(status, friends) => showModal(friends)}
/>
```

**Layout (Collapsed):**
```
┌─────────────────────────────────┐
│ [👤👤👤] 8 friends watching    │ ← Clickable
├─────────────────────────────────┤
│ [👤👤👤] 12 friends want       │
├─────────────────────────────────┤
│ [👤👤👤] 42 friends watched    │
└─────────────────────────────────┘
```

**Styles:**
```css
.friends-watching-category {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.friends-watching-category:hover {
  background: rgba(255, 255, 255, 0.08);
}
```

---

### 18. FriendsRatingsSection

**Purpose:** Show friend ratings distribution with interactive icons.

**Usage:**
```tsx
<FriendsRatingsSection
  ratings={{
    meh: { count: 5, users: ['...'] },
    like: { count: 23, users: ['...'] },
    love: { count: 48, users: ['...'] },
  }}
  userRating="love" // Current user's rating (highlighted)
  onRatingClick={(rating) => showFriendsWhoRated(rating)}
  onSetRating={(rating) => rateShow(rating)}
/>
```

**Layout:**
```
┌───────────────────────────────────────┐
│  [😐]      [👍]      [❤️]            │
│   5         23        48              │
│  Meh       Like      Love            │
└───────────────────────────────────────┘
```

**Active State:** User's rating has pink border

**Implementation:**
```tsx
export const FriendsRatingsSection: React.FC<Props> = ({
  ratings,
  userRating,
  onRatingClick,
  onSetRating,
}) => {
  const ratingTypes = [
    { key: 'meh', icon: 'meh-face', label: 'Meh' },
    { key: 'like', icon: 'thumbs-up', label: 'Like' },
    { key: 'love', icon: 'heart', label: 'Love' },
  ];

  return (
    <div className="friends-ratings-section">
      {ratingTypes.map(({ key, icon, label }) => (
        <div
          key={key}
          className={`rating-column ${userRating === key ? 'active' : ''}`}
          onClick={() => onRatingClick(key)}
        >
          <div className="rating-icon-wrapper">
            <Icon name={icon} size={24} />
            {ratings[key].count > 0 && (
              <span className="rating-badge">{ratings[key].count}</span>
            )}
          </div>
          <div className="rating-label">{label}</div>
        </div>
      ))}
    </div>
  );
};
```

**Styles:**
```css
.friends-ratings-section {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  gap: 16px;
}

.rating-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.rating-column:hover {
  transform: scale(1.05);
}

.rating-column.active .rating-icon-wrapper {
  border: 2px solid #FF3B5C;
}

.rating-icon-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
}

.rating-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #e94d88, #f27121);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}
```

---

## Comment Components

### 19. CommentInput

**Purpose:** Text input for posting comments with 280-char limit.

**Usage:**
```tsx
<CommentInput
  placeholder="Comment on this show..."
  maxLength={280}
  value={commentText}
  onChange={setCommentText}
  onSubmit={handlePostComment}
  loading={isPosting}
/>
```

**Layout:**
```
┌─────────────────────────────────┐
│ Comment on this show...         │
│                                 │
│                         145/280 │ ← Character counter
│                    [Post] ────> │ ← Submit button
└─────────────────────────────────┘
```

**Features:**
- Real-time character count
- Warning color at 260+ characters
- Disable submit if empty or over limit
- Loading state during submission

**Implementation:**
```tsx
export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder,
  maxLength = 280,
  value,
  onChange,
  onSubmit,
  loading,
}) => {
  const isNearLimit = value.length >= 260;
  const isOverLimit = value.length > maxLength;

  return (
    <div className="comment-input-container">
      <textarea
        className="comment-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={3}
      />
      <div className="comment-input-footer">
        <span className={`char-count ${isNearLimit ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
          {value.length}/{maxLength}
        </span>
        <button
          className="comment-submit-button"
          onClick={onSubmit}
          disabled={!value.trim() || isOverLimit || loading}
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
};
```

**Styles:**
```css
.comment-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 60px;
}

.comment-input:focus {
  outline: none;
  border-color: #FF3B5C;
  background: rgba(255, 255, 255, 0.08);
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.char-count.warning {
  color: #FFC107;
}

.char-count.error {
  color: #EF4444;
}
```

---

### 20. CommentCard

**Purpose:** Individual comment display with like button.

**Usage:**
```tsx
<CommentCard
  comment={{
    id: '123',
    user: { display_name: 'Sarah', avatar_url: '...' },
    comment_text: 'This show is amazing!',
    created_at: '2024-01-25T14:30:00Z',
    like_count: 15,
    user_liked: true,
  }}
  onLike={handleLikeComment}
  onUserClick={() => navigateToProfile()}
/>
```

**Layout:**
```
┌─────────────────────────────────┐
│ [Avatar] Sarah Miller           │
│          2 hours ago            │
│                                 │
│ This show is amazing!           │
│                                 │
│                    [❤️ 15] ───> │ ← Like button + count
└─────────────────────────────────┘
```

**Implementation:**
```tsx
export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onLike,
  onUserClick,
}) => {
  return (
    <div className="comment-card">
      <div className="comment-header">
        <Avatar
          src={comment.user.avatar_url}
          alt={comment.user.display_name}
          size="sm"
          onClick={onUserClick}
        />
        <div className="comment-header-text">
          <div className="comment-user-name" onClick={onUserClick}>
            {comment.user.display_name}
          </div>
          <div className="comment-timestamp">
            {formatTimeAgo(comment.created_at)}
          </div>
        </div>
      </div>
      <div className="comment-text">{comment.comment_text}</div>
      <div className="comment-actions">
        <button
          className={`comment-like-button ${comment.user_liked ? 'liked' : ''}`}
          onClick={() => onLike(comment.id)}
        >
          <Icon name="heart" size={16} state={comment.user_liked ? 'active' : 'default'} />
          {comment.like_count > 0 && (
            <span className="comment-like-count">{comment.like_count}</span>
          )}
        </button>
      </div>
    </div>
  );
};
```

**Styles:**
```css
.comment-card {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin: 8px 0;
  word-wrap: break-word;
}

.comment-like-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-like-button.liked {
  background: rgba(255, 59, 92, 0.15);
  border-color: #FF3B5C;
  color: #FF3B5C;
}
```

---

### 21. CommentsTab

**Purpose:** Slide-up panel for activity comments (Cards 1, 6).

**Usage:**
```tsx
<CommentsTab
  visible={showComments}
  comments={activityComments}
  onClose={() => setShowComments(false)}
  onPostComment={handlePostComment}
  onLikeComment={handleLikeComment}
/>
```

**Behavior:**
- Slides up from bottom
- Semi-transparent dark background with blur
- Max height: 70% of card
- Scrollable comments list
- Input at bottom

**Styles:**
```css
.comments-tab {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70%;
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  transform: translateY(100%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
}

.comments-tab.visible {
  transform: translateY(0);
  opacity: 1;
}

.comments-tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Specialized Components

### 22. QuickActionModal

**Purpose:** Modal for rating/adding show to watchlist.

**Usage:**
```tsx
<QuickActionModal
  visible={showModal}
  media={mediaData}
  userRating={currentRating}
  userStatus={currentStatus}
  onRate={handleRate}
  onStatusChange={handleStatusChange}
  onClose={() => setShowModal(false)}
/>
```

**Layout:**
```
┌─────────────────────────────────┐
│         [Close X]               │
│                                 │
│    [Poster]                     │
│    The Bear - Season 3          │
│                                 │
│ ─────── RATE ───────            │
│  [😐]  [👍]  [❤️]              │
│  Meh   Like  Love               │
│                                 │
│ ─── ADD TO WATCHLIST ───        │
│  [🔖]     [▶]      [✓]         │
│  Want  Watching  Watched        │
└─────────────────────────────────┘
```

**Grid Layout:** 3×2 grid of circular action buttons

---

### 23. SimilarShowsCarousel

**Purpose:** Horizontal scrolling carousel of show posters.

**Usage:**
```tsx
<SimilarShowsCarousel
  shows={similarShows}
  onShowClick={(showId) => openMediaDetail(showId)}
/>
```

**Layout:**
```
┌────────────────────────────────────────┐
│ [Poster] [Poster] [Poster] [Poster] → │
│  Show 1   Show 2   Show 3   Show 4    │
└────────────────────────────────────────┘
```

**Card Size:** 100×150px

**Styles:**
```css
.similar-shows-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 8px 0;
}

.similar-show-card {
  flex-shrink: 0;
  width: 100px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: transform 0.2s;
}

.similar-show-card:hover {
  transform: scale(1.05);
}

.similar-show-poster {
  width: 100px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
}

.similar-show-title {
  font-size: 12px;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

### 24. InfoGrid

**Purpose:** 2-column grid for show metadata (Creator, Genre, etc.).

**Usage:**
```tsx
<InfoGrid
  items={[
    { label: 'CREATOR', value: 'Vince Gilligan' },
    { label: 'GENRE', value: 'Drama, Crime' },
    { label: 'DIRECTOR', value: 'Various' },
    { label: 'RUNTIME', value: '45 min' },
  ]}
/>
```

**Layout:**
```
CREATOR          GENRE
Vince Gilligan   Drama, Crime

DIRECTOR         RUNTIME
Various          45 min
```

**Styles:**
```css
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
  margin: 20px 0;
}

.info-grid-item-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.info-grid-item-value {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}
```

---

### 25. CastList

**Purpose:** Horizontal scrolling list of cast member pills.

**Usage:**
```tsx
<CastList
  cast={[
    { name: 'Bryan Cranston', character: 'Walter White' },
    { name: 'Aaron Paul', character: 'Jesse Pinkman' },
    // ...
  ]}
  onCastClick={(actor) => showActorDetail(actor)}
/>
```

**Pills:**
```css
.cast-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.cast-pill:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

### 26. MatchPercentage

**Purpose:** Large, prominent compatibility score (Card 7).

**Usage:**
```tsx
<MatchPercentage
  score={92}
  size="lg"
/>
```

**Layout:**
```
   92%
  Match
```

**Styles:**
```css
.match-percentage {
  text-align: center;
  padding: 12px 0;
}

.match-percentage-score {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #e94d88, #f27121);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.match-percentage-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

## Utility Components

### 27. LoadingSkeleton

**Purpose:** Placeholder for loading states.

**Usage:**
```tsx
<LoadingSkeleton variant="card" />
<LoadingSkeleton variant="text" width="60%" />
<LoadingSkeleton variant="avatar" size="md" />
```

**Animation:**
```css
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 400px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
```

---

### 28. ErrorState

**Purpose:** Error message display with retry option.

**Usage:**
```tsx
<ErrorState
  message="Unable to load feed. Please try again."
  onRetry={fetchFeed}
/>
```

---

### 29. EmptyState

**Purpose:** Empty state messaging.

**Usage:**
```tsx
<EmptyState
  icon="inbox"
  title="No comments yet"
  description="Be the first to comment on this show!"
/>
```

---

## Component Usage Matrix

| Component | Cards | Required | Optional |
|-----------|-------|----------|----------|
| CardContainer | All | ✅ | |
| CardFront | 1-6 | ✅ | |
| CardBack | 1-6 | ✅ | |
| GlassmorphicPanel | All | ✅ | |
| BadgePill | 2-6 | ✅ | |
| ActivityBubble | 1, 6 | ✅ | |
| CircularActionButton | 1-6 | ✅ | |
| PrimaryActionButton | 7 | ✅ | |
| Avatar | All | ✅ | |
| AvatarStack | 1-6 | ✅ | |
| UserHeader | 1, 6 | ✅ | |
| MatchPercentage | 7 | ✅ | |
| FriendsRatingsSection | 1-6 (back) | ✅ | |
| CommentInput | All | ✅ | |
| CommentCard | All | ✅ | |
| CommentsTab | 1, 6 | ✅ | |
| QuickActionModal | 1-6 | ✅ | |

---

## Next Steps

1. Review component designs with stakeholders
2. Build Storybook for all components
3. Create React component implementations
4. Write unit tests for each component
5. Build component usage documentation
6. Create design system Figma library (if needed)

---

**Related Documentation:**
- [Enhanced Feed Architecture](/docs/features/enhanced-feed-architecture.md)
- [Card Type Specifications](/docs/features/card-type-specifications.md)
- [Icon Sprite System](/docs/design/icon-sprite-system.md)

**Maintained by:** Design & Engineering Teams
**Last Review:** January 2025

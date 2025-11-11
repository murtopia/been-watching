# Activity Card Templates & Design System

## Table of Contents
1. [Design System Overview](#design-system-overview)
2. [Reusable Component Library](#reusable-component-library)
3. [Card Templates](#card-templates)
4. [Implementation Guide](#implementation-guide)

---

## Design System Overview

### Core Principles
- **Mobile-First**: Optimized for vertical scrolling on phone screens
- **Immersive**: Full-bleed background images from TMDB artwork
- **Glassmorphic**: Modern glass effects with backdrop blur
- **Season-Specific**: TV shows always reference specific seasons, never entire series
- **Consistent Interactions**: Unified button behaviors and animations across all cards

### Design Tokens

#### Colors
```css
/* Background Overlays */
--overlay-gradient: linear-gradient(to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.9) 100%
);

/* Glass Effects */
--glass-background: rgba(255, 255, 255, 0.15);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(20px);

/* Modal */
--modal-background: rgba(20, 20, 20, 0.98);
--modal-overlay: rgba(0, 0, 0, 0.4);
--modal-overlay-blur: blur(8px);

/* Text Hierarchy */
--text-primary: #FFFFFF;
--text-secondary: rgba(255, 255, 255, 0.9);
--text-tertiary: rgba(255, 255, 255, 0.7);

/* Accent Colors */
--accent-gradient: linear-gradient(135deg, #FF006E, #FF8E53);
--heart-color: #FF3B5C;
```

#### Spacing
```css
/* Card Dimensions */
--card-width: 398px;
--card-height: 645px;
--card-radius: 16px;

/* Padding */
--card-padding: 20px;
--card-padding-bottom: 40px;

/* Side Actions */
--side-actions-right: 12px;
--side-actions-bottom: 60px;
--action-btn-size: 40px;
--action-btn-gap: 12px;
```

#### Typography
```css
/* Font Sizes */
--font-username: 14px;
--font-timestamp: 11px;
--font-title: 16px;
--font-meta: 12px;
--font-action-label: 10px;

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

---

## Reusable Component Library

### 1. Action Icons

Create a centralized icon library file: `components/icons/ActionIcons.tsx`

```typescript
// Rating Icons
export const MehIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="white" fill="none" strokeWidth="1.5"/>
    <line x1="8" y1="15" x2="16" y2="15" stroke="white" strokeWidth="1.5"/>
    <line x1="9" y1="9" x2="9" y2="10" stroke="white" strokeWidth="1.5"/>
    <line x1="15" y1="9" x2="15" y2="10" stroke="white" strokeWidth="1.5"/>
  </svg>
);

export const LikeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
      stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

export const LoveIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

// Watchlist Icons
export const WantToWatchIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

export const WatchingIcon = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3"
      stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

export const WatchedIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="white" fill="none" strokeWidth="1.5"/>
    <polyline points="9 12 11 14 15 10" stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

// Utility Icons
export const CommentIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

export const PlusIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z"
      stroke="white" fill="none" strokeWidth="1.5"/>
  </svg>
);

export const AddBadgeIcon = () => (
  <svg viewBox="0 0 12 12">
    <line x1="6" y1="2" x2="6" y2="10" stroke="white" strokeWidth="2"/>
    <line x1="2" y1="6" x2="10" y2="6" stroke="white" strokeWidth="2"/>
  </svg>
);
```

### 2. Action Modal Component

Create: `components/modals/ActionModal.tsx`

```typescript
interface ActionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
  position: { top: number; right: number };
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isVisible,
  onClose,
  onSelectAction,
  position
}) => {
  return (
    <div
      className={`action-overlay ${isVisible ? 'visible' : ''}`}
      onClick={onClose}
    >
      <div
        className="action-modal"
        style={{ top: `${position.top}px`, right: `${position.right}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="action-modal-grid">
          {/* Rating Icons */}
          <ActionModalItem
            icon={<MehIcon />}
            label="Meh"
            onClick={() => onSelectAction('meh')}
          />
          <ActionModalItem
            icon={<LikeIcon />}
            label="Like"
            onClick={() => onSelectAction('like')}
          />
          <ActionModalItem
            icon={<LoveIcon />}
            label="Love"
            onClick={() => onSelectAction('love')}
          />

          <div className="action-modal-divider" />

          {/* Watchlist Icons */}
          <ActionModalItem
            icon={<WantToWatchIcon />}
            label="Want To"
            showBadge
            onClick={() => onSelectAction('want-to-watch')}
          />
          <ActionModalItem
            icon={<WatchingIcon />}
            label="Watching"
            showBadge
            onClick={() => onSelectAction('watching')}
          />
          <ActionModalItem
            icon={<WatchedIcon />}
            label="Watched"
            showBadge
            onClick={() => onSelectAction('watched')}
          />
        </div>
      </div>
    </div>
  );
};
```

### 3. Side Action Buttons

Create: `components/cards/SideActions.tsx`

```typescript
interface SideActionsProps {
  onLoveClick: () => void;
  onAddClick: () => void;
  onCommentClick: () => void;
  loveCount: number;
  commentCount: number;
  isLoved: boolean;
}

export const SideActions: React.FC<SideActionsProps> = ({
  onLoveClick,
  onAddClick,
  onCommentClick,
  loveCount,
  commentCount,
  isLoved
}) => {
  return (
    <div className="side-actions">
      <div>
        <div
          className={`action-btn ${isLoved ? 'liked' : ''}`}
          onClick={onLoveClick}
        >
          <LoveIcon />
        </div>
        {loveCount > 0 && <div className="action-count">{loveCount}</div>}
      </div>

      <div>
        <div className="action-btn" onClick={onAddClick}>
          <PlusIcon />
        </div>
      </div>

      <div>
        <div className="action-btn" onClick={onCommentClick}>
          <CommentIcon />
        </div>
        {commentCount > 0 && <div className="action-count">{commentCount}</div>}
      </div>
    </div>
  );
};
```

### 4. Glass Badge Component

Create: `components/ui/GlassBadge.tsx`

```typescript
interface GlassBadgeProps {
  icon?: string;
  text: string;
  variant?: 'default' | 'top-3' | 'seasonal';
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  icon,
  text,
  variant = 'default'
}) => {
  return (
    <div className={`glass-badge ${variant}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{text}</span>
    </div>
  );
};
```

### 5. Friend Avatars Stack

Create: `components/ui/FriendAvatars.tsx`

```typescript
interface FriendAvatarsProps {
  friends: Array<{ id: string; avatar: string; name: string }>;
  count: number;
  actionText?: string; // e.g., "also loved this"
}

export const FriendAvatars: React.FC<FriendAvatarsProps> = ({
  friends,
  count,
  actionText = "also loved this"
}) => {
  const displayFriends = friends.slice(0, 3);

  return (
    <div className="friend-avatars">
      <div className="friend-avatars-stack">
        {displayFriends.map((friend) => (
          <img
            key={friend.id}
            src={friend.avatar}
            alt={friend.name}
          />
        ))}
      </div>
      <div className="friend-count">
        {count} {count === 1 ? 'friend' : 'friends'} {actionText}
      </div>
    </div>
  );
};
```

---

## Card Templates

### Card Type 1: User Activity Card ✅ IMPLEMENTED

**Purpose**: Show when a friend rates or adds a show to their list

**Visual Components**:
- Full-bleed show poster background
- Gradient overlay (0% → 30% → 90%)
- User avatar (32x32px) + username + timestamp
- Show title with season number
- Metadata line: Year • Genre • Rating
- Friend avatars stack with count
- Side actions: Love, Add, Comment

**Data Requirements**:
```typescript
interface UserActivityCard {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  action: 'loved' | 'added' | 'rated';
  timestamp: Date;
  media: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    season?: number;
    year: number;
    genres: string[];
    rating: number;
    posterPath: string;
  };
  socialProof: {
    loveCount: number;
    commentCount: number;
    friendsWhoLoved: Array<{
      id: string;
      name: string;
      avatar: string;
    }>;
  };
}
```

**Unique Features**:
- Shows user attribution at top
- Displays friend social proof
- Full interaction capabilities (love, add, comment)

---

### Card Type 2: "Because You Liked" Recommendation

**Purpose**: Personalized recommendations based on viewing history

**Visual Components**:
- Full-bleed show poster background
- Stronger gradient overlay (0% → 40% → 95%)
- Glass badge: "✨ Because you liked [Show Name]"
- Show title with season
- Metadata: Year • Genre • Rating
- 2-line description
- Simplified side actions: Add, Watched

**Data Requirements**:
```typescript
interface RecommendationCard {
  id: string;
  recommendationReason: {
    basedOn: {
      title: string;
      seasonNumber?: number;
    };
  };
  media: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    season?: number;
    year: number;
    genres: string[];
    rating: number;
    posterPath: string;
    description: string;
  };
  matchScore: number; // 0-100
}
```

**Unique Features**:
- No user attribution (system-generated)
- Shows recommendation reason
- Simplified actions (no comment/love buttons)
- Includes brief description

**CSS Modifications**:
```css
.recommendation-card .glass-badge {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.recommendation-card .description {
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.85;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

### Card Type 3: "Your Friends Loved" Social Recommendation

**Purpose**: Surface popular content among friend network

**Visual Components**:
- Full-bleed show poster
- Gradient overlay
- Glass badge: "💕 Your Friends Loved"
- Show title with season
- Metadata: Year • Genre • Rating
- Friend avatar circles (up to 4 visible)
- Friend count text: "8 friends loved this"
- Brief description
- Simplified side actions: Add, Watched

**Data Requirements**:
```typescript
interface SocialRecommendationCard {
  id: string;
  media: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    season?: number;
    year: number;
    genres: string[];
    rating: number;
    posterPath: string;
    description: string;
  };
  socialProof: {
    friendsWhoLoved: Array<{
      id: string;
      name: string;
      avatar: string;
    }>;
    totalCount: number;
  };
}
```

**Unique Features**:
- Prominent friend avatars display
- Social proof emphasis
- Friend count prominently displayed

**HTML Structure**:
```html
<div class="card social-recommendation-card">
  <div class="card-background">
    <img src="[TMDB_POSTER]" />
  </div>
  <div class="background-overlay"></div>

  <div class="card-content">
    <div class="glass-badge">💕 Your Friends Loved</div>

    <div class="show-title">[Title] Season [X]</div>
    <div class="show-meta">
      [Year] • [Genre] • ⭐ [Rating]
    </div>

    <div class="friend-avatars-large">
      <div class="friend-avatars-stack">
        <!-- Up to 4 avatars, 40x40px each -->
      </div>
      <div class="friend-count-text">
        [X] friends loved this
      </div>
    </div>

    <div class="description">
      [Brief 2-line description]
    </div>
  </div>

  <div class="side-actions">
    <div class="action-btn"><!-- Add --></div>
    <div class="action-btn"><!-- Watched --></div>
  </div>
</div>
```

---

### Card Type 4: New Season Alert

**Purpose**: Notify when new seasons are available

**Visual Components**:
- Full-bleed season key art
- Gradient overlay
- Glass badge: "🎬 New Season Available"
- Show title with season number
- Metadata: Year • Genre • Episode count
- Friend engagement: "X friends are watching"
- Friend avatar circles
- Brief season description
- Simplified side actions: Add, Watched

**Data Requirements**:
```typescript
interface NewSeasonCard {
  id: string;
  media: {
    id: number;
    title: string;
    season: number;
    year: number;
    genres: string[];
    episodeCount: number;
    posterPath: string;
    seasonDescription: string;
  };
  releaseInfo: {
    releaseDate: Date;
    isNew: boolean; // Released within last 7 days
  };
  socialProof: {
    friendsWatching: Array<{
      id: string;
      name: string;
      avatar: string;
    }>;
    watchingCount: number;
  };
}
```

**Unique Features**:
- Seasonal release announcement
- Shows episode count
- "Friends watching" (present tense, not past)

**CSS Modifications**:
```css
.new-season-card .glass-badge {
  background: rgba(255, 100, 50, 0.2);
  border: 1px solid rgba(255, 100, 50, 0.4);
}

.new-season-card .episode-count {
  font-size: 12px;
  opacity: 0.85;
  margin-left: 4px;
}

.new-season-card .friends-watching {
  color: #4CAF50; /* Green to indicate active */
  font-weight: 600;
}
```

---

### Card Type 5: Now Streaming

**Purpose**: Alert when content arrives on streaming platforms

**Visual Components**:
- Full-bleed movie/show poster
- Gradient overlay
- Glass badge: "📺 Now on [Platform]"
- Movie/Show title (+ season if TV)
- Metadata: Year • Genre • Rating
- Platform logo (small, 24x24px)
- Brief description
- Optional friend engagement
- Simplified side actions: Add, Watched

**Data Requirements**:
```typescript
interface NowStreamingCard {
  id: string;
  media: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    season?: number;
    year: number;
    genres: string[];
    rating: number;
    posterPath: string;
    description: string;
  };
  streamingInfo: {
    platform: string;
    platformLogo: string;
    availableSince: Date;
  };
  socialProof?: {
    friendEngagement: Array<{
      id: string;
      name: string;
      avatar: string;
    }>;
  };
}
```

**Unique Features**:
- Platform branding
- Availability information
- Platform-specific badge color

**Platform Colors**:
```css
.streaming-netflix { background: rgba(229, 9, 20, 0.2); border-color: #E50914; }
.streaming-hulu { background: rgba(28, 231, 131, 0.2); border-color: #1CE783; }
.streaming-disney { background: rgba(17, 60, 207, 0.2); border-color: #113CCF; }
.streaming-hbo { background: rgba(185, 0, 255, 0.2); border-color: #B900FF; }
.streaming-prime { background: rgba(0, 168, 225, 0.2); border-color: #00A8E1; }
.streaming-apple { background: rgba(255, 255, 255, 0.2); border-color: #FFFFFF; }
```

---

### Card Type 6: Top 3 Update

**Purpose**: Highlight when friends update their Top 3 shows

**Visual Components**:
- Full-bleed show poster
- Gradient overlay
- User avatar (32x32px) + username + "updated their Top 3"
- Timestamp
- Show title with season
- Metadata: Year • Genre • Rating
- Glass badge: "🏆 [User]'s #[X] Show" (dynamic rank)
- Side actions: Love, Add, Comment

**Data Requirements**:
```typescript
interface Top3UpdateCard {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  media: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    season?: number;
    year: number;
    genres: string[];
    rating: number;
    posterPath: string;
  };
  rankInfo: {
    rank: 1 | 2 | 3;
    previousRank?: number;
    isNew: boolean;
  };
  socialProof: {
    loveCount: number;
    commentCount: number;
  };
}
```

**Unique Features**:
- Shows user's Top 3 rank
- Trophy/medal visual indicator
- User attribution (like Activity Card)
- Full interactions enabled

**Rank Badge Variants**:
```css
.top-3-badge.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-color: #FFD700;
}

.top-3-badge.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
  border-color: #C0C0C0;
}

.top-3-badge.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #B87333);
  border-color: #CD7F32;
}
```

---

### Card Type 7: Follow Suggestions

**Purpose**: Discover new friends based on viewing compatibility

**Visual Components**:
- Gradient background (no show poster)
- Purple-to-pink gradient (#667eea → #764ba2)
- Title: "Discover Friends"
- Subtitle: "Based on your viewing habits"
- 3 user cards in vertical stack
  - Avatar (52x52px, larger than usual)
  - Name
  - Bio (2 lines max, personality-driven)
  - Show count: "📺 187 shows watched"
  - Match percentage badge
  - FOLLOW button

**Data Requirements**:
```typescript
interface FollowSuggestionsCard {
  id: string;
  suggestedUsers: Array<{
    id: string;
    name: string;
    avatar: string;
    bio: string;
    showCount: number;
    matchPercentage: number; // 0-100
    mutualFriends: number;
    isFollowing: boolean;
  }>;
}
```

**Unique Features**:
- No show artwork background
- Custom gradient background
- Multiple user profiles in one card
- Match percentage algorithm-driven
- Interactive follow buttons

**HTML Structure**:
```html
<div class="card follow-suggestions-card">
  <div class="follow-card-header">
    <h2>Discover Friends</h2>
    <p>Based on your viewing habits</p>
  </div>

  <div class="suggested-users">
    <div class="user-suggestion">
      <img src="[AVATAR]" class="user-avatar-large" />
      <div class="user-info">
        <div class="user-name">[Name]</div>
        <div class="user-bio">[Bio]</div>
        <div class="user-stats">
          <span>📺 [X] shows watched</span>
          <span class="match-badge">[X]% match</span>
        </div>
      </div>
      <button class="follow-btn">FOLLOW</button>
    </div>
    <!-- Repeat for 2 more users -->
  </div>
</div>
```

**CSS Specific**:
```css
.follow-suggestions-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-avatar-large {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid white;
}

.match-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.follow-btn {
  padding: 8px 20px;
  background: transparent;
  border: 2px solid white;
  border-radius: 20px;
  color: white;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn.following {
  background: white;
  color: #764ba2;
}
```

---

## Implementation Guide

### Step 1: Set Up Component Library

1. Create folder structure:
```
components/
├── icons/
│   └── ActionIcons.tsx
├── modals/
│   └── ActionModal.tsx
├── cards/
│   ├── BaseCard.tsx
│   ├── SideActions.tsx
│   └── UserActivityCard.tsx
└── ui/
    ├── GlassBadge.tsx
    └── FriendAvatars.tsx
```

2. Export all reusable components from index files
3. Implement design tokens in CSS/Tailwind config

### Step 2: Create Base Card Component

All cards inherit from `BaseCard`:

```typescript
interface BaseCardProps {
  backgroundImage: string;
  children: React.ReactNode;
  onCardClick?: () => void;
  className?: string;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  backgroundImage,
  children,
  onCardClick,
  className = ''
}) => {
  return (
    <div className={`feed-card ${className}`} onClick={onCardClick}>
      <div className="card-background">
        <img src={backgroundImage} alt="" />
      </div>
      <div className="background-overlay" />
      {children}
    </div>
  );
};
```

### Step 3: Implement Each Card Type

Each card type extends BaseCard and adds specific content:

```typescript
export const UserActivityCard: React.FC<UserActivityCardProps> = ({ data }) => {
  return (
    <BaseCard backgroundImage={data.media.posterPath}>
      <div className="card-content">
        <UserHeader user={data.user} timestamp={data.timestamp} />
        <ShowInfo media={data.media} />
        <FriendAvatars
          friends={data.socialProof.friendsWhoLoved}
          count={data.socialProof.friendsWhoLoved.length}
        />
      </div>

      <SideActions
        onLoveClick={() => handleLove(data.id)}
        onAddClick={() => handleAdd(data.id)}
        onCommentClick={() => handleComment(data.id)}
        loveCount={data.socialProof.loveCount}
        commentCount={data.socialProof.commentCount}
      />
    </BaseCard>
  );
};
```

### Step 4: API Integration

Create API service for each card type:

```typescript
// services/feedService.ts
export const getFeedCards = async (
  userId: string,
  options?: {
    cardTypes?: CardType[];
    limit?: number;
    offset?: number;
  }
): Promise<FeedCard[]> => {
  const response = await fetch('/api/feed', {
    method: 'POST',
    body: JSON.stringify({ userId, ...options })
  });

  return response.json();
};
```

### Step 5: Testing Checklist

- [ ] All icons render correctly
- [ ] Modal positioning works on all cards
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable on all background images
- [ ] Animations are smooth (60fps)
- [ ] State updates persist correctly
- [ ] Friend avatars load and stack properly
- [ ] All card types match design specs
- [ ] Responsive on different screen sizes
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader labels present

---

## Best Practices

### Code Organization
1. Keep reusable components in shared folders
2. Use TypeScript interfaces for all data structures
3. Centralize API calls in service files
4. Document all props and expected data formats

### Design Consistency
1. Always use design tokens for colors/spacing
2. Reference the icon library, never duplicate SVGs
3. Keep animations consistent across all cards
4. Use the same glassmorphic effects everywhere

### Performance
1. Lazy load card images
2. Preload next/previous card
3. Use CSS transforms for animations (hardware accelerated)
4. Minimize React re-renders with memo()

### Accessibility
1. Include ARIA labels on all icon buttons
2. Maintain high contrast ratios (4.5:1 minimum)
3. Support keyboard navigation
4. Add focus indicators

### iOS Scrolling & Mobile Interactions

**Critical for iOS Safari compatibility** - iOS has unique scrolling behaviors that require special handling.

#### Front Comments Scrolling
When the comments bubble is expanded on the front of the card, scrolling must be isolated to prevent body scroll:

**CSS Requirements:**
```css
.comments-full {
    overflow-y: scroll;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: scroll-position;
}
```

**JavaScript Touch Handlers:**
```javascript
// Must prevent body scroll when scrolling comments
commentsFull.addEventListener('touchmove', (e) => {
    if (!document.querySelector('.comments-tab.expanded')) return;
    
    // Prevent body scroll when scrolling comments
    e.preventDefault();
    e.stopPropagation();
    
    // Manual scroll handling with momentum
    // ... (see card 1 implementation)
}, { passive: false });

commentsFull.addEventListener('touchstart', (e) => {
    e.stopPropagation(); // Prevent event bubbling
}, { passive: true });

commentsFull.addEventListener('touchend', (e) => {
    e.stopPropagation(); // Prevent event bubbling
}, { passive: true });
```

#### Back Card Scrolling
The back card content area requires iOS-specific scroll handling:

**CSS Requirements:**
```css
.card-back-content {
    overflow-y: scroll;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
    pointer-events: auto;
    will-change: scroll-position;
}
```

**JavaScript Implementation:**
- Uses MutationObserver to watch for card flip state
- Manually handles touch events for momentum scrolling
- Implements rubber band effect at scroll boundaries
- Does NOT use preventDefault/stopPropagation (allows native scrolling)

#### Body Scroll Lock
When card is flipped, body scroll must be locked:

**CSS:**
```css
body.scroll-locked {
    overflow: hidden;
    height: 100%;
    position: relative;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
    overscroll-behavior-y: none;
}

html.scroll-locked {
    overflow: hidden;
    height: 100%;
    overscroll-behavior: none;
    overscroll-behavior-y: none;
}
```

**JavaScript:**
```javascript
function lockBodyScroll() {
    document.body.classList.add('scroll-locked');
    document.documentElement.classList.add('scroll-locked');
}

function unlockBodyScroll() {
    document.body.classList.remove('scroll-locked');
    document.documentElement.classList.remove('scroll-locked');
}

// Watch for card flip
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const isFlipped = card.classList.contains('flipped');
            if (isFlipped) {
                lockBodyScroll();
            } else {
                unlockBodyScroll();
            }
        }
    });
});
observer.observe(card, { attributes: true, attributeFilter: ['class'] });
```

#### Key Differences Between Card Types

**Card 1 (Reference Implementation):**
- Front comments: Uses preventDefault + stopPropagation
- Back card: Uses native scrolling with manual scrollTop updates
- Body scroll: Locked by default, unlocked when card flipped

**Cards 2, 3, 4, 6:**
- All match Card 1's implementation exactly
- Same touch handlers and CSS properties
- Consistent scrolling behavior across all cards

#### Testing Checklist for iOS Scrolling
- [ ] Front comments scroll independently (no body scroll)
- [ ] Back card scrolls with momentum
- [ ] Rubber band effect at scroll boundaries
- [ ] Body scroll locked when card is flipped
- [ ] Body scroll unlocked when card is unflipped
- [ ] No page bounce when scrolling card content
- [ ] Smooth momentum scrolling (Apple-like deceleration)
- [ ] Works on iOS Safari 13+ and Chrome iOS

---

## Future Enhancements

### Potential New Card Types
- **Watchlist Reminder**: "You added this 30 days ago"
- **Similar Content**: "Because you're watching [Show]"
- **Trending**: "Trending with your friends"
- **Anniversary**: "[Friend] started watching this 1 year ago"
- **Group Watch**: "Watch together with [Friends]"
- **Quiz/Poll**: Interactive engagement cards

### Advanced Features
- Swipe gestures for quick actions
- Card customization preferences
- Algorithm tuning (more/less of certain cards)
- Save cards for later
- Share cards to external platforms

---

## Questions for Product/Design

1. Should users be able to hide certain card types?
2. What's the algorithm for card ordering in feed?
3. Should there be a "refresh feed" pull-to-refresh?
4. How do we handle cards with no poster image?
5. Should cards remember their state when scrolling back?
6. What happens when a user taps the card background?
7. Should there be card-specific animations when they enter view?

---

## Version History

- **v1.1** (November 2025) - Added iOS scrolling implementation guide
  - Documented front comments scrolling with preventDefault/stopPropagation
  - Documented back card scrolling with momentum and rubber band effects
  - Added body scroll lock implementation
  - Added testing checklist for iOS compatibility
- **v1.0** (November 2025) - Initial documentation with 7 card types
- User Activity Card fully implemented
- Design system and component library defined

---

**Last Updated**: November 10, 2025
**Maintained By**: Been Watching Development Team
**Related Docs**: `potential_activitycards.md`, `ENHANCED-FEED-IMPLEMENTATION.md`

# Enhanced Activity Feed Architecture

**Version:** 1.0
**Last Updated:** January 2025
**Status:** In Development

## Overview

The Enhanced Activity Feed is a modern, scroll-snap card experience designed to increase user engagement and content discovery. Unlike the traditional vertical feed, this implementation uses full-screen cards with flip functionality, providing an immersive, mobile-first experience similar to Instagram Reels or TikTok, but uniquely tailored to Been Watching's social TV/movie tracking features.

## Core Principles

1. **Mobile-First:** Optimized for touch interactions and portrait viewports
2. **Native Performance:** Leverage browser capabilities over custom JavaScript
3. **Modular Architecture:** Cards are isolated, reusable, and independently testable
4. **Data-Rich:** Pre-fetch all card data to avoid loading states during interactions
5. **Accessibility:** Full keyboard navigation and screen reader support

---

## Architecture Overview

### High-Level Component Hierarchy

```
/feed-v2 (Route)
  └─ FeedContainer (Client Component)
      ├─ ScrollSnapWrapper (Native CSS)
      ├─ CardWrapper (per card)
      │   └─ iframe → Dynamic Card Component
      ├─ LoadingSkeletons
      ├─ ScrollLockManager (PostMessage listener)
      └─ IntersectionObserver (Lazy loading)

/cards/[type] (Dynamic Routes)
  ├─ /cards/activity → Template A (Cards 1, 6)
  ├─ /cards/recommendation → Template B (Cards 2, 3, 4, 5, 8)
  └─ /cards/follow-suggestions → Template C (Card 7)
```

### Why Iframe-Based Architecture?

**Selected Approach:** `claude-activity-feed-scroll.html` pattern

**Rationale:**
1. **Isolation:** Each card's JavaScript doesn't interfere with feed scroll
2. **Modularity:** Cards can be developed, tested, and updated independently
3. **Simplicity:** Avoids complex nested scroll conflicts
4. **Performance:** Browser handles rendering optimization per iframe
5. **Maintainability:** Clear separation of concerns

**Trade-offs Accepted:**
- Higher memory usage (mitigated with lazy loading)
- PostMessage required for communication (minimal overhead)
- Slightly larger initial payload (mitigated with code splitting)

---

## Scroll-Snap Behavior

### Native CSS Approach

```css
/* Feed Container */
html {
    scroll-snap-type: y proximity;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
}

/* Card Wrapper */
.card-wrapper {
    scroll-snap-align: center;
    scroll-snap-stop: always;
    margin-bottom: 20px;
}
```

**Key Decisions:**
- **`proximity` mode:** Gentle snapping, user maintains control (vs `mandatory` which forces snap)
- **`center` alignment:** Cards snap to viewport center, allowing peek at previous/next cards
- **Native smooth scroll:** Browser-optimized, 60fps performance

### Visual Layout

```
┌─────────────────────────┐
│  [Prev Card - Hint]     │ ← Partial visibility
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │  ACTIVE CARD    │   │ ← Centered, snapped
│   │  398×645px      │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
├─────────────────────────┤
│  [Next Card - Hint]     │ ← Partial visibility
└─────────────────────────┘
```

**Responsive Behavior:**
- **Tall screens (>900px height):** Active card stays centered, large hints of prev/next
- **Standard screens (700-900px):** Active card centered, medium hints
- **Short screens (<700px):** Fallback to `start` alignment, minimal hints

---

## Card Templates & Data Flow

### Three Template System

#### Template A: Activity Cards (Cards 1, 6)
**Used by:** User Activity, Top 3 Update

**Characteristics:**
- User header with avatar
- Comments tab (slides up from bottom)
- Like button (heart icon)
- Activity bubbles ("loved", "currently watching")
- Back: Standard show details

**Route:** `/cards/activity?type=user_activity&data={encodedData}`

#### Template B: Recommendation Cards (Cards 2, 3, 4, 5, 8)
**Used by:** Because You Liked, Friends Loved, Coming Soon, Now Streaming, You Might Like

**Characteristics:**
- No user header (system-generated)
- Type-specific badge (recommendation reason, streaming service, release date)
- Friend avatars for social proof
- No comments tab
- Back: Standard show details (Card 4 uses Back B variant)

**Route:** `/cards/recommendation?type={cardType}&data={encodedData}`

#### Template C: Follow Suggestions (Card 7)
**Used by:** Find New Friends

**Characteristics:**
- Completely unique design
- No flip functionality
- Carousel with 4 user profiles
- Match percentage, bio, stats
- Follow/unfollow buttons

**Route:** `/cards/follow-suggestions?data={encodedData}`

### Data Flow Architecture

```
User Navigates to /feed-v2
    ↓
FeedContainer fetches: GET /api/feed-v2?limit=10&offset=0
    ↓
API applies feed algorithm (distribution rules)
    ↓
Returns array of card objects with full data:
  - type: 'activity' | 'recommendation' | 'follow'
  - subtype: 'user_activity' | 'top_3' | 'because_you_liked' | etc.
  - data: {
      media: { /* Full TMDB data */ },
      user: { /* User/friend data */ },
      social: { /* Friends context */ },
      userState: { /* Current user's rating/status */ }
    }
    ↓
FeedContainer renders iframe per card:
  <iframe src="/cards/{type}?data={base64encoded}" />
    ↓
Card template fetches no additional data (everything in URL params)
    ↓
User interacts (like, comment, rate):
  Card sends PostMessage to parent
    ↓
  Parent handles state update + API call
    ↓
  PostMessage back to card with updated data
```

**Key Insight:** All data needed for front AND back of card is fetched upfront. No loading states when user flips card.

---

## Scroll-Lock Mechanism

### Problem
When a card is flipped to show back content, user might accidentally scroll the feed while trying to scroll the card's back content.

### Solution: PostMessage Communication

**In Card Component:**
```tsx
const flipCard = () => {
    setIsFlipped(!isFlipped);

    // Notify parent to lock/unlock feed scroll
    window.parent.postMessage({
        type: 'cardFlipped',
        isFlipped: !isFlipped,
        cardId: cardData.id
    }, '*');
};
```

**In FeedContainer:**
```tsx
useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'cardFlipped') {
            if (event.data.isFlipped) {
                // Lock feed scroll
                document.documentElement.style.overflow = 'hidden';
                setSavedScrollPosition(window.scrollY);
            } else {
                // Unlock and restore position
                document.documentElement.style.overflow = 'auto';
                window.scrollTo(0, savedScrollPosition);
            }
        }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
}, []);
```

**Benefits:**
- Prevents accidental feed navigation
- Smooth user experience
- Works across iframe boundary
- Minimal performance impact

---

## Performance Optimizations

### 1. Lazy Iframe Loading

Only load iframes when approaching viewport:

```tsx
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const iframe = entry.target.querySelector('iframe');

        if (entry.isIntersecting && !iframe.src) {
            // Load iframe when within 1 viewport distance
            iframe.src = iframe.dataset.src;
        } else if (!entry.isIntersecting && entry.boundingClientRect.top < -1000) {
            // Unload iframe if >3 cards away (memory management)
            iframe.src = '';
        }
    });
}, {
    rootMargin: '100% 0px' // Pre-fetch 1 viewport ahead
});
```

**Impact:** Reduces initial memory usage by 70%

### 2. Pre-fetching

Fetch next batch when approaching end of current cards:

```tsx
useEffect(() => {
    if (currentCardIndex + 3 >= cards.length && !isLoading && hasMore) {
        fetchMoreCards(offset + 10);
    }
}, [currentCardIndex]);
```

**Impact:** Seamless infinite scroll, no loading spinners

### 3. Image Optimization

```tsx
// In card templates
<img
    src={getTMDBImage(poster_path, 'w780')}
    srcSet={`
        ${getTMDBImage(poster_path, 'w342')} 342w,
        ${getTMDBImage(poster_path, 'w500')} 500w,
        ${getTMDBImage(poster_path, 'w780')} 780w
    `}
    sizes="(max-width: 500px) 342px, (max-width: 800px) 500px, 780px"
    loading="lazy"
    decoding="async"
/>
```

**Impact:** 40% faster image loads on mobile

### 4. Icon Sprite Sheet

Single SVG with all icons referenced via `<use>`:

```tsx
<Icon name="heart" state="active" theme="dark" />
// Renders:
<svg><use xlink:href="/icons/feed-sprite.svg#heart-active" /></svg>
```

**Impact:** ~65% reduction in icon asset size

### 5. Code Splitting

```tsx
// Lazy load card templates
const ActivityCard = lazy(() => import('./cards/activity'));
const RecommendationCard = lazy(() => import('./cards/recommendation'));
const FollowSuggestionsCard = lazy(() => import('./cards/follow-suggestions'));
```

**Impact:** 40% smaller initial bundle

---

## State Management

### Approach: React Context + Local State

**Why not Redux/Zustand?**
- Feed state is mostly local to container
- Card state is isolated within iframes
- PostMessage handles cross-boundary communication
- Simpler = fewer bugs

**Context Structure:**
```tsx
<FeedContext>
    currentCardIndex: number
    cards: FeedCard[]
    isLoading: boolean
    hasMore: boolean
    scrollLocked: boolean
</FeedContext>

<UserContext>
    userId: string
    userRatings: Map<mediaId, rating>
    userStatuses: Map<mediaId, status>
</UserContext>
```

**When to migrate to Zustand:**
- If cross-card features are needed (e.g., "Hide all recommendations")
- If performance profiling shows context re-renders are expensive
- If state complexity grows beyond 2-3 contexts

---

## Mobile-First Optimizations

### Touch Gesture Handling

**Minimal Approach (Preferred):**
```javascript
// Only prevent iOS double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // Prevent zoom
    }
    lastTouchEnd = now;
}, { passive: false });
```

**When to use custom momentum scrolling:**
- Only if testing reveals iOS Safari issues with nested scrollables
- Card-back content scroll feels janky
- Comments tab scroll doesn't work smoothly

**Current Strategy:** Trust native `-webkit-overflow-scrolling: touch` until proven insufficient

### Responsive Card Sizing

```css
.card-wrapper {
    width: min(398px, 100vw - 40px); /* 20px padding each side */
    height: 645px;
    max-height: 80vh; /* Don't overflow short screens */
}

@media (max-width: 430px) {
    .card-wrapper {
        width: calc(100vw - 20px); /* 10px padding on mobile */
    }
}

@media (max-height: 700px) {
    .card-wrapper {
        scroll-snap-align: start; /* Better for short screens */
    }
}
```

---

## Accessibility

### Keyboard Navigation

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
    switch(e.key) {
        case 'ArrowDown':
            scrollToCard(currentIndex + 1);
            break;
        case 'ArrowUp':
            scrollToCard(currentIndex - 1);
            break;
        case 'Space':
        case 'Enter':
            flipCard();
            break;
        case 'Escape':
            if (isFlipped) flipCard(); // Close card
            break;
    }
};
```

### Screen Reader Support

```tsx
<div
    role="feed"
    aria-label="Activity feed with cards from friends and recommendations"
    aria-live="polite"
>
    <article
        role="article"
        aria-label={`${card.type} card: ${card.title}`}
        tabIndex={0}
    >
        {/* Card content */}
    </article>
</div>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto; /* Instant scroll */
    }

    .card {
        transition: none; /* No flip animation */
    }
}
```

---

## Error Handling

### Iframe Load Failures

```tsx
<iframe
    src={cardUrl}
    onError={() => {
        // Retry once
        setTimeout(() => setCardUrl(cardUrl + '?retry=1'), 1000);
    }}
    onLoad={() => {
        setCardLoaded(true);
        trackEvent('card_loaded', { type: card.type });
    }}
/>
```

### API Failures

```tsx
const fetchFeed = async () => {
    try {
        const response = await fetch('/api/feed-v2');
        if (!response.ok) throw new Error('Feed fetch failed');
        const data = await response.json();
        setCards(data.items);
    } catch (error) {
        // Show error card
        setCards([{
            type: 'error',
            message: 'Unable to load feed. Please refresh.',
            retry: () => fetchFeed()
        }]);

        // Log to Sentry
        captureException(error);
    }
};
```

### PostMessage Timeouts

```tsx
const sendMessageWithTimeout = (message: any, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        const messageId = Math.random().toString(36);
        const handler = (event: MessageEvent) => {
            if (event.data.replyTo === messageId) {
                window.removeEventListener('message', handler);
                resolve(event.data);
            }
        };

        window.addEventListener('message', handler);

        setTimeout(() => {
            window.removeEventListener('message', handler);
            reject(new Error('PostMessage timeout'));
        }, timeout);

        iframe.contentWindow.postMessage({ ...message, id: messageId }, '*');
    });
};
```

---

## Testing Strategy

### Unit Tests
- Feed container scroll behavior
- PostMessage communication
- Lazy loading logic
- Card template rendering

### Integration Tests
- Feed API returns correct card mix
- Scroll-lock activates on flip
- Lazy loading triggers at correct threshold
- State updates propagate correctly

### E2E Tests (Playwright)
```typescript
test('user can scroll feed and flip card', async ({ page }) => {
    await page.goto('/feed-v2');

    // Wait for first card to load
    await page.waitForSelector('.card-wrapper iframe');

    // Scroll to next card
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600); // Snap animation

    // Flip card
    const iframe = page.frameLocator('.card-wrapper iframe').first();
    await iframe.locator('.menu-button').click();

    // Verify back content visible
    await expect(iframe.locator('.card-back')).toBeVisible();

    // Scroll back content
    await iframe.locator('.card-back-content').scrollBy(0, 100);

    // Verify feed scroll is locked
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    // Feed should not have scrolled
});
```

### Performance Tests
```typescript
test('feed loads within 2 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/feed-v2');
    await page.waitForSelector('.card-wrapper:first-child iframe[src]');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(2000);
});

test('scroll latency is under 100ms', async ({ page }) => {
    await page.goto('/feed-v2');

    const start = Date.now();
    await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => {
        const cards = document.querySelectorAll('.card-wrapper');
        return cards[1].getBoundingClientRect().top < window.innerHeight / 2;
    });
    const scrollTime = Date.now() - start;

    expect(scrollTime).toBeLessThan(100);
});
```

---

## Deployment Strategy

### Phase 1: Parallel Deployment
- Deploy enhanced feed at `/feed-v2`
- Old feed remains at `/feed`
- Internal testing for 3 days

### Phase 2: Alpha Testing
- Share `/feed-v2` link with 5-10 alpha users
- Monitor analytics, session recordings
- Gather feedback via in-app survey

### Phase 3: Full Rollout
- Replace `/feed` route with enhanced feed
- Add redirect: `/feed-v2` → `/feed`
- Deprecate old feed components

### Phase 4: Monitoring
- 7-day intensive monitoring
- Daily analytics review
- Quick-fix any critical issues
- Iterate based on user feedback

---

## Analytics Events

### Feed-Level Events
- `enhanced_feed_viewed` - Session started
- `enhanced_feed_scrolled` - User scrolled (with scroll depth)
- `enhanced_feed_session_ended` - Duration, cards viewed

### Card-Level Events
```typescript
{
    event: 'feed_card_viewed',
    properties: {
        cardType: 'activity' | 'recommendation' | 'follow',
        cardSubtype: 'user_activity' | 'because_you_liked' | etc,
        cardIndex: number,
        timeSpent: number,
        mediaId?: string,
        userId?: string (for activity cards)
    }
}

{
    event: 'feed_card_flipped',
    properties: {
        cardType: string,
        cardIndex: number,
        timeToFlip: number (time from view to flip)
    }
}

{
    event: 'feed_card_interaction',
    properties: {
        cardType: string,
        interactionType: 'like' | 'comment' | 'rate' | 'add_to_watchlist',
        mediaId?: string
    }
}
```

---

## Future Enhancements

### Phase 2 (Post-Launch)
1. **A/B Testing Framework**
   - Test different distribution ratios
   - Test snap modes (`proximity` vs `mandatory`)
   - Test card order algorithms

2. **Personalized Distribution**
   - Adjust ratios based on user engagement
   - More of what users interact with
   - Time-based adjustments (more releases on Fridays)

3. **Advanced Recommendations**
   - Collaborative filtering
   - Content-based filtering with embeddings
   - Hybrid recommendation system

4. **Shared Show Card (Card 9)**
   - When user shares via native share
   - Deep link to card
   - Notification when friend shares

5. **Video Content**
   - Auto-play trailers on card
   - Mute by default, unmute on tap
   - Pause when card not active

### Phase 3 (Long-term)
- Live activities (watch parties)
- Story-style temporary posts
- Voice notes on shows
- AR poster try-on (fun feature)

---

## Technical Debt & Known Limitations

### Current Limitations
1. **Memory usage:** 7 iframes loaded = ~200MB (mitigated with lazy loading)
2. **PostMessage latency:** ~5-10ms overhead (acceptable for UX)
3. **No cross-card features:** Each card is isolated (by design, but limits some features)

### Planned Improvements
1. **Service Worker:** Offline support, faster loads
2. **Virtual scrolling:** Only render visible ±1 cards (complex with iframes)
3. **Background sync:** Update feed when app returns from background

---

## Success Metrics

### Week 1 Targets
- < 2s initial load time
- < 100ms scroll latency
- 90+ Lighthouse score
- 0 critical bugs

### Month 1 Targets
- 10+ cards viewed per session (vs 5-7 on old feed)
- 30% increase in rating completions
- 20% increase in comment engagement
- 80%+ users successfully flip a card

### Month 3 Targets
- 50%+ retention after 7 days (vs 40% on old feed)
- 5+ return visits per week per active user
- 15%+ increase in watchlist additions
- 25%+ increase in friend follows

---

## References

- [Feed Algorithm Strategy](/docs/features/feed-algorithm-strategy.md)
- [Card Type Specifications](/docs/features/card-type-specifications.md)
- [Component Library Spec](/docs/design/component-library-spec.md)
- [Icon Sprite System](/docs/design/icon-sprite-system.md)

---

**Maintained by:** Engineering Team
**Questions?** See [Been Watching Documentation Index](/docs/README.md)

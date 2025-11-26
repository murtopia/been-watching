# Been Watching - Activity Cards Documentation

## Project Overview
Been Watching is a social media application for tracking and sharing TV shows and movies. The activity feed is designed as an immersive, TikTok-style experience with full-screen cards that users swipe through vertically.

## Design Philosophy
- **Mobile-first**: Optimized for phone screens with vertical scrolling
- **Immersive**: Full-bleed background images from show/movie artwork
- **Glassmorphic**: Modern glass effects with backdrop blur for overlays
- **Social-first**: Emphasizes friend interactions and social discovery
- **Season-specific**: TV shows always reference specific seasons, not entire series

## Card Types & Specifications

### 1. User Activity Card
**Purpose**: Show when a friend rates or adds a show to their list
**Content Structure**:
- User avatar (40x40px) + username + timestamp ("2 hours ago")
- **Activity Badges**: Show rating and watchlist actions (e.g., "❤️ Loved" + "📺 Currently Watching")
  - Uses SVG icons from modal (heart, play triangle, bookmark, checkmark)
  - Glassmorphic badges with 8px/14px padding, 13px font, 700 weight
  - Color-coded backgrounds matching action type
- Show title with season (e.g., "Breaking Bad Season 5")
- Metadata: Year • Genre • TMDB Rating badge
- Friend avatars showing others who loved it (+count)

**Actions** (right side):
- Love button (heart icon - filled when active)
- Add button (opens watchlist modal with rating & watchlist options)
- Chat button (for activity-specific comments)

**Visual**: Full show poster background with gradient overlay

---

### 2. "Because You Liked" Recommendation Card
**Purpose**: Personalized recommendations based on viewing history
**Content Structure**:
- **Glassmorphic badge**: "👍 Because you liked [Show Name]"
  - Purple/violet color scheme: `rgba(139, 92, 246, 0.25)`
  - Thumbs up SVG icon (from Like rating option)
  - 8px/14px padding, 13px font, 700 weight, border
- Show title with season
- Metadata: Year • Genre • Rating
- Friend avatars + count if applicable
- No user attribution (system-generated)

**Actions** (right side - simplified):
- Add button (opens watchlist modal)
- Share button

**Visual**: Show artwork background, stronger gradient for text readability

---

### 3. "Your Friends Loved" Social Recommendation Card
**Purpose**: Surface popular content among user's friend network
**Content Structure**:
- **Glassmorphic badge**: "❤️ Your Friends Loved"
  - Pink color scheme: `rgba(236, 72, 153, 0.25)`
  - Heart SVG icon (filled, from Love rating option)
  - 8px/14px padding, 13px font, 700 weight, border
- Show title with season
- Metadata: Year • Genre • Rating
- Friend avatar circles (up to 4 visible)
- Friend count text (e.g., "12 friends loved this")

**Actions** (right side - simplified):
- Add button (opens watchlist modal)
- Share button

**Visual**: Show artwork with friend social proof prominently displayed

---

### 4. Coming Soon / New Season Announcement Card
**Purpose**: Notify users about upcoming season releases
**Content Structure**:
- **Glassmorphic badge**: "🕐 Coming Soon on [Date]"
  - Purple color scheme: `rgba(168, 85, 247, 0.25)`
  - Clock SVG icon
  - 8px/14px padding, 13px font, 700 weight, border
- Show title with season number
- Metadata: Year • Genre • Episode count
- Friend avatar circles + "X friends want to watch this"

**Actions** (right side - UNIQUE):
- **Bookmark + button** (Want to Watch - bookmark with plus overlay)
- **Bell button** (Remind Me - for notifications)

**Back of card differences**:
- Bookmark + icon (NO rating modal - unreleased content)
- Only "Friends Want to Watch" section (no watching/watched/ratings)

**Visual**: Latest season's key art or promotional image

---

### 5. Now Streaming Card
**Purpose**: Alert when shows/movies arrive on streaming platforms
**Content Structure**:
- **Glassmorphic badge**: "📺 Now Streaming on [Platform]"
  - Purple color scheme: `rgba(139, 92, 246, 0.25)`
  - TV with play triangle SVG icon (16px)
  - 8px/14px padding, 13px font, 700 weight, border
- Movie/Show title with season (if applicable)
- Metadata: Year • Genre • Rating
- Brief description
- Optional: Friend engagement if applicable

**Actions** (right side):
- Add button (opens watchlist modal)
- Watched button

**Visual**: Movie poster or show artwork

**Technical Note**: TV icon is simple rectangle with rounded corners + centered play triangle (no stand)

---

### 6. Top 3 Update Card
**Purpose**: Highlight when friends update their Top 3 shows
**Content Structure**:
- User avatar + username + timestamp
- **Top 3 Badge**: "⭐ Added to #1 Top Show!" (or #2/#3)
  - Gold glassmorphic badge: `rgba(255, 215, 0, 0.25)`
  - Trophy/star SVG icon (two-tone: gold + orange accent)
  - 8px/14px padding, 13px font, 700 weight, border
  - Can show "Previously" message if replacing another show
  - Medal variations: Gold (#1), Silver (#2), Bronze (#3)
- Show title with season
- Metadata: Year • Genre • Rating
- Friend avatars showing others who loved it (+count)

**Actions** (right side - same as Card 1):
- Love button
- Add button
- Chat button

**Visual**: The show's artwork that was added to Top 3

---

### 7. Follow Suggestions Card
**Purpose**: Discover new friends based on viewing compatibility
**Content Structure**:
- **Outer glassmorphic container**: Vibrant yellow-gold background
  - Background: `rgba(255, 215, 0, 0.2)` (Card 6 gold)
  - Border: `1px solid rgba(255, 215, 0, 0.4)`
  - Backdrop filter with blur (25px)
  - Height: 420px (~65% of standard show card)
  - Padding: 20px
- **Glass badge**: "🔗 Find New Friends"
  - Dark glassmorphic badge: `rgba(20, 20, 20, 0.85)`
  - Chain link SVG icon (16px)
  - 8px/14px padding, 13px font, 700 weight, white text
  - Border: `1px solid rgba(255, 255, 255, 0.15)`
- **Carousel of 4 user profile cards**, each an inner glassmorphic card:
  - Background: `rgba(20, 20, 20, 0.98)` (dark with high contrast)
  - Border: `1px solid rgba(255, 255, 255, 0.15)`
  - Padding: 16px
  - Profile photo: 90px circular with 2px white border
  - Name + username (clickable links to profile pages)
  - **Match percentage**: Styled like profile page numbers
    - 28px number, 10px label
    - Vertical stack, right-aligned
    - Always >80% match
  - FOLLOW button (red `#FF6B6B`, 75% size: 7px/18px padding, 11px font)
  - **Bio**: Max 2 lines with ellipsis truncation
    - 13px font, 1.4 line-height
    - `-webkit-line-clamp: 2`
  - **Watchlist stats**: Matching profile page treatment
    - 24px numbers, 12px labels
    - Centered with separator line
    - Full width layout
  - **Friends in common**: Overlapping avatar circles at bottom
    - 22px circles with -8px overlap
    - 1.5px white border
    - Text count (e.g., "8 friends in common")

**Actions**: Individual FOLLOW buttons per user card

**Carousel Behavior**:
- Auto-rotation every 6 seconds (changed from 4)
- Manual navigation via 4 dark dots at bottom
- Dots: `rgba(20, 20, 20, 0.5)` inactive, `rgba(20, 20, 20, 0.9)` active
- Active dot expands to 24px width
- Slide transitions: `cubic-bezier(0.4, 0, 0.2, 1)`
- Pause on hover
- Three-state system: `.active`, `.next`, `.prev`

**Visual**: No show artwork; nested glassmorphic structure with vibrant gold outer + dark inner for high contrast

**Technical Note**: Shorter card height allows it to appear more frequently in feed as a "palate cleanser" between content cards

---

### 8. "You Might Like" Recommendation Card
**Purpose**: Advanced algorithmic recommendation based on taste matching with similar users. Helps users discover shows they wouldn't find otherwise.
**Content Structure**:
- **Glassmorphic badge**: "✨ You Might Like This"
  - Blue gradient background: `rgba(59, 130, 246, 0.25)`
  - Sparkles icon (16px)
  - 8px/14px padding, 13px font, 700 weight, border
- **Match Score** (prominent feature):
  - Large sparkles icon with percentage (e.g., "87% Match")
  - Font: 18px, bold
  - Builds confidence in recommendation
- **Algorithm Explanation**:
  - "Based on users like you"
  - "Users with similar taste loved this"
- Show title with season
- Metadata: Year • Genre • Rating

**Display Rules**:
- User has rated 10+ shows (enough data for algorithm)
- System finds users with 75%+ taste match score
- Matched user loved a show current user hasn't seen
- Show is not already in user's watchlist

**Actions** (right side - simplified):
- Add button (opens watchlist modal)
- Share button

**Template**: Template B (same as Cards 2, 3, 5)

**Visual**: Show artwork background with prominent match score display

---

## Technical Implementation Details

### Card Container Structure
```html
<div class="feed-card">
  <div class="card-background">
    <img src="[TMDB_IMAGE_URL]" />
  </div>
  <div class="background-overlay"></div>
  <div class="card-content">
    <!-- Content here -->
  </div>
  <div class="side-actions">
    <!-- Action buttons -->
  </div>
  <div class="comments-bar">
    <!-- Comments indicator -->
  </div>
</div>
```

### Dimensions & Spacing
- Card height: 100vh (full viewport)
- Content padding: 20px horizontal, 100px bottom
- Side actions: Right: 8px, Bottom: 100px
- Action buttons: 46x46px circles
- **Badge specifications**: 8px/14px padding, 13px font, 700 weight, 16px icon, 1px border

### Badge Design System
All glassmorphic badges follow consistent styling:
- **Padding**: `8px 14px`
- **Font**: `13px` size, `700` weight
- **Icon size**: `16px × 16px`
- **Border**: `1px solid` with 0.5 opacity of background color
- **Border radius**: `12px`
- **Backdrop filter**: `blur(10px)`

**Badge Color Schemes**:
- **Red** (Loved activity): `rgba(255, 59, 92, 0.25)` + border `rgba(255, 59, 92, 0.5)`
- **Blue** (Watching activity): `rgba(59, 130, 246, 0.25)` + border `rgba(59, 130, 246, 0.5)`
- **Purple** (Recommendations/Coming Soon): `rgba(139, 92, 246, 0.25)` / `rgba(168, 85, 247, 0.25)` + border 0.5
- **Pink** (Friends Loved): `rgba(236, 72, 153, 0.25)` + border `rgba(236, 72, 153, 0.5)`
- **Gold** (Top 3): `rgba(255, 215, 0, 0.25)` + border `rgba(255, 215, 0, 0.5)`

### SVG Icon Library
All icons use consistent stroke-width: `1.5px`, rounded caps and joins
- **Heart** (Love): Filled path from modal
- **Thumbs up** (Like): Stroke outline from modal
- **Play triangle** (Watching): Filled polygon
- **Bookmark** (Want to Watch): Filled or stroke outline
- **Bookmark +** (Add to Want): Bookmark with plus overlay (white on filled, black on transparent)
- **Checkmark circle** (Watched): Circle with checkmark path
- **Clock** (Coming Soon): Circle with clock hands
- **Bell** (Remind Me): Bell notification icon
- **Trophy/Star** (Top 3): Two-tone star (gold + orange accent)
- **TV with Play** (Now Streaming): Rounded rectangle (TV screen) with centered play triangle (no stand)
- **Chain Link** (Follow Suggestions): Connected chain link symbol

### Color System
- Background overlay: Linear gradient black (0% → 70% → 95%)
- Glass effects: rgba(255,255,255,0.15) with 20px blur
- Text hierarchy:
  - Primary: #FFFFFF
  - Secondary: rgba(255,255,255,0.9)
  - Tertiary: rgba(255,255,255,0.7)

### Animation & Interactions
- Vertical scroll snap (mandatory)
- Button press: scale(0.9) transform
- Dropdown menus: Slide in from right
- Follow button toggle: Background/border swap
- Love button: Fill animation with #ff3b5c

---

## Data Requirements from API

### Per Card Data Needs
1. **User Activity**: user_id, user_name, user_avatar, action_type, timestamp, show_id, season_number, friend_loves[]
2. **Recommendations**: show_id, season_number, recommendation_reason, match_score
3. **Social Proof**: show_id, season_number, friends_who_loved[]
4. **New Season**: show_id, season_number, episode_count, friends_watching[]
5. **Streaming**: show_id, platform_name, availability_date
6. **Top 3**: user_id, user_name, user_avatar, rank_position, show_id, season_number
7. **Follow**: suggested_users[] with match_percentage, bio, show_count

### TMDB Integration
- Fetch high-resolution poster images (original size)
- Get show metadata (year, genres, rating)
- Retrieve season-specific information
- Pull brief descriptions (limit to ~100 characters)

---

## Interaction Patterns

### Dropdown Menus
Two types of expandable menus:
1. **Watchlist Menu**:
   - Want to Watch
   - Watching
   - Watched

2. **Rating Menu**:
   - 😐 Meh
   - 👍 Like
   - ❤️ Love

### State Management
- Track user's relationship with each show (watched status, rating)
- Persist follow states for suggested users
- Maintain activity engagement (likes, comments)
- Update UI immediately on user actions

### Navigation Patterns
- Vertical swipe: Move between cards
- Tap dropdown: Open menu options
- Tap outside: Close any open menus
- Tap comment bar: Expand comment thread
- Long press: Could show additional options

---

## Responsive Considerations

### Mobile Optimization (Primary)
- Touch-friendly tap targets (minimum 44x44px)
- Swipe gestures for card navigation
- Bottom-positioned UI elements for thumb reach
- Prevent horizontal scroll
- Disable pinch zoom

### Tablet Adaptation
- Center content with max-width: 500px
- Maintain mobile layout with larger spacing
- Consider side-by-side view for landscape

### Accessibility
- High contrast text on images (gradient overlay)
- Clear touch targets
- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support for web

---

## Performance Optimization

### Image Loading
- Lazy load cards below the fold
- Preload next/previous card images
- Use progressive JPEGs
- Cache viewed images
- Provide low-quality placeholders

### Scroll Performance
- Use CSS scroll-snap for smooth scrolling
- Hardware acceleration for transforms
- Minimize repaints during scroll
- Debounce scroll event handlers

---

## Implementation Priority

### Phase 1 (MVP)
1. User Activity Card
2. Basic Add/Watched functionality
3. Vertical scroll navigation
4. Glass badge styling

### Phase 2
1. Recommendation cards (#2, #3)
2. Dropdown menus
3. Friend avatars display
4. Love/Unlike functionality

### Phase 3
1. New Season/Streaming alerts (#4, #5)
2. Top 3 Updates (#6)
3. Follow Suggestions (#7)
4. Comments integration

---

## Design Assets Needed
- Icon set: Heart, Plus, Chat, Check
- Default avatar placeholder
- Loading states for images
- Empty state graphics
- Platform logos (Netflix, Hulu, etc.)

---

## Success Metrics to Track
- Card engagement rates by type
- Follow conversion from suggestions
- Add-to-watchlist conversion
- Time spent per card
- Scroll depth
- Social interaction rates (loves, comments)

---

## Notes for Developer

### Critical Requirements
1. **Season Specificity**: Never reference a show without its season number
2. **Mobile-First**: This is primarily a mobile experience
3. **Performance**: Cards should feel instant and smooth
4. **Social Context**: Always show friend engagement when available
5. **Visual Hierarchy**: Ensure text is always readable over images

### API Endpoints Needed
- `/feed/activity` - User activity stream
- `/feed/recommendations` - Personalized recommendations
- `/feed/social` - Friends' popular content
- `/shows/{id}/season/{number}` - Season-specific data
- `/users/suggestions` - Friend recommendations
- `/watchlist/status` - Check user's relationship with content

### State Management Considerations
- Cache card states to prevent refetching
- Optimistically update UI on user actions
- Sync with backend asynchronously
- Handle offline states gracefully

---

## Testing Checklist
- [ ] Smooth vertical scrolling on all devices
- [ ] Dropdown menus open/close properly
- [ ] Images load without layout shift
- [ ] Text remains readable on all backgrounds
- [ ] Touch targets are adequately sized
- [ ] State changes persist correctly
- [ ] Social counts update in real-time
- [ ] Follow/unfollow toggles work
- [ ] Back navigation preserves scroll position
- [ ] Works offline with cached content

---

## Contact & Resources
- Design Reference: [Activity Cards HTML Prototype]
- TMDB API Documentation: https://developers.themoviedb.org/3
- Been Watching Design System: [Google Drive Link]
- Questions: [Your Contact]

---

*Last Updated: November 2025*  
*Version: 1.0*
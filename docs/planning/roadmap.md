# Been Watching - Product Roadmap

**Last Updated:** December 14, 2025
**Current Version:** v0.2.0 (Alpha)
**Status:** Private Alpha Testing → Beta Expansion

---

## Current Status

### Active Users
- **Alpha Group (10+ users)**
  - Core team: Nick (@murtopia), Taylor (@taylormurto), Todd (@toddles), Pat (@mossy)
  - Various invited alpha testers with active accounts
  - Nick: 131+ shows tracked

### Recently Completed (January 2025)

#### Notification System ✅
- Notification bell icon with unread badge counter
- Dropdown showing recent notifications
- Real-time updates (30-second polling)
- Notifications for follow, like, and comment actions
- Mark all as read functionality
- Smart prevention of self-notifications
- Clickable notifications route to relevant content

#### Social Discovery System ✅
- Taste match algorithm (0-100% compatibility calculation)
- Username validation (clean @usernames)
- User profile pages (`/[username]`)
- Follow/unfollow functionality
- Three-tab friend system (Following / Followers / Discover)
- Smart friend suggestions with mutual friends
- Privacy settings (public/private profiles)

#### Core Platform ✅
- Google OAuth authentication
- TMDB API integration
- **Season-specific TV tracking** (e.g., "The Bear - Season 2")
- Watch status tracking (want / watching / watched)
- Rating system (meh / like / love)
- Activity feed with likes and comments
- Top 3 shows feature
- Dark mode support

---

## Priority Matrix

### 🔥 Critical Priority (Next 2 Weeks)

#### 1. Episode-Level Tracking ⭐ RECOMMENDED

**Why This Is Perfect for Been Watching:**
Your app already treats each season as a separate entity! Unlike competitors tracking "entire series", you're already season-specific, so episode tracking is a natural extension.

**Status:** Not Started
**Complexity:** High
**Estimated Time:** 2-3 days

**MVP Implementation:**
```
The Bear - Season 2
━━━━━━━━━━━━━━━━
Episodes: 5 / 10 watched (50%)
Current: S2E5 "Pasta"
Next: S2E6 "Fishes"

[Mark Next Episode Watched]
```

**Database Changes:**
```sql
ALTER TABLE watch_status ADD COLUMN episodes_watched INTEGER DEFAULT 0;
ALTER TABLE watch_status ADD COLUMN total_episodes INTEGER;
-- episode_number column (nullable) for optional episode-level tracking
```

**Implementation Plan:**
1. Add database columns for episode tracking
2. Fetch episode count from TMDB when status = "watching"
3. Add "Next Episode" button to MediaDetailModal
4. Show episode progress in activity feed (e.g., "5/10 episodes")
5. Display progress bar on profile cards

**New Media ID Format:**
```typescript
'tv-110492-s1'        // Current: Season-level (default)
'tv-110492-s1e5'      // New: Episode-level (optional)
```

**Activity Feed Examples:**
```
@nick watched S2E5 of The Bear
"That scene in the kitchen! 🤯"
```

**Phase 1 (MVP - Start Here):**
- Track current episode number (integer counter)
- "Next Episode" button to increment
- Show "X/Y episodes" in feed and profile
- Progress bar visualization
- Auto-complete season when episodes_watched = total_episodes

**Phase 2 (Future Enhancement):**
- Individual episode checkboxes
- Episode titles and air dates from TMDB
- Discussion threads per episode
- Bulk "Mark Season Complete"
- Rewatch tracking

**Open Questions (from Nick):**
- Can we pull episode titles from TMDB?
- Can we show episode release dates?
- How do we handle series with weekly new episode releases?

---

#### 2. Show Notes Feature ⭐ KILLER FEATURE

**From SOCIAL-ACTIVITY-STRATEGY.md** - This is what makes Been Watching special!

**Status:** Database Ready, UI Not Built
**Complexity:** Medium
**Estimated Time:** 3-4 days

**Concept:** Twitter-like micro-reviews (280 characters max)

**Real Use Cases:**
- "Recommended by Sarah at work"
- "Perfect comfort watch for rainy days"
- "The finale made me cry for an hour"
- "Skip season 2, trust me"
- "Watch this if you loved Breaking Bad"

**Key Features:**
- 280 character limit (quick, not intimidating)
- **Public** (shows in feed, default) or **Private** (personal journal)
- Can like and comment on public notes
- Edit/delete your own notes
- Shows in activity feed: "@nick wrote a note about The Bear"

**Database (Already Created):**
```sql
CREATE TABLE show_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  media_id TEXT NOT NULL,
  note_text TEXT CHECK (length(note_text) <= 280),
  visibility TEXT CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**UI Implementation:**
```
Media Detail Modal
━━━━━━━━━━━━━━━━━━━
[Rate: ❤️ 👍 😐]
[Status: Want | Watching | Watched]

✍️ Add your note... (280 chars)
┌─────────────────────────────┐
│ "Perfect comfort watch!"    │
│ 25/280                      │
│ ☐ Private note              │
│ [Cancel] [Post Note]        │
└─────────────────────────────┘
```

**UI Locations:**
- MediaDetailModal: Note input after rating
- Activity Feed: "Show Note" activity card type
- User Profile: "Notes" tab
- Media Detail: All public notes for this show

**Implementation Phases:**
1. Create note API routes (POST/PUT/DELETE)
2. Build note composer component
3. Display notes in activity feed
4. Add "Notes" tab to profiles
5. Enable likes/comments on public notes
6. Test public vs private visibility

**Open Questions (from Nick):**
- Can we allow notes regardless of watchlist status?
- Should prompt be generic "Add your note" vs "What did you think?" to support pre-watch notes (e.g., "Sarah recommended this")?

---

#### 3. Notification System (UI Polish)

**Status:** Complete (as of January 2025)
**Needs:** Potential refinements based on user feedback

**Current Implementation:**
- ✨ Bell icon in header (not sparkle as originally planned)
- Unread count badge
- Dropdown with recent notifications
- Click notification → navigate to relevant page
- Mark as read on click
- "Mark all as read" button

**Supported Types:**
- `like`: Someone liked your activity
- `comment`: Someone commented on your activity
- `follow`: Someone followed you
- `show_note`: Someone added a note to a show you love (future)

**Open Question (from Nick):**
- Is this about on-device push notifications or just in-app notifications?

---

### ⭐ High Priority (Next Month)

#### 4. Enhanced Activity Feed

**Status:** Basic version working
**Complexity:** Medium
**Estimated Time:** 3-4 days

**Improvements Needed:**
- Pagination/infinite scroll (currently shows all activities)
- Filter by activity type (ratings, status changes, show notes)
- Pull-to-refresh on mobile
- Real-time updates (Supabase Realtime)
- **Activity Consolidation:** Combine related activities (e.g., add + rate + comment = 1 activity instead of 3)

**Filters (Future - may not be needed):**
```
┌─────────────────────────────┐
│ [All] [Following] [Movies]  │
│ [TV Shows] [Notes]           │
└─────────────────────────────┘
```

**Note from Nick:** Once we have enough user activity, feed will only show friends/following, so global filter buttons may not be needed.

**Real-time Updates:**
- Show "5 new posts" banner when new activities detected
- Click to reload and scroll to top
- No auto-refresh interrupting user scroll

---

#### 5. @Mentions System

**Status:** Not Started
**Complexity:** Medium
**Estimated Time:** 2-3 days

**Features:**
- @username mentions in comments and show notes
- Autocomplete dropdown while typing (search followers/following)
- Click mention → navigate to user profile
- Notification when mentioned
- Mention parsing and clickable links

**Technical Implementation:**
```typescript
// Parse mentions:
const text = "You gotta watch this @taylormurto!"
const mentions = text.match(/@[\w_]+/g)
// ["@taylormurto"]

// Store in activity_data:
{
  mentions: ["user-id-here"],
  raw_text: "You gotta watch this @taylormurto!"
}

// Render as links:
<span>You gotta watch this <a href="/taylormurto">@taylormurto</a>!</span>
```

---

#### 6. Private Account Improvements

**Status:** Basic toggle exists
**Complexity:** Low
**Estimated Time:** 2 days

**Current Limitations:**
- No follow request approval flow
- No UI to manage follower requests
- No notification when someone requests to follow

**Improvements:**
- Follow request approval screen
- Pending requests indicator
- Accept/deny buttons with notifications
- Optional "auto-approve" setting

---

### 👍 Medium Priority (Next 2-3 Months)

#### 7. Show Recommendations (Hold for Future)

**Status:** Algorithm ready (taste match), no UI
**Complexity:** Medium
**Estimated Time:** 3-4 days

**Features:**
- "Recommended for you" section on home page
- Based on taste match with users you follow (70%+ compatibility)
- "Because you liked [Show X]" reasoning
- Option to dismiss recommendations
- "Already watched" option

**Algorithm:**
1. Find users with high taste match (70%+)
2. Get shows they loved that you haven't seen
3. Rank by number of similar users who loved it, recency, genre match
4. Return top 10 recommendations

**Note:** Saving for future implementation after core features stable.

---

#### 8. Advanced Search & Filters

**Status:** Enhanced search modal complete ✅ (December 2025)
**Complexity:** Medium
**Estimated Time:** 3-4 days

**Completed (December 2025):**
- ✅ Redesigned search modal with "Add or Rate a Show" header
- ✅ Trending suggestions when search is empty (6 items, 3x2 grid)
- ✅ Watchlist filtering (excludes shows user already has)
- ✅ Full-modal flip to show details (matches activity feed cards)
- ✅ Up to 20 search results
- ✅ iOS-safe scrolling with custom JS scroll system
- ✅ Fixed modal size (398x645px, matches feed cards)
- ✅ See: `docs/features/search-improvements-status.md`

**Future Improvements:**
- Filter by genre
- Filter by year range
- Filter by streaming service
- "On Netflix" / "On HBO" quick filters
- Recently added to streaming services
- **Smarter search:** Handle partial matches (e.g., "super bob" finds "SuperBob")

**Open Question (from Nick):**
- Can we make search less literal? Example: "super bob" should find "SuperBob"

---

#### 9. Import from Other Platforms (Not Needed Now)

**Status:** Not Started
**Complexity:** High
**Estimated Time:** 5-7 days per platform

**Platforms to Support:**
- Letterboxd (CSV export)
- IMDb (CSV export)
- Trakt.tv (API or CSV)
- TV Time (CSV export)

**Note:** Saving for post-v1.0 implementation.

---

#### 10. Export User Data (Not Needed Now)

**Status:** Not Started
**Complexity:** Low
**Estimated Time:** 1-2 days

**Features:**
- Export all user data as JSON
- Export watch history as CSV
- GDPR compliance
- Include in user settings

**Note:** Saving for post-v1.0 implementation.

---

### 🎨 Polish & UX (Ongoing)

#### 11. Mobile App (PWA)

**Status:** Works as PWA, not optimized
**Complexity:** Medium
**Estimated Time:** 4-5 days

**Improvements:**
- Add to homescreen prompt
- Offline support with service worker
- Push notifications (requires service worker)
- App icon and splash screens
- iOS/Android specific optimizations

---

#### 12. Performance Optimizations

**Status:** Works well now, will need optimization at scale
**Complexity:** Medium

**Areas to Optimize:**
- Activity feed loading time
- Image lazy loading
- TMDB API request caching
- Database query optimization
- Bundle size reduction

---

#### 13. Accessibility (A11y)

**Status:** Basic keyboard nav exists
**Complexity:** Medium
**Estimated Time:** 3-4 days

**Improvements:**
- Full keyboard navigation
- Screen reader support (ARIA labels throughout)
- Focus management in modals
- Color contrast WCAG AAA
- Reduced motion support

---

## Additional Ideas (From Nick)

### Custom Lists / Categories (Future)
- Allow users to create custom lists beyond the default watchlists
- Examples: "Top 10 Holiday Movies", "Top 10 Action", "Guilty Pleasures", "Comfort Shows"
- Could be public or private
- Shareable with friends
- Potential for community-curated lists
- **Added:** December 2025

### Social Sharing
- Share shows, top three, or profile to IG stories
- Pre-designed share graphics
- Custom OG images per share

### BW Social Accounts
- Weekly top 10 most popular shows
- Content creation for Been Watching official accounts
- Community highlights

### Advertising Platform (Future)
- Show-focused ads (e.g., "Landman coming soon - add to Want to Watch")
- View trailer integration
- Native ad format that feels like content
- Robust ad platform for future monetization

**Note:** Will need careful implementation to avoid disrupting UX.

---

## Features We're NOT Building

### Direct Messages (DMs)

**Decision:** Intentionally not building

**Reasoning:**
- ❌ High moderation burden (harassment, spam)
- ❌ Privacy/safety concerns (encryption, storage)
- ❌ Infrastructure complexity (real-time messaging)
- ❌ Shifts focus from **public discovery** to **private conversations**
- ❌ **Not core to "been watching" value proposition**
- ✅ **Instead:** Emphasize public social engagement (comments, @mentions, notes)

**Alternative:** Public comments, @mentions, and show notes create social interaction without DM complexity.

---

### Stories/Temporary Content

**Decision:** Not building

**Reasoning:**
- Everything should be permanent and searchable
- No FOMO pressure on users
- Easier to build discovery with permanent content

---

### Video/Photo Upload

**Decision:** Not building

**Reasoning:**
- Expensive to host and moderate
- Focus on text-based content
- TMDB provides all media we need

---

### Algorithmic Feed

**Decision:** Chronological only (for now)

**Reasoning:**
- Transparency: users know what they're seeing
- No engagement manipulation
- Simple and predictable

**Note from Nick:** We will add this later as user base grows to help present new show ideas.

---

## Version Milestones

### v0.2.0 - Beta Release (Target: February 2025)

**Goal:** Expand to 50-100 beta testers

**Must-Have:**
- ✅ Episode-level tracking
- ✅ Show notes feature
- ✅ Enhanced activity feed (pagination + activity consolidation)
- ✅ All alpha users actively engaged

**Success Metrics:**
- 50+ active users
- 500+ shows tracked
- 1000+ activities created
- Average 3+ follows per user
- 70%+ retention after 1 week

---

### v0.5.0 - Public Beta (Target: March 2025)

**Goal:** Open to anyone with invite code

**Must-Have:**
- ✅ @Mentions system
- ✅ Private account improvements
- ✅ Show recommendations
- ✅ Advanced search
- ✅ PWA optimizations

**Success Metrics:**
- 200+ active users
- 2000+ shows tracked
- 5000+ activities
- Average 5+ follows per user
- 80%+ retention after 1 week

---

### v1.0.0 - Public Launch (Target: April-May 2025)

**Goal:** Remove invite requirement, open to public

**Must-Have:**
- ✅ All v0.5.0 features stable
- ✅ Import from other platforms
- ✅ Export user data (GDPR)
- ✅ Accessibility improvements
- ✅ Performance optimizations
- ✅ Mobile app (PWA) fully polished
- ✅ Comprehensive help documentation
- ✅ Community guidelines enforcement tools

**Success Metrics:**
- 1000+ active users in first month
- 50%+ retention after 30 days
- Average 10+ follows per user
- Less than 1% spam/abuse reports
- 4+ star average user rating

---

## Marketing & Growth Strategy

### Phase 1: Alpha (Current)
- 10+ alpha users (Boozehounds + invited testers)
- Word-of-mouth to close friends
- Focus on product iteration

### Phase 2: Beta (February 2025)
- 50-100 invite codes distributed
- Each user gets 5 invite codes to share
- Soft launch on social media (Twitter, Instagram)
- Target: TV/movie podcasters, film Twitter

**Invite System (Implemented):**
- Users earn +1 invite for completing profile (avatar, bio, top 3, watchlists)
- Users earn +1 invite for every 20 shows added to watchlists (repeating)
- Invite tokens never expire (one-time use only)
- Staggered invite release: existing users get invites, new invitees must earn via profile completion

### Phase 3: Public Beta (March 2025)
- Remove hard invite requirement
- Unlimited signups with WAITLIST code
- Paid ads on social media
- Partnerships with podcasts/YouTubers
- Press outreach to tech blogs

### Phase 4: Public Launch (May 2025)
- Full public availability
- Press releases
- Product Hunt launch
- Reddit/Hacker News posts
- Influencer partnerships

---

## Competitive Analysis

### Key Competitors

1. **Letterboxd** (movies only)
   - Strengths: Large community, beautiful design
   - Weaknesses: No TV shows, expensive Pro subscription

2. **TV Time** (TV shows only)
   - Strengths: Episode tracking, streaming availability
   - Weaknesses: Cluttered UI, heavy ads, limited social

3. **Trakt.tv** (movies & TV)
   - Strengths: Comprehensive tracking, API access
   - Weaknesses: Outdated UI, technical/nerdy focus

### Our Differentiators

1. **Season-Specific Tracking:** Track individual seasons, not just full series
2. **Taste Match Algorithm:** Quantified compatibility with friends (0-100%)
3. **Show Notes:** Quick micro-reviews (280 chars like Twitter)
4. **Social-First:** Built for discovery through friends, not algorithms
5. **Mobile-First:** Optimized for phone use
6. **Invite-Only Quality:** Curated community during growth phase

---

## Monetization Plan (Post-v1.0.0)

### Not for Initial Launch
- Focus on product-market fit first
- Build user base before monetization
- Avoid compromising user experience

### Future Options (Exploration Only)

1. **Premium Tier ($2.99/month)**
   - Advanced statistics and insights
   - Export to more formats
   - Unlimited top shows (free: 3, premium: 10)
   - Custom profile themes
   - Priority support

2. **Streaming Service Affiliate Links**
   - "Watch on Netflix" button with referral tracking
   - Revenue share with streaming services
   - Non-intrusive, adds value for users

3. **B2B API Access**
   - Studios/networks access aggregated data
   - Trend analysis and audience insights
   - Premium pricing for commercial use

4. **Native Advertising (from Nick's ideas)**
   - Show-focused ads (e.g., "Landman premiering soon")
   - Add to Want to Watch list + view trailer
   - Robust ad platform that feels like content, not interruptions

**Will NOT Do:**
- Traditional display ads (ruins UX)
- Sell user data (violates trust)
- Severe freemium limitations (keep core features free)

---

## Technical Debt to Address

### Before v1.0.0

1. **ActivityCard Refactor:** Inline styles for theme consistency
2. **TypeScript Improvements:** Remove all `any` types, add proper interfaces
3. **Error Boundaries:** Comprehensive error handling throughout app
4. **Test Coverage:** Unit tests for utilities (tasteMatch, validation)
5. **API Rate Limiting:** Request queuing for TMDB API
6. **Database Indexes:** Optimize for common queries as user base grows
7. **Monitoring:** Better error tracking (Sentry configured)

---

## Development Principles

### Core Values

1. **User Privacy First:** Minimal data collection, maximum control
2. **Transparency:** Open about roadmap, decisions, data usage
3. **Quality Over Quantity:** Fewer features that work great
4. **Mobile-First:** Optimize for where users actually are
5. **Community-Driven:** Listen to users, adapt based on feedback

### Technical Principles

1. **TypeScript Everywhere:** Type safety prevents bugs
2. **Server Components:** Minimize client-side JavaScript
3. **Accessible by Default:** Don't add inaccessible features
4. **Performance Matters:** Fast load times = happy users
5. **Simple Architecture:** Avoid over-engineering

---

## Success Metrics Dashboard

### User Engagement (Target by v1.0.0)
- Daily Active Users: 300+
- Weekly Active Users: 700+
- Monthly Active Users: 1000+
- Average session time: 5+ minutes
- Sessions per user per week: 7+

### Content Metrics
- Shows tracked per user: 50+ average
- Ratings per user: 30+ average
- Activities per user: 40+ average
- Comments per user: 10+ average
- Show notes per user: 5+ average

### Social Metrics
- Average follows per user: 10+
- Average followers per user: 10+
- Follow back rate: 60%+
- Taste match quality: 70%+ average between mutual follows

### Technical Metrics
- Page load time: <2 seconds
- API response time: <500ms
- Error rate: <1%
- Uptime: 99.5%+

---

## Next Steps (Tomorrow)

**Start with Episode Tracking MVP:**

1. Add database columns:
   ```sql
   ALTER TABLE watch_status ADD COLUMN episodes_watched INTEGER DEFAULT 0;
   ALTER TABLE watch_status ADD COLUMN total_episodes INTEGER;
   ```

2. Create TMDB API route to fetch episode count:
   ```
   GET /api/tmdb/tv/[id]/season/[season_number]
   ```

3. Update MediaDetailModal:
   - Fetch total episodes when status = "watching"
   - Show progress UI (5/10 episodes)
   - Add "Next Episode" button

4. Update activity feed:
   - Show episode info in activities
   - Add progress bar to "watching" cards

5. Test with shows:
   - The Bear - Season 2
   - The Last of Us
   - Shogun

**Estimated Time:** 2-3 days

---

**Document Version:** 2.0 (Consolidated)
**Last Updated:** January 23, 2025
**Next Review:** February 1, 2025

*Consolidated from: ROADMAP-2025.md (Jan 22, 2025) + ROADMAP-CURRENT.md (Jan 23, 2025)*

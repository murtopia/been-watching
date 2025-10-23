# Been Watching - Current Roadmap & Priorities

**Last Updated:** January 23, 2025
**Version:** 0.1.0 → 1.0.0 Plan
**Status:** Private Alpha Testing

---

## Current Phase: Alpha Testing (v0.1.0)

### Active Users
- **Boozehounds (4 alpha users)**
  - Nick (murtopia) - 131+ shows
  - Taylor (@taylormurto) - Ready for migration
  - Todd (@toddles) - Ready for migration
  - Pat (@mossy) - Ready for migration

### Immediate Goals
1. Complete data migration for all 4 Boozehounds (~363 shows total)
2. Gather feedback on core features
3. Fix critical bugs discovered during alpha
4. Validate taste match algorithm accuracy
5. Test social features with real usage patterns

---

## Priority Matrix

### 🔥 Critical Priority (Next 2 Weeks)
**Must-have features for expanding beyond alpha testers**

#### 1. Episode-Level Tracking
**Status:** Not Started
**Complexity:** High
**Why Critical:** Users want to track which episode they're on, not just which season

**Implementation:**
```typescript
// New media ID format:
'tv-110492-s1'        // Current: Season-level
'tv-110492-s1e5'      // New: Episode-level

// Optional episode tracking:
- If no episode specified, defaults to season-level
- Users can optionally mark current episode
- "Mark Season Complete" bulk action
```

**Database Changes:**
- Add `episode_number` column to `watch_status` (nullable)
- Add `total_episodes` to `media` table for progress tracking
- Update activity triggers to handle episode data

**UI Changes:**
- Episode selector in MediaDetailModal
- Episode progress indicator (e.g., "5/10 episodes")
- "Next Episode" quick action button

**Estimated Time:** 2-3 days

---

#### 2. Show Notes Feature (KILLER FEATURE)
**Status:** Database Ready, UI Not Built
**Complexity:** Medium
**Why Critical:** Core differentiator, Twitter-like micro-reviews

**Implementation:**
```typescript
// show_notes table (already created):
- id: UUID
- user_id: UUID
- media_id: TEXT
- note_text: TEXT (max 280 chars)
- visibility: 'public' | 'private'
- created_at: TIMESTAMPTZ

// Features:
- Quick "What did you think?" input after rating
- Character count (280 max like Twitter)
- Public by default (can toggle private)
- Shows in activity feed as special post type
- Appears on media detail pages
```

**UI Locations:**
- MediaDetailModal: Add note input after rating
- Activity Feed: New "Show Note" activity card
- User Profile: Show notes tab
- Media Detail: All public notes for this show

**Estimated Time:** 3-4 days

---

#### 3. Notification System (UI)
**Status:** Database Complete, No UI
**Complexity:** Medium
**Why Critical:** Users need to know when people interact with their content

**Implementation:**
```typescript
// Use ✨ sparkle icon (NOT bell icon)
// Types to support:
- 'like': Someone liked your activity
- 'comment': Someone commented on your activity
- 'follow': Someone followed you
- 'show_note': Someone added a note to a show you love

// UI Requirements:
- Sparkle icon in header (count badge if unread)
- Dropdown with recent notifications
- Click notification → navigate to relevant page
- Mark as read on click
- "Mark all as read" button
```

**Database Already Has:**
- `notifications` table with all fields
- Triggers need to be created for auto-insertion

**Estimated Time:** 2-3 days

---

### ⭐ High Priority (Next Month)

#### 4. Enhanced Activity Feed
**Status:** Basic version working
**Complexity:** Medium

**Improvements Needed:**
- Pagination/infinite scroll (currently shows all)
- Filter by activity type (ratings, status changes, show notes)
- Filter by friend/following only
- Sort options (recent, popular, friends)
- Pull-to-refresh on mobile
- Real-time updates (Supabase Realtime)

**Estimated Time:** 3-4 days

---

#### 5. @Mentions System
**Status:** Not Started
**Complexity:** Medium

**Features:**
- @username mentions in comments and show notes
- Autocomplete dropdown while typing
- Click mention → navigate to user profile
- Notification when mentioned
- Mention parsing and link generation

**Technical:**
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
<span>You gotta watch this <a href="/user/taylormurto">@taylormurto</a>!</span>
```

**Estimated Time:** 2-3 days

---

#### 6. Private Account Improvements
**Status:** Basic toggle exists
**Complexity:** Low

**Current Limitations:**
- No follow request approval flow
- No UI to manage follower requests
- No notification when someone requests to follow

**Improvements:**
- Follow request approval screen
- Pending requests indicator
- Accept/deny buttons with notifications
- Optional "auto-approve" setting for private accounts

**Estimated Time:** 2 days

---

### 👍 Medium Priority (Next 2-3 Months)

#### 7. Show Recommendations
**Status:** Algorithm ready (taste match), no UI
**Complexity:** Medium

**Features:**
- "Recommended for you" section on home page
- Based on taste match with users you follow
- "Because you liked [Show X]" reasoning
- Option to dismiss recommendations
- "Already watched" option

**Algorithm:**
```typescript
// Use existing taste match algorithm:
1. Find users with high taste match (70%+)
2. Get shows they loved that you haven't seen
3. Rank by:
   - Number of similar users who loved it
   - Recency of their ratings
   - Genre match with your favorites
4. Return top 10 recommendations
```

**Estimated Time:** 3-4 days

---

#### 8. Advanced Search & Filters
**Status:** Basic search works
**Complexity:** Medium

**Improvements:**
- Filter by genre
- Filter by year range
- Filter by rating (TMDB)
- Filter by streaming service
- "On Netflix" / "On HBO" quick filters
- Recently added to streaming services

**Technical:**
- TMDB supports genre and year filters
- Streaming service data available via TMDB API
- Need to cache streaming availability (changes frequently)

**Estimated Time:** 3-4 days

---

#### 9. Import from Other Platforms
**Status:** Not Started
**Complexity:** High

**Platforms to Support:**
- Letterboxd (CSV export)
- IMDb (CSV export)
- Trakt.tv (API or CSV)
- TV Time (CSV export)

**Features:**
- Upload CSV file
- Map columns to our format
- Preview import (show what will be added)
- Duplicate detection
- Option to import ratings vs just titles

**Estimated Time:** 5-7 days per platform

---

#### 10. Export User Data
**Status:** Not Started
**Complexity:** Low

**Features:**
- Export all user data as JSON
- Export watch history as CSV
- Export ratings as CSV
- GDPR compliance
- Include in user settings page

**Estimated Time:** 1-2 days

---

### 🎨 Polish & UX (Ongoing)

#### 11. Mobile App (PWA)
**Status:** Works as PWA, not optimized
**Complexity:** Medium

**Improvements:**
- Add to homescreen prompt
- Offline support with service worker
- Push notifications (requires service worker)
- App icon and splash screens
- iOS/Android specific optimizations

**Estimated Time:** 4-5 days

---

#### 12. Performance Optimizations
**Status:** Works well now, will need optimization at scale
**Complexity:** Medium

**Areas to Optimize:**
- Activity feed loading time (currently loads all)
- Image lazy loading and optimization
- TMDB API request caching
- Database query optimization
- Bundle size reduction

**Estimated Time:** Ongoing

---

#### 13. Accessibility (A11y)
**Status:** Basic keyboard nav, needs improvement
**Complexity:** Medium

**Improvements:**
- Full keyboard navigation
- Screen reader support
- ARIA labels throughout
- Focus management in modals
- Color contrast WCAG AAA
- Reduced motion support

**Estimated Time:** 3-4 days

---

### 🚫 Features We're NOT Building

#### Direct Messages (DMs)
**Decision:** Intentionally not building
**Reasoning:**
- Encourages public discussion and community
- Reduces moderation burden
- Keeps focus on shared content, not private convos
- Alternative: Comments and show notes are public by design

#### Stories/Temporary Content
**Decision:** Not building
**Reasoning:**
- Everything should be permanent and searchable
- No FOMO pressure on users
- Easier to build discovery features with permanent content

#### Video/Photo Upload
**Decision:** Not building
**Reasoning:**
- Expensive to host and moderate
- Focus on text-based content and discussions
- TMDB provides all media we need

#### Algorithmic Feed
**Decision:** Chronological only
**Reasoning:**
- Transparency: users know what they're seeing
- No engagement manipulation
- Simple and predictable

---

## Version Milestones

### v0.2.0 - Beta Release (Target: February 2025)
**Goal:** Expand to 50-100 beta testers

**Must-Have:**
- ✅ Episode-level tracking
- ✅ Show notes feature
- ✅ Notification UI
- ✅ Enhanced activity feed
- ✅ All Boozehounds fully migrated

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
- ✅ Export user data
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

## Feature Request Process

### How Users Can Submit Ideas
1. Email: hello@beenwatching.com
2. In-app feedback (planned for v0.3.0)
3. Community Discord (planned for v0.5.0)

### Evaluation Criteria
1. **Alignment with Core Mission:** Does it help users track and discover content?
2. **User Demand:** How many users are asking for this?
3. **Technical Complexity:** Can we build it without major refactoring?
4. **Maintenance Burden:** Will it require ongoing support?
5. **Revenue Impact:** (Future consideration once we add monetization)

### Feature Voting
- Planned for v0.5.0
- Users can upvote feature requests
- Top 10 voted features reviewed monthly
- Transparency on roadmap priorities

---

## Technical Debt to Address

### Before v1.0.0
1. **ActivityCard Refactor:** Convert from global CSS to inline styles for theme consistency
2. **TypeScript Improvements:** Remove all `any` types, add proper interfaces
3. **Error Boundaries:** Add comprehensive error handling throughout app
4. **Test Coverage:** Add unit tests for critical utilities (tasteMatch, usernameValidation)
5. **API Rate Limiting:** Implement request queuing for TMDB API
6. **Database Indexes:** Optimize for common query patterns as user base grows
7. **Monitoring:** Add better error tracking (Sentry already configured)

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

## Competitive Analysis

### Key Competitors
1. **Letterboxd** (movies only)
   - Strengths: Large community, beautiful design, film-focused
   - Weaknesses: No TV shows, expensive Pro subscription

2. **TV Time** (TV shows only)
   - Strengths: Episode tracking, streaming availability
   - Weaknesses: Cluttered UI, heavy ads, no social features

3. **Trakt.tv** (movies & TV)
   - Strengths: Comprehensive tracking, API access
   - Weaknesses: Outdated UI, technical/nerdy focus

### Our Differentiators
1. **Season-Specific Tracking:** Track individual seasons, not just full series
2. **Taste Match Algorithm:** Quantified compatibility with friends
3. **Show Notes:** Quick micro-reviews (280 chars like Twitter)
4. **Social-First:** Built for discovery through friends, not algorithms
5. **Mobile-First:** Optimized for phone use, not desktop
6. **Invite-Only Quality:** Curated community, not open free-for-all

---

## Marketing & Growth Strategy

### Phase 1: Alpha (Current)
- 4 Boozehounds only
- Word-of-mouth to close friends
- Focus on product iteration

### Phase 2: Beta (February 2025)
- 50-100 invite codes distributed
- Each user gets 5 invite codes to share
- Soft launch on social media (Twitter, Instagram)
- Target communities: TV/movie podcasters, film Twitter

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
   - Studios/networks can access aggregated data
   - Trend analysis and audience insights
   - Premium pricing for commercial use

**Will NOT Do:**
- Traditional ads (ruins user experience)
- Sell user data (violates trust)
- Freemium with severe limitations (keeps core features free)

---

## Community Guidelines Enforcement

### Current State
- Guidelines page exists
- No enforcement tools yet
- Relying on small, trusted community

### Before Public Launch (v1.0.0)
1. **Report System**
   - Report button on activities, comments, profiles
   - Categories: Spam, harassment, inappropriate content
   - Queue for admin review

2. **Moderation Tools**
   - Admin dashboard for reports
   - Ban user functionality
   - Delete activity/comment
   - Issue warnings

3. **Automated Detection**
   - Spam detection (repeated content)
   - Profanity filter (optional toggle per user)
   - Rate limiting on posts

4. **Appeals Process**
   - Users can appeal bans
   - Transparent reasoning for actions
   - Restoration if appeal accepted

---

## Development Principles

### Core Values
1. **User Privacy First:** Minimal data collection, maximum control
2. **Transparency:** Open about roadmap, decisions, and data usage
3. **Quality Over Quantity:** Better to have fewer features that work great
4. **Mobile-First:** Optimize for where users actually are (their phones)
5. **Community-Driven:** Listen to users, adapt based on feedback

### Technical Principles
1. **TypeScript Everywhere:** Type safety prevents bugs
2. **Server Components:** Minimize client-side JavaScript
3. **Accessible by Default:** Don't add features that aren't accessible
4. **Performance Matters:** Fast load times = happy users
5. **Simple Architecture:** Avoid over-engineering

---

## Questions to Resolve

### Before v0.2.0
- [ ] Should episode tracking be optional or mandatory?
- [ ] Should show notes appear as their own feed item or attached to ratings?
- [ ] What notification types are most important to users?

### Before v1.0.0
- [ ] How do we handle spam and abuse at scale?
- [ ] Should we build native mobile apps or focus on PWA?
- [ ] What's the right balance of public vs private features?
- [ ] How do we differentiate from competitors long-term?

---

**Document Version:** 1.0
**Last Updated:** January 23, 2025
**Next Review:** February 1, 2025

---

## Changelog

**January 23, 2025**
- Initial comprehensive roadmap document created
- Consolidated priorities from ROADMAP-2025.md and other sources
- Added success metrics and timelines
- Defined feature freeze points for each version

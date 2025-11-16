# Been Watching - Product Roadmap 2025 (Corrected)

**Last Updated:** January 22, 2025
**Current Version:** v0.2.0 (Alpha)
**Live Site:** beenwatching.com

**Based on:** SOCIAL-ACTIVITY-STRATEGY.md and previous planning sessions

---

## ✅ Recently Completed (January 2025)

### Notification System
- ✅ Notification bell icon with unread badge counter
- ✅ Dropdown showing recent notifications
- ✅ Real-time updates (30-second polling)
- ✅ Notifications for follow, like, and comment actions
- ✅ Mark all as read functionality
- ✅ Smart prevention of self-notifications
- ✅ Clickable notifications route to relevant content

### Social Discovery System (October 2024)
- ✅ Taste match algorithm (calculates compatibility 0-100%)
- ✅ Username validation (clean @usernames, no timestamps)
- ✅ User profile pages (`/user/[username]`)
- ✅ Follow/unfollow functionality
- ✅ Three-tab friend system (Following / Followers / Discover)
- ✅ Smart friend suggestions with mutual friends
- ✅ Privacy settings (public/private profiles)

### Core Platform Features
- ✅ Google OAuth authentication
- ✅ TMDB API integration for media search
- ✅ **Season-specific TV tracking** (e.g., "The Bear - Season 2")
- ✅ Watch status tracking (want / watching / watched)
- ✅ Rating system (meh / like / love)
- ✅ Activity feed with likes and comments
- ✅ Top 3 shows feature
- ✅ Dark mode support

---

## 🎯 High-Priority Features (Approved & Planned)

### 1. Episode Tracking for TV Shows ⭐ RECOMMENDED

**Why This Is Perfect for Been Watching:**
- Your app already treats each season as a separate entity!
- Unlike other apps tracking "entire series", you're already season-specific
- Episode tracking becomes a natural, simple extension

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
```

**How It Works:**
1. When user marks season as "watching", fetch episode count from TMDB
2. Show "Next Episode" button on media detail modal
3. Increment `episodes_watched` counter
4. Auto-complete season when `episodes_watched = total_episodes`
5. Show progress bar on cards and in feed

**Activity Feed:**
```
@nick watched S2E5 of The Bear
"That scene in the kitchen! 🤯"
```

**User Profile Cards:**
```
Currently Watching:
┌─────────────────────┐
│ [Poster]            │
│ The Bear - Season 2 │
│ Episode 5/10        │
│ ████████░░ 50%      │
└─────────────────────┘
```

**Phase 1 (Simple - Start Here):**
- Track current episode number (just an integer)
- "Next Episode" button to increment
- Show "X/Y episodes" in feed
- Progress bar on profile

**Phase 2 (Later - More Detail):**
- Individual episode checkboxes
- Episode titles and air dates from TMDB
- Discussion threads per episode
- Bulk mark entire season
- Rewatch tracking

**Estimated Time:** 2-3 days for MVP

---

### 2. Show Notes Feature ⭐ KILLER FEATURE

**From SOCIAL-ACTIVITY-STRATEGY.md** - This is what makes Been Watching special!

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

**UI:**
```
Media Detail Modal
━━━━━━━━━━━━━━━━━━━
[Rate: ❤️ 👍 😐]
[Status: Want | Watching | Watched]

✍️ Write a note... (280 chars)
┌─────────────────────────────┐
│ "Perfect comfort watch!"    │
│ 25/280                      │
│ ☐ Private note              │
│ [Cancel] [Post Note]        │
└─────────────────────────────┘
```

**Database:**
```sql
CREATE TABLE show_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  media_id TEXT NOT NULL,
  content TEXT CHECK (length(content) <= 280),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Phases:**
1. Create database table
2. Add note composer to MediaDetailModal
3. Create note API routes (POST/PUT/DELETE)
4. Display notes in activity feed
5. Show notes on user profile ("Notes" tab)
6. Enable likes/comments on public notes

**Estimated Time:** 3-4 days

---

### 3. Activity Feed Enhancements

**Current Issues:**
- No filtering (can't view just "following" or just "movies")
- No pagination (limited to recent 20 items)
- No "new posts available" indicator

**Improvements:**

#### Filters
```
┌─────────────────────────────┐
│ [All] [Following] [Movies]  │
│ [TV Shows] [Notes]           │
└─────────────────────────────┘
```

#### Infinite Scroll
- Load 20 items at a time
- "Load More" button or auto-scroll
- Preserve scroll position

#### Real-time Updates
- Show "5 new posts" banner when new activities detected
- Click to reload and scroll to top
- No auto-refresh interrupting user

**Estimated Time:** 2-3 days

---

### 4. @Mentions Support

**From SOCIAL-ACTIVITY-STRATEGY.md:**
- Tag friends in notes and comments
- Get notified when mentioned
- Autocomplete username suggestions (@tay → @taylormurto)
- Clickable mentions navigate to profiles

**Implementation:**
- Parse @username in note/comment text
- Create notification for mentioned user
- Highlight mentions in blue/gradient
- Link to user profile on click

**Estimated Time:** 2 days

---

## ❌ Features We're NOT Building

### Direct Messages (DMs)

**Decision:** Skip entirely (from SOCIAL-ACTIVITY-STRATEGY.md)

**Reasoning:**
- ❌ High moderation burden (harassment, spam)
- ❌ Privacy/safety concerns (encryption, storage)
- ❌ Infrastructure complexity (real-time messaging)
- ❌ Shifts focus from **public discovery** to **private conversations**
- ❌ **Not core to "been watching" value proposition**
- ❌ Instagram/Twitter already solve this need
- ✅ **Instead:** Emphasize public social engagement (comments, @mentions, notes)

**Alternative:** Public comments, @mentions, and show notes create social interaction without DM complexity.

---

## 🗓️ Recommended Implementation Timeline

### Week 1 (Starting Tomorrow)
**Focus: Episode Tracking MVP**
1. Add `episodes_watched` and `total_episodes` columns
2. Fetch episode count from TMDB when setting status to "watching"
3. Add "Next Episode" button to MediaDetailModal
4. Show episode count in activity feed
5. Display progress bar on profile cards

**Deliverable:** Users can track episode progress for TV shows

---

### Week 2
**Focus: Show Notes Feature**
1. Create `show_notes` database table
2. Build NoteComposer component
3. Add note API routes
4. Display notes in activity feed
5. Add "Notes" tab to user profiles
6. Test public vs private notes

**Deliverable:** Fully functional show notes

---

### Week 3
**Focus: Activity Feed Polish**
1. Add filter buttons (All/Following/Movies/TV)
2. Implement pagination/infinite scroll
3. Add "new posts" indicator
4. Polish loading states and animations

**Deliverable:** Better feed experience

---

### Week 4
**Focus: @Mentions Support**
1. Parse @username in text
2. Create mention notifications
3. Add autocomplete to note/comment input
4. Make mentions clickable

**Deliverable:** Full @mention functionality

---

## 🔧 Technical Debt & Improvements

### Performance
- [ ] Add database indexes for common queries
- [ ] Optimize activity feed query (currently loads all data)
- [ ] Implement skeleton loading states
- [ ] Image lazy loading and optimization
- [ ] Bundle size optimization

### Error Handling
- [ ] Graceful error messages
- [ ] Retry logic for failed API calls
- [ ] Offline mode detection
- [ ] Better Sentry error tracking

### Mobile
- [ ] Better touch targets
- [ ] Swipe gestures
- [ ] iOS splash screens
- [ ] PWA manifest improvements

---

## 📊 Future Enhancements (Not Immediate)

### Year in Review (Q2 2025)
- "Your 2025 in TV & Movies"
- Stats: shows watched, most loved genre, binge streak
- Shareable graphics

### Enhanced Recommendations (Q2 2025)
- "Because you loved [Show]" suggestions
- Based on friends who also loved it
- Trending among your friends

### Watch Parties (Q3 2025)
- Coordinate viewing with friends
- Live chat during episodes
- Synchronized play tracking

### Analytics Dashboard (Q3 2025)
- Personal viewing trends
- Genre preferences over time
- Completion rates
- Social compatibility rankings

---

## 💡 Why This Roadmap Works

### Plays to Been Watching's Strengths:
1. **Season-specific tracking** already exists → Episode tracking is natural
2. **Social discovery focus** → Notes enhance this without DM complexity
3. **Taste matching** → Activity feed filters help find compatible content
4. **Lightweight & fast** → No heavy messaging infrastructure

### Avoids Common Pitfalls:
1. **No DMs** → Avoids moderation/safety issues
2. **Public-first** → Encourages discovery over privacy
3. **Simple features** → Quick to ship, easy to use
4. **Season-based** → Unlike competitors tracking entire series

---

## 🎯 Success Metrics

**For Episode Tracking:**
- % of TV show activities with episode info (target: 60%+)
- Users who click "Next Episode" button
- Completion rate of seasons

**For Show Notes:**
- % of users who write at least one note (target: 30%+)
- Average notes per user per week
- Public vs private ratio (should favor public)
- Engagement on notes (likes/comments)

**For Activity Feed:**
- Filter usage rate
- Scroll depth
- Click-through rate on activities

---

## 📋 Next Steps for Tomorrow

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

5. Test with a few shows:
   - The Bear - Season 2
   - The Last of Us
   - Shogun

**Estimated Time:** Start tomorrow, finish in 2-3 days

---

**Questions before we start?** 🚀

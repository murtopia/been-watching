# Social Activity & Notifications Strategy

**Date:** January 2025
**Status:** Planning → Implementation
**Goal:** Build a lightweight social journaling system for TV/movies with smart engagement features

---

## 🎯 Core Philosophy

**Been Watching = Quick notes + taste matching + real-time discovery**

- **NOT Letterboxd:** We're not trying to be a review platform
- **NOT Twitter:** We're not a general social network
- **WE ARE:** A taste-sharing community focused on TV/movie discovery through friends

---

## ✅ Features We're Building

### 1. Notification System
**Icon:** NOT a bell (to avoid Letterboxd comparisons) - use a **sparkle/star ✨** or **activity pulse icon**

**What It Tracks:**
- ✅ Someone followed you
- ✅ Someone liked your rating/note
- ✅ Someone commented on your activity
- ✅ Someone @mentioned you (future)
- ✅ Friend joined Been Watching (future)

**UI Location:**
- Header icon with badge counter (e.g., ✨ 3)
- Dropdown panel when clicked
- Notifications are **clickable** → navigate to related activity/profile

**Notification Types:**
```
● @taylormurto started following you
  → Clicks to: /user/taylormurto

● @mossy liked your rating of King of the Hill
  → Clicks to: activity feed showing that specific activity

● @pat commented: "I need to rewatch this!"
  → Clicks to: activity with comments section expanded

● @taylor wrote a note about Peacemaker
  → Clicks to: activity showing their note
```

---

### 2. Show Notes Feature (Killer Feature)

**Concept:** Twitter-like micro-reviews/comments on shows

**Use Cases:**
- "Recommended by Sarah at work"
- "Perfect comfort watch for rainy days"
- "The finale made me cry for an hour"
- "Skip season 2, trust me"
- "Watch this if you loved Breaking Bad"

**Specifications:**
- **Character Limit:** 280 characters (Twitter-style)
- **Visibility Options:**
  - ☑️ Public (default) - Visible to followers, shows in feed
  - ☑️ Private Note - Only you can see it (personal journal)
- **Permissions:**
  - ✅ User can edit their own notes
  - ✅ User can delete their own notes
- **Engagement:**
  - Public notes can be liked
  - Public notes can be commented on
  - Shows up in activity feed as: "[User] wrote a note about [Show]"

**UI Placement:**
- Media detail modal, below rating/status buttons
- Button: "✍️ Write a note..." or "📝 Add a note..."
- User profile: "Notes" tab to see all their notes

**Activity Feed Display:**
```
┌─────────────────────────────────────────┐
│  🎬 jeremy m wrote a note about         │
│  King of the Hill - Season 1           │
│  [Show Poster]                          │
│                                         │
│  "This show is perfect comfort TV.     │
│   Recommended by @taylormurto"         │
│                                         │
│  🔒 Private note indicator if private  │
│  ❤️ 12    💬 3    [Like] [Comment]    │
└─────────────────────────────────────────┘
```

---

### 3. Enhanced Activity Feed

**Current Activity Types:**
- `rated` - User rated a show (love/like/meh)
- `status_changed` - User updated watch status (want/watching/watched)

**New Activity Types:**
- `followed` - User followed another user
- `noted` - User wrote a note about a show (public notes only)

**Feed Item Features:**
- Clickable usernames → user profiles
- Clickable show titles → media detail modal
- Likes on activities
- Comments on activities
- All generate notifications

---

## ❌ Features We're NOT Building

### Direct Messages (DMs)
**Decision:** Skip entirely

**Reasoning:**
- ❌ High moderation burden (harassment, spam)
- ❌ Privacy/safety concerns
- ❌ Infrastructure complexity (real-time, storage, encryption)
- ❌ Shifts focus from public discovery to private conversations
- ❌ Not core to "been watching" value proposition
- ❌ Instagram/Twitter already solve this need

**Alternative:** Emphasize public social engagement (comments, @mentions)

### Network Deep Links
**Decision:** Skip for now

**Reasoning:**
- Low ROI vs implementation complexity
- Each streaming service has different URL patterns
- TMDB doesn't provide deep links
- Focus on core social features first

---

## 🗄️ Database Schema Changes

### New Table: `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,        -- Who receives notification
  actor_id UUID REFERENCES profiles(id),                -- Who triggered it
  type TEXT NOT NULL,                                    -- 'follow', 'like_activity', 'comment', 'mentioned'
  target_type TEXT,                                      -- 'activity', 'comment', 'profile', 'note'
  target_id UUID,                                        -- ID of the thing being acted on
  activity_id UUID REFERENCES activities(id),           -- Direct link to activity if relevant
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### New Table: `show_notes`
```sql
CREATE TABLE show_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  media_id TEXT NOT NULL,                               -- Our internal media ID
  tmdb_id INTEGER,                                      -- TMDB ID for reference
  media_type TEXT,                                      -- 'tv' or 'movie'
  content TEXT NOT NULL CHECK (length(content) <= 280), -- 280 char limit
  is_private BOOLEAN DEFAULT false,                     -- Private note toggle
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_show_notes_user_id ON show_notes(user_id);
CREATE INDEX idx_show_notes_media_id ON show_notes(media_id);
CREATE INDEX idx_show_notes_public ON show_notes(is_private, created_at DESC);
```

### Update: `activities` table
```sql
-- Add new activity types
ALTER TABLE activities ADD COLUMN note_id UUID REFERENCES show_notes(id);

-- New activity types to support:
-- - 'noted' for public show notes
-- - 'followed' for follow activities
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Notification Infrastructure (Priority: HIGH)**
**Estimated Time:** 2-3 hours

**Tasks:**
1. ✅ Create notifications database table + migration
2. ✅ Add notification icon to header (✨ or activity icon - NOT bell)
3. ✅ Create NotificationDropdown component
4. ✅ Build notification API routes:
   - GET `/api/notifications` - Fetch user notifications
   - POST `/api/notifications/mark-read` - Mark as read
   - GET `/api/notifications/unread-count` - Badge counter
5. ✅ Implement real-time badge counter
6. ✅ Make notifications clickable → route to relevant content

**Deliverable:** Working notification system in header

---

### **Phase 2: Track Follow Activities (Priority: HIGH)**
**Estimated Time:** 1 hour

**Tasks:**
1. ✅ Update follow handler to create notification
2. ✅ Add 'follow' activity type to activities table
3. ✅ Show follow activities in notification dropdown
4. ✅ Test follow notification flow

**Deliverable:** Users get notified when someone follows them

---

### **Phase 3: Track Like/Comment Activities (Priority: HIGH)**
**Estimated Time:** 1-2 hours

**Tasks:**
1. ✅ Update like handler to create notification
2. ✅ Update comment handler to create notification
3. ✅ Show like/comment notifications in dropdown
4. ✅ Ensure notifications link to correct activity
5. ✅ Test like/comment notification flows

**Deliverable:** Users get notified of likes/comments on their activities

---

### **Phase 4: Show Notes Feature (Priority: HIGH)**
**Estimated Time:** 3-4 hours

**Tasks:**
1. ✅ Create show_notes database table + migration
2. ✅ Build NoteComposer component
   - Text area with 280 char limit
   - Character counter
   - "Private note" checkbox
   - Edit/Delete for own notes
3. ✅ Add "Write a note" button to MediaDetailModal
4. ✅ Create note API routes:
   - POST `/api/notes` - Create note
   - PUT `/api/notes/[id]` - Edit note
   - DELETE `/api/notes/[id]` - Delete note
   - GET `/api/notes/[userId]` - Get user's notes
5. ✅ Create activity when public note is posted
6. ✅ Display notes in activity feed
7. ✅ Show notes on user profile (new "Notes" tab)
8. ✅ Enable likes/comments on public notes

**Deliverable:** Fully functional show notes feature

---

### **Phase 5: Enhanced Engagement (Priority: MEDIUM)**
**Estimated Time:** 2-3 hours

**Tasks:**
1. ⏳ Add @mention support in notes/comments
2. ⏳ Notification for mentions
3. ⏳ Notification settings/filters
4. ⏳ "Mark all as read" functionality
5. ⏳ Notification preferences (email, push)

**Deliverable:** Advanced engagement features

---

## 🎨 UI Components Needed

### 1. **NotificationIcon Component**
- Location: Header (AppHeader.tsx)
- Icon: ✨ or custom activity icon
- Badge: Unread count
- Click: Toggle dropdown

### 2. **NotificationDropdown Component**
```typescript
interface Notification {
  id: string
  actor: { username: string, display_name: string, avatar_url: string }
  type: 'follow' | 'like_activity' | 'comment' | 'mentioned'
  target: { type: string, id: string }
  activity?: Activity
  read: boolean
  created_at: string
}
```

**Features:**
- List of notifications (latest first)
- Clickable items → navigate to target
- Visual read/unread states
- "Mark all as read" button
- Empty state: "No notifications yet"

### 3. **NoteComposer Component**
```typescript
interface NoteComposerProps {
  mediaId: string
  tmdbId: number
  mediaType: 'tv' | 'movie'
  existingNote?: ShowNote
  onSave: () => void
  onCancel: () => void
}
```

**Features:**
- Text area (280 char max)
- Character counter (e.g., "42/280")
- "Private note" checkbox
- Cancel/Save buttons
- Edit mode if existingNote provided
- Delete button (if editing own note)

### 4. **NoteDisplay Component**
- Shows note content
- Private indicator if applicable
- Like/comment actions (public notes only)
- Edit/Delete buttons (own notes only)
- Timestamp

---

## 📱 User Experience Flow

### Notification Flow:
```
1. Taylor follows you
   ↓
2. Notification created in DB
   ↓
3. Badge counter updates (✨ 1)
   ↓
4. You click notification icon
   ↓
5. Dropdown shows: "@taylormurto started following you"
   ↓
6. You click notification
   ↓
7. Navigate to /user/taylormurto
   ↓
8. Notification marked as read
```

### Note Creation Flow:
```
1. You're viewing "King of the Hill" in detail modal
   ↓
2. Click "✍️ Write a note..."
   ↓
3. Composer opens with text area
   ↓
4. Type: "Perfect comfort watch!"
   ↓
5. See character count: 25/280
   ↓
6. Check/uncheck "Private note"
   ↓
7. Click "Post Note"
   ↓
8. If public: Activity created, followers see in feed
   ↓
9. If private: Only visible in your "Notes" section
```

---

## 🎯 Success Metrics

**Engagement Metrics:**
- Daily active users checking notifications
- % of users who write notes (target: 30%+)
- Average notes per user per week
- Like/comment rates on notes vs ratings
- Follow-through rate on notifications (click → action)

**Quality Metrics:**
- Average note length (should be meaningful, not just "good")
- Public vs private note ratio
- Edit/delete rate (should be low = users thinking before posting)

---

## 🔄 Future Enhancements (Not in Scope Now)

- [ ] @Mention autocomplete in note composer
- [ ] Rich text formatting in notes (bold, italic)
- [ ] Attach notes to specific episodes (not just shows)
- [ ] "Watched same show" notifications
- [ ] Notification email digests (daily/weekly)
- [ ] Push notifications (PWA)
- [ ] Activity filters in notification dropdown
- [ ] "Trending notes" section
- [ ] Note reactions beyond likes (emoji reactions)

---

## 🚧 Technical Considerations

### Performance:
- Paginate notifications (load 20 at a time)
- Cache unread count in Redis (future optimization)
- Index notifications by user_id and read status

### Security:
- Users can only edit/delete their own notes
- Private notes never exposed via API to other users
- Rate limiting on note creation (max 10/hour)

### UX Polish:
- Optimistic UI updates (like/unlike instantly)
- Skeleton loaders for notifications
- Smooth animations on dropdown open/close
- Toast notifications for actions ("Note saved!")

---

## 📋 Testing Checklist

### Notifications:
- [ ] Follow someone → they get notification
- [ ] Like activity → owner gets notification
- [ ] Comment on activity → owner gets notification
- [ ] Click notification → navigates correctly
- [ ] Mark as read → badge count decreases
- [ ] Unread badge shows correct count

### Show Notes:
- [ ] Create public note → shows in feed
- [ ] Create private note → NOT in feed
- [ ] Edit own note → changes saved
- [ ] Delete own note → removed everywhere
- [ ] 280 char limit enforced
- [ ] Character counter accurate
- [ ] Private checkbox works
- [ ] Can like public notes
- [ ] Can comment on public notes
- [ ] Cannot edit others' notes

---

## 🎨 Design Inspiration

**Notification Icon:**
- ✨ Sparkle (magical discovery)
- 💫 Dizzy (activity happening)
- 🔔 Bell (classic, but avoiding due to Letterboxd)
- Custom icon: Activity pulse/radar

**Recommendation:** Use ✨ sparkle - it fits the "discover magical content" vibe

**Color Scheme:**
- Unread notifications: Badge with gradient (pink/orange)
- Read notifications: Subdued gray
- Hover states: Subtle highlight
- Icons: Match gradient theme

---

## 🏁 Implementation Order (Confirmed)

**Week 1:**
1. Notification infrastructure + dropdown
2. Track follow activities
3. Track like/comment activities

**Week 2:**
4. Show notes feature (full implementation)
5. Polish & bug fixes
6. User testing

**Week 3:**
7. @Mentions support
8. Notification preferences
9. Performance optimization

---

## 📝 Open Questions / Decisions Needed

- ✅ **Icon choice:** Sparkle ✨ or custom activity icon?
- ✅ **Note visibility default:** Public or Private? (Recommendation: Public)
- ⏳ **Notification retention:** Delete after 30 days or keep forever?
- ⏳ **Email notifications:** Should we send email for critical notifications (new follower)?
- ⏳ **Edit history:** Show "edited" indicator on notes?

---

## 🎉 Why This Will Work

1. **Low friction content creation** - 280 chars is quick, not intimidating
2. **Public by default** - Encourages sharing and discovery
3. **Private option** - Safety valve for personal journaling
4. **Notification-driven engagement** - Keeps users coming back
5. **Not trying to be Letterboxd** - Differentiated positioning
6. **Taste-focused** - Everything ties back to discovery through friends

---

**Next Steps:** Begin Phase 1 implementation → Notification infrastructure!

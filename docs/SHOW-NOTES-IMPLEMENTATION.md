# Show Notes Feature - Implementation Plan

**Feature:** Twitter-like micro-reviews for shows (280 character limit)
**Status:** In Development
**Priority:** Critical (Killer Feature)
**Estimated Time:** 3-4 days
**Started:** January 23, 2025

---

## Overview

Show Notes is the **killer differentiator** for Been Watching - quick, Twitter-like micro-reviews that can be added at any watch status (want/watching/watched). This encourages users to capture their thoughts immediately and creates engaging social content.

### Key Design Decisions

1. **Generic prompt**: "Add your note" (not "What did you think?")
   - Allows notes for ANY watchlist status
   - Can add context like "Taylor recommended this" when adding to Want to Watch
   - Can add review when marking as Watched

2. **280 character limit** (Twitter-style)
   - Forces concise, punchy content
   - Easy to read and digest
   - Perfect for mobile

3. **Public by default** (with private option)
   - Encourages social engagement
   - Can toggle private for personal notes
   - Aligns with social-first philosophy

4. **Integrated into activity feed**
   - Show notes appear as special activity type
   - Can be liked and commented on
   - Discoverable through friends' feeds

---

## Database Architecture

### Table: `show_notes`

```sql
CREATE TABLE show_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  media_id TEXT NOT NULL,  -- Format: 'tv-12345-s1' or 'movie-67890'
  note_text TEXT NOT NULL CHECK (length <= 280, length > 0),
  visibility TEXT DEFAULT 'public',  -- 'public' | 'private'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Indexes

- `idx_show_notes_user_id` - User's notes
- `idx_show_notes_media_id` - All notes for a show
- `idx_show_notes_created_at` - Recent notes
- `idx_show_notes_user_media` - Composite for "user's note on specific show"

### Triggers

1. **create_activity_for_show_note** - Creates activity when public note added
2. **delete_activity_for_show_note** - Removes activity when note deleted
3. **update_show_notes_updated_at** - Updates timestamp on edit

### Row Level Security (RLS)

- ✅ Public notes viewable by everyone
- ✅ Users can view their own private notes
- ✅ Users can only modify their own notes
- ✅ Cascading delete when user is deleted

---

## Component Architecture

### New Components

#### 1. `ShowNoteInput.tsx`
**Purpose:** Input field for adding/editing notes
**Location:** `components/notes/ShowNoteInput.tsx`

**Props:**
```typescript
interface ShowNoteInputProps {
  mediaId: string
  existingNote?: string | null
  visibility?: 'public' | 'private'
  onSave: (noteText: string, visibility: 'public' | 'private') => Promise<void>
  onDelete?: () => Promise<void>
  placeholder?: string
}
```

**Features:**
- Character counter (280 max)
- Real-time character count display
- Public/Private toggle
- Auto-save on blur (optional)
- Delete button if editing existing note
- Disabled state while saving
- Theme-aware styling

**UI Design:**
```
┌─────────────────────────────────────────┐
│ Add your note                           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Great recommendation from Taylor!   │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📝 34/280  [🌍 Public ▼] [Save]        │
└─────────────────────────────────────────┘
```

#### 2. `ShowNoteCard.tsx`
**Purpose:** Display note in activity feed
**Location:** `components/notes/ShowNoteCard.tsx`

**Props:**
```typescript
interface ShowNoteCardProps {
  note: {
    id: string
    user: {
      id: string
      username: string
      display_name: string
      avatar_url?: string
    }
    media: {
      id: string
      title: string
      poster_path?: string
      media_type: string
    }
    note_text: string
    created_at: string
  }
  currentUserId?: string
  onLike?: () => void
  onComment?: () => void
  isLiked?: boolean
  likeCount?: number
  commentCount?: number
}
```

**UI Design:**
```
┌─────────────────────────────────────────────┐
│ [@taylormurto] · 2h ago                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 💭 "This show is absolutely incredible!    │
│     The character development is chef's    │
│     kiss. Can't wait for season 2."        │
│                                            │
│ 📺 Severance - Season 1                    │
│ [poster]                                   │
│                                            │
│ ❤️ 5   💬 2   🔗 Share                     │
└─────────────────────────────────────────────┘
```

#### 3. `MediaNotes.tsx`
**Purpose:** Display all notes for a specific show
**Location:** `components/notes/MediaNotes.tsx`

**Props:**
```typescript
interface MediaNotesProps {
  mediaId: string
  currentUserId?: string
  limit?: number  // Default: show all
}
```

**Features:**
- Lists all public notes for a show
- Sorted by most recent
- Shows user avatar + name
- Click user -> navigate to profile
- Displays relative time (e.g., "2 hours ago")

---

## Integration Points

### 1. MediaDetailModal
**File:** `components/media/MediaDetailModal.tsx`

**Changes:**
```typescript
// Add after rating/status sections
<ShowNoteInput
  mediaId={media.id}
  existingNote={userNote}
  onSave={handleNoteSave}
  onDelete={handleNoteDelete}
  placeholder="Add your note... (why you want to watch, who recommended it, your review, etc.)"
/>

// Below that, show other users' notes
<MediaNotes
  mediaId={media.id}
  currentUserId={user?.id}
  limit={3}  // Show top 3, "See all" link for more
/>
```

### 2. Activity Feed
**File:** `app/page.tsx`

**Changes:**
```typescript
// In activity rendering, add new case
{activity.activity_type === 'show_note' && (
  <ShowNoteCard
    note={formatShowNoteActivity(activity)}
    currentUserId={user?.id}
    onLike={() => handleLike(activity.id)}
    onComment={() => handleComment(activity.id)}
    isLiked={activity.is_liked}
    likeCount={activity.like_count}
    commentCount={activity.comment_count}
  />
)}
```

### 3. User Profile
**File:** `app/user/[username]/page.tsx`

**New Tab:**
- Add "Notes" tab alongside "Want", "Watching", "Watched"
- Shows all user's public notes
- Sortable by recent/popular
- Click note -> opens media detail modal

---

## API Functions

### Create Note
```typescript
async function createShowNote(
  userId: string,
  mediaId: string,
  noteText: string,
  visibility: 'public' | 'private' = 'public'
): Promise<{ data, error }>
```

### Update Note
```typescript
async function updateShowNote(
  noteId: string,
  noteText: string,
  visibility?: 'public' | 'private'
): Promise<{ data, error }>
```

### Delete Note
```typescript
async function deleteShowNote(
  noteId: string
): Promise<{ error }>
```

### Get User's Note for Media
```typescript
async function getUserNoteForMedia(
  userId: string,
  mediaId: string
): Promise<{ data, error }>
```

### Get All Notes for Media
```typescript
async function getNotesForMedia(
  mediaId: string,
  limit?: number
): Promise<{ data, error }>
```

---

## User Flow Examples

### Flow 1: Adding to Want to Watch
1. User searches for "Severance"
2. Clicks on show
3. Clicks "Want to Watch"
4. Note input appears: "Add your note..."
5. Types: "Taylor recommended this - looks amazing!"
6. Clicks "Save" (defaults to Public)
7. Note saved, appears in activity feed as: "@nick added Severance to Want to Watch 💭 'Taylor recommended this...'"

### Flow 2: Rating a Show
1. User finishes watching "The Bear - Season 2"
2. Opens detail modal
3. Gives it ❤️ Love rating
4. Note input appears with existing note (if any)
5. Types: "Chef's kiss. The fishes episode is cinema."
6. Saves (Public)
7. Activity feed shows: "@nick loved The Bear - Season 2 💭 'Chef's kiss...'"

### Flow 3: Private Note
1. User adds "Succession" to Watching
2. Adds note: "Starting with Taylor - watching together"
3. Toggles to "Private"
4. Saves
5. Note NOT visible to others
6. Still appears in user's own notes tab
7. No activity created

---

## Best Practices Implemented

### 1. Performance
- ✅ Indexed queries (user_id, media_id, created_at)
- ✅ Limit note length at database level (280 chars)
- ✅ Lazy load notes (show top 3, paginate rest)
- ✅ Debounce auto-save to prevent excessive API calls

### 2. User Experience
- ✅ Real-time character count
- ✅ Visual feedback when approaching limit
- ✅ Placeholder text changes based on context
- ✅ Auto-expand textarea as user types
- ✅ Smooth animations and transitions
- ✅ Mobile-optimized input (large tap targets)

### 3. Accessibility
- ✅ ARIA labels for screen readers
- ✅ Keyboard navigation (Tab, Enter to submit)
- ✅ Focus management in modals
- ✅ High contrast text colors
- ✅ Character counter announces to screen reader

### 4. Data Integrity
- ✅ Database-level constraint (1-280 characters)
- ✅ Client-side validation before submission
- ✅ Sanitize input to prevent XSS
- ✅ Rate limiting on note creation
- ✅ Duplicate detection (1 note per user per media)

### 5. Scalability
- ✅ Pagination for large note counts
- ✅ Caching popular media's notes
- ✅ Background job to clean up orphaned notes
- ✅ Database indexes for fast queries at scale

---

## Testing Checklist

### Unit Tests
- [ ] ShowNoteInput validates character count
- [ ] ShowNoteInput sanitizes user input
- [ ] ShowNoteCard renders correctly with all props
- [ ] API functions handle errors gracefully

### Integration Tests
- [ ] Creating note triggers activity creation
- [ ] Deleting note removes activity
- [ ] Private notes don't create activities
- [ ] Editing note updates activity
- [ ] RLS prevents unauthorized access

### E2E Tests
- [ ] User can add note to Want to Watch
- [ ] User can add note to Watching
- [ ] User can add note to Watched
- [ ] User can toggle public/private
- [ ] User can edit existing note
- [ ] User can delete note
- [ ] Notes appear in activity feed
- [ ] Notes appear on media detail page
- [ ] Character limit enforced at 280

### Manual Testing with Alpha Users
- [ ] Boozehounds can add notes to their shows
- [ ] Notes appear correctly in feeds
- [ ] Mobile keyboard behavior works well
- [ ] Character counter is helpful
- [ ] Public/private toggle is clear
- [ ] Performance is smooth with many notes

---

## Migration Plan

### Step 1: Database
1. Run migration to create `show_notes` table
2. Verify RLS policies work correctly
3. Test triggers create activities properly

### Step 2: Components
1. Build `ShowNoteInput` component
2. Build `ShowNoteCard` component
3. Build `MediaNotes` component
4. Add to Storybook for visual testing

### Step 3: Integration
1. Add to MediaDetailModal
2. Update activity feed rendering
3. Add Notes tab to user profiles
4. Update activity types in feeds

### Step 4: Testing
1. Test with local development data
2. Deploy to staging
3. Test with Boozehounds in alpha
4. Gather feedback and iterate

### Step 5: Launch
1. Document feature in help docs
2. Announce to alpha testers
3. Monitor usage and errors
4. Collect feedback for improvements

---

## Success Metrics

### Engagement
- **Target:** 60%+ of users add at least 1 note in first week
- **Target:** Average 5+ notes per active user per month
- **Target:** 40%+ of notes are public (shows users find value in sharing)

### Quality
- **Target:** <5% notes flagged/reported as spam
- **Target:** Average note length 100-150 characters (sweet spot)
- **Target:** 70%+ of notes get at least 1 like or comment

### Technical
- **Target:** <200ms to save a note
- **Target:** <500ms to load notes for a media
- **Target:** <1% error rate on note operations

---

## Future Enhancements

### v0.3.0
- Rich text formatting (bold, italic, links)
- Emoji picker integration
- @mentions in notes
- Hashtags for discovery

### v0.5.0
- Threaded discussions on notes
- Pin favorite note to profile
- Export notes as PDF/CSV
- Note analytics (views, engagement)

### v1.0.0
- Public/private collections of notes
- Share notes to social media
- Trending notes algorithm
- Note recommendations

---

## Questions to Resolve

- [ ] Should users be able to edit notes after posting? (Current: Yes)
- [ ] Should there be a time limit for editing? (Current: No limit)
- [ ] Should we show edit history? (Current: No, to encourage authentic first thoughts)
- [ ] Should we allow multiple notes per show? (Current: 1 note per user per media)
- [ ] Should we support markdown formatting? (Current: Plain text only for MVP)

---

**Document Version:** 1.0
**Last Updated:** January 23, 2025
**Next Review:** After alpha testing feedback

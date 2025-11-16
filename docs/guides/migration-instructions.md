# Show Notes Table Migration

## Instructions

To create the `show_notes` table in your Supabase database:

1. **Open Supabase SQL Editor**:
   - Go to: https://udfhqiipppybkuxpycay.supabase.co/project/udfhqiipppybkuxpycay/sql/new

2. **Copy the SQL**:
   - Open the file: `supabase/migrations/create-show-notes-table.sql`
   - Copy all contents (Cmd+A, Cmd+C)

3. **Paste and Execute**:
   - Paste into the Supabase SQL Editor
   - Click "Run" (or press Cmd+Enter)

4. **Verify Success**:
   - You should see "Success. No rows returned" or similar
   - The `show_notes` table will now exist with:
     - 280 character limit on notes
     - Public/Private visibility
     - Row Level Security enabled
     - Performance indexes
     - Auto-update timestamp trigger

## What This Creates

### Table Structure
```sql
show_notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  media_id TEXT,
  note_text TEXT (max 280 chars),
  visibility TEXT ('public' or 'private'),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Security Policies
- Users can view all public notes
- Users can view/edit/delete their own notes (public or private)
- All operations protected by Row Level Security

### Architecture
- Notes are like "captions" on Instagram posts
- They attach to existing media (shows/movies)
- Display WITH rating/status activities
- NOT standalone activities

## After Migration

Once the migration runs successfully:
1. Test note creation in MediaDetailModal
2. Verify notes appear in activity feed
3. Check My Shows page displays notes
4. Test public/private visibility
5. Verify 280 character limit enforcement

---

**Status**: Ready to execute
**File**: [supabase/migrations/create-show-notes-table.sql](supabase/migrations/create-show-notes-table.sql)

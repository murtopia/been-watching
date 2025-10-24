-- Migration: Convert Notes to Comments System
-- This converts the private/public notes system into a public-only comment system
-- Comments are attached to specific activities and can be liked by users

-- Step 1: Rename show_notes to show_comments
ALTER TABLE show_notes RENAME TO show_comments;

-- Step 2: Rename note_text to comment_text
ALTER TABLE show_comments RENAME COLUMN note_text TO comment_text;

-- Step 3: Update constraint on comment_text
ALTER TABLE show_comments DROP CONSTRAINT IF EXISTS show_notes_note_text_check;
ALTER TABLE show_comments ADD CONSTRAINT show_comments_comment_text_check
  CHECK (char_length(comment_text) <= 280 AND char_length(comment_text) > 0);

-- Step 4: Add activity_id column to link comments to specific activities
ALTER TABLE show_comments ADD COLUMN activity_id UUID REFERENCES activities(id) ON DELETE CASCADE;

-- Step 5: Remove visibility column (all comments are public now)
-- First, let's keep existing data but we'll ignore the column in the app
-- We can drop it later after migration is confirmed working
-- ALTER TABLE show_comments DROP COLUMN visibility;

-- Step 6: Update indexes
DROP INDEX IF EXISTS idx_show_notes_user_id;
DROP INDEX IF EXISTS idx_show_notes_media_id;
DROP INDEX IF EXISTS idx_show_notes_created_at;
DROP INDEX IF EXISTS idx_show_notes_visibility;
DROP INDEX IF EXISTS idx_show_notes_user_media;

CREATE INDEX idx_show_comments_user_id ON show_comments(user_id);
CREATE INDEX idx_show_comments_media_id ON show_comments(media_id);
CREATE INDEX idx_show_comments_activity_id ON show_comments(activity_id);
CREATE INDEX idx_show_comments_created_at ON show_comments(created_at DESC);
CREATE INDEX idx_show_comments_user_media ON show_comments(user_id, media_id);

-- Step 7: Update RLS policies
DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON show_comments;
DROP POLICY IF EXISTS "Users can view their own notes" ON show_comments;
DROP POLICY IF EXISTS "Users can insert their own notes" ON show_comments;
DROP POLICY IF EXISTS "Users can update their own notes" ON show_comments;
DROP POLICY IF EXISTS "Users can delete their own notes" ON show_comments;

-- All comments are public and viewable by everyone
CREATE POLICY "Comments are viewable by everyone"
  ON show_comments FOR SELECT
  USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON show_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON show_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON show_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Update trigger and function names
DROP TRIGGER IF EXISTS update_show_notes_timestamp ON show_comments;
DROP FUNCTION IF EXISTS update_show_notes_updated_at();

CREATE OR REPLACE FUNCTION update_show_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_show_comments_timestamp
  BEFORE UPDATE ON show_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_show_comments_updated_at();

-- Step 9: Create comment_likes table for liking individual comments
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES show_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- One like per user per comment
);

-- Indexes for comment_likes
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable RLS on comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_likes

-- Everyone can view likes
CREATE POLICY "Comment likes are viewable by everyone"
  ON comment_likes FOR SELECT
  USING (true);

-- Users can like comments
CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike comments (delete their own likes)
CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Step 10: Grant permissions
GRANT ALL ON show_comments TO authenticated;
GRANT ALL ON show_comments TO service_role;
GRANT ALL ON comment_likes TO authenticated;
GRANT ALL ON comment_likes TO service_role;

-- Step 11: Update table and column comments
COMMENT ON TABLE show_comments IS 'User comments on shows - public Instagram-style comments, max 280 characters';
COMMENT ON COLUMN show_comments.comment_text IS 'User comment - max 280 characters, always public';
COMMENT ON COLUMN show_comments.activity_id IS 'Links comment to specific activity (optional) - enables per-activity comment threads';
COMMENT ON TABLE comment_likes IS 'Likes on individual comments - one like per user per comment';

-- Migration complete!
-- Comments are now:
-- 1. Always public (no visibility toggle)
-- 2. Attached to specific activities via activity_id
-- 3. Can be liked by other users
-- 4. Instagram-style social interaction

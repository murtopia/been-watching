-- Create show_notes table for user micro-reviews
-- This is the "killer feature" - Twitter-like show notes with 280 char limit

CREATE TABLE IF NOT EXISTS show_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  note_text TEXT NOT NULL CHECK (char_length(note_text) <= 280 AND char_length(note_text) > 0),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_show_notes_user_id ON show_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_show_notes_media_id ON show_notes(media_id);
CREATE INDEX IF NOT EXISTS idx_show_notes_created_at ON show_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_show_notes_visibility ON show_notes(visibility) WHERE visibility = 'public';

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_show_notes_user_media ON show_notes(user_id, media_id);

-- Enable Row Level Security
ALTER TABLE show_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view all public notes
CREATE POLICY "Public notes are viewable by everyone"
  ON show_notes FOR SELECT
  USING (visibility = 'public');

-- Users can view their own notes (public or private)
CREATE POLICY "Users can view their own notes"
  ON show_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert their own notes"
  ON show_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes"
  ON show_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON show_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_show_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_show_notes_timestamp
  BEFORE UPDATE ON show_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_show_notes_updated_at();

-- Note: Notes are like "captions" on activities, not standalone activities
-- They are stored separately but displayed WITH ratings/status activities
-- No automatic activity creation - notes are fetched and displayed with existing activities

-- Grant permissions
GRANT ALL ON show_notes TO authenticated;
GRANT ALL ON show_notes TO service_role;

COMMENT ON TABLE show_notes IS 'User micro-reviews and notes about shows - max 280 characters like Twitter';
COMMENT ON COLUMN show_notes.note_text IS 'User note/review - max 280 characters';
COMMENT ON COLUMN show_notes.visibility IS 'public or private - controls whether note appears in activity feed';

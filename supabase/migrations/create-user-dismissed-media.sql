-- Migration: Create user_dismissed_media table
-- Purpose: Track shows users have dismissed from recommendations
-- Used by: Cards 2, 3, 8 to exclude dismissed shows from recommendations
-- Created: December 2024

-- Create table
CREATE TABLE IF NOT EXISTS user_dismissed_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate dismissals
  UNIQUE(user_id, media_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_dismissed_media_user 
  ON user_dismissed_media(user_id);

-- Enable Row Level Security
ALTER TABLE user_dismissed_media ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own dismissed media
CREATE POLICY "Users can read own dismissed media"
  ON user_dismissed_media FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own dismissed media
CREATE POLICY "Users can insert own dismissed media"
  ON user_dismissed_media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dismissed media (undo dismiss)
CREATE POLICY "Users can delete own dismissed media"
  ON user_dismissed_media FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, DELETE ON user_dismissed_media TO authenticated;

COMMENT ON TABLE user_dismissed_media IS 'Tracks media that users have dismissed from recommendations';
COMMENT ON COLUMN user_dismissed_media.media_id IS 'Format: tv-12345 or movie-67890 (normalized, no season suffix)';


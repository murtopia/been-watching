-- Card Impressions Table
-- Tracks when recommendation cards are shown to prevent spam
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS card_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,  -- 'because_you_liked', 'friends_loved', 'coming_soon', 'you_might_like'
  media_id TEXT NOT NULL,
  source_media_id TEXT,  -- For Card 2: the show they liked that triggered this recommendation
  impression_count INT DEFAULT 1,
  first_shown_at TIMESTAMPTZ DEFAULT NOW(),
  last_shown_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_type, media_id)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_card_impressions_user ON card_impressions(user_id, card_type);
CREATE INDEX IF NOT EXISTS idx_card_impressions_lookup ON card_impressions(user_id, card_type, media_id);

-- Enable Row Level Security
ALTER TABLE card_impressions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own impressions
CREATE POLICY "Users can view own impressions"
  ON card_impressions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own impressions
CREATE POLICY "Users can insert own impressions"
  ON card_impressions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own impressions
CREATE POLICY "Users can update own impressions"
  ON card_impressions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Verify table was created
SELECT 'card_impressions table created successfully' as status;


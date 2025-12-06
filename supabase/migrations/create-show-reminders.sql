-- Show Reminders Table
-- Stores reminders set from Card 4 bell icon, triggers Card 5
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS show_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  season_number INT,
  air_date DATE NOT NULL,  -- Expected release date
  reminder_set_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,  -- When we sent the notification (null = not yet)
  dismissed_at TIMESTAMPTZ,  -- When user dismissed Card 5 (null = still showing)
  UNIQUE(user_id, media_id, season_number)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_show_reminders_user ON show_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_show_reminders_date ON show_reminders(air_date);
CREATE INDEX IF NOT EXISTS idx_show_reminders_pending ON show_reminders(user_id, air_date) 
  WHERE notified_at IS NULL;

-- Enable Row Level Security
ALTER TABLE show_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reminders
CREATE POLICY "Users can view own reminders"
  ON show_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own reminders
CREATE POLICY "Users can insert own reminders"
  ON show_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reminders
CREATE POLICY "Users can update own reminders"
  ON show_reminders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reminders
CREATE POLICY "Users can delete own reminders"
  ON show_reminders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify table was created
SELECT 'show_reminders table created successfully' as status;


-- Create release_notifications table for tracking upcoming releases
-- Supports TV season releases, movie theatrical releases, and streaming availability

CREATE TABLE IF NOT EXISTS release_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id),
  season_number INTEGER,
  release_date DATE NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('announcement', 'week_before', 'day_of', 'theatrical_release', 'streaming_available')),
  streaming_service TEXT, -- e.g., 'Netflix', 'Disney Plus', 'HBO Max'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_release_notifications_user_date ON release_notifications(user_id, release_date);
CREATE INDEX IF NOT EXISTS idx_release_notifications_media ON release_notifications(media_id);
CREATE INDEX IF NOT EXISTS idx_release_notifications_type ON release_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_release_notifications_user_seen ON release_notifications(user_id, seen_at);
CREATE INDEX IF NOT EXISTS idx_release_notifications_release_date ON release_notifications(release_date);

-- Enable Row Level Security
ALTER TABLE release_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own release notifications
CREATE POLICY "Users can view own release notifications"
  ON release_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert release notifications (for background jobs)
CREATE POLICY "System can insert release notifications"
  ON release_notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update their own release notifications (e.g., mark as seen)
CREATE POLICY "Users can update own release notifications"
  ON release_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own release notifications
CREATE POLICY "Users can delete own release notifications"
  ON release_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE release_notifications IS 'Tracks upcoming TV seasons, movie releases, and streaming availability for users';


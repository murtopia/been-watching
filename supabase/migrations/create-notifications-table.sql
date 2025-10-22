-- Create notifications table for tracking user activity notifications
-- This enables users to be notified when:
-- - Someone follows them
-- - Someone likes their activity (rating, note, etc.)
-- - Someone comments on their activity
-- - Someone mentions them (future feature)

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who receives this notification
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Who triggered this notification (the actor)
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Type of notification
  type TEXT NOT NULL CHECK (type IN ('follow', 'like_activity', 'comment', 'mentioned', 'note_liked', 'note_commented')),

  -- What was acted upon
  target_type TEXT CHECK (target_type IN ('activity', 'comment', 'profile', 'note')),
  target_id UUID,

  -- Direct reference to activity if applicable (for quick access)
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,

  -- Read status
  read BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System/authenticated users can create notifications
CREATE POLICY "Authenticated users can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE notifications IS 'Stores user activity notifications for social engagement features';

-- Add system notification types for important app events
-- This allows the app to notify users about:
-- - Earning invites through profile completion
-- - Welcome messages
-- - Feature releases
-- - Important announcements

-- Update the notification type constraint to include system notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'follow',
  'like_activity',
  'comment',
  'mentioned',
  'note_liked',
  'note_commented',
  'invite_earned',
  'welcome',
  'feature_release',
  'announcement'
));

-- Update target_type to include 'system' for system-generated notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_target_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_target_type_check
CHECK (target_type IN ('activity', 'comment', 'profile', 'note', 'system'));

-- Add optional metadata field for additional notification data
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMENT ON COLUMN notifications.metadata IS 'Optional JSON data for notification context (e.g., invite codes, feature details)';

-- Fix: Update notification type constraints to support announcements
-- Run this in Supabase SQL Editor

-- Drop and recreate the type constraint with announcement types
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
  'announcement',
  'maintenance'
));

-- Drop and recreate the target_type constraint with 'system'
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_target_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_target_type_check
CHECK (target_type IN ('activity', 'comment', 'profile', 'note', 'system'));

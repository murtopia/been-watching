-- Fix: Add missing metadata column to notifications table
-- Run this in Supabase SQL Editor

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMENT ON COLUMN notifications.metadata IS 'Optional JSON data for notification context (e.g., announcement details, invite codes)';

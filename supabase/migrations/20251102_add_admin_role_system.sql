-- Admin Role System Migration
-- Created: November 2, 2025
-- Purpose: Add role-based access control (Owner/Admin/Analyst) to replace binary is_admin

-- ============================================================================
-- STEP 1: Add admin_role column to profiles
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT NULL
CHECK (admin_role IN ('owner', 'admin', 'analyst'));

-- Add index for fast role filtering
CREATE INDEX IF NOT EXISTS idx_profiles_admin_role
ON profiles(admin_role)
WHERE admin_role IS NOT NULL;

-- ============================================================================
-- STEP 2: Add last_active tracking
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_last_active
ON profiles(last_active_at DESC NULLS LAST);

-- ============================================================================
-- STEP 3: Enable trigram extension for fuzzy search
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for fast user search
CREATE INDEX IF NOT EXISTS idx_profiles_username_search
ON profiles USING gin(username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_display_name_search
ON profiles USING gin(display_name gin_trgm_ops);

-- ============================================================================
-- STEP 4: Create admin_role_history table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_role_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by_user_id UUID NOT NULL REFERENCES profiles(id),
  old_role TEXT,
  new_role TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_role_history_user
ON admin_role_history(user_id, created_at DESC);

CREATE INDEX idx_admin_role_history_changed_by
ON admin_role_history(changed_by_user_id);

-- ============================================================================
-- STEP 5: Add RLS policies for admin_role_history
-- ============================================================================

ALTER TABLE admin_role_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all role history
CREATE POLICY "Admins can view role history"
ON admin_role_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin_role IN ('owner', 'admin', 'analyst')
  )
);

-- Only owners and admins can insert role history (system will do this)
CREATE POLICY "Only admins can insert role history"
ON admin_role_history
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin_role IN ('owner', 'admin')
  )
);

-- ============================================================================
-- STEP 6: Performance indexes for admin queries
-- ============================================================================

-- Fast joins for user stats
CREATE INDEX IF NOT EXISTS idx_ratings_user_created
ON ratings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_user_created
ON activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_follower_status
ON follows(follower_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_following_status
ON follows(following_id, status, created_at DESC);

-- ============================================================================
-- STEP 7: Migrate existing is_admin data to admin_role
-- ============================================================================

-- This will be done manually after migration
-- See ADMIN-USER-MANAGEMENT-UPGRADE.md for instructions

-- DO NOT RUN AUTOMATICALLY:
-- UPDATE profiles SET admin_role = 'owner' WHERE username = 'murtopia';
-- UPDATE profiles SET admin_role = 'admin' WHERE is_admin = TRUE AND username != 'murtopia';

-- ============================================================================
-- STEP 8: Add helper function to update last_active
-- ============================================================================

CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on activities to update last_active
CREATE TRIGGER update_user_last_active
AFTER INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- ============================================================================
-- NOTES
-- ============================================================================

-- After running this migration:
-- 1. Manually set your user as 'owner'
-- 2. Set other admins as 'admin'
-- 3. Test that permissions work correctly
-- 4. Eventually deprecate is_admin column (keep for backwards compat for now)

-- Migration complete! 🎉

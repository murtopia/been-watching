-- Admin Role System
-- Run this in Supabase SQL Editor

-- Add admin-related columns to profiles table
DO $$
BEGIN
  -- Add is_admin column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Add is_super_admin column (can grant admin to others)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'is_super_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
  END IF;

  -- Add admin_granted_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'admin_granted_at') THEN
    ALTER TABLE profiles ADD COLUMN admin_granted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add admin_granted_by column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'admin_granted_by') THEN
    ALTER TABLE profiles ADD COLUMN admin_granted_by UUID REFERENCES profiles(id);
  END IF;
END $$;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);

-- Update RLS policies for master_codes to require admin access

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active master codes" ON master_codes;
DROP POLICY IF EXISTS "Authenticated users can insert master codes" ON master_codes;
DROP POLICY IF EXISTS "System can update master codes" ON master_codes;
DROP POLICY IF EXISTS "Authenticated users can update master codes" ON master_codes;

-- Anyone can view active codes (needed for signup validation)
CREATE POLICY "Anyone can view active master codes"
  ON master_codes FOR SELECT
  USING (is_active = true);

-- ONLY admins can insert new codes
CREATE POLICY "Only admins can insert master codes"
  ON master_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ONLY admins can update codes
CREATE POLICY "Only admins can update master codes"
  ON master_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Update RLS policies for waitlist to require admin for viewing

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Only authenticated users can view waitlist" ON waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON waitlist;

-- Anyone (including anonymous) can join waitlist
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ONLY admins can view waitlist (protects user privacy)
CREATE POLICY "Only admins can view waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Update admin view to filter by admin status
DROP VIEW IF EXISTS admin_master_code_stats;
CREATE VIEW admin_master_code_stats AS
SELECT
  mc.code,
  mc.type,
  mc.max_uses,
  mc.current_uses,
  CASE
    WHEN mc.max_uses IS NULL THEN 'Unlimited'
    ELSE (mc.max_uses - mc.current_uses)::TEXT || ' remaining'
  END as uses_status,
  mc.is_active,
  mc.created_at,
  COUNT(p.id) as total_signups
FROM master_codes mc
LEFT JOIN profiles p ON p.invited_by_master_code = mc.code
GROUP BY mc.id, mc.code, mc.type, mc.max_uses, mc.current_uses, mc.is_active, mc.created_at
ORDER BY mc.created_at DESC;

-- Create view for admin user list
DROP VIEW IF EXISTS admin_user_list;
CREATE VIEW admin_user_list AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.is_admin,
  p.is_super_admin,
  p.admin_granted_at,
  p.admin_granted_by,
  granter.username as granted_by_username,
  p.created_at
FROM profiles p
LEFT JOIN profiles granter ON p.admin_granted_by = granter.id
ORDER BY p.is_super_admin DESC, p.is_admin DESC, p.created_at DESC;

-- Function to grant admin access (only super admins can call this)
CREATE OR REPLACE FUNCTION grant_admin_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_super BOOLEAN;
BEGIN
  -- Check if caller is super admin
  SELECT is_super_admin INTO is_super
  FROM profiles
  WHERE id = auth.uid();

  IF NOT is_super THEN
    RAISE EXCEPTION 'Only super admins can grant admin access';
  END IF;

  -- Grant admin access
  UPDATE profiles
  SET
    is_admin = true,
    admin_granted_at = NOW(),
    admin_granted_by = auth.uid()
  WHERE id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke admin access (only super admins can call this)
CREATE OR REPLACE FUNCTION revoke_admin_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_super BOOLEAN;
  target_is_super BOOLEAN;
BEGIN
  -- Check if caller is super admin
  SELECT is_super_admin INTO is_super
  FROM profiles
  WHERE id = auth.uid();

  IF NOT is_super THEN
    RAISE EXCEPTION 'Only super admins can revoke admin access';
  END IF;

  -- Check if target is super admin (can't revoke super admin)
  SELECT is_super_admin INTO target_is_super
  FROM profiles
  WHERE id = target_user_id;

  IF target_is_super THEN
    RAISE EXCEPTION 'Cannot revoke super admin access';
  END IF;

  -- Revoke admin access
  UPDATE profiles
  SET
    is_admin = false,
    admin_granted_at = NULL,
    admin_granted_by = NULL
  WHERE id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to views and functions
GRANT SELECT ON admin_master_code_stats TO authenticated;
GRANT SELECT ON admin_user_list TO authenticated;
GRANT EXECUTE ON FUNCTION grant_admin_access TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_admin_access TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_admin TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin system created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'New columns added to profiles:';
  RAISE NOTICE '  - is_admin (regular admin)';
  RAISE NOTICE '  - is_super_admin (can grant admin to others)';
  RAISE NOTICE '  - admin_granted_at';
  RAISE NOTICE '  - admin_granted_by';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Set yourself as super admin!';
  RAISE NOTICE 'Run this query with YOUR user ID:';
  RAISE NOTICE '';
  RAISE NOTICE 'UPDATE profiles';
  RAISE NOTICE 'SET is_admin = true, is_super_admin = true';
  RAISE NOTICE 'WHERE id = ''YOUR-USER-ID-HERE'';';
  RAISE NOTICE '';
  RAISE NOTICE 'To find your user ID, run:';
  RAISE NOTICE 'SELECT id, email FROM auth.users WHERE email = ''your-email@gmail.com'';';
END $$;

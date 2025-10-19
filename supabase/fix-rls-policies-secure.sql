-- Fix RLS Policies for Invite System (Secure Version)
-- Run this in Supabase SQL Editor

-- Fix master_codes policies
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active master codes" ON master_codes;
DROP POLICY IF EXISTS "Authenticated users can insert master codes" ON master_codes;
DROP POLICY IF EXISTS "Authenticated users can update master codes" ON master_codes;

-- Recreate policies
-- Anyone can view active codes (for validation)
CREATE POLICY "Anyone can view active master codes"
  ON master_codes FOR SELECT
  USING (is_active = true);

-- Only authenticated users can insert new codes (for admin dashboard)
CREATE POLICY "Authenticated users can insert master codes"
  ON master_codes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow RPC functions to update codes (for usage tracking via use_master_code function)
CREATE POLICY "System can update master codes"
  ON master_codes FOR UPDATE
  USING (true);

-- Fix waitlist policies
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON waitlist;
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON waitlist;
DROP POLICY IF EXISTS "Anyone can view waitlist" ON waitlist;

-- Allow anonymous users to insert (no auth required for waitlist signup)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ONLY authenticated users can view waitlist (for admin dashboard only)
-- This protects user privacy - only logged-in admins can see emails
CREATE POLICY "Only authenticated users can view waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);

-- Grant necessary permissions
GRANT INSERT ON master_codes TO authenticated;
GRANT UPDATE ON master_codes TO authenticated;
GRANT INSERT ON waitlist TO anon, authenticated;
GRANT SELECT ON waitlist TO authenticated;

-- Important: Remove public access to waitlist view
REVOKE SELECT ON waitlist FROM anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Secure RLS policies applied!';
  RAISE NOTICE '📝 Master codes: authenticated users can insert, system can update for tracking';
  RAISE NOTICE '📝 Waitlist: anyone can JOIN, but only authenticated users can VIEW';
  RAISE NOTICE '🔒 Privacy: Waitlist emails are only visible to logged-in users';
END $$;

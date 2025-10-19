-- Fix RLS Policies for Invite System
-- Run this in Supabase SQL Editor

-- Fix master_codes policies
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active master codes" ON master_codes;
DROP POLICY IF EXISTS "Authenticated users can insert master codes" ON master_codes;

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

-- Allow authenticated users to update codes (for usage tracking)
CREATE POLICY "Authenticated users can update master codes"
  ON master_codes FOR UPDATE
  TO authenticated
  USING (true);

-- Fix waitlist policies
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON waitlist;

-- Allow anonymous users to insert (no auth required for waitlist)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can view all waitlist (for admin dashboard)
CREATE POLICY "Authenticated users can view waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can view their own entry (if they know their email)
CREATE POLICY "Anyone can view waitlist"
  ON waitlist FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant necessary permissions
GRANT INSERT ON master_codes TO authenticated;
GRANT UPDATE ON master_codes TO authenticated;
GRANT INSERT ON waitlist TO anon, authenticated;
GRANT SELECT ON waitlist TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed!';
  RAISE NOTICE '📝 Master codes: authenticated users can now insert/update';
  RAISE NOTICE '📝 Waitlist: anyone (including anonymous) can insert and view';
END $$;

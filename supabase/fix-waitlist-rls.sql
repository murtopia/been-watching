-- Fix waitlist RLS to allow anonymous inserts
-- Run this in Supabase SQL Editor

-- Drop any existing insert policies
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON waitlist;

-- Create policy allowing anonymous users to insert
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Grant INSERT permission to anonymous users
GRANT INSERT ON waitlist TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Verify the policy was created
SELECT 
  policyname, 
  cmd, 
  roles
FROM pg_policies 
WHERE tablename = 'waitlist';


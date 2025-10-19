-- Fix master_codes UPDATE policy to allow admins to deactivate codes
-- Run this in Supabase SQL Editor

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Only admins can update master codes" ON master_codes;

-- Recreate it with proper permissions
CREATE POLICY "Only admins can update master codes"
  ON master_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Also ensure authenticated users can update the table
GRANT UPDATE ON master_codes TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ master_codes UPDATE policy fixed!';
  RAISE NOTICE 'Admins can now deactivate codes.';
END $$;

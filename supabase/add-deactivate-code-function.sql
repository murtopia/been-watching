-- Create function to deactivate codes (bypasses RLS)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION deactivate_master_code(code_to_deactivate TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_user_admin BOOLEAN;
BEGIN
  -- Check if caller is admin
  SELECT is_admin INTO is_user_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT is_user_admin THEN
    RAISE EXCEPTION 'Only admins can deactivate codes';
  END IF;

  -- Deactivate the code
  UPDATE master_codes
  SET is_active = false
  WHERE code = code_to_deactivate;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION deactivate_master_code TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ deactivate_master_code function created!';
  RAISE NOTICE 'Admins can now deactivate codes using: SELECT deactivate_master_code(''CODE_HERE'');';
END $$;

-- Fix Invite Code Usage Counts
-- This migration:
-- 1. Grants missing EXECUTE permissions on master code functions
-- 2. Syncs the current_uses counter with actual signup counts

-- ============================================
-- STEP 1: Grant execute permissions (ROOT CAUSE FIX)
-- ============================================
-- These permissions were missing from the original migration,
-- causing the use_master_code RPC to fail silently

GRANT EXECUTE ON FUNCTION is_master_code_valid(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION use_master_code(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_bwalpha_code() TO authenticated;

-- Also ensure the master_codes table allows updates from the RPC function
-- (The function uses FOR UPDATE and UPDATE statements)
DO $$
BEGIN
  -- Check if the update policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'master_codes' 
    AND policyname = 'Allow RPC to update master codes'
  ) THEN
    CREATE POLICY "Allow RPC to update master codes"
      ON master_codes FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
    RAISE NOTICE '✅ Created UPDATE policy for master_codes';
  ELSE
    RAISE NOTICE '✅ UPDATE policy for master_codes already exists';
  END IF;
END $$;

-- ============================================
-- STEP 2: Sync historical data
-- ============================================
-- Update current_uses based on actual profile counts
UPDATE master_codes mc
SET current_uses = (
  SELECT COUNT(*) 
  FROM profiles p 
  WHERE p.invited_by_master_code = mc.code
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.invited_by_master_code = mc.code
);

-- Verify the fix worked
DO $$
DECLARE
  mismatched_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO mismatched_count
  FROM master_codes mc
  WHERE mc.current_uses != (
    SELECT COUNT(*) FROM profiles p WHERE p.invited_by_master_code = mc.code
  );
  
  IF mismatched_count = 0 THEN
    RAISE NOTICE '✅ All invite code usage counts are now in sync!';
  ELSE
    RAISE NOTICE '⚠️ % codes still have mismatched counts', mismatched_count;
  END IF;
END $$;

-- Show the updated counts
SELECT 
  code,
  type,
  current_uses as "Uses (Fixed)",
  max_uses as "Max Uses",
  (SELECT COUNT(*) FROM profiles p WHERE p.invited_by_master_code = mc.code) as "Actual Signups",
  is_active
FROM master_codes mc
ORDER BY created_at DESC;


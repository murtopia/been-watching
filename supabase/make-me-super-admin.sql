-- Make yourself super admin
-- Run this AFTER running add-admin-system.sql

-- Step 1: Find your user ID
-- This will show you your user ID from your Google login
SELECT id, email, raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email LIKE '%gmail.com%'
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Copy your ID from above and run this (replace YOUR-USER-ID with actual ID):
-- UPDATE profiles
-- SET is_admin = true, is_super_admin = true, admin_granted_at = NOW()
-- WHERE id = 'YOUR-USER-ID';

-- Step 3: Verify it worked:
-- SELECT username, display_name, is_admin, is_super_admin
-- FROM profiles
-- WHERE is_super_admin = true;

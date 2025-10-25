-- Verification script to check database state before running migration
-- Run this first to see what already exists

-- 1. Check if new profile columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('profile_invite_earned', 'invited_by')
ORDER BY column_name;

-- 2. Check if referrals table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'referrals'
) as referrals_table_exists;

-- 3. Check existing RLS policies on referrals (if table exists)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'referrals';

-- 4. Check if functions exist
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name IN (
  'check_profile_completion',
  'award_profile_completion_invite',
  'redeem_invite'
)
ORDER BY routine_name;

-- 5. Check sample user profile completion status
SELECT
  id,
  username,
  avatar_url IS NOT NULL as has_avatar,
  bio IS NOT NULL AND bio != 'What have you been watching?' as has_bio,
  (top_show_1 IS NOT NULL AND top_show_2 IS NOT NULL AND top_show_3 IS NOT NULL) as has_top_shows,
  invites_remaining,
  profile_invite_earned,
  invited_by
FROM profiles
WHERE username = 'murtopia';

-- 6. Count watch_status entries for your user
SELECT
  p.username,
  COUNT(*) FILTER (WHERE ws.status = 'want') as want_count,
  COUNT(*) FILTER (WHERE ws.status = 'watching') as watching_count,
  COUNT(*) FILTER (WHERE ws.status = 'watched') as watched_count
FROM profiles p
LEFT JOIN watch_status ws ON ws.user_id = p.id
WHERE p.username = 'murtopia'
GROUP BY p.username;

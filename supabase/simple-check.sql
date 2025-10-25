-- Simple check to see what exists

-- Does profile_invite_earned column exist?
SELECT COUNT(*) as column_exists
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'profile_invite_earned';

-- Does referrals table exist?
SELECT COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'referrals';

-- Does the function exist?
SELECT COUNT(*) as function_exists
FROM information_schema.routines
WHERE routine_name = 'award_profile_completion_invite';

-- Debug: Check if your auth user matches your profile

-- 1. Check what user_id Supabase auth thinks you are
SELECT auth.uid() as current_auth_user_id;

-- 2. Check if this user_id exists in profiles
SELECT
    'Profile exists for auth user?' as check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
        THEN 'YES - Profile found'
        ELSE 'NO - Profile missing!'
    END as result,
    auth.uid() as auth_user_id;

-- 3. List all profiles
SELECT id, username, display_name FROM public.profiles;

-- 4. Check foreign key constraints on ratings table
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('ratings', 'watch_status')
AND tc.constraint_type = 'FOREIGN KEY';

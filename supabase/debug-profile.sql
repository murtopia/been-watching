-- Debug: Check what's in profiles table
SELECT
    id,
    user_id,
    username,
    display_name,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Also check auth.users to see if your user exists there
SELECT
    id,
    email,
    created_at
FROM auth.users
WHERE id = 'ac15f0ac-ef46-4efc-bee3-96084ede16ad';

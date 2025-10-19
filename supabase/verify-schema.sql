-- Verify the exact schema of all tables
-- Run this first to see what we're working with

-- 1. Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check media table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'media'
ORDER BY ordinal_position;

-- 3. Check watch_status table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'watch_status'
ORDER BY ordinal_position;

-- 4. Check ratings table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ratings'
ORDER BY ordinal_position;

-- 5. Check what constraints exist on ratings
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'ratings';

-- 6. Verify your auth user exists
SELECT id, email FROM auth.users WHERE id = 'ac15f0ac-ef46-4efc-bee3-96084ede16ad';

-- 7. Check if your profile exists
SELECT id, user_id, username, display_name FROM public.profiles WHERE user_id = 'ac15f0ac-ef46-4efc-bee3-96084ede16ad';

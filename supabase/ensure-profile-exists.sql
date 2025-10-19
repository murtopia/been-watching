-- This script ensures a profile exists for the authenticated user
-- Run this in your Supabase SQL Editor

-- First, let's see all auth users and their profiles
SELECT
  au.id as user_id,
  au.email,
  p.id as profile_id,
  p.username,
  p.display_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- Create profiles for any auth users that don't have one
-- This uses the auth.users table to create matching profiles
INSERT INTO public.profiles (id, user_id, username, display_name, created_at, updated_at)
SELECT
  au.id,
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)),
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verify the profiles were created
SELECT
  au.id as user_id,
  au.email,
  p.id as profile_id,
  p.username,
  p.display_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- Fix: Auto-create profile when new user signs up
-- This fixes the "Database error saving new user" error
-- Run this in Supabase SQL Editor

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    bio,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'What have you been watching?',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also fix any existing auth users without profiles
INSERT INTO public.profiles (id, username, display_name, bio, created_at, updated_at)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'user_name',
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
  ),
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ),
  'What have you been watching?',
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verify all auth users now have profiles
SELECT
  au.id,
  au.email,
  p.username,
  p.display_name,
  CASE WHEN p.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

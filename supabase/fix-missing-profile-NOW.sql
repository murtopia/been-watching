-- EMERGENCY FIX: Create profile for authenticated user
-- Run this NOW in your Supabase SQL Editor

-- First, check what columns the profiles table actually has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check what auth users exist
SELECT id, email FROM auth.users;

-- Now create the profile - we'll handle both possible schemas
DO $$
DECLARE
    has_user_id_column boolean;
    auth_user_id uuid;
    auth_user_email text;
BEGIN
    -- Check if user_id column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'user_id'
    ) INTO has_user_id_column;

    -- Get the authenticated user
    SELECT id, email INTO auth_user_id, auth_user_email
    FROM auth.users
    LIMIT 1;

    -- Delete any existing profile for this user (to start fresh)
    IF has_user_id_column THEN
        DELETE FROM public.profiles WHERE user_id = auth_user_id OR id = auth_user_id;
    ELSE
        DELETE FROM public.profiles WHERE id = auth_user_id;
    END IF;

    -- Insert profile based on schema
    IF has_user_id_column THEN
        -- Schema has both id and user_id
        INSERT INTO public.profiles (id, user_id, username, display_name, created_at, updated_at)
        VALUES (
            auth_user_id,
            auth_user_id,
            SPLIT_PART(auth_user_email, '@', 1),
            SPLIT_PART(auth_user_email, '@', 1),
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created profile with id=% and user_id=%', auth_user_id, auth_user_id;
    ELSE
        -- Schema has only id
        INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
        VALUES (
            auth_user_id,
            SPLIT_PART(auth_user_email, '@', 1),
            SPLIT_PART(auth_user_email, '@', 1),
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created profile with id=%', auth_user_id;
    END IF;
END $$;

-- Verify the profile was created
SELECT * FROM public.profiles;

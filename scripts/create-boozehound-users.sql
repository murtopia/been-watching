-- Create Boozehound User Profiles
-- This script creates profiles for Todd, Taylor, and Pat
-- Note: These profiles will be linked when users sign up with Google OAuth

-- First, let's check if Nick's profile exists and get his user_id
-- We'll need this for setting up the follows

-- Create temporary function to generate UUIDs for our friends
-- We'll use deterministic UUIDs based on their emails so we can reference them

-- Todd Williams (Toddles)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'toddw493@gmail.com',
    crypt('temporary-password-will-reset-on-oauth', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Todd Williams"}',
    false,
    'authenticated'
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Get Todd's ID
DO $$
DECLARE
    todd_id UUID;
    taylor_id UUID;
    pat_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO todd_id FROM auth.users WHERE email = 'toddw493@gmail.com';
    SELECT id INTO taylor_id FROM auth.users WHERE email = 'taylormurto@gmail.com';
    SELECT id INTO pat_id FROM auth.users WHERE email = 'moss.pat@gmail.com';

    -- Create Todd's profile if user exists
    IF todd_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_private,
            invite_tier,
            invites_remaining,
            is_approved,
            created_at,
            updated_at
        ) VALUES (
            todd_id,
            'Toddles',
            'Todd Williams',
            'What have you been watching?',
            NULL,
            false,
            'boozehound',
            0,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            display_name = EXCLUDED.display_name,
            invite_tier = EXCLUDED.invite_tier;
    END IF;
END $$;

-- Taylor Murto (Taylor.Murto)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'taylormurto@gmail.com',
    crypt('temporary-password-will-reset-on-oauth', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Taylor Murto"}',
    false,
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Taylor's profile
DO $$
DECLARE
    taylor_id UUID;
BEGIN
    SELECT id INTO taylor_id FROM auth.users WHERE email = 'taylormurto@gmail.com';

    IF taylor_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_private,
            invite_tier,
            invites_remaining,
            is_approved,
            created_at,
            updated_at
        ) VALUES (
            taylor_id,
            'Taylor.Murto',
            'Taylor Murto',
            'What have you been watching?',
            NULL,
            false,
            'boozehound',
            0,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            display_name = EXCLUDED.display_name,
            invite_tier = EXCLUDED.invite_tier;
    END IF;
END $$;

-- Pat Moss (Mossy)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'moss.pat@gmail.com',
    crypt('temporary-password-will-reset-on-oauth', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Pat Moss"}',
    false,
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Pat's profile
DO $$
DECLARE
    pat_id UUID;
BEGIN
    SELECT id INTO pat_id FROM auth.users WHERE email = 'moss.pat@gmail.com';

    IF pat_id IS NOT NULL THEN
        INSERT INTO public.profiles (
            id,
            username,
            display_name,
            bio,
            avatar_url,
            is_private,
            invite_tier,
            invites_remaining,
            is_approved,
            created_at,
            updated_at
        ) VALUES (
            pat_id,
            'Mossy',
            'Pat Moss',
            'What have you been watching?',
            NULL,
            false,
            'boozehound',
            0,
            true,
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            display_name = EXCLUDED.display_name,
            invite_tier = EXCLUDED.invite_tier;
    END IF;
END $$;

-- Verify the users were created
SELECT
    p.username,
    p.display_name,
    u.email,
    p.invite_tier,
    p.invites_remaining
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.username IN ('Toddles', 'Taylor.Murto', 'Mossy', 'murtopia')
ORDER BY p.created_at;

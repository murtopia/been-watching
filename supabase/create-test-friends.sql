-- Create Test Friend Accounts
-- This creates dummy accounts for Taylor, Todd, and Pat so we can populate their data
-- Later, when they actually sign up with Google OAuth, we can migrate their data

-- Step 1: Create dummy profiles with fixed UUIDs
-- These are test UUIDs that won't conflict with real auth accounts

INSERT INTO public.profiles (id, username, display_name, bio, avatar_url, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Taylor.Murto', 'Taylor Murto', 'What have you been watching?', NULL, NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Toddles', 'Todd Williams', 'What have you been watching?', NULL, NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Mossy', 'Pat Moss', 'What have you been watching?', NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio;

-- Note: These test accounts won't be able to log in (no auth.users entry)
-- They exist only so you can see friend data in the UI
-- When real users sign up later, we can migrate their data to real accounts

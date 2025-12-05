-- Create test users for Find New Friends card testing
-- Run this in your Supabase SQL Editor

-- These are fake profiles for testing the Find New Friends card
-- They will appear as suggestions for users to follow

-- Insert test profiles (using random UUIDs)
INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, created_at, updated_at)
VALUES 
  (
    'a1b2c3d4-1111-4444-8888-000000000001',
    'testuser_alex',
    'Alex Thompson',
    NULL, -- Will show initials avatar
    'Horror movie enthusiast 🎬 Always looking for the next great scare!',
    NOW(),
    NOW()
  ),
  (
    'a1b2c3d4-2222-4444-8888-000000000002', 
    'testuser_jordan',
    'Jordan Rivera',
    NULL, -- Will show initials avatar
    'Binge-watching expert. Currently obsessed with true crime docs.',
    NOW(),
    NOW()
  ),
  (
    'a1b2c3d4-3333-4444-8888-000000000003',
    'testuser_sam',
    'Sam Chen',
    NULL, -- Will show initials avatar
    'Sci-fi nerd and anime lover. Lets talk about your favorite shows!',
    NOW(),
    NOW()
  ),
  (
    'a1b2c3d4-4444-4444-8888-000000000004',
    'testuser_taylor',
    'Taylor Kim',
    NULL, -- Will show initials avatar
    'Comedy is my therapy. Also love a good drama that makes me cry.',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Add some watch statuses for these users so they have stats
INSERT INTO public.watch_status (user_id, media_id, status, created_at, updated_at)
VALUES
  -- Alex's watchlist
  ('a1b2c3d4-1111-4444-8888-000000000001', 'tv-1396-s1', 'watched', NOW(), NOW()),
  ('a1b2c3d4-1111-4444-8888-000000000001', 'tv-66732-s1', 'watching', NOW(), NOW()),
  ('a1b2c3d4-1111-4444-8888-000000000001', 'movie-550', 'want', NOW(), NOW()),
  
  -- Jordan's watchlist
  ('a1b2c3d4-2222-4444-8888-000000000002', 'tv-1396-s1', 'watched', NOW(), NOW()),
  ('a1b2c3d4-2222-4444-8888-000000000002', 'tv-94997-s1', 'watched', NOW(), NOW()),
  ('a1b2c3d4-2222-4444-8888-000000000002', 'movie-680', 'watched', NOW(), NOW()),
  ('a1b2c3d4-2222-4444-8888-000000000002', 'tv-60574-s1', 'watching', NOW(), NOW()),
  
  -- Sam's watchlist  
  ('a1b2c3d4-3333-4444-8888-000000000003', 'tv-60735-s1', 'watched', NOW(), NOW()),
  ('a1b2c3d4-3333-4444-8888-000000000003', 'movie-603', 'watched', NOW(), NOW()),
  ('a1b2c3d4-3333-4444-8888-000000000003', 'tv-1399-s1', 'want', NOW(), NOW()),
  ('a1b2c3d4-3333-4444-8888-000000000003', 'movie-27205', 'watching', NOW(), NOW()),
  ('a1b2c3d4-3333-4444-8888-000000000003', 'tv-94997-s1', 'want', NOW(), NOW()),
  
  -- Taylor's watchlist
  ('a1b2c3d4-4444-4444-8888-000000000004', 'tv-2316-s1', 'watched', NOW(), NOW()),
  ('a1b2c3d4-4444-4444-8888-000000000004', 'tv-1418-s1', 'watched', NOW(), NOW()),
  ('a1b2c3d4-4444-4444-8888-000000000004', 'movie-508947', 'watched', NOW(), NOW())
ON CONFLICT (user_id, media_id) DO NOTHING;

-- Verify the profiles were created
SELECT id, username, display_name, bio FROM public.profiles 
WHERE username LIKE 'testuser_%';

-- Show their watch stats
SELECT 
  p.display_name,
  COUNT(CASE WHEN ws.status = 'want' THEN 1 END) as want_to_watch,
  COUNT(CASE WHEN ws.status = 'watching' THEN 1 END) as watching,
  COUNT(CASE WHEN ws.status = 'watched' THEN 1 END) as watched
FROM public.profiles p
LEFT JOIN public.watch_status ws ON p.id = ws.user_id
WHERE p.username LIKE 'testuser_%'
GROUP BY p.id, p.display_name;


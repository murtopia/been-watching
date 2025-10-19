-- Fix High Potential with the CORRECT poster
-- The current poster is for Peacemaker (wrong show!)

UPDATE public.media
SET
    poster_path = '/eYzbGcYnOUlvj2fa76pTgIXogd7.jpg',
    backdrop_path = '/9dgtJHwAhsGgLBSound1PatchKt.jpg'
WHERE id = 'tv-110492';

-- Verify the update
SELECT id, title, poster_path, overview
FROM public.media
WHERE id = 'tv-110492';

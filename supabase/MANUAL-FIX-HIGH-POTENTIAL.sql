-- URGENT: Manually update High Potential with TMDB data
-- Run this in your Supabase SQL Editor

UPDATE public.media
SET
    poster_path = '/hE3LRZAY84fG19a18pzpkZERjTE.jpg',
    backdrop_path = '/n9md3cXpzIVGfDDqmLXLmh3slpJ.jpg',
    overview = 'Morgan is a single mom with an exceptional mind, whose unconventional knack for solving crimes leads to an unusual and unstoppable partnership with a by-the-book seasoned detective.',
    vote_average = 7.9
WHERE id = 'tv-110492';

-- Verify the update
SELECT id, title, poster_path, overview
FROM public.media
WHERE id = 'tv-110492';

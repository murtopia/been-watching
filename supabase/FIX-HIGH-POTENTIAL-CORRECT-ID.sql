-- Fix High Potential with the CORRECT TMDB ID and poster
-- Current: tmdb_id=110492 (Peacemaker - WRONG!)
-- Correct: tmdb_id=226637 (High Potential 2024)

UPDATE public.media
SET
    tmdb_id = 226637,
    poster_path = '/xCtaUDBUP1iKqtoqpHfeH1T2pWF.jpg',
    backdrop_path = '/9dgtJHwAhsGgLBSound1PatchKt.jpg',
    overview = 'Morgan is a single mom with an exceptional mind, whose unconventional knack for solving crimes leads to an unusual and unstoppable partnership with a by-the-book seasoned detective.',
    vote_average = 8.3
WHERE id = 'tv-110492';

-- Verify the fix
SELECT
    id,
    title,
    tmdb_id,
    poster_path,
    LEFT(overview, 50) as overview_preview
FROM public.media
WHERE id = 'tv-110492';

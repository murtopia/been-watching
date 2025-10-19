-- This script will show you which media records are missing poster_path data
-- You'll need to manually update them by fetching from TMDB API

-- First, let's see what media we have and what's missing
SELECT
    id,
    title,
    tmdb_id,
    media_type,
    poster_path,
    CASE
        WHEN poster_path IS NULL THEN '❌ Need to fetch from TMDB'
        ELSE '✅ Has poster'
    END as status
FROM public.media
ORDER BY created_at DESC;

-- For now, let's manually update the High Potential record
-- High Potential (TV show) TMDB ID: 110492
-- Poster path from TMDB: /hE3LRZAY84fG19a18pzpkZERjTE.jpg (you'll need to verify this)

-- UNCOMMENT AND RUN THIS AFTER VERIFYING THE POSTER PATH:
-- UPDATE public.media
-- SET
--     poster_path = '/hE3LRZAY84fG19a18pzpkZERjTE.jpg',
--     backdrop_path = '/backdrop_path_here.jpg',
--     overview = 'A single mom works as a cleaning lady at the police department and uses her puzzle-solving skills to help solve crimes.',
--     vote_average = 7.9
-- WHERE id = 'tv-110492';

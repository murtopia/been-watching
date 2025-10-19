-- Check if the media records were actually updated
SELECT
    id,
    title,
    poster_path,
    overview,
    CASE
        WHEN poster_path IS NOT NULL AND overview IS NOT NULL THEN '✅ Complete'
        WHEN poster_path IS NOT NULL THEN '⚠️ Has poster, missing overview'
        WHEN overview IS NOT NULL THEN '⚠️ Has overview, missing poster'
        ELSE '❌ Missing both'
    END as status
FROM public.media
WHERE id = 'tv-110492';

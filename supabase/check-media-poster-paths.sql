-- Check if media records have poster_path data
SELECT
    id,
    title,
    poster_path,
    CASE
        WHEN poster_path IS NULL THEN '❌ Missing poster_path'
        ELSE '✅ Has poster_path'
    END as status
FROM public.media
ORDER BY created_at DESC
LIMIT 10;

-- Count how many media have poster_path vs don't
SELECT
    COUNT(*) as total_media,
    COUNT(poster_path) as has_poster_path,
    COUNT(*) - COUNT(poster_path) as missing_poster_path
FROM public.media;

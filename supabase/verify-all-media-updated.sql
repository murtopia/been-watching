-- Verify that all media records now have poster_path data
SELECT
    id,
    title,
    poster_path,
    CASE
        WHEN poster_path IS NOT NULL THEN '✅ Has poster'
        ELSE '❌ Missing poster'
    END as status
FROM public.media
ORDER BY
    CASE WHEN poster_path IS NULL THEN 0 ELSE 1 END,
    title;

-- Count summary
SELECT
    COUNT(*) as total_media,
    COUNT(poster_path) as has_poster,
    COUNT(*) - COUNT(poster_path) as missing_poster
FROM public.media;

-- Debug: Check if activities have matching media records
SELECT
    a.id as activity_id,
    a.media_id,
    a.activity_type,
    m.id as media_table_id,
    m.title,
    m.poster_path,
    m.tmdb_id
FROM public.activities a
LEFT JOIN public.media m ON a.media_id = m.id
ORDER BY a.created_at DESC
LIMIT 10;

-- Check if media records exist
SELECT COUNT(*) as total_media FROM public.media;

-- Check sample media records
SELECT id, title, poster_path, tmdb_id
FROM public.media
LIMIT 5;

-- Check what activities exist for High Potential
SELECT
    a.id,
    a.user_id,
    a.media_id,
    a.activity_type,
    a.activity_data,
    a.created_at,
    p.display_name,
    m.title,
    m.poster_path
FROM public.activities a
LEFT JOIN public.profiles p ON a.user_id = p.id
LEFT JOIN public.media m ON a.media_id = m.id
WHERE a.media_id = 'tv-110492'
ORDER BY a.created_at DESC;

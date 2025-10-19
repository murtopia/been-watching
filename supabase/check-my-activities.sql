-- Check if you have any activities in the database
SELECT
    a.id,
    a.activity_type,
    a.created_at,
    p.display_name as user_name,
    m.title as media_title
FROM public.activities a
LEFT JOIN public.profiles p ON a.user_id = p.id
LEFT JOIN public.media m ON a.media_id = m.id
ORDER BY a.created_at DESC
LIMIT 10;

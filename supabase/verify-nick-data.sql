-- Verify Nick's data was inserted correctly

-- Check profile
SELECT 'PROFILE:' as type, username, display_name FROM public.profiles
WHERE id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe';

-- Count watch statuses
SELECT
    'WATCH STATUS COUNTS:' as type,
    status,
    COUNT(*) as count
FROM public.watch_status
WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe'
GROUP BY status;

-- Count ratings
SELECT
    'RATINGS COUNT:' as type,
    COUNT(*) as total_ratings
FROM public.ratings
WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe';

-- Show some sample data
SELECT
    'SAMPLE SHOWS:' as type,
    m.title,
    ws.status,
    r.rating
FROM public.watch_status ws
JOIN public.media m ON ws.media_id = m.id
LEFT JOIN public.ratings r ON r.user_id = ws.user_id AND r.media_id = ws.media_id
WHERE ws.user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe'
LIMIT 5;

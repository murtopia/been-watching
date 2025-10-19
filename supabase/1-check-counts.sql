-- Just check row counts in each table
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 'media', COUNT(*) FROM public.media
UNION ALL
SELECT 'activities', COUNT(*) FROM public.activities
UNION ALL
SELECT 'ratings', COUNT(*) FROM public.ratings
UNION ALL
SELECT 'watch_status', COUNT(*) FROM public.watch_status
UNION ALL
SELECT 'comments', COUNT(*) FROM public.comments
UNION ALL
SELECT 'activity_likes', COUNT(*) FROM public.activity_likes
ORDER BY row_count DESC;

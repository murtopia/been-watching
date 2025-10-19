-- Get full counts
SELECT 'Total Media' as metric, COUNT(*) as count FROM public.media
UNION ALL
SELECT 'Total Watch Status', COUNT(*) FROM public.watch_status WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe'
UNION ALL
SELECT 'Total Ratings', COUNT(*) FROM public.ratings WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe'
UNION ALL
SELECT 'Watching', COUNT(*) FROM public.watch_status WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe' AND status = 'watching'
UNION ALL
SELECT 'Watched', COUNT(*) FROM public.watch_status WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe' AND status = 'watched'
UNION ALL
SELECT 'Want to Watch', COUNT(*) FROM public.watch_status WHERE user_id = 'a59a9556-6bbc-422b-af13-59d61a1f7ebe' AND status = 'want';

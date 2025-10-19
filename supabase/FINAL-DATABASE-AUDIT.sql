-- FINAL DATABASE AUDIT
-- Fixed version without missing columns

-- ============================================
-- 1. ALL TABLES IN THE DATABASE
-- ============================================
SELECT
    'TABLES' as section,
    tablename as name,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. ROW COUNTS FOR CORE TABLES
-- ============================================
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

-- ============================================
-- 3. YOUR PROFILE INFO
-- ============================================
SELECT
    'YOUR PROFILE' as section,
    id,
    username,
    display_name,
    avatar_url,
    bio,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 4. YOUR ACTIVITIES (MOST RECENT)
-- ============================================
SELECT
    'YOUR ACTIVITIES' as section,
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

-- ============================================
-- 5. YOUR RATINGS (MOST RECENT)
-- ============================================
SELECT
    'YOUR RATINGS' as section,
    r.rating,
    m.title,
    m.media_type,
    r.created_at,
    p.display_name as user_name
FROM public.ratings r
LEFT JOIN public.media m ON r.media_id = m.id
LEFT JOIN public.profiles p ON r.user_id = p.id
ORDER BY r.created_at DESC
LIMIT 10;

-- ============================================
-- 6. YOUR WATCH STATUS (MOST RECENT)
-- ============================================
SELECT
    'YOUR WATCH STATUS' as section,
    ws.status,
    m.title,
    m.media_type,
    ws.created_at,
    p.display_name as user_name
FROM public.watch_status ws
LEFT JOIN public.media m ON ws.media_id = m.id
LEFT JOIN public.profiles p ON ws.user_id = p.id
ORDER BY ws.created_at DESC
LIMIT 10;

-- ============================================
-- 7. RATING DISTRIBUTION
-- ============================================
SELECT
    'RATING DISTRIBUTION' as section,
    rating,
    COUNT(*) as count
FROM public.ratings
GROUP BY rating
ORDER BY
    CASE rating
        WHEN 'love' THEN 1
        WHEN 'like' THEN 2
        WHEN 'meh' THEN 3
    END;

-- ============================================
-- 8. WATCH STATUS DISTRIBUTION
-- ============================================
SELECT
    'WATCH STATUS DISTRIBUTION' as section,
    status,
    COUNT(*) as count
FROM public.watch_status
GROUP BY status
ORDER BY
    CASE status
        WHEN 'watched' THEN 1
        WHEN 'watching' THEN 2
        WHEN 'want' THEN 3
    END;

-- ============================================
-- 9. MEDIA BREAKDOWN BY TYPE
-- ============================================
SELECT
    'MEDIA BY TYPE' as section,
    media_type,
    COUNT(*) as count
FROM public.media
GROUP BY media_type
ORDER BY count DESC;

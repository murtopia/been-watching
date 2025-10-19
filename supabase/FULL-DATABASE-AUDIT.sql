-- COMPREHENSIVE DATABASE AUDIT
-- Run this to get a complete picture of the database setup

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
-- 2. ROW COUNTS FOR ALL TABLES
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
UNION ALL
SELECT 'friendships', COUNT(*) FROM public.friendships
UNION ALL
SELECT 'invites', COUNT(*) FROM public.invites
ORDER BY row_count DESC;

-- ============================================
-- 3. YOUR PROFILE INFO
-- ============================================
SELECT
    'YOUR PROFILE' as section,
    id,
    username,
    display_name,
    email,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 4. YOUR ACTIVITIES
-- ============================================
SELECT
    'YOUR ACTIVITIES' as section,
    a.id,
    a.activity_type,
    a.created_at,
    p.display_name as user_name,
    m.title as media_title,
    a.activity_data
FROM public.activities a
LEFT JOIN public.profiles p ON a.user_id = p.id
LEFT JOIN public.media m ON a.media_id = m.id
ORDER BY a.created_at DESC
LIMIT 10;

-- ============================================
-- 5. YOUR RATINGS
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
-- 6. YOUR WATCH STATUS
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
-- 7. COMMENTS (if any)
-- ============================================
SELECT
    'COMMENTS' as section,
    c.comment_text,
    p.display_name as commenter,
    a.activity_type,
    c.created_at
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
LEFT JOIN public.activities a ON c.activity_id = a.id
ORDER BY c.created_at DESC
LIMIT 10;

-- ============================================
-- 8. ACTIVITY LIKES (if any)
-- ============================================
SELECT
    'ACTIVITY LIKES' as section,
    al.activity_id,
    p.display_name as liker,
    al.created_at
FROM public.activity_likes al
LEFT JOIN public.profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 10;

-- ============================================
-- 9. FRIENDSHIPS
-- ============================================
SELECT
    'FRIENDSHIPS' as section,
    p1.display_name as user1,
    p2.display_name as user2,
    f.status,
    f.created_at
FROM public.friendships f
LEFT JOIN public.profiles p1 ON f.user_id = p1.id
LEFT JOIN public.profiles p2 ON f.friend_id = p2.id
ORDER BY f.created_at DESC
LIMIT 10;

-- ============================================
-- 10. ALL RLS POLICIES
-- ============================================
SELECT
    'RLS POLICIES' as section,
    tablename,
    policyname,
    cmd as command,
    CASE
        WHEN qual IS NULL THEN 'true (all rows)'
        ELSE qual
    END as using_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 11. MEDIA BREAKDOWN BY TYPE
-- ============================================
SELECT
    'MEDIA BY TYPE' as section,
    media_type,
    COUNT(*) as count
FROM public.media
GROUP BY media_type
ORDER BY count DESC;

-- ============================================
-- 12. RATING DISTRIBUTION
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
-- 13. WATCH STATUS DISTRIBUTION
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

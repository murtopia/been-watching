-- Check if comments and activity_likes tables exist and have data

-- Check comments table
SELECT 'comments table' as table_name, COUNT(*) as row_count FROM public.comments;

-- Check activity_likes table
SELECT 'activity_likes table' as table_name, COUNT(*) as row_count FROM public.activity_likes;

-- Check RLS status
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('comments', 'activity_likes');

-- Check policies
SELECT
    tablename,
    policyname,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('comments', 'activity_likes');

-- Disable RLS on media table (it's public TMDB data anyway)
-- This will allow the Node.js script to update media records

ALTER TABLE public.media DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT
    tablename,
    rowsecurity,
    CASE
        WHEN rowsecurity = false THEN '✅ RLS is DISABLED - updates will work!'
        ELSE '❌ RLS is still ENABLED'
    END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'media';

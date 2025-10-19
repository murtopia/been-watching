-- URGENT: Fix the rating constraint to use 'meh' instead of 'dislike'
-- This will allow the frontend to save ratings properly

-- First, check current constraint
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'ratings'
  AND nsp.nspname = 'public'
  AND con.conname LIKE '%rating%';

-- Drop the old constraint
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rating_check;

-- Add the correct constraint with 'meh', 'like', 'love'
ALTER TABLE public.ratings ADD CONSTRAINT ratings_rating_check
    CHECK (rating IN ('meh', 'like', 'love'));

-- Verify the new constraint
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'ratings'
  AND nsp.nspname = 'public'
  AND con.conname LIKE '%rating%';

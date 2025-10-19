-- Check what the rating constraint actually is in the database
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'ratings'
  AND nsp.nspname = 'public'
  AND con.conname LIKE '%rating%';

-- Also check the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ratings'
ORDER BY ordinal_position;

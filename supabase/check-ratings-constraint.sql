-- Check what rating values are allowed
SELECT con.conname as constraint_name,
       pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ratings'
  AND con.contype = 'c';

-- Check watch_status foreign key - does it reference profiles.id or profiles.user_id?
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'watch_status'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id';

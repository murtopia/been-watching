-- Create activities from your existing ratings
-- This will populate your feed with real activities

INSERT INTO public.activities (user_id, media_id, activity_type, activity_data, created_at)
SELECT
    r.user_id,
    r.media_id,
    'rated' as activity_type,
    jsonb_build_object(
        'rating', r.rating,
        'my_take', COALESCE(r.my_take, '')
    ) as activity_data,
    r.created_at
FROM public.ratings r
WHERE NOT EXISTS (
    -- Don't create duplicate activities
    SELECT 1 FROM public.activities a
    WHERE a.user_id = r.user_id
    AND a.media_id = r.media_id
    AND a.activity_type = 'rated'
);

-- Show how many activities were created
SELECT COUNT(*) as new_activities_created FROM public.activities;

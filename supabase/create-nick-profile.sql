-- Create Nick's profile if it doesn't exist, then add watch data
DO $$
DECLARE
    nick_user_id UUID := 'ac15f0ac-ef46-4efc-bee3-96084ede16ad';
BEGIN
    RAISE NOTICE '🎬 Setting up Nick''s profile and watch data...';

    -- Step 1: Create or update profile
    INSERT INTO public.profiles (user_id, username, display_name, bio)
    VALUES (
        nick_user_id,
        'Murtopia',
        'Nick Murto',
        'What have you been watching?'
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        username = 'Murtopia',
        display_name = 'Nick Murto',
        bio = 'What have you been watching?';

    RAISE NOTICE '✅ Profile created/updated';

    -- Step 2: Temporarily disable triggers
    ALTER TABLE public.ratings DISABLE TRIGGER on_rating_created;
    ALTER TABLE public.watch_status DISABLE TRIGGER on_watch_status_changed;

    -- Step 3: Insert all media (with tmdb_id extracted from id)
    INSERT INTO public.media (id, tmdb_id, title, media_type, poster_path, release_date) VALUES
        ('tv-194764', 194764, 'Severance', 'tv', '/cNvoybaGNjdE74udVlMfinaQLmp.jpg', '2022-02-18'),
        ('tv-136311', 136311, 'Slow Horses', 'tv', '/2nAWOGdRnLfz1YV2vVB9sZzNkqk.jpg', '2022-04-01'),
        ('tv-214120', 214120, 'Shrinking', 'tv', '/4h8R16iDWWiPjOvwczUYg9kLV7Q.jpg', '2023-01-26'),
        ('tv-125988', 125988, 'Bad Sisters', 'tv', '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg', '2022-08-19'),
        ('tv-110492', 110492, 'High Potential', 'tv', '/tGGOAuLvfTBCwfV8cXd29d0juCX.jpg', '2024-09-17'),
        ('tv-95480', 95480, 'The Equalizer', 'tv', '/q21Ggcd3eFMboo4TN0rh2ibuLcz.jpg', '2021-02-07'),
        ('tv-249039', 249039, 'Tracker', 'tv', '/s0EI4LT2PxOd9hVIRUBQS0SEp99.jpg', '2024-02-11'),
        ('tv-216082', 216082, 'Nobody Wants This', 'tv', '/rCJZW7dQBioSnHNFpzYUo7OM7C6.jpg', '2024-09-26'),
        ('tv-157741', 157741, 'Sunny', 'tv', '/cEKKw5SR69KcoOjPfYdPIuDcEGa.jpg', '2024-07-10'),
        ('tv-113962', 113962, 'Sugar', 'tv', '/6Lw54zxm7WfthSLdQdANjLkG6mQ.jpg', '2024-04-05'),
        ('movie-1005331', 1005331, 'Carry-On', 'movie', '/3POUtynDuvVafkaBf7ZSZHKyTj5.jpg', '2024-12-05'),
        ('tv-225385', 225385, 'Landman', 'tv', '/fUuivsbUBSPIswept86zRfoPyHUt.jpg', '2024-11-17'),
        ('tv-222766', 222766, 'The Franchise', 'tv', '/oULo0S1HiCXB8w9iZGJNiI2ccWL.jpg', '2024-10-06'),
        ('tv-130853', 130853, 'Bad Monkey', 'tv', '/uDDuf64t3OjSWjhz5wFxbyf7LkL.jpg', '2024-08-13'),
        ('tv-147050', 147050, 'The Perfect Couple', 'tv', '/rDt08iScPJB95yKaAqLKXSbWIop.jpg', '2024-09-05'),
        ('movie-533535', 533535, 'Deadpool & Wolverine', 'movie', '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', '2024-07-24'),
        ('tv-108978', 108978, 'A Man on the Inside', 'tv', '/pV1biwaU6JIlZqDkhMiL6m6RKAQ.jpg', '2024-11-21'),
        ('tv-247718', 247718, 'English Teacher', 'tv', '/xUn3QH4mZkvMsxJzIZFqmTylb7r.jpg', '2024-09-02'),
        ('tv-250923', 250923, 'St. Denis Medical', 'tv', '/fskw48BqlHQa9AXpN82PBLnkA89.jpg', '2024-11-12'),
        ('movie-748783', 748783, 'The Garfield Movie', 'movie', '/xYduFGuch9OwbCOEUiamml18ZoB.jpg', '2024-04-30'),
        ('tv-60622', 60622, 'The Curse', 'tv', '/kk20TnPSq3LCZDe9l5rH2xOvL9X.jpg', '2023-11-10'),
        ('movie-1064028', 1064028, 'Subservience', 'movie', '/gBenxR01Uy0Ev9RTIw6dVBPoyQU.jpg', '2024-08-15'),
        ('tv-111800', 111800, 'Disclaimer', 'tv', '/gOxe6VUiNqzL0cLi1llV8Z1HeL7.jpg', '2024-10-11')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE '✅ Inserted all media';

    -- Step 4: Insert watch statuses
    INSERT INTO public.watch_status (user_id, media_id, status) VALUES
        -- Currently Watching
        (nick_user_id, 'tv-194764', 'watching'),
        (nick_user_id, 'tv-136311', 'watching'),
        (nick_user_id, 'tv-214120', 'watching'),
        (nick_user_id, 'tv-125988', 'watching'),
        (nick_user_id, 'tv-110492', 'watching'),
        (nick_user_id, 'tv-95480', 'watching'),
        (nick_user_id, 'tv-249039', 'watching'),
        -- Watched
        (nick_user_id, 'tv-216082', 'watched'),
        (nick_user_id, 'tv-157741', 'watched'),
        (nick_user_id, 'tv-113962', 'watched'),
        (nick_user_id, 'movie-1005331', 'watched'),
        (nick_user_id, 'tv-225385', 'watched'),
        (nick_user_id, 'tv-222766', 'watched'),
        (nick_user_id, 'tv-130853', 'watched'),
        (nick_user_id, 'tv-147050', 'watched'),
        (nick_user_id, 'movie-533535', 'watched'),
        (nick_user_id, 'tv-108978', 'watched'),
        (nick_user_id, 'tv-247718', 'watched'),
        (nick_user_id, 'tv-250923', 'watched'),
        (nick_user_id, 'movie-748783', 'watched'),
        -- Want to Watch
        (nick_user_id, 'tv-60622', 'want'),
        (nick_user_id, 'movie-1064028', 'want'),
        (nick_user_id, 'tv-111800', 'want')
    ON CONFLICT (user_id, media_id) DO NOTHING;

    RAISE NOTICE '✅ Inserted watch statuses';

    -- Step 5: Insert ratings
    INSERT INTO public.ratings (user_id, media_id, rating) VALUES
        (nick_user_id, 'tv-216082', 'love'),
        (nick_user_id, 'tv-157741', 'love'),
        (nick_user_id, 'tv-113962', 'love'),
        (nick_user_id, 'movie-1005331', 'like'),
        (nick_user_id, 'tv-225385', 'love'),
        (nick_user_id, 'tv-222766', 'love'),
        (nick_user_id, 'tv-130853', 'love'),
        (nick_user_id, 'tv-147050', 'love'),
        (nick_user_id, 'movie-533535', 'like'),
        (nick_user_id, 'tv-108978', 'like'),
        (nick_user_id, 'tv-247718', 'love'),
        (nick_user_id, 'tv-250923', 'love'),
        (nick_user_id, 'movie-748783', 'love')
    ON CONFLICT (user_id, media_id) DO UPDATE SET rating = EXCLUDED.rating;

    RAISE NOTICE '✅ Inserted ratings';

    -- Step 6: Re-enable triggers
    ALTER TABLE public.ratings ENABLE TRIGGER on_rating_created;
    ALTER TABLE public.watch_status ENABLE TRIGGER on_watch_status_changed;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================';
    RAISE NOTICE '✅ Nick''s profile and watch data complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   Currently Watching: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = nick_user_id AND status = 'watching');
    RAISE NOTICE '   Watched: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = nick_user_id AND status = 'watched');
    RAISE NOTICE '   Want to Watch: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = nick_user_id AND status = 'want');
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Refresh http://localhost:3000 to see your data!';
END $$;

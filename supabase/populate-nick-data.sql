-- Populate Nick's Watch Data
-- User ID: ac15f0ac-ef46-4efc-bee3-96084ede16ad

DO $$
DECLARE
    nick_id UUID := 'ac15f0ac-ef46-4efc-bee3-96084ede16ad';
BEGIN
    RAISE NOTICE '🎬 Populating Nick''s watch data...';

    -- Temporarily disable triggers
    ALTER TABLE public.ratings DISABLE TRIGGER on_rating_created;
    ALTER TABLE public.watch_status DISABLE TRIGGER on_watch_status_changed;

    -- Insert Nick's Currently Watching shows
    INSERT INTO public.media (id, tmdb_id, media_type, title, poster_path, tmdb_data) VALUES
        ('tv-194764', 194764, 'tv', 'The Penguin', '/vOWcqC4oDQws1doDWLO7d3dh5qc.jpg', '{}'),
        ('tv-136311', 136311, 'tv', 'Shrinking', '/cVmrNYgm5wcEexbXg4laNn3u4vq.jpg', '{}'),
        ('tv-214120', 214120, 'tv', '1923', '/zgZgIUw5Hp66Dp8y5KjhSlAaHL2.jpg', '{}'),
        ('tv-125988', 125988, 'tv', 'Silo', '/c2OijvbFEXBW1onbzuvENr4CGQB.jpg', '{}'),
        ('tv-110492', 110492, 'tv', 'Peacemaker', '/yb4F1Oocq8GfQt6iIuAgYEBokhG.jpg', '{}'),
        ('tv-95480', 95480, 'tv', 'Slow Horses', '/5RuZZIouptatjV96BdPmKmRsnGg.jpg', '{}'),
        ('tv-249039', 249039, 'tv', 'Black Rabbit', '/4e9CraVtGY00jLP2YGwsuEtaIjR.jpg', '{}')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.watch_status (user_id, media_id, status, paused) VALUES
        (nick_id, 'tv-194764', 'watching', false),
        (nick_id, 'tv-136311', 'watching', false),
        (nick_id, 'tv-214120', 'watching', false),
        (nick_id, 'tv-125988', 'watching', false),
        (nick_id, 'tv-110492', 'watching', false),
        (nick_id, 'tv-95480', 'watching', false),
        (nick_id, 'tv-249039', 'watching', false)
    ON CONFLICT (user_id, media_id) DO NOTHING;

    -- Insert Top 3 Shows
    INSERT INTO public.media (id, tmdb_id, media_type, title, poster_path, tmdb_data) VALUES
        ('tv-247718', 247718, 'tv', 'MobLand', '/abeH7n5pcuQcwYcTxG6DTZvXLP1.jpg', '{}'),
        ('tv-250923', 250923, 'tv', 'Nobody Wants This', '/xYdzshohIWsrBpIrFlYiT8wgv7U.jpg', '{}'),
        ('movie-748783', 748783, 'movie', 'The Ministry of Ungentlemanly Warfare', '/8aF0iAKH9MJMYAZROIMbXe2tzDw.jpg', '{}')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.top_shows (user_id, media_id, position) VALUES
        (nick_id, 'tv-247718', 1),
        (nick_id, 'tv-250923', 2),
        (nick_id, 'movie-748783', 3)
    ON CONFLICT (user_id, position) DO UPDATE SET media_id = EXCLUDED.media_id;

    -- Insert some recent watched shows with ratings
    INSERT INTO public.media (id, tmdb_id, media_type, title, poster_path, tmdb_data) VALUES
        ('tv-216082', 216082, 'tv', 'Zero Day', '/odIyR46aAX59dvQ1ON4P53ow1aE.jpg', '{}'),
        ('tv-157741', 157741, 'tv', 'Landman', '/rxWtATtTdwx0ERQjQ7BtVOMyq5r.jpg', '{}'),
        ('tv-113962', 113962, 'tv', 'Lioness', '/ajaXSmdAlYYhnvx1EIsvpfN949y.jpg', '{}'),
        ('movie-1005331', 1005331, 'movie', 'Carry-On', '/sjMN7DRi4sGiledsmllEw5HJjPy.jpg', '{}'),
        ('tv-225385', 225385, 'tv', 'Black Doves', '/uoXtkm2P4HPPL8T3IBJ02G3hCC4.jpg', '{}'),
        ('tv-222766', 222766, 'tv', 'The Day of the Jackal', '/tYLecM3WSEjlkKhkGiH5G68Dprm.jpg', '{}'),
        ('tv-130853', 130853, 'tv', 'Bad Monkey', '/sDbpr5VoxlcQvzvWFECr7bXCAwg.jpg', '{}'),
        ('tv-147050', 147050, 'tv', 'Disclaimer', '/6TdW4T2EsnhXrPQccB8szK93UhF.jpg', '{}'),
        ('movie-533535', 533535, 'movie', 'Deadpool & Wolverine', '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', '{}'),
        ('tv-108978', 108978, 'tv', 'Reacher', '/31GlRQMiDunO8cl3NxTz34U64rf.jpg', '{}')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.watch_status (user_id, media_id, status, paused) VALUES
        (nick_id, 'tv-216082', 'watched', false),
        (nick_id, 'tv-157741', 'watched', false),
        (nick_id, 'tv-113962', 'watched', false),
        (nick_id, 'movie-1005331', 'watched', false),
        (nick_id, 'tv-225385', 'watched', false),
        (nick_id, 'tv-222766', 'watched', false),
        (nick_id, 'tv-130853', 'watched', false),
        (nick_id, 'tv-147050', 'watched', false),
        (nick_id, 'movie-533535', 'watched', false),
        (nick_id, 'tv-108978', 'watched', false),
        (nick_id, 'tv-247718', 'watched', false),
        (nick_id, 'tv-250923', 'watched', false),
        (nick_id, 'movie-748783', 'watched', false)
    ON CONFLICT (user_id, media_id) DO NOTHING;

    INSERT INTO public.ratings (user_id, media_id, rating) VALUES
        (nick_id, 'tv-216082', 'love'),
        (nick_id, 'tv-157741', 'love'),
        (nick_id, 'tv-113962', 'love'),
        (nick_id, 'movie-1005331', 'like'),
        (nick_id, 'tv-225385', 'love'),
        (nick_id, 'tv-222766', 'love'),
        (nick_id, 'tv-130853', 'love'),
        (nick_id, 'tv-147050', 'love'),
        (nick_id, 'movie-533535', 'like'),
        (nick_id, 'tv-108978', 'like'),
        (nick_id, 'tv-247718', 'love'),
        (nick_id, 'tv-250923', 'love'),
        (nick_id, 'movie-748783', 'love')
    ON CONFLICT (user_id, media_id) DO UPDATE SET rating = EXCLUDED.rating;

    -- Insert some Want to Watch
    INSERT INTO public.media (id, tmdb_id, media_type, title, poster_path, tmdb_data) VALUES
        ('tv-60622', 60622, 'tv', 'Fargo', '/6U9CPeD8obHzweikFhiLhpc7YBT.jpg', '{}'),
        ('movie-1064028', 1064028, 'movie', 'Confess, Fletch', '/2kJohZ6KSOJbylAgvckKvaT6TvW.jpg', '{}'),
        ('tv-111800', 111800, 'tv', 'The Old Man', '/8Ec9zCZl2Go8WhDN1JWjjgQRlEi.jpg', '{}')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.watch_status (user_id, media_id, status, paused) VALUES
        (nick_id, 'tv-60622', 'want', false),
        (nick_id, 'movie-1064028', 'want', false),
        (nick_id, 'tv-111800', 'want', false)
    ON CONFLICT (user_id, media_id) DO NOTHING;

    -- Re-enable triggers
    ALTER TABLE public.ratings ENABLE TRIGGER on_rating_created;
    ALTER TABLE public.watch_status ENABLE TRIGGER on_watch_status_changed;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Nick''s data populated successfully!';
    RAISE NOTICE '   Top 3: MobLand, Nobody Wants This, Ministry of Ungentlemanly Warfare';
    RAISE NOTICE '   Currently Watching: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = nick_id AND status = 'watching');
    RAISE NOTICE '   Watched: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = nick_id AND status = 'watched');
    RAISE NOTICE '   Want to Watch: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = nick_id AND status = 'want');
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Refresh your app to see your data!';
END $$;

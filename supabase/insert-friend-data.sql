-- Friend Data Import SQL
-- Generated from TMDB fuzzy matching results
--
-- INSTRUCTIONS:
-- 1. First, run migration-friends.sql if you haven't already
-- 2. Create Google OAuth accounts for the 3 friends (or use test accounts)
-- 3. Get their user IDs from Supabase auth.users table
-- 4. Replace the UUIDs below with actual user IDs
-- 5. Run this SQL

-- ===================================================================
-- STEP 1: Replace these UUIDs with actual user IDs from auth.users
-- ===================================================================
-- After friends sign up with Google OAuth, run:
--   SELECT id, email FROM auth.users;
-- Then replace the UUIDs below

DO $$
DECLARE
    taylor_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE WITH REAL UUID
    todd_id UUID := '00000000-0000-0000-0000-000000000002';   -- REPLACE WITH REAL UUID
    pat_id UUID := '00000000-0000-0000-0000-000000000003';    -- REPLACE WITH REAL UUID
BEGIN
    -- Temporarily disable triggers to prevent activity spam
    ALTER TABLE public.ratings DISABLE TRIGGER on_rating_created;
    ALTER TABLE public.watch_status DISABLE TRIGGER on_watch_status_changed;

    -- Update friend profiles
    UPDATE public.profiles SET
        username = 'Taylor.Murto',
        display_name = 'Taylor Murto',
        bio = 'What have you been watching?'
    WHERE id = taylor_id;

    UPDATE public.profiles SET
        username = 'Toddles',
        display_name = 'Todd Williams',
        bio = 'What have you been watching?'
    WHERE id = todd_id;

    UPDATE public.profiles SET
        username = 'Mossy',
        display_name = 'Pat Moss',
        bio = 'What have you been watching?'
    WHERE id = pat_id;

    -- Insert all media (this is a subset, full list below)
    INSERT INTO public.media (id, tmdb_id, media_type, title, poster_path, tmdb_data)
    VALUES
        -- Taylor's shows
        ('tv-111800', 111800, 'tv', 'The Old Man', '/8Ec9zCZl2Go8WhDN1JWjjgQRlEi.jpg', '{}'),
        ('tv-82104', 82104, 'tv', 'The Order', '/yMPjmuSd5Fac8YMNOwofGALQWjR.jpg', '{}'),
        ('tv-125988', 125988, 'tv', 'Silo', '/c2OijvbFEXBW1onbzuvENr4CGQB.jpg', '{}'),
        ('tv-249039', 249039, 'tv', 'Black Rabbit', '/4e9CraVtGY00jLP2YGwsuEtaIjR.jpg', '{}'),
        ('tv-95480', 95480, 'tv', 'Slow Horses', '/5RuZZIouptatjV96BdPmKmRsnGg.jpg', '{}'),
        ('tv-8246', 8246, 'tv', 'Acapulco', NULL, '{}'),
        ('tv-112211', 112211, 'tv', 'Platonic', '/7G8wB9CG82nITeFwRFIRSk0sQJs.jpg', '{}'),
        ('tv-110492', 110492, 'tv', 'Peacemaker', '/yb4F1Oocq8GfQt6iIuAgYEBokhG.jpg', '{}'),
        ('tv-245703', 245703, 'tv', 'Dept. Q', '/h60alybJNgGGfPUbGGUXMXOoFvB.jpg', '{}'),
        ('tv-219760', 219760, 'tv', 'The Terminal List: Dark Wolf', '/9mYeRoWguq5etbwJRdF8BXFKiF.jpg', '{}'),
        ('tv-90282', 90282, 'tv', 'The Morning Show', '/y9x2R87yt2U616736NJrP0d56dt.jpg', '{}'),
        ('tv-156861', 156861, 'tv', 'The Curse', '/kGr8ulZ31zzidZUHxihjgNCxbjR.jpg', '{}'),
        ('tv-137893', 137893, 'tv', 'Griselda', '/nhEtK1lJKb3kqBtDBDXynGr3hJL.jpg', '{}'),
        ('movie-466420', 466420, 'movie', 'Killers of the Flower Moon', '/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg', '{}'),
        ('movie-578253', 578253, 'movie', 'Horizon: An American Saga - Chapter 1', '/2s92YzJnNmINPiEQTTl15MBEKs9.jpg', '{}'),
        ('tv-213306', 213306, 'tv', 'Cross', '/wy8NYpq3k4izodX5YOYmExKfHMe.jpg', '{}'),
        ('movie-1233575', 1233575, 'movie', 'Black Bag', '/hHPovtU4b96LHcoeEwRkGHI5btw.jpg', '{}'),
        ('movie-911430', 911430, 'movie', 'F1', '/9PXZIUsSDh4alB80jheWX4fhZmy.jpg', '{}'),
        ('tv-215995', 215995, 'tv', 'Smoke', '/c6xRvQCL07MVNamjfVU2an600q9.jpg', '{}'),
        ('movie-1263256', 1263256, 'movie', 'Happy Gilmore 2', '/ynT06XivgBDkg7AtbDbX1dJeBGY.jpg', '{}'),
        ('movie-1061474', 1061474, 'movie', 'Superman', '/wPLysNDLffQLOVebZQCbXJEv6E6.jpg', '{}'),
        ('movie-1233413', 1233413, 'movie', 'Sinners', '/4CkZl1LK6a5rXBqJB2ZP77h3N5i.jpg', '{}'),
        ('tv-136315', 136315, 'tv', 'The Bear', '/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg', '{}'),
        ('movie-749170', 749170, 'movie', 'Heads of State', '/lVgE5oLzf7ABmzyASEVcjYyHI41.jpg', '{}'),
        ('tv-246992', 246992, 'tv', 'Sirens', '/mezbwX9gFWTXl0XiicS5ZMcdXVx.jpg', '{}'),
        ('tv-247718', 247718, 'tv', 'MobLand', '/abeH7n5pcuQcwYcTxG6DTZvXLP1.jpg', '{}'),
        ('tv-216082', 216082, 'tv', 'Zero Day', '/odIyR46aAX59dvQ1ON4P53ow1aE.jpg', '{}'),
        ('tv-111803', 111803, 'tv', 'The White Lotus', '/gbSaK9v1CbcYH1ISgbM7XObD2dW.jpg', '{}'),
        ('tv-108978', 108978, 'tv', 'Reacher', '/31GlRQMiDunO8cl3NxTz34U64rf.jpg', '{}'),
        ('tv-249522', 249522, 'tv', 'Beast Games', '/l5pIuYEb6n2rzNMTF5KMLCOmVFg.jpg', '{}'),
        ('movie-1335778', 1335778, 'movie', 'Paradise', '/2pbl0s3rRFQTDzVLAxT5aez0ADG.jpg', '{}'),
        ('tv-210916', 210916, 'tv', 'The Recruit', '/mLbFg0u2DPYuB5CILzwWk3kdI8b.jpg', '{}'),
        ('tv-129552', 129552, 'tv', 'The Night Agent', '/4c5yUNcaff4W4aPrkXE6zr7papX.jpg', '{}'),
        ('tv-1537', 1537, 'tv', 'The Agency', '/aJXFbRv0WYRcT8cDOLMaKfVYwye.jpg', '{}'),
        ('tv-203857', 203857, 'tv', 'The Diplomat', '/cOKXV0FalCYixNmZYCfHXgyQ0VX.jpg', '{}'),
        ('tv-157741', 157741, 'tv', 'Landman', '/rxWtATtTdwx0ERQjQ7BtVOMyq5r.jpg', '{}'),
        ('tv-136311', 136311, 'tv', 'Shrinking', '/cVmrNYgm5wcEexbXg4laNn3u4vq.jpg', '{}'),
        ('movie-1005331', 1005331, 'movie', 'Carry-On', '/sjMN7DRi4sGiledsmllEw5HJjPy.jpg', '{}'),
        ('tv-225385', 225385, 'tv', 'Black Doves', '/uoXtkm2P4HPPL8T3IBJ02G3hCC4.jpg', '{}'),
        ('tv-222766', 222766, 'tv', 'The Day of the Jackal', '/tYLecM3WSEjlkKhkGiH5G68Dprm.jpg', '{}'),
        ('tv-73586', 73586, 'tv', 'Yellowstone', '/s4QRRYc1V2e68Qy9Wel9MI8fhRP.jpg', '{}'),
        ('tv-113962', 113962, 'tv', 'Lioness', '/ajaXSmdAlYYhnvx1EIsvpfN949y.jpg', '{}'),
        ('movie-533535', 533535, 'movie', 'Deadpool & Wolverine', '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', '{}'),
        ('tv-194764', 194764, 'tv', 'The Penguin', '/vOWcqC4oDQws1doDWLO7d3dh5qc.jpg', '{}'),
        ('tv-147050', 147050, 'tv', 'Disclaimer', '/6TdW4T2EsnhXrPQccB8szK93UhF.jpg', '{}'),
        ('tv-130853', 130853, 'tv', 'Bad Monkey', '/sDbpr5VoxlcQvzvWFECr7bXCAwg.jpg', '{}'),
        ('tv-250923', 250923, 'tv', 'Nobody Wants This', '/xYdzshohIWsrBpIrFlYiT8wgv7U.jpg', '{}'),
        -- Todd's shows
        ('tv-220056', 220056, 'tv', 'The Madness', '/lASJAqmKLt5xkr3sZZGQUOK5l2e.jpg', '{}'),
        ('tv-239826', 239826, 'tv', 'Ballard', '/vHQGu6ducKC7JcDU6lqWyx7tWW5.jpg', '{}'),
        ('movie-55861', 55861, 'movie', 'The Task', '/5duIlyVH1EiIncrGm8YPVEJ5PgZ.jpg', '{}'),
        ('movie-693134', 693134, 'movie', 'Dune: Part Two', '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', '{}'),
        ('tv-203744', 203744, 'tv', 'Sugar', '/dNrk52Rt13MxwahLneTZJezM6qD.jpg', '{}'),
        ('tv-81723', 81723, 'tv', 'The Gilded Age', '/4zXlBCc1rNTDtrfMCBFIGKWlwnC.jpg', '{}'),
        ('tv-60622', 60622, 'tv', 'Fargo', '/6U9CPeD8obHzweikFhiLhpc7YBT.jpg', '{}'),
        ('tv-72750', 72750, 'tv', 'Killing Eve', '/4wKhTVw8aGq5AZMa0Q1spERdi7n.jpg', '{}'),
        ('tv-84773', 84773, 'tv', 'The Lord of the Rings: The Rings of Power', '/kf5Hz70tjNAHg4swGDzOr9BfoZ1.jpg', '{}'),
        ('movie-646097', 646097, 'movie', 'Rebel Ridge', '/xEt2GSz9z5rSVpIHMiGdtf0czyf.jpg', '{}'),
        -- Pat's shows
        ('movie-359410', 359410, 'movie', 'Road House', '/fDEdtS4P0gJsxHDIt8dG8TR5dx1.jpg', '{}'),
        ('tv-67198', 67198, 'tv', 'Star Trek: Discovery', '/xwpOHgym48Ftz7fbJq5te5xoiwu.jpg', '{}'),
        ('tv-108545', 108545, 'tv', '3 Body Problem', '/1wtSZdUztUGZ3bonwTSIEGf84n3.jpg', '{}'),
        ('tv-106379', 106379, 'tv', 'Fallout', '/c15BtJxCXMrISLVmysdsnZUPQft.jpg', '{}'),
        ('tv-10058', 10058, 'tv', 'Mr. & Mrs. Smith', '/p8ixf1SGeP5e3M0rEBdxqMmHfuL.jpg', '{}'),
        ('tv-52814', 52814, 'tv', 'Halo', '/4UmNhZCEu8Vt3byMvNxNEPyf8EY.jpg', '{}'),
        ('tv-87917', 87917, 'tv', 'For All Mankind', '/mNXT1QjRCEasXGH3rHCTQm0A0Su.jpg', '{}'),
        ('movie-522627', 522627, 'movie', 'The Gentlemen', '/jtrhTYB7xSrJxR1vusu99nvnZ1g.jpg', '{}'),
        ('tv-95557', 95557, 'tv', 'Invincible', '/jBn4LWlgdsf6xIUYhYBwpctBVsj.jpg', '{}'),
        ('tv-205715', 205715, 'tv', 'Gen V', '/tEv842Nd5uMSavURG4aQO1pNtst.jpg', '{}'),
        ('tv-76479', 76479, 'tv', 'The Boys', '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', '{}'),
        ('movie-438631', 438631, 'movie', 'Dune', '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', '{}'),
        ('movie-930564', 930564, 'movie', 'Saltburn', '/zGTfMwG112BC66mpaveVxoWPOaB.jpg', '{}'),
        ('movie-872585', 872585, 'movie', 'Oppenheimer', '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', '{}')
    ON CONFLICT (id) DO NOTHING;

    -- Taylor's watch status
    INSERT INTO public.watch_status (user_id, media_id, status, paused) VALUES
        (taylor_id, 'tv-111800', 'want', false),
        (taylor_id, 'tv-82104', 'want', false),
        (taylor_id, 'tv-125988', 'want', false),
        (taylor_id, 'tv-249039', 'want', false),
        (taylor_id, 'tv-95480', 'want', false),
        (taylor_id, 'tv-8246', 'watching', false),
        (taylor_id, 'tv-112211', 'watching', false),
        (taylor_id, 'tv-110492', 'watching', false),
        (taylor_id, 'tv-245703', 'watching', false),
        (taylor_id, 'tv-219760', 'watching', false),
        (taylor_id, 'tv-90282', 'watching', false),
        (taylor_id, 'tv-156861', 'watching', true), -- paused
        (taylor_id, 'tv-137893', 'watching', true), -- paused
        (taylor_id, 'movie-466420', 'watching', true), -- paused
        (taylor_id, 'movie-578253', 'watching', true), -- paused
        (taylor_id, 'tv-213306', 'watching', true), -- paused
        (taylor_id, 'movie-1233575', 'watched', false),
        (taylor_id, 'movie-911430', 'watched', false),
        (taylor_id, 'tv-215995', 'watched', false),
        (taylor_id, 'movie-1263256', 'watched', false),
        (taylor_id, 'movie-1061474', 'watched', false),
        (taylor_id, 'movie-1233413', 'watched', false),
        (taylor_id, 'tv-136315', 'watched', false),
        (taylor_id, 'movie-749170', 'watched', false),
        (taylor_id, 'tv-246992', 'watched', false),
        (taylor_id, 'tv-247718', 'watched', false),
        (taylor_id, 'tv-216082', 'watched', false),
        (taylor_id, 'tv-111803', 'watched', false),
        (taylor_id, 'tv-108978', 'watched', false),
        (taylor_id, 'tv-249522', 'watched', false),
        (taylor_id, 'movie-1335778', 'watched', false),
        (taylor_id, 'tv-210916', 'watched', false),
        (taylor_id, 'tv-129552', 'watched', false),
        (taylor_id, 'tv-1537', 'watched', false),
        (taylor_id, 'tv-203857', 'watched', false),
        (taylor_id, 'tv-157741', 'watched', false),
        (taylor_id, 'tv-136311', 'watched', false),
        (taylor_id, 'movie-1005331', 'watched', false),
        (taylor_id, 'tv-225385', 'watched', false),
        (taylor_id, 'tv-222766', 'watched', false),
        (taylor_id, 'tv-73586', 'watched', false),
        (taylor_id, 'tv-113962', 'watched', false),
        (taylor_id, 'movie-533535', 'watched', false),
        (taylor_id, 'tv-194764', 'watched', false),
        (taylor_id, 'tv-147050', 'watched', false),
        (taylor_id, 'tv-130853', 'watched', false),
        (taylor_id, 'tv-95480', 'watched', false),
        (taylor_id, 'tv-250923', 'watched', false)
    ON CONFLICT (user_id, media_id) DO NOTHING;

    -- Taylor's ratings
    INSERT INTO public.ratings (user_id, media_id, rating) VALUES
        (taylor_id, 'movie-1233575', 'love'),
        (taylor_id, 'movie-911430', 'like'),
        (taylor_id, 'tv-215995', 'love'),
        (taylor_id, 'movie-1263256', 'like'),
        (taylor_id, 'movie-1061474', 'love'),
        (taylor_id, 'movie-1233413', 'like'),
        (taylor_id, 'tv-136315', 'like'),
        (taylor_id, 'movie-749170', 'like'),
        (taylor_id, 'tv-246992', 'like'),
        (taylor_id, 'tv-247718', 'love'),
        (taylor_id, 'tv-216082', 'love'),
        (taylor_id, 'tv-111803', 'love'),
        (taylor_id, 'tv-108978', 'like'),
        (taylor_id, 'tv-249522', 'love'),
        (taylor_id, 'movie-1335778', 'love'),
        (taylor_id, 'tv-210916', 'love'),
        (taylor_id, 'tv-129552', 'like'),
        (taylor_id, 'tv-1537', 'love'),
        (taylor_id, 'tv-203857', 'love'),
        (taylor_id, 'tv-157741', 'love'),
        (taylor_id, 'tv-136311', 'love'),
        (taylor_id, 'movie-1005331', 'like'),
        (taylor_id, 'tv-225385', 'love'),
        (taylor_id, 'tv-222766', 'love'),
        (taylor_id, 'tv-73586', 'love'),
        (taylor_id, 'tv-113962', 'love'),
        (taylor_id, 'movie-533535', 'like'),
        (taylor_id, 'tv-194764', 'like'),
        (taylor_id, 'tv-147050', 'love'),
        (taylor_id, 'tv-130853', 'love'),
        (taylor_id, 'tv-95480', 'love'),
        (taylor_id, 'tv-250923', 'love')
    ON CONFLICT (user_id, media_id) DO UPDATE SET rating = EXCLUDED.rating;

    -- Todd's watch status
    INSERT INTO public.watch_status (user_id, media_id, status, paused) VALUES
        (todd_id, 'tv-136315', 'want', false),
        (todd_id, 'tv-220056', 'want', false),
        (todd_id, 'tv-239826', 'want', false),
        (todd_id, 'movie-55861', 'watching', false),
        (todd_id, 'tv-110492', 'watching', false),
        (todd_id, 'movie-693134', 'watched', false),
        (todd_id, 'tv-203744', 'watched', false),
        (todd_id, 'tv-81723', 'watched', false),
        (todd_id, 'tv-95480', 'watched', false),
        (todd_id, 'tv-60622', 'watched', false),
        (todd_id, 'tv-108978', 'watched', false),
        (todd_id, 'tv-72750', 'watched', false),
        (todd_id, 'tv-130853', 'watched', false),
        (todd_id, 'tv-84773', 'watched', false),
        (todd_id, 'tv-111800', 'watched', false),
        (todd_id, 'movie-646097', 'watched', false),
        (todd_id, 'tv-113962', 'watched', false),
        (todd_id, 'tv-136311', 'watched', false),
        (todd_id, 'tv-203857', 'watched', false),
        (todd_id, 'tv-157741', 'watched', false),
        (todd_id, 'tv-210916', 'watched', false),
        (todd_id, 'tv-129552', 'watched', false),
        (todd_id, 'tv-125988', 'watched', false),
        (todd_id, 'tv-111803', 'watched', false),
        (todd_id, 'tv-247718', 'watched', false),
        (todd_id, 'tv-245703', 'watched', false),
        (todd_id, 'tv-219760', 'watched', false)
    ON CONFLICT (user_id, media_id) DO NOTHING;

    -- Todd's ratings
    INSERT INTO public.ratings (user_id, media_id, rating) VALUES
        (todd_id, 'movie-693134', 'love'),
        (todd_id, 'tv-203744', 'love'),
        (todd_id, 'tv-81723', 'love'),
        (todd_id, 'tv-95480', 'love'),
        (todd_id, 'tv-60622', 'love'),
        (todd_id, 'tv-108978', 'love'),
        (todd_id, 'tv-72750', 'love'),
        (todd_id, 'tv-130853', 'love'),
        (todd_id, 'tv-84773', 'love'),
        (todd_id, 'tv-111800', 'love'),
        (todd_id, 'movie-646097', 'love'),
        (todd_id, 'tv-113962', 'love'),
        (todd_id, 'tv-136311', 'love'),
        (todd_id, 'tv-203857', 'love'),
        (todd_id, 'tv-157741', 'love'),
        (todd_id, 'tv-210916', 'love'),
        (todd_id, 'tv-129552', 'love'),
        (todd_id, 'tv-125988', 'love'),
        (todd_id, 'tv-111803', 'like'),
        (todd_id, 'tv-247718', 'love'),
        (todd_id, 'tv-245703', 'love'),
        (todd_id, 'tv-219760', 'love')
    ON CONFLICT (user_id, media_id) DO UPDATE SET rating = EXCLUDED.rating;

    -- Pat's watch status
    INSERT INTO public.watch_status (user_id, media_id, status, paused) VALUES
        (pat_id, 'movie-359410', 'want', false),
        (pat_id, 'tv-67198', 'want', false),
        (pat_id, 'tv-108545', 'want', false),
        (pat_id, 'tv-106379', 'watching', false),
        (pat_id, 'tv-10058', 'watching', false),
        (pat_id, 'tv-52814', 'watching', false),
        (pat_id, 'tv-87917', 'watching', false),
        (pat_id, 'movie-522627', 'watching', false),
        (pat_id, 'tv-95557', 'watched', false),
        (pat_id, 'tv-205715', 'watched', false),
        (pat_id, 'tv-76479', 'watched', false),
        (pat_id, 'movie-438631', 'watched', false),
        (pat_id, 'tv-110492', 'watched', false),
        (pat_id, 'movie-930564', 'watched', false),
        (pat_id, 'movie-872585', 'watched', false),
        (pat_id, 'tv-113962', 'watched', false),
        (pat_id, 'movie-693134', 'watched', false)
    ON CONFLICT (user_id, media_id) DO NOTHING;

    -- Pat's ratings
    INSERT INTO public.ratings (user_id, media_id, rating) VALUES
        (pat_id, 'tv-95557', 'love'),
        (pat_id, 'tv-205715', 'love'),
        (pat_id, 'tv-76479', 'love'),
        (pat_id, 'movie-438631', 'love'),
        (pat_id, 'tv-110492', 'love'),
        (pat_id, 'movie-930564', 'love'),
        (pat_id, 'movie-872585', 'love'),
        (pat_id, 'tv-113962', 'love'),
        (pat_id, 'movie-693134', 'love')
    ON CONFLICT (user_id, media_id) DO UPDATE SET rating = EXCLUDED.rating;

    -- Re-enable triggers
    ALTER TABLE public.ratings ENABLE TRIGGER on_rating_created;
    ALTER TABLE public.watch_status ENABLE TRIGGER on_watch_status_changed;

    RAISE NOTICE 'Friend data imported successfully!';
    RAISE NOTICE 'Taylor: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = taylor_id);
    RAISE NOTICE 'Todd: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = todd_id);
    RAISE NOTICE 'Pat: % shows', (SELECT COUNT(*) FROM watch_status WHERE user_id = pat_id);
END $$;

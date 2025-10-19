-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT DEFAULT 'What have you been watching?',
    avatar_url TEXT,
    is_private BOOLEAN DEFAULT false,
    top_spot_media_id TEXT, -- User's pinned recommendation
    invite_code TEXT UNIQUE DEFAULT uuid_generate_v4()::text,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table (movies and TV shows from TMDB)
CREATE TABLE IF NOT EXISTS public.media (
    id TEXT PRIMARY KEY, -- Format: 'movie-123' or 'tv-456'
    tmdb_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title TEXT NOT NULL,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    release_date DATE,
    vote_average REAL,
    tmdb_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tmdb_id, media_type)
);

-- Ratings table (Meh/Like/Love system)
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT REFERENCES public.media(id),
    rating TEXT NOT NULL CHECK (rating IN ('meh', 'like', 'love')),
    my_take TEXT, -- User's comment/review
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, media_id)
);

-- Watch status table
CREATE TABLE IF NOT EXISTS public.watch_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT REFERENCES public.media(id),
    status TEXT NOT NULL CHECK (status IN ('want', 'watching', 'watched')),
    progress INTEGER DEFAULT 0, -- For tracking episode progress
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, media_id)
);

-- Activities feed table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT REFERENCES public.media(id),
    activity_type TEXT NOT NULL CHECK (activity_type IN ('rated', 'status_changed', 'commented', 'top_spot_updated')),
    activity_data JSONB, -- Additional context for the activity
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Comments on activities
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes on activities
CREATE TABLE IF NOT EXISTS public.activity_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

-- Invites tracking
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT,
    invitee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invite_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_status_user_id ON public.watch_status(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_comments_activity_id ON public.comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_activity_id ON public.activity_likes(activity_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Media policies (public read access)
CREATE POLICY "Media is viewable by everyone" ON public.media
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert media" ON public.media
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Ratings policies
CREATE POLICY "Users can view all ratings" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON public.ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Watch status policies
CREATE POLICY "Users can view all watch statuses" ON public.watch_status
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own watch status" ON public.watch_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch status" ON public.watch_status
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch status" ON public.watch_status
    FOR DELETE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Activities are viewable by everyone" ON public.activities
    FOR SELECT USING (
        -- Show activity if profile is public OR viewer is following
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = user_id
            AND (
                p.is_private = false
                OR p.id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.follows f
                    WHERE f.follower_id = auth.uid()
                    AND f.following_id = p.id
                    AND f.status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "Users can insert own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Users can view follows" ON public.follows
    FOR SELECT USING (
        follower_id = auth.uid()
        OR following_id = auth.uid()
    );

CREATE POLICY "Users can insert follows" ON public.follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can update follows they're involved in" ON public.follows
    FOR UPDATE USING (
        follower_id = auth.uid()
        OR following_id = auth.uid()
    );

CREATE POLICY "Users can delete own follows" ON public.follows
    FOR DELETE USING (follower_id = auth.uid());

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- Activity likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.activity_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON public.activity_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON public.activity_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Invites policies
CREATE POLICY "Users can view own invites" ON public.invites
    FOR SELECT USING (
        inviter_id = auth.uid()
        OR invitee_id = auth.uid()
    );

CREATE POLICY "Users can create invites" ON public.invites
    FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create activity when rating is added/updated
CREATE OR REPLACE FUNCTION public.handle_rating_activity()
RETURNS trigger AS $$
BEGIN
    -- Insert activity for new rating
    INSERT INTO public.activities (user_id, media_id, activity_type, activity_data)
    VALUES (
        NEW.user_id,
        NEW.media_id,
        'rated',
        jsonb_build_object(
            'rating', NEW.rating,
            'my_take', NEW.my_take
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating activities
CREATE OR REPLACE TRIGGER on_rating_created
    AFTER INSERT ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.handle_rating_activity();

-- Function to create activity when watch status changes
CREATE OR REPLACE FUNCTION public.handle_watch_status_activity()
RETURNS trigger AS $$
BEGIN
    -- Only create activity if status actually changed
    IF (TG_OP = 'INSERT' OR OLD.status != NEW.status) THEN
        INSERT INTO public.activities (user_id, media_id, activity_type, activity_data)
        VALUES (
            NEW.user_id,
            NEW.media_id,
            'status_changed',
            jsonb_build_object(
                'status', NEW.status,
                'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for watch status activities
CREATE OR REPLACE TRIGGER on_watch_status_changed
    AFTER INSERT OR UPDATE ON public.watch_status
    FOR EACH ROW EXECUTE FUNCTION public.handle_watch_status_activity();
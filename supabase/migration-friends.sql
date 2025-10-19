-- Migration to add friend features and Top 3 Shows

-- 1. Update ratings table to use 'meh' instead of 'dislike'
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rating_check;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_rating_check
    CHECK (rating IN ('meh', 'like', 'love'));

-- 2. Add 'paused' flag and 'recommended_by' to watch_status table
DO $$
BEGIN
    -- Add paused column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='watch_status' AND column_name='paused') THEN
        ALTER TABLE public.watch_status ADD COLUMN paused BOOLEAN DEFAULT false;
    END IF;

    -- Add recommended_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='watch_status' AND column_name='recommended_by') THEN
        ALTER TABLE public.watch_status ADD COLUMN recommended_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Create top_shows table for Top 3 Shows feature
CREATE TABLE IF NOT EXISTS public.top_shows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT REFERENCES public.media(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, position),
    UNIQUE(user_id, media_id)
);

-- Enable RLS on top_shows
ALTER TABLE public.top_shows ENABLE ROW LEVEL SECURITY;

-- Top shows policies
CREATE POLICY "Top shows are viewable by everyone" ON public.top_shows
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own top shows" ON public.top_shows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own top shows" ON public.top_shows
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own top shows" ON public.top_shows
    FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_top_shows_user_id ON public.top_shows(user_id);

-- 4. Update existing 'dislike' ratings to 'meh'
UPDATE public.ratings SET rating = 'meh' WHERE rating = 'dislike';

-- Add columns to profiles table for new features

-- Add top 3 shows columns (storing JSONB with media data)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS top_show_1 JSONB,
ADD COLUMN IF NOT EXISTS top_show_2 JSONB,
ADD COLUMN IF NOT EXISTS top_show_3 JSONB,
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Create follows table for friend functionality
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Enable RLS on follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for follows table

-- Users can see all follows (for discovery)
CREATE POLICY "Anyone can view follows"
ON follows FOR SELECT
USING (true);

-- Users can create follows for themselves
CREATE POLICY "Users can follow others"
ON follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows (unfollow)
CREATE POLICY "Users can unfollow"
ON follows FOR DELETE
USING (auth.uid() = follower_id);

-- Add comment explaining the structure
COMMENT ON TABLE follows IS 'Stores follower/following relationships between users';
COMMENT ON COLUMN profiles.top_show_1 IS 'First top show - stores {id, title, poster_path, media_type}';
COMMENT ON COLUMN profiles.top_show_2 IS 'Second top show - stores {id, title, poster_path, media_type}';
COMMENT ON COLUMN profiles.top_show_3 IS 'Third top show - stores {id, title, poster_path, media_type}';
COMMENT ON COLUMN profiles.is_private IS 'Whether the profile is private (followers need approval)';

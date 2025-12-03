-- Migration: Create activity_comment_likes table
-- This adds the ability to like comments on activities (front of feed cards)

-- Create activity_comment_likes table for liking individual activity comments
CREATE TABLE IF NOT EXISTS activity_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- One like per user per comment
);

-- Indexes for activity_comment_likes
CREATE INDEX IF NOT EXISTS idx_activity_comment_likes_comment_id ON activity_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_activity_comment_likes_user_id ON activity_comment_likes(user_id);

-- Enable RLS on activity_comment_likes
ALTER TABLE activity_comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_comment_likes

-- Everyone can view likes
CREATE POLICY "Activity comment likes are viewable by everyone"
  ON activity_comment_likes FOR SELECT
  USING (true);

-- Users can like comments
CREATE POLICY "Users can like activity comments"
  ON activity_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike comments (delete their own likes)
CREATE POLICY "Users can unlike activity comments"
  ON activity_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON activity_comment_likes TO authenticated;
GRANT ALL ON activity_comment_likes TO service_role;

-- Table comment
COMMENT ON TABLE activity_comment_likes IS 'Likes on individual activity comments - one like per user per comment';


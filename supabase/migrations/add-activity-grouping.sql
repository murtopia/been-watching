-- Add activity grouping support
-- This allows grouping related activities (e.g., rating + status change) into a single feed item

-- Create activity_groups table
CREATE TABLE IF NOT EXISTS activity_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add activity_group_id column to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS activity_group_id UUID REFERENCES activity_groups(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_group_id ON activities(activity_group_id);
CREATE INDEX IF NOT EXISTS idx_activity_groups_user_media ON activity_groups(user_id, media_id);

-- Enable Row Level Security
ALTER TABLE activity_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activity groups
CREATE POLICY "Users can view activity groups"
  ON activity_groups
  FOR SELECT
  USING (true);

-- Policy: Users can insert own activity groups
CREATE POLICY "Users can insert own activity groups"
  ON activity_groups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);


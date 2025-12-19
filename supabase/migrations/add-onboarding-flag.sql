-- Add has_seen_onboarding flag to profiles table
-- This tracks whether a user has dismissed the onboarding video card

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT false;

-- Comment for documentation
COMMENT ON COLUMN profiles.has_seen_onboarding IS 'Whether user has seen/dismissed the onboarding video in the feed';


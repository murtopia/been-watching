-- Add theme_preference column to profiles table
-- Values: 'dark' (default), 'auto', 'light'

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark' CHECK (theme_preference IN ('auto', 'light', 'dark'));

-- Update existing users to have dark theme preference
UPDATE profiles SET theme_preference = 'dark' WHERE theme_preference IS NULL;

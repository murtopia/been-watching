-- Create admin_settings table for application-wide configuration
-- Allows admins to toggle features and settings

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Insert default feed setting
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('feed_show_all_users', 'true', 'Show all users activities in feed (true) or only followed users (false)')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view admin settings (needed for feed filtering logic)
CREATE POLICY "Everyone can view admin settings"
  ON admin_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update settings (check is_admin flag in profiles)
-- Note: This assumes you have an is_admin column in profiles table
-- If not, you may need to add it or adjust this policy
CREATE POLICY "Admins can update settings"
  ON admin_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON admin_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add helpful comment
COMMENT ON TABLE admin_settings IS 'Application-wide settings controlled by administrators';


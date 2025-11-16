-- Migration: Add notification and contact settings columns to profiles table
-- Created: 2025-11-02
-- Purpose: Support Phase 2 of Settings Hub - Contact Information and Notifications

-- Add phone number columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Add email notification preferences (default to true for opt-in)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_weekly_recap BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_monthly_recap BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_announcements BOOLEAN DEFAULT TRUE;

-- Add SMS notification preferences (default to false - requires opt-in)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_opt_in_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sms_announcements BOOLEAN DEFAULT FALSE;

-- Add push notification preferences (default to true)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_friend_activity BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_new_follower BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_ratings BOOLEAN DEFAULT TRUE;

-- Add 2FA support (for future implementation)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_sms_opt_in ON profiles(sms_opt_in) WHERE sms_opt_in = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_email_weekly_recap ON profiles(email_weekly_recap) WHERE email_weekly_recap = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_email_monthly_recap ON profiles(email_monthly_recap) WHERE email_monthly_recap = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN profiles.phone_number IS 'User phone number (digits only, 10 chars)';
COMMENT ON COLUMN profiles.phone_verified IS 'Whether phone number has been verified via SMS';
COMMENT ON COLUMN profiles.phone_verified_at IS 'Timestamp when phone was verified';
COMMENT ON COLUMN profiles.email_weekly_recap IS 'Receive weekly recap emails (Friday mornings)';
COMMENT ON COLUMN profiles.email_monthly_recap IS 'Receive monthly recap emails (first of month)';
COMMENT ON COLUMN profiles.email_announcements IS 'Receive product announcements via email';
COMMENT ON COLUMN profiles.sms_opt_in IS 'User has opted in to receive SMS notifications (TCPA compliant)';
COMMENT ON COLUMN profiles.sms_opt_in_date IS 'Timestamp when user opted in to SMS (for TCPA compliance)';
COMMENT ON COLUMN profiles.sms_announcements IS 'Receive important announcements via SMS';
COMMENT ON COLUMN profiles.push_friend_activity IS 'In-app notifications for friend activity';
COMMENT ON COLUMN profiles.push_new_follower IS 'In-app notifications for new followers';
COMMENT ON COLUMN profiles.push_ratings IS 'In-app notifications for ratings from friends';
COMMENT ON COLUMN profiles.two_factor_enabled IS 'Whether 2FA is enabled for this account';
COMMENT ON COLUMN profiles.two_factor_secret IS 'Encrypted 2FA secret (TOTP)';

-- Invite System Migration
-- Run this in Supabase SQL Editor after reviewing

-- Add invite-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50) UNIQUE, -- Their personal invite code (for later)
ADD COLUMN IF NOT EXISTS invited_by_code VARCHAR(50),    -- Which code they used to sign up
ADD COLUMN IF NOT EXISTS invite_tier VARCHAR(20) DEFAULT 'beta', -- 'founder', 'boozehound', 'alpha', 'beta', 'waitlist'
ADD COLUMN IF NOT EXISTS invites_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS invites_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true; -- Can they access the app?

-- Create invites table for tracking all invite codes
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL, -- 'master_unlimited', 'master_limited', 'friend', 'earned'
  max_uses INTEGER, -- NULL = unlimited (for BOOZEHOUND)
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  position INTEGER, -- Their place in line
  invited_at TIMESTAMP WITH TIME ZONE, -- When we gave them access
  invite_code VARCHAR(50), -- Code we sent them (if any)
  converted_to_user_id UUID REFERENCES profiles(id), -- If they signed up
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_active ON invites(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON profiles(invited_by_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable RLS on new tables
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invites table
-- Anyone can check if a code is valid (needed for signup)
CREATE POLICY "Anyone can view active invites"
  ON invites FOR SELECT
  USING (is_active = true);

-- Only authenticated users can see their own invite stats
CREATE POLICY "Users can view own invites"
  ON invites FOR SELECT
  USING (auth.uid() = created_by_user_id);

-- RLS Policies for waitlist table
-- Users can insert their own waitlist entry
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Users can view their own waitlist entry
CREATE POLICY "Users can view own waitlist entry"
  ON waitlist FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Wait for table creation before inserting
-- Insert initial master codes
-- BOOZEHOUND - Unlimited uses for close friends
INSERT INTO invites (code, type, max_uses, is_active)
VALUES ('BOOZEHOUND', 'master_unlimited', NULL, true)
ON CONFLICT (code) DO NOTHING;

-- Function to generate random alphanumeric code
CREATE OR REPLACE FUNCTION generate_random_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed confusing chars: 0, O, I, 1
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate BWALPHA code
CREATE OR REPLACE FUNCTION create_bwalpha_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code like BWALPHA_A3X9K2P7
    new_code := 'BWALPHA_' || generate_random_code(8);

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM invites WHERE code = new_code) INTO code_exists;

    -- If code doesn't exist, insert and return
    IF NOT code_exists THEN
      INSERT INTO invites (code, type, max_uses, is_active)
      VALUES (new_code, 'master_limited', 5, true);
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if invite code is valid and has uses remaining
CREATE OR REPLACE FUNCTION is_invite_code_valid(invite_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Get the invite record
  SELECT * INTO invite_record
  FROM invites
  WHERE code = invite_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  -- If invite doesn't exist or is expired
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If unlimited uses (max_uses is NULL)
  IF invite_record.max_uses IS NULL THEN
    RETURN true;
  END IF;

  -- Check if uses remaining
  IF invite_record.current_uses < invite_record.max_uses THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to increment invite code usage
CREATE OR REPLACE FUNCTION use_invite_code(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Get the invite record with row lock
  SELECT * INTO invite_record
  FROM invites
  WHERE code = invite_code
    AND is_active = true
  FOR UPDATE;

  -- If invite doesn't exist
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if expired
  IF invite_record.expires_at IS NOT NULL AND invite_record.expires_at <= NOW() THEN
    RETURN false;
  END IF;

  -- For unlimited invites, just increment
  IF invite_record.max_uses IS NULL THEN
    UPDATE invites
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE code = invite_code;
    RETURN true;
  END IF;

  -- For limited invites, check if uses remaining
  IF invite_record.current_uses < invite_record.max_uses THEN
    UPDATE invites
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE code = invite_code;
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign waitlist positions
CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next position number
  NEW.position := COALESCE(
    (SELECT MAX(position) FROM waitlist) + 1,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign position when someone joins waitlist
CREATE TRIGGER set_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION assign_waitlist_position();

-- Create a view for admin dashboard (easier to query)
CREATE OR REPLACE VIEW admin_invite_stats AS
SELECT
  i.code,
  i.type,
  i.max_uses,
  i.current_uses,
  CASE
    WHEN i.max_uses IS NULL THEN 'Unlimited'
    ELSE (i.max_uses - i.current_uses)::TEXT || ' remaining'
  END as uses_status,
  i.is_active,
  i.created_at,
  COUNT(p.id) as total_signups
FROM invites i
LEFT JOIN profiles p ON p.invited_by_code = i.code
GROUP BY i.id, i.code, i.type, i.max_uses, i.current_uses, i.is_active, i.created_at
ORDER BY i.created_at DESC;

-- Grant access to admin view (adjust as needed for your security model)
GRANT SELECT ON admin_invite_stats TO authenticated;

-- Summary of what was created:
-- 1. Added columns to profiles table for invite tracking
-- 2. Created invites table to manage all invite codes
-- 3. Created waitlist table for email collection
-- 4. Added indexes for performance
-- 5. Enabled RLS and created basic policies
-- 6. Inserted BOOZEHOUND master code
-- 7. Created helper functions for code generation and validation
-- 8. Created admin view for easy stats

-- To generate a BWALPHA code, run:
-- SELECT create_bwalpha_code();

-- To check if a code is valid, run:
-- SELECT is_invite_code_valid('BOOZEHOUND');

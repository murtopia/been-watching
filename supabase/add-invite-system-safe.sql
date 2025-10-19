-- Invite System Migration - Safe Version
-- Run this in Supabase SQL Editor

-- First, check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add invite-related columns to profiles table (safe - won't fail if columns exist)
DO $$
BEGIN
  -- Add invite_code column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invite_code') THEN
    ALTER TABLE profiles ADD COLUMN invite_code VARCHAR(50) UNIQUE;
  END IF;

  -- Add invited_by_code column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invited_by_code') THEN
    ALTER TABLE profiles ADD COLUMN invited_by_code VARCHAR(50);
  END IF;

  -- Add invite_tier column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invite_tier') THEN
    ALTER TABLE profiles ADD COLUMN invite_tier VARCHAR(20) DEFAULT 'beta';
  END IF;

  -- Add invites_remaining column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invites_remaining') THEN
    ALTER TABLE profiles ADD COLUMN invites_remaining INTEGER DEFAULT 0;
  END IF;

  -- Add invites_used column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invites_used') THEN
    ALTER TABLE profiles ADD COLUMN invites_used INTEGER DEFAULT 0;
  END IF;

  -- Add is_approved column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'is_approved') THEN
    ALTER TABLE profiles ADD COLUMN is_approved BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create invites table for tracking all invite codes
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  position INTEGER,
  invited_at TIMESTAMP WITH TIME ZONE,
  invite_code VARCHAR(50),
  converted_to_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance (safe - won't fail if exists)
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_active ON invites(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON profiles(invited_by_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable RLS on new tables
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active invites" ON invites;
DROP POLICY IF EXISTS "Users can view own invites" ON invites;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON waitlist;

-- RLS Policies for invites table
CREATE POLICY "Anyone can view active invites"
  ON invites FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view own invites"
  ON invites FOR SELECT
  USING (auth.uid() = created_by_user_id);

-- RLS Policies for waitlist table
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own waitlist entry"
  ON waitlist FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Insert initial master codes
INSERT INTO invites (code, type, max_uses, is_active)
VALUES ('BOOZEHOUND', 'master_unlimited', NULL, true)
ON CONFLICT (code) DO NOTHING;

-- Function to generate random alphanumeric code
CREATE OR REPLACE FUNCTION generate_random_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
    new_code := 'BWALPHA_' || generate_random_code(8);
    SELECT EXISTS(SELECT 1 FROM invites WHERE code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      INSERT INTO invites (code, type, max_uses, is_active)
      VALUES (new_code, 'master_limited', 5, true);
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if invite code is valid
CREATE OR REPLACE FUNCTION is_invite_code_valid(invite_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM invites
  WHERE code = invite_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF invite_record.max_uses IS NULL THEN
    RETURN true;
  END IF;

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
  SELECT * INTO invite_record
  FROM invites
  WHERE code = invite_code
    AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF invite_record.expires_at IS NOT NULL AND invite_record.expires_at <= NOW() THEN
    RETURN false;
  END IF;

  IF invite_record.max_uses IS NULL THEN
    UPDATE invites
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE code = invite_code;
    RETURN true;
  END IF;

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
  NEW.position := COALESCE(
    (SELECT MAX(position) FROM waitlist) + 1,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_waitlist_position ON waitlist;
CREATE TRIGGER set_waitlist_position
  BEFORE INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION assign_waitlist_position();

-- Create or replace view for admin dashboard
DROP VIEW IF EXISTS admin_invite_stats;
CREATE VIEW admin_invite_stats AS
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

-- Grant access
GRANT SELECT ON admin_invite_stats TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Invite system migration completed successfully!';
  RAISE NOTICE '📝 BOOZEHOUND code created';
  RAISE NOTICE '🎯 To generate a BWALPHA code, run: SELECT create_bwalpha_code();';
END $$;

-- Launch Invite System Migration
-- This adds the master invite codes system (BOOZEHOUND, BWALPHA, etc.)
-- Run this in Supabase SQL Editor

-- Add invite-related columns to profiles table
DO $$
BEGIN
  -- Add invited_by_master_code column (tracks which master code was used)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invited_by_master_code') THEN
    ALTER TABLE profiles ADD COLUMN invited_by_master_code VARCHAR(50);
  END IF;

  -- Add invite_tier column (boozehound, alpha, beta, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invite_tier') THEN
    ALTER TABLE profiles ADD COLUMN invite_tier VARCHAR(20) DEFAULT 'beta';
  END IF;

  -- Add invites_remaining column (how many invites user can send)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invites_remaining') THEN
    ALTER TABLE profiles ADD COLUMN invites_remaining INTEGER DEFAULT 0;
  END IF;

  -- Add invites_used column (how many invites user has sent)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invites_used') THEN
    ALTER TABLE profiles ADD COLUMN invites_used INTEGER DEFAULT 0;
  END IF;

  -- Add is_approved column (for waitlist/approval flow)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'is_approved') THEN
    ALTER TABLE profiles ADD COLUMN is_approved BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create master_codes table for tracking BOOZEHOUND, BWALPHA, etc.
CREATE TABLE IF NOT EXISTS master_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'master_unlimited', 'master_limited', 'earned'
  max_uses INTEGER, -- NULL = unlimited
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_codes_code ON master_codes(code);
CREATE INDEX IF NOT EXISTS idx_master_codes_active ON master_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by_master ON profiles(invited_by_master_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(position);

-- Enable RLS on new tables
ALTER TABLE master_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active master codes" ON master_codes;
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON waitlist;

-- RLS Policies for master_codes table
CREATE POLICY "Anyone can view active master codes"
  ON master_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies for waitlist table
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own waitlist entry"
  ON waitlist FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Insert initial master codes
INSERT INTO master_codes (code, type, max_uses, is_active)
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
    SELECT EXISTS(SELECT 1 FROM master_codes WHERE code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      INSERT INTO master_codes (code, type, max_uses, is_active)
      VALUES (new_code, 'master_limited', 5, true);
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if master code is valid
CREATE OR REPLACE FUNCTION is_master_code_valid(master_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  code_record RECORD;
BEGIN
  SELECT * INTO code_record
  FROM master_codes
  WHERE code = master_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF code_record.max_uses IS NULL THEN
    RETURN true;
  END IF;

  IF code_record.current_uses < code_record.max_uses THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to increment master code usage
CREATE OR REPLACE FUNCTION use_master_code(master_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  code_record RECORD;
BEGIN
  SELECT * INTO code_record
  FROM master_codes
  WHERE code = master_code
    AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF code_record.expires_at IS NOT NULL AND code_record.expires_at <= NOW() THEN
    RETURN false;
  END IF;

  IF code_record.max_uses IS NULL THEN
    UPDATE master_codes
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE code = master_code;
    RETURN true;
  END IF;

  IF code_record.current_uses < code_record.max_uses THEN
    UPDATE master_codes
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE code = master_code;
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
DROP VIEW IF EXISTS admin_master_code_stats;
CREATE VIEW admin_master_code_stats AS
SELECT
  mc.code,
  mc.type,
  mc.max_uses,
  mc.current_uses,
  CASE
    WHEN mc.max_uses IS NULL THEN 'Unlimited'
    ELSE (mc.max_uses - mc.current_uses)::TEXT || ' remaining'
  END as uses_status,
  mc.is_active,
  mc.created_at,
  COUNT(p.id) as total_signups
FROM master_codes mc
LEFT JOIN profiles p ON p.invited_by_master_code = mc.code
GROUP BY mc.id, mc.code, mc.type, mc.max_uses, mc.current_uses, mc.is_active, mc.created_at
ORDER BY mc.created_at DESC;

-- Grant access
GRANT SELECT ON admin_master_code_stats TO authenticated;
GRANT SELECT ON master_codes TO authenticated;
GRANT SELECT ON waitlist TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Launch invite system migration completed successfully!';
  RAISE NOTICE '📝 BOOZEHOUND code created (unlimited uses)';
  RAISE NOTICE '🎯 To generate a BWALPHA code, run: SELECT create_bwalpha_code();';
  RAISE NOTICE '';
  RAISE NOTICE 'New tables created:';
  RAISE NOTICE '  - master_codes (for BOOZEHOUND, BWALPHA, etc.)';
  RAISE NOTICE '  - waitlist (for email signups)';
  RAISE NOTICE '';
  RAISE NOTICE 'New columns added to profiles:';
  RAISE NOTICE '  - invited_by_master_code';
  RAISE NOTICE '  - invite_tier';
  RAISE NOTICE '  - invites_remaining';
  RAISE NOTICE '  - invites_used';
  RAISE NOTICE '  - is_approved';
END $$;

-- Invite System V2 Migration
-- Adds referral tracking, profile completion tracking, and invite improvements

-- 1. Add new columns to profiles table
DO $$
BEGIN
  -- Track if user earned their profile completion invite
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'profile_invite_earned') THEN
    ALTER TABLE profiles ADD COLUMN profile_invite_earned BOOLEAN DEFAULT FALSE;
  END IF;

  -- Track who invited this user
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'invited_by') THEN
    ALTER TABLE profiles ADD COLUMN invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  RAISE NOTICE 'Added new profile columns';
END $$;

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_username TEXT, -- Email or identifier of who was invited
  referee_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL until they sign up
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'active')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- 3. Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view referrals where they are referee" ON referrals;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Users can view referrals where they are the referee
CREATE POLICY "Users can view referrals where they are referee"
  ON referrals FOR SELECT
  USING (auth.uid() = referee_id);

-- Only system can insert referrals (via service role)
-- No policy needed for INSERT - will be done server-side

-- 4. Create function to check profile completion
CREATE OR REPLACE FUNCTION check_profile_completion(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_record RECORD;
  watch_counts RECORD;
  result JSONB;
BEGIN
  -- Get profile data
  SELECT
    avatar_url,
    bio,
    top_show_1,
    top_show_2,
    top_show_3,
    profile_invite_earned
  INTO profile_record
  FROM profiles
  WHERE profiles.id = check_profile_completion.user_id;

  -- Get watch status counts
  SELECT
    COUNT(*) FILTER (WHERE status = 'want') as want_count,
    COUNT(*) FILTER (WHERE status = 'watching') as watching_count,
    COUNT(*) FILTER (WHERE status = 'watched') as watched_count
  INTO watch_counts
  FROM watch_status
  WHERE watch_status.user_id = check_profile_completion.user_id;

  -- Build result object
  result := jsonb_build_object(
    'has_avatar', profile_record.avatar_url IS NOT NULL,
    'has_bio', profile_record.bio IS NOT NULL AND profile_record.bio != 'What have you been watching?',
    'has_top_shows', profile_record.top_show_1 IS NOT NULL
                     AND profile_record.top_show_2 IS NOT NULL
                     AND profile_record.top_show_3 IS NOT NULL,
    'has_want', watch_counts.want_count > 0,
    'has_watching', watch_counts.watching_count > 0,
    'has_watched', watch_counts.watched_count > 0,
    'already_earned', profile_record.profile_invite_earned,
    'is_complete', (
      profile_record.avatar_url IS NOT NULL
      AND profile_record.bio IS NOT NULL
      AND profile_record.bio != 'What have you been watching?'
      AND profile_record.top_show_1 IS NOT NULL
      AND profile_record.top_show_2 IS NOT NULL
      AND profile_record.top_show_3 IS NOT NULL
      AND watch_counts.want_count > 0
      AND watch_counts.watching_count > 0
      AND watch_counts.watched_count > 0
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to award profile completion invite
CREATE OR REPLACE FUNCTION award_profile_completion_invite(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  completion JSONB;
  already_earned BOOLEAN;
BEGIN
  -- Check if already earned
  SELECT profile_invite_earned INTO already_earned
  FROM profiles
  WHERE profiles.id = award_profile_completion_invite.user_id;

  IF already_earned THEN
    RETURN FALSE; -- Already earned
  END IF;

  -- Check completion status
  completion := check_profile_completion(award_profile_completion_invite.user_id);

  -- If complete and not already earned, award invite
  IF (completion->>'is_complete')::BOOLEAN THEN
    UPDATE profiles
    SET
      invites_remaining = invites_remaining + 1,
      profile_invite_earned = TRUE,
      updated_at = NOW()
    WHERE profiles.id = award_profile_completion_invite.user_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to handle invite redemption (atomic)
CREATE OR REPLACE FUNCTION redeem_invite(
  referrer_username TEXT,
  referee_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  referrer_record RECORD;
  result JSONB;
BEGIN
  -- Get referrer and lock row for update
  SELECT id, username, invites_remaining, invites_used
  INTO referrer_record
  FROM profiles
  WHERE username = referrer_username
  FOR UPDATE; -- Lock row to prevent race conditions

  -- Check if referrer exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'referrer_not_found'
    );
  END IF;

  -- Check if invites available
  IF referrer_record.invites_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_invites_remaining'
    );
  END IF;

  -- Decrement referrer's invites
  UPDATE profiles
  SET
    invites_remaining = invites_remaining - 1,
    invites_used = invites_used + 1,
    updated_at = NOW()
  WHERE id = referrer_record.id;

  -- Update referee's invited_by
  UPDATE profiles
  SET invited_by = referrer_record.id
  WHERE id = referee_user_id;

  -- Create referral record
  INSERT INTO referrals (referrer_id, referee_id, status, joined_at)
  VALUES (referrer_record.id, referee_user_id, 'joined', NOW());

  -- Create follow relationship (referee follows referrer)
  INSERT INTO follows (follower_id, following_id, created_at)
  VALUES (referee_user_id, referrer_record.id, NOW())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'referrer_id', referrer_record.id,
    'referrer_username', referrer_record.username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION check_profile_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION award_profile_completion_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_invite(TEXT, UUID) TO authenticated;

-- Done!
DO $$
BEGIN
  RAISE NOTICE 'Invite System V2 migration completed successfully';
END $$;

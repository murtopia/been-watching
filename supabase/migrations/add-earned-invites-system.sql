-- Earned Invites System Migration
-- Users earn invites through:
-- 1. Profile completion (existing - +1 one-time)
-- 2. Every 10 shows added to watchlists (+1 repeating)
-- 3. When someone they invited joins (+1 per referral)

-- 1. Add tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS watchlist_invite_milestone INTEGER DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_invites_earned INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN profiles.watchlist_invite_milestone IS 'Last watchlist milestone reached (0, 10, 20, 30...). User earns +1 invite per 10 shows.';
COMMENT ON COLUMN profiles.referral_invites_earned IS 'Count of invites earned from successful referrals.';

-- 2. Create function to check and award watchlist milestone invites
CREATE OR REPLACE FUNCTION check_watchlist_invite_milestone(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  total_shows INTEGER;
  current_milestone INTEGER;
  stored_milestone INTEGER;
  invites_to_award INTEGER;
BEGIN
  -- Count total shows across all watchlists
  SELECT COUNT(*) INTO total_shows
  FROM user_shows
  WHERE user_id = target_user_id;

  -- Calculate current milestone tier (every 10 shows)
  current_milestone := (total_shows / 10) * 10;

  -- Get stored milestone
  SELECT watchlist_invite_milestone INTO stored_milestone
  FROM profiles
  WHERE id = target_user_id;

  -- If current milestone is higher than stored, award invites
  IF current_milestone > COALESCE(stored_milestone, 0) THEN
    invites_to_award := (current_milestone - COALESCE(stored_milestone, 0)) / 10;

    -- Update profile with new milestone and award invites
    UPDATE profiles
    SET 
      watchlist_invite_milestone = current_milestone,
      invites_remaining = invites_remaining + invites_to_award,
      updated_at = NOW()
    WHERE id = target_user_id;

    RETURN jsonb_build_object(
      'awarded', true,
      'invites_awarded', invites_to_award,
      'total_shows', total_shows,
      'new_milestone', current_milestone,
      'previous_milestone', stored_milestone
    );
  END IF;

  -- No new milestone reached
  RETURN jsonb_build_object(
    'awarded', false,
    'total_shows', total_shows,
    'current_milestone', current_milestone,
    'shows_until_next', 10 - (total_shows % 10)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger function to auto-check milestone on show insert
CREATE OR REPLACE FUNCTION trigger_check_watchlist_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- Check milestone for the user who added the show
  PERFORM check_watchlist_invite_milestone(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger on user_shows table
DROP TRIGGER IF EXISTS check_watchlist_milestone_on_insert ON user_shows;
CREATE TRIGGER check_watchlist_milestone_on_insert
  AFTER INSERT ON user_shows
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_watchlist_milestone();

-- 5. Update redeem_invite_token to award +1 invite to inviter
CREATE OR REPLACE FUNCTION redeem_invite_token(
  invite_token TEXT,
  referee_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  token_record RECORD;
  validation JSONB;
BEGIN
  -- First validate the token
  validation := validate_invite_token(invite_token);

  IF NOT (validation->>'valid')::BOOLEAN THEN
    RETURN validation; -- Return the error
  END IF;

  -- Get token details
  SELECT
    t.id,
    t.inviter_id,
    p.username
  INTO token_record
  FROM invite_tokens t
  JOIN profiles p ON p.id = t.inviter_id
  WHERE t.token = invite_token;

  -- Mark token as used
  UPDATE invite_tokens
  SET
    status = 'used',
    used_by_user_id = referee_user_id,
    used_at = NOW(),
    updated_at = NOW()
  WHERE token = invite_token;

  -- Decrement inviter's invites, increment used count, AND award bonus invite for successful referral
  UPDATE profiles
  SET
    invites_remaining = invites_remaining - 1 + 1, -- -1 for used invite, +1 for referral bonus (net: 0 change!)
    invites_used = invites_used + 1,
    referral_invites_earned = referral_invites_earned + 1,
    updated_at = NOW()
  WHERE id = token_record.inviter_id;

  -- Update referee's invited_by
  UPDATE profiles
  SET invited_by = token_record.inviter_id
  WHERE id = referee_user_id;

  -- Create referral record
  INSERT INTO referrals (referrer_id, referee_id, status, joined_at)
  VALUES (token_record.inviter_id, referee_user_id, 'joined', NOW());

  -- Create follow relationship (referee follows referrer)
  INSERT INTO follows (follower_id, following_id, created_at)
  VALUES (referee_user_id, token_record.inviter_id, NOW())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'inviter_username', token_record.username,
    'inviter_id', token_record.inviter_id,
    'referral_bonus_awarded', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create helper function to get user's invite earning progress
CREATE OR REPLACE FUNCTION get_invite_progress(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile_record RECORD;
  total_shows INTEGER;
  shows_until_next INTEGER;
  next_milestone INTEGER;
BEGIN
  -- Get profile data
  SELECT 
    invites_remaining,
    invites_used,
    profile_invite_earned,
    watchlist_invite_milestone,
    referral_invites_earned
  INTO profile_record
  FROM profiles
  WHERE id = target_user_id;

  -- Count total shows
  SELECT COUNT(*) INTO total_shows
  FROM user_shows
  WHERE user_id = target_user_id;

  -- Calculate progress to next milestone
  shows_until_next := 10 - (total_shows % 10);
  IF shows_until_next = 10 AND total_shows > 0 THEN
    shows_until_next := 0; -- They just hit a milestone
  END IF;
  next_milestone := ((total_shows / 10) + 1) * 10;

  RETURN jsonb_build_object(
    'invites_remaining', COALESCE(profile_record.invites_remaining, 0),
    'invites_used', COALESCE(profile_record.invites_used, 0),
    'profile_invite_earned', COALESCE(profile_record.profile_invite_earned, false),
    'watchlist_milestone', COALESCE(profile_record.watchlist_invite_milestone, 0),
    'referral_invites_earned', COALESCE(profile_record.referral_invites_earned, 0),
    'total_shows', total_shows,
    'shows_until_next_invite', shows_until_next,
    'next_milestone', next_milestone
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION check_watchlist_invite_milestone(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_invite_progress(UUID) TO authenticated;

-- 8. Backfill existing users' milestones (one-time)
-- This awards any invites users should have earned based on their current show count
DO $$
DECLARE
  user_record RECORD;
  result JSONB;
BEGIN
  FOR user_record IN 
    SELECT id FROM profiles WHERE watchlist_invite_milestone IS NULL OR watchlist_invite_milestone = 0
  LOOP
    result := check_watchlist_invite_milestone(user_record.id);
    IF (result->>'awarded')::BOOLEAN THEN
      RAISE NOTICE 'Awarded % invite(s) to user %', result->>'invites_awarded', user_record.id;
    END IF;
  END LOOP;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Earned Invites System migration completed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Users now earn invites through:';
  RAISE NOTICE '  1. Profile completion (+1, one-time) - existing';
  RAISE NOTICE '  2. Every 10 shows added to watchlists (+1, repeating)';
  RAISE NOTICE '  3. Each successful referral (+1 when friend joins)';
  RAISE NOTICE '';
  RAISE NOTICE 'New functions:';
  RAISE NOTICE '  - check_watchlist_invite_milestone(user_id) - manually check/award';
  RAISE NOTICE '  - get_invite_progress(user_id) - get earning progress';
  RAISE NOTICE '';
  RAISE NOTICE 'Existing users have been backfilled with milestone invites.';
END $$;


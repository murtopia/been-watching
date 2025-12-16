-- Invite System Update: No Expiration + Adjusted Earning Rules
-- Date: December 15, 2025
--
-- Changes:
-- 1. Tokens never expire (one-time use only)
-- 2. Watchlist milestone changed from 10 to 20 shows
-- 3. Remove referral bonus (no +1 when friend joins)

-- ============================================
-- 1. Update create_user_invite_token to not set expiration
-- ============================================
CREATE OR REPLACE FUNCTION create_user_invite_token(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
  user_has_invites BOOLEAN;
  invites_remaining INTEGER;
BEGIN
  -- Check if user has invites remaining
  SELECT
    p.invites_remaining > 0,
    p.invites_remaining
  INTO user_has_invites, invites_remaining
  FROM profiles p
  WHERE p.id = user_id;

  IF NOT user_has_invites THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_invites_remaining',
      'invites_remaining', invites_remaining
    );
  END IF;

  -- Generate unique token
  LOOP
    new_token := generate_random_token(12);
    SELECT EXISTS(SELECT 1 FROM invite_tokens WHERE token = new_token) INTO token_exists;
    EXIT WHEN NOT token_exists;
  END LOOP;

  -- Revoke any existing active tokens for this user (one active invite at a time)
  UPDATE invite_tokens
  SET
    status = 'revoked',
    updated_at = NOW()
  WHERE inviter_id = user_id
    AND status = 'active'
    AND invite_type = 'username';

  -- Insert new token (NO expiration - tokens never expire)
  INSERT INTO invite_tokens (
    token,
    inviter_id,
    invite_type,
    status,
    expires_at
  ) VALUES (
    new_token,
    user_id,
    'username',
    'active',
    NULL  -- No expiration
  );

  RETURN jsonb_build_object(
    'success', true,
    'token', new_token,
    'url', 'https://beenwatching.com/join?code=' || new_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Update validate_invite_token to skip expiration check
-- ============================================
CREATE OR REPLACE FUNCTION validate_invite_token(invite_token TEXT)
RETURNS JSONB AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Get token details
  SELECT
    t.id,
    t.inviter_id,
    t.status,
    t.expires_at,
    p.username,
    p.display_name,
    p.avatar_url
  INTO token_record
  FROM invite_tokens t
  JOIN profiles p ON p.id = t.inviter_id
  WHERE t.token = invite_token
    AND t.invite_type = 'username';

  -- Token not found
  IF token_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'invalid_token'
    );
  END IF;

  -- Token already used
  IF token_record.status = 'used' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_already_used'
    );
  END IF;

  -- Token revoked
  IF token_record.status = 'revoked' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_revoked'
    );
  END IF;

  -- Token expired (only check if expires_at is set - for legacy tokens)
  IF token_record.expires_at IS NOT NULL AND token_record.expires_at < NOW() THEN
    -- Auto-update status to expired
    UPDATE invite_tokens SET status = 'expired', updated_at = NOW() WHERE token = invite_token;
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_expired'
    );
  END IF;

  -- Token is valid!
  RETURN jsonb_build_object(
    'valid', true,
    'inviter_id', token_record.inviter_id,
    'inviter_username', token_record.username,
    'inviter_display_name', token_record.display_name,
    'inviter_avatar_url', token_record.avatar_url
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Update redeem_invite_token to NOT give referral bonus
-- ============================================
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

  -- Decrement inviter's invites (NO referral bonus)
  UPDATE profiles
  SET
    invites_remaining = invites_remaining - 1,
    invites_used = invites_used + 1,
    updated_at = NOW()
  WHERE id = token_record.inviter_id;

  -- Update referee's invited_by
  UPDATE profiles
  SET invited_by = token_record.inviter_id
  WHERE id = referee_user_id;

  -- Create referral record
  INSERT INTO referrals (referrer_id, referee_id, status, joined_at)
  VALUES (token_record.inviter_id, referee_user_id, 'joined', NOW())
  ON CONFLICT (referrer_id, referee_id) DO UPDATE
  SET status = 'joined', joined_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'inviter_username', token_record.username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Update check_watchlist_invite_milestone to use 20 shows
-- ============================================
CREATE OR REPLACE FUNCTION check_watchlist_invite_milestone(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_shows INTEGER;
  v_current_milestone INTEGER;
  v_new_milestone INTEGER;
  v_invites_to_award INTEGER;
BEGIN
  -- Count total shows across all watchlists
  SELECT COUNT(DISTINCT media_id)
  INTO v_total_shows
  FROM watch_status
  WHERE user_id = p_user_id;

  -- Get current milestone (how many times they've been awarded for watchlist shows)
  SELECT COALESCE(watchlist_invite_milestone, 0)
  INTO v_current_milestone
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate new milestone (every 20 shows = 1 milestone)
  v_new_milestone := v_total_shows / 20;

  -- If they've passed a new milestone, award invites
  IF v_new_milestone > v_current_milestone THEN
    v_invites_to_award := v_new_milestone - v_current_milestone;

    UPDATE profiles
    SET
      invites_remaining = invites_remaining + v_invites_to_award,
      watchlist_invite_milestone = v_new_milestone,
      updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Update get_invite_progress to use 20 shows
-- ============================================
CREATE OR REPLACE FUNCTION get_invite_progress(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_shows INTEGER;
  v_current_milestone INTEGER;
  v_next_milestone INTEGER;
  v_shows_until_next INTEGER;
BEGIN
  -- Count total shows
  SELECT COUNT(DISTINCT media_id)
  INTO v_total_shows
  FROM watch_status
  WHERE user_id = p_user_id;

  -- Get current milestone
  SELECT COALESCE(watchlist_invite_milestone, 0)
  INTO v_current_milestone
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate next milestone (multiples of 20)
  v_next_milestone := (v_current_milestone + 1) * 20;
  v_shows_until_next := v_next_milestone - v_total_shows;

  IF v_shows_until_next < 0 THEN
    v_shows_until_next := 0;
  END IF;

  RETURN jsonb_build_object(
    'totalShows', v_total_shows,
    'currentMilestone', v_current_milestone,
    'nextMilestone', v_next_milestone,
    'showsUntilNextInvite', v_shows_until_next
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Clear any existing active tokens that have expiration (make them never expire)
-- ============================================
UPDATE invite_tokens
SET expires_at = NULL
WHERE status = 'active';

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Invite system updated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - Tokens no longer expire (one-time use only)';
  RAISE NOTICE '  - Watchlist milestone: 20 shows (was 10)';
  RAISE NOTICE '  - No referral bonus when friend joins';
  RAISE NOTICE '  - Existing active tokens updated to never expire';
END $$;


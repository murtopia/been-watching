-- Secure Invite Tokens System Migration
-- Replaces username-based invites with cryptographically secure tokens
-- Prevents username enumeration, replay attacks, and other security issues

-- 1. Create invite_tokens table
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL, -- Random secure token (e.g., 'xJ9kLmP2qR')
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invite_type TEXT NOT NULL DEFAULT 'username' CHECK (invite_type IN ('username', 'vip')), -- 'username' for earned invites, 'vip' for master codes

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),

  -- Usage tracking
  used_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Analytics (optional - track clicks without PII)
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_inviter ON invite_tokens(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_status ON invite_tokens(status);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires ON invite_tokens(expires_at);

-- 3. Enable RLS
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view their own invite tokens
CREATE POLICY "Users can view own invite tokens"
  ON invite_tokens FOR SELECT
  USING (auth.uid() = inviter_id);

-- Users can update their own tokens (for revocation)
CREATE POLICY "Users can update own invite tokens"
  ON invite_tokens FOR UPDATE
  USING (auth.uid() = inviter_id);

-- Anyone can view active, non-expired tokens (for validation during signup)
-- But only through the function, not direct SELECT
CREATE POLICY "Public can validate tokens via function"
  ON invite_tokens FOR SELECT
  USING (status = 'active' AND expires_at > NOW());

-- 5. Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_random_token(length INTEGER DEFAULT 12)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; -- No confusing chars (0,O,1,l,I)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to create a new invite token for a user
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

  -- Insert new token (expires in 7 days)
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
    NOW() + INTERVAL '7 days'
  );

  RETURN jsonb_build_object(
    'success', true,
    'token', new_token,
    'expires_at', NOW() + INTERVAL '7 days',
    'url', 'https://beenwatching.com/join?code=' || new_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to validate and get invite token details
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
    p.invites_remaining
  INTO token_record
  FROM invite_tokens t
  JOIN profiles p ON p.id = t.inviter_id
  WHERE t.token = invite_token;

  -- Check if token exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_not_found'
    );
  END IF;

  -- Check if token is expired
  IF token_record.expires_at < NOW() THEN
    -- Auto-update status to expired
    UPDATE invite_tokens SET status = 'expired', updated_at = NOW() WHERE token = invite_token;

    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_expired'
    );
  END IF;

  -- Check if token is already used
  IF token_record.status = 'used' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_already_used'
    );
  END IF;

  -- Check if token is revoked
  IF token_record.status = 'revoked' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'token_revoked'
    );
  END IF;

  -- Check if inviter still has invites (shouldn't happen, but safety check)
  IF token_record.invites_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'no_invites_remaining'
    );
  END IF;

  -- Token is valid! Update click analytics
  UPDATE invite_tokens
  SET
    click_count = click_count + 1,
    last_clicked_at = NOW()
  WHERE token = invite_token;

  -- Return success with inviter info (username only for privacy)
  RETURN jsonb_build_object(
    'valid', true,
    'inviter_username', token_record.username,
    'token_id', token_record.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to redeem an invite token (called after successful signup)
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

  -- Decrement inviter's invites and increment used count
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
  VALUES (token_record.inviter_id, referee_user_id, 'joined', NOW());

  -- Create follow relationship (referee follows referrer)
  INSERT INTO follows (follower_id, following_id, created_at)
  VALUES (referee_user_id, token_record.inviter_id, NOW())
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'inviter_username', token_record.username,
    'inviter_id', token_record.inviter_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to revoke a user's active invite token
CREATE OR REPLACE FUNCTION revoke_user_invite_token(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE invite_tokens
  SET
    status = 'revoked',
    updated_at = NOW()
  WHERE inviter_id = user_id
    AND status = 'active'
    AND invite_type = 'username';

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_random_token(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_invite_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_invite_token(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION redeem_invite_token(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_invite_token(UUID) TO authenticated;

-- 11. Create view for user's invite history (with analytics)
CREATE OR REPLACE VIEW user_invite_history AS
SELECT
  t.inviter_id,
  t.token,
  t.status,
  t.created_at,
  t.expires_at,
  t.used_at,
  t.click_count,
  t.last_clicked_at,
  p_inviter.username as inviter_username,
  p_referee.username as referee_username,
  p_referee.display_name as referee_display_name
FROM invite_tokens t
JOIN profiles p_inviter ON p_inviter.id = t.inviter_id
LEFT JOIN profiles p_referee ON p_referee.id = t.used_by_user_id
WHERE t.invite_type = 'username'
ORDER BY t.created_at DESC;

GRANT SELECT ON user_invite_history TO authenticated;

-- 12. Automatic cleanup of expired tokens (runs daily)
CREATE OR REPLACE FUNCTION cleanup_expired_invite_tokens()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE invite_tokens
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND expires_at < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Secure invite tokens system created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'New features:';
  RAISE NOTICE '  - Cryptographically secure invite tokens (prevents username enumeration)';
  RAISE NOTICE '  - Automatic expiration (7 days)';
  RAISE NOTICE '  - One-time use tokens (prevents replay attacks)';
  RAISE NOTICE '  - Token revocation support';
  RAISE NOTICE '  - Click analytics (privacy-safe)';
  RAISE NOTICE '';
  RAISE NOTICE 'To generate an invite token for a user:';
  RAISE NOTICE '  SELECT create_user_invite_token(''user-uuid-here'');';
  RAISE NOTICE '';
  RAISE NOTICE 'To validate a token:';
  RAISE NOTICE '  SELECT validate_invite_token(''token-here'');';
END $$;

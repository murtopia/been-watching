-- One-time script to check existing users and award profile completion invites
-- Run this after the invite system v2 migration

DO $$
DECLARE
  profile_record RECORD;
  was_awarded BOOLEAN;
BEGIN
  -- Loop through all users who haven't earned their profile invite yet
  FOR profile_record IN
    SELECT id, username FROM profiles WHERE profile_invite_earned = FALSE
  LOOP
    -- Try to award invite
    SELECT award_profile_completion_invite(profile_record.id) INTO was_awarded;

    IF was_awarded THEN
      RAISE NOTICE 'Awarded invite to user: %', profile_record.username;
    END IF;
  END LOOP;

  RAISE NOTICE 'Finished checking existing users for profile completion invites';
END $$;

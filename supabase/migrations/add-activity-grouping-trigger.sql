-- Activity Grouping Trigger
-- Groups related activities (e.g., rating + status change) on the same media within 5 minutes
-- Run this in Supabase SQL Editor

-- First, ensure the activity_group_id column exists
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS activity_group_id UUID;

-- Create function to assign activity_group_id
CREATE OR REPLACE FUNCTION assign_activity_group()
RETURNS TRIGGER AS $$
DECLARE
  existing_group_id UUID;
  time_window INTERVAL := '5 minutes';
BEGIN
  -- Look for a recent activity from the same user on the same media
  SELECT activity_group_id INTO existing_group_id
  FROM activities
  WHERE user_id = NEW.user_id
    AND media_id = NEW.media_id
    AND created_at > (NOW() - time_window)
    AND activity_group_id IS NOT NULL
    AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF existing_group_id IS NOT NULL THEN
    -- Use existing group
    NEW.activity_group_id := existing_group_id;
  ELSE
    -- Create new group (use the activity's own ID as group ID for simplicity)
    NEW.activity_group_id := COALESCE(NEW.id, uuid_generate_v4());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_assign_activity_group ON activities;

-- Create trigger to run before insert
CREATE TRIGGER trigger_assign_activity_group
  BEFORE INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION assign_activity_group();

-- Verify trigger was created
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trigger_assign_activity_group';


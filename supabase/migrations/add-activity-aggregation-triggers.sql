-- Update activity creation triggers to support activity aggregation
-- Groups related activities (rating + status change) within 1 minute

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_rating_created ON ratings;
DROP TRIGGER IF EXISTS on_watch_status_changed ON watch_status;
DROP FUNCTION IF EXISTS handle_rating_activity();
DROP FUNCTION IF EXISTS handle_watch_status_activity();

-- Function to handle aggregated activity creation
CREATE OR REPLACE FUNCTION handle_aggregated_activity()
RETURNS TRIGGER AS $$
DECLARE
  existing_group_id UUID;
  recent_activity_id UUID;
  activity_time_window INTERVAL := '1 minute';
BEGIN
  -- Check if there's a recent activity on the same media by the same user
  SELECT id, activity_group_id INTO recent_activity_id, existing_group_id
  FROM activities
  WHERE user_id = NEW.user_id
    AND media_id = CASE 
      WHEN TG_TABLE_NAME = 'ratings' THEN NEW.media_id
      WHEN TG_TABLE_NAME = 'watch_status' THEN NEW.media_id
    END
    AND created_at > NOW() - activity_time_window
    AND id != COALESCE((SELECT id FROM activities ORDER BY created_at DESC LIMIT 1), '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY created_at DESC
  LIMIT 1;

  -- If we found a recent activity, group them
  IF recent_activity_id IS NOT NULL THEN
    -- Use existing group or create new one
    IF existing_group_id IS NOT NULL THEN
      -- Add to existing group
      INSERT INTO activities (
        user_id,
        media_id,
        activity_type,
        activity_data,
        activity_group_id
      )
      VALUES (
        NEW.user_id,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN NEW.media_id
          WHEN TG_TABLE_NAME = 'watch_status' THEN NEW.media_id
        END,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN 'rated'
          WHEN TG_TABLE_NAME = 'watch_status' THEN 'status_changed'
        END,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN jsonb_build_object('rating', NEW.rating, 'my_take', NEW.my_take)
          WHEN TG_TABLE_NAME = 'watch_status' THEN jsonb_build_object('status', NEW.status, 'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END)
        END,
        existing_group_id
      );
    ELSE
      -- Create new group
      INSERT INTO activity_groups (user_id, media_id)
      VALUES (
        NEW.user_id,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN NEW.media_id
          WHEN TG_TABLE_NAME = 'watch_status' THEN NEW.media_id
        END
      )
      RETURNING id INTO existing_group_id;

      -- Update existing activity with group_id
      UPDATE activities
      SET activity_group_id = existing_group_id
      WHERE id = recent_activity_id;

      -- Create new activity with group_id
      INSERT INTO activities (
        user_id,
        media_id,
        activity_type,
        activity_data,
        activity_group_id
      )
      VALUES (
        NEW.user_id,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN NEW.media_id
          WHEN TG_TABLE_NAME = 'watch_status' THEN NEW.media_id
        END,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN 'rated'
          WHEN TG_TABLE_NAME = 'watch_status' THEN 'status_changed'
        END,
        CASE 
          WHEN TG_TABLE_NAME = 'ratings' THEN jsonb_build_object('rating', NEW.rating, 'my_take', NEW.my_take)
          WHEN TG_TABLE_NAME = 'watch_status' THEN jsonb_build_object('status', NEW.status, 'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END)
        END,
        existing_group_id
      );
    END IF;
  ELSE
    -- No recent activity, create standalone activity
    INSERT INTO activities (
      user_id,
      media_id,
      activity_type,
      activity_data
    )
    VALUES (
      NEW.user_id,
      CASE 
        WHEN TG_TABLE_NAME = 'ratings' THEN NEW.media_id
        WHEN TG_TABLE_NAME = 'watch_status' THEN NEW.media_id
      END,
      CASE 
        WHEN TG_TABLE_NAME = 'ratings' THEN 'rated'
        WHEN TG_TABLE_NAME = 'watch_status' THEN 'status_changed'
      END,
      CASE 
        WHEN TG_TABLE_NAME = 'ratings' THEN jsonb_build_object('rating', NEW.rating, 'my_take', NEW.my_take)
        WHEN TG_TABLE_NAME = 'watch_status' THEN jsonb_build_object('status', NEW.status, 'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END)
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Simpler approach: Create separate functions for rating and status, but check for grouping
CREATE OR REPLACE FUNCTION handle_rating_activity()
RETURNS TRIGGER AS $$
DECLARE
  existing_group_id UUID;
  recent_status_activity_id UUID;
BEGIN
  -- Check if there's a recent status change activity (< 1 minute) on same media
  SELECT id, activity_group_id INTO recent_status_activity_id, existing_group_id
  FROM activities
  WHERE user_id = NEW.user_id
    AND media_id = NEW.media_id
    AND activity_type = 'status_changed'
    AND created_at > NOW() - INTERVAL '1 minute'
  ORDER BY created_at DESC
  LIMIT 1;

  IF recent_status_activity_id IS NOT NULL THEN
    -- Group with existing activity
    IF existing_group_id IS NOT NULL THEN
      -- Add to existing group
      INSERT INTO activities (user_id, media_id, activity_type, activity_data, activity_group_id)
      VALUES (NEW.user_id, NEW.media_id, 'rated', jsonb_build_object('rating', NEW.rating, 'my_take', NEW.my_take), existing_group_id);
    ELSE
      -- Create new group
      INSERT INTO activity_groups (user_id, media_id)
      VALUES (NEW.user_id, NEW.media_id)
      RETURNING id INTO existing_group_id;

      -- Update existing status activity
      UPDATE activities SET activity_group_id = existing_group_id WHERE id = recent_status_activity_id;

      -- Create new rating activity with group
      INSERT INTO activities (user_id, media_id, activity_type, activity_data, activity_group_id)
      VALUES (NEW.user_id, NEW.media_id, 'rated', jsonb_build_object('rating', NEW.rating, 'my_take', NEW.my_take), existing_group_id);
    END IF;
  ELSE
    -- No recent activity, create standalone
    INSERT INTO activities (user_id, media_id, activity_type, activity_data)
    VALUES (NEW.user_id, NEW.media_id, 'rated', jsonb_build_object('rating', NEW.rating, 'my_take', NEW.my_take));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_watch_status_activity()
RETURNS TRIGGER AS $$
DECLARE
  existing_group_id UUID;
  recent_rating_activity_id UUID;
BEGIN
  -- Only create activity if status actually changed
  IF (TG_OP = 'INSERT' OR OLD.status != NEW.status) THEN
    -- Check if there's a recent rating activity (< 1 minute) on same media
    SELECT id, activity_group_id INTO recent_rating_activity_id, existing_group_id
    FROM activities
    WHERE user_id = NEW.user_id
      AND media_id = NEW.media_id
      AND activity_type = 'rated'
      AND created_at > NOW() - INTERVAL '1 minute'
    ORDER BY created_at DESC
    LIMIT 1;

    IF recent_rating_activity_id IS NOT NULL THEN
      -- Group with existing activity
      IF existing_group_id IS NOT NULL THEN
        -- Add to existing group
        INSERT INTO activities (user_id, media_id, activity_type, activity_data, activity_group_id)
        VALUES (
          NEW.user_id,
          NEW.media_id,
          'status_changed',
          jsonb_build_object('status', NEW.status, 'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END),
          existing_group_id
        );
      ELSE
        -- Create new group
        INSERT INTO activity_groups (user_id, media_id)
        VALUES (NEW.user_id, NEW.media_id)
        RETURNING id INTO existing_group_id;

        -- Update existing rating activity
        UPDATE activities SET activity_group_id = existing_group_id WHERE id = recent_rating_activity_id;

        -- Create new status activity with group
        INSERT INTO activities (user_id, media_id, activity_type, activity_data, activity_group_id)
        VALUES (
          NEW.user_id,
          NEW.media_id,
          'status_changed',
          jsonb_build_object('status', NEW.status, 'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END),
          existing_group_id
        );
      END IF;
    ELSE
      -- No recent activity, create standalone
      INSERT INTO activities (user_id, media_id, activity_type, activity_data)
      VALUES (
        NEW.user_id,
        NEW.media_id,
        'status_changed',
        jsonb_build_object('status', NEW.status, 'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER on_rating_created
  AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION handle_rating_activity();

CREATE TRIGGER on_watch_status_changed
  AFTER INSERT OR UPDATE ON watch_status
  FOR EACH ROW EXECUTE FUNCTION handle_watch_status_activity();


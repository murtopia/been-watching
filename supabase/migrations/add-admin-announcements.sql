-- Admin Announcement System
-- Allows admins to create and send global announcements to all users
-- Supports optional action buttons (internal/external links)

-- Create announcements table to track all sent announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement', 'feature_release', 'maintenance', 'welcome')),
  icon TEXT DEFAULT '📢',

  -- Action button configuration (optional)
  action_type TEXT CHECK (action_type IN ('internal', 'external', 'none')),
  action_url TEXT,
  action_text TEXT,

  -- Targeting
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'admins', 'incomplete_profiles', 'active_users')),

  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Statistics
  total_recipients INTEGER DEFAULT 0,
  delivery_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_sent_at ON public.announcements(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view announcements
CREATE POLICY "Admins can view all announcements"
  ON public.announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can create announcements
CREATE POLICY "Admins can create announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update announcements
CREATE POLICY "Admins can update announcements"
  ON public.announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Function to send announcement to all users
CREATE OR REPLACE FUNCTION public.send_global_announcement(
  announcement_title TEXT,
  announcement_message TEXT,
  announcement_type TEXT DEFAULT 'announcement',
  announcement_icon TEXT DEFAULT '📢',
  action_type TEXT DEFAULT NULL,
  action_url TEXT DEFAULT NULL,
  action_text TEXT DEFAULT NULL,
  target_audience TEXT DEFAULT 'all'
)
RETURNS JSONB AS $$
DECLARE
  recipients_count INTEGER;
  announcement_id UUID;
  user_cursor CURSOR FOR
    SELECT id FROM public.profiles
    WHERE CASE
      WHEN target_audience = 'all' THEN true
      WHEN target_audience = 'incomplete_profiles' THEN
        (avatar_url IS NULL OR bio IS NULL OR bio = '')
      WHEN target_audience = 'active_users' THEN
        id IN (
          SELECT DISTINCT user_id
          FROM public.activities
          WHERE created_at > NOW() - INTERVAL '30 days'
        )
      ELSE true
    END;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can send announcements';
  END IF;

  -- Create announcement record
  INSERT INTO public.announcements (
    title,
    message,
    type,
    icon,
    action_type,
    action_url,
    action_text,
    target_audience,
    status,
    sent_at,
    created_by
  )
  VALUES (
    announcement_title,
    announcement_message,
    announcement_type,
    announcement_icon,
    COALESCE(action_type, 'none'),
    action_url,
    action_text,
    target_audience,
    'sent',
    NOW(),
    auth.uid()
  )
  RETURNING id INTO announcement_id;

  -- Insert notifications for targeted users
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    target_type,
    target_id,
    metadata,
    read
  )
  SELECT
    p.id,
    NULL,  -- System notification (no actor)
    announcement_type,
    'system',
    announcement_id,
    jsonb_build_object(
      'title', announcement_title,
      'message', announcement_message,
      'icon', announcement_icon,
      'action', CASE
        WHEN action_type IS NOT NULL AND action_type != 'none' THEN
          jsonb_build_object(
            'type', action_type,
            'url', action_url,
            'text', action_text
          )
        ELSE NULL
      END,
      'announcementId', announcement_id
    ),
    false
  FROM public.profiles p
  WHERE CASE
    WHEN target_audience = 'all' THEN true
    WHEN target_audience = 'incomplete_profiles' THEN
      (p.avatar_url IS NULL OR p.bio IS NULL OR p.bio = '')
    WHEN target_audience = 'active_users' THEN
      p.id IN (
        SELECT DISTINCT user_id
        FROM public.activities
        WHERE created_at > NOW() - INTERVAL '30 days'
      )
    ELSE true
  END;

  GET DIAGNOSTICS recipients_count = ROW_COUNT;

  -- Update announcement stats
  UPDATE public.announcements
  SET total_recipients = recipients_count,
      delivery_count = recipients_count
  WHERE id = announcement_id;

  RETURN jsonb_build_object(
    'success', true,
    'announcement_id', announcement_id,
    'recipients', recipients_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark announcement as read (called when user dismisses)
CREATE OR REPLACE FUNCTION public.mark_announcement_read(
  announcement_id UUID
)
RETURNS void AS $$
BEGIN
  -- Update the notification as read
  UPDATE public.notifications
  SET read = true
  WHERE target_id = announcement_id
    AND user_id = auth.uid()
    AND read = false;

  -- Increment read count on announcement
  UPDATE public.announcements
  SET read_count = read_count + 1
  WHERE id = announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track announcement action clicks
CREATE OR REPLACE FUNCTION public.track_announcement_click(
  announcement_id UUID
)
RETURNS void AS $$
BEGIN
  -- Increment click count
  UPDATE public.announcements
  SET click_count = click_count + 1
  WHERE id = announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get announcement statistics
CREATE OR REPLACE FUNCTION public.get_announcement_stats()
RETURNS TABLE (
  id UUID,
  title TEXT,
  type TEXT,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER,
  read_count INTEGER,
  click_count INTEGER,
  read_rate NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.type,
    a.sent_at,
    a.total_recipients,
    a.read_count,
    a.click_count,
    CASE
      WHEN a.total_recipients > 0
      THEN ROUND((a.read_count::numeric / a.total_recipients::numeric) * 100, 1)
      ELSE 0
    END as read_rate,
    CASE
      WHEN a.total_recipients > 0
      THEN ROUND((a.click_count::numeric / a.total_recipients::numeric) * 100, 1)
      ELSE 0
    END as click_rate
  FROM public.announcements a
  WHERE a.status = 'sent'
  ORDER BY a.sent_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE public.announcements IS 'Stores admin-created global announcements sent to users';
COMMENT ON FUNCTION public.send_global_announcement IS 'Send a global announcement to all or targeted users';
COMMENT ON FUNCTION public.mark_announcement_read IS 'Mark announcement as read by current user';
COMMENT ON FUNCTION public.track_announcement_click IS 'Track when user clicks announcement action button';
COMMENT ON FUNCTION public.get_announcement_stats IS 'Get statistics for all sent announcements';

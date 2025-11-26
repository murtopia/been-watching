-- Create share_events table for tracking social shares
CREATE TABLE IF NOT EXISTS public.share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Share details
  sharer_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('show', 'profile', 'list', 'top3', 'invite', 'achievement')),
  content_id TEXT NOT NULL,
  share_method TEXT NOT NULL CHECK (share_method IN (
    'instagram_story', 'instagram_post', 'twitter',
    'native_sheet', 'copy_link', 'in_app', 'qr_code'
  )),
  recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- For in-app shares only

  -- Attribution & Analytics
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  clicked_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  conversion_type TEXT CHECK (conversion_type IN ('signup', 'follow', 'rate_show', 'watchlist_add')),

  -- UTM parameters
  utm_source TEXT DEFAULT 'share',
  utm_medium TEXT,
  utm_campaign TEXT DEFAULT 'organic_share',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_share_events_sharer ON public.share_events(sharer_user_id);
CREATE INDEX idx_share_events_content ON public.share_events(content_type, content_id);
CREATE INDEX idx_share_events_method ON public.share_events(share_method);
CREATE INDEX idx_share_events_created ON public.share_events(created_at DESC);
CREATE INDEX idx_share_events_clicked ON public.share_events(clicked) WHERE clicked = true;
CREATE INDEX idx_share_events_converted ON public.share_events(converted) WHERE converted = true;

-- Enable Row Level Security
ALTER TABLE public.share_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own share events
CREATE POLICY "Users can view own share events"
  ON public.share_events
  FOR SELECT
  USING (auth.uid() = sharer_user_id);

-- Users can create share events
CREATE POLICY "Users can create share events"
  ON public.share_events
  FOR INSERT
  WITH CHECK (auth.uid() = sharer_user_id);

-- Public can update click tracking (for attribution)
CREATE POLICY "Public can update click tracking"
  ON public.share_events
  FOR UPDATE
  USING (clicked = false)
  WITH CHECK (
    clicked = true AND
    clicked_at IS NOT NULL
  );

-- Create function to track share event
CREATE OR REPLACE FUNCTION public.track_share_event(
  p_content_type TEXT,
  p_content_id TEXT,
  p_share_method TEXT,
  p_recipient_user_id UUID DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_share_id UUID;
BEGIN
  INSERT INTO public.share_events (
    sharer_user_id,
    content_type,
    content_id,
    share_method,
    recipient_user_id,
    utm_medium,
    metadata
  ) VALUES (
    auth.uid(),
    p_content_type,
    p_content_id,
    p_share_method,
    p_recipient_user_id,
    COALESCE(p_utm_medium, p_share_method),
    p_metadata
  )
  RETURNING id INTO v_share_id;

  RETURN v_share_id;
END;
$$;

-- Create function to track share click (for attribution)
CREATE OR REPLACE FUNCTION public.track_share_click(
  p_share_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.share_events
  SET
    clicked = true,
    clicked_at = NOW(),
    clicked_by_user_id = COALESCE(p_user_id, auth.uid())
  WHERE id = p_share_id
    AND clicked = false;

  RETURN FOUND;
END;
$$;

-- Create function to track share conversion
CREATE OR REPLACE FUNCTION public.track_share_conversion(
  p_share_id UUID,
  p_conversion_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.share_events
  SET
    converted = true,
    converted_at = NOW(),
    conversion_type = p_conversion_type
  WHERE id = p_share_id
    AND converted = false
    AND clicked = true;

  RETURN FOUND;
END;
$$;

-- Create view for share analytics
CREATE OR REPLACE VIEW public.share_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  content_type,
  share_method,
  COUNT(*) as total_shares,
  COUNT(DISTINCT sharer_user_id) as unique_sharers,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
  ROUND(AVG(CASE WHEN clicked THEN 1 ELSE 0 END) * 100, 2) as click_rate,
  ROUND(AVG(CASE WHEN converted THEN 1 ELSE 0 END) * 100, 2) as conversion_rate
FROM public.share_events
GROUP BY DATE_TRUNC('day', created_at), content_type, share_method;

-- Grant necessary permissions
GRANT SELECT ON public.share_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_share_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_share_click TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_share_conversion TO authenticated;

-- Add comment
COMMENT ON TABLE public.share_events IS 'Tracks all social sharing events for analytics and attribution';
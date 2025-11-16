-- Create ad_slots table for future advertiser platform integration
-- This is a foundation table that can be expanded later

CREATE TABLE IF NOT EXISTS ad_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL,
  media_id TEXT REFERENCES media(id),
  advertiser_id UUID,
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ad_slots_position ON ad_slots(position);
CREATE INDEX IF NOT EXISTS idx_ad_slots_media ON ad_slots(media_id);
CREATE INDEX IF NOT EXISTS idx_ad_slots_dates ON ad_slots(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_slots_active ON ad_slots(start_date, end_date) WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE;

-- Enable Row Level Security
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active ad slots (for display in feed)
CREATE POLICY "Everyone can view active ad slots"
  ON ad_slots
  FOR SELECT
  USING (
    start_date <= CURRENT_DATE 
    AND end_date >= CURRENT_DATE
  );

-- Policy: Only admins can manage ad slots
CREATE POLICY "Admins can manage ad slots"
  ON ad_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add helpful comment
COMMENT ON TABLE ad_slots IS 'Stores advertisement placements for future advertiser platform';


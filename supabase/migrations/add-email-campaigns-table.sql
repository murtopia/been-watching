-- Migration: Add email campaigns tracking table
-- Created: 2025-11-02
-- Purpose: Track all email campaigns with optional auto-send workflow

-- Create admin settings table for email automation
CREATE TABLE IF NOT EXISTS admin_email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Auto-send toggles
  auto_send_weekly_recap BOOLEAN DEFAULT FALSE,
  auto_send_monthly_recap BOOLEAN DEFAULT FALSE,
  auto_send_announcements BOOLEAN DEFAULT FALSE,

  -- Updated by
  updated_by UUID REFERENCES profiles(id),

  -- Only one row allowed (id is always 1)
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings (only one row with id=1)
INSERT INTO admin_email_settings (id, auto_send_weekly_recap, auto_send_monthly_recap, auto_send_announcements)
VALUES (1, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Campaign Details
  campaign_type TEXT NOT NULL, -- 'weekly_recap', 'monthly_recap', 'announcement', 'manual'
  subject TEXT NOT NULL,

  -- Approval Workflow
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'sent', 'cancelled'
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Recipient Tracking
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- Template Data
  template_name TEXT,
  template_data JSONB,

  -- Notes
  admin_notes TEXT,

  -- Created By
  created_by UUID REFERENCES profiles(id),

  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'cancelled')),
  CONSTRAINT valid_campaign_type CHECK (campaign_type IN ('weekly_recap', 'monthly_recap', 'announcement', 'manual'))
);

-- Create email_sends table (individual email tracking)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Campaign Reference
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,

  -- Recipient
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,

  -- Resend Integration
  resend_id TEXT, -- Resend's email ID for tracking

  -- Status
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Error Tracking
  error_message TEXT,

  CONSTRAINT valid_send_status CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_for) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON email_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_user ON email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_resend_id ON email_sends(resend_id) WHERE resend_id IS NOT NULL;

-- Add RLS policies (admin-only access)
ALTER TABLE admin_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Admin can manage email settings
CREATE POLICY "Admins can manage email settings"
  ON admin_email_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin can do everything with campaigns
CREATE POLICY "Admins can manage email campaigns"
  ON email_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin can view email sends
CREATE POLICY "Admins can view email sends"
  ON email_sends
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comments for documentation
COMMENT ON TABLE admin_email_settings IS 'Global email automation settings - toggle auto-send on/off';
COMMENT ON COLUMN admin_email_settings.auto_send_weekly_recap IS 'When true, Weekly Recap emails auto-send every Friday without approval';
COMMENT ON COLUMN admin_email_settings.auto_send_monthly_recap IS 'When true, Monthly Recap emails auto-send 1st of month without approval';
COMMENT ON COLUMN admin_email_settings.auto_send_announcements IS 'When true, Product Announcements can auto-send without approval';

COMMENT ON TABLE email_campaigns IS 'Tracks all email campaigns with optional auto-send workflow';
COMMENT ON COLUMN email_campaigns.status IS 'Campaign approval status: draft → pending_approval → approved → sent (auto-skips approval when enabled)';
COMMENT ON COLUMN email_campaigns.campaign_type IS 'Type of campaign: weekly_recap, monthly_recap, announcement, manual';
COMMENT ON COLUMN email_campaigns.approved_by IS 'Admin user who approved the campaign (NULL if auto-sent)';
COMMENT ON COLUMN email_campaigns.template_data IS 'JSON data passed to email template';

COMMENT ON TABLE email_sends IS 'Individual email send tracking linked to campaigns';
COMMENT ON COLUMN email_sends.resend_id IS 'Resend email ID for webhook tracking';
COMMENT ON COLUMN email_sends.status IS 'Email delivery status from Resend webhooks';

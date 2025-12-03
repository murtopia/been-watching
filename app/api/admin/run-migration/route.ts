import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const ADMIN_SETTINGS_MIGRATION = `-- Create admin_settings table for application-wide configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('feed_show_all_users', 'true', 'Show all users activities in feed (true) or only followed users (false)')
ON CONFLICT (setting_key) DO NOTHING;

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view admin settings" ON admin_settings;
CREATE POLICY "Everyone can view admin settings"
  ON admin_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON admin_settings;
CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert settings" ON admin_settings;
CREATE POLICY "Admins can insert settings"
  ON admin_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE admin_settings IS 'Application-wide settings controlled by administrators';`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { migration } = await request.json()

    if (migration !== 'admin_settings') {
      return NextResponse.json({ error: 'Invalid migration name' }, { status: 400 })
    }

    // Supabase doesn't allow executing arbitrary SQL from the application for security reasons
    // We need to return the SQL for manual execution
    // The user will need to run this in Supabase SQL Editor
    
    return NextResponse.json({
      error: 'Automatic migration not available',
      instructions: 'Please copy the SQL below and run it in Supabase SQL Editor. Go to your Supabase project → SQL Editor → New Query, then paste and run.',
      sql: ADMIN_SETTINGS_MIGRATION
    }, { status: 200 }) // Return 200 so the page can display the SQL
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: error.message || 'Migration failed',
      instructions: 'Please run the migration manually in Supabase SQL Editor. The SQL file is at: supabase/migrations/create-admin-settings-table.sql'
    }, { status: 500 })
  }
}


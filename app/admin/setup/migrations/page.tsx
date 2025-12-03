'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const ADMIN_SETTINGS_MIGRATION = `-- Create admin_settings table for application-wide configuration
-- Allows admins to toggle features and settings

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Insert default feed setting
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('feed_show_all_users', 'true', 'Show all users activities in feed (true) or only followed users (false)')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view admin settings (needed for feed filtering logic)
DROP POLICY IF EXISTS "Everyone can view admin settings" ON admin_settings;
CREATE POLICY "Everyone can view admin settings"
  ON admin_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update settings (check is_admin flag in profiles)
DROP POLICY IF EXISTS "Admins can update settings" ON admin_settings;
CREATE POLICY "Admins can update settings"
  ON admin_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only admins can insert settings
DROP POLICY IF EXISTS "Admins can insert settings" ON admin_settings;
CREATE POLICY "Admins can insert settings"
  ON admin_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add helpful comment
COMMENT ON TABLE admin_settings IS 'Application-wide settings controlled by administrators';`

export default function MigrationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; sql?: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const runMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        setResult({
          success: false,
          message: 'Only admins can run migrations'
        })
        setLoading(false)
        return
      }

      // Try to run migration via API
      const response = await fetch('/api/admin/run-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ migration: 'admin_settings' })
      })

      const data = await response.json()

      // Always show the SQL for manual execution (Supabase doesn't allow auto-execution)
      setResult({
        success: false,
        message: data.instructions || 'Please run the migration manually in Supabase SQL Editor',
        sql: data.sql || ADMIN_SETTINGS_MIGRATION
      })
    } catch (error: any) {
      console.error('Migration error:', error)
      setResult({
        success: false,
        message: error.message || 'Failed to run migration. Please run it manually in Supabase SQL Editor.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Database Migrations
        </h1>
        <p style={{ color: '#888' }}>
          Run database migrations to set up required tables
        </p>
      </div>

      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#3b82f620',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Admin Settings Table
            </h2>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>
              Creates the admin_settings table required for streaming platforms management
            </p>
          </div>
        </div>

        {result && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            background: result.success ? '#10b98110' : '#dc262610',
            border: `1px solid ${result.success ? '#10b981' : '#dc2626'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: result.sql ? '1rem' : '0'
            }}>
              {result.success ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <XCircle size={20} color="#dc2626" />
              )}
              <div style={{
                color: result.success ? '#10b981' : '#dc2626',
                fontSize: '0.875rem',
                flex: 1
              }}>
                {result.message}
              </div>
            </div>
            {result.sql && (
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '0.5rem'
                }}>
                  Copy this SQL and run it in Supabase SQL Editor:
                </div>
                <div style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '1rem',
                  position: 'relative'
                }}>
                  <pre style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#e5e5e5',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {result.sql}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.sql!)
                      alert('SQL copied to clipboard!')
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Copy SQL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={runMigration}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: loading ? '#888' : '#3b82f6',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Running Migration...
            </>
          ) : (
            <>
              <Database size={16} />
              Run Migration
            </>
          )}
        </button>

        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#3b82f610',
          border: '1px solid #3b82f630',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#3b82f6'
        }}>
          <strong>Instructions:</strong>
          <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Click "Run Migration" above to see the SQL</li>
            <li>Click "Copy SQL" to copy it to your clipboard</li>
            <li>Go to your Supabase project dashboard</li>
            <li>Click "SQL Editor" in the left sidebar</li>
            <li>Click "New Query"</li>
            <li>Paste the SQL and click "Run"</li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


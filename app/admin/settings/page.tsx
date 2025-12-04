'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Settings, Users, UserCheck, Tv } from 'lucide-react'
import Link from 'next/link'
import SettingsNav from './SettingsNav'

export default function AdminSettingsPage() {
  const [feedShowAllUsers, setFeedShowAllUsers] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdminAndLoadSettings()
  }, [])

  const checkAdminAndLoadSettings = async () => {
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
        router.push('/')
        return
      }

      // Load feed setting
      const { data: feedSetting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'feed_show_all_users')
        .single()

      if (feedSetting) {
        setFeedShowAllUsers(feedSetting.setting_value === 'true')
      }

      setLoading(false)
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/')
    }
  }

  const handleToggleFeedSetting = async () => {
    setSaving(true)
    try {
      const newValue = !feedShowAllUsers

      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'feed_show_all_users',
          setting_value: newValue.toString(),
          description: 'Show all users activities in feed (true) or only followed users (false)'
        }, {
          onConflict: 'setting_key'
        })

      if (error) {
        console.error('Error updating setting:', error)
        alert('Failed to update setting')
      } else {
        setFeedShowAllUsers(newValue)
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Failed to save setting')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #ec4899',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Sub-navigation */}
      <SettingsNav />

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Admin Settings
        </h1>
        <p style={{ color: '#888' }}>
          Manage application-wide settings
        </p>
      </div>

      {/* Feed Settings */}
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
            <Users size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Feed Visibility
            </h2>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>
              Control what activities appear in the feed
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          background: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: '600',
              marginBottom: '0.25rem'
            }}>
              Show All Users' Activities
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#888'
            }}>
              {feedShowAllUsers 
                ? 'Feed shows activities from all users'
                : 'Feed shows only activities from followed users'
              }
            </div>
          </div>
          <button
            onClick={handleToggleFeedSetting}
            disabled={saving}
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '9999px',
              background: feedShowAllUsers ? '#10b981' : '#d1d5db',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              opacity: saving ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.opacity = '0.9'
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.opacity = '1'
              }
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '2px',
              left: feedShowAllUsers ? 'calc(100% - 26px)' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}></div>
          </button>
        </div>
      </div>

      {/* Streaming Platforms Settings */}
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
            background: '#ec489920',
            color: '#ec4899',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tv size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Streaming Platforms
            </h2>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>
              Control which streaming platforms appear on feed cards
            </p>
          </div>
          <Link
            href="/admin/settings/streaming-platforms"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Manage Platforms
          </Link>
        </div>
      </div>
    </div>
  )
}


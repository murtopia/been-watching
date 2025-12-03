'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Tv } from 'lucide-react'
import { useThemeColors } from '@/hooks/useThemeColors'

interface Platform {
  name: string
  enabled: boolean
}

export default function StreamingPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const colors = useThemeColors()

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

      setCurrentUserId(user.id)

      // Load streaming platforms allowlist
      const { data: setting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'streaming_platforms_allowlist')
        .single()

      let enabledPlatforms: string[] = []
      if (setting?.setting_value) {
        try {
          enabledPlatforms = JSON.parse(setting.setting_value)
        } catch (e) {
          console.error('Error parsing platforms:', e)
        }
      }

      // Get all known platforms (from a predefined list + any that are enabled)
      const allKnownPlatforms = [
        'Netflix',
        'Max',
        'Disney+',
        'Hulu',
        'Prime Video',
        'Apple TV+',
        'Paramount+',
        'Peacock',
        'Showtime',
        'Starz',
        'HBO',
        'Crunchyroll',
        'AMC+',
        'Discovery+',
        'ESPN+',
        'fuboTV',
        'Spectrum On Demand',
        'CBS',
        'ABC',
        'NBC',
        'FOX',
        'The CW',
        'Freevee',
        'Tubi',
        'Pluto TV',
        'Crackle',
        'Vudu',
        'YouTube Premium',
        'YouTube',
        'Kanopy',
        'Hoopla',
        'Plex',
        'Roku Channel',
        'Sling TV',
        'Philo',
        'DIRECTV Stream',
        'YouTube TV'
      ]

      // Combine known platforms with any enabled platforms not in the list
      const allPlatforms = new Set([...allKnownPlatforms, ...enabledPlatforms])
      
      // Create platform objects with enabled state
      const platformList: Platform[] = Array.from(allPlatforms)
        .sort()
        .map(name => ({
          name,
          enabled: enabledPlatforms.includes(name)
        }))

      setPlatforms(platformList)
      setLoading(false)
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/')
    }
  }

  const handleTogglePlatform = async (platformName: string) => {
    setSaving(true)
    try {
      const updatedPlatforms = platforms.map(p => 
        p.name === platformName ? { ...p, enabled: !p.enabled } : p
      )
      setPlatforms(updatedPlatforms)

      const enabledPlatforms = updatedPlatforms
        .filter(p => p.enabled)
        .map(p => p.name)

      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'streaming_platforms_allowlist',
          setting_value: JSON.stringify(enabledPlatforms),
          description: 'List of streaming platforms to display on feed cards (JSON array of platform names)',
          updated_by: currentUserId
        }, {
          onConflict: 'setting_key'
        })

      if (error) {
        console.error('Error updating setting:', error)
        alert(`Failed to update setting: ${error.message}`)
        // Revert on error
        checkAdminAndLoadSettings()
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Failed to save setting')
      // Revert on error
      checkAdminAndLoadSettings()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleAll = async (enable: boolean) => {
    setSaving(true)
    try {
      const updatedPlatforms = platforms.map(p => ({ ...p, enabled: enable }))
      setPlatforms(updatedPlatforms)

      const enabledPlatforms = enable 
        ? platforms.map(p => p.name)
        : []

      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'streaming_platforms_allowlist',
          setting_value: JSON.stringify(enabledPlatforms),
          description: 'List of streaming platforms to display on feed cards (JSON array of platform names)',
          updated_by: currentUserId
        }, {
          onConflict: 'setting_key'
        })

      if (error) {
        console.error('Error updating setting:', error)
        alert(`Failed to update setting: ${error.message}`)
        checkAdminAndLoadSettings()
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Failed to save setting')
      checkAdminAndLoadSettings()
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

  const enabledCount = platforms.filter(p => p.enabled).length

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Streaming Platforms
        </h1>
        <p style={{ color: '#888' }}>
          Control which streaming platforms appear on feed cards. Only enabled platforms will be displayed.
        </p>
      </div>

      {/* Bulk Actions */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            {enabledCount} of {platforms.length} platforms enabled
          </div>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>
            Toggle all platforms on or off
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleToggleAll(true)}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Enable All
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Platforms List */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
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
            <Tv size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              Platform List
            </h2>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>
              Click to toggle platforms on/off
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {platforms.map((platform) => (
            <div
              key={platform.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: colors.cardBorder,
                background: colors.cardBg,
                gap: '1rem'
              }}
            >
              <span style={{
                fontWeight: '500',
                color: colors.textPrimary,
                flex: 1
              }}>
                {platform.name}
              </span>
              <div style={{
                background: colors.cardBg,
                border: colors.cardBorder,
                borderRadius: '8px',
                padding: '0.25rem',
                display: 'flex',
                gap: '0.25rem',
                boxShadow: colors.isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <button
                  onClick={() => !platform.enabled && handleTogglePlatform(platform.name)}
                  disabled={saving || platform.enabled}
                  style={{
                    padding: '0.5rem 1rem',
                    background: platform.enabled ? colors.brandPink : 'transparent',
                    color: platform.enabled ? 'white' : colors.textSecondary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: (saving || platform.enabled) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: (saving || platform.enabled) ? 0.6 : 1
                  }}
                >
                  ON
                </button>
                <button
                  onClick={() => platform.enabled && handleTogglePlatform(platform.name)}
                  disabled={saving || !platform.enabled}
                  style={{
                    padding: '0.5rem 1rem',
                    background: !platform.enabled ? colors.brandPink : 'transparent',
                    color: !platform.enabled ? 'white' : colors.textSecondary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: (saving || !platform.enabled) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: (saving || !platform.enabled) ? 0.6 : 1
                  }}
                >
                  OFF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#3b82f610',
        border: '1px solid #3b82f630',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#3b82f6'
      }}>
        <strong>Note:</strong> Only platforms that are enabled will appear on feed cards. 
        Platforms not in this list will be automatically added when discovered from TMDB data, 
        but will be disabled by default.
      </div>
    </div>
  )
}


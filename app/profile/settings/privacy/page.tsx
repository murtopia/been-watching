'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function PrivacySettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)

  const router = useRouter()
  const colors = useThemeColors()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setIsPrivate(profileData.is_private || false)
    }

    setLoading(false)
  }

  const handlePrivacyToggle = async () => {
    if (!user) return

    setSaving(true)
    const newValue = !isPrivate

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_private: newValue })
        .eq('id', user.id)

      if (error) throw error

      setIsPrivate(newValue)
      setMessage({
        type: 'success',
        text: newValue ? 'Account is now private' : 'Account is now public'
      })

      // Reload profile
      await checkUser()
    } catch (error: any) {
      console.error('Error updating privacy:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update privacy setting' })
    } finally {
      setSaving(false)
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bgGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: `4px solid ${colors.goldAccent}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bgGradient, paddingBottom: '100px' }}>
      <AppHeader profile={profile} hideOnScroll />

      <div style={{ padding: '1rem', maxWidth: '398px', margin: '0 auto', marginTop: '60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.push('/profile/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.goldAccent,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            ← Settings
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0.5rem 0',
            color: colors.textPrimary
          }}>
            Privacy & Security
          </h1>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
            Control who can see your activity and secure your account
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div style={{
            padding: '1rem',
            background: message.type === 'success' ? '#10b98120' : '#ef444420',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: message.type === 'success' ? '#10b981' : '#ef4444'
          }}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{message.text}</span>
          </div>
        )}

        {/* Profile Visibility Card */}
        <div style={{
          background: 'transparent',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            PROFILE VISIBILITY
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                marginBottom: '0.25rem',
                color: colors.textPrimary
              }}>
                Private Account
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                Only approved followers can see your activity and ratings
              </div>
            </div>

            {/* Toggle Switch */}
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '48px',
              height: '28px',
              flexShrink: 0,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={handlePrivacyToggle}
                disabled={saving}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: saving ? 'not-allowed' : 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isPrivate ? colors.goldAccent : (colors.isDark ? 'rgba(255,255,255,0.2)' : '#ccc'),
                borderRadius: '28px',
                transition: '0.3s',
                opacity: saving ? 0.6 : 1
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '22px',
                  width: '22px',
                  left: isPrivate ? '23px' : '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* Two-Factor Authentication Card */}
        <div style={{
          background: 'transparent',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            TWO-FACTOR AUTHENTICATION
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px',
              border: colors.cardBorder,
              marginBottom: '0.5rem'
            }}>
              <span style={{
                flex: 1,
                color: colors.textSecondary,
                fontSize: '0.9375rem',
                fontWeight: 500
              }}>
                Status: Disabled
              </span>
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              margin: '0.5rem 0 1rem 0'
            }}>
              Requires phone number • Add extra security to your account
            </p>
            <button
              onClick={() => alert('2FA setup coming soon! Add phone number first in Contact Information.')}
              style={{
                padding: '0.75rem 1rem',
                background: colors.buttonBg,
                border: colors.buttonBorder,
                borderRadius: '8px',
                color: colors.goldAccent,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Enable 2FA →
            </button>
          </div>
        </div>

        {/* Active Sessions Card */}
        <div style={{
          background: 'transparent',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            ACTIVE SESSIONS
          </h3>

          <div style={{
            padding: '1rem',
            background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: '8px',
            border: colors.cardBorder,
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>💻</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: colors.textPrimary
                }}>
                  Current Session
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                  Active now
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Session management coming soon!')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '8px',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Log Out All Other Sessions
          </button>
        </div>

        {/* Data & Privacy Card */}
        <div style={{
          background: 'transparent',
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            DATA & PRIVACY
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => alert('Download data feature coming soon!')}
              style={{
                padding: '0.875rem 1rem',
                background: colors.buttonBg,
                border: colors.buttonBorder,
                borderRadius: '8px',
                color: colors.textPrimary,
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Download My Data</span>
              <span style={{ color: colors.goldAccent, fontSize: '0.875rem' }}>→</span>
            </button>

            <button
              onClick={() => alert('Privacy Policy will open here')}
              style={{
                padding: '0.875rem 1rem',
                background: colors.buttonBg,
                border: colors.buttonBorder,
                borderRadius: '8px',
                color: colors.textPrimary,
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Privacy Policy</span>
              <span style={{ color: colors.goldAccent, fontSize: '0.875rem' }}>→</span>
            </button>

            <button
              onClick={() => alert('Terms of Service will open here')}
              style={{
                padding: '0.875rem 1rem',
                background: colors.buttonBg,
                border: colors.buttonBorder,
                borderRadius: '8px',
                color: colors.textPrimary,
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Terms of Service</span>
              <span style={{ color: colors.goldAccent, fontSize: '0.875rem' }}>→</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form fields
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

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
    setEmail(user.email || '')

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setUsername(profileData.username || '')
      setDisplayName(profileData.display_name || '')
      setBio(profileData.bio || '')
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    setMessage(null)

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          display_name: displayName,
          bio
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setMessage({ type: 'success', text: 'Account settings saved successfully!' })

      // Reload profile
      await checkUser()
    } catch (error: any) {
      console.error('Error saving account settings:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' })
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
          border: `4px solid ${colors.brandPink}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bgGradient, paddingBottom: '100px' }}>
      <AppHeader />

      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.push('/profile/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.brandPink,
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
            Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
            Manage your account information
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

        {/* Form Card */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              EMAIL ADDRESS
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px',
              border: colors.cardBorder
            }}>
              <span style={{ flex: 1, color: colors.textPrimary, fontSize: '0.9375rem' }}>
                {email}
              </span>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              margin: '0.5rem 0 0 0'
            }}>
              Verified • Used for login
            </p>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.brandPink}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
            <p style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              margin: '0.5rem 0 0 0'
            }}>
              beenwatching.com/{username}
            </p>
          </div>

          {/* Display Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.brandPink}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              BIO
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                fontSize: '0.9375rem',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'all 0.2s',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.brandPink}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: saving ? colors.textSecondary : colors.brandPink,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Password Change Card */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '1rem',
          backdropFilter: 'blur(20px)'
        }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: '0.5rem'
          }}>
            PASSWORD
          </label>
          <button
            onClick={() => alert('Password change flow coming soon!')}
            style={{
              width: '100%',
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
            <span>••••••••••••</span>
            <span style={{ color: colors.brandPink, fontSize: '0.875rem' }}>Change Password →</span>
          </button>
          <p style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            margin: '0.5rem 0 0 0'
          }}>
            Last changed recently
          </p>
        </div>

        {/* Danger Zone */}
        <div style={{
          background: colors.cardBg,
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#ef4444',
            margin: '0 0 0.5rem 0'
          }}>
            ⚠️ DANGER ZONE
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            margin: '0 0 1rem 0'
          }}>
            This action cannot be undone
          </p>
          <button
            onClick={() => alert('Account deletion flow coming soon!')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Delete Account →
          </button>
        </div>
      </div>

      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import { CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react'

export default function ContactSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)

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
      setPhoneNumber(profileData.phone_number || '')
      setPhoneVerified(profileData.phone_verified || false)
      setEmailNotifications(profileData.email_notifications !== false) // Default to true
    }

    setLoading(false)
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      // Extract digits only for storage
      const digitsOnly = phoneNumber.replace(/\D/g, '')

      // Validate phone number (must be 10 digits or empty)
      if (digitsOnly && digitsOnly.length !== 10) {
        setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' })
        setSaving(false)
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: digitsOnly || null,
          phone_verified: digitsOnly ? phoneVerified : false,
          email_notifications: emailNotifications
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Contact settings saved successfully!' })

      // Reload profile
      await checkUser()
    } catch (error: any) {
      console.error('Error saving contact settings:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save contact settings' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleVerifyPhone = async () => {
    // TODO: Implement phone verification flow
    alert('Phone verification coming soon! This will send an SMS code to verify your number.')
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
            Contact Information
          </h1>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
            Manage how we can reach you
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

        {/* Email Card */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            EMAIL ADDRESS
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: '8px',
            border: colors.cardBorder
          }}>
            <Mail size={20} style={{ color: colors.textSecondary, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: '0.125rem'
              }}>
                {user?.email}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                Primary contact method
              </div>
            </div>
            <span style={{
              padding: '0.25rem 0.5rem',
              background: '#10b98120',
              color: '#10b981',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              Verified
            </span>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            margin: '0.75rem 0 0 0'
          }}>
            Email is managed through your account authentication and cannot be changed here.
          </p>
        </div>

        {/* Phone Number Card */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            PHONE NUMBER
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              Mobile Number
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Phone size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textSecondary
                }} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    border: colors.cardBorder,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    color: colors.textPrimary,
                    outline: 'none'
                  }}
                />
              </div>
              {phoneNumber && !phoneVerified && (
                <button
                  onClick={handleVerifyPhone}
                  style={{
                    padding: '0.875rem 1rem',
                    background: colors.brandPink,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Verify
                </button>
              )}
            </div>
            {phoneVerified && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <CheckCircle size={14} />
                Verified
              </div>
            )}
          </div>

          <div style={{
            padding: '1rem',
            background: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: colors.textPrimary,
              margin: 0,
              lineHeight: 1.5
            }}>
              <strong>Why add a phone number?</strong><br />
              • Enable SMS notifications for announcements<br />
              • Set up two-factor authentication<br />
              • Account recovery option<br />
              • Get important security alerts
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '1rem',
            background: saving ? colors.textSecondary : colors.brandPink,
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            marginBottom: '1rem'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import { CheckCircle, AlertCircle, Mail, MessageSquare, Bell } from 'lucide-react'

export default function NotificationsSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Email Notifications
  const [emailWeeklyRecap, setEmailWeeklyRecap] = useState(true)
  const [emailMonthlyRecap, setEmailMonthlyRecap] = useState(true)
  const [emailAnnouncements, setEmailAnnouncements] = useState(true)

  // SMS Notifications
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [smsAnnouncements, setSmsAnnouncements] = useState(false)

  // Push Notifications (in-app)
  const [pushFriendActivity, setPushFriendActivity] = useState(true)
  const [pushNewFollower, setPushNewFollower] = useState(true)
  const [pushRatings, setPushRatings] = useState(true)

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

      // Email preferences (default to true)
      setEmailWeeklyRecap(profileData.email_weekly_recap !== false)
      setEmailMonthlyRecap(profileData.email_monthly_recap !== false)
      setEmailAnnouncements(profileData.email_announcements !== false)

      // SMS preferences (default to false)
      setSmsOptIn(profileData.sms_opt_in || false)
      setSmsAnnouncements(profileData.sms_announcements || false)

      // Push preferences (default to true)
      setPushFriendActivity(profileData.push_friend_activity !== false)
      setPushNewFollower(profileData.push_new_follower !== false)
      setPushRatings(profileData.push_ratings !== false)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          // Email preferences
          email_weekly_recap: emailWeeklyRecap,
          email_monthly_recap: emailMonthlyRecap,
          email_announcements: emailAnnouncements,

          // SMS preferences
          sms_opt_in: smsOptIn,
          sms_announcements: smsAnnouncements,
          sms_opt_in_date: smsOptIn && !profile.sms_opt_in ? new Date().toISOString() : profile.sms_opt_in_date,

          // Push preferences
          push_friend_activity: pushFriendActivity,
          push_new_follower: pushNewFollower,
          push_ratings: pushRatings
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Notification preferences saved!' })

      // Reload profile
      await checkUser()
    } catch (error: any) {
      console.error('Error saving notification preferences:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save preferences' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <label style={{
      position: 'relative',
      display: 'inline-block',
      width: '48px',
      height: '28px',
      flexShrink: 0,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span style={{
        position: 'absolute',
        cursor: disabled ? 'not-allowed' : 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: checked ? colors.brandBlue : (colors.isDark ? 'rgba(255,255,255,0.2)' : '#ccc'),
        borderRadius: '28px',
        transition: '0.3s',
        opacity: disabled ? 0.5 : 1
      }}>
        <span style={{
          position: 'absolute',
          content: '""',
          height: '22px',
          width: '22px',
          left: checked ? '23px' : '3px',
          bottom: '3px',
          background: 'white',
          borderRadius: '50%',
          transition: '0.3s'
        }}></span>
      </span>
    </label>
  )

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

  const hasPhoneNumber = profile?.phone_number && profile?.phone_number.length > 0

  return (
    <div style={{ minHeight: '100vh', background: colors.bgGradient, paddingBottom: '100px' }}>
      <AppHeader profile={profile} hideOnScroll />

      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', marginTop: '60px' }}>
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
            Notifications
          </h1>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
            Choose how and when you want to be notified
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

        {/* Email Notifications */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Mail size={20} style={{ color: colors.brandPink }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0
            }}>
              EMAIL NOTIFICATIONS
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Weekly Recap */}
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
                  Weekly Recap
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Every Friday morning: friend activity, new followers, trending shows
                </div>
              </div>
              <ToggleSwitch
                checked={emailWeeklyRecap}
                onChange={() => setEmailWeeklyRecap(!emailWeeklyRecap)}
              />
            </div>

            {/* Monthly Recap */}
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
                  Monthly Recap
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  First of each month: your stats, watch history, announcements
                </div>
              </div>
              <ToggleSwitch
                checked={emailMonthlyRecap}
                onChange={() => setEmailMonthlyRecap(!emailMonthlyRecap)}
              />
            </div>

            {/* Announcements */}
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
                  Product Announcements
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  New features, updates, and important platform news
                </div>
              </div>
              <ToggleSwitch
                checked={emailAnnouncements}
                onChange={() => setEmailAnnouncements(!emailAnnouncements)}
              />
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <MessageSquare size={20} style={{ color: colors.brandPink }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0
            }}>
              SMS NOTIFICATIONS
            </h3>
          </div>

          {!hasPhoneNumber ? (
            <div style={{
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px',
              border: colors.cardBorder,
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 1rem 0' }}>
                Add a phone number to enable SMS notifications
              </p>
              <button
                onClick={() => router.push('/profile/settings/contact')}
                style={{
                  padding: '0.75rem 1rem',
                  background: colors.brandPink,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add Phone Number →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* SMS Opt-in */}
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
                    Enable SMS Notifications
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                    Opt in to receive text messages (standard rates may apply)
                  </div>
                </div>
                <ToggleSwitch
                  checked={smsOptIn}
                  onChange={() => {
                    setSmsOptIn(!smsOptIn)
                    if (!smsOptIn === false) {
                      setSmsAnnouncements(false)
                    }
                  }}
                />
              </div>

              {/* SMS Announcements */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                opacity: smsOptIn ? 1 : 0.5
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    marginBottom: '0.25rem',
                    color: colors.textPrimary
                  }}>
                    Important Announcements
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                    Occasional texts for major updates and announcements
                  </div>
                </div>
                <ToggleSwitch
                  checked={smsAnnouncements}
                  onChange={() => setSmsAnnouncements(!smsAnnouncements)}
                  disabled={!smsOptIn}
                />
              </div>

              {/* TCPA Compliance Notice */}
              {smsOptIn && (
                <div style={{
                  padding: '0.75rem',
                  background: colors.isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${colors.isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
                }}>
                  <p style={{
                    fontSize: '0.7rem',
                    color: colors.textSecondary,
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    By opting in, you consent to receive SMS messages from Been Watching. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time. Reply HELP for help.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* In-App Notifications */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Bell size={20} style={{ color: colors.brandPink }} />
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0
            }}>
              IN-APP NOTIFICATIONS
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Friend Activity */}
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
                  Friend Activity
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  When friends watch shows or leave ratings
                </div>
              </div>
              <ToggleSwitch
                checked={pushFriendActivity}
                onChange={() => setPushFriendActivity(!pushFriendActivity)}
              />
            </div>

            {/* New Followers */}
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
                  New Followers
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  When someone follows you
                </div>
              </div>
              <ToggleSwitch
                checked={pushNewFollower}
                onChange={() => setPushNewFollower(!pushNewFollower)}
              />
            </div>

            {/* Ratings & Comments */}
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
                  Ratings & Comments
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  When friends rate the same shows as you
                </div>
              </div>
              <ToggleSwitch
                checked={pushRatings}
                onChange={() => setPushRatings(!pushRatings)}
              />
            </div>
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
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

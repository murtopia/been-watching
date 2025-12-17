'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import {
  User,
  Phone,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  ChevronRight,
  LogOut
} from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
    }
    
    setLoading(false)
  }

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) return

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/auth')
    }
  }

  const settingsSections = [
    {
      icon: User,
      title: 'Account',
      description: 'Email, username, password',
      href: '/profile/settings/account'
    },
    {
      icon: Phone,
      title: 'Contact Information',
      description: 'Phone number, verification',
      href: '/profile/settings/contact'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Email, SMS, push preferences',
      href: '/profile/settings/notifications'
    },
    {
      icon: Lock,
      title: 'Privacy & Security',
      description: 'Private account, 2FA, sessions',
      href: '/profile/settings/privacy'
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Theme, display options',
      href: '/profile/settings/appearance'
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      description: 'FAQ, contact us, about',
      href: '/profile/settings/help'
    }
  ]

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

      <div style={{ padding: '1rem', maxWidth: '398px', margin: '0 auto', marginTop: '70px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.back()}
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
            ← Back
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0.5rem 0',
            color: colors.textPrimary
          }}>
            Settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.href}
                onClick={() => router.push(section.href)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.goldAccent
                  e.currentTarget.style.background = colors.goldGlassBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderColor
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: colors.surfaceBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} color={colors.textSecondary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: colors.textPrimary,
                    marginBottom: '0.125rem'
                  }}>
                    {section.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                    {section.description}
                  </div>
                </div>
                <ChevronRight size={20} color={colors.textSecondary} />
              </button>
            )
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '2rem',
            background: 'transparent',
            border: `1px solid ${colors.error}`,
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: colors.error,
            fontWeight: 600,
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.error
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = colors.error
          }}
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>

      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

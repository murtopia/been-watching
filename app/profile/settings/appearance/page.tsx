'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useTheme } from '@/contexts/ThemeContext'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import { Monitor, Sun, Moon, Check } from 'lucide-react'

export default function AppearanceSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const colors = useThemeColors()
  const { themeMode, setThemeMode } = useTheme()
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

  const themeOptions = [
    {
      value: 'auto' as const,
      icon: Monitor,
      title: 'System',
      description: 'Match your device settings'
    },
    {
      value: 'light' as const,
      icon: Sun,
      title: 'Light',
      description: 'Always use light theme'
    },
    {
      value: 'dark' as const,
      icon: Moon,
      title: 'Dark',
      description: 'Always use dark theme'
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
      <AppHeader profile={profile} hideOnScroll />

      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', marginTop: '60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.back()}
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
            ← Back to Settings
          </button>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            margin: '0.5rem 0',
            color: colors.textPrimary
          }}>
            Appearance
          </h1>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
            Customize how Been Watching looks
          </p>
        </div>

        {/* Theme Selection */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '16px',
          padding: '1.25rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            marginBottom: '1rem'
          }}>
            Theme
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = themeMode === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => setThemeMode(option.value)}
                  style={{
                    background: isSelected 
                      ? `linear-gradient(135deg, ${colors.brandPink}15 0%, ${colors.brandOrange}15 100%)`
                      : 'transparent',
                    border: isSelected 
                      ? `2px solid ${colors.brandPink}`
                      : `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isSelected 
                      ? colors.brandGradient
                      : colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon 
                      size={22} 
                      color={isSelected ? '#fff' : colors.textSecondary} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: '0.125rem'
                    }}>
                      {option.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: colors.textSecondary }}>
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: colors.brandGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={14} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}


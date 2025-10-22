'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'

interface AppHeaderProps {
  profile?: any
  showThemeToggle?: boolean
  showLogout?: boolean
  onLogout?: () => void
}

export default function AppHeader({
  profile,
  showThemeToggle = false,
  showLogout = false,
  onLogout
}: AppHeaderProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  // Theme-based colors
  const isDark = resolvedTheme === 'dark'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)'
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'
  const backdropBlur = 'blur(20px)'

  return (
    <div style={{
      padding: '1rem 1.5rem',
      background: cardBg,
      border: cardBorder,
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      maxWidth: '600px',
      margin: '0 auto 0.5rem',
      backdropFilter: backdropBlur,
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {/* Logo */}
        <h1 style={{
          background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.25rem',
          fontWeight: '700',
          margin: 0
        }}>
          Been Watching
        </h1>

        {/* Right side actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {showThemeToggle && <ThemeToggle />}

          {showLogout && onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          )}

          {profile && (
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.5rem'
              }}
            >
              {profile.avatar_url ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    fontSize: '1rem'
                  }}>
                    ✨
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '700'
                  }}>
                    {profile.display_name?.[0] || '?'}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    fontSize: '1rem'
                  }}>
                    ✨
                  </div>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

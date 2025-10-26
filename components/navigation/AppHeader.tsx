'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/theme/ThemeToggle'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

interface AppHeaderProps {
  profile?: any
  showThemeToggle?: boolean
  showLogout?: boolean
  showNotifications?: boolean
  onLogout?: () => void
}

export default function AppHeader({
  profile,
  showThemeToggle = false,
  showLogout = false,
  showNotifications = true,
  onLogout
}: AppHeaderProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  // Load unread notification count
  useEffect(() => {
    if (profile && showNotifications) {
      loadNotificationCount()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotificationCount, 30000)
      return () => clearInterval(interval)
    }
  }, [profile, showNotifications])

  const loadNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count')
      const data = await response.json()
      setNotificationCount(data.count || 0)
    } catch (error) {
      console.error('Error loading notification count:', error)
    }
  }

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown)
  }

  const handleNotificationClose = () => {
    setShowNotificationDropdown(false)
    // Reload count after closing (in case notifications were marked as read)
    loadNotificationCount()
  }

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <img
            src="/bw-logo.png"
            alt="Been Watching"
            style={{
              height: '40px',
              width: 'auto'
            }}
          />
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
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
          {showThemeToggle && <ThemeToggle />}

          {/* Notification Icon */}
          {showNotifications && profile && (
            <button
              onClick={handleNotificationClick}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.5rem'
              }}
            >
              ✨
              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                  padding: '0.125rem 0.375rem',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <NotificationDropdown
              isOpen={showNotificationDropdown}
              onClose={handleNotificationClose}
            />
          )}

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

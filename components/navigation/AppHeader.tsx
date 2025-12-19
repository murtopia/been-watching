'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState, useRef, useCallback } from 'react'
import ThemeToggle from '@/components/theme/ThemeToggle'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'
import Icon from '@/components/ui/Icon'
import { useThemeColors } from '@/hooks/useThemeColors'

interface AppHeaderProps {
  profile?: any
  showThemeToggle?: boolean
  showLogout?: boolean
  showNotifications?: boolean
  onLogout?: () => void
  /** Instagram-style: hide on scroll down, show on scroll up */
  hideOnScroll?: boolean
}

export default function AppHeader({
  profile,
  showThemeToggle = false,
  showLogout = false,
  showNotifications = true,
  onLogout,
  hideOnScroll = false
}: AppHeaderProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Instagram-style scroll behavior
  const handleScroll = useCallback(() => {
    if (!hideOnScroll) return
    
    const currentScrollY = window.scrollY
    const scrollDelta = currentScrollY - lastScrollY.current
    
    // Only trigger if scrolled more than 5px (debounce small movements)
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0 && currentScrollY > 60) {
        // Scrolling down & past header height - hide
        setHeaderVisible(false)
      } else if (scrollDelta < 0) {
        // Scrolling up - show
        setHeaderVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    
    ticking.current = false
  }, [hideOnScroll])

  useEffect(() => {
    if (!hideOnScroll) return
    
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(handleScroll)
        ticking.current = true
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideOnScroll, handleScroll])

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
  const colors = useThemeColors()
  const isDark = resolvedTheme === 'dark'
  const cardBg = colors.glassBg
  const cardBorder = colors.goldBorder
  const backdropBlur = 'blur(20px)'
  
  // Bell color - gold when notifications exist, white otherwise
  const bellColor = notificationCount > 0 
    ? colors.goldAccent 
    : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)')

  return (
    <>
      {/* Bell animation styles */}
      <style jsx global>{`
        /* Bell rings for ~0.8s, then pauses for ~4.2s = 5s total cycle */
        @keyframes bellRingWithPause {
          0% { transform: rotate(0deg); }
          2% { transform: rotate(14deg); }
          4% { transform: rotate(-12deg); }
          6% { transform: rotate(10deg); }
          8% { transform: rotate(-8deg); }
          10% { transform: rotate(6deg); }
          12% { transform: rotate(-4deg); }
          14% { transform: rotate(2deg); }
          16% { transform: rotate(0deg); }
          16.01%, 100% { transform: rotate(0deg); }
        }
        
        .bell-active {
          animation: bellRingWithPause 5s ease-in-out 2s infinite;
          transform-origin: top center;
        }
      `}</style>
    <div style={{
      padding: '1rem 1.5rem',
      background: cardBg,
      borderBottom: cardBorder,
      backdropFilter: backdropBlur,
      WebkitBackdropFilter: backdropBlur,
      position: hideOnScroll ? 'fixed' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      transform: hideOnScroll 
        ? `translateY(${headerVisible ? '0' : '-100%'})`
        : undefined,
      transition: hideOnScroll ? 'transform 0.3s ease-out' : undefined,
      zIndex: 100,
      width: '100%'
    }}>
      {/* Inner content aligned to card width (398px) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '398px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <img
            src="/BW_header_v2.png"
            alt="Been Watching"
            style={{
              height: '119px',
              width: 'auto'
            }}
          />
          <h1 style={{
            color: colors.textPrimary,
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
              className={notificationCount > 0 ? 'bell-active' : ''}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="bell" size={24} color={bellColor} />
              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
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
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {profile.avatar_url ? (
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
              ) : (
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
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

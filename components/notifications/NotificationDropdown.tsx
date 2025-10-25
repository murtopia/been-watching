'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'follow' | 'like_activity' | 'comment' | 'mentioned' | 'note_liked' | 'note_commented'
  actor: {
    username: string
    display_name: string
    avatar_url?: string
  }
  target_type?: string
  target_id?: string
  activity_id?: string
  activity?: any
  read: boolean
  created_at: string
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isDark = resolvedTheme === 'dark'

  // Theme colors
  const bgColor = isDark ? 'rgba(26, 26, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDark ? '#ffffff' : '#000000'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666'
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const unreadBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(233, 77, 136, 0.05)'

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=20')
      const data = await response.json()

      if (data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notification.id] })
      })
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'follow':
        router.push(`/${notification.actor.username}`)
        break
      case 'like_activity':
      case 'comment':
        // Navigate to activity feed (could scroll to specific activity in future)
        router.push('/')
        break
      default:
        break
    }

    onClose()
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return 'started following you'
      case 'like_activity':
        return 'liked your activity'
      case 'comment':
        return 'commented on your activity'
      case 'mentioned':
        return 'mentioned you'
      case 'note_liked':
        return 'liked your note'
      case 'note_commented':
        return 'commented on your note'
      default:
        return 'interacted with your content'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        right: 0,
        width: '380px',
        maxWidth: '90vw',
        maxHeight: '500px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: `1px solid ${borderColor}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: '700',
          color: textPrimary
        }}>
          Notifications
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#e94d88',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem'
              }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: textSecondary,
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = textSecondary
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{
        maxHeight: '420px',
        overflowY: 'auto'
      }}>
        {loading ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: textSecondary
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              margin: '0 auto',
              border: '3px solid rgba(233, 77, 136, 0.3)',
              borderTop: '3px solid #e94d88',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: textSecondary
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
            <div style={{ fontSize: '0.9375rem' }}>No notifications yet</div>
            <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem', color: textSecondary }}>
              Start following friends to see their activity!
            </div>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                padding: '0.875rem 1.25rem',
                background: !notification.read ? unreadBg : 'transparent',
                borderBottom: `1px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = hoverBg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = !notification.read ? unreadBg : 'transparent'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: notification.actor.avatar_url
                  ? 'transparent'
                  : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '700',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                {notification.actor.avatar_url ? (
                  <img
                    src={notification.actor.avatar_url}
                    alt={notification.actor.display_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(notification.actor.display_name)
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: textPrimary,
                  marginBottom: '0.25rem',
                  lineHeight: '1.4'
                }}>
                  <strong>@{notification.actor.username}</strong>
                  {' '}
                  <span style={{ color: textSecondary }}>
                    {getNotificationText(notification)}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: textSecondary
                }}>
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </div>

              {/* Unread indicator */}
              {!notification.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                  flexShrink: 0,
                  marginTop: '0.5rem'
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

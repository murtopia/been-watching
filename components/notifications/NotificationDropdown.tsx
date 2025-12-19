'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'

interface Notification {
  id: string
  type: 'follow' | 'follow_request' | 'like_activity' | 'comment' | 'mentioned' | 'note_liked' | 'note_commented' | 'announcement' | 'feature_release' | 'maintenance' | 'welcome'
  actor?: {
    username: string
    display_name: string
    avatar_url?: string
    id?: string
  }
  target_type?: string
  target_id?: string
  activity_id?: string
  activity?: any
  read: boolean
  created_at: string
  metadata?: {
    title?: string
    message?: string
    icon?: string
    action?: {
      type: 'internal' | 'external'
      url: string
      text: string
    }
    announcementId?: string
  }
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const colors = useThemeColors()

  const isDark = resolvedTheme === 'dark'

  // Theme colors
  const bgColor = isDark ? 'rgba(26, 26, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDark ? '#ffffff' : '#000000'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666'
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const unreadBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(233, 77, 136, 0.05)'

  // Handle approving a follow request
  const handleApproveRequest = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.actor?.id) return
    
    setProcessingRequests(prev => new Set([...prev, notification.id]))
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update follow status to accepted
      await supabase
        .from('follows')
        .update({ status: 'accepted' })
        .eq('follower_id', notification.actor.id)
        .eq('following_id', user.id)

      // Create a notification for the requester that they were accepted
      await supabase
        .from('notifications')
        .insert({
          user_id: notification.actor.id,
          actor_id: user.id,
          type: 'follow',
          target_type: 'profile',
          target_id: notification.actor.id
        })

      // Remove this notification from the list
      setNotifications(prev => prev.filter(n => n.id !== notification.id))

      // Delete the follow_request notification
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id)
    } catch (error) {
      console.error('Error approving follow request:', error)
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(notification.id)
        return newSet
      })
    }
  }

  // Handle denying a follow request
  const handleDenyRequest = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.actor?.id) return
    
    setProcessingRequests(prev => new Set([...prev, notification.id]))
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete the pending follow record
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', notification.actor.id)
        .eq('following_id', user.id)
        .eq('status', 'pending')

      // Remove this notification from the list
      setNotifications(prev => prev.filter(n => n.id !== notification.id))

      // Delete the notification
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id)
    } catch (error) {
      console.error('Error denying follow request:', error)
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(notification.id)
        return newSet
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  // Auto-mark notifications as read after viewing for 3 seconds
  useEffect(() => {
    if (!isOpen || notifications.length === 0) return

    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length === 0) return

    const timer = setTimeout(() => {
      // Mark all currently visible unread notifications as read
      const unreadIds = unreadNotifications.map(n => n.id)

      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadIds })
      }).then(() => {
        // Update local state
        setNotifications(prev => prev.map(n =>
          unreadIds.includes(n.id) ? { ...n, read: true } : n
        ))
      }).catch(error => {
        console.error('Error auto-marking notifications as read:', error)
      })
    }, 3000) // 3 seconds

    return () => clearTimeout(timer)
  }, [isOpen, notifications])

  // Close dropdown when clicking outside (but not on the bell button - that toggles via its own handler)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Ignore clicks on the notification bell button (it has its own toggle logic)
      if (target.closest('[data-notification-bell="true"]')) {
        return
      }
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
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

    // Handle announcements - check for action button
    if (isAnnouncement(notification)) {
      if (notification.metadata?.action) {
        const { type, url } = notification.metadata.action
        if (type === 'internal') {
          router.push(url)
          onClose()
        } else if (type === 'external') {
          window.open(url, '_blank')
        }
      }
      // If no action, just keep dropdown open or close it
      return
    }

    // Check if this is the invite earned notification
    if (isSystemNotification(notification) && notification.type === 'mentioned') {
      // Navigate to profile page to see their invite code
      router.push('/profile')
      onClose()
      return
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'follow':
        router.push(`/${notification.actor?.username}`)
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

  const isSystemNotification = (notification: Notification) => {
    return !notification.actor && (notification.type === 'mentioned' || notification.type === 'announcement' || notification.type === 'feature_release' || notification.type === 'maintenance' || notification.type === 'welcome')
  }

  const isAnnouncement = (notification: Notification) => {
    return notification.type === 'announcement' || notification.type === 'feature_release' || notification.type === 'maintenance' || notification.type === 'welcome'
  }

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return 'started following you'
      case 'follow_request':
        return 'wants to follow you'
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
                color: colors.goldAccent,
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
              border: `3px solid ${colors.goldAccent}33`,
              borderTop: `3px solid ${colors.goldAccent}`,
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
          notifications.map((notification) => {
            const isSystem = isSystemNotification(notification)

            return (
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
                {/* Avatar or System Icon */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isSystem
                    ? 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)'
                    : notification.actor?.avatar_url
                    ? 'transparent'
                    : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: isSystem ? '1.25rem' : '0.875rem',
                  fontWeight: '700',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {isSystem ? (
                    isAnnouncement(notification) ? notification.metadata?.icon || '📢' : '🎉'
                  ) : notification.actor?.avatar_url ? (
                    <img
                      src={notification.actor.avatar_url}
                      alt={notification.actor.display_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(notification.actor?.display_name || 'U')
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isSystem ? (
                    <>
                      <div style={{
                        fontSize: '0.875rem',
                        color: textPrimary,
                        marginBottom: '0.25rem',
                        lineHeight: '1.4',
                        fontWeight: '700'
                      }}>
                        {isAnnouncement(notification)
                          ? notification.metadata?.title || 'Announcement'
                          : 'You earned an invite! 🎉'
                        }
                      </div>
                      <div style={{
                        fontSize: '0.8125rem',
                        color: textSecondary,
                        marginBottom: '0.5rem',
                        lineHeight: '1.4'
                      }}>
                        {isAnnouncement(notification)
                          ? notification.metadata?.message || ''
                          : 'You completed your profile and earned an invite code to share with a friend!'
                        }
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        fontSize: '0.875rem',
                        color: textPrimary,
                        marginBottom: '0.25rem',
                        lineHeight: '1.4'
                      }}>
                        <strong>@{notification.actor?.username}</strong>
                        {' '}
                        <span style={{ color: textSecondary }}>
                          {getNotificationText(notification)}
                        </span>
                      </div>
                      {/* Approve/Deny buttons for follow requests */}
                      {notification.type === 'follow_request' && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '0.5rem', 
                          marginTop: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <button
                            onClick={(e) => handleApproveRequest(notification, e)}
                            disabled={processingRequests.has(notification.id)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: colors.goldAccent,
                              color: '#000000',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: processingRequests.has(notification.id) ? 'not-allowed' : 'pointer',
                              opacity: processingRequests.has(notification.id) ? 0.6 : 1
                            }}
                          >
                            {processingRequests.has(notification.id) ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={(e) => handleDenyRequest(notification, e)}
                            disabled={processingRequests.has(notification.id)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: colors.cardBg,
                              color: colors.textSecondary,
                              border: colors.cardBorder,
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: processingRequests.has(notification.id) ? 'not-allowed' : 'pointer',
                              opacity: processingRequests.has(notification.id) ? 0.6 : 1
                            }}
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </>
                  )}
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
            )
          })
        )}
      </div>
    </div>
  )
}

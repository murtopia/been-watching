'use client'

import { useEffect, useRef } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Icon } from '@/components/ui/Icon'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

interface MutualFriendsModalProps {
  isOpen: boolean
  onClose: () => void
  friends: Profile[]
  onFriendClick?: (username: string) => void
}

export default function MutualFriendsModal({
  isOpen,
  onClose,
  friends,
  onFriendClick
}: MutualFriendsModalProps) {
  const colors = useThemeColors()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and lock
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Restore scroll position
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        touchAction: 'none'
      }}
      onClick={onClose}
      onTouchMove={(e) => {
        // Prevent background scroll on touch
        if (scrollRef.current && !scrollRef.current.contains(e.target as Node)) {
          e.preventDefault()
        }
      }}
    >
      <div
        style={{
          background: colors.isDark ? '#1a1a1a' : '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '340px',
          height: '400px', // Fixed height for consistency
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: colors.goldBorder,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: `1px solid ${colors.dividerColor}`
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.textPrimary
          }}>
            Mutual Friends ({friends.length})
          </h3>
          <button
            onClick={onClose}
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
            <Icon name="close-c-default" size={28} />
          </button>
        </div>

        {/* Friends List */}
        <div 
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0.5rem 0',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
        >
          {friends.map((friend) => (
            <div
              key={friend.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: onFriendClick ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
              onClick={() => {
                if (onFriendClick) {
                  onFriendClick(friend.username)
                  onClose()
                }
              }}
              onMouseEnter={(e) => {
                if (onFriendClick) {
                  e.currentTarget.style.background = colors.cardBgHover
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: friend.avatar_url ? 'transparent' : colors.goldAccent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#000000',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                {friend.avatar_url ? (
                  <img 
                    src={friend.avatar_url} 
                    alt={friend.display_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  getInitials(friend.display_name)
                )}
              </div>

              {/* Name & Username */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: colors.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {friend.display_name}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: colors.textSecondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  @{friend.username}
                </div>
              </div>
            </div>
          ))}

          {friends.length === 0 && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: colors.textSecondary
            }}>
              No mutual friends
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


'use client'

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.isDark ? '#1a1a1a' : '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '340px',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: colors.goldBorder
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
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 0'
        }}>
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


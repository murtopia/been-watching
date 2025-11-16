/**
 * Shared Card Elements
 *
 * Reusable components for feed cards
 */

import React from 'react'
import { Icon } from '@/components/ui/Icon'
import { User } from '@/types/feed'

interface AvatarProps {
  user: User
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'medium', className = '' }) => {
  const sizeMap = {
    small: '28px',
    medium: '36px',
    large: '48px'
  }

  return (
    <img
      src={user.avatar}
      alt={user.name}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: '50%',
        border: '2px solid white',
        objectFit: 'cover'
      }}
      className={className}
    />
  )
}

interface AvatarStackProps {
  users: User[]
  maxVisible?: number
  size?: number
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  maxVisible = 4,
  size = 24
}) => {
  const visibleUsers = users.slice(0, maxVisible)
  const remainingCount = users.length - maxVisible

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center'
    }}>
      {visibleUsers.map((user, idx) => (
        <img
          key={user.id}
          src={user.avatar}
          alt={user.name}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            border: '1.5px solid white',
            marginLeft: idx > 0 ? '-6px' : '0',
            objectFit: 'cover',
            position: 'relative',
            zIndex: visibleUsers.length - idx
          }}
        />
      ))}
      {remainingCount > 0 && (
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'white',
          opacity: 0.9,
          marginLeft: '6px'
        }}>
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

interface GlassButtonProps {
  icon: string
  count?: number
  active?: boolean
  onClick?: () => void
  size?: number
  variant?: 'light' | 'medium' | 'heavy' | 'dark'
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  icon,
  count,
  active = false,
  onClick,
  size = 40,
  variant = 'medium'
}) => {
  const variantStyles = {
    light: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.15)',
    heavy: 'rgba(255,255,255,0.2)',
    dark: 'rgba(0,0,0,0.4)'
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: variantStyles[variant],
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.9)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <Icon
        name={icon}
        size={24}
        color="white"
        state={active ? 'filled' : 'default'}
      />
      {count !== undefined && count > 0 && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: '#FF2D92',
          color: 'white',
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '10px',
          minWidth: '18px',
          textAlign: 'center',
          border: '1.5px solid white'
        }}>
          {count}
        </div>
      )}
    </button>
  )
}

interface BadgeProps {
  text: string
  icon?: string
  color: string
  variant?: 'solid' | 'glass'
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  icon,
  color,
  variant = 'glass'
}) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 700,
      color: 'white',
      background: variant === 'glass'
        ? `${color}33`
        : color,
      backdropFilter: variant === 'glass' ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: variant === 'glass' ? 'blur(10px)' : 'none',
      border: `1px solid ${color}66`
    }}>
      {icon && <Icon name={icon} size={16} color="white" />}
      <span>{text}</span>
    </div>
  )
}

interface UserHeaderProps {
  user: User
  timestamp: Date
  onUserClick?: () => void
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  timestamp,
  onUserClick
}) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '12px',
      marginBottom: '12px'
    }}>
      <Avatar user={user} size="medium" />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            cursor: onUserClick ? 'pointer' : 'default'
          }}
          onClick={onUserClick}
        >
          {user.name}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'white',
          opacity: 0.7
        }}>
          @{user.username} • {getTimeAgo(timestamp)}
        </div>
      </div>
    </div>
  )
}

interface ThreeDotsMenuProps {
  onReport?: () => void
  onHide?: () => void
  onMute?: () => void
}

export const ThreeDotsMenu: React.FC<ThreeDotsMenuProps> = ({
  onReport,
  onHide,
  onMute
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <Icon name="menu-dots" size={20} color="white" />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          background: 'rgba(20,20,20,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: '8px',
          minWidth: '160px',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100
        }}>
          {onHide && (
            <button
              onClick={onHide}
              style={{
                width: '100%',
                padding: '10px 12px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Hide this post
            </button>
          )}
          {onMute && (
            <button
              onClick={onMute}
              style={{
                width: '100%',
                padding: '10px 12px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Mute notifications
            </button>
          )}
          {onReport && (
            <button
              onClick={onReport}
              style={{
                width: '100%',
                padding: '10px 12px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: '#FF4444',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Report
            </button>
          )}
        </div>
      )}
    </div>
  )
}

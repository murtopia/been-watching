'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { getTasteMatchLabel } from '@/utils/tasteMatch'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
}

interface UserCardProps {
  user: Profile
  currentUserId: string
  isFollowing: boolean
  followsYou?: boolean
  mutualFriends?: Profile[]
  tasteMatchScore?: number
  latestActivity?: string
  onFollow: (userId: string) => void
  onUnfollow: (userId: string) => void
  onClick?: (username: string) => void
}

export default function UserCard({
  user,
  currentUserId,
  isFollowing,
  followsYou = false,
  mutualFriends = [],
  tasteMatchScore,
  latestActivity,
  onFollow,
  onUnfollow,
  onClick
}: UserCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const tasteMatch = tasteMatchScore ? getTasteMatchLabel(tasteMatchScore) : null

  // Theme-based colors
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'white'
  const cardBgHover = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8f9fa'
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0'
  const backdropBlur = isDark ? 'blur(20px)' : 'none'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'
  const textTertiary = isDark ? 'rgba(255, 255, 255, 0.4)' : '#999'
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'white'
  const buttonBgHover = isDark ? 'rgba(255, 255, 255, 0.15)' : '#f8f9fa'
  const buttonBorder = isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ddd'
  const buttonBorderHover = isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #999'
  const badgeBg = isDark ? 'rgba(255, 255, 255, 0.15)' : '#e0e0e0'

  // Determine follow status
  let followStatus: 'mutual' | 'following' | 'follows-you' | 'none' = 'none'
  if (isFollowing && followsYou) followStatus = 'mutual'
  else if (isFollowing) followStatus = 'following'
  else if (followsYou) followStatus = 'follows-you'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: cardBg,
        borderRadius: '12px',
        border: cardBorder,
        backdropFilter: backdropBlur,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onClick={() => onClick?.(user.username)}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = cardBgHover
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.08)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.background = cardBg
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'white',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          getInitials(user.display_name)
        )}
      </div>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Username (bold) and Follow Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: textPrimary,
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(user.username)
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none'
            }}
          >
            @{user.username}
          </div>
          {followStatus !== 'none' && (
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: followStatus === 'mutual' ? 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)' :
                         followStatus === 'following' ? badgeBg : badgeBg,
              color: followStatus === 'mutual' ? 'white' : textSecondary
            }}>
              {followStatus === 'mutual' ? 'Mutual' : followStatus === 'following' ? 'Following' : 'Follows you'}
            </span>
          )}
        </div>

        {/* Display Name */}
        <div style={{ fontSize: '0.875rem', color: textSecondary, marginBottom: '0.5rem' }}>
          {user.display_name}
        </div>

        {/* Mutual Friends */}
        {mutualFriends.length > 0 && (
          <div style={{ fontSize: '0.75rem', color: textTertiary, marginBottom: '0.25rem' }}>
            Mutual: {mutualFriends.slice(0, 3).map((f, i) => (
              <span key={f.id}>
                {i > 0 && ', '}
                <span style={{ color: textSecondary, fontWeight: '600' }}>@{f.username}</span>
              </span>
            ))}
            {mutualFriends.length > 3 && ` +${mutualFriends.length - 3} more`}
          </div>
        )}

        {/* Taste Match */}
        {tasteMatch && tasteMatchScore && (
          <div style={{
            fontSize: '0.75rem',
            color: tasteMatch.color,
            fontWeight: '600',
            marginBottom: '0.25rem'
          }}>
            {tasteMatch.emoji} {tasteMatchScore}% {tasteMatch.label}
          </div>
        )}

        {/* Latest Activity */}
        {latestActivity && (
          <div style={{ fontSize: '0.75rem', color: textTertiary, fontStyle: 'italic' }}>
            {latestActivity}
          </div>
        )}
      </div>

      {/* Follow Button */}
      <button
        onClick={(e) => {
          e.stopPropagation() // Prevent card click when clicking button
          if (isFollowing) {
            onUnfollow(user.id)
          } else {
            onFollow(user.id)
          }
        }}
        style={{
          padding: '0.5rem 1.5rem',
          background: isFollowing ? buttonBg : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
          color: isFollowing ? textSecondary : 'white',
          border: isFollowing ? buttonBorder : 'none',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          if (isFollowing) {
            e.currentTarget.style.background = buttonBgHover
            e.currentTarget.style.borderColor = buttonBorderHover.replace('1px solid ', '')
          } else {
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (isFollowing) {
            e.currentTarget.style.background = buttonBg
            e.currentTarget.style.borderColor = buttonBorder.replace('1px solid ', '')
          } else {
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        {isFollowing ? 'Following' : followsYou ? 'Follow Back' : 'Follow'}
      </button>
    </div>
  )
}

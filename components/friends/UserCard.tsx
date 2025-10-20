'use client'

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
  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const tasteMatch = tasteMatchScore ? getTasteMatchLabel(tasteMatchScore) : null

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
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onClick={() => onClick?.(user.username)}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = '#f8f9fa'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.background = 'white'
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
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1a1a1a' }}>
            @{user.username}
          </div>
          {followStatus !== 'none' && (
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: followStatus === 'mutual' ? 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)' :
                         followStatus === 'following' ? '#e0e0e0' : '#e0e0e0',
              color: followStatus === 'mutual' ? 'white' : '#666'
            }}>
              {followStatus === 'mutual' ? 'Mutual' : followStatus === 'following' ? 'Following' : 'Follows you'}
            </span>
          )}
        </div>

        {/* Display Name */}
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          {user.display_name}
        </div>

        {/* Mutual Friends */}
        {mutualFriends.length > 0 && (
          <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.25rem' }}>
            Mutual: {mutualFriends.slice(0, 3).map((f, i) => (
              <span key={f.id}>
                {i > 0 && ', '}
                <span style={{ color: '#666', fontWeight: '600' }}>@{f.username}</span>
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
          <div style={{ fontSize: '0.75rem', color: '#999', fontStyle: 'italic' }}>
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
          background: isFollowing ? 'white' : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
          color: isFollowing ? '#666' : 'white',
          border: isFollowing ? '1px solid #ddd' : 'none',
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
            e.currentTarget.style.background = '#f8f9fa'
            e.currentTarget.style.borderColor = '#999'
          } else {
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (isFollowing) {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.borderColor = '#ddd'
          } else {
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        {isFollowing ? 'Unfollow' : followsYou ? 'Follow Back' : 'Follow'}
      </button>
    </div>
  )
}

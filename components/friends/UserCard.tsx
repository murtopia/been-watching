'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { getTasteMatchLabel } from '@/utils/tasteMatch'
import DropdownMenu from '../ui/DropdownMenu'
import ReportModal from '../moderation/ReportModal'

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
  isPending?: boolean // True if we've sent a follow request that's pending
  followsYou?: boolean
  mutualFriends?: Profile[]
  tasteMatchScore?: number
  latestActivity?: string
  onFollow: (userId: string) => void
  onUnfollow: (userId: string) => void
  onCancelRequest?: (userId: string) => void // For canceling pending requests
  onClick?: (username: string) => void
  onMutualFriendsClick?: (friends: Profile[]) => void
}

export default function UserCard({
  user,
  currentUserId,
  isFollowing,
  isPending = false,
  followsYou = false,
  mutualFriends = [],
  tasteMatchScore,
  latestActivity,
  onFollow,
  onUnfollow,
  onCancelRequest,
  onClick,
  onMutualFriendsClick
}: UserCardProps) {
  const colors = useThemeColors()
  const [showReportModal, setShowReportModal] = useState(false)

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const tasteMatch = tasteMatchScore ? getTasteMatchLabel(tasteMatchScore) : null

  // Determine follow status for single button
  const getFollowButtonState = () => {
    if (isFollowing && followsYou) {
      return { label: 'Mutual', variant: 'mutual' as const }
    } else if (isFollowing) {
      return { label: 'Following', variant: 'following' as const }
    } else if (isPending) {
      return { label: 'Requested', variant: 'requested' as const }
    } else if (followsYou) {
      return { label: 'Follow Back', variant: 'followBack' as const }
    }
    return { label: 'Follow', variant: 'default' as const }
  }

  const buttonState = getFollowButtonState()

  // Button styles based on variant
  // Gold = action buttons (Follow, Follow Back)
  // Gray = no-action states (Following, Mutual, Requested)
  const getButtonStyles = () => {
    const base = {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: '600' as const,
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap' as const,
      border: 'none'
    }

    switch (buttonState.variant) {
      case 'mutual':
        // Gray - no action (already following each other)
        return {
          ...base,
          background: colors.cardBg,
          color: colors.textSecondary,
          border: colors.cardBorder
        }
      case 'following':
        // Gray - no action (already following)
        return {
          ...base,
          background: colors.cardBg,
          color: colors.textSecondary,
          border: colors.cardBorder
        }
      case 'requested':
        // Gray - pending state (waiting for approval, can cancel)
        return {
          ...base,
          background: colors.cardBg,
          color: colors.textSecondary,
          border: colors.cardBorder
        }
      case 'followBack':
        // Gold - action button
        return {
          ...base,
          background: colors.goldAccent,
          color: '#000000'
        }
      default:
        // Gold - action button (Follow)
        return {
          ...base,
          background: colors.goldAccent,
          color: '#000000'
        }
    }
  }

  const handleMutualClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mutualFriends.length > 0 && onMutualFriendsClick) {
      onMutualFriendsClick(mutualFriends)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onClick={() => onClick?.(user.username)}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = colors.cardBgHover
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {/* Avatar - spans all 3 lines */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: user.avatar_url ? 'transparent' : colors.goldAccent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: '700',
          color: '#000000',
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

      {/* Content - Three lines */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Line 1: Display Name */}
        <div
          style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: colors.textPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '0.125rem'
          }}
          title={user.display_name}
        >
          {user.display_name}
        </div>

        {/* Line 2: @username */}
        <div
          style={{
            fontSize: '0.8rem',
            color: colors.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '0.25rem'
          }}
          title={`@${user.username}`}
        >
          @{user.username}
        </div>

        {/* Line 3: Taste Match % + Mutual Friends */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
          {/* Taste Match */}
          {tasteMatch && tasteMatchScore !== undefined && (
            <span style={{ color: tasteMatch.color, fontWeight: '600' }}>
              {tasteMatchScore}% match
            </span>
          )}

          {/* Mutual Friends - overlapping avatars */}
          {mutualFriends.length > 0 && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                cursor: onMutualFriendsClick ? 'pointer' : 'default'
              }}
              onClick={handleMutualClick}
            >
              {/* Overlapping avatars (show up to 3) */}
              <div style={{ display: 'flex', marginRight: '0.25rem' }}>
                {mutualFriends.slice(0, 3).map((friend, index) => (
                  <div
                    key={friend.id}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: friend.avatar_url ? 'transparent' : colors.goldAccent,
                      border: `1.5px solid ${colors.isDark ? '#000' : '#fff'}`,
                      marginLeft: index > 0 ? '-6px' : 0,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.5rem',
                      fontWeight: '700',
                      color: '#000',
                      zIndex: 3 - index
                    }}
                  >
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      friend.display_name?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                ))}
              </div>
              <span style={{ color: colors.textSecondary }}>
                {mutualFriends.length} mutual
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Follow Button - pushed to the right */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (isFollowing) {
            onUnfollow(user.id)
          } else if (isPending && onCancelRequest) {
            onCancelRequest(user.id)
          } else {
            onFollow(user.id)
          }
        }}
        style={getButtonStyles()}
      >
        {buttonState.label}
      </button>

      {/* Three-dot menu */}
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu
          size={16}
          items={[
            {
              label: 'Report User',
              onClick: () => setShowReportModal(true),
              danger: true
            }
          ]}
        />
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType="user"
        targetId={user.id}
        targetUsername={user.username}
      />
    </div>
  )
}

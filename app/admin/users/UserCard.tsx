'use client'

import { Star, Activity, TrendingUp } from 'lucide-react'
import { useThemeColors } from '@/hooks/useThemeColors'

interface UserCardProps {
  user: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    created_at: string
    is_admin: boolean
    stats: {
      ratings: number
      activities: number
      likesReceived: number
    }
  }
}

export default function UserCard({ user }: UserCardProps) {
  const colors = useThemeColors()

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div style={{
      background: colors.cardBg,
      border: colors.cardBorder,
      borderRadius: '12px',
      padding: '1.5rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: colors.goldAccent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#000'
          }}>
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.textPrimary }}>
              {user.username}
            </h3>
            {user.is_admin && (
              <span style={{
                background: colors.goldAccent,
                color: '#000',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                ADMIN
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            {user.display_name || 'No name set'}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        borderRadius: '8px'
      }}>
        <StatItem
          icon={<Star size={16} color={colors.goldAccent} />}
          label="Ratings"
          value={user.stats.ratings}
          colors={colors}
        />
        <StatItem
          icon={<Activity size={16} color={colors.goldAccent} />}
          label="Activities"
          value={user.stats.activities}
          colors={colors}
        />
        <StatItem
          icon={<TrendingUp size={16} color={colors.goldAccent} />}
          label="Likes"
          value={user.stats.likesReceived}
          colors={colors}
        />
      </div>

      <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
        Joined {joinDate}
      </div>
    </div>
  )
}

function StatItem({
  icon,
  label,
  value,
  colors
}: {
  icon: React.ReactNode
  label: string
  value: number
  colors: any
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        marginBottom: '0.25rem'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.125rem',
        color: colors.textPrimary
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
        {label}
      </div>
    </div>
  )
}

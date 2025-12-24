'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useRouter } from 'next/navigation'

interface Referral {
  id: string
  referee_id: string | null
  status: 'pending' | 'joined' | 'active'
  created_at: string
  joined_at: string | null
  referee?: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface ReferralDashboardProps {
  userId: string
}

export default function ReferralDashboard({ userId }: ReferralDashboardProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const supabase = createClient()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReferrals()
  }, [userId])

  const loadReferrals = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referee_id,
        status,
        created_at,
        joined_at,
        referee:profiles!referrals_referee_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading referrals:', error)
    } else {
      // Type assertion: Supabase returns referee as a single object when using the foreign key relation
      setReferrals((data as any) || [])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: colors.textPrimary
        }}>
          Your Referrals
        </h3>
        <div style={{ color: colors.textSecondary }}>Loading...</div>
      </div>
    )
  }

  if (referrals.length === 0) {
    return null // Don't show section if no referrals
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return `${Math.floor(seconds / 604800)}w ago`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          text: 'Active',
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981'
        }
      case 'joined':
        return {
          text: 'Joined',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: 'rgba(59, 130, 246, 0.3)',
          color: '#3b82f6'
        }
      case 'pending':
      default:
        return {
          text: 'Pending',
          bg: 'rgba(156, 163, 175, 0.1)',
          border: 'rgba(156, 163, 175, 0.3)',
          color: '#9ca3af'
        }
    }
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: colors.cardBg,
      border: colors.cardBorder,
      borderRadius: '12px',
      marginTop: '1rem'
    }}>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: '700',
        marginBottom: '1rem',
        color: colors.textPrimary
      }}>
        Your Referrals ({referrals.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {referrals.map((referral) => {
          const status = getStatusBadge(referral.status)
          const referee = Array.isArray(referral.referee) ? referral.referee[0] : referral.referee

          if (referral.status === 'pending') {
            // Pending referral (not yet signed up)
            return (
              <div
                key={referral.id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: colors.cardBorder,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: colors.cardBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  ⏳
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '0.25rem'
                  }}>
                    Pending
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: colors.textSecondary
                  }}>
                    Invite sent {getTimeSince(referral.created_at)}
                  </div>
                </div>
                <div style={{
                  padding: '0.375rem 0.75rem',
                  background: status.bg,
                  border: `1px solid ${status.border}`,
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: status.color
                }}>
                  {status.text}
                </div>
              </div>
            )
          }

          // Joined/Active referral
          return (
            <div
              key={referral.id}
              onClick={() => referee && router.push(`/${referee.username}`)}
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: colors.cardBorder,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: referee?.avatar_url
                  ? `url(${referee.avatar_url}) center/cover`
                  : `linear-gradient(135deg, ${colors.goldAccent}, ${colors.goldAccent}cc)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {!referee?.avatar_url && (referee?.display_name?.[0] || referee?.username?.[0] || '?')}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  color: colors.textPrimary,
                  marginBottom: '0.25rem'
                }}>
                  {referee?.display_name || referee?.username || 'Unknown'}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: colors.textSecondary
                }}>
                  Joined {getTimeSince(referral.joined_at || referral.created_at)}
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                padding: '0.375rem 0.75rem',
                background: status.bg,
                border: `1px solid ${status.border}`,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: status.color
              }}>
                {status.text}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

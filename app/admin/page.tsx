'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import MetricCard from '@/components/admin/MetricCard'
import {
  Users,
  UserCheck,
  UserPlus,
  Repeat,
  Star,
  Activity,
  Heart,
  TrendingUp,
  Search,
  AlertCircle,
  Clock,
  Gift,
  CheckCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const colors = useThemeColors()
  const supabase = createClient()

  // Metric states
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  const [newSignups, setNewSignups] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalFollows, setTotalFollows] = useState(0)
  const [totalInvites, setTotalInvites] = useState(0)
  const [invitesAccepted, setInvitesAccepted] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      // Total Users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      setTotalUsers(usersCount || 0)

      // New Signups (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { count: signupsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())
      setNewSignups(signupsCount || 0)

      // Active Users (users with activity in last 7 days)
      const { data: activeUsersData } = await supabase
        .from('activities')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString())
      const uniqueActiveUsers = new Set(activeUsersData?.map(a => a.user_id) || [])
      setActiveUsers(uniqueActiveUsers.size)

      // Total Ratings
      const { count: ratingsCount } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
      setTotalRatings(ratingsCount || 0)

      // Total Likes
      const { count: likesCount } = await supabase
        .from('activity_likes')
        .select('*', { count: 'exact', head: true })
      setTotalLikes(likesCount || 0)

      // Total Follows
      const { count: followsCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
      setTotalFollows(followsCount || 0)

      // Invite Metrics
      const { data: invites } = await supabase
        .from('invite_codes')
        .select('is_used')
      const totalInvites = invites?.length || 0
      const usedInvites = invites?.filter(i => i.is_used).length || 0
      setTotalInvites(totalInvites)
      setInvitesAccepted(usedInvites)

      setLoading(false)
    } catch (error) {
      console.error('Error loading metrics:', error)
      setLoading(false)
    }
  }

  const calculateRetention = () => {
    if (totalUsers === 0) return '0'
    return ((activeUsers / totalUsers) * 100).toFixed(1)
  }

  const calculateAvgRatingsPerUser = () => {
    if (totalUsers === 0) return '0'
    return (totalRatings / totalUsers).toFixed(1)
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          margin: 0
        }}>
          Overview of Been Watching metrics and analytics
        </p>
      </div>

      {/* Core Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          title="Total Users"
          value={loading ? '-' : totalUsers.toLocaleString()}
          icon={Users}
          subtitle="All registered users"
          loading={loading}
        />

        <MetricCard
          title="Active Users (7d)"
          value={loading ? '-' : activeUsers.toLocaleString()}
          icon={UserCheck}
          trend={{
            value: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
            label: 'of total'
          }}
          loading={loading}
        />

        <MetricCard
          title="New Signups (7d)"
          value={loading ? '-' : newSignups.toLocaleString()}
          icon={UserPlus}
          subtitle="Users joined this week"
          loading={loading}
        />

        <MetricCard
          title="Retention Rate"
          value={loading ? '-' : `${calculateRetention()}%`}
          icon={Repeat}
          subtitle="7-day active / total"
          loading={loading}
        />
      </div>

      {/* Engagement Metrics */}
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: colors.textPrimary,
        margin: '2rem 0 1rem 0'
      }}>
        Engagement Metrics
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          title="Total Ratings"
          value={loading ? '-' : totalRatings.toLocaleString()}
          icon={Star}
          subtitle={`${calculateAvgRatingsPerUser()} per user avg.`}
          loading={loading}
        />

        <MetricCard
          title="Social Actions"
          value={loading ? '-' : (totalLikes + totalFollows).toLocaleString()}
          icon={Activity}
          subtitle={`${totalLikes} likes, ${totalFollows} follows`}
          loading={loading}
        />

        <MetricCard
          title="Total Likes"
          value={loading ? '-' : totalLikes.toLocaleString()}
          icon={Heart}
          subtitle="Activity likes"
          loading={loading}
        />

        <MetricCard
          title="Total Follows"
          value={loading ? '-' : totalFollows.toLocaleString()}
          icon={TrendingUp}
          subtitle="User connections"
          loading={loading}
        />
      </div>

      {/* Invite Metrics */}
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: colors.textPrimary,
        margin: '2rem 0 1rem 0'
      }}>
        Invite System
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          title="Total Invites Shared"
          value={loading ? '-' : totalInvites.toLocaleString()}
          icon={Gift}
          subtitle="All invite codes created"
          loading={loading}
        />

        <MetricCard
          title="Invites Accepted"
          value={loading ? '-' : invitesAccepted.toLocaleString()}
          icon={CheckCircle}
          trend={{
            value: totalInvites > 0 ? Math.round((invitesAccepted / totalInvites) * 100) : 0,
            label: 'acceptance rate'
          }}
          loading={loading}
        />

        <MetricCard
          title="Active Invites"
          value={loading ? '-' : (totalInvites - invitesAccepted).toLocaleString()}
          icon={Clock}
          subtitle="Available to be used"
          loading={loading}
        />
      </div>

      {/* PostHog Analytics Note */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: colors.goldGlassBg,
        border: colors.goldBorder,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.goldAccent,
          margin: '0 0 0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <TrendingUp size={20} />
          PostHog Analytics Available
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: colors.textSecondary,
          margin: 0,
          lineHeight: 1.6
        }}>
          For deeper analytics including event tracking, user flows, funnels, and retention analysis,
          visit your <a
            href="https://app.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.goldAccent,
              textDecoration: 'underline',
              fontWeight: 500
            }}
          >
            PostHog Dashboard
          </a>. All user events (signups, ratings, follows, searches) are being tracked in real-time.
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <QuickActionLink
          label="View All Users"
          href="/admin/users"
          icon={Users}
          colors={colors}
        />
        <QuickActionLink
          label="View Analytics"
          href="https://app.posthog.com"
          icon={TrendingUp}
          colors={colors}
          external
        />
        <QuickActionLink
          label="Manage Invites"
          href="/admin/invites"
          icon={UserPlus}
          colors={colors}
        />
      </div>
    </div>
  )
}

function QuickActionLink({
  label,
  href,
  icon: Icon,
  colors,
  external
}: {
  label: string
  href: string
  icon: any
  colors: any
  external?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        background: colors.cardBg,
        border: isHovered ? colors.goldBorder : colors.cardBorder,
        borderRadius: '8px',
        color: colors.textPrimary,
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon size={18} style={{ color: isHovered ? colors.goldAccent : colors.textSecondary }} />
      {label}
    </a>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import { TrendingUp, Users, Activity, Search, Heart, Eye } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Get recent activity stats from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: totalUsers },
    { count: newUsersWeek },
    { count: ratingsWeek },
    { count: activitiesWeek }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())
  ])

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: '#888' }}>
          Real-time insights and user activity metrics
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <QuickStat
          icon={<Users size={24} />}
          label="Total Users"
          value={totalUsers || 0}
          change={`+${newUsersWeek || 0} this week`}
          color="#3b82f6"
        />
        <QuickStat
          icon={<Heart size={24} />}
          label="Ratings This Week"
          value={ratingsWeek || 0}
          change="Last 7 days"
          color="#ef4444"
        />
        <QuickStat
          icon={<Activity size={24} />}
          label="Activities This Week"
          value={activitiesWeek || 0}
          change="Last 7 days"
          color="#10b981"
        />
      </div>

      {/* PostHog Embed */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            PostHog Event Analytics
          </h2>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>
            View detailed event tracking and user behavior in your PostHog dashboard
          </p>
        </div>

        <a
          href="https://app.posthog.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'opacity 0.2s'
          }}
        >
          <Eye size={20} />
          Open PostHog Dashboard
        </a>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--bg)',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
            Available Events:
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
            color: '#888'
          }}>
            <EventItem name="user_signed_up" />
            <EventItem name="user_logged_in" />
            <EventItem name="search_performed" />
            <EventItem name="media_rated" />
            <EventItem name="watch_status_changed" />
            <EventItem name="activity_liked" />
            <EventItem name="activity_unliked" />
            <EventItem name="user_followed" />
            <EventItem name="user_unfollowed" />
            <EventItem name="feed_viewed" />
            <EventItem name="myshows_viewed" />
            <EventItem name="profile_viewed" />
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Engagement Metrics
        </h2>

        <div style={{ fontSize: '0.875rem', color: '#888' }}>
          <p style={{ marginBottom: '1rem' }}>
            Track user engagement with PostHog to understand:
          </p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.75' }}>
            <li>Which features users interact with most</li>
            <li>User journey from signup to first rating</li>
            <li>Retention and churn patterns</li>
            <li>Social interaction trends (likes, follows)</li>
            <li>Search behavior and popular content</li>
            <li>Page view patterns and navigation flows</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function QuickStat({
  icon,
  label,
  value,
  change,
  color
}: {
  icon: React.ReactNode
  label: string
  value: number
  change: string
  color: string
}) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}20`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {value.toLocaleString()}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#888' }}>
        {change}
      </div>
    </div>
  )
}

function EventItem({ name }: { name: string }) {
  return (
    <div style={{
      padding: '0.5rem',
      background: 'var(--card-bg)',
      borderRadius: '6px',
      fontSize: '0.8125rem',
      fontFamily: 'monospace'
    }}>
      • {name}
    </div>
  )
}

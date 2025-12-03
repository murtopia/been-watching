'use client'

import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Activity, AlertTriangle, Database, Zap, Clock, TrendingUp, Tv } from 'lucide-react'
import SystemNav from './SystemNav'

interface SystemStats {
  database: {
    status: string
    responseTime: number
    totalUsers: number
    totalActivities: number
    totalRatings: number
    totalComments: number
  }
  api: {
    status: string
    avgResponseTime: number
  }
  system: {
    uptime: number
    recentErrors: number
  }
}

export default function SystemOverview({ stats }: { stats: SystemStats }) {
  const router = useRouter()
  const colors = useThemeColors()

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return '#16a34a'
    if (status === 'warning') return '#f59e0b'
    return '#dc2626'
  }

  const getResponseTimeStatus = (ms: number) => {
    if (ms < 100) return { status: 'excellent', color: '#16a34a' }
    if (ms < 500) return { status: 'good', color: '#16a34a' }
    if (ms < 1000) return { status: 'fair', color: '#f59e0b' }
    return { status: 'slow', color: '#dc2626' }
  }

  const dbResponseStatus = getResponseTimeStatus(stats.database.responseTime)
  const apiResponseStatus = getResponseTimeStatus(stats.api.avgResponseTime)

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sub-navigation */}
      <SystemNav />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '0.5rem'
        }}>
          System Health
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary
        }}>
          Monitor system performance, uptime, and health metrics
        </p>
      </div>

      {/* Critical Alerts */}
      {(stats.system.recentErrors > 10 || stats.database.status === 'error') && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid #dc2626',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertTriangle size={24} color="#dc2626" />
          <div>
            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '0.25rem' }}>
              System Alert
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              {stats.system.recentErrors > 10 && `High error rate detected: ${stats.system.recentErrors} errors in last 24h`}
              {stats.database.status === 'error' && 'Database connection issues detected'}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Database Status */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Database size={24} color={getStatusColor(stats.database.status)} />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.textPrimary }}>
              Database
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getStatusColor(stats.database.status)
            }} />
            <span style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              textTransform: 'capitalize'
            }}>
              {stats.database.status}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            Response Time: <span style={{
              color: dbResponseStatus.color,
              fontWeight: '600'
            }}>
              {stats.database.responseTime}ms
            </span>
          </div>
        </div>

        {/* API Status */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Zap size={24} color={getStatusColor(stats.api.status)} />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.textPrimary }}>
              API
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getStatusColor(stats.api.status)
            }} />
            <span style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              textTransform: 'capitalize'
            }}>
              {stats.api.status}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            Avg Response: <span style={{
              color: apiResponseStatus.color,
              fontWeight: '600'
            }}>
              {stats.api.avgResponseTime}ms
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Clock size={24} color="#16a34a" />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.textPrimary }}>
              Uptime
            </h3>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.textPrimary,
            marginBottom: '0.5rem'
          }}>
            {stats.system.uptime} days
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            System running smoothly
          </div>
        </div>

        {/* Error Rate */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertTriangle size={24} color={stats.system.recentErrors > 10 ? '#dc2626' : '#16a34a'} />
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.textPrimary }}>
              Errors (24h)
            </h3>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: stats.system.recentErrors > 10 ? '#dc2626' : colors.textPrimary,
            marginBottom: '0.5rem'
          }}>
            {stats.system.recentErrors}
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            {stats.system.recentErrors > 10 ? 'Elevated error rate' : 'Normal operation'}
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      <div style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '1.5rem'
        }}>
          Database Statistics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              Total Users
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>
              {stats.database.totalUsers.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              Total Activities
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>
              {stats.database.totalActivities.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              Total Ratings
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>
              {stats.database.totalRatings.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '0.5rem' }}>
              Total Comments
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>
              {stats.database.totalComments.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: '1.5rem'
        }}>
          System Monitoring
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => router.push('/admin/system/health')}
            style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            className="admin-button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Activity size={20} color={colors.textPrimary} />
              <span style={{ fontWeight: '600', color: colors.textPrimary }}>Health Checks</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Detailed system health monitoring
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/system/errors')}
            style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            className="admin-button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} color={colors.textPrimary} />
              <span style={{ fontWeight: '600', color: colors.textPrimary }}>Error Logs</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              View and diagnose system errors
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/system/api')}
            style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            className="admin-button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Zap size={20} color={colors.textPrimary} />
              <span style={{ fontWeight: '600', color: colors.textPrimary }}>API Performance</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Monitor API response times
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/system/database')}
            style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            className="admin-button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Database size={20} color={colors.textPrimary} />
              <span style={{ fontWeight: '600', color: colors.textPrimary }}>Database Stats</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Database performance and usage
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/settings/streaming-platforms')}
            style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
            className="admin-button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Tv size={20} color={colors.textPrimary} />
              <span style={{ fontWeight: '600', color: colors.textPrimary }}>Streaming Platforms</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Manage which platforms appear on feed cards
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .admin-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

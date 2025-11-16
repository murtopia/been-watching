'use client'

import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { ArrowLeft, AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react'

export default function ErrorLogsPage() {
  const router = useRouter()
  const colors = useThemeColors()

  // Mock error logs (in production, fetch from database)
  const errorLogs = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'error',
      message: 'Failed to fetch user profile',
      endpoint: '/api/user/profile',
      userId: 'user_123',
      stack: 'Error: User not found\n  at getUserProfile (profile.ts:45)\n  at handler (route.ts:23)',
      resolved: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      level: 'warning',
      message: 'Slow database query detected',
      endpoint: '/api/feed',
      userId: 'user_456',
      stack: 'Query took 2.5s to complete',
      resolved: false
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      level: 'error',
      message: 'TMDB API rate limit exceeded',
      endpoint: '/api/tmdb/search',
      userId: 'user_789',
      stack: 'RateLimitError: Too many requests\n  at fetchFromTMDB (tmdb.ts:12)',
      resolved: true
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      level: 'info',
      message: 'Database connection pool at 80% capacity',
      endpoint: 'system',
      userId: null,
      stack: 'Pool: 16/20 connections active',
      resolved: true
    }
  ]

  const getLogIcon = (level: string) => {
    if (level === 'error') return <XCircle size={20} color="#dc2626" />
    if (level === 'warning') return <AlertTriangle size={20} color="#f59e0b" />
    if (level === 'info') return <Info size={20} color="#3b82f6" />
    return <AlertCircle size={20} color={colors.textSecondary} />
  }

  const getLogColor = (level: string) => {
    if (level === 'error') return '#dc2626'
    if (level === 'warning') return '#f59e0b'
    if (level === 'info') return '#3b82f6'
    return colors.textSecondary
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const unresolvedErrors = errorLogs.filter(log => !log.resolved && log.level === 'error').length
  const unresolvedWarnings = errorLogs.filter(log => !log.resolved && log.level === 'warning').length

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/admin/system')}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Back to System Overview
        </button>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '0.5rem'
        }}>
          Error Logs
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary
        }}>
          System errors, warnings, and diagnostic information
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <XCircle size={20} color="#dc2626" />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Unresolved Errors
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: unresolvedErrors > 0 ? '#dc2626' : colors.textPrimary }}>
            {unresolvedErrors}
          </div>
        </div>

        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Warnings
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: unresolvedWarnings > 0 ? '#f59e0b' : colors.textPrimary }}>
            {unresolvedWarnings}
          </div>
        </div>

        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <AlertCircle size={20} color={colors.textSecondary} />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Total Logs (24h)
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.textPrimary }}>
            {errorLogs.length}
          </div>
        </div>
      </div>

      {/* Error Logs List */}
      <div style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: colors.cardBorder,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: colors.textPrimary
          }}>
            Recent Logs
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: colors.textPrimary,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              <option>All Levels</option>
              <option>Errors Only</option>
              <option>Warnings Only</option>
              <option>Info Only</option>
            </select>
            <select style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: colors.textPrimary,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              <option>All Status</option>
              <option>Unresolved</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <div>
          {errorLogs.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: colors.textSecondary
            }}>
              <AlertCircle size={48} color={colors.textSecondary} style={{ margin: '0 auto 1rem' }} />
              <div>No error logs found</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                System is running smoothly
              </div>
            </div>
          ) : (
            errorLogs.map((log, index) => (
              <div
                key={log.id}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < errorLogs.length - 1 ? colors.cardBorder : 'none',
                  opacity: log.resolved ? 0.6 : 1
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    {getLogIcon(log.level)}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '0.25rem'
                      }}>
                        {log.message}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: colors.textSecondary,
                        display: 'flex',
                        gap: '1rem'
                      }}>
                        <span>{log.endpoint}</span>
                        {log.userId && <span>User: {log.userId}</span>}
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: log.resolved ? 'rgba(22, 163, 74, 0.1)' : `${getLogColor(log.level)}20`,
                    color: log.resolved ? '#16a34a' : getLogColor(log.level)
                  }}>
                    {log.resolved ? 'Resolved' : log.level}
                  </div>
                </div>

                {log.stack && (
                  <details style={{ marginTop: '0.75rem' }}>
                    <summary style={{
                      fontSize: '0.875rem',
                      color: colors.textSecondary,
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}>
                      View stack trace
                    </summary>
                    <pre style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: colors.textSecondary,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {log.stack}
                    </pre>
                  </details>
                )}

                {!log.resolved && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                    <button style={{
                      background: 'rgba(22, 163, 74, 0.1)',
                      border: '1px solid rgba(22, 163, 74, 0.3)',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      color: '#16a34a',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      Mark as Resolved
                    </button>
                    <button style={{
                      background: colors.buttonBg,
                      border: colors.buttonBorder,
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      color: colors.textPrimary,
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Note */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem 1.5rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
        <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
          <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '0.25rem' }}>
            Note:
          </strong>
          Error logs are stored for 30 days. Critical errors trigger automatic alerts to administrators.
          For production deployment, consider integrating with services like Sentry or LogRocket for advanced error tracking.
        </div>
      </div>
    </div>
  )
}

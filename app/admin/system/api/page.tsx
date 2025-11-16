'use client'

import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react'

export default function APIPerformancePage() {
  const router = useRouter()
  const colors = useThemeColors()

  // Mock API performance data (in production, fetch from monitoring service)
  const apiEndpoints = [
    {
      endpoint: '/api/feed',
      method: 'GET',
      avgResponseTime: 245,
      p95ResponseTime: 420,
      p99ResponseTime: 680,
      requestCount: 1247,
      errorRate: 0.2,
      trend: 'up'
    },
    {
      endpoint: '/api/user/profile',
      method: 'GET',
      avgResponseTime: 180,
      p95ResponseTime: 320,
      p99ResponseTime: 450,
      requestCount: 892,
      errorRate: 0.1,
      trend: 'down'
    },
    {
      endpoint: '/api/tmdb/search',
      method: 'GET',
      avgResponseTime: 520,
      p95ResponseTime: 1100,
      p99ResponseTime: 1850,
      requestCount: 456,
      errorRate: 2.3,
      trend: 'up'
    },
    {
      endpoint: '/api/user-media',
      method: 'POST',
      avgResponseTime: 310,
      p95ResponseTime: 580,
      p99ResponseTime: 920,
      requestCount: 654,
      errorRate: 0.5,
      trend: 'stable'
    },
    {
      endpoint: '/api/activities',
      method: 'GET',
      avgResponseTime: 290,
      p95ResponseTime: 510,
      p99ResponseTime: 780,
      requestCount: 1034,
      errorRate: 0.3,
      trend: 'down'
    },
    {
      endpoint: '/api/notifications/unread-count',
      method: 'GET',
      avgResponseTime: 95,
      p95ResponseTime: 150,
      p99ResponseTime: 220,
      requestCount: 2341,
      errorRate: 0.0,
      trend: 'stable'
    }
  ]

  const getResponseTimeColor = (ms: number) => {
    if (ms < 200) return '#16a34a'
    if (ms < 500) return '#f59e0b'
    return '#dc2626'
  }

  const getErrorRateColor = (rate: number) => {
    if (rate < 1) return '#16a34a'
    if (rate < 5) return '#f59e0b'
    return '#dc2626'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} color="#dc2626" />
    if (trend === 'down') return <TrendingDown size={16} color="#16a34a" />
    return <Activity size={16} color={colors.textSecondary} />
  }

  const totalRequests = apiEndpoints.reduce((sum, ep) => sum + ep.requestCount, 0)
  const avgResponseTime = Math.round(
    apiEndpoints.reduce((sum, ep) => sum + ep.avgResponseTime * ep.requestCount, 0) / totalRequests
  )
  const slowestEndpoint = apiEndpoints.reduce((prev, current) =>
    prev.avgResponseTime > current.avgResponseTime ? prev : current
  )
  const fastestEndpoint = apiEndpoints.reduce((prev, current) =>
    prev.avgResponseTime < current.avgResponseTime ? prev : current
  )

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
          API Performance
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary
        }}>
          Monitor API endpoint response times and request volumes
        </p>
      </div>

      {/* Summary Stats */}
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
            <Zap size={20} color={getResponseTimeColor(avgResponseTime)} />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Avg Response Time
            </span>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: getResponseTimeColor(avgResponseTime)
          }}>
            {avgResponseTime}ms
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
            <Activity size={20} color={colors.textPrimary} />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Total Requests (24h)
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.textPrimary }}>
            {totalRequests.toLocaleString()}
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
            <TrendingDown size={20} color="#16a34a" />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Fastest Endpoint
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.textPrimary, marginBottom: '0.25rem' }}>
            {fastestEndpoint.avgResponseTime}ms
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
            {fastestEndpoint.endpoint}
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
            <TrendingUp size={20} color="#dc2626" />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Slowest Endpoint
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626', marginBottom: '0.25rem' }}>
            {slowestEndpoint.avgResponseTime}ms
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
            {slowestEndpoint.endpoint}
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: colors.cardBorder
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: colors.textPrimary
          }}>
            Endpoint Performance
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: colors.cardBorder }}>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Endpoint
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Method
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Avg
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  P95
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  P99
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Requests
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Error Rate
                </th>
                <th style={{
                  padding: '1rem 1.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {apiEndpoints.map((endpoint, index) => (
                <tr
                  key={endpoint.endpoint}
                  style={{
                    borderBottom: index < apiEndpoints.length - 1 ? colors.cardBorder : 'none'
                  }}
                >
                  <td style={{
                    padding: '1rem 1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: colors.textPrimary
                  }}>
                    {endpoint.endpoint}
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: endpoint.method === 'GET' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: endpoint.method === 'GET' ? '#3b82f6' : '#f59e0b'
                    }}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: getResponseTimeColor(endpoint.avgResponseTime)
                  }}>
                    {endpoint.avgResponseTime}ms
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'right',
                    color: colors.textSecondary
                  }}>
                    {endpoint.p95ResponseTime}ms
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'right',
                    color: colors.textSecondary
                  }}>
                    {endpoint.p99ResponseTime}ms
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'right',
                    color: colors.textPrimary
                  }}>
                    {endpoint.requestCount.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: getErrorRateColor(endpoint.errorRate)
                  }}>
                    {endpoint.errorRate}%
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'center'
                  }}>
                    {getTrendIcon(endpoint.trend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Note */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem 1.5rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        fontSize: '0.875rem',
        color: colors.textSecondary
      }}>
        <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '0.5rem' }}>
          Performance Metrics Explained:
        </strong>
        <ul style={{ margin: '0', paddingLeft: '1.5rem', listStyle: 'disc' }}>
          <li><strong>Avg:</strong> Average response time across all requests</li>
          <li><strong>P95:</strong> 95% of requests complete in this time or faster</li>
          <li><strong>P99:</strong> 99% of requests complete in this time or faster</li>
          <li><strong>Trend:</strong> Performance trend over the last 24 hours</li>
        </ul>
      </div>
    </div>
  )
}

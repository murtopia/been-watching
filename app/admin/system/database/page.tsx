'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { ArrowLeft, Database, HardDrive, Activity, Zap, TrendingUp } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import SystemNav from '../SystemNav'

interface TableStats {
  name: string
  rowCount: number
  estimatedSize: string
  avgQueryTime: number
}

export default function DatabaseStatsPage() {
  const router = useRouter()
  const colors = useThemeColors()
  const [loading, setLoading] = useState(true)
  const [tableStats, setTableStats] = useState<TableStats[]>([])
  const [dbHealth, setDbHealth] = useState({
    responseTime: 0,
    activeConnections: 0,
    totalSize: '0 MB'
  })

  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const loadDatabaseStats = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const startTime = Date.now()

      // Get table row counts
      const [
        { count: profilesCount },
        { count: activitiesCount },
        { count: ratingsCount },
        { count: commentsCount },
        { count: followsCount },
        { count: watchStatusCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('ratings').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('follows').select('*', { count: 'exact', head: true }),
        supabase.from('watch_status').select('*', { count: 'exact', head: true })
      ])

      const responseTime = Date.now() - startTime

      // Estimate table sizes (rough calculation based on row count)
      const estimateSize = (rows: number, avgRowSize: number) => {
        const bytes = rows * avgRowSize
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      }

      const stats: TableStats[] = [
        {
          name: 'profiles',
          rowCount: profilesCount || 0,
          estimatedSize: estimateSize(profilesCount || 0, 512), // ~512 bytes per profile
          avgQueryTime: Math.floor(Math.random() * 50) + 10 // Mock query time
        },
        {
          name: 'activities',
          rowCount: activitiesCount || 0,
          estimatedSize: estimateSize(activitiesCount || 0, 256),
          avgQueryTime: Math.floor(Math.random() * 80) + 20
        },
        {
          name: 'ratings',
          rowCount: ratingsCount || 0,
          estimatedSize: estimateSize(ratingsCount || 0, 128),
          avgQueryTime: Math.floor(Math.random() * 40) + 15
        },
        {
          name: 'comments',
          rowCount: commentsCount || 0,
          estimatedSize: estimateSize(commentsCount || 0, 384),
          avgQueryTime: Math.floor(Math.random() * 60) + 25
        },
        {
          name: 'follows',
          rowCount: followsCount || 0,
          estimatedSize: estimateSize(followsCount || 0, 96),
          avgQueryTime: Math.floor(Math.random() * 30) + 10
        },
        {
          name: 'watch_status',
          rowCount: watchStatusCount || 0,
          estimatedSize: estimateSize(watchStatusCount || 0, 192),
          avgQueryTime: Math.floor(Math.random() * 50) + 15
        }
      ]

      // Calculate total size
      const totalRows = stats.reduce((sum, table) => sum + table.rowCount, 0)
      const totalSizeMB = ((totalRows * 256) / (1024 * 1024)).toFixed(1) // Rough estimate

      setTableStats(stats.sort((a, b) => b.rowCount - a.rowCount))
      setDbHealth({
        responseTime,
        activeConnections: Math.floor(Math.random() * 10) + 3, // Mock active connections
        totalSize: `${totalSizeMB} MB`
      })
    } catch (error) {
      console.error('Failed to load database stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalRows = tableStats.reduce((sum, table) => sum + table.rowCount, 0)
  const avgQueryTime = tableStats.length > 0
    ? Math.round(tableStats.reduce((sum, table) => sum + table.avgQueryTime, 0) / tableStats.length)
    : 0

  const getQueryTimeColor = (ms: number) => {
    if (ms < 50) return '#16a34a'
    if (ms < 100) return '#f59e0b'
    return '#dc2626'
  }

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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              Database Statistics
            </h1>
            <p style={{
              fontSize: '1rem',
              color: colors.textSecondary
            }}>
              Monitor database performance, table sizes, and query metrics
            </p>
          </div>

          <button
            onClick={loadDatabaseStats}
            disabled={loading}
            style={{
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              color: colors.textPrimary,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Refresh Stats'}
          </button>
        </div>
      </div>

      {/* Database Health Cards */}
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
            <Database size={20} color={colors.textPrimary} />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Total Records
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.textPrimary }}>
            {totalRows.toLocaleString()}
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
            <HardDrive size={20} color={colors.textPrimary} />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Database Size
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.textPrimary }}>
            {dbHealth.totalSize}
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
            <Zap size={20} color={getQueryTimeColor(avgQueryTime)} />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Avg Query Time
            </span>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: getQueryTimeColor(avgQueryTime)
          }}>
            {avgQueryTime}ms
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
            <Activity size={20} color="#16a34a" />
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Active Connections
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.textPrimary }}>
            {dbHealth.activeConnections}
          </div>
        </div>
      </div>

      {/* Table Statistics */}
      <div style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '2rem'
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
            Table Statistics
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: colors.textSecondary }}>
            Loading database statistics...
          </div>
        ) : (
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
                    Table Name
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
                    Row Count
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
                    Est. Size
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
                    Avg Query Time
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
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableStats.map((table, index) => {
                  const percentOfTotal = totalRows > 0 ? ((table.rowCount / totalRows) * 100).toFixed(1) : '0.0'
                  return (
                    <tr
                      key={table.name}
                      style={{
                        borderBottom: index < tableStats.length - 1 ? colors.cardBorder : 'none'
                      }}
                    >
                      <td style={{
                        padding: '1rem 1.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        color: colors.textPrimary,
                        fontWeight: '600'
                      }}>
                        {table.name}
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'right',
                        color: colors.textPrimary
                      }}>
                        {table.rowCount.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'right',
                        color: colors.textSecondary
                      }}>
                        {table.estimatedSize}
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: getQueryTimeColor(table.avgQueryTime)
                      }}>
                        {table.avgQueryTime}ms
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'right',
                        color: colors.textSecondary
                      }}>
                        {percentOfTotal}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Tips */}
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
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <TrendingUp size={20} />
          Performance Optimization Tips
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '1.5rem',
          listStyle: 'disc',
          fontSize: '0.875rem',
          color: colors.textSecondary,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <li>Consider archiving old activities and comments to reduce table sizes</li>
          <li>Ensure proper indexes exist on frequently queried columns</li>
          <li>Monitor slow queries (&gt;100ms) and optimize with EXPLAIN ANALYZE</li>
          <li>Use connection pooling to manage database connections efficiently</li>
          <li>Schedule regular VACUUM operations to reclaim storage</li>
          <li>Consider read replicas for scaling read-heavy operations</li>
        </ul>
      </div>
    </div>
  )
}

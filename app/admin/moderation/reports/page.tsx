import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ModerationNav from '../ModerationNav'

export default async function AdminModerationReportsPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Fetch recent reports with reporter and reported user details
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, username, display_name, avatar_url),
      reported_user:profiles!reports_reported_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get report statistics
  const [
    { count: pendingReports },
    { count: resolvedReports },
    { count: totalReports }
  ] = await Promise.all([
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved'),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
  ])

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Report type labels
  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'spam': 'Spam',
      'harassment': 'Harassment',
      'inappropriate': 'Inappropriate Content',
      'misinformation': 'Misinformation',
      'copyright': 'Copyright Violation',
      'other': 'Other'
    }
    return labels[type] || type
  }

  // Report type icons
  const getReportTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'spam': '📧',
      'harassment': '⚠️',
      'inappropriate': '🚫',
      'misinformation': '❌',
      'copyright': '©️',
      'other': '❓'
    }
    return icons[type] || '📝'
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#FFC107',
      'resolved': '#4CAF50',
      'dismissed': '#999'
    }
    return colors[status] || '#999'
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Sub-navigation */}
      <ModerationNav />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          User Reports
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Review and manage user-submitted reports
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          border: 'var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Pending Reports
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FFC107'
          }}>
            {pendingReports || 0}
          </div>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: 'var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Resolved Reports
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#4CAF50'
          }}>
            {resolvedReports || 0}
          </div>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: 'var(--border)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Total Reports
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalReports || 0}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{
        background: 'var(--card-bg)',
        border: 'var(--border)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: 'var(--border)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Recent Reports (Last 100)
          </h2>
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: 'var(--background)',
                borderBottom: '3px solid rgba(255, 255, 255, 0.2)'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Time</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Reporter</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Reported User</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Reason</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports && reports.length > 0 ? (
                reports.map((report: any) => (
                  <tr key={report.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatTime(report.created_at)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>
                        {getReportTypeIcon(report.report_type)}
                      </span>
                      {getReportTypeLabel(report.report_type)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {report.reporter?.avatar_url && (
                          <img
                            src={report.reporter.avatar_url}
                            alt={report.reporter.username}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                          }}>
                            {report.reporter?.display_name || report.reporter?.username || 'Unknown'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{report.reporter?.username || 'unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {report.reported_user?.avatar_url && (
                          <img
                            src={report.reported_user.avatar_url}
                            alt={report.reported_user.username}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                          }}>
                            {report.reported_user?.display_name || report.reported_user?.username || 'Unknown'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{report.reported_user?.username || 'unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      maxWidth: '300px'
                    }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {report.reason || 'No reason provided'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: getStatusColor(report.status),
                        color: '#fff',
                        textTransform: 'capitalize'
                      }}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

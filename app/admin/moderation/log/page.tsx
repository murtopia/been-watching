import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ModerationNav from '../ModerationNav'

export default async function AdminModerationLogPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Fetch moderation log with moderator and target user details
  const { data: moderationLogs } = await supabase
    .from('moderation_log')
    .select(`
      *,
      moderator:profiles!moderation_log_moderator_id_fkey(id, username, display_name, avatar_url),
      target_user:profiles!moderation_log_target_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get moderation statistics
  const [
    { count: totalActions },
    { count: bansIssued },
    { count: warningsIssued },
    { count: contentRemoved }
  ] = await Promise.all([
    supabase
      .from('moderation_log')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('moderation_log')
      .select('*', { count: 'exact', head: true })
      .eq('action_type', 'ban'),
    supabase
      .from('moderation_log')
      .select('*', { count: 'exact', head: true })
      .eq('action_type', 'warning'),
    supabase
      .from('moderation_log')
      .select('*', { count: 'exact', head: true })
      .eq('action_type', 'content_removal')
  ])

  // Actions in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 604800000).toISOString()
  const { count: actionsLast7d } = await supabase
    .from('moderation_log')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

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

  // Action type labels
  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ban': 'User Banned',
      'unban': 'User Unbanned',
      'warning': 'Warning Issued',
      'content_removal': 'Content Removed',
      'report_resolved': 'Report Resolved',
      'flag_dismissed': 'Flag Dismissed',
      'account_suspended': 'Account Suspended'
    }
    return labels[type] || type
  }

  // Action type icons
  const getActionTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'ban': '🚫',
      'unban': '✅',
      'warning': '⚠️',
      'content_removal': '🗑️',
      'report_resolved': '✔️',
      'flag_dismissed': '❌',
      'account_suspended': '⏸️'
    }
    return icons[type] || '📝'
  }

  // Action type colors
  const getActionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ban': '#F44336',
      'unban': '#4CAF50',
      'warning': '#FFC107',
      'content_removal': '#FF9800',
      'report_resolved': '#4CAF50',
      'flag_dismissed': '#999',
      'account_suspended': '#9C27B0'
    }
    return colors[type] || '#999'
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
          Moderation Log
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Complete history of all moderation actions
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
            Total Actions
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalActions || 0}
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
            Last 7 Days
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {actionsLast7d || 0}
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
            Bans Issued
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F44336'
          }}>
            {bansIssued || 0}
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
            Warnings Issued
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FFC107'
          }}>
            {warningsIssued || 0}
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
            Content Removed
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FF9800'
          }}>
            {contentRemoved || 0}
          </div>
        </div>
      </div>

      {/* Moderation Log Table */}
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
            Recent Actions (Last 100)
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
                }}>Action</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Moderator</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Target User</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {moderationLogs && moderationLogs.length > 0 ? (
                moderationLogs.map((log: any) => (
                  <tr key={log.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatTime(log.created_at)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {getActionTypeIcon(log.action_type)}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: getActionTypeColor(log.action_type)
                        }}>
                          {getActionTypeLabel(log.action_type)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {log.moderator?.avatar_url && (
                          <img
                            src={log.moderator.avatar_url}
                            alt={log.moderator.username}
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
                            {log.moderator?.display_name || log.moderator?.username || 'System'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{log.moderator?.username || 'system'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {log.target_user?.avatar_url && (
                          <img
                            src={log.target_user.avatar_url}
                            alt={log.target_user.username}
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
                            {log.target_user?.display_name || log.target_user?.username || 'N/A'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{log.target_user?.username || 'n/a'}
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
                        {log.reason || 'No reason provided'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No moderation actions found
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

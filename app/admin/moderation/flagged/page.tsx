import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ModerationNav from '../ModerationNav'

export default async function AdminModerationFlaggedPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Fetch flagged content with user details
  const { data: flaggedContent } = await supabase
    .from('flagged_content')
    .select(`
      *,
      user:profiles!flagged_content_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Get flagged content statistics
  const [
    { count: pendingFlags },
    { count: approvedFlags },
    { count: dismissedFlags },
    { count: totalFlags }
  ] = await Promise.all([
    supabase
      .from('flagged_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('flagged_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    supabase
      .from('flagged_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'dismissed'),
    supabase
      .from('flagged_content')
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

  // Content type labels
  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'comment': 'Comment',
      'review': 'Review',
      'profile': 'Profile',
      'activity': 'Activity',
      'bio': 'Bio'
    }
    return labels[type] || type
  }

  // Content type icons
  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'comment': '💬',
      'review': '⭐',
      'profile': '👤',
      'activity': '📝',
      'bio': '📄'
    }
    return icons[type] || '📌'
  }

  // Flag reason labels
  const getFlagReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'profanity': 'Profanity Detected',
      'spam': 'Spam Pattern',
      'suspicious_links': 'Suspicious Links',
      'inappropriate': 'Inappropriate Content',
      'violence': 'Violence/Threats',
      'hate_speech': 'Hate Speech'
    }
    return labels[reason] || reason
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#FFC107',
      'approved': '#F44336',
      'dismissed': '#4CAF50'
    }
    return colors[status] || '#999'
  }

  // Severity colors
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'low': '#4CAF50',
      'medium': '#FFC107',
      'high': '#FF9800',
      'critical': '#F44336'
    }
    return colors[severity] || '#999'
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
          Flagged Content
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Auto-flagged content requiring moderation review
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
            Pending Review
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FFC107'
          }}>
            {pendingFlags || 0}
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
            Approved (Removed)
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F44336'
          }}>
            {approvedFlags || 0}
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
            Dismissed
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#4CAF50'
          }}>
            {dismissedFlags || 0}
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
            Total Flags
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalFlags || 0}
          </div>
        </div>
      </div>

      {/* Flagged Content Table */}
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
            Flagged Content (Last 100)
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
                }}>User</th>
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
                }}>Content</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Severity</th>
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
              {flaggedContent && flaggedContent.length > 0 ? (
                flaggedContent.map((item: any) => (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatTime(item.created_at)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>
                        {getContentTypeIcon(item.content_type)}
                      </span>
                      {getContentTypeLabel(item.content_type)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.user?.avatar_url && (
                          <img
                            src={item.user.avatar_url}
                            alt={item.user.username}
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
                            {item.user?.display_name || item.user?.username || 'Unknown'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{item.user?.username || 'unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      {getFlagReasonLabel(item.flag_reason)}
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
                        {item.content_text || 'No preview available'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: getSeverityColor(item.severity),
                        color: '#fff',
                        textTransform: 'capitalize'
                      }}>
                        {item.severity || 'medium'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: getStatusColor(item.status),
                        color: '#fff',
                        textTransform: 'capitalize'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No flagged content found
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

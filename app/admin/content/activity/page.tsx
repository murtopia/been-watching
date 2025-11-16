import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ContentNav from '../ContentNav'

export default async function AdminContentActivityPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Fetch recent activities with user and target user details
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      user:profiles!activities_user_id_fkey(id, username, display_name, avatar_url),
      target_user:profiles!activities_target_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Activity type labels
  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      'rating': 'Rated',
      'comment': 'Commented on',
      'follow': 'Followed',
      'like_activity': 'Liked activity',
      'watchlist_add': 'Added to watchlist',
      'completion': 'Completed'
    }
    return labels[type] || type
  }

  // Activity type icons
  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      'rating': '⭐',
      'comment': '💬',
      'follow': '👤',
      'like_activity': '❤️',
      'watchlist_add': '📋',
      'completion': '✅'
    }
    return icons[type] || '📌'
  }

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

  // Get activity stats
  const last24Hours = new Date(Date.now() - 86400000).toISOString()
  const last7Days = new Date(Date.now() - 604800000).toISOString()

  const [
    { count: activitiesLast24h },
    { count: activitiesLast7d },
    { count: totalActivities }
  ] = await Promise.all([
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24Hours),
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days),
    supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
  ])

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Sub-navigation */}
      <ContentNav />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          Recent Activity
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Real-time feed of all user actions across the platform
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
            Last 24 Hours
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {activitiesLast24h || 0}
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
            {activitiesLast7d || 0}
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
            Total Activities
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalActivities || 0}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
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
            Activity Feed (Last 100)
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
                }}>User</th>
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
                }}>Shows</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {activities && activities.length > 0 ? (
                activities.map((activity: any) => (
                  <tr key={activity.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatTime(activity.created_at)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {activity.user?.avatar_url && (
                          <img
                            src={activity.user.avatar_url}
                            alt={activity.user.username}
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
                            {activity.user?.display_name || activity.user?.username || 'Unknown'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{activity.user?.username || 'unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>
                        {getActivityIcon(activity.activity_type)}
                      </span>
                      {getActivityLabel(activity.activity_type)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)'
                    }}>
                      {activity.media_title || activity.target_user?.username || '-'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      maxWidth: '200px'
                    }}>
                      {activity.activity_type === 'rating' && activity.rating_value && (
                        <span>⭐ {activity.rating_value}/5</span>
                      )}
                      {activity.activity_type === 'follow' && activity.target_user && (
                        <span>→ @{activity.target_user.username}</span>
                      )}
                      {activity.comment_text && (
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {activity.comment_text}
                        </div>
                      )}
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
                    No activities found
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

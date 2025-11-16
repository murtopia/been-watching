import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ModerationNav from '../ModerationNav'

export default async function AdminModerationBansPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Fetch banned users
  const { data: bannedUsers } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_banned', true)
    .order('banned_at', { ascending: false })

  // Get ban statistics
  const { count: totalBans } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_banned', true)

  // Permanent vs temporary bans
  const permanentBans = bannedUsers?.filter(u => !u.ban_expires_at).length || 0
  const temporaryBans = bannedUsers?.filter(u => u.ban_expires_at).length || 0

  // Bans in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 604800000).toISOString()
  const { count: bansLast7d } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_banned', true)
    .gte('banned_at', sevenDaysAgo)

  // Format timestamp
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never'

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

  // Format expiry date
  const formatExpiry = (timestamp: string | null) => {
    if (!timestamp) return 'Permanent'

    const date = new Date(timestamp)
    const now = new Date()

    if (date < now) return 'Expired'

    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) return `${diffHours}h remaining`
    if (diffDays < 7) return `${diffDays}d remaining`
    return date.toLocaleDateString()
  }

  // Get ban type color
  const getBanTypeColor = (expiresAt: string | null) => {
    if (!expiresAt) return '#F44336' // Permanent - red
    const date = new Date(expiresAt)
    const now = new Date()
    if (date < now) return '#999' // Expired - gray
    return '#FF9800' // Temporary - orange
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
          Banned Users
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Manage banned accounts and ban durations
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
            Total Bans
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F44336'
          }}>
            {totalBans || 0}
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
            {bansLast7d || 0}
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
            Permanent Bans
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#F44336'
          }}>
            {permanentBans}
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
            Temporary Bans
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#FF9800'
          }}>
            {temporaryBans}
          </div>
        </div>
      </div>

      {/* Banned Users Table */}
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
            Banned Users List
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
                }}>User</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Email</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Banned At</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Ban Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Expires</th>
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
              {bannedUsers && bannedUsers.length > 0 ? (
                bannedUsers.map((user: any) => (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'background 0.2s'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {user.avatar_url && (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
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
                            {user.display_name || user.username}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {user.email || 'N/A'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatTime(user.banned_at)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: getBanTypeColor(user.ban_expires_at),
                        color: '#fff'
                      }}>
                        {user.ban_expires_at ? 'Temporary' : 'Permanent'}
                      </span>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatExpiry(user.ban_expires_at)}
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
                        {user.ban_reason || 'No reason provided'}
                      </div>
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
                    No banned users found
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

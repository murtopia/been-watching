import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ContentNav from '../ContentNav'

export default async function AdminContentRatingsPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Parse media_id to get type and display info
  const parseMediaId = (mediaId: string) => {
    if (!mediaId) return { type: 'unknown', id: '', display: 'Unknown', typeLabel: '' }

    // Format: tv-196322-s1 or movie-866398
    const parts = mediaId.split('-')
    if (parts[0] === 'tv') {
      return {
        type: 'tv',
        typeLabel: '📺 TV Show',
        id: parts[1],
        season: parts[2] || null,
        display: `TV Show ${parts[1]}${parts[2] ? ` (${parts[2]})` : ''}`
      }
    } else if (parts[0] === 'movie') {
      return {
        type: 'movie',
        typeLabel: '🎬 Movie',
        id: parts[1],
        season: null,
        display: `Movie ${parts[1]}`
      }
    }
    return { type: 'unknown', typeLabel: '❓', id: mediaId, season: null, display: mediaId }
  }

  // Fetch recent ratings with user details
  const { data: ratings } = await supabase
    .from('ratings')
    .select(`
      *,
      user:profiles!ratings_user_id_fkey(id, username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch TMDB titles for ratings
  const fetchMediaTitle = async (type: string, id: string) => {
    try {
      const tmdbType = type === 'tv' ? 'tv' : 'movie'
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TMDB_API_BASE || 'https://api.themoviedb.org/3'}/${tmdbType}/${id}?api_key=${process.env.TMDB_API_KEY}`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      )

      if (!response.ok) return null

      const data = await response.json()
      return type === 'tv' ? data.name : data.title
    } catch (error) {
      console.error(`Error fetching title for ${type} ${id}:`, error)
      return null
    }
  }

  // Add titles to ratings
  const ratingsWithTitles = await Promise.all(
    (ratings || []).map(async (rating) => {
      const mediaInfo = parseMediaId(rating.media_id)
      const title = await fetchMediaTitle(mediaInfo.type, mediaInfo.id)
      return {
        ...rating,
        mediaInfo,
        displayName: title
          ? `${title}${mediaInfo.season ? ` (${mediaInfo.season})` : ''}`
          : mediaInfo.display
      }
    })
  )

  // Calculate rating statistics
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rating, created_at')

  const totalRatings = allRatings?.length || 0

  // Ratings in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 604800000).toISOString()
  const { count: ratingsLast7d } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  // Distribution by rating value (love/like/meh)
  const ratingDistribution = ['love', 'like', 'meh'].map(rating => {
    const count = allRatings?.filter(r => r.rating === rating).length || 0
    const percentage = totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(1) : '0.0'
    return { rating, count, percentage }
  })

  // Helper to get rating emoji
  const getRatingEmoji = (rating: string) => {
    const emojis: Record<string, string> = {
      'love': '❤️',
      'like': '👍',
      'meh': '😐'
    }
    return emojis[rating] || '❓'
  }

  // Helper to get rating color
  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      'love': '#FF2D55',
      'like': '#4CAF50',
      'meh': '#FFC107'
    }
    return colors[rating] || '#999'
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
          Ratings & Reviews
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          All user ratings across movies and TV shows
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
            Total Ratings
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalRatings}
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
            Most Common
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            ❤️ Love
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
            {ratingsLast7d || 0}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div style={{
        background: 'var(--card-bg)',
        border: 'var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 1.5rem 0'
        }}>
          Rating Distribution
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {getRatingEmoji(rating)} {rating}
              </div>
              <div style={{
                flex: 1,
                height: '24px',
                background: 'var(--background)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: getRatingColor(rating),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                minWidth: '100px',
                textAlign: 'right'
              }}>
                {count} ({percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ratings */}
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
            Recent Ratings (Last 100)
          </h2>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px'
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
                }}>Shows</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Rating</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>My Take</th>
              </tr>
            </thead>
            <tbody>
              {ratingsWithTitles && ratingsWithTitles.length > 0 ? (
                ratingsWithTitles.map((rating: any) => (
                    <tr key={rating.id} style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatTime(rating.created_at)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {rating.user?.avatar_url && (
                            <img
                              src={rating.user.avatar_url}
                              alt={rating.user.username}
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
                              {rating.user?.display_name || rating.user?.username || 'Unknown'}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)'
                            }}>
                              @{rating.user?.username || 'unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)'
                      }}>
                        <div>{rating.displayName}</div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.25rem'
                        }}>
                          {rating.mediaInfo.typeLabel}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: getRatingColor(rating.rating)
                      }}>
                        {getRatingEmoji(rating.rating)} {rating.rating}
                      </td>
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '300px'
                      }}>
                        {rating.my_take ? (
                          <div style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {rating.my_take}
                          </div>
                        ) : (
                          <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No take</span>
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
                    No ratings found
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

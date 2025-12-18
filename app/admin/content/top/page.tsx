import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ContentNav from '../ContentNav'

export default async function AdminContentTopPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Get all ratings
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('media_id, rating')

  // Aggregate ratings by media - use a scoring system for love/like/meh
  const mediaMap = new Map<string, {
    media_id: string
    ratings: { rating: string }[]
    count: number
    loveCount: number
    likeCount: number
    mehCount: number
    score: number
  }>()

  allRatings?.forEach((rating) => {
    if (!rating.media_id) return

    if (!mediaMap.has(rating.media_id)) {
      mediaMap.set(rating.media_id, {
        media_id: rating.media_id,
        ratings: [],
        count: 0,
        loveCount: 0,
        likeCount: 0,
        mehCount: 0,
        score: 0
      })
    }

    const media = mediaMap.get(rating.media_id)!
    media.ratings.push({ rating: rating.rating })
    media.count++

    // Count each rating type
    if (rating.rating === 'love') media.loveCount++
    else if (rating.rating === 'like') media.likeCount++
    else if (rating.rating === 'meh') media.mehCount++

    // Calculate score: love=3, like=2, meh=1
    media.score = (media.loveCount * 3) + (media.likeCount * 2) + (media.mehCount * 1)
  })

  // Parse media_id to get type and display info
  const parseMediaId = (mediaId: string) => {
    if (!mediaId) return { type: 'unknown', id: '', display: 'Unknown', typeLabel: '', season: null }

    const parts = mediaId.split('-')
    if (parts[0] === 'tv') {
      return {
        type: 'tv',
        typeLabel: '📺 TV',
        id: parts[1],
        season: parts[2] || null,
        display: `TV ${parts[1]}${parts[2] ? ` ${parts[2].toUpperCase()}` : ''}`
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

  // Fetch TMDB titles for top rated content
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

  // Convert to array and add parsed info
  const mediaArray = Array.from(mediaMap.values()).map(media => ({
    ...media,
    ...parseMediaId(media.media_id)
  }))

  // Most Rated (by count)
  const topByRatingCount = mediaArray
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Highest Rated (by score, min 3 ratings)
  const topByScore = mediaArray
    .filter(m => m.count >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)

  // Fetch titles for top content
  const topByRatingCountWithTitles = await Promise.all(
    topByRatingCount.map(async (media) => {
      const title = await fetchMediaTitle(media.type, media.id)
      return {
        ...media,
        title: title || media.display,
        displayName: title
          ? `${title}${media.season ? ` (${media.season.toUpperCase()})` : ''}`
          : media.display
      }
    })
  )

  const topByScoreWithTitles = await Promise.all(
    topByScore.map(async (media) => {
      const title = await fetchMediaTitle(media.type, media.id)
      return {
        ...media,
        title: title || media.display,
        displayName: title
          ? `${title}${media.season ? ` (${media.season.toUpperCase()})` : ''}`
          : media.display
      }
    })
  )

  // Stats
  const uniqueMoviesRated = mediaArray.filter(m => m.type === 'movie').length
  const uniqueShowsRated = mediaArray.filter(m => m.type === 'tv').length
  const totalUniqueContent = mediaMap.size

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
          Top Media
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Most popular movies and TV shows by ratings
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
            Total Unique Content
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {totalUniqueContent}
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
            Movies Rated
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {uniqueMoviesRated}
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
            TV Shows Rated
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {uniqueShowsRated}
          </div>
        </div>
      </div>

      {/* Most Rated */}
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
          Most Rated (Top 20)
        </h2>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '700px'
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
                  color: 'var(--text-secondary)',
                  width: '50px'
                }}>#</th>
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
                }}>Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Total Ratings</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {topByRatingCountWithTitles.map((media, index) => (
                <tr key={media.media_id} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}>
                    #{index + 1}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    {media.displayName}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {media.typeLabel}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    {media.count}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span>❤️ {media.loveCount}</span>
                      <span>👍 {media.likeCount}</span>
                      <span>😐 {media.mehCount}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Highest Rated by Score */}
      <div style={{
        background: 'var(--card-bg)',
        border: 'var(--border)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 1.5rem 0'
        }}>
          Highest Rated (Top 20, min 3 ratings)
        </h2>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'var(--background)',
          borderRadius: '8px'
        }}>
          Score calculation: Love = 3 points, Like = 2 points, Meh = 1 point
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '700px'
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
                  color: 'var(--text-secondary)',
                  width: '50px'
                }}>#</th>
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
                }}>Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Score</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Ratings</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}>Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {topByScoreWithTitles.map((media, index) => (
                <tr key={media.media_id} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}>
                    #{index + 1}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    {media.displayName}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {media.typeLabel}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#FFC125'
                  }}>
                    {media.score}
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {media.count} total
                  </td>
                  <td style={{
                    padding: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span>❤️ {media.loveCount}</span>
                      <span>👍 {media.likeCount}</span>
                      <span>😐 {media.mehCount}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

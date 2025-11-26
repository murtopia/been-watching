import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Default values
const DEFAULT_BG_GRADIENT = ['#0a0a0a', '#1a0a1a']
const DEFAULT_BRAND_COLOR = '#FF006E'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query params
    const type = searchParams.get('type') || 'show' // 'show', 'profile', 'top3', 'list'
    const id = searchParams.get('id')
    const sharedBy = searchParams.get('shared_by')

    // For demo/testing, use mock data - in production, fetch from database
    const data = await getMockData(type, id, sharedBy)

    // Generate the appropriate card based on type
    if (type === 'show') {
      return generateShowCard(data)
    } else if (type === 'profile') {
      return generateProfileCard(data)
    } else if (type === 'top3') {
      return generateTop3Card(data)
    } else if (type === 'list') {
      return generateListCard(data)
    }

    // Default fallback
    return generateDefaultCard()
  } catch (e: any) {
    console.log(`Error generating OG image: ${e.message}`)
    return new Response('Failed to generate image', { status: 500 })
  }
}

/**
 * Generate OG card for a show/movie
 */
function generateShowCard(data: any) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `linear-gradient(135deg, ${DEFAULT_BG_GRADIENT[0]}, ${DEFAULT_BG_GRADIENT[1]})`,
          padding: '40px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Poster */}
        {data.posterUrl && (
          <img
            src={data.posterUrl}
            width={420}
            height={630}
            style={{
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '40px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          >
            {data.title}
          </div>

          {/* Meta info */}
          {(data.year || data.genres) && (
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '32px',
              }}
            >
              {data.year && data.year}
              {data.year && data.genres && ' • '}
              {data.genres && data.genres.join(', ')}
            </div>
          )}

          {/* Rating */}
          {data.rating && (
            <div
              style={{
                fontSize: 48,
                marginBottom: '32px',
                display: 'flex',
              }}
            >
              {typeof data.rating === 'string' ? (
                <span style={{ fontSize: 48 }}>
                  {data.rating === 'love' ? '❤️' : data.rating === 'like' ? '👍' : '😐'}
                </span>
              ) : (
                Array(5).fill(0).map((_, i) => (
                  <span key={i} style={{ marginRight: '4px' }}>
                    {i < Math.floor(data.rating) ? '⭐' : '☆'}
                  </span>
                ))
              )}
            </div>
          )}

          {/* Comment */}
          {data.comment && (
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
                fontStyle: 'italic',
                marginBottom: '40px',
              }}
            >
              "{data.comment.length > 80 ? data.comment.substring(0, 77) + '...' : data.comment}"
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {data.sharedBy && (
              <>
                <span>@{data.sharedBy}</span>
                <span style={{ margin: '0 12px' }}>•</span>
              </>
            )}
            <span style={{ fontWeight: 'bold' }}>BEEN WATCHING</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

/**
 * Generate OG card for a user profile
 */
function generateProfileCard(data: any) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: `linear-gradient(135deg, ${DEFAULT_BG_GRADIENT[0]}, ${DEFAULT_BG_GRADIENT[1]})`,
          padding: '60px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          alignItems: 'center',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: data.avatarUrl ? `url(${data.avatarUrl})` : 'rgba(255, 255, 255, 0.1)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '4px solid',
            borderColor: DEFAULT_BRAND_COLOR,
            marginRight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          {!data.avatarUrl && data.username?.[0]?.toUpperCase()}
        </div>

        {/* User Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
            }}
          >
            {data.displayName || data.username}
          </div>
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '24px',
            }}
          >
            @{data.username}
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '40px',
            }}
          >
            {data.showCount || 0} Shows Watched • {data.followerCount || 0} Followers
          </div>

          {/* Top 3 shows */}
          {data.topShows && data.topShows.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '16px',
                }}
              >
                Top 3 Shows
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {data.topShows.slice(0, 3).map((show: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      width: 120,
                      height: 180,
                      borderRadius: '8px',
                      background: show.posterUrl ? `url(${show.posterUrl})` : 'rgba(255, 255, 255, 0.1)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            fontSize: 28,
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          beenwatching.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

/**
 * Generate OG card for top 3 shows
 */
function generateTop3Card(data: any) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${DEFAULT_BG_GRADIENT[0]}, ${DEFAULT_BG_GRADIENT[1]})`,
          padding: '60px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '40px',
          }}
        >
          {data.username ? `@${data.username}'s` : 'My'} Top 3 Shows
        </div>

        {/* Shows */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
          {(data.shows || []).slice(0, 3).map((show: any, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 280,
                  height: 420,
                  borderRadius: '12px',
                  background: show.posterUrl ? `url(${show.posterUrl})` : 'rgba(255, 255, 255, 0.1)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
              />
              <div
                style={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                {show.title}
              </div>
              {show.rating && (
                <div style={{ fontSize: 28, marginTop: '8px' }}>
                  {'⭐'.repeat(Math.floor(show.rating))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          BEEN WATCHING
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

/**
 * Generate OG card for a watchlist
 */
function generateListCard(data: any) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${DEFAULT_BG_GRADIENT[0]}, ${DEFAULT_BG_GRADIENT[1]})`,
          padding: '60px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '32px',
          }}
        >
          {data.title}
        </div>

        {/* User info */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '40px',
          }}
        >
          @{data.username} • {data.itemCount} items
        </div>

        {/* Grid of posters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {(data.items || []).slice(0, 6).map((item: any, i: number) => (
            <div
              key={i}
              style={{
                width: 160,
                height: 240,
                borderRadius: '8px',
                background: item.posterUrl ? `url(${item.posterUrl})` : 'rgba(255, 255, 255, 0.1)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            >
              {/* Overlay for "+X more" on last item */}
              {i === 5 && data.itemCount > 6 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  +{data.itemCount - 6} more
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: 'auto',
          }}
        >
          BEEN WATCHING
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

/**
 * Generate default OG card
 */
function generateDefaultCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${DEFAULT_BG_GRADIENT[0]}, ${DEFAULT_BG_GRADIENT[1]})`,
          padding: '60px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            background: `linear-gradient(135deg, #FF006E, #FF8E53)`,
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '24px',
          }}
        >
          BEEN WATCHING
        </div>
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          Track. Share. Discover.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

/**
 * Mock data for testing - replace with actual database queries
 */
async function getMockData(type: string, id: string | null, sharedBy: string | null) {
  // In production, fetch from your database based on type and id
  // For now, return mock data

  if (type === 'show') {
    return {
      title: 'Breaking Bad',
      year: 2008,
      genres: ['Crime', 'Drama', 'Thriller'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      rating: 5,
      comment: 'Absolutely incredible show! The character development is unmatched.',
      sharedBy: sharedBy || 'murtopia',
    }
  } else if (type === 'profile') {
    return {
      username: sharedBy || 'murtopia',
      displayName: 'Nick',
      avatarUrl: null, // Will show initial
      showCount: 250,
      followerCount: 342,
      topShows: [
        { posterUrl: 'https://image.tmdb.org/t/p/w200/ggFHVNu6YYI5L9pCfOacjizRGt.jpg' },
        { posterUrl: 'https://image.tmdb.org/t/p/w200/rgMfhcrVZjuy5b7Pn0KzCRCEnMX.jpg' },
        { posterUrl: 'https://image.tmdb.org/t/p/w200/2IWouZK4gkgHhJa3oyYuSWfSqbG.jpg' },
      ],
    }
  } else if (type === 'top3') {
    return {
      username: sharedBy || 'murtopia',
      shows: [
        {
          title: 'Breaking Bad',
          posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
          rating: 5,
        },
        {
          title: 'The Bear',
          posterUrl: 'https://image.tmdb.org/t/p/w500/rgMfhcrVZjuy5b7Pn0KzCRCEnMX.jpg',
          rating: 5,
        },
        {
          title: 'Succession',
          posterUrl: 'https://image.tmdb.org/t/p/w500/2IWouZK4gkgHhJa3oyYuSWfSqbG.jpg',
          rating: 5,
        },
      ],
    }
  } else if (type === 'list') {
    return {
      title: 'Want to Watch',
      username: sharedBy || 'murtopia',
      itemCount: 12,
      items: Array(6).fill({
        posterUrl: 'https://image.tmdb.org/t/p/w200/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      }),
    }
  }

  return {}
}
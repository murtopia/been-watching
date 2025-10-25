'use client'

import { useState, useEffect } from 'react'
import MediaBadges from './MediaBadges'
import { useThemeColors } from '@/hooks/useThemeColors'

interface MediaCardProps {
  media: {
    id?: string
    title?: string
    name?: string
    poster_path?: string
    vote_average?: number
    release_date?: string
    first_air_date?: string
    overview?: string
    media_type?: string
    tmdb_id?: number
    tmdb_data?: any
    number_of_seasons?: number
    networks?: any[]
  }
  onRate?: (rating: string) => void
  onStatus?: (status: string) => void
  currentRating?: string | null
  currentStatus?: string | null
  seasonNumber?: number
  showActions?: boolean
}

export default function MediaCard({
  media,
  onRate,
  onStatus,
  currentRating,
  currentStatus,
  seasonNumber,
  showActions = true
}: MediaCardProps) {
  const [showFullOverview, setShowFullOverview] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const colors = useThemeColors()

  const title = media.title || media.name || 'Untitled'
  const releaseDate = media.release_date || media.first_air_date
  const mediaType = media.media_type || (media.id?.startsWith('tv-') ? 'tv' : 'movie')
  const tmdbId = media.tmdb_id

  // Fetch trailer on mount
  useEffect(() => {
    const fetchTrailer = async () => {
      if (!tmdbId) return
      try {
        const type = mediaType === 'tv' ? 'tv' : 'movie'
        const response = await fetch(`/api/tmdb/${type}/${tmdbId}/videos`)
        const data = await response.json()
        const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
        if (trailer) {
          setTrailerKey(trailer.key)
        }
      } catch (error) {
        console.error('Error fetching trailer:', error)
      }
    }
    fetchTrailer()
  }, [tmdbId, mediaType])

  const handleTrailerClick = () => {
    if (trailerKey) {
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')
    }
  }

  return (
    <div className="media-card-container">
      <div className="feed-show-content">
        {media.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w185${media.poster_path}`}
            alt={title}
            className="feed-show-poster"
          />
        )}
        <div className="feed-show-info">
          <div className="feed-show-title">{title}</div>
          <div className="feed-show-meta">
            {releaseDate && (
              <span>{releaseDate.substring(0, 4)}</span>
            )}
            {media.vote_average && (
              <span> • ⭐ {media.vote_average.toFixed(1)}</span>
            )}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <MediaBadges
              mediaType={mediaType as 'tv' | 'movie'}
              seasonNumber={seasonNumber}
              season={!seasonNumber && mediaType === 'tv' ? (media.tmdb_data?.number_of_seasons || media.number_of_seasons || 1) : undefined}
              networks={media.tmdb_data?.networks || media.networks || []}
              showTrailer={!!trailerKey}
              onTrailerClick={handleTrailerClick}
            />
          </div>
          {media.overview && (
            <div className="feed-show-overview">
              <p style={{
                fontSize: '0.875rem',
                color: colors.textPrimary,
                lineHeight: '1.4',
                margin: '0.5rem 0 0 0',
                display: showFullOverview ? 'block' : '-webkit-box',
                WebkitLineClamp: showFullOverview ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {media.overview}
              </p>
              {media.overview.length > 100 && (
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    style={{
                      color: colors.brandBlue,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginTop: '0.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showFullOverview ? 'Show less' : 'Read more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick rate buttons */}
      {showActions && onRate && (
        <div className="quick-rate">
          <button
            className={`quick-rate-btn meh ${currentRating === 'meh' ? 'active' : ''}`}
            onClick={() => onRate('meh')}
          >
            😐 Meh
          </button>
          <button
            className={`quick-rate-btn like ${currentRating === 'like' ? 'active' : ''}`}
            onClick={() => onRate('like')}
          >
            👍 Like
          </button>
          <button
            className={`quick-rate-btn love ${currentRating === 'love' ? 'active' : ''}`}
            onClick={() => onRate('love')}
          >
            ❤️ Love
          </button>
        </div>
      )}

      {/* Quick status buttons */}
      {showActions && onStatus && (
        <div className="quick-status">
          <div className="status-btn-group">
            <button
              className={`quick-status-btn ${currentStatus === 'want' ? 'active' : ''}`}
              onClick={() => onStatus(currentStatus === 'want' ? null as any : 'want')}
            >
              ➕ Want to Watch
            </button>
          </div>
          <div className="status-btn-group">
            <button
              className={`quick-status-btn ${currentStatus === 'watching' ? 'active' : ''}`}
              onClick={() => onStatus(currentStatus === 'watching' ? null as any : 'watching')}
            >
              ▶️ Watching
            </button>
          </div>
          <div className="status-btn-group">
            <button
              className={`quick-status-btn ${currentStatus === 'watched' ? 'active' : ''}`}
              onClick={() => onStatus(currentStatus === 'watched' ? null as any : 'watched')}
            >
              ✓ Watched
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import MediaBadges from './MediaBadges'
import { useThemeColors } from '@/hooks/useThemeColors'
import { safeExtractYear } from '@/utils/dateFormatting'

export type MediaCardVariant = 'grid' | 'list' | 'feed' | 'compact'

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
  variant?: MediaCardVariant
  onRate?: (rating: string) => void
  onStatus?: (status: string) => void
  onClick?: () => void
  currentRating?: string | null
  currentStatus?: string | null
  seasonNumber?: number
  showActions?: boolean
  showOverview?: boolean
  posterSize?: 'w185' | 'w342' | 'w500'
}

export default function MediaCard({
  media,
  variant = 'feed',
  onRate,
  onStatus,
  onClick,
  currentRating,
  currentStatus,
  seasonNumber,
  showActions = true,
  showOverview = true,
  posterSize = 'w185'
}: MediaCardProps) {
  const [showFullOverview, setShowFullOverview] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const colors = useThemeColors()

  const title = media.title || media.name || 'Untitled'
  const releaseDate = media.release_date || media.first_air_date
  const year = safeExtractYear(releaseDate)
  const mediaIdStr = media.id ? String(media.id) : ''
  const mediaType = media.media_type || (mediaIdStr.startsWith('tv-') ? 'tv' : 'movie')
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

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (trailerKey) {
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  // Fallback poster URL - use a data URI for a simple placeholder
  const getPlaceholderUrl = () => {
    // Create a simple SVG placeholder
    const svg = `
      <svg width="342" height="513" xmlns="http://www.w3.org/2000/svg">
        <rect width="342" height="513" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">No Image</text>
      </svg>
    `
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }

  const posterUrl = imageError || !media.poster_path
    ? getPlaceholderUrl()
    : `https://image.tmdb.org/t/p/${posterSize}${media.poster_path}`

  // Extract season number from media ID if present (e.g., "tv-12345-s2" -> 2)
  const extractedSeasonNumber = seasonNumber || (mediaIdStr.includes('-s') 
    ? parseInt(mediaIdStr.split('-s')[1]) 
    : null)

  // Compact variant - tight single-row for scanning large lists
  if (variant === 'compact') {
    // Build the display title with season abbreviation
    const baseTitle = media.name || media.title || 'Untitled'
    // Remove any existing "- Season X" suffix from the title
    const cleanTitle = baseTitle.replace(/ - Season \d+$/, '')
    const displayTitle = extractedSeasonNumber 
      ? `${cleanTitle} - S${extractedSeasonNumber}` 
      : cleanTitle
    const metaText = year ? ` • ${year}` : ''

    // Get rating icon
    const getRatingIcon = () => {
      if (!currentRating) return null
      const iconId = currentRating === 'love' ? 'heart-active' 
        : currentRating === 'like' ? 'thumbs-up-active' 
        : 'meh-face-active'
      return (
        <svg width="16" height="16" style={{ flexShrink: 0 }}>
          <use xlinkHref={`/icons/feed-sprite.svg#${iconId}`} />
        </svg>
      )
    }

    return (
      <div
        onClick={handleCardClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.375rem 0',
          borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        {/* Tiny Poster */}
        <img
          src={posterUrl}
          alt={cleanTitle}
          onError={handleImageError}
          style={{
            width: '24px',
            height: '36px',
            objectFit: 'cover',
            borderRadius: '3px',
            flexShrink: 0
          }}
        />
        
        {/* Title + Meta on one line */}
        <div style={{
          flex: 1,
          minWidth: 0,
          fontSize: '0.8125rem',
          color: colors.textPrimary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <span style={{ fontWeight: '500' }}>{displayTitle}</span>
          <span style={{ color: colors.textSecondary }}>{metaText}</span>
        </div>

        {/* Rating Icon */}
        {getRatingIcon()}
      </div>
    )
  }

  // Grid variant - compact card for grid layouts
  if (variant === 'grid') {
    return (
      <div
        className="show-card"
        onClick={handleCardClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="poster-container" style={{ position: 'relative' }}>
          <img
            src={posterUrl}
            alt={title}
            className="show-poster"
            onError={handleImageError}
          />
          {/* Rating Badge - using SVG sprite icons */}
          {currentRating && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <svg width="18" height="18">
                <use xlinkHref={`/icons/feed-sprite.svg#${currentRating === 'love' ? 'heart-active' : currentRating === 'like' ? 'thumbs-up-active' : 'meh-face-active'}`} />
              </svg>
            </div>
          )}
        </div>
        <div className="show-title">{title}</div>
      </div>
    )
  }

  // List/Feed variant - horizontal layout
  return (
    <div 
      className={`media-card-container ${variant === 'list' ? 'media-card-list' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="feed-show-content">
        {media.poster_path && (
          <img
            src={posterUrl}
            alt={title}
            className="feed-show-poster"
            onError={handleImageError}
          />
        )}
        <div className="feed-show-info">
          <div className="feed-show-title">{title}</div>
          <div className="feed-show-meta">
            {year && (
              <span>{year}</span>
            )}
            {media.vote_average !== undefined && media.vote_average > 0 && (
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
              onTrailerClick={() => {
                if (trailerKey) {
                  window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')
                }
              }}
            />
          </div>
          {showOverview && media.overview && (
            <div className="feed-show-overview">
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary || 'rgba(255, 255, 255, 0.7)',
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFullOverview(!showFullOverview)
                    }}
                    style={{
                      color: colors.goldAccent,
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
        <div className="quick-rate" onClick={(e) => e.stopPropagation()}>
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
        <div className="quick-status" onClick={(e) => e.stopPropagation()}>
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

'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { safeExtractYear } from '@/utils/dateFormatting'
import MediaBadges from '../media/MediaBadges'

interface ReleaseNotificationCardProps {
  release: {
    id: string
    season_number?: number
    release_date: string
    notification_type: 'announcement' | 'week_before' | 'day_of' | 'theatrical_release' | 'streaming_available'
    streaming_service?: string
    media: {
      id: string
      title: string
      poster_path?: string
      vote_average?: number
      release_date?: string
      overview?: string
      media_type?: string
      tmdb_id?: number
      tmdb_data?: any
    }
    user_status?: string | null
  }
  onAddToWantToWatch?: (mediaId: string) => void
  onMarkSeen?: (releaseId: string) => void
  onMediaClick?: (media: any) => void
}

export default function ReleaseNotificationCard({
  release,
  onAddToWantToWatch,
  onMarkSeen,
  onMediaClick
}: ReleaseNotificationCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const releaseDate = new Date(release.release_date)
  const today = new Date()
  const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const getCountdownText = () => {
    if (release.notification_type === 'streaming_available') {
      return 'Available Now'
    }
    if (daysUntilRelease <= 0) {
      return 'Released Today'
    }
    if (daysUntilRelease === 1) {
      return 'Tomorrow'
    }
    return `${daysUntilRelease} days`
  }

  const getBadgeText = () => {
    if (release.notification_type === 'streaming_available') {
      return '🎬 Now Streaming'
    }
    if (release.notification_type === 'theatrical_release') {
      return '🎬 In Theaters'
    }
    if (release.season_number) {
      return `📺 Season ${release.season_number}`
    }
    return '📺 New Season'
  }

  const getTitle = () => {
    if (release.notification_type === 'streaming_available') {
      return 'Now Available!'
    }
    if (release.notification_type === 'theatrical_release') {
      return 'Opening This Week!'
    }
    return 'New Season Coming!'
  }

  const handleAddToWantToWatch = () => {
    if (onAddToWantToWatch) {
      onAddToWantToWatch(release.media.id)
    }
  }

  const handleMarkSeen = () => {
    if (onMarkSeen) {
      onMarkSeen(release.id)
    }
    setDismissed(true)
  }

  const mediaType = release.media.media_type || 
    (release.media.id?.startsWith('tv-') ? 'tv' : 'movie')

  return (
    <div className="release-notification-card" style={{
      background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
      border: '2px solid #8b5cf6',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '1rem',
      position: 'relative'
    }}>
      {/* Badge */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        background: '#8b5cf6',
        color: 'white',
        padding: '0.25rem 0.625rem',
        borderRadius: '10px',
        fontSize: '0.6875rem',
        fontWeight: '600'
      }}>
        {getBadgeText()}
      </div>

      {/* Header */}
      <div style={{ padding: '1rem 1rem 0.5rem' }}>
        <div style={{
          fontWeight: '600',
          fontSize: '0.9375rem',
          color: '#5b21b6',
          marginBottom: '0.375rem'
        }}>
          {getTitle()}
        </div>
        <div style={{
          fontSize: '1.125rem',
          fontWeight: '700',
          color: '#7c3aed',
          marginBottom: '0.25rem'
        }}>
          {getCountdownText()}
        </div>
        <div style={{
          fontSize: '0.6875rem',
          color: '#6d28d9'
        }}>
          {release.notification_type === 'streaming_available' 
            ? `on ${release.streaming_service || 'streaming'}`
            : releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          }
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 1rem 1rem',
        display: 'flex',
        gap: '0.75rem'
      }}>
        {release.media.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w185${release.media.poster_path}`}
            alt={release.media.title}
            style={{
              width: '80px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '8px',
              cursor: onMediaClick ? 'pointer' : 'default'
            }}
            onClick={() => onMediaClick?.(release.media)}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '600',
            fontSize: '0.9375rem',
            marginBottom: '0.375rem',
            color: '#111'
          }}>
            {release.media.title}
            {release.season_number && ` Season ${release.season_number}`}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: '#666',
            marginBottom: '0.5rem'
          }}>
            {release.media.release_date && safeExtractYear(release.media.release_date) && (
              <span>{safeExtractYear(release.media.release_date)}</span>
            )}
            {release.media.vote_average && (
              <span> • ⭐ {release.media.vote_average.toFixed(1)}</span>
            )}
          </div>
          {release.notification_type === 'streaming_available' && release.streaming_service && (
            <div style={{
              display: 'inline-block',
              background: '#1f2937',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: '600',
              marginTop: '0.5rem'
            }}>
              {release.streaming_service.toUpperCase()}
            </div>
          )}
          <MediaBadges
            mediaType={mediaType as 'tv' | 'movie'}
            seasonNumber={release.season_number}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <button
          onClick={handleAddToWantToWatch}
          style={{
            width: '100%',
            padding: '0.625rem',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#7c3aed'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#8b5cf6'}
        >
          + Add to Want to Watch
        </button>
        <button
          onClick={handleMarkSeen}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginTop: '0.5rem',
            background: 'transparent',
            color: '#7c3aed',
            border: '1px solid #c4b5fd',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Mark as seen
        </button>
      </div>
    </div>
  )
}


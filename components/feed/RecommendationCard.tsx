'use client'

import { useState } from 'react'
import { safeExtractYear } from '@/utils/dateFormatting'
import MediaBadges from '../media/MediaBadges'
import { X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface RecommendationCardProps {
  recommendation: {
    id: string
    score: number
    algorithm_type: string
    reason: string
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
    user_rating?: string | null
    user_status?: string | null
  }
  onAddToWantToWatch?: (mediaId: string) => void
  onRate?: (mediaId: string, rating: string) => void
  onDismiss?: (recommendationId: string) => void
  onMediaClick?: (media: any) => void
}

export default function RecommendationCard({
  recommendation,
  onAddToWantToWatch,
  onRate,
  onDismiss,
  onMediaClick
}: RecommendationCardProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleAddToWantToWatch = () => {
    if (onAddToWantToWatch) {
      onAddToWantToWatch(recommendation.media.id)
    }
  }

  const handleRate = (rating: string) => {
    if (onRate) {
      onRate(recommendation.media.id, rating)
    }
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(recommendation.id)
    }
    setDismissed(true)
  }

  const mediaType = recommendation.media.media_type || 
    (recommendation.media.id?.startsWith('tv-') ? 'tv' : 'movie')

  return (
    <div className="recommendation-card" style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '2px solid #f59e0b',
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
        background: '#f59e0b',
        color: 'white',
        padding: '0.25rem 0.625rem',
        borderRadius: '10px',
        fontSize: '0.6875rem',
        fontWeight: '600'
      }}>
        ✨ For You
      </div>

      {/* Header */}
      <div style={{ padding: '1rem 1rem 0.5rem' }}>
        <div style={{
          fontWeight: '600',
          fontSize: '0.8125rem',
          color: '#92400e',
          marginBottom: '0.25rem'
        }}>
          Recommended for you
        </div>
        <div style={{
          fontSize: '0.8125rem',
          color: '#78350f'
        }}>
          {recommendation.reason}
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '0 1rem 1rem',
        display: 'flex',
        gap: '0.75rem'
      }}>
        {recommendation.media.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w185${recommendation.media.poster_path}`}
            alt={recommendation.media.title}
            style={{
              width: '80px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '8px',
              cursor: onMediaClick ? 'pointer' : 'default'
            }}
            onClick={() => onMediaClick?.(recommendation.media)}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '600',
            fontSize: '0.9375rem',
            marginBottom: '0.375rem',
            color: '#111'
          }}>
            {recommendation.media.title}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: '#666',
            marginBottom: '0.5rem'
          }}>
            {recommendation.media.release_date && safeExtractYear(recommendation.media.release_date) && (
              <span>{safeExtractYear(recommendation.media.release_date)}</span>
            )}
            {recommendation.media.vote_average && (
              <span> • ⭐ {recommendation.media.vote_average.toFixed(1)}</span>
            )}
          </div>
          <MediaBadges
            mediaType={mediaType as 'tv' | 'movie'}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderTop: '1px solid rgba(245, 158, 11, 0.2)',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleAddToWantToWatch}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            background: '#10b981',
            color: 'white',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
        >
          + Add to Want to Watch
        </button>
        <button
          onClick={() => handleRate('like')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            background: '#3b82f6',
            color: 'white',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          Rate if Seen
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '0.5rem 0.875rem',
            border: '1px solid #d1d5db',
            background: 'white',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            color: '#666',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.color = '#111'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = '#666'
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}


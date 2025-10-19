'use client'

import { useState, useEffect } from 'react'
import MediaCard from './MediaCard'
import { createClient } from '@/utils/supabase/client'

interface MediaDetailModalProps {
  isOpen: boolean
  onClose: () => void
  media: any
  onRate?: (rating: string) => void
  onStatus?: (status: string) => void
  user?: any
}

export default function MediaDetailModal({
  isOpen,
  onClose,
  media,
  onRate,
  onStatus,
  user
}: MediaDetailModalProps) {
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullMediaData, setFullMediaData] = useState<any>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch existing rating/status and full media details when modal opens
  useEffect(() => {
    async function fetchData() {
      if (!isOpen || !media) return

      setLoading(true)

      try {
        // Fetch full media details from TMDB
        const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie')
        const tmdbId = media.tmdb_id || media.id
        const detailsResponse = await fetch(`/api/tmdb/${mediaType}/${tmdbId}`)
        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          setFullMediaData(details)
        }

        // Fetch existing rating/status if user is logged in
        if (user) {
          const supabase = createClient()
          const mediaId = media.media_type === 'movie' ? `movie-${tmdbId}` : `tv-${tmdbId}`

          // Fetch rating
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('rating')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .single()

          if (ratingData) {
            setSelectedRating(ratingData.rating)
          }

          // Fetch watch status
          const { data: statusData } = await supabase
            .from('watch_status')
            .select('status')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .single()

          if (statusData) {
            setSelectedStatus(statusData.status)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen, media, user])

  const handleRating = (rating: string) => {
    setSelectedRating(rating === selectedRating ? null : rating)
    if (onRate) {
      onRate(rating)
    }
  }

  const handleStatus = (status: string) => {
    setSelectedStatus(status === selectedStatus ? null : status)
    if (onStatus) {
      onStatus(status)
    }
  }

  if (!isOpen || !media) return null

  // Merge original media data with full details
  const enrichedMedia = {
    ...media,
    ...(fullMediaData || {}),
    // Preserve original data that might be missing from full fetch
    media_type: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
    tmdb_id: media.tmdb_id || media.id
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.1)',
            color: '#666',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
          }}
        >
          ×
        </button>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ width: '32px', height: '32px', border: '4px solid #e94d88', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <div className="activity-card">
              <MediaCard
                media={enrichedMedia}
                onRate={handleRating}
                onStatus={handleStatus}
                currentRating={selectedRating}
                currentStatus={selectedStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

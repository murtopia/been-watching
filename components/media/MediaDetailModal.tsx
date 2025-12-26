'use client'

import { useState, useEffect } from 'react'
import MediaCard from './MediaCard'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import ShowCommentInput from '@/components/notes/ShowCommentInput'
import { trackShowCommentAdded } from '@/utils/analytics'
import Icon from '@/components/ui/Icon'

interface MediaDetailModalProps {
  isOpen: boolean
  onClose: () => void
  media: any
  onRate?: (rating: string) => void
  onStatus?: (status: string, currentStatus?: string) => void
  onStatusChange?: () => void | Promise<void>
  user?: any
}

export default function MediaDetailModal({
  isOpen,
  onClose,
  media,
  onRate,
  onStatus,
  onStatusChange,
  user
}: MediaDetailModalProps) {
  const colors = useThemeColors()
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullMediaData, setFullMediaData] = useState<any>(null)
  const [userComment, setUserComment] = useState<{ id: string; comment_text: string } | null>(null)

  // Modal-specific colors (matching SearchModal)
  const modalBg = colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.55)'
  const modalBorder = colors.isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.18)'

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
      if (!isOpen || !media) {
        // Reset state when modal closes
        setSelectedRating(null)
        setSelectedStatus(null)
        setFullMediaData(null)
        return
      }

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

          // IMPORTANT: For shows from the database (clicked from myshows page),
          // media.id will be the full ID like "tv-12345-s1"
          // For new shows (from search), we need to construct it
          const mediaIdStr = typeof media.id === 'string' ? media.id : String(media.id || '')
          const mediaId = mediaIdStr && (mediaIdStr.startsWith('tv-') || mediaIdStr.startsWith('movie-'))
            ? mediaIdStr  // Already have the correct format from database
            : (media.media_type === 'movie' ? `movie-${tmdbId}` : `tv-${tmdbId}`) // Construct for new shows

          console.log('MediaDetailModal: Looking up rating/status for mediaId:', mediaId)

          // Fetch rating
          const { data: ratingData } = await supabase
            .from('ratings')
            .select('rating')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .maybeSingle()

          if (ratingData) {
            setSelectedRating(ratingData.rating)
          } else {
            setSelectedRating(null)
          }

          // Fetch watch status
          const { data: statusData } = await supabase
            .from('watch_status')
            .select('status')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .maybeSingle()

          if (statusData) {
            setSelectedStatus(statusData.status)
          } else {
            setSelectedStatus(null)
          }

          // Fetch user's comment for this show
          const { data: commentData } = await supabase
            .from('show_comments')
            .select('id, comment_text')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .maybeSingle()

          if (commentData) {
            setUserComment(commentData)
          } else {
            setUserComment(null)
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

  const handleRating = async (rating: string) => {
    const newRating = rating === selectedRating ? null : rating
    setSelectedRating(newRating)
    if (onRate) {
      await onRate(newRating as any) // Pass null when unchecking
    }
  }

  const handleStatus = async (status: string) => {
    const newStatus = status === selectedStatus ? null : status
    setSelectedStatus(newStatus)
    if (onStatus) {
      await onStatus(newStatus as any, selectedStatus as any) // Pass current status so parent can show confirmation
    }
    if (onStatusChange) {
      await onStatusChange()
    }
  }

  const handleCommentSave = async (commentText: string) => {
    if (!user) return

    const supabase = createClient()
    const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie')
    const tmdbId = media.tmdb_id || media.id
    const mediaId = media.id && (typeof media.id === 'string' && (media.id.startsWith('tv-') || media.id.startsWith('movie-')))
      ? media.id
      : (mediaType === 'movie' ? `movie-${tmdbId}` : `tv-${tmdbId}`)

    try {
      if (userComment) {
        // Update existing comment
        const { data, error } = await supabase
          .from('show_comments')
          .update({
            comment_text: commentText
          })
          .eq('id', userComment.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating comment:', error)
        } else {
          setUserComment(data)
        }
      } else {
        // Create new comment
        const { data, error } = await supabase
          .from('show_comments')
          .insert({
            user_id: user.id,
            media_id: mediaId,
            comment_text: commentText
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating comment:', error)
        } else {
          setUserComment(data)

          // Track new comment added
          trackShowCommentAdded({
            media_id: mediaId,
            media_title: media.title || media.name,
            comment_length: commentText.length,
            is_public: true // Comments are public by default
          })
        }
      }
    } catch (error) {
      console.error('Error saving comment:', error)
    }
  }

  const handleCommentDelete = async () => {
    if (!userComment || !user) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('show_comments')
        .delete()
        .eq('id', userComment.id)

      if (error) {
        console.error('Error deleting comment:', error)
      } else {
        setUserComment(null)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
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
          background: modalBg,
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderRadius: '20px',
          border: modalBorder,
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
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <Icon name="close-c-default" size={36} />
        </button>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : (
            <>
              <div className="activity-card">
                <MediaCard
                  media={enrichedMedia}
                  onRate={handleRating}
                  onStatus={handleStatus}
                  currentRating={selectedRating}
                  currentStatus={selectedStatus}
                />
              </div>

              {/* Show Comment Input */}
              {user && (
                <div style={{ marginTop: '1rem' }}>
                  <ShowCommentInput
                    mediaId={enrichedMedia.id || `${enrichedMedia.media_type}-${enrichedMedia.tmdb_id}`}
                    userId={user.id}
                    existingComment={userComment}
                    onSave={handleCommentSave}
                    onDelete={userComment ? handleCommentDelete : undefined}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import MediaBadges from '../media/MediaBadges'

interface ActivityCardProps {
  activity: {
    id: string
    user: {
      username: string
      display_name: string
      avatar_url?: string
    }
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
    activity_type: 'rated' | 'status_changed' | 'commented'
    activity_data: any
    created_at: string
    like_count: number
    comment_count: number
    user_liked: boolean
    comments?: any[]
    likes?: any[]
  }
  onLike: (activityId: string) => void
  onComment: (activityId: string, comment: string) => void
  onDeleteComment?: (commentId: string) => void
  onQuickRate?: (mediaId: string, rating: string) => void
  onQuickStatus?: (mediaId: string, status: string) => void
  onUserClick?: (username: string) => void
  onMediaClick?: (media: any) => void
  userRating?: string | null
  userStatus?: string | null
  currentUserId?: string
}

export default function ActivityCard({
  activity,
  onLike,
  onComment,
  onDeleteComment,
  onQuickRate,
  onQuickStatus,
  onUserClick,
  onMediaClick,
  userRating,
  userStatus,
  currentUserId
}: ActivityCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showLikes, setShowLikes] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showFullOverview, setShowFullOverview] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()

  // Theme-based colors
  const isDark = resolvedTheme === 'dark'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.9)' : '#666'

  // Extract media info
  const mediaType = activity.media.media_type || (activity.media.id?.startsWith('tv-') ? 'tv' : 'movie')
  const tmdbId = activity.media.tmdb_id

  // Extract season number from ID if it's a season-specific record (format: tv-{tmdb_id}-s{season_number})
  const seasonNumber = activity.media.id?.includes('-s')
    ? parseInt(activity.media.id.split('-s')[1])
    : (activity.media.tmdb_data?.season_number || null)

  // Fetch trailer on mount
  useEffect(() => {
    const fetchTrailer = async () => {
      if (!activity.media.tmdb_id) return
      try {
        const type = mediaType === 'tv' ? 'tv' : 'movie'
        const response = await fetch(`/api/tmdb/${type}/${activity.media.tmdb_id}/videos`)
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
  }, [activity.media.tmdb_id, mediaType])

  const handleTrailerClick = () => {
    if (trailerKey) {
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')
    }
  }

  const getActivityText = () => {
    const { activity_type, activity_data } = activity

    switch (activity_type) {
      case 'rated':
        const emoji = activity_data.rating === 'love' ? '❤️' :
                      activity_data.rating === 'like' ? '👍' : '😐'
        const verb = activity_data.rating === 'love' ? 'loved' :
                    activity_data.rating === 'like' ? 'liked' : 'felt meh about'
        return (
          <>
            <strong
              onClick={(e) => {
                e.stopPropagation()
                onUserClick?.(activity.user.username)
              }}
              style={{ cursor: onUserClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => onUserClick && (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => onUserClick && (e.currentTarget.style.textDecoration = 'none')}
            >
              {activity.user.display_name}
            </strong>
            <span className="action-type"> {verb} </span>
            <strong
              onClick={(e) => {
                e.stopPropagation()
                onMediaClick?.(activity.media)
              }}
              style={{ cursor: onMediaClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => onMediaClick && (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => onMediaClick && (e.currentTarget.style.textDecoration = 'none')}
            >
              {activity.media.title}
            </strong>
          </>
        )
      case 'status_changed':
        const status = activity_data.status === 'want' ? 'wants to watch' :
                      activity_data.status === 'watching' ? 'started watching' : 'finished watching'
        return (
          <>
            <strong
              onClick={(e) => {
                e.stopPropagation()
                onUserClick?.(activity.user.username)
              }}
              style={{ cursor: onUserClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => onUserClick && (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => onUserClick && (e.currentTarget.style.textDecoration = 'none')}
            >
              {activity.user.display_name}
            </strong>
            <span className="action-type"> {status} </span>
            <strong
              onClick={(e) => {
                e.stopPropagation()
                onMediaClick?.(activity.media)
              }}
              style={{ cursor: onMediaClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => onMediaClick && (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => onMediaClick && (e.currentTarget.style.textDecoration = 'none')}
            >
              {activity.media.title}
            </strong>
          </>
        )
      default:
        return (
          <>
            <strong
              onClick={(e) => {
                e.stopPropagation()
                onUserClick?.(activity.user.username)
              }}
              style={{ cursor: onUserClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => onUserClick && (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => onUserClick && (e.currentTarget.style.textDecoration = 'none')}
            >
              {activity.user.display_name}
            </strong>
            <span className="action-type"> updated </span>
            <strong
              onClick={(e) => {
                e.stopPropagation()
                onMediaClick?.(activity.media)
              }}
              style={{ cursor: onMediaClick ? 'pointer' : 'default' }}
              onMouseEnter={(e) => onMediaClick && (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => onMediaClick && (e.currentTarget.style.textDecoration = 'none')}
            >
              {activity.media.title}
            </strong>
          </>
        )
    }
  }

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment(activity.id, commentText)
      setCommentText('')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleDoubleTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      onLike(activity.id)
    }
    setLastTap(now)
  }

  const truncateText = (text: string, lines: number = 2) => {
    const words = text.split(' ')
    const lineHeight = 20
    const maxChars = 100 // approximate chars for 2 lines

    if (text.length <= maxChars) return text

    let truncated = ''
    for (let i = 0; i < words.length; i++) {
      if ((truncated + words[i]).length > maxChars) {
        return truncated.trim()
      }
      truncated += words[i] + ' '
    }
    return truncated.trim()
  }

  const getLikeText = () => {
    if (activity.like_count === 0) return ''
    if (activity.user_liked) {
      if (activity.like_count === 1) return 'You'
      return `You and ${activity.like_count - 1} other${activity.like_count - 1 > 1 ? 's' : ''}`
    }
    return activity.like_count.toString()
  }

  return (
    <div className="activity-card">
      {/* Header */}
      <div className="activity-header">
        <div className="user-avatar">
          {activity.user.avatar_url ? (
            <img src={activity.user.avatar_url} alt={activity.user.display_name} />
          ) : (
            getInitials(activity.user.display_name)
          )}
        </div>
        <div className="user-info">
          <div className="user-action">{getActivityText()}</div>
          <div className="post-time">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Media Card - Clickable to open modal */}
      <div
        className="feed-show-content"
        onClick={() => onMediaClick?.(activity.media)}
        style={{ cursor: onMediaClick ? 'pointer' : 'default' }}
      >
        {activity.media.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w185${activity.media.poster_path}`}
            alt={activity.media.title}
            className="feed-show-poster"
            onClick={handleDoubleTap}
            style={{ cursor: 'pointer' }}
          />
        )}
        <div className="feed-show-info">
          <div className="feed-show-title">{activity.media.title}</div>
          <div className="feed-show-meta">
            {activity.media.release_date && (
              <span>{activity.media.release_date.substring(0, 4)}</span>
            )}
            {activity.media.vote_average && (
              <span> • ⭐ {activity.media.vote_average.toFixed(1)}</span>
            )}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <MediaBadges
              mediaType={mediaType as 'tv' | 'movie'}
              seasonNumber={seasonNumber || undefined}
              season={!seasonNumber && mediaType === 'tv' ? (activity.media.tmdb_data?.number_of_seasons || 1) : undefined}
              networks={activity.media.tmdb_data?.networks || []}
              showTrailer={!!trailerKey}
              onTrailerClick={handleTrailerClick}
            />
          </div>
          {activity.media.overview && (
            <div className="feed-show-overview">
              <p style={{
                fontSize: '0.875rem',
                color: textSecondary,
                lineHeight: '1.4',
                margin: '0.5rem 0 0 0',
                display: showFullOverview ? 'block' : '-webkit-box',
                WebkitLineClamp: showFullOverview ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {activity.media.overview}
              </p>
              {activity.media.overview.length > 100 && (
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    style={{
                      color: '#0095f6',
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


      {/* Interaction buttons - Swapped order: Comments first, Likes second */}
      <div className="activity-interactions">
        <button
          onClick={() => setShowComments(!showComments)}
          className="interaction-btn"
        >
          💬 <span>{activity.comment_count > 0 ? activity.comment_count : ''}</span>
        </button>
        <button
          onClick={() => onLike(activity.id)}
          className={`interaction-btn ${activity.user_liked ? 'liked' : ''}`}
          style={{ marginLeft: 'auto' }}
        >
          <span>{activity.user_liked ? '❤️' : '🤍'}</span>
        </button>
        {activity.like_count > 0 && (
          <button
            onClick={() => setShowLikes(!showLikes)}
            className="interaction-btn like-count"
            style={{ marginLeft: '-0.5rem' }}
          >
            {getLikeText()}
          </button>
        )}
      </div>

      {/* Likes list */}
      {showLikes && activity.likes && activity.likes.length > 0 && (
        <div className="likes-section">
          <div className="likes-header">Likes</div>
          <div className="likes-list">
            {activity.likes.map((like: any) => (
              <div key={like.id} className="like-item">
                <div className="user-avatar small">
                  {like.user.avatar_url ? (
                    <img src={like.user.avatar_url} alt={like.user.display_name} />
                  ) : (
                    getInitials(like.user.display_name)
                  )}
                </div>
                <span className="like-user-name">{like.user.display_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="comment-section">
          {activity.comments && activity.comments.length > 0 && (
            <div className="comments-list">
              {activity.comments.map((comment: any) => (
                <div key={comment.id} className="comment-item">
                  <div className="user-avatar small">
                    {comment.user.avatar_url ? (
                      <img src={comment.user.avatar_url} alt={comment.user.display_name} />
                    ) : (
                      getInitials(comment.user.display_name)
                    )}
                  </div>
                  <div className="comment-content">
                    <div>
                      <strong>{comment.user.display_name}</strong>{' '}
                      <span>{comment.comment_text}</span>
                    </div>
                  </div>
                  {currentUserId === comment.user_id && onDeleteComment && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="delete-comment-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="comment-input-container">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button
              onClick={handleCommentSubmit}
              className="comment-submit-btn"
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
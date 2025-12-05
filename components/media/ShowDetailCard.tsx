'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Icon from '@/components/ui/Icon'
import { getAvatarProps } from '@/utils/avatarUtils'
import YouTubeModal from '@/components/media/YouTubeModal'
import Link from 'next/link'

// Avatar component with initials fallback
const Avatar: React.FC<{
  src?: string | null
  alt?: string
  name?: string | null
  userId?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
}> = ({ src, alt = '', name, userId, size = 40, className, style }) => {
  const [imageError, setImageError] = useState(false)
  const avatarProps = getAvatarProps(src, name, userId)
  
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    ...style
  }
  
  if (imageError || !avatarProps.hasImage || !avatarProps.imageSrc) {
    return (
      <div
        className={className}
        style={{
          ...baseStyle,
          background: avatarProps.backgroundGradient || avatarProps.backgroundColor,
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {avatarProps.initials}
      </div>
    )
  }
  
  return (
    <img
      src={avatarProps.imageSrc}
      alt={alt}
      className={className}
      style={baseStyle}
      onError={() => setImageError(true)}
    />
  )
}

interface ShowDetailCardProps {
  isOpen: boolean
  onClose: () => void
  media: {
    id: string
    title: string
    posterUrl?: string
    backdropUrl?: string
    year?: string
    genres?: string[]
    rating?: number
    synopsis?: string
    creator?: string
    cast?: string[]
    network?: string
    mediaType?: 'Movie' | 'TV' | string
    season?: number
    streamingPlatforms?: string[]
    tmdb_id?: number
  }
  currentUser?: {
    id: string
    name: string
    avatar: string | null
  }
  initialRating?: 'meh' | 'like' | 'love' | null
  initialStatus?: 'want' | 'watching' | 'watched' | null
  onRate?: (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => void
  onSetStatus?: (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => void
}

export default function ShowDetailCard({
  isOpen,
  onClose,
  media,
  currentUser,
  initialRating,
  initialStatus,
  onRate,
  onSetStatus,
}: ShowDetailCardProps) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const [actionOverlayVisible, setActionOverlayVisible] = useState(false)
  const [selectedRating, setSelectedRating] = useState<'meh' | 'like' | 'love' | null>(initialRating || null)
  const [selectedStatus, setSelectedStatus] = useState<'want' | 'watching' | 'watched' | null>(initialStatus || null)
  const [showComments, setShowComments] = useState<any[]>([])
  const [showCommentsExpanded, setShowCommentsExpanded] = useState(false)
  const [showCommentInput, setShowCommentInput] = useState('')
  const [friendsActivity, setFriendsActivity] = useState<any>({
    watching: { count: 0, avatars: [] },
    watched: { count: 0, avatars: [] },
    wantToWatch: { count: 0, avatars: [] }
  })
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [trailerLoading, setTrailerLoading] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  
  const synopsisRef = useRef<HTMLParagraphElement>(null)
  const supabase = createClient()

  // Fetch show comments
  const fetchShowComments = useCallback(async () => {
    if (!media.id) return
    
    try {
      const { data: comments } = await supabase
        .from('show_comments')
        .select(`
          id,
          comment_text,
          created_at,
          user_id
        `)
        .eq('media_id', media.id)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (comments && comments.length > 0) {
        // Fetch profiles separately
        const userIds = [...new Set(comments.map(c => c.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds)
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        
        const commentsWithUsers = comments.map(c => ({
          ...c,
          profiles: profileMap.get(c.user_id) || { username: 'Unknown', display_name: 'Unknown', avatar_url: null }
        }))
        
        setShowComments(commentsWithUsers)
      }
    } catch (err) {
      console.error('Error fetching show comments:', err)
    }
  }, [media.id, supabase])

  // Fetch friends activity for this show
  const fetchFriendsActivity = useCallback(async () => {
    if (!media.id || !currentUser?.id) return
    
    try {
      // Get list of people current user follows
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)
        .eq('status', 'accepted')
      
      if (!following || following.length === 0) return
      
      const followingIds = following.map(f => f.following_id)
      
      // Get watch status of followed users for this media
      const { data: statuses } = await supabase
        .from('watch_status')
        .select(`
          status,
          user_id,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('media_id', media.id)
        .in('user_id', followingIds)
      
      if (statuses) {
        const watching = statuses.filter(s => s.status === 'watching')
        const watched = statuses.filter(s => s.status === 'watched')
        const want = statuses.filter(s => s.status === 'want')
        
        setFriendsActivity({
          watching: {
            count: watching.length,
            avatars: watching.map(s => (s.profiles as any)?.avatar_url).filter(Boolean)
          },
          watched: {
            count: watched.length,
            avatars: watched.map(s => (s.profiles as any)?.avatar_url).filter(Boolean)
          },
          wantToWatch: {
            count: want.length,
            avatars: want.map(s => (s.profiles as any)?.avatar_url).filter(Boolean)
          }
        })
      }
    } catch (err) {
      console.error('Error fetching friends activity:', err)
    }
  }, [media.id, currentUser?.id, supabase])

  // Fetch trailer
  const fetchTrailer = useCallback(async () => {
    if (!media.tmdb_id || !media.mediaType) return
    
    setTrailerLoading(true)
    try {
      const type = media.mediaType === 'Movie' ? 'movie' : 'tv'
      const response = await fetch(`/api/tmdb/${type}/${media.tmdb_id}/videos`)
      if (response.ok) {
        const data = await response.json()
        const trailer = data.results?.find((v: any) => 
          v.type === 'Trailer' && v.site === 'YouTube'
        ) || data.results?.find((v: any) => v.site === 'YouTube')
        
        if (trailer) {
          setTrailerKey(trailer.key)
        }
      }
    } catch (err) {
      console.error('Error fetching trailer:', err)
    } finally {
      setTrailerLoading(false)
    }
  }, [media.tmdb_id, media.mediaType])

  useEffect(() => {
    if (isOpen) {
      fetchShowComments()
      fetchFriendsActivity()
      fetchTrailer()
    }
  }, [isOpen, fetchShowComments, fetchFriendsActivity, fetchTrailer])

  // Check if synopsis needs truncation
  useEffect(() => {
    if (synopsisRef.current) {
      const lineHeight = parseInt(getComputedStyle(synopsisRef.current).lineHeight)
      const maxHeight = lineHeight * 3
      setNeedsTruncation(synopsisRef.current.scrollHeight > maxHeight)
    }
  }, [media.synopsis])

  // Update local state when props change
  useEffect(() => {
    setSelectedRating(initialRating || null)
    setSelectedStatus(initialStatus || null)
  }, [initialRating, initialStatus])

  const handleRatingSelect = (rating: 'meh' | 'like' | 'love') => {
    const newRating = selectedRating === rating ? null : rating
    setSelectedRating(newRating)
    onRate?.(media.id, newRating)
  }

  const handleStatusSelect = (status: 'want' | 'watching' | 'watched') => {
    const newStatus = selectedStatus === status ? null : status
    setSelectedStatus(newStatus)
    onSetStatus?.(media.id, newStatus)
  }

  const handleSubmitShowComment = async () => {
    if (!showCommentInput.trim() || !currentUser?.id) return
    
    try {
      const { error } = await supabase
        .from('show_comments')
        .insert({
          media_id: media.id,
          user_id: currentUser.id,
          comment_text: showCommentInput.trim()
        })
      
      if (!error) {
        setShowCommentInput('')
        fetchShowComments()
      }
    } catch (err) {
      console.error('Error submitting comment:', err)
    }
  }

  const handleTrailerClick = () => {
    if (trailerKey && !trailerLoading) {
      setShowTrailerModal(true)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="show-detail-overlay" onClick={onClose}>
        <div className="show-detail-card" onClick={e => e.stopPropagation()}>
          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>
            <Icon name="close" variant="circle" size={42} />
          </button>

          <div className="card-content">
            {/* Title Section */}
            <div className="back-title-section">
              <h1 className="back-title">
                {media.title}
                {media.season && !media.title.includes(`Season ${media.season}`) && ` - Season ${media.season}`}
              </h1>
              <div className="back-meta">
                {media.year && <span className="back-year">{media.year}</span>}
                {media.genres && media.genres.length > 0 && (
                  <>
                    <span className="meta-dot">•</span>
                    <span>{media.genres.join(', ')}</span>
                  </>
                )}
                {media.rating && (
                  <>
                    <span className="meta-dot">•</span>
                    <span className="back-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="star-gold" size={14} /> {media.rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              {/* Badges */}
              <div className="back-badges">
                {media.season && <div className="back-badge season">S{media.season}</div>}
                {media.mediaType && <div className="back-badge type">{media.mediaType}</div>}
                {media.streamingPlatforms && media.streamingPlatforms.length > 0 ? (
                  media.streamingPlatforms.map((platform, idx) => (
                    <div key={idx} className="back-badge network">{platform}</div>
                  ))
                ) : (
                  media.network && <div className="back-badge network">{media.network}</div>
                )}
                <button
                  className={`back-badge trailer ${!trailerKey || trailerLoading ? 'disabled' : ''}`}
                  onClick={handleTrailerClick}
                  disabled={!trailerKey || trailerLoading}
                  type="button"
                >
                  <Icon name="play" size={10} /> Trailer
                </button>
              </div>
            </div>

            {/* Synopsis */}
            {media.synopsis && (
              <>
                <p 
                  ref={synopsisRef}
                  className={`back-synopsis ${synopsisExpanded ? '' : 'collapsed'}`}
                >
                  {media.synopsis}
                </p>
                {needsTruncation && (
                  <span className="read-more" onClick={() => setSynopsisExpanded(!synopsisExpanded)}>
                    {synopsisExpanded ? 'Show less' : 'Read more'}
                  </span>
                )}
              </>
            )}

            {/* Action Icons */}
            <div className="back-action-icons">
              <button
                className="back-icon-btn primary"
                onClick={() => setActionOverlayVisible(true)}
              >
                <Icon name="plus" size={22} color="white" />
              </button>
              <button className="back-icon-btn" onClick={() => setShowCommentsExpanded(!showCommentsExpanded)}>
                <Icon name="comment" size={22} color="white" />
              </button>
              <button className="back-icon-btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                <Icon name="share" size={22} color="white" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="back-info-grid">
              {media.creator && (
                <div className="back-info-item">
                  <span className="back-info-label">Creator</span>
                  <span className="back-info-value">{media.creator}</span>
                </div>
              )}
              {media.genres && media.genres.length > 0 && (
                <div className="back-info-item">
                  <span className="back-info-label">Genre</span>
                  <span className="back-info-value">{media.genres.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Cast */}
            {media.cast && media.cast.length > 0 && (
              <div className="back-section">
                <h3 className="back-section-title">Cast</h3>
                <div className="cast-list">
                  {media.cast.map((actor, idx) => (
                    <span key={idx} className="cast-member">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Watching */}
            <div className="back-section">
              <h3 className="back-section-title">Friends Watching</h3>
              <div className="friends-categories">
                <div className="friends-category">
                  <div className="friends-avatars-stack">
                    {friendsActivity.watching.avatars.slice(0, 3).map((avatar: string, idx: number) => (
                      <img key={idx} src={avatar} alt="Friend" />
                    ))}
                  </div>
                  <div className="friends-category-text">
                    <span className="count">{friendsActivity.watching.count}</span> friends watching
                  </div>
                </div>
                <div className="friends-category">
                  <div className="friends-avatars-stack">
                    {friendsActivity.watched.avatars.slice(0, 3).map((avatar: string, idx: number) => (
                      <img key={idx} src={avatar} alt="Friend" />
                    ))}
                  </div>
                  <div className="friends-category-text">
                    <span className="count">{friendsActivity.watched.count}</span> friends watched
                  </div>
                </div>
                <div className="friends-category">
                  <div className="friends-avatars-stack">
                    {friendsActivity.wantToWatch.avatars.slice(0, 3).map((avatar: string, idx: number) => (
                      <img key={idx} src={avatar} alt="Friend" />
                    ))}
                  </div>
                  <div className="friends-category-text">
                    <span className="count">{friendsActivity.wantToWatch.count}</span> want to watch
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="back-section">
              <div 
                className="comments-header"
                onClick={() => setShowCommentsExpanded(!showCommentsExpanded)}
              >
                <h3 className="back-section-title">
                  Comments ({showComments.length})
                </h3>
                <Icon 
                  name={showCommentsExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="rgba(255,255,255,0.6)"
                />
              </div>
              
              {showCommentsExpanded && (
                <div className="comments-section">
                  {/* Comment Input */}
                  {currentUser && (
                    <div className="comment-input-row">
                      <Avatar 
                        src={currentUser.avatar}
                        name={currentUser.name}
                        userId={currentUser.id}
                        size={32}
                      />
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={showCommentInput}
                        onChange={(e) => setShowCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmitShowComment()
                        }}
                      />
                      <button 
                        onClick={handleSubmitShowComment}
                        disabled={!showCommentInput.trim()}
                      >
                        Post
                      </button>
                    </div>
                  )}
                  
                  {/* Comment List */}
                  {showComments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <Avatar 
                        src={comment.profiles?.avatar_url}
                        name={comment.profiles?.display_name || comment.profiles?.username}
                        userId={comment.user_id}
                        size={28}
                      />
                      <div className="comment-content">
                        <Link href={`/${comment.profiles?.username}`} className="comment-username">
                          {comment.profiles?.display_name || comment.profiles?.username}
                        </Link>
                        <p className="comment-text">{comment.comment_text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {showComments.length === 0 && (
                    <p className="no-comments">No comments yet. Be the first!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Overlay Modal */}
          <div className={`action-overlay ${actionOverlayVisible ? 'visible' : ''}`}>
            <div className="action-overlay-content">
              <button className="action-overlay-close" onClick={() => setActionOverlayVisible(false)}>
                <Icon name="close" size={24} color="white" />
              </button>
              
              <h3 className="action-overlay-title">{media.title}</h3>
              
              {/* Rating Section */}
              <div className="action-section">
                <h4>Rate This</h4>
                <div className="rating-buttons">
                  <button 
                    className={`rating-btn ${selectedRating === 'meh' ? 'selected' : ''}`}
                    onClick={() => handleRatingSelect('meh')}
                  >
                    <Icon name="rating-meh" size={32} />
                    <span>Meh</span>
                  </button>
                  <button 
                    className={`rating-btn ${selectedRating === 'like' ? 'selected' : ''}`}
                    onClick={() => handleRatingSelect('like')}
                  >
                    <Icon name="rating-liked" size={32} />
                    <span>Liked</span>
                  </button>
                  <button 
                    className={`rating-btn ${selectedRating === 'love' ? 'selected' : ''}`}
                    onClick={() => handleRatingSelect('love')}
                  >
                    <Icon name="rating-loved" size={32} />
                    <span>Loved</span>
                  </button>
                </div>
              </div>
              
              {/* Status Section */}
              <div className="action-section">
                <h4>Watch Status</h4>
                <div className="status-buttons">
                  <button 
                    className={`status-btn ${selectedStatus === 'want' ? 'selected' : ''}`}
                    onClick={() => handleStatusSelect('want')}
                  >
                    <Icon name="bookmark" size={20} />
                    <span>Want to Watch</span>
                  </button>
                  <button 
                    className={`status-btn ${selectedStatus === 'watching' ? 'selected' : ''}`}
                    onClick={() => handleStatusSelect('watching')}
                  >
                    <Icon name="eye" size={20} />
                    <span>Watching</span>
                  </button>
                  <button 
                    className={`status-btn ${selectedStatus === 'watched' ? 'selected' : ''}`}
                    onClick={() => handleStatusSelect('watched')}
                  >
                    <Icon name="check" size={20} />
                    <span>Watched</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Trailer Modal */}
      <YouTubeModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        videoId={trailerKey || ''}
        title={media.title}
      />

      <style jsx>{`
        .show-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .show-detail-card {
          position: relative;
          width: 100%;
          max-width: 398px;
          max-height: 90vh;
          background: #0a0a0a;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .card-content {
          padding: 50px 20px 20px;
          overflow-y: auto;
          flex: 1;
          -webkit-overflow-scrolling: touch;
        }

        .back-title-section {
          margin-bottom: 16px;
        }

        .back-title {
          font-family: 'PP Editorial New', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: white;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .back-meta {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .meta-dot {
          color: rgba(255, 255, 255, 0.4);
        }

        .back-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .back-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .back-badge.season {
          background: rgba(139, 92, 246, 0.3);
          border: 1px solid rgba(139, 92, 246, 0.5);
          color: #a78bfa;
        }

        .back-badge.type {
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.5);
          color: #93c5fd;
        }

        .back-badge.network {
          background: rgba(16, 185, 129, 0.3);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #6ee7b7;
        }

        button.back-badge {
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }

        button.back-badge.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .back-synopsis {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin: 16px 0 8px;
        }

        .back-synopsis.collapsed {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-more {
          color: #3b82f6;
          font-size: 13px;
          cursor: pointer;
        }

        .back-action-icons {
          display: flex;
          gap: 12px;
          margin: 20px 0;
        }

        .back-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-icon-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .back-icon-btn.primary {
          background: #8b5cf6;
          border-color: #8b5cf6;
        }

        .back-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 20px 0;
        }

        .back-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .back-info-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .back-info-value {
          font-size: 14px;
          color: white;
        }

        .back-section {
          margin: 24px 0;
        }

        .back-section-title {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin: 0 0 12px 0;
        }

        .cast-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .cast-member {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .friends-categories {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .friends-category {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .friends-avatars-stack {
          display: flex;
        }

        .friends-avatars-stack img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #0a0a0a;
          margin-left: -8px;
          object-fit: cover;
        }

        .friends-avatars-stack img:first-child {
          margin-left: 0;
        }

        .friends-category-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .friends-category-text .count {
          color: white;
          font-weight: 600;
        }

        .comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          padding: 8px 0;
        }

        .comments-section {
          margin-top: 12px;
        }

        .comment-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .comment-input-row input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 8px 14px;
          color: white;
          font-size: 14px;
        }

        .comment-input-row input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .comment-input-row button {
          background: #8b5cf6;
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .comment-input-row button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .comment-item {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .comment-content {
          flex: 1;
        }

        .comment-username {
          font-size: 13px;
          font-weight: 600;
          color: white;
          text-decoration: none;
        }

        .comment-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin: 4px 0 0 0;
        }

        .no-comments {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          padding: 20px 0;
        }

        /* Action Overlay */
        .action-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          z-index: 20;
        }

        .action-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .action-overlay-content {
          padding: 30px;
          text-align: center;
          width: 100%;
        }

        .action-overlay-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .action-overlay-title {
          font-family: 'PP Editorial New', Georgia, serif;
          font-size: 24px;
          color: white;
          margin: 0 0 30px 0;
        }

        .action-section {
          margin-bottom: 30px;
        }

        .action-section h4 {
          font-size: 12px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 16px 0;
          letter-spacing: 1px;
        }

        .rating-buttons {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .rating-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rating-btn span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .rating-btn.selected {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.2);
        }

        .status-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 14px 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-btn span {
          font-size: 14px;
          color: white;
        }

        .status-btn.selected {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.2);
        }
      `}</style>
    </>
  )
}


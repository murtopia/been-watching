/**
 * User Activity Card (Card 1) - Pixel Perfect React Recreation
 *
 * Recreated from card-1-standalone.html with 100% fidelity
 * Dimensions: 398px × 645px
 * Features: Flip animation, glassmorphic design, interactive buttons, iOS scroll
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface UserActivityCardData {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  timestamp: string // e.g., "2 hours ago"
  activityType: 'loved' | 'watching' | 'watched' | 'want-to-watch'
  activityBadges: Array<{
    text: string
    color: string
    borderColor: string
    textColor: string
  }>
  media: {
    id: string
    title: string
    year: number
    genres: string[]
    rating: number
    posterUrl: string
    synopsis: string
    creator: string
    cast: string[]
    network: string
    season?: number
    mediaType: 'TV' | 'Movie'
  }
  friends: {
    count: number
    avatars: Array<{
      id: string
      name: string
      username: string
      avatar: string
    }>
    text: string
  }
  stats: {
    likeCount: number
    commentCount: number
    userLiked: boolean
  }
  friendsActivity: {
    watching: {
      count: number
      avatars: string[]
    }
    wantToWatch: {
      count: number
      avatars: string[]
    }
    watched: {
      count: number
      avatars: string[]
    }
    ratings: {
      meh: number
      like: number
      love: number
      userRating?: 'meh' | 'like' | 'love'
    }
  }
  comments: Array<{
    id: string
    user: {
      name: string
      avatar: string
    }
    text: string
    timestamp: string
    likes: number
    userLiked: boolean
  }>
  showComments: Array<{
    id: string
    user: {
      name: string
      avatar: string
    }
    text: string
    timestamp: string
    likes: number
    userLiked: boolean
  }>
  similarShows: Array<{
    id: string
    title: string
    gradient: string
  }>
}

interface UserActivityCardProps {
  data: UserActivityCardData
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onAddToWatchlist?: () => void
  onUserClick?: (userId: string) => void
  onMediaClick?: (mediaId: string) => void
  onTrack?: (action: string, metadata?: any) => void
}

// ============================================================================
// Main Component
// ============================================================================

export function UserActivityCard({ data, onLike, onComment, onShare, onAddToWatchlist, onUserClick, onMediaClick, onTrack }: UserActivityCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isCommentsVisible, setIsCommentsVisible] = useState(false)
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false)
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false)
  const [isActionOverlayVisible, setIsActionOverlayVisible] = useState(false)
  const [localLiked, setLocalLiked] = useState(data.stats.userLiked)
  const [localLikeCount, setLocalLikeCount] = useState(data.stats.likeCount)

  const backScrollRef = useRef<HTMLDivElement>(null)
  const commentsScrollRef = useRef<HTMLDivElement>(null)

  // iOS-style momentum scrolling
  useEffect(() => {
    const scrollRefs = [backScrollRef, commentsScrollRef]

    scrollRefs.forEach(ref => {
      if (!ref.current) return

      let startY = 0
      let scrollTop = 0
      let velocity = 0
      let isScrolling = false
      let animationFrame: number

      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].pageY
        scrollTop = ref.current!.scrollTop
        velocity = 0
        isScrolling = true
        if (animationFrame) cancelAnimationFrame(animationFrame)
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (!isScrolling) return
        const deltaY = startY - e.touches[0].pageY
        velocity = deltaY
        ref.current!.scrollTop = scrollTop + deltaY
      }

      const handleTouchEnd = () => {
        isScrolling = false
        const decelerate = () => {
          if (Math.abs(velocity) > 0.5) {
            ref.current!.scrollTop += velocity
            velocity *= 0.92 // Friction
            animationFrame = requestAnimationFrame(decelerate)
          }
        }
        decelerate()
      }

      ref.current.addEventListener('touchstart', handleTouchStart, { passive: true })
      ref.current.addEventListener('touchmove', handleTouchMove, { passive: true })
      ref.current.addEventListener('touchend', handleTouchEnd)

      return () => {
        if (ref.current) {
          ref.current.removeEventListener('touchstart', handleTouchStart)
          ref.current.removeEventListener('touchmove', handleTouchMove)
          ref.current.removeEventListener('touchend', handleTouchEnd)
        }
      }
    })
  }, [])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setIsCommentsVisible(false)
    setIsCommentsExpanded(false)
    setIsActionOverlayVisible(false)
    onTrack?.('card-flip', { cardId: data.id, flipped: !isFlipped })
  }

  const handleLike = () => {
    setLocalLiked(!localLiked)
    setLocalLikeCount(localLiked ? localLikeCount - 1 : localLikeCount + 1)
    onLike?.()
    onTrack?.('like', { cardId: data.id, liked: !localLiked })
  }

  const handleCommentsClick = () => {
    if (!isCommentsVisible) {
      setIsCommentsVisible(true)
      setIsCommentsExpanded(false)
    } else if (!isCommentsExpanded) {
      setIsCommentsExpanded(true)
    } else {
      setIsCommentsVisible(false)
      setIsCommentsExpanded(false)
    }
    onTrack?.('comments-toggle', { cardId: data.id, visible: !isCommentsVisible })
  }

  const handleAddClick = () => {
    setIsActionOverlayVisible(!isActionOverlayVisible)
    onTrack?.('action-overlay-toggle', { cardId: data.id })
  }

  const handleActionSelect = (action: string) => {
    setIsActionOverlayVisible(false)
    onTrack?.('action-select', { cardId: data.id, action })
  }

  return (
    <div style={styles.cardContainer}>
      <div style={{
        ...styles.card,
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        {/* FRONT SIDE */}
        <div style={styles.cardFront}>
          {/* Background */}
          <div style={styles.cardBackground}>
            <img src={data.media.posterUrl} alt={data.media.title} style={styles.backgroundImage} />
            <div style={styles.backgroundOverlay} />
          </div>

          {/* Menu Button */}
          <button style={styles.menuBtn} onClick={handleFlip}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
              <circle cx="12" cy="6" r="1.5" fill="white"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
              <circle cx="12" cy="18" r="1.5" fill="white"/>
            </svg>
          </button>

          {/* Card Content */}
          <div style={styles.cardContent}>
            {/* User Header */}
            <div style={styles.userHeader}>
              <img src={data.user.avatar} alt={data.user.name} style={styles.userAvatar} />
              <div style={styles.userInfo}>
                <div style={styles.username}>{data.user.name}</div>
                <div style={styles.timestamp}>{data.timestamp}</div>
              </div>
            </div>

            {/* Activity Badges */}
            {data.activityBadges && data.activityBadges.length > 0 && (
              <div style={styles.activityBadges}>
                {data.activityBadges.map((badge, idx) => (
                  <div key={idx} style={{
                    ...styles.badge,
                    background: badge.color,
                    border: `1px solid ${badge.borderColor}`,
                    color: badge.textColor
                  }}>
                    {badge.text}
                  </div>
                ))}
              </div>
            )}

            {/* Show Title */}
            <div style={styles.showTitle}>{data.media.title}</div>

            {/* Show Meta */}
            <div style={styles.showMeta}>
              {data.media.year}
              <span style={styles.metaDot}>•</span>
              {data.media.genres.join(', ')}
              <span style={styles.metaDot}>•</span>
              ⭐ {data.media.rating}
            </div>

            {/* Friend Avatars */}
            {data.friends.avatars.length > 0 && (
              <div style={styles.friendAvatars}>
                <div style={styles.friendAvatarsStack}>
                  {data.friends.avatars.slice(0, 3).map((friend, idx) => (
                    <img
                      key={friend.id}
                      src={friend.avatar}
                      alt={friend.name}
                      style={{
                        ...styles.friendAvatar,
                        marginLeft: idx === 0 ? 0 : -6
                      }}
                    />
                  ))}
                </div>
                <span style={styles.friendCount}>{data.friends.text}</span>
              </div>
            )}
          </div>

          {/* Side Actions */}
          <div style={styles.sideActions}>
            <div style={{ textAlign: 'center' }}>
              <button
                style={{
                  ...styles.actionBtn,
                  ...(localLiked ? styles.actionBtnLiked : {})
                }}
                onClick={handleLike}
              >
                <svg viewBox="0 0 24 24" style={styles.actionIcon}>
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill={localLiked ? '#FF3B5C' : 'none'}
                    stroke={localLiked ? '#FF3B5C' : 'white'}
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <div style={styles.actionCount}>{localLikeCount}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button style={styles.actionBtn} onClick={handleAddClick}>
                <svg viewBox="0 0 24 24" style={styles.actionIcon}>
                  <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" />
                </svg>
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button style={styles.actionBtn} onClick={handleCommentsClick}>
                <svg viewBox="0 0 24 24" style={styles.actionIcon}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <div style={styles.actionCount}>{data.stats.commentCount}</div>
            </div>
          </div>

          {/* Comments Tab */}
          <div style={{
            ...styles.commentsTab,
            ...(isCommentsVisible ? styles.commentsTabVisible : {}),
            ...(isCommentsExpanded ? styles.commentsTabExpanded : {})
          }}>
            {!isCommentsExpanded ? (
              <div style={styles.commentsPreview} onClick={handleCommentsClick}>
                <span>View {data.stats.commentCount} comments...</span>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'white', fill: 'none' }}>
                  <polyline points="18 15 12 9 6 15" strokeWidth="2" />
                </svg>
              </div>
            ) : (
              <>
                <div ref={commentsScrollRef} style={styles.commentsFull}>
                  {data.comments.map((comment) => (
                    <div key={comment.id} style={styles.activityCommentItem}>
                      <div style={styles.activityCommentHeader}>
                        <img src={comment.user.avatar} alt={comment.user.name} style={styles.activityCommentAvatar} />
                        <span style={styles.activityCommentUsername}>{comment.user.name}</span>
                        <span style={styles.activityCommentTime}>{comment.timestamp}</span>
                      </div>
                      <div style={styles.activityCommentText}>{comment.text}</div>
                    </div>
                  ))}
                </div>
                <div style={styles.activityCommentInputWrapper}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    style={styles.activityCommentInput}
                  />
                  <button style={styles.sendBtn}>
                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'white' }}>
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BACK SIDE */}
        <div style={styles.cardBack}>
          {/* Close Button */}
          <button style={styles.closeBtn} onClick={handleFlip}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: 'white', strokeWidth: 2 }}>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Scrollable Content */}
          <div ref={backScrollRef} style={styles.cardBackContent}>
            {/* Title Section */}
            <div style={styles.backTitleSection}>
              <div style={styles.backTitle}>{data.media.title}</div>
              <div style={styles.backMeta}>
                <span style={styles.backYear}>{data.media.year}</span>
                <span style={styles.metaDot}>•</span>
                <span style={styles.backRating}>⭐ {data.media.rating}</span>
              </div>
              <div style={styles.backBadges}>
                {data.media.season && <div style={styles.backBadge}>S{data.media.season}</div>}
                <div style={styles.backBadge}>{data.media.mediaType}</div>
                <div style={styles.backBadge}>{data.media.network}</div>
                <div style={styles.backBadge}>Trailer</div>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <div style={{
                ...styles.backSynopsis,
                ...(isSynopsisExpanded ? {} : styles.backSynopsisCollapsed)
              }}>
                {data.media.synopsis}
              </div>
              <div style={styles.readMore} onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}>
                {isSynopsisExpanded ? 'Show less' : 'Read more'}
              </div>
            </div>

            {/* Action Icons */}
            <div style={styles.backActionIcons}>
              <button style={styles.backIconBtn}>
                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: 'white', fill: 'none' }}>
                  <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z"/>
                </svg>
              </button>
              <button style={styles.backIconBtn}>
                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: 'white', fill: 'none' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
              <button style={styles.backIconBtn}>
                <svg viewBox="0 0 20 22" fill="none" style={{ width: 20, height: 20 }}>
                  <path d="M10 3L10 14M10 3L6 7M10 3L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 11V18C17 19 16 20 15 20H5C4 20 3 19 3 18V11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Info Grid */}
            <div style={styles.backInfoGrid}>
              <div style={styles.backInfoItem}>
                <div style={styles.backInfoLabel}>Creator</div>
                <div style={styles.backInfoValue}>{data.media.creator}</div>
              </div>
              <div style={styles.backInfoItem}>
                <div style={styles.backInfoLabel}>Genre</div>
                <div style={styles.backInfoValue}>{data.media.genres[0]}</div>
              </div>
            </div>

            {/* Cast */}
            <div style={styles.backSection}>
              <div style={styles.backSectionTitle}>Cast</div>
              <div style={styles.castList}>
                {data.media.cast.map((actor, idx) => (
                  <div key={idx} style={styles.castMember}>{actor}</div>
                ))}
              </div>
            </div>

            {/* Friends Watching */}
            <div style={styles.backSection}>
              <div style={styles.backSectionTitle}>Friends Watching</div>
              <div style={styles.friendsCategories}>
                <div style={styles.friendsCategory}>
                  <div style={styles.friendsAvatarsStack}>
                    {data.friendsActivity.watching.avatars.slice(0, 3).map((avatar, idx) => (
                      <img key={idx} src={avatar} alt="" style={{
                        ...styles.friendsCategoryAvatar,
                        marginLeft: idx === 0 ? 0 : -10
                      }} />
                    ))}
                  </div>
                  <div style={styles.friendsCategoryText}>
                    {data.friendsActivity.watching.count} watching
                  </div>
                </div>
                <div style={styles.friendsCategory}>
                  <div style={styles.friendsAvatarsStack}>
                    {data.friendsActivity.wantToWatch.avatars.slice(0, 3).map((avatar, idx) => (
                      <img key={idx} src={avatar} alt="" style={{
                        ...styles.friendsCategoryAvatar,
                        marginLeft: idx === 0 ? 0 : -10
                      }} />
                    ))}
                  </div>
                  <div style={styles.friendsCategoryText}>
                    {data.friendsActivity.wantToWatch.count} want to watch
                  </div>
                </div>
                <div style={styles.friendsCategory}>
                  <div style={styles.friendsAvatarsStack}>
                    {data.friendsActivity.watched.avatars.slice(0, 3).map((avatar, idx) => (
                      <img key={idx} src={avatar} alt="" style={{
                        ...styles.friendsCategoryAvatar,
                        marginLeft: idx === 0 ? 0 : -10
                      }} />
                    ))}
                  </div>
                  <div style={styles.friendsCategoryText}>
                    {data.friendsActivity.watched.count} watched
                  </div>
                </div>
              </div>
            </div>

            {/* Friends Ratings */}
            <div style={styles.backSection}>
              <div style={styles.backSectionTitle}>Friends Ratings</div>
              <div style={styles.friendsRatings}>
                <div style={styles.ratingIconWrapper}>
                  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: 'white', fill: 'none' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="15" x2="16" y2="15" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="9" y2="10" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="15" y2="10" strokeWidth="2"/>
                  </svg>
                  {data.friendsActivity.ratings.meh > 0 && (
                    <div style={styles.ratingCount}>{data.friendsActivity.ratings.meh}</div>
                  )}
                </div>
                <div style={styles.ratingIconWrapper}>
                  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: 'white', fill: 'none' }}>
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeWidth="1.5"/>
                  </svg>
                  {data.friendsActivity.ratings.like > 0 && (
                    <div style={styles.ratingCount}>{data.friendsActivity.ratings.like}</div>
                  )}
                </div>
                <div style={{
                  ...styles.ratingIconWrapper,
                  ...(data.friendsActivity.ratings.userRating === 'love' ? styles.ratingIconWrapperActive : {})
                }}>
                  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      fill={data.friendsActivity.ratings.userRating === 'love' ? '#FF3B5C' : 'none'}
                      stroke={data.friendsActivity.ratings.userRating === 'love' ? '#FF3B5C' : 'white'}
                      strokeWidth="1.5"
                    />
                  </svg>
                  {data.friendsActivity.ratings.love > 0 && (
                    <div style={styles.ratingCount}>{data.friendsActivity.ratings.love}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Show Comments */}
            <div style={styles.backSection}>
              <div style={styles.backSectionTitle}>Comments</div>
              <div style={styles.commentInputContainer}>
                <textarea placeholder="Add a comment..." style={styles.commentInput} />
                <button style={styles.commentSubmitBtn}>Post</button>
              </div>
              <div style={styles.commentsList}>
                {data.showComments.map((comment) => (
                  <div key={comment.id} style={styles.commentItem}>
                    <img src={comment.user.avatar} alt={comment.user.name} style={styles.commentAvatar} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.commentHeader}>
                        <span style={styles.commentUsername}>{comment.user.name}</span>
                        <span style={styles.commentTime}>{comment.timestamp}</span>
                      </div>
                      <div style={styles.commentText}>{comment.text}</div>
                      <button style={{
                        ...styles.commentLikeBtn,
                        ...(comment.userLiked ? styles.commentLikeBtnLiked : {})
                      }}>
                        <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'currentColor' }}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {comment.likes > 0 && comment.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Shows */}
            <div style={styles.backSection}>
              <div style={styles.backSectionTitle}>Similar Shows</div>
              <div style={styles.similarShows}>
                {data.similarShows.map((show) => (
                  <div key={show.id} style={{
                    ...styles.similarShow,
                    background: show.gradient
                  }}>
                    <div style={styles.similarShowTitle}>{show.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom padding */}
            <div style={{ height: 20 }} />
          </div>
        </div>

        {/* Action Overlay Modal */}
        <div style={{
          ...styles.actionOverlay,
          ...(isActionOverlayVisible ? styles.actionOverlayVisible : {})
        }} onClick={() => setIsActionOverlayVisible(false)}>
          <div style={{
            ...styles.actionModal,
            transform: isFlipped
              ? (isActionOverlayVisible ? 'scale(1) rotateY(180deg)' : 'scale(0.9) rotateY(180deg)')
              : (isActionOverlayVisible ? 'scale(1)' : 'scale(0.9)')
          }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.actionModalGrid}>
              {/* Row 1: Ratings */}
              <div style={styles.actionModalItem} onClick={() => handleActionSelect('meh')}>
                <div style={styles.actionModalIcon}>
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'white', fill: 'none' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="8" y1="15" x2="16" y2="15" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="9" y2="10" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="15" y2="10" strokeWidth="2"/>
                  </svg>
                </div>
                <div style={styles.actionModalLabel}>Meh</div>
              </div>
              <div style={styles.actionModalItem} onClick={() => handleActionSelect('like')}>
                <div style={styles.actionModalIcon}>
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'white', fill: 'none' }}>
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div style={styles.actionModalLabel}>Like</div>
              </div>
              <div style={styles.actionModalItem} onClick={() => handleActionSelect('love')}>
                <div style={styles.actionModalIcon}>
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div style={styles.actionModalLabel}>Love</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
            <div style={styles.actionModalGrid}>
              {/* Row 2: Watchlist */}
              <div style={styles.actionModalItem} onClick={() => handleActionSelect('want-to-watch')}>
                <div style={styles.actionModalIcon}>
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'white', fill: 'none' }}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeWidth="1.5"/>
                  </svg>
                  <div style={styles.watchlistBadge}>
                    <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: 'white', fill: 'none' }}>
                      <path d="M12 5v14M5 12h14" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div style={styles.actionModalLabel}>Want To</div>
              </div>
              <div style={styles.actionModalItem} onClick={() => handleActionSelect('watching')}>
                <div style={styles.actionModalIcon}>
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'white', fill: 'white' }}>
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  <div style={styles.watchlistBadge}>
                    <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: 'white', fill: 'none' }}>
                      <path d="M12 5v14M5 12h14" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div style={styles.actionModalLabel}>Watching</div>
              </div>
              <div style={styles.actionModalItem} onClick={() => handleActionSelect('watched')}>
                <div style={styles.actionModalIcon}>
                  <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'white', fill: 'none' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="9 12 11 14 15 10" strokeWidth="2"/>
                  </svg>
                  <div style={styles.watchlistBadge}>
                    <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: 'white', fill: 'none' }}>
                      <path d="M12 5v14M5 12h14" strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div style={styles.actionModalLabel}>Watched</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Styles (Pixel Perfect CSS-in-JS)
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  cardContainer: {
    width: 398,
    height: 645,
    margin: '20px 16px',
    perspective: 1000,
    position: 'relative'
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: 16,
    touchAction: 'none'
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 2
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    borderRadius: 16,
    transform: 'rotateY(180deg)',
    background: 'linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)',
    overflow: 'hidden',
    zIndex: 1
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.9) 100%)',
    zIndex: 2
  },
  menuBtn: {
    position: 'absolute',
    top: 20,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(60, 60, 60, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 6,
    transition: 'all 0.2s'
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    zIndex: 3,
    color: 'white'
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1.5px solid white',
    objectFit: 'cover'
  },
  userInfo: {
    flex: 1
  },
  username: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 1
  },
  timestamp: {
    fontSize: 11,
    fontWeight: 400,
    opacity: 0.7
  },
  activityBadges: {
    display: 'flex',
    gap: 6,
    marginBottom: 8
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  },
  showTitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.3,
    marginBottom: 6
  },
  showMeta: {
    fontSize: 12,
    fontWeight: 400,
    opacity: 0.85,
    marginBottom: 6
  },
  metaDot: {
    margin: '0 4px',
    opacity: 0.5
  },
  friendAvatars: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  friendAvatarsStack: {
    display: 'flex',
    marginRight: 6
  },
  friendAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '1.5px solid #000',
    objectFit: 'cover'
  },
  friendCount: {
    fontSize: 12,
    fontWeight: 400,
    opacity: 0.85
  },
  sideActions: {
    position: 'absolute',
    right: 12,
    bottom: 60,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(60, 60, 60, 0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  actionBtnLiked: {
    background: 'rgba(255, 59, 92, 0.3)',
    border: '1.5px solid rgba(255, 59, 92, 0.5)'
  },
  actionIcon: {
    width: 24,
    height: 24,
    stroke: 'white',
    fill: 'none',
    strokeWidth: 1.5
  },
  actionCount: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 600,
    marginTop: 2,
    color: 'white'
  },
  commentsTab: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    background: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 5,
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    maxHeight: '70%',
    overflow: 'hidden',
    transform: 'translateY(100%)',
    opacity: 0,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column'
  },
  commentsTabVisible: {
    transform: 'translateY(0)',
    opacity: 1,
    pointerEvents: 'auto'
  },
  commentsTabExpanded: {
    // Keep visible styles
  },
  commentsPreview: {
    padding: '16px 20px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  commentsFull: {
    display: 'block',
    padding: 20,
    paddingBottom: 0,
    flex: 1,
    minHeight: 0,
    overflowY: 'scroll',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y'
  },
  activityCommentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  activityCommentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6
  },
  activityCommentAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  activityCommentUsername: {
    fontSize: 13,
    fontWeight: 600
  },
  activityCommentTime: {
    fontSize: 11,
    opacity: 0.6,
    marginLeft: 'auto'
  },
  activityCommentText: {
    fontSize: 13,
    lineHeight: 1.4,
    opacity: 0.9,
    marginLeft: 38
  },
  activityCommentInputWrapper: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexShrink: 0
  },
  activityCommentInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: '10px 16px',
    color: 'white',
    fontSize: 16,
    outline: 'none'
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0
  },
  cardBackContent: {
    padding: '20px 16px',
    paddingTop: 50,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    overflowY: 'scroll',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    touchAction: 'pan-y',
    zIndex: 1,
    pointerEvents: 'auto',
    willChange: 'scroll-position'
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(60, 60, 60, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10
  },
  backTitleSection: {
    marginBottom: 16
  },
  backTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: -0.5,
    color: 'white'
  },
  backMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
    color: 'white'
  },
  backYear: {
    fontSize: 14,
    opacity: 0.9
  },
  backRating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
    fontWeight: 600
  },
  backBadges: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 14
  },
  backBadge: {
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: 36,
    color: 'white'
  },
  backSynopsis: {
    fontSize: 14,
    lineHeight: 1.5,
    opacity: 0.9,
    marginBottom: 8,
    color: 'white'
  },
  backSynopsisCollapsed: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  readMore: {
    color: '#FF006E',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: 16,
    display: 'block',
    textAlign: 'right'
  },
  backActionIcons: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  backIconBtn: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'white'
  },
  backInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 20
  },
  backInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  backInfoLabel: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'white'
  },
  backInfoValue: {
    fontSize: 14,
    fontWeight: 600,
    color: 'white'
  },
  backSection: {
    marginBottom: 20
  },
  backSectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 10,
    color: 'white'
  },
  castList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  },
  castMember: {
    padding: '5px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    fontSize: 12,
    color: 'white'
  },
  friendsCategories: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  friendsCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  friendsCategoryAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid #1a1a1a',
    objectFit: 'cover'
  },
  friendsCategoryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: 'white'
  },
  friendsRatings: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10
  },
  ratingIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  ratingIconWrapperActive: {
    background: 'rgba(255, 59, 92, 0.15)',
    border: '2px solid #FF3B5C'
  },
  ratingCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: 'linear-gradient(135deg, #FF006E, #FF8E53)',
    color: 'white',
    fontSize: 10,
    fontWeight: 600,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #1a1a1a'
  },
  commentInputContainer: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    padding: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10
  },
  commentInput: {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    color: 'white',
    fontSize: 13,
    resize: 'none',
    minHeight: 60,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  commentSubmitBtn: {
    alignSelf: 'flex-end',
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #FF006E, #FF8E53)',
    border: 'none',
    borderRadius: 6,
    color: 'white',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  commentItem: {
    display: 'flex',
    gap: 10,
    padding: 10,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: 600,
    color: 'white'
  },
  commentTime: {
    fontSize: 11,
    opacity: 0.6,
    marginLeft: 'auto',
    color: 'white'
  },
  commentText: {
    fontSize: 13,
    lineHeight: 1.4,
    opacity: 0.9,
    marginBottom: 6,
    color: 'white'
  },
  commentLikeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 12,
    transition: 'all 0.2s'
  },
  commentLikeBtnLiked: {
    color: '#FF3B5C'
  },
  similarShows: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 10
  },
  similarShow: {
    flexShrink: 0,
    width: 100,
    height: 150,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'flex-end',
    padding: 8,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  similarShowTitle: {
    fontSize: 11,
    fontWeight: 600,
    position: 'relative',
    zIndex: 1,
    color: 'white'
  },
  actionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    borderRadius: 16,
    overflow: 'hidden'
  },
  actionOverlayVisible: {
    opacity: 1,
    pointerEvents: 'auto'
  },
  actionModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -120,
    marginTop: -100,
    background: 'rgba(20, 20, 20, 0.98)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    width: 240,
    opacity: 0,
    transition: 'all 0.2s ease'
  },
  actionModalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12
  },
  actionModalItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer'
  },
  actionModalIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  actionModalLabel: {
    fontSize: 10,
    fontWeight: 500,
    opacity: 0.8,
    textAlign: 'center',
    color: 'white'
  },
  watchlistBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF006E, #FF8E53)',
    border: '2px solid rgba(20, 20, 20, 0.98)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}

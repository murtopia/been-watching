/**
 * User Activity Card (Card 1)
 *
 * Pixel-perfect React recreation of card-1-standalone.html
 * Shows when a friend rates, watches, or adds a show to their list
 *
 * Dimensions: 398px × 645px
 * Features: Flip animation, glassmorphic design, interactive buttons
 */

'use client'

import React, { useState } from 'react'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface UserActivityCardData {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
  }
  timestamp: Date
  activityType: 'loved' | 'watching' | 'watched' | 'want-to-watch'
  media: {
    id: string
    title: string
    year: number
    genres: string[]
    rating: number
    posterUrl: string
    synopsis?: string
    creator?: string
    cast?: string[]
  }
  friends: {
    count: number
    avatars: Array<{
      id: string
      name: string
      avatar: string
    }>
  }
  stats: {
    likeCount: number
    commentCount: number
  }
  ratings: {
    meh: number
    like: number
    love: number
  }
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
// SVG Icon Components
// ============================================================================

const HeartIcon: React.FC<{ size?: number; filled?: boolean }> = ({ size = 24, filled = false }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: filled ? 'currentColor' : 'none', stroke: filled ? 'none' : 'currentColor', strokeWidth: 1.5 }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const PlayIcon: React.FC<{ size?: number; filled?: boolean }> = ({ size = 24, filled = false }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: filled ? 'currentColor' : 'none' }}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)

const CheckIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)

const BookmarkIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
)

const PlusIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
    <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z"/>
  </svg>
)

const CommentIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const CloseIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const MenuDotsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
    <circle cx="12" cy="6" r="1.5" fill="white"/>
    <circle cx="12" cy="12" r="1.5" fill="white"/>
    <circle cx="12" cy="18" r="1.5" fill="white"/>
  </svg>
)

const MehFaceIcon: React.FC<{ size?: number; filled?: boolean }> = ({ size = 24, filled = false }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="8" y1="15" x2="16" y2="15"/>
    <line x1="9" y1="9" x2="9" y2="10"/>
    <line x1="15" y1="9" x2="15" y2="10"/>
  </svg>
)

const ThumbsUpIcon: React.FC<{ size?: number; filled?: boolean }> = ({ size = 24, filled = false }) => (
  <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)

const ShareIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg viewBox="0 0 20 22" fill="none" style={{ width: size, height: size }}>
    <path d="M10 3L10 14M10 3L6 7M10 3L14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 11V18C17 19 16 20 15 20H5C4 20 3 19 3 18V11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// ============================================================================
// Main Component
// ============================================================================

export const UserActivityCard: React.FC<UserActivityCardProps> = ({
  data,
  onLike,
  onComment,
  onShare,
  onAddToWatchlist,
  onUserClick,
  onMediaClick,
  onTrack
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onTrack?.('flip', { cardId: data.id, toFace: isFlipped ? 'front' : 'back' })
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    onLike?.()
    onTrack?.('like', { cardId: data.id, mediaId: data.media.id })
  }

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsInWatchlist(!isInWatchlist)
    onAddToWatchlist?.()
    onTrack?.('watchlist', { cardId: data.id, mediaId: data.media.id })
  }

  const getActivityBadge = () => {
    switch (data.activityType) {
      case 'loved':
        return {
          text: 'Loved',
          icon: <HeartIcon size={16} filled />,
          bg: 'rgba(255, 59, 92, 0.25)',
          border: 'rgba(255, 59, 92, 0.5)'
        }
      case 'watching':
        return {
          text: 'Currently Watching',
          icon: <PlayIcon size={16} filled />,
          bg: 'rgba(59, 130, 246, 0.25)',
          border: 'rgba(59, 130, 246, 0.5)'
        }
      case 'watched':
        return {
          text: 'Watched',
          icon: <CheckIcon size={16} />,
          bg: 'rgba(16, 185, 129, 0.25)',
          border: 'rgba(16, 185, 129, 0.5)'
        }
      case 'want-to-watch':
        return {
          text: 'Want to Watch',
          icon: <BookmarkIcon size={16} />,
          bg: 'rgba(245, 158, 11, 0.25)',
          border: 'rgba(245, 158, 11, 0.5)'
        }
    }
  }

  const badge = getActivityBadge()

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  return (
    <div
      style={{
        width: '398px',
        height: '645px',
        position: 'relative',
        perspective: '1000px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          touchAction: 'none'
        }}
      >
        {/* ==================== FRONT FACE ==================== */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            zIndex: 2
          }}
          onClick={handleFlip}
        >
          {/* Background Image */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${data.media.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1
            }}
          />

          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.9) 100%)',
              zIndex: 2
            }}
          />

          {/* Three Dots Menu (Top Right) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTrack?.('menu', { cardId: data.id })
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '12px',
              width: '40px',
              height: '40px',
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
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MenuDotsIcon size={20} />
          </button>

          {/* Content Container */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px',
              paddingBottom: '40px',
              zIndex: 3,
              color: 'white'
            }}
          >
            {/* User Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <img
                src={data.user.avatar}
                alt={data.user.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1.5px solid white',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onUserClick?.(data.user.id)
                  onTrack?.('click-user', { userId: data.user.id })
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '1px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUserClick?.(data.user.id)
                    onTrack?.('click-user', { userId: data.user.id })
                  }}
                >
                  {data.user.name}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7, color: 'white' }}>
                  @{data.user.username} • {getTimeAgo(data.timestamp)}
                </div>
              </div>
            </div>

            {/* Activity Badge */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  background: badge.bg,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: `1px solid ${badge.border}`,
                  color: 'white'
                }}
              >
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            </div>

            {/* Show Title */}
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: '6px',
                margin: '0 0 6px 0',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation()
                onMediaClick?.(data.media.id)
                onTrack?.('click-media', { mediaId: data.media.id })
              }}
            >
              {data.media.title}
            </h2>

            {/* Show Meta */}
            <div style={{ fontSize: '12px', fontWeight: 400, opacity: 0.85, marginBottom: '6px', color: 'white' }}>
              {data.media.year} <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span> {data.media.genres.join(', ')} <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span> ⭐ {data.media.rating.toFixed(1)}
            </div>

            {/* Friend Avatars */}
            {data.friends.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <div style={{ display: 'flex', marginRight: '6px' }}>
                  {data.friends.avatars.slice(0, 4).map((friend, idx) => (
                    <img
                      key={friend.id}
                      src={friend.avatar}
                      alt={friend.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1.5px solid #000',
                        marginLeft: idx === 0 ? 0 : '-6px',
                        objectFit: 'cover',
                        position: 'relative',
                        zIndex: 4 - idx
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.85, color: 'white' }}>
                  {data.friends.count} {data.friends.count === 1 ? 'friend' : 'friends'} also loved this
                </span>
              </div>
            )}
          </div>

          {/* Side Action Buttons */}
          <div
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '60px',
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Like Button with Count Below */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleLike}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(60, 60, 60, 0.4)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: isLiked ? '#FF3B5C' : 'white'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <HeartIcon size={24} filled={isLiked} />
              </button>
              <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px', color: 'white' }}>
                {data.stats.likeCount + (isLiked ? 1 : 0)}
              </div>
            </div>

            {/* Add to Watchlist Button */}
            <button
              onClick={handleAddToWatchlist}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(60, 60, 60, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'white'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isInWatchlist ? <CheckIcon size={24} /> : <PlusIcon size={24} />}
            </button>

            {/* Comment Button with Count Below */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onComment?.()
                  onTrack?.('comment', { cardId: data.id })
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(60, 60, 60, 0.4)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: 'white'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <CommentIcon size={24} />
              </button>
              {data.stats.commentCount > 0 && (
                <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px', color: 'white' }}>
                  {data.stats.commentCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== BACK FACE ==================== */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '16px',
            background: 'linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)',
            overflow: 'hidden',
            zIndex: 1
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleFlip}
            style={{
              position: 'absolute',
              top: '20px',
              right: '16px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s',
              color: 'white'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <CloseIcon size={20} />
          </button>

          {/* Scrollable Content */}
          <div
            style={{
              padding: '20px 16px',
              paddingTop: '50px',
              paddingBottom: '20px',
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
              willChange: 'scroll-position',
              color: 'white'
            }}
          >
            {/* Title */}
            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '6px',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
              color: 'white'
            }}>
              {data.media.title}
            </h2>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', opacity: 0.9, color: 'white' }}>{data.media.year}</span>
              <span style={{ fontSize: '14px', opacity: 0.9, color: 'white' }}>•</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: 'white' }}>
                <span>⭐</span>
                <span>{data.media.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Synopsis */}
            {data.media.synopsis && (
              <p style={{
                fontSize: '14px',
                lineHeight: 1.5,
                opacity: 0.9,
                marginBottom: '20px',
                margin: '0 0 20px 0',
                color: 'white'
              }}>
                {data.media.synopsis}
              </p>
            )}

            {/* Info Grid */}
            {(data.media.creator || data.media.genres) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {data.media.creator && (
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px', color: 'white' }}>Creator</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{data.media.creator}</div>
                  </div>
                )}
                {data.media.genres && (
                  <div>
                    <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px', color: 'white' }}>Genre</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{data.media.genres[0]}</div>
                  </div>
                )}
              </div>
            )}

            {/* Cast */}
            {data.media.cast && data.media.cast.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '10px', color: 'white' }}>Cast</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {data.media.cast.map((actor, idx) => (
                    <div key={idx} style={{ padding: '5px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', fontSize: '12px', color: 'white' }}>
                      {actor}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Ratings */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '10px', color: 'white' }}>
                What Your Friends Think
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { icon: <MehFaceIcon size={24} filled />, label: 'Meh', count: data.ratings.meh, color: '#FBB F24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
                  { icon: <ThumbsUpIcon size={24} filled />, label: 'Like', count: data.ratings.like, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
                  { icon: <HeartIcon size={24} filled />, label: 'Love', count: data.ratings.love, color: '#FF2D92', bg: 'rgba(255,45,146,0.15)', border: 'rgba(255,45,146,0.3)' }
                ].map((rating) => (
                  <div
                    key={rating.label}
                    style={{
                      padding: '12px',
                      background: rating.bg,
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: `1px solid ${rating.border}`
                    }}
                  >
                    <div style={{ color: rating.color }}>
                      {rating.icon}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: 'white' }}>
                      {rating.count}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7, color: 'white' }}>{rating.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={handleAddToWatchlist}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isInWatchlist ? 'linear-gradient(135deg, #FF006E, #FF8E53)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'transform 0.2s'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isInWatchlist ? <CheckIcon size={18} /> : <BookmarkIcon size={18} />}
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
              <button
                onClick={() => {
                  onShare?.()
                  onTrack?.('share', { cardId: data.id })
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <ShareIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

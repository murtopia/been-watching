/**
 * Follow Suggestions Card (Card 7 - Template C)
 * 
 * A unique card type that shows user follow suggestions in a carousel.
 * Completely different from media cards - displays user profiles with:
 * - Match percentage
 * - Bio
 * - Watchlist stats
 * - Friends in common
 * - Follow button
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================

interface UserSuggestion {
  id: string
  name: string
  username: string
  avatar: string
  matchPercentage: number
  bio: string
  stats: {
    wantToWatch: number
    watching: number
    watched: number
  }
  friendsInCommon: {
    count: number
    avatars: string[]
  }
}

// Color theme presets for the container
export type CardColorTheme = 'gold' | 'purple' | 'pink' | 'blue' | 'green' | 'coral'

const COLOR_THEMES: Record<CardColorTheme, { bg: string; border: string }> = {
  gold: { bg: 'rgba(255, 215, 0, 0.25)', border: 'rgba(255, 215, 0, 0.5)' },
  purple: { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.4)' },
  pink: { bg: 'rgba(255, 0, 110, 0.2)', border: 'rgba(255, 0, 110, 0.4)' },
  blue: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)' },
  green: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.4)' },
  coral: { bg: 'rgba(255, 107, 107, 0.2)', border: 'rgba(255, 107, 107, 0.4)' },
}

interface FollowSuggestionsCardProps {
  suggestions: UserSuggestion[]
  colorTheme?: CardColorTheme
  autoRotateInterval?: number // milliseconds, 0 to disable
  onFollow?: (userId: string) => void
  onUserClick?: (userId: string) => void
  onTrack?: (action: string, metadata?: any) => void
}

// ============================================================================
// Icon Component (inline for this card)
// ============================================================================

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
    <path d="M17.657 14.828l-1.414-1.414L17.657 12A4 4 0 1 0 12 6.343l-1.414 1.414-1.414-1.414 1.414-1.414a6 6 0 1 1 8.485 8.485l-1.414 1.414zm-2.829 2.829l-1.414 1.414a6 6 0 1 1-8.485-8.485l1.414-1.414 1.414 1.414L6.343 12A4 4 0 1 0 12 17.657l1.414-1.414 1.414 1.414zm0-9.9l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/>
  </svg>
)

// ============================================================================
// Main Component
// ============================================================================

export const FollowSuggestionsCard: React.FC<FollowSuggestionsCardProps> = ({
  suggestions,
  colorTheme = 'gold',
  autoRotateInterval = 6000, // 6 seconds default, like HTML template
  onFollow,
  onUserClick,
  onTrack,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchDeltaX, setTouchDeltaX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null)
  
  const themeColors = COLOR_THEMES[colorTheme]

  // Auto-rotate effect
  useEffect(() => {
    if (autoRotateInterval <= 0 || isPaused) {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current)
        autoRotateRef.current = null
      }
      return
    }

    autoRotateRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % suggestions.length)
    }, autoRotateInterval)

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current)
      }
    }
  }, [autoRotateInterval, isPaused, suggestions.length])

  const handleFollow = useCallback((userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
        onTrack?.('unfollow', { userId })
      } else {
        newSet.add(userId)
        onTrack?.('follow', { userId })
      }
      return newSet
    })
    onFollow?.(userId)
  }, [onFollow, onTrack])

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < suggestions.length) {
      setCurrentSlide(index)
      onTrack?.('carousel_navigate', { slideIndex: index })
      // Reset auto-rotate timer
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current)
        autoRotateRef.current = setInterval(() => {
          setCurrentSlide(prev => (prev + 1) % suggestions.length)
        }, autoRotateInterval)
      }
    }
  }, [suggestions.length, onTrack, autoRotateInterval])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setIsDragging(true)
    setTouchDeltaX(0)
    setIsPaused(true) // Pause auto-rotate on touch
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const delta = e.touches[0].clientX - touchStartX
    setTouchDeltaX(delta)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    setIsPaused(false) // Resume auto-rotate
    
    // Swipe threshold
    if (Math.abs(touchDeltaX) > 50) {
      if (touchDeltaX < 0 && currentSlide < suggestions.length - 1) {
        // Swipe left - next
        goToSlide(currentSlide + 1)
      } else if (touchDeltaX > 0 && currentSlide > 0) {
        // Swipe right - previous
        goToSlide(currentSlide - 1)
      }
    }
    setTouchDeltaX(0)
  }

  // Mouse hover handlers to pause/resume auto-rotate
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <div className="follow-card-container">
      <style>{`
        .follow-card-container {
          width: 398px;
          max-width: 100%;
        }
        
        .follow-card {
          width: 100%;
          height: 420px;
          border-radius: 16px;
          overflow: visible;
          position: relative;
          background: ${themeColors.bg};
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid ${themeColors.border};
          padding: 20px;
        }
        
        .follow-card-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .discover-badge {
          background: rgba(20, 20, 20, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          align-self: flex-start;
          color: white;
        }
        
        .carousel-container {
          position: relative;
          flex: 1;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .user-profile-card {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(20, 20, 20, 0.98);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
          display: flex;
          flex-direction: column;
          color: #ffffff;
        }
        
        .user-profile-card.active {
          transform: translateX(0);
          opacity: 1;
        }
        
        .user-profile-card.next {
          transform: translateX(100%);
          opacity: 0;
        }
        
        .user-profile-card.prev {
          transform: translateX(-100%);
          opacity: 0;
        }
        
        .user-profile {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .profile-photo {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.5);
          flex-shrink: 0;
        }
        
        .profile-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .name-match-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        
        .name-username {
          flex: 1;
        }
        
        .user-name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 2px;
          cursor: pointer;
        }
        
        .user-name:hover {
          opacity: 0.8;
        }
        
        .username {
          font-size: 13px;
          opacity: 0.7;
          font-weight: 500;
          cursor: pointer;
        }
        
        .username:hover {
          opacity: 0.9;
        }
        
        .match-percentage {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        
        .match-number {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
        }
        
        .match-label {
          font-size: 10px;
          opacity: 0.7;
          font-weight: 500;
        }
        
        .follow-btn {
          background: rgba(139, 30, 63, 0.6);
          color: white;
          border: 1.5px solid rgba(180, 60, 90, 0.8);
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          align-self: flex-start;
          margin-top: 4px;
          min-width: 90px;
          text-align: center;
          box-sizing: border-box;
        }
        
        .follow-btn:hover {
          background: rgba(139, 30, 63, 0.8);
          border-color: rgba(200, 70, 100, 0.9);
          transform: scale(1.05);
        }
        
        .follow-btn:active {
          transform: scale(0.98);
        }
        
        .follow-btn.following {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .bio {
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.8;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .watchlist-stats {
          display: flex;
          justify-content: space-around;
          width: 100%;
          padding: 12px 0;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.7;
          font-weight: 500;
          text-align: center;
        }
        
        .friends-common {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          opacity: 0.8;
          margin-top: auto;
        }
        
        .friend-avatars-stack {
          display: flex;
          margin-right: 6px;
        }
        
        .friend-avatars-stack img {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          margin-left: -8px;
          background: #1a1a1a;
        }
        
        .friend-avatars-stack img:first-child {
          margin-left: 0;
        }
        
        .carousel-dots {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 16px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(20, 20, 20, 0.5);
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid rgba(20, 20, 20, 0.3);
        }
        
        .dot.active {
          background: rgba(20, 20, 20, 0.9);
          width: 24px;
          border-radius: 4px;
          border: 1px solid rgba(20, 20, 20, 0.5);
        }
        
        .dot:hover:not(.active) {
          background: rgba(20, 20, 20, 0.7);
        }
      `}</style>

      <div 
        className="follow-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="follow-card-content">
          {/* Badge */}
          <div className="discover-badge">
            <LinkIcon />
            Find New Friends
          </div>

          {/* Carousel */}
          <div 
            className="carousel-container"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {suggestions.map((user, index) => {
              let cardClass = 'user-profile-card'
              if (index === currentSlide) {
                cardClass += ' active'
              } else if (index > currentSlide) {
                cardClass += ' next'
              } else {
                cardClass += ' prev'
              }

              const isFollowing = followedUsers.has(user.id)

              return (
                <div key={user.id} className={cardClass} data-user={index}>
                  <div className="user-profile">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="profile-photo"
                      onClick={() => onUserClick?.(user.id)}
                    />
                    <div className="profile-info">
                      <div className="name-match-row">
                        <div className="name-username">
                          <div 
                            className="user-name"
                            onClick={() => onUserClick?.(user.id)}
                          >
                            {user.name}
                          </div>
                          <div 
                            className="username"
                            onClick={() => onUserClick?.(user.id)}
                          >
                            @{user.username}
                          </div>
                        </div>
                        <div className="match-percentage">
                          <div className="match-number">{user.matchPercentage}%</div>
                          <div className="match-label">
                            {user.matchPercentage >= 90 ? 'Great Match!' : 
                             user.matchPercentage >= 80 ? 'Good Match!' : 'Match'}
                          </div>
                        </div>
                      </div>
                      <button 
                        className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        onClick={() => handleFollow(user.id)}
                      >
                        {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                      </button>
                    </div>
                  </div>

                  <div className="bio">{user.bio}</div>

                  <div className="watchlist-stats">
                    <div className="stat-item">
                      <div className="stat-number">{user.stats.wantToWatch}</div>
                      <div className="stat-label">Want to Watch</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{user.stats.watching}</div>
                      <div className="stat-label">Watching</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{user.stats.watched}</div>
                      <div className="stat-label">Watched</div>
                    </div>
                  </div>

                  <div className="friends-common">
                    <div className="friend-avatars-stack">
                      {user.friendsInCommon.avatars.slice(0, 3).map((avatar, i) => (
                        <img key={i} src={avatar} alt="Friend" />
                      ))}
                    </div>
                    <span>{user.friendsInCommon.count} friends in common</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Carousel dots */}
          <div className="carousel-dots">
            {suggestions.map((_, index) => (
              <div 
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FollowSuggestionsCard

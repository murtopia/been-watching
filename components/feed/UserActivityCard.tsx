/**
 * Feed Card - Flexible React Component for Activity Feed
 * Supports Template A (user activity) and Template B (recommendations)
 * 
 * Converted from card-1-standalone.html and card-2-standalone.html
 *
 * Dimensions: 398px × 645px
 * Features: Flip animation, comments, back face with full details
 * 
 * Template A (Cards 1, 6): Has user header + heart action
 * Template B (Cards 2, 3, 4, 5, 8): No user header, no heart action
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { ShareButton } from '@/components/sharing/ShareButton'
import YouTubeModal from '@/components/media/YouTubeModal'
import { getAvatarProps } from '@/utils/avatarUtils'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/** Badge configuration for activity/recommendation badges */
export interface FeedCardBadge {
  text: string
  icon?: string        // Icon name from sprite (e.g., 'heart', 'thumbs-up', 'clock')
  color: string        // Background color (rgba)
  borderColor: string  // Border color (rgba)
  textColor?: string   // Default: white
}

/** User info for Template A cards */
export interface FeedCardUser {
  id: string
  name: string
  username: string
  avatar: string | null
}

/** Media/Show data */
export interface FeedCardMedia {
  id: string
  title: string
  year: number
  genres: string[]
  rating: number
  posterUrl: string
  synopsis: string
  creator: string
  cast: string[]
  network?: string  // Deprecated: kept for backward compatibility
  streamingPlatforms?: string[]  // Array of streaming platform names
  season?: number
  mediaType: 'TV' | 'Movie'
}

/** Full card data structure */
export interface FeedCardData {
  id: string
  media: FeedCardMedia
  friends: {
    avatars: Array<{ id: string; name: string; username: string; avatar: string | null }>
    count: number
    text: string
  }
  stats: {
    likeCount: number
    commentCount: number
    userLiked: boolean
  }
  friendsActivity: {
    watching: { count: number; avatars: string[] }
    wantToWatch: { count: number; avatars: string[] }
    watched: { count: number; avatars: string[] }
    ratings: {
      meh: number
      like: number
      love: number
      userRating?: 'meh' | 'like' | 'love'
    }
  }
  comments: Array<{
    id: string
    user: { name: string; avatar: string | null; username?: string; id?: string }
    text: string
    timestamp: string
    likes: number
    userLiked: boolean
  }>
  showComments: Array<{
    id: string
    user: { name: string; avatar: string | null; username?: string; id?: string }
    text: string
    timestamp: string
    likes: number
    userLiked: boolean
  }>
}

/** Legacy data format for backwards compatibility */
export interface UserActivityCardData extends FeedCardData {
  user: FeedCardUser
  timestamp: string
  activityType: 'loved' | 'watching' | 'want-to-watch' | 'watched'
  activityBadges: Array<{
    text: string
    color: string
    borderColor: string
    textColor: string
  }>
}

/** Props for the flexible FeedCard component */
interface FeedCardProps {
  /** Template variant: 'a' = user activity (has header + heart), 'b' = recommendation (no header/heart) */
  variant?: 'a' | 'b'
  
  /** Back variant: 'standard' = full actions, 'unreleased' = Card 4 (no + icon, only bookmark) */
  backVariant?: 'standard' | 'unreleased'
  
  /** Badge configurations to display */
  badges?: FeedCardBadge[]
  
  /** User info (required for variant 'a', ignored for 'b') */
  user?: FeedCardUser
  
  /** Timestamp for user activity (required for variant 'a') */
  timestamp?: string
  
  /** Card data */
  data: FeedCardData | UserActivityCardData
  
  /** Callbacks */
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onAddToWatchlist?: () => void
  onRemindMe?: () => void  // For Card 4 (Coming Soon) - legacy
  onSetReminder?: () => void  // For Card 4 (Coming Soon) - preferred
  onDismiss?: () => void  // For Card 5 (Now Streaming) - dismiss notification
  onDismissRecommendation?: (mediaId: string) => void  // For Cards 2, 3, 8 - permanently hide from recommendations
  onUserClick?: (userId: string) => void
  onMediaClick?: (mediaId: string) => void
  /** Called when user rates the show - should persist to database */
  onRate?: (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => void
  /** Called when user changes watch status - should persist to database */
  onSetStatus?: (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => void
  /** Called when user submits a comment on an activity */
  onSubmitActivityComment?: (activityId: string, text: string) => Promise<void>
  /** Called when user submits a comment on a show */
  onSubmitShowComment?: (mediaId: string, text: string) => Promise<void>
  /** Called when user likes a show comment (back of card) */
  onLikeShowComment?: (commentId: string) => Promise<void>
  /** Called when user likes an activity comment (front of card) */
  onLikeActivityComment?: (commentId: string) => Promise<void>
  /** Current logged-in user (for showing their info on new comments) */
  currentUser?: { name: string; avatar: string; id?: string }
  /** Initial watch status for this media (to show selected state in modal) */
  initialUserStatus?: 'want' | 'watching' | 'watched' | null
  onTrack?: (action: string, metadata?: any) => void
  onFlip?: (isFlipped: boolean) => void  // Notify parent when card flips
  /** Start the card in flipped (back) state - useful for modal/detail views */
  initialFlipped?: boolean
}

/** Legacy props interface for backwards compatibility */
interface UserActivityCardProps {
  data: UserActivityCardData
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onAddToWatchlist?: () => void
  onUserClick?: (userId: string) => void
  onMediaClick?: (mediaId: string) => void
  onTrack?: (action: string, metadata?: any) => void
  onRate?: (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => void
  onSetStatus?: (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => void
  onSubmitActivityComment?: (activityId: string, text: string) => Promise<void>
  onSubmitShowComment?: (mediaId: string, text: string) => Promise<void>
  onLikeShowComment?: (commentId: string) => Promise<void>
  onLikeActivityComment?: (commentId: string) => Promise<void>
  currentUser?: { name: string; avatar: string }
  initialUserStatus?: 'want' | 'watching' | 'watched' | null
  onFlip?: (isFlipped: boolean) => void
  initialFlipped?: boolean
}

// ============================================================================
// Badge Presets - Use these for consistent badge styling
// ============================================================================

export const BADGE_PRESETS = {
  // Card 1 - Activity badges
  loved: {
    text: 'Loved',
    icon: 'heart',
    color: 'rgba(255, 59, 92, 0.25)',
    borderColor: 'rgba(255, 59, 92, 0.5)',
    textColor: 'white',
  } as FeedCardBadge,
  
  watching: {
    text: 'Currently Watching',
    icon: 'play',
    color: 'rgba(59, 130, 246, 0.25)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    textColor: 'white',
  } as FeedCardBadge,
  
  wantToWatch: {
    text: 'Want to Watch',
    icon: 'bookmark',
    color: 'rgba(168, 85, 247, 0.25)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    textColor: 'white',
  } as FeedCardBadge,
  
  watched: {
    text: 'Watched',
    icon: 'check',
    color: 'rgba(52, 211, 153, 0.25)',
    borderColor: 'rgba(52, 211, 153, 0.5)',
    textColor: 'white',
  } as FeedCardBadge,
  
  // Card 2 - Because You Liked
  becauseYouLiked: (showName: string): FeedCardBadge => ({
    text: `Because you liked ${showName}`,
    icon: 'thumbs-up',
    color: 'rgba(139, 92, 246, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    textColor: 'white',
  }),
  
  // Card 3 - Friends Loved (can optionally include count)
  friendsLoved: (count?: number): FeedCardBadge => ({
    text: count ? `${count} Friends Loved This` : 'Your Friends Loved',
    icon: 'heart',
    color: 'rgba(236, 72, 153, 0.25)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    textColor: 'white',
  }),
  
  // Alias for uppercase naming convention
  FRIENDS_LOVED: (count?: number): FeedCardBadge => ({
    text: 'Your Friends Loved This',
    icon: 'heart',
    color: 'rgba(236, 72, 153, 0.25)',
    borderColor: 'rgba(236, 72, 153, 0.5)',
    textColor: 'white',
  }),
  
  // Card 4 - Coming Soon
  comingSoon: (date: string): FeedCardBadge => ({
    text: `Coming Soon on ${date}`,
    icon: 'clock',
    color: 'rgba(168, 85, 247, 0.25)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    textColor: 'white',
  }),
  
  // Card 5 - Now Streaming
  nowStreaming: (platform: string): FeedCardBadge => ({
    text: `Now Streaming on ${platform}`,
    icon: 'tv-screen',
    color: 'rgba(139, 92, 246, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    textColor: 'white',
  }),

  // Card 6: Top 3 Update - gold badge with trophy
  top3Update: (rank: number): FeedCardBadge => ({
    text: `Added to #${rank} Top Show!`,
    icon: 'trophy',
    color: 'rgba(255, 215, 0, 0.25)',
    borderColor: 'rgba(255, 215, 0, 0.5)',
    textColor: '#FFD700',
  }),

  // Card 8: You Might Like - purple badge with thumbs up
  youMightLike: {
    text: 'You Might Like',
    icon: 'thumbs-up-outline',
    color: 'rgba(139, 92, 246, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    textColor: 'white',
  } as FeedCardBadge,
  
  // ============================================================================
  // Uppercase Aliases for Feed Page Usage
  // ============================================================================
  
  BECAUSE_YOU_LIKED: (showName: string): FeedCardBadge => ({
    text: `Because you liked ${showName}`,
    icon: 'thumbs-up',
    color: 'rgba(139, 92, 246, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    textColor: 'white',
  }),
  
  COMING_SOON: (date: string): FeedCardBadge => ({
    text: `Coming ${date}`,
    icon: 'clock',
    color: 'rgba(168, 85, 247, 0.25)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
    textColor: 'white',
  }),
  
  NOW_STREAMING: {
    text: 'Now Streaming!',
    icon: 'tv-screen',
    color: 'rgba(139, 92, 246, 0.25)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
    textColor: 'white',
  } as FeedCardBadge,
  
  YOU_MIGHT_LIKE: (matchPercent?: number, similarUsers?: number): FeedCardBadge => ({
    text: matchPercent ? `${matchPercent}% Match` : 'You Might Like',
    icon: 'thumbs-up-outline',
    color: 'rgba(59, 130, 246, 0.25)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    textColor: 'white',
  }),
  
}

// ============================================================================
// Main Component
// ============================================================================

/** 
 * FeedCard - Flexible component for all feed card types
 * Use variant='a' for user activity cards (1, 6)
 * Use variant='b' for recommendation cards (2, 3, 4, 5, 8)
 */
// Helper function to get profile URL from username or user ID
const getProfileUrl = (user: { username?: string; id?: string } | undefined): string | null => {
  if (!user) return null
  if (user.username) return `/${user.username}`
  // If no username, we can't navigate - return null
  return null
}

// Avatar component with initials fallback
const Avatar: React.FC<{
  src?: string | null
  alt: string
  name?: string | null
  userId?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}> = ({ src, alt, name, userId, size = 40, className, style, onClick }) => {
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
    cursor: onClick ? 'pointer' : 'default',
    ...style
  }
  
  // If image failed to load or no image provided, show initials
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
        onClick={onClick}
      >
        {avatarProps.initials}
      </div>
    )
  }
  
  // Try to show image, but fall back to initials on error
  return (
    <img
      src={avatarProps.imageSrc}
      alt={alt}
      className={className}
      style={baseStyle}
      onClick={onClick}
      onError={() => setImageError(true)}
    />
  )
}

export const FeedCard: React.FC<FeedCardProps> = ({
  variant = 'a',
  backVariant = 'standard',
  badges,
  user,
  timestamp,
  data,
  onLike,
  onComment,
  onShare,
  onAddToWatchlist,
  onRemindMe,
  onDismissRecommendation,
  onUserClick,
  onMediaClick,
  onRate,
  onSetStatus,
  onSubmitActivityComment,
  onSubmitShowComment,
  onLikeShowComment,
  onLikeActivityComment,
  currentUser,
  initialUserStatus,
  onTrack,
  onFlip,
  initialFlipped = false,
}) => {
  // Determine if this is legacy data format
  const isLegacyData = 'user' in data && 'activityBadges' in data
  const legacyData = isLegacyData ? (data as UserActivityCardData) : null
  
  // Extract user info from props or legacy data
  const cardUser = user || legacyData?.user
  const cardTimestamp = timestamp || legacyData?.timestamp
  
  // Extract badges from props or legacy data
  const cardBadges = badges || legacyData?.activityBadges?.map(b => ({
    text: b.text,
    color: b.color,
    borderColor: b.borderColor,
    textColor: b.textColor,
  })) || []
  
  // Determine variant behavior
  const showUserHeader = variant === 'a' && cardUser
  const showHeartAction = variant === 'a'
  const showCommentAction = variant === 'a' // Template B cards don't have comment on front
  const isUnreleased = backVariant === 'unreleased' // Card 4 special handling

  const [isFlipped, setIsFlipped] = useState(initialFlipped)
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const synopsisRef = useRef<HTMLParagraphElement>(null)
  const [actionOverlayVisible, setActionOverlayVisible] = useState(false)
  const [localLiked, setLocalLiked] = useState(data.stats.userLiked)
  const [localLikeCount, setLocalLikeCount] = useState(data.stats.likeCount)
  const [userRating, setUserRating] = useState<'meh' | 'like' | 'love' | null>(data.friendsActivity.ratings.userRating || null)
  const [watchlistStatus, setWatchlistStatus] = useState<Set<'want' | 'watching' | 'watched'>>(
    initialUserStatus ? new Set([initialUserStatus]) : new Set()
  )
  const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>(
    data.showComments.reduce((acc, comment) => ({
      ...acc,
      [comment.id]: { liked: comment.userLiked, count: comment.likes }
    }), {})
  )
  // Track activity comment likes separately
  const [activityCommentLikes, setActivityCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>(
    data.comments.reduce((acc, comment) => ({
      ...acc,
      [comment.id]: { liked: comment.userLiked, count: comment.likes }
    }), {})
  )
  const [visibleShowComments, setVisibleShowComments] = useState(10) // Show 10 comments initially
  const [showCommentText, setShowCommentText] = useState('') // Track show comment input
  const [activityCommentText, setActivityCommentText] = useState('') // Track activity comment input
  // Local state for comments (so we can add new ones optimistically)
  const [localActivityComments, setLocalActivityComments] = useState(data.comments)
  const [localShowComments, setLocalShowComments] = useState(data.showComments)
  const [pressedIcon, setPressedIcon] = useState<string | null>(null) // Track which icon is being pressed for touch feedback
  const [trailerKey, setTrailerKey] = useState<string | null>(null) // YouTube trailer key
  const [trailerLoading, setTrailerLoading] = useState(true) // Track trailer fetch status
  const [showTrailerModal, setShowTrailerModal] = useState(false) // Control trailer modal visibility

  // Refs for DOM elements
  const cardRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const backScrollRef = useRef<HTMLDivElement>(null)
  const backInnerRef = useRef<HTMLDivElement>(null)
  
  // Refs for transform-based scroll (using refs instead of state to avoid re-renders during touch)
  const scrollOffsetRef = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const scrollStartY = useRef<number>(0)
  const velocityY = useRef<number>(0)
  const lastTouchY = useRef<number>(0)
  const lastMoveTime = useRef<number>(0)
  const momentumRAF = useRef<number | null>(null)
  
  // Helper to apply scroll transform directly to DOM (avoids React re-renders)
  // Using translate3d for GPU acceleration (smoother than translateY)
  const applyScrollTransform = (offset: number) => {
    if (backInnerRef.current) {
      backInnerRef.current.style.transform = `translate3d(0, -${offset}px, 0)`
    }
    scrollOffsetRef.current = offset
  }
  
  // Helper to calculate max scroll based on actual content height
  const getMaxScroll = () => {
    if (!backScrollRef.current || !backInnerRef.current) return 0
    const containerHeight = backScrollRef.current.clientHeight
    const contentHeight = backInnerRef.current.scrollHeight // Use scrollHeight to include all content
    return Math.max(0, contentHeight - containerHeight)
  }
  
  // Reset scroll position when card flips back to front
  useEffect(() => {
    if (!isFlipped) {
      scrollOffsetRef.current = 0
      applyScrollTransform(0)
    }
  }, [isFlipped])

  // Check if synopsis needs truncation (only show Read More if text is actually clipped)
  useEffect(() => {
    if (synopsisRef.current) {
      // Compare scrollHeight (full content) vs clientHeight (visible area)
      const isTruncated = synopsisRef.current.scrollHeight > synopsisRef.current.clientHeight
      setNeedsTruncation(isTruncated)
    }
  }, [data.media.synopsis, isFlipped])
  
  // Recalculate scroll bounds when comments change
  useEffect(() => {
    if (backInnerRef.current && isFlipped) {
      // Use RAF to ensure DOM has updated after state change
      requestAnimationFrame(() => {
        // Clamp scroll position if needed after content changes
        const maxScroll = getMaxScroll()
        if (scrollOffsetRef.current > maxScroll) {
          applyScrollTransform(maxScroll)
        }
      })
    }
  }, [visibleShowComments, isFlipped])

  // Fetch trailer on mount
  useEffect(() => {
    const fetchTrailer = async () => {
      setTrailerLoading(true)
      try {
        // Extract TMDB ID from media ID
        // Formats: "tv-12345-s1", "movie-12345", or just a number (from TMDB trending)
        const mediaId = data.media.id
        let tmdbId: number | null = null
        const mediaType = data.media.mediaType.toLowerCase()
        
        // Handle both string and number formats
        if (typeof mediaId === 'number') {
          tmdbId = mediaId
        } else if (typeof mediaId === 'string') {
          if (mediaType === 'tv') {
            const match = mediaId.match(/^tv-(\d+)/)
            if (match) tmdbId = parseInt(match[1])
          } else {
            const match = mediaId.match(/^movie-(\d+)/)
            if (match) tmdbId = parseInt(match[1])
          }
        }

        if (!tmdbId) {
          console.log('Could not extract TMDB ID from', mediaId)
          setTrailerKey(null)
          setTrailerLoading(false)
          return
        }

        const response = await fetch(`/api/tmdb/${mediaType}/${tmdbId}/videos`)
        if (!response.ok) {
          setTrailerKey(null)
          setTrailerLoading(false)
          return
        }

        const videoData = await response.json()
        const trailer = videoData.results?.find((v: any) => 
          v.type === 'Trailer' && v.site === 'YouTube'
        )
        
        if (trailer) {
          setTrailerKey(trailer.key)
        } else {
          setTrailerKey(null)
        }
      } catch (error) {
        console.error('Error fetching trailer:', error)
        setTrailerKey(null)
      } finally {
        setTrailerLoading(false)
      }
    }

    fetchTrailer()
  }, [data.media.id, data.media.mediaType])

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (trailerKey) {
      setShowTrailerModal(true)
    }
  }
  
  // iOS-style momentum scroll for back card using CSS transforms
  // (3D transform breaks native scrollTop, so we use translateY instead)
  // Page scroll is locked when viewing back of card - user must flip back to navigate
  
  // Native touch handlers (need { passive: false } to allow preventDefault)
  const handleBackTouchStartNative = useCallback((e: TouchEvent) => {
    // Cancel any ongoing momentum animation
    if (momentumRAF.current) {
      cancelAnimationFrame(momentumRAF.current)
      momentumRAF.current = null
    }
    
    touchStartY.current = e.touches[0].clientY
    lastTouchY.current = e.touches[0].clientY
    lastMoveTime.current = Date.now()
    scrollStartY.current = scrollOffsetRef.current
    velocityY.current = 0
  }, [])

  const handleBackTouchMoveNative = useCallback((e: TouchEvent) => {
    if (!backScrollRef.current || !backInnerRef.current) return
    
    // Always prevent page scroll when viewing back of card
    e.preventDefault()
    e.stopPropagation()
    
    const now = Date.now()
    const touchY = e.touches[0].clientY
    const deltaYFromStart = touchStartY.current - touchY
    const maxScroll = getMaxScroll()
    
    // Calculate instantaneous velocity (pixels per ms)
    const dt = now - lastMoveTime.current
    if (dt > 0) {
      const dy = lastTouchY.current - touchY
      velocityY.current = 0.8 * velocityY.current + 0.2 * (dy / dt)
    }
    
    // Handle internal scroll
    const newOffset = scrollStartY.current + deltaYFromStart
    
    // Allow over-scroll with resistance (rubber band effect)
    let finalOffset: number
    if (newOffset < 0) {
      finalOffset = newOffset * 0.3
    } else if (newOffset > maxScroll) {
      finalOffset = maxScroll + (newOffset - maxScroll) * 0.3
    } else {
      finalOffset = newOffset
    }
    
    // Apply transform directly to DOM (no React re-render)
    applyScrollTransform(finalOffset)
    
    lastTouchY.current = touchY
    lastMoveTime.current = now
  }, [])

  const handleBackTouchEndNative = useCallback(() => {
    const maxScroll = getMaxScroll()
    const currentOffset = scrollOffsetRef.current
    
    // Check if we're over-scrolled and need to bounce back
    if (currentOffset < 0 || currentOffset > maxScroll) {
      // Animate bounce back to valid bounds
      const targetOffset = currentOffset < 0 ? 0 : maxScroll
      animateBounceBack(targetOffset)
      return
    }
    
    // Use the tracked velocity (convert from px/ms to px/frame at 60fps)
    let velocity = velocityY.current * 16.67
    
    // Only apply momentum if there's meaningful velocity
    if (Math.abs(velocity) < 0.5) return
    
    // Clamp initial velocity to reasonable bounds
    const maxVelocity = 50
    velocity = Math.max(-maxVelocity, Math.min(maxVelocity, velocity))
    
    // More friction = stops faster (0.92 vs iOS default 0.967)
    const decelerationPerFrame = 0.92
    const minVelocity = 0.3
    
    const animateMomentum = () => {
      if (Math.abs(velocity) < minVelocity) {
        momentumRAF.current = null
        return
      }
      
      const maxScroll = getMaxScroll()
      const currentOffset = scrollOffsetRef.current
      
      // If we hit bounds, bounce back
      if (currentOffset <= 0 && velocity < 0) {
        animateBounceBack(0)
        return
      } else if (currentOffset >= maxScroll && velocity > 0) {
        animateBounceBack(maxScroll)
        return
      }
      
      // Apply velocity
      const newOffset = currentOffset + velocity
      applyScrollTransform(newOffset)
      
      velocity *= decelerationPerFrame
      
      momentumRAF.current = requestAnimationFrame(animateMomentum)
    }
    
    momentumRAF.current = requestAnimationFrame(animateMomentum)
  }, [])
  
  // Attach native touch event listeners with { passive: false } to allow preventDefault
  useEffect(() => {
    const element = backScrollRef.current
    if (!element) return
    
    element.addEventListener('touchstart', handleBackTouchStartNative, { passive: true })
    element.addEventListener('touchmove', handleBackTouchMoveNative, { passive: false })
    element.addEventListener('touchend', handleBackTouchEndNative, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleBackTouchStartNative)
      element.removeEventListener('touchmove', handleBackTouchMoveNative)
      element.removeEventListener('touchend', handleBackTouchEndNative)
    }
  }, [handleBackTouchStartNative, handleBackTouchMoveNative, handleBackTouchEndNative])
  
  // Smooth bounce-back animation using CSS transition
  const animateBounceBack = (targetOffset: number) => {
    if (!backInnerRef.current) return
    
    // Use CSS transition for smooth bounce
    backInnerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    applyScrollTransform(targetOffset)
    
    // Remove transition after animation completes
    setTimeout(() => {
      if (backInnerRef.current) {
        backInnerRef.current.style.transition = ''
      }
    }, 300)
  }

  // Desktop mouse wheel scroll support
  const handleBackWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    const maxScroll = getMaxScroll()
    const newOffset = scrollOffsetRef.current + e.deltaY
    const clampedOffset = Math.max(0, Math.min(newOffset, maxScroll))
    
    applyScrollTransform(clampedOffset)
  }

  const flipCard = () => {
    const newFlippedState = !isFlipped
    setIsFlipped(newFlippedState)
    setCommentsVisible(false)
    setCommentsExpanded(false)
    setActionOverlayVisible(false)
    setPressedIcon(null)
    // Notify parent of flip state change
    onFlip?.(newFlippedState)
  }

  const handleCommentButtonClick = () => {
    setCommentsVisible(true)
  }

  const toggleComments = () => {
    setCommentsExpanded(!commentsExpanded)
  }

  // Swipe gesture for front comments modal
  const commentSwipeStartY = useRef<number>(0)
  const commentsTabRef = useRef<HTMLDivElement>(null)
  const commentSwipeThreshold = 40 // pixels to trigger expand/collapse

  const handleCommentSwipeStart = (e: React.TouchEvent) => {
    commentSwipeStartY.current = e.touches[0].clientY
  }

  const handleCommentSwipeMove = (e: React.TouchEvent) => {
    const deltaY = commentSwipeStartY.current - e.touches[0].clientY
    
    // If dragging up and not expanded, expand immediately so content slides with gesture
    if (deltaY > 20 && !commentsExpanded) {
      setCommentsExpanded(true)
    }
  }

  const handleCommentSwipeEnd = (e: React.TouchEvent) => {
    const deltaY = commentSwipeStartY.current - e.changedTouches[0].clientY
    
    if (deltaY > commentSwipeThreshold) {
      // Swiped up - ensure expanded
      setCommentsExpanded(true)
    } else if (deltaY < -commentSwipeThreshold) {
      // Swiped down - collapse or close
      if (commentsExpanded) {
        setCommentsExpanded(false)
      } else {
        closeCommentsTab()
      }
    }
  }

  const closeCommentsTab = () => {
    setCommentsVisible(false)
    setCommentsExpanded(false)
  }

  const handleLike = () => {
    setLocalLiked(!localLiked)
    setLocalLikeCount(localLiked ? localLikeCount - 1 : localLikeCount + 1)
    onLike?.()
  }

  const toggleActionOverlay = () => {
    setActionOverlayVisible(!actionOverlayVisible)
  }

  const handleRating = (rating: 'meh' | 'like' | 'love', e: React.MouseEvent) => {
    e.stopPropagation()
    // Toggle off if clicking the same rating, otherwise set new rating
    const newRating = userRating === rating ? null : rating
    setUserRating(newRating)
    setPressedIcon(null) // Clear pressed state after selection
    onTrack?.('rating', { rating: newRating, mediaId: data.media.id })
    // Call external callback to persist to database
    onRate?.(data.media.id, newRating)
  }

  const handleWatchlist = (status: 'want' | 'watching' | 'watched', e: React.MouseEvent) => {
    e.stopPropagation()
    // Toggle off if clicking the same status, otherwise set new status (single-select)
    const newStatus = watchlistStatus.has(status) ? null : status
    if (newStatus) {
      setWatchlistStatus(new Set([newStatus]))
    } else {
      setWatchlistStatus(new Set())
    }
    setPressedIcon(null) // Clear pressed state after selection
    onTrack?.('watchlist', { status: newStatus, mediaId: data.media.id })
    // Call external callback to persist to database
    onSetStatus?.(data.media.id, newStatus)
  }

  // Submit activity comment
  const handleSubmitActivityComment = async () => {
    try {
      if (!activityCommentText.trim()) return
      if (!data || !data.id) {
        console.error('Cannot submit activity comment: data structure is invalid', { data })
        alert('Error: Activity information is missing. Please try again.')
        return
      }
      
      const commentText = activityCommentText.trim()
      const activityId = data.id
      
      // Optimistically add the comment to local state
      const newComment = {
        id: `temp-${Date.now()}`,
        user: {
          name: currentUser?.name || 'You',
          avatar: currentUser?.avatar || 'https://i.pravatar.cc/150?img=1'
        },
        text: commentText,
        timestamp: 'Just now',
        likes: 0,
        userLiked: false
      }
      setLocalActivityComments(prev => [newComment, ...prev])
      setActivityCommentText('') // Clear input immediately
      
      // Persist to database if callback provided
      if (onSubmitActivityComment) {
        try {
          await onSubmitActivityComment(activityId, commentText)
          onTrack?.('activity_comment', { activityId })
        } catch (err) {
          console.error('Error submitting activity comment:', err)
          // Remove optimistic comment on error
          setLocalActivityComments(prev => prev.filter(c => c.id !== newComment.id))
          // Show error to user
          alert('Failed to save comment. Please try again.')
        }
      }
    } catch (err) {
      // Catch any synchronous errors
      console.error('Unexpected error in handleSubmitActivityComment:', err)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  // Submit show comment
  const handleSubmitShowComment = async () => {
    try {
      if (!showCommentText.trim()) return
      if (!data || !data.media || !data.media.id) {
        console.error('Cannot submit show comment: data structure is invalid', { data })
        alert('Error: Show information is missing. Please try again.')
        return
      }
      
      const commentText = showCommentText.trim()
      const mediaId = data.media.id
      
      // Optimistically add the comment to local state
      const newComment = {
        id: `temp-${Date.now()}`,
        user: {
          name: currentUser?.name || 'You',
          avatar: currentUser?.avatar || 'https://i.pravatar.cc/150?img=1'
        },
        text: commentText,
        timestamp: 'Just now',
        likes: 0,
        userLiked: false
      }
      setLocalShowComments(prev => [newComment, ...prev])
      // Initialize like state for the new comment
      setCommentLikes(prev => ({
        ...prev,
        [newComment.id]: { liked: false, count: 0 }
      }))
      setShowCommentText('') // Clear input immediately
      
      // Persist to database if callback provided
      if (onSubmitShowComment) {
        try {
          await onSubmitShowComment(mediaId, commentText)
          onTrack?.('show_comment', { mediaId })
        } catch (err) {
          console.error('Error submitting show comment:', err)
          // Remove optimistic comment on error
          setLocalShowComments(prev => prev.filter(c => c.id !== newComment.id))
          // Show error to user
          alert('Failed to save comment. Please try again.')
        }
      }
    } catch (err) {
      // Catch any synchronous errors
      console.error('Unexpected error in handleSubmitShowComment:', err)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleCommentLike = async (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const current = commentLikes[commentId] || { liked: false, count: 0 }
    const newLiked = !current.liked
    
    // Optimistic update
    setCommentLikes({
      ...commentLikes,
      [commentId]: {
        liked: newLiked,
        count: newLiked ? current.count + 1 : current.count - 1
      }
    })
    
    // Call the appropriate handler based on which comment type
    // Check if it's a show comment (back of card) or activity comment (front of card)
    const isShowComment = localShowComments.some(c => c.id === commentId)
    
    try {
      if (isShowComment && onLikeShowComment) {
        await onLikeShowComment(commentId)
      } else if (!isShowComment && onLikeActivityComment) {
        await onLikeActivityComment(commentId)
      }
      onTrack?.('comment_like', { commentId, mediaId: data.media.id })
    } catch (error) {
      console.error('Error liking comment:', error)
      // Revert optimistic update on error
      setCommentLikes({
        ...commentLikes,
        [commentId]: current
      })
    }
  }

  const handleCommentIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    commentInputRef.current?.focus()
  }

  const handleLoadMoreComments = () => {
    setVisibleShowComments(prev => Math.min(prev + 10, localShowComments.length))
  }

  return (
    <>
      <style jsx>{`
        /* Card container with 3D perspective */
        .card-container {
          width: 398px;
          height: 645px;
          perspective: 1000px;
          position: relative;
        }

        /* Card with flip transformation */
        .card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px;
          touch-action: manipulation; /* Allow touch but prevent double-tap zoom */
        }

        .card.flipped {
          transform: rotateY(180deg);
        }

        /* Card faces */
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 16px;
          overflow: hidden; /* Ensure content is clipped to card bounds */
        }

        .card-front {
          z-index: 2;
          overflow: hidden;
        }

        .card-back {
          transform: rotateY(180deg);
          background: #0a0a0a;
          overflow: hidden;
          z-index: 1;
        }

        /* Front card styles */
        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .card-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0.9) 100%
          );
          z-index: 2;
        }

        .card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          padding-bottom: 40px;
          z-index: 3;
          color: white;
        }

        /* User header */
        .user-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid white;
          object-fit: cover;
        }

        .user-info {
          flex: 1;
        }

        .username {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 1px;
          color: white !important;
          opacity: 1 !important;
        }

        .timestamp {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 1 !important;
        }
        
        .user-header:active .username,
        .user-header:active .timestamp {
          opacity: 0.7 !important;
        }

        /* Activity Badges */
        .activity-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          max-width: calc(100% - 70px); /* Leave room for side action icons */
        }

        .activity-badge {
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          max-width: 100%;
          overflow: hidden;
        }
        
        .activity-badge span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Show info */
        .show-title {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .show-meta {
          font-size: 12px;
          font-weight: 400;
          opacity: 0.85;
          margin-bottom: 6px;
        }

        .meta-dot {
          margin: 0 4px;
          opacity: 0.5;
        }

        /* Friend avatars */
        .friend-avatars {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .friend-avatars-stack {
          display: flex;
          margin-right: 6px;
        }

        .friend-avatars-stack img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid #000;
          margin-left: -6px;
        }

        .friend-avatars-stack img:first-child {
          margin-left: 0;
        }

        .friend-count {
          font-size: 12px;
          font-weight: 400;
          opacity: 0.85;
        }

        /* Menu button (three dots) */
        .menu-btn {
          position: absolute;
          top: 20px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(60, 60, 60, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 6;
          transition: all 0.2s;
        }

        .menu-btn:active {
          transform: scale(0.9);
        }

        .menu-btn svg {
          width: 20px;
          height: 20px;
          pointer-events: none;
        }

        /* Side actions */
        .side-actions {
          position: absolute;
          right: 12px;
          bottom: 60px;
          z-index: 4;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(60, 60, 60, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .action-btn:active {
          transform: scale(0.9);
        }

        .action-btn.dismiss-btn {
          width: 36px;
          height: 36px;
          background: rgba(80, 80, 80, 0.5);
        }

        .action-btn.dismiss-btn:hover {
          background: rgba(100, 100, 100, 0.6);
        }

        .action-btn svg {
          pointer-events: none;
        }

        /* Liked state handled by sprite active state */

        .action-count {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
          color: white;
          pointer-events: none;
        }

        /* Action Overlay Modal */
        .action-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          border-radius: 16px;
          overflow: hidden;
        }

        .action-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .action-modal {
          position: absolute;
          bottom: 90px;
          right: 60px;
          left: auto;
          top: auto;
          transform: scale(0.9);
          background: rgba(20, 20, 20, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 16px;
          width: 240px;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .card.flipped .action-modal {
          transform: scale(0.9) rotateY(180deg);
          left: 90px;
          right: auto;
          bottom: auto;
          top: 142px;
        }

        .action-overlay.visible .action-modal {
          transform: scale(1);
          opacity: 1;
        }

        .card.flipped .action-overlay.visible .action-modal {
          transform: scale(1) rotateY(180deg);
          opacity: 1;
          left: 90px;
          right: auto;
          bottom: auto;
          top: 142px;
        }

        .action-modal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .action-modal-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .action-modal-item:active {
          transform: scale(0.95);
        }

        .action-modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }

        .action-modal-item:hover .action-modal-icon {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Touch feedback for mobile - using JS-controlled class */
        .action-modal-icon.pressed {
          background: rgba(255, 59, 92, 0.3) !important;
          border-color: #FF3B5C !important;
        }

        /* Selected/active state for icons */
        .action-modal-icon.active {
          background: rgba(255, 59, 92, 0.2) !important;
          border-color: #FF3B5C !important;
        }

        .action-modal-label {
          font-size: 10px;
          font-weight: 500;
          opacity: 0.8;
          text-align: center;
          line-height: 1.2;
        }

        .action-modal-divider {
          grid-column: 1 / -1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 2px 0;
        }

        .watchlist-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF006E, #FF8E53);
          border: 2px solid rgba(20, 20, 20, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Comments Tab */
        .comments-tab {
          position: absolute;
          bottom: 0;
          left: 10px;
          right: 10px;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 5;
          transition: transform 0.3s ease, opacity 0.3s ease;
          max-height: 70%;
          overflow: hidden;
          transform: translateY(100%);
          opacity: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
        }

        .comments-tab.visible {
          transform: translateY(13px);
          opacity: 1;
          pointer-events: auto;
        }

        .comments-preview {
          padding: 11px 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .comments-preview-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .comments-close-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .comments-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .comments-close-btn:active {
          transform: scale(0.9);
        }

        .comments-close-btn svg {
          width: 14px;
          height: 14px;
          stroke: white;
          stroke-width: 2;
        }

        .comments-full {
          display: none;
          padding: 20px;
          padding-bottom: 0;
          flex: 1;
          min-height: 0;
          overflow-y: scroll;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .comments-tab.visible .comments-preview {
          border-bottom: 3px solid rgba(255, 255, 255, 0.1);
        }

        .comments-tab.visible .comments-full {
          display: block;
          overflow: hidden;
        }

        .comments-tab.visible:not(.expanded) .activity-comment-item {
          display: none;
        }

        .comments-tab.expanded .comments-full {
          overflow-y: scroll;
        }

        .activity-comment-item {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .activity-comment-item:last-child {
          border-bottom: none;
        }

        .activity-comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .activity-comment-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .activity-comment-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .activity-comment-username {
          font-size: 13px;
          font-weight: 600;
        }

        .activity-comment-time {
          font-size: 11px;
          opacity: 0.6;
        }

        .activity-comment-text {
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
          margin-left: 38px;
        }

        .comment-actions {
          display: flex;
          gap: 12px;
          margin-top: 6px;
          justify-content: flex-end;
        }

        .comment-like-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .comment-like-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .comment-like-btn.liked {
          color: #FF3B5C;
        }

        .comment-like-btn svg {
          width: 14px;
          height: 14px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
        }

        .comment-like-btn.liked svg {
          fill: currentColor;
        }

        .activity-comment-input-container {
          padding: 0;
          margin-top: -5px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex-shrink: 0;
        }

        .activity-comment-input-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .activity-comment-input-wrapper {
          flex: 1;
        }

        .activity-comment-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-size: 16px; /* 16px required to prevent iOS auto-zoom */
          outline: none;
          resize: none;
          min-height: 36px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .activity-comment-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .activity-comment-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px; /* Match comment text size */
        }

        .activity-comment-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
        }

        .activity-comment-char-count {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
          line-height: 1;
        }

        .activity-comment-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 11px -20px 12px -20px;
        }

        .activity-comment-send-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .activity-comment-send-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .activity-comment-send-btn svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        /* Back of card scroll wrapper - fixed position container */
        .card-back-scroll-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        
        /* Back of card styles - scroll container */
        .card-back-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0 16px 20px 16px;
          box-sizing: border-box;
          overflow: hidden; /* Clip content, JS handles scroll via transform */
          touch-action: none; /* JS handles scroll */
          color: white;
        }
        
        /* Inner wrapper - uses transform for smooth scroll */
        .card-back-inner {
          width: 100%;
          display: block;
          padding-top: 50px; /* Space for close button - keeps title in same position */
          padding-bottom: 20px; /* Extra space so Load More button is fully visible */
          /* Force Safari to calculate full height */
          min-height: fit-content;
          height: auto !important;
          /* GPU compositing for smooth scroll */
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 12px;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .close-btn:active {
          transform: scale(0.9);
        }

        .close-btn svg {
          width: 16px;
          height: 16px;
          stroke: white;
          stroke-width: 2;
        }

        /* Back card sections */
        .back-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }

        .back-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          font-size: 14px;
          opacity: 0.9;
        }

        .back-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .back-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          min-width: 36px;
          line-height: 1;
        }

        .back-badge.trailer {
          cursor: pointer;
        }

        .back-badge.trailer.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Ensure button inherits all badge styling */
        button.back-badge {
          /* Reset only what's needed, let .back-badge class provide the rest */
          margin: 0;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          color: inherit;
          /* Don't override border, background, padding, border-radius - let .back-badge handle it */
        }

        /* Synopsis and Read More styles in globals.css */

        .back-action-icons {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .back-icon-btn:active {
          transform: scale(0.9);
        }

        .back-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .back-info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .back-info-label {
          font-size: 11px;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .back-info-value {
          font-size: 14px;
          font-weight: 600;
        }

        .back-section {
          margin-bottom: 20px;
        }

        .back-section:last-child,
        .show-comments-section {
          margin-bottom: 0;
        }

        .back-section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.6;
          margin-bottom: 10px;
        }

        .cast-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cast-member {
          padding: 5px 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          font-size: 12px;
        }

        .friends-categories {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .friends-category {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .friends-category:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .friends-avatars-stack {
          display: flex;
          align-items: center;
        }

        .friends-avatars-stack img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #1a1a1a;
          margin-left: -10px;
          object-fit: cover;
        }

        .friends-avatars-stack img:first-child {
          margin-left: 0;
        }

        .friends-category-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .friends-category-text .count {
          font-weight: 600;
        }

        /* Friends Ratings styles moved to globals.css */

        .show-comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 0;
          /* Force Safari to render all children */
          min-height: fit-content;
          transform: translateZ(0); /* Create new stacking context */
        }

        .comment-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          flex-shrink: 0; /* Prevent comment from being compressed */
        }

        .comment-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .comment-content {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .comment-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .comment-username {
          font-size: 13px;
          font-weight: 600;
        }

        .comment-timestamp {
          font-size: 11px;
          opacity: 0.6;
        }

        .comment-text {
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
        }

        .comment-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 16px; /* 16px required to prevent iOS auto-zoom */
          outline: none;
          resize: none;
          min-height: 44px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .comment-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .comment-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px; /* Match comment text size */
        }

        .comment-actions {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          margin-top: 6px;
        }

        .comment-char-count {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
          line-height: 1;
        }

        .comment-submit-btn {
          padding: 6px 16px;
          background: linear-gradient(135deg, #FF006E, #FF8E53);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .comment-submit-btn:active {
          transform: scale(0.95);
        }

        .load-more-btn {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .load-more-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>

      <div className="card-container" ref={cardRef}>
        <div className={`card ${isFlipped ? 'flipped' : ''}`}>
          {/* FRONT FACE */}
          <div className="card-face card-front">
            {/* Background Image */}
            <div className="card-background">
              <img src={data.media.posterUrl} alt={data.media.title} />
            </div>
            <div className="background-overlay" />

            {/* Menu Button (Three Dots) */}
            <div className="menu-btn" onClick={flipCard}>
              <Icon name="menu-dots" size={20} color="white" />
            </div>

            {/* Card Content */}
            <div className="card-content">
              {/* User Header - Only for Template A */}
              {showUserHeader && cardUser && (() => {
                const profileUrl = cardUser.username ? `/${cardUser.username}` : null
                
                return (
                  <div className="user-header">
                    {profileUrl ? (
                      <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                        <Avatar
                          src={cardUser.avatar}
                          alt={cardUser.name}
                          name={cardUser.name}
                          userId={cardUser.id}
                          size={40}
                          className="user-avatar"
                        />
                      </Link>
                    ) : (
                      <Avatar
                        src={cardUser.avatar}
                        alt={cardUser.name}
                        name={cardUser.name}
                        userId={cardUser.id}
                        size={40}
                        className="user-avatar"
                        onClick={() => onUserClick?.(cardUser.id)}
                      />
                    )}
                    <div className="user-info">
                      {profileUrl ? (
                        <Link href={profileUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="username" style={{ color: 'white', cursor: 'pointer' }}>{cardUser.name}</div>
                        </Link>
                      ) : (
                        <div className="username" style={{ color: 'white' }}>{cardUser.name}</div>
                      )}
                      <div className="timestamp" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{cardTimestamp}</div>
                    </div>
                  </div>
                )
              })()}

              {/* Activity/Recommendation Badges */}
              <div className="activity-badges">
                {cardBadges.map((badge, idx) => {
                  // Check if badge has icon property (FeedCardBadge type)
                  const badgeIcon = 'icon' in badge ? badge.icon : undefined
                  
                  return (
                    <div
                      key={idx}
                      className="activity-badge"
                      style={{
                        background: badge.color,
                        border: `1px solid ${badge.borderColor}`,
                        color: badge.textColor || 'white',
                      }}
                    >
                      {/* Render icon if specified */}
                      {badgeIcon && (
                        <Icon name={badgeIcon} state="default" size={16} color={badge.textColor || 'white'} />
                      )}
                      {/* Legacy icon support for badges without icon prop */}
                      {!badgeIcon && badge.text === 'Loved' && (
                        <Icon name="heart" state="default" size={16} color={badge.textColor || 'white'} />
                      )}
                      {!badgeIcon && badge.text === 'Currently Watching' && (
                        <Icon name="play" state="default" size={16} color={badge.textColor || 'white'} />
                      )}
                      {badge.text}
                    </div>
                  )
                })}
              </div>

              {/* Show Info */}
              <div className="show-title">{data.media.title}</div>
              <div className="show-meta">
                {data.media.year} <span className="meta-dot">•</span>{' '}
                {data.media.genres.join(' ')} <span className="meta-dot">•</span>{' '}
                {data.media.rating > 0 ? (
                  <>
                    <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>
                      <Icon name="star-gold" size={14} />
                    </span>{' '}
                    {data.media.rating.toFixed(1)}
                  </>
                ) : (
                  <span style={{ opacity: 0.6 }}>New</span>
                )}
              </div>

              {/* Friend Avatars */}
              <div className="friend-avatars">
                <div className="friend-avatars-stack">
                  {data.friends.avatars.slice(0, 3).map((friend) => {
                    const avatarProps = getAvatarProps(friend.avatar, friend.name, friend.id)
                    return avatarProps.hasImage ? (
                      <img 
                        key={friend.id} 
                        src={avatarProps.imageSrc!} 
                        alt={friend.name}
                        onError={(e) => {
                          // On image load error, replace with initials
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const initialsEl = target.nextElementSibling as HTMLElement
                          if (initialsEl) initialsEl.style.display = 'flex'
                        }}
                      />
                    ) : (
                      <div 
                        key={friend.id}
                        className="avatar-initials"
                        style={{ 
                          background: avatarProps.backgroundGradient,
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'white'
                        }}
                      >
                        {avatarProps.initials}
                      </div>
                    )
                  })}
                </div>
                <div className="friend-count">{data.friends.text}</div>
              </div>
            </div>

            {/* Side Actions */}
            <div className="side-actions">
              {/* Like Button - Only for Template A (user activity) */}
              {showHeartAction && (
                <div>
                  <button
                    className={`action-btn ${localLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                  >
                    <Icon
                      name="heart-nav"
                      state={localLiked ? 'active' : 'default'}
                      size={24}
                    />
                  </button>
                  <div className="action-count">{localLikeCount}</div>
                </div>
              )}

              {/* Add Button - Shows + icon (or bookmark-plus for unreleased) */}
              <div>
                {isUnreleased ? (
                  // Card 4 (Coming Soon) - Direct bookmark action, no modal
                  <button className="action-btn" onClick={onAddToWatchlist}>
                    <Icon name="bookmark-plus" state="default" size={24} />
                  </button>
                ) : (
                  // Standard - Opens quick action modal
                  <button className="action-btn" onClick={toggleActionOverlay}>
                    <Icon name="plus" state="default" size={24} />
                  </button>
                )}
              </div>

              {/* Comment Button - Only for Template A */}
              {showCommentAction && (
                <div>
                  <button className="action-btn" onClick={handleCommentButtonClick}>
                    <Icon name="comment" state="default" size={24} />
                  </button>
                  <div className="action-count">{localActivityComments.length}</div>
                </div>
              )}

              {/* Share Button - For Template B and unreleased */}
              {(!showCommentAction || isUnreleased) && (
                <div>
                  <button className="action-btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                    <Icon name="share" state="default" size={24} />
                  </button>
                </div>
              )}

              {/* Remind Me Button - Only for Card 4 (unreleased) */}
              {isUnreleased && (
                <div>
                  <button className="action-btn" onClick={onRemindMe}>
                    <Icon name="bell" state="default" size={24} />
                  </button>
                </div>
              )}

              {/* Dismiss Button - Only for Template B (recommendation cards) */}
              {variant === 'b' && !isUnreleased && onDismissRecommendation && (
                <div>
                  <button 
                    className="action-btn dismiss-btn" 
                    onClick={() => {
                      const mediaId = ('media' in data && (data as FeedCardData).media?.id) || ''
                      if (mediaId) {
                        onDismissRecommendation(mediaId)
                      }
                    }}
                    title="Not interested"
                  >
                    <Icon name="close" state="default" size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Comments Tab */}
            <div
              ref={commentsTabRef}
              className={`comments-tab ${commentsVisible ? 'visible' : ''} ${
                commentsExpanded ? 'expanded' : ''
              }`}
            >
              <div 
                className="comments-preview" 
                onClick={toggleComments}
                onTouchStart={handleCommentSwipeStart}
                onTouchMove={handleCommentSwipeMove}
                onTouchEnd={handleCommentSwipeEnd}
              >
                <div className="comments-preview-content">
                  <Icon name="comment" size={16} color="white" />
                  <span>View {localActivityComments.length} comments...</span>
                </div>
                <button className="comments-close-btn" onClick={(e) => {
                  e.stopPropagation()
                  closeCommentsTab()
                }}>
                  <Icon name="close" size={14} color="white" />
                </button>
              </div>

              <div className="comments-full">
                <div className="activity-comment-input-container">
                  <Avatar
                    src={currentUser?.avatar || cardUser?.avatar}
                    alt="You"
                    name={currentUser?.name || cardUser?.name}
                    userId={currentUser?.id || cardUser?.id}
                    size={28}
                    className="activity-comment-input-avatar"
                  />
                  <div className="activity-comment-input-wrapper">
                    <textarea
                      className="activity-comment-input"
                      placeholder="Add a comment..."
                      value={activityCommentText}
                      onChange={(e) => {
                        if (e.target.value.length <= 280) {
                          setActivityCommentText(e.target.value)
                        }
                      }}
                      maxLength={280}
                      rows={2}
                    ></textarea>
                  </div>
                  <div className="activity-comment-actions">
                    <div className="activity-comment-char-count">
                      {activityCommentText.length}/280
                    </div>
                    <button 
                      className="activity-comment-send-btn"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSubmitActivityComment().catch(err => {
                          console.error('Unhandled error in activity comment submission:', err)
                        })
                      }}
                      disabled={!activityCommentText.trim()}
                      style={{ opacity: activityCommentText.trim() ? 1 : 0.5 }}
                    >
                      <Icon name="send" size={16} color="white" />
                    </button>
                  </div>
                </div>
                <div className="activity-comment-divider"></div>
                {localActivityComments.map((comment) => {
                  const profileUrl = comment.user.username ? `/${comment.user.username}` : null
                  
                  return (
                    <div key={comment.id} className="activity-comment-item">
                      <div className="activity-comment-header">
                        <div className="activity-comment-header-left">
                          {profileUrl ? (
                            <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                              <Avatar
                                src={comment.user.avatar}
                                alt={comment.user.name}
                                name={comment.user.name}
                                userId={comment.user.id}
                                size={28}
                                className="activity-comment-avatar"
                              />
                            </Link>
                          ) : (
                            <Avatar
                              src={comment.user.avatar}
                              alt={comment.user.name}
                              name={comment.user.name}
                              userId={comment.user.id}
                              size={28}
                              className="activity-comment-avatar"
                            />
                          )}
                          {profileUrl ? (
                            <Link href={profileUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <span className="activity-comment-username" style={{ cursor: 'pointer' }}>
                                {comment.user.name}
                              </span>
                            </Link>
                          ) : (
                            <span className="activity-comment-username">
                              {comment.user.name}
                            </span>
                          )}
                          <span className="activity-comment-time">{comment.timestamp}</span>
                        </div>
                      <button
                        className={`comment-like-btn ${(activityCommentLikes[comment.id] || { liked: comment.userLiked }).liked ? 'liked' : ''}`}
                        onClick={async (e) => {
                          e.stopPropagation()
                          console.log('🔵 Activity comment like button clicked:', comment.id)
                          console.log('🔵 Handler available:', !!onLikeActivityComment)
                          
                          const current = activityCommentLikes[comment.id] || { liked: comment.userLiked, count: comment.likes }
                          const newLiked = !current.liked
                          
                          console.log('🔵 Current state:', current, 'New liked:', newLiked)
                          
                          // Optimistic update
                          setActivityCommentLikes({
                            ...activityCommentLikes,
                            [comment.id]: {
                              liked: newLiked,
                              count: newLiked ? current.count + 1 : current.count - 1
                            }
                          })
                          
                          // Call handler
                          if (onLikeActivityComment) {
                            console.log('🔵 Calling onLikeActivityComment handler...')
                            try {
                              await onLikeActivityComment(comment.id)
                              console.log('🔵 Handler completed successfully')
                            } catch (error) {
                              console.error('❌ Error in onLikeActivityComment handler:', error)
                              // Revert on error
                              setActivityCommentLikes({
                                ...activityCommentLikes,
                                [comment.id]: current
                              })
                              alert(`Failed to save like: ${error instanceof Error ? error.message : 'Unknown error'}`)
                            }
                          } else {
                            console.warn('⚠️ onLikeActivityComment handler is not provided!')
                          }
                        }}
                      >
                        <Icon
                          name="heart"
                          state={(activityCommentLikes[comment.id] || { liked: comment.userLiked }).liked ? 'active' : 'default'}
                          size={14}
                          color={(activityCommentLikes[comment.id] || { liked: comment.userLiked }).liked ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                        />
                        {(activityCommentLikes[comment.id] || { count: comment.likes }).count}
                      </button>
                    </div>
                    <div className="activity-comment-text">{comment.text}</div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="card-face card-back">
            <button className="close-btn" onClick={flipCard}>
              <Icon name="close" variant="circle" size={42} />
            </button>

            <div className="card-back-scroll-wrapper">
            <div 
              className="card-back-content"
              ref={backScrollRef}
              onWheel={handleBackWheel}
            >
              <div className="card-back-inner" ref={backInnerRef}>
              {/* Title Section */}
              <div className="back-title-section">
                <h1 className="back-title">
                  {data.media.title}
                  {data.media.season && !data.media.title.includes(`Season ${data.media.season}`) && ` - Season ${data.media.season}`}
                </h1>
                <div className="back-meta">
                  <span className="back-year">{data.media.year}</span>
                  <span className="meta-dot">•</span>
                  <span>{data.media.genres.join(', ')}</span>
                  <span className="meta-dot">•</span>
                  <span className="back-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {data.media.rating > 0 ? (
                      <>
                        <Icon name="star-gold" size={14} /> {data.media.rating.toFixed(1)}
                      </>
                    ) : (
                      <span style={{ opacity: 0.6 }}>New</span>
                    )}
                  </span>
                </div>

                {/* Badges */}
                <div className="back-badges">
                  {data.media.season && <div className="back-badge season">S{data.media.season}</div>}
                  <div className="back-badge type">{data.media.mediaType}</div>
                  {data.media.streamingPlatforms && data.media.streamingPlatforms.length > 0 ? (
                    data.media.streamingPlatforms.map((platform, idx) => (
                      <div key={idx} className="back-badge network">{platform}</div>
                    ))
                  ) : (
                    data.media.network && <div className="back-badge network">{data.media.network}</div>
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
              <p 
                ref={synopsisRef}
                className={`back-synopsis ${synopsisExpanded ? '' : 'collapsed'}`}
              >
                {data.media.synopsis}
              </p>
              {needsTruncation && (
                <span className="read-more" onClick={() => setSynopsisExpanded(!synopsisExpanded)}>
                  {synopsisExpanded ? 'Show less' : 'Read more'}
                </span>
              )}

              {/* Action Icons */}
              <div className="back-action-icons">
                {isUnreleased ? (
                  // Card 4 (Coming Soon) - Bookmark-plus instead of + icon
                  <button
                    className="back-icon-btn primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToWatchlist?.()
                    }}
                  >
                    <Icon name="bookmark-plus" size={22} color="white" />
                  </button>
                ) : (
                  // Standard - + icon opens quick action modal
                  <button
                    className="back-icon-btn primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActionOverlayVisible(true)
                    }}
                  >
                    <Icon name="plus" size={22} color="white" />
                  </button>
                )}
                <button className="back-icon-btn" onClick={handleCommentIconClick}>
                  <Icon name="comment" size={22} color="white" />
                </button>
                <button className="back-icon-btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                  <Icon name="share" size={22} color="white" />
                </button>
                {/* Remind Me - Only for unreleased */}
                {isUnreleased && (
                  <button className="back-icon-btn" onClick={onRemindMe}>
                    <Icon name="bell" size={22} color="white" />
                  </button>
                )}
              </div>

              {/* Info Grid */}
              <div className="back-info-grid">
                <div className="back-info-item">
                  <span className="back-info-label">Creator</span>
                  <span className="back-info-value">{data.media.creator}</span>
                </div>
                <div className="back-info-item">
                  <span className="back-info-label">Genre</span>
                  <span className="back-info-value">{data.media.genres.join(', ')}</span>
                </div>
              </div>

              {/* Cast */}
              <div className="back-section">
                <h3 className="back-section-title">Cast</h3>
                <div className="cast-list">
                  {data.media.cast.map((actor, idx) => (
                    <span key={idx} className="cast-member">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Friends Watching - Different for unreleased content */}
              <div className="back-section">
                <h3 className="back-section-title">
                  {isUnreleased ? 'Friends Interested' : 'Friends Watching'}
                </h3>
                <div className="friends-categories">
                  {/* Watching - Only for released content */}
                  {!isUnreleased && (
                    <div className="friends-category">
                      <div className="friends-avatars-stack">
                        {data.friendsActivity.watching.avatars.slice(0, 3).map((avatar, idx) => (
                          <img key={idx} src={avatar} alt="Friend" />
                        ))}
                      </div>
                      <div className="friends-category-text">
                        <span className="count">{data.friendsActivity.watching.count}</span> friends
                        watching
                      </div>
                    </div>
                  )}
                  
                  {/* Want to Watch - Always shown */}
                  <div className="friends-category">
                    <div className="friends-avatars-stack">
                      {data.friendsActivity.wantToWatch.avatars.slice(0, 3).map((avatar, idx) => (
                        <img key={idx} src={avatar} alt="Friend" />
                      ))}
                    </div>
                    <div className="friends-category-text">
                      <span className="count">{data.friendsActivity.wantToWatch.count}</span>{' '}
                      friends want to watch
                    </div>
                  </div>
                  
                  {/* Watched - Only for released content */}
                  {!isUnreleased && (
                    <div className="friends-category">
                      <div className="friends-avatars-stack">
                        {data.friendsActivity.watched.avatars.slice(0, 3).map((avatar, idx) => (
                          <img key={idx} src={avatar} alt="Friend" />
                        ))}
                      </div>
                      <div className="friends-category-text">
                        <span className="count">{data.friendsActivity.watched.count}</span> friends
                        watched
                      </div>
                    </div>
                  )}
                </div>

                {/* Friends Ratings - Only for released content */}
                {!isUnreleased && (
                  <div className="friends-ratings-container">
                    <div className="friends-ratings">
                      <h3 className="friends-ratings-title">Friends Ratings</h3>
                      <div className="friends-ratings-stats">
                        <div className="rating-stat">
                          <div className={`rating-icon-wrapper ${data.friendsActivity.ratings.userRating === 'meh' ? 'active-user-rating' : ''}`}>
                            <Icon
                              name="meh-face"
                              state={data.friendsActivity.ratings.userRating === 'meh' ? 'active' : 'default'}
                              size={20}
                            />
                            <div className="rating-count">{data.friendsActivity.ratings.meh}</div>
                          </div>
                          <div className="rating-label">Meh</div>
                        </div>
                        <div className="rating-stat">
                          <div className={`rating-icon-wrapper ${data.friendsActivity.ratings.userRating === 'like' ? 'active-user-rating' : ''}`}>
                            <Icon
                              name="thumbs-up"
                              state={data.friendsActivity.ratings.userRating === 'like' ? 'active' : 'default'}
                              size={20}
                            />
                            <div className="rating-count">{data.friendsActivity.ratings.like}</div>
                          </div>
                          <div className="rating-label">Like</div>
                        </div>
                        <div className="rating-stat">
                          <div className={`rating-icon-wrapper ${data.friendsActivity.ratings.userRating === 'love' ? 'active-user-rating' : ''}`}>
                            <Icon
                              name="heart"
                              state={data.friendsActivity.ratings.userRating === 'love' ? 'active' : 'default'}
                              size={20}
                            />
                            <div className="rating-count">{data.friendsActivity.ratings.love}</div>
                          </div>
                          <div className="rating-label">Love</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Show Comments */}
              <div className="back-section show-comments-section">
                <h3 className="back-section-title">Show Comments</h3>

                {/* Comment Input */}
                <div className="comment-input-container">
                  <Avatar
                    src={currentUser?.avatar || cardUser?.avatar}
                    alt="You"
                    name={currentUser?.name || cardUser?.name}
                    userId={currentUser?.id || cardUser?.id}
                    size={32}
                    className="comment-input-avatar"
                  />
                  <div className="comment-input-wrapper">
                    <textarea
                      ref={commentInputRef}
                      className="comment-input"
                      placeholder="Share your thoughts about this show..."
                      value={showCommentText}
                      onChange={(e) => {
                        if (e.target.value.length <= 280) {
                          setShowCommentText(e.target.value)
                        }
                      }}
                      maxLength={280}
                    ></textarea>
                    <div className="comment-actions">
                      <div className="comment-char-count">
                        {showCommentText.length}/280
                      </div>
                      <button 
                        className="comment-submit-btn"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSubmitShowComment().catch(err => {
                            console.error('Unhandled error in show comment submission:', err)
                          })
                        }}
                        disabled={!showCommentText.trim()}
                        style={{ opacity: showCommentText.trim() ? 1 : 0.5 }}
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                  {localShowComments.slice(0, visibleShowComments).map((comment) => {
                    const likeState = commentLikes[comment.id] || { liked: false, count: 0 }
                    const profileUrl = comment.user.username ? `/${comment.user.username}` : null
                    
                    return (
                      <div key={comment.id} className="comment-item">
                        {profileUrl ? (
                          <Link href={profileUrl} style={{ textDecoration: 'none' }}>
                            <Avatar
                              src={comment.user.avatar}
                              alt={comment.user.name}
                              name={comment.user.name}
                              userId={comment.user.id}
                              size={32}
                              className="comment-avatar"
                            />
                          </Link>
                        ) : (
                          <Avatar
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            name={comment.user.name}
                            userId={comment.user.id}
                            size={32}
                            className="comment-avatar"
                          />
                        )}
                        <div className="comment-content">
                          <div className="comment-header">
                            <div className="comment-header-left">
                              {profileUrl ? (
                                <Link href={profileUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <span className="comment-username" style={{ cursor: 'pointer' }}>{comment.user.name}</span>
                                </Link>
                              ) : (
                                <span className="comment-username">{comment.user.name}</span>
                              )}
                              <span className="comment-timestamp">{comment.timestamp}</span>
                            </div>
                            <button
                              className={`comment-like-btn ${likeState.liked ? 'liked' : ''}`}
                              onClick={(e) => handleCommentLike(comment.id, e)}
                            >
                              <Icon
                                name="heart"
                                state={likeState.liked ? 'active' : 'default'}
                                size={14}
                                color={likeState.liked ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                              />
                              {likeState.count}
                            </button>
                          </div>
                          <div className="comment-text">{comment.text}</div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Load More Button */}
                  {visibleShowComments < localShowComments.length && (
                    <button className="load-more-btn" onClick={handleLoadMoreComments}>
                      Load More Comments ({localShowComments.length - visibleShowComments} more)
                    </button>
                  )}
                </div>
              </div>
              
              </div>{/* end card-back-inner */}

            </div>
            </div>{/* end card-back-scroll-wrapper */}
          </div>

          {/* Action Overlay Modal - Shared between front and back */}
          <div
            className={`action-overlay ${actionOverlayVisible ? 'visible' : ''}`}
            onClick={() => { setActionOverlayVisible(false); setPressedIcon(null); }}
          >
            <div className="action-modal" onClick={(e) => e.stopPropagation()}>
              <div className="action-modal-grid">
                {/* Rating Icons */}
                <div 
                  className="action-modal-item" 
                  onClick={(e) => handleRating('meh', e)}
                  onTouchStart={() => setPressedIcon('meh')}
                >
                  <div className={`action-modal-icon ${userRating === 'meh' ? 'active' : ''} ${pressedIcon === 'meh' ? 'pressed' : ''}`}>
                    <Icon
                      name="meh-face"
                      state={userRating === 'meh' ? 'active' : 'default'}
                      size={20}
                      color="white"
                    />
                  </div>
                  <div className="action-modal-label">Meh</div>
                </div>

                <div 
                  className="action-modal-item" 
                  onClick={(e) => handleRating('like', e)}
                  onTouchStart={() => setPressedIcon('like')}
                >
                  <div className={`action-modal-icon ${userRating === 'like' ? 'active' : ''} ${pressedIcon === 'like' ? 'pressed' : ''}`}>
                    <Icon
                      name="thumbs-up"
                      state={userRating === 'like' ? 'active' : 'default'}
                      size={20}
                      color="white"
                    />
                  </div>
                  <div className="action-modal-label">Like</div>
                </div>

                <div 
                  className="action-modal-item" 
                  onClick={(e) => handleRating('love', e)}
                  onTouchStart={() => setPressedIcon('love')}
                >
                  <div className={`action-modal-icon ${userRating === 'love' ? 'active' : ''} ${pressedIcon === 'love' ? 'pressed' : ''}`}>
                    <Icon
                      name="heart"
                      state={userRating === 'love' ? 'active' : 'default'}
                      size={20}
                      color="white"
                    />
                  </div>
                  <div className="action-modal-label">Love</div>
                </div>

                {/* Divider */}
                <div className="action-modal-divider"></div>

                {/* Watchlist Icons */}
                <div 
                  className="action-modal-item" 
                  onClick={(e) => handleWatchlist('want', e)}
                  onTouchStart={() => setPressedIcon('want')}
                >
                  <div className={`action-modal-icon ${watchlistStatus.has('want') ? 'active' : ''} ${pressedIcon === 'want' ? 'pressed' : ''}`}>
                    <Icon
                      name="bookmark"
                      state={watchlistStatus.has('want') ? 'active' : 'default'}
                      size={20}
                      color="white"
                    />
                    {!watchlistStatus.has('want') && (
                      <div className="watchlist-badge">
                        <Icon name="plus-small" size={10} color="white" />
                      </div>
                    )}
                  </div>
                  <div className="action-modal-label">Want To</div>
                </div>

                <div 
                  className="action-modal-item" 
                  onClick={(e) => handleWatchlist('watching', e)}
                  onTouchStart={() => setPressedIcon('watching')}
                >
                  <div className={`action-modal-icon ${watchlistStatus.has('watching') ? 'active' : ''} ${pressedIcon === 'watching' ? 'pressed' : ''}`}>
                    <Icon
                      name="play"
                      state={watchlistStatus.has('watching') ? 'active' : 'default'}
                      size={20}
                      color="white"
                    />
                    {!watchlistStatus.has('watching') && (
                      <div className="watchlist-badge">
                        <Icon name="plus-small" size={10} color="white" />
                      </div>
                    )}
                  </div>
                  <div className="action-modal-label">Watching</div>
                </div>

                <div 
                  className="action-modal-item" 
                  onClick={(e) => handleWatchlist('watched', e)}
                  onTouchStart={() => setPressedIcon('watched')}
                >
                  <div className={`action-modal-icon ${watchlistStatus.has('watched') ? 'active' : ''} ${pressedIcon === 'watched' ? 'pressed' : ''}`}>
                    <Icon
                      name="check"
                      state={watchlistStatus.has('watched') ? 'active' : 'default'}
                      size={20}
                      color="white"
                    />
                    {!watchlistStatus.has('watched') && (
                      <div className="watchlist-badge">
                        <Icon name="plus-small" size={10} color="white" />
                      </div>
                    )}
                  </div>
                  <div className="action-modal-label">Watched</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Trailer Modal */}
      {trailerKey && (
        <YouTubeModal
          isOpen={showTrailerModal}
          onClose={() => setShowTrailerModal(false)}
          videoId={trailerKey}
          title={`${data.media.title} Trailer`}
        />
      )}
    </>
  )
}

// ============================================================================
// Backwards-Compatible Wrapper
// ============================================================================

/**
 * UserActivityCard - Legacy wrapper for backwards compatibility
 * New code should use FeedCard directly with variant prop
 */
export const UserActivityCard: React.FC<UserActivityCardProps> = (props) => {
  return (
    <FeedCard
      variant="a"
      backVariant="standard"
      user={props.data.user}
      timestamp={props.data.timestamp}
      badges={props.data.activityBadges}
      data={props.data}
      onLike={props.onLike}
      onComment={props.onComment}
      onShare={props.onShare}
      onAddToWatchlist={props.onAddToWatchlist}
      onUserClick={props.onUserClick}
      onMediaClick={props.onMediaClick}
      onTrack={props.onTrack}
      onRate={props.onRate}
      onSetStatus={props.onSetStatus}
      onSubmitActivityComment={props.onSubmitActivityComment}
      onSubmitShowComment={props.onSubmitShowComment}
      onLikeShowComment={props.onLikeShowComment}
      onLikeActivityComment={props.onLikeActivityComment}
      currentUser={props.currentUser}
      initialUserStatus={props.initialUserStatus}
      onFlip={props.onFlip}
    />
  )
}

export default FeedCard

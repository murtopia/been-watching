/**
 * User Activity Card - Pixel-Perfect React Conversion
 * Converted from card-1-minimal.html
 *
 * Dimensions: 398px × 645px
 * Features: Flip animation, comments, back face with full details
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ShareButton } from '@/components/sharing/ShareButton'

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
  timestamp: string
  activityType: 'loved' | 'watching' | 'want-to-watch' | 'watched'
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
    avatars: Array<{ id: string; name: string; username: string; avatar: string }>
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
    user: { name: string; avatar: string }
    text: string
    timestamp: string
    likes: number
    userLiked: boolean
  }>
  showComments: Array<{
    id: string
    user: { name: string; avatar: string }
    text: string
    timestamp: string
    likes: number
    userLiked: boolean
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

export const UserActivityCard: React.FC<UserActivityCardProps> = ({
  data,
  onLike,
  onComment,
  onShare,
  onAddToWatchlist,
  onUserClick,
  onMediaClick,
  onTrack,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)
  const [actionOverlayVisible, setActionOverlayVisible] = useState(false)
  const [localLiked, setLocalLiked] = useState(data.stats.userLiked)
  const [localLikeCount, setLocalLikeCount] = useState(data.stats.likeCount)
  const [userRating, setUserRating] = useState<'meh' | 'like' | 'love' | null>(data.friendsActivity.ratings.userRating || null)
  const [watchlistStatus, setWatchlistStatus] = useState<Set<'want' | 'watching' | 'watched'>>(new Set())
  const [commentLikes, setCommentLikes] = useState<Record<string, { liked: boolean; count: number }>>(
    data.showComments.reduce((acc, comment) => ({
      ...acc,
      [comment.id]: { liked: comment.userLiked, count: comment.likes }
    }), {})
  )
  const [visibleShowComments, setVisibleShowComments] = useState(3) // Show 3 comments initially
  const [showCommentText, setShowCommentText] = useState('') // Track show comment input
  const [activityCommentText, setActivityCommentText] = useState('') // Track activity comment input
  const [pressedIcon, setPressedIcon] = useState<string | null>(null) // Track which icon is being pressed for touch feedback

  const cardRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const backScrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const scrollStartY = useRef<number>(0)
  const velocityY = useRef<number>(0)
  const lastTouchY = useRef<number>(0)
  const lastMoveTime = useRef<number>(0)
  const momentumRAF = useRef<number | null>(null)
  // iOS-style momentum scroll for back card (3D transform workaround)
  const handleBackTouchStart = (e: React.TouchEvent) => {
    // Cancel any ongoing momentum animation
    if (momentumRAF.current) {
      cancelAnimationFrame(momentumRAF.current)
      momentumRAF.current = null
    }
    
    if (backScrollRef.current) {
      touchStartY.current = e.touches[0].clientY
      lastTouchY.current = e.touches[0].clientY
      lastMoveTime.current = Date.now()
      scrollStartY.current = backScrollRef.current.scrollTop
      velocityY.current = 0
    }
  }

  const handleBackTouchMove = (e: React.TouchEvent) => {
    if (!backScrollRef.current) return
    
    const now = Date.now()
    const touchY = e.touches[0].clientY
    const deltaYFromStart = touchStartY.current - touchY
    
    // Calculate instantaneous velocity (pixels per ms)
    const dt = now - lastMoveTime.current
    if (dt > 0) {
      const dy = lastTouchY.current - touchY
      // Smooth velocity with previous value for stability
      velocityY.current = 0.8 * velocityY.current + 0.2 * (dy / dt)
    }
    
    backScrollRef.current.scrollTop = scrollStartY.current + deltaYFromStart
    
    lastTouchY.current = touchY
    lastMoveTime.current = now
  }

  const handleBackTouchEnd = () => {
    if (!backScrollRef.current) return
    
    // Use the tracked velocity (convert from px/ms to px/frame at 60fps)
    let velocity = velocityY.current * 16.67
    
    // Only apply momentum if there's meaningful velocity
    if (Math.abs(velocity) < 0.5) return
    
    // Clamp initial velocity to reasonable bounds
    const maxVelocity = 50
    velocity = Math.max(-maxVelocity, Math.min(maxVelocity, velocity))
    
    // iOS UIScrollViewDecelerationRateNormal = 0.998 per MILLISECOND
    // At 60fps, each frame is ~16.67ms, so per-frame deceleration is:
    // 0.998^16.67 ≈ 0.967
    const decelerationPerFrame = 0.967
    const minVelocity = 0.5 // Stop when velocity is very small
    
    const animateMomentum = () => {
      if (!backScrollRef.current || Math.abs(velocity) < minVelocity) {
        momentumRAF.current = null
        return
      }
      
      backScrollRef.current.scrollTop += velocity
      velocity *= decelerationPerFrame
      
      // Stop at edges with a bit of bounce resistance
      const scrollTop = backScrollRef.current.scrollTop
      const maxScroll = backScrollRef.current.scrollHeight - backScrollRef.current.clientHeight
      
      if (scrollTop <= 0 || scrollTop >= maxScroll) {
        velocity = 0
      }
      
      momentumRAF.current = requestAnimationFrame(animateMomentum)
    }
    
    momentumRAF.current = requestAnimationFrame(animateMomentum)
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    setCommentsVisible(false)
    setCommentsExpanded(false)
    setActionOverlayVisible(false)
    setPressedIcon(null)
  }

  const handleCommentButtonClick = () => {
    setCommentsVisible(true)
  }

  const toggleComments = () => {
    setCommentsExpanded(!commentsExpanded)
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
    setUserRating(userRating === rating ? null : rating)
    setPressedIcon(null) // Clear pressed state after selection
    onTrack?.('rating', { rating, mediaId: data.media.id })
  }

  const handleWatchlist = (status: 'want' | 'watching' | 'watched', e: React.MouseEvent) => {
    e.stopPropagation()
    // Toggle off if clicking the same status, otherwise set new status (single-select)
    if (watchlistStatus.has(status)) {
      setWatchlistStatus(new Set())
    } else {
      setWatchlistStatus(new Set([status]))
    }
    setPressedIcon(null) // Clear pressed state after selection
    onTrack?.('watchlist', { status, mediaId: data.media.id })
  }

  const handleCommentLike = (commentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const current = commentLikes[commentId]
    setCommentLikes({
      ...commentLikes,
      [commentId]: {
        liked: !current.liked,
        count: current.liked ? current.count - 1 : current.count + 1
      }
    })
    onTrack?.('comment_like', { commentId, mediaId: data.media.id })
  }

  const handleCommentIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    commentInputRef.current?.focus()
  }

  const handleLoadMoreComments = () => {
    setVisibleShowComments(prev => Math.min(prev + 3, data.showComments.length))
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
          background: linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%);
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
        }

        .timestamp {
          font-size: 11px;
          font-weight: 400;
          opacity: 0.7;
        }

        /* Activity Badges */
        .activity-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
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
          font-size: 16px; /* 16px minimum prevents iOS auto-zoom on focus */
          outline: none;
          resize: none;
          min-height: 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .activity-comment-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .activity-comment-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
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
          top: 50px;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        
        /* Back of card styles - scrollable container */
        .card-back-content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0 16px 60px 16px; /* Extra bottom padding for last comment */
          overflow-y: scroll;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          touch-action: none; /* JS handles vertical scroll */
          color: white;
          box-sizing: border-box;
          /* Force new compositing layer for iOS scroll */
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
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
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          min-width: 36px;
        }

        .back-badge.trailer {
          cursor: pointer;
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
          padding-bottom: 20px; /* Ensure last comment is visible */
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
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 50px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }

        .comment-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .comment-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
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
              {/* User Header */}
              <div className="user-header">
                <img
                  src={data.user.avatar}
                  alt={data.user.name}
                  className="user-avatar"
                  onClick={() => onUserClick?.(data.user.id)}
                />
                <div className="user-info">
                  <div className="username">{data.user.name}</div>
                  <div className="timestamp">{data.timestamp}</div>
                </div>
              </div>

              {/* Activity Badges */}
              <div className="activity-badges">
                {data.activityBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="activity-badge"
                    style={{
                      background: badge.color,
                      border: `1px solid ${badge.borderColor}`,
                      color: badge.textColor,
                    }}
                  >
                    {badge.text === 'Loved' && (
                      <Icon name="heart" state="default" size={16} color={badge.textColor} />
                    )}
                    {badge.text === 'Currently Watching' && (
                      <Icon name="play" state="default" size={16} color={badge.textColor} />
                    )}
                    {badge.text}
                  </div>
                ))}
              </div>

              {/* Show Info */}
              <div className="show-title">{data.media.title}</div>
              <div className="show-meta">
                {data.media.year} <span className="meta-dot">•</span>{' '}
                {data.media.genres.join(' ')} <span className="meta-dot">•</span>{' '}
                <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>
                  <Icon name="star-gold" size={14} />
                </span>{' '}
                {data.media.rating}
              </div>

              {/* Friend Avatars */}
              <div className="friend-avatars">
                <div className="friend-avatars-stack">
                  {data.friends.avatars.slice(0, 3).map((friend) => (
                    <img key={friend.id} src={friend.avatar} alt={friend.name} />
                  ))}
                </div>
                <div className="friend-count">{data.friends.text}</div>
              </div>
            </div>

            {/* Side Actions */}
            <div className="side-actions">
              {/* Like Button */}
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

              {/* Add Button */}
              <div>
                <button className="action-btn" onClick={toggleActionOverlay}>
                  <Icon name="plus" state="default" size={24} />
                </button>
              </div>

              {/* Comment Button */}
              <div>
                <button className="action-btn" onClick={handleCommentButtonClick}>
                  <Icon name="comment" state="default" size={24} />
                </button>
                <div className="action-count">{data.stats.commentCount}</div>
              </div>
            </div>

            {/* Comments Tab */}
            <div
              className={`comments-tab ${commentsVisible ? 'visible' : ''} ${
                commentsExpanded ? 'expanded' : ''
              }`}
            >
              <div className="comments-preview" onClick={toggleComments}>
                <div className="comments-preview-content">
                  <Icon name="comment" size={16} color="white" />
                  <span>View {data.stats.commentCount} comments...</span>
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
                  <img src={data.user.avatar} alt="You" className="activity-comment-input-avatar" />
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
                    <button className="activity-comment-send-btn">
                      <Icon name="send" size={16} color="white" />
                    </button>
                  </div>
                </div>
                <div className="activity-comment-divider"></div>
                {data.comments.map((comment) => (
                  <div key={comment.id} className="activity-comment-item">
                    <div className="activity-comment-header">
                      <div className="activity-comment-header-left">
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="activity-comment-avatar"
                        />
                        <span className="activity-comment-username">
                          {comment.user.name}
                        </span>
                        <span className="activity-comment-time">{comment.timestamp}</span>
                      </div>
                      <button
                        className={`comment-like-btn ${comment.userLiked ? 'liked' : ''}`}
                      >
                        <Icon
                          name="heart"
                          state={comment.userLiked ? 'active' : 'default'}
                          size={14}
                          color={comment.userLiked ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                        />
                        {comment.likes}
                      </button>
                    </div>
                    <div className="activity-comment-text">{comment.text}</div>
                  </div>
                ))}
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
              onTouchStart={handleBackTouchStart}
              onTouchMove={handleBackTouchMove}
              onTouchEnd={handleBackTouchEnd}
            >
              {/* Title Section */}
              <div className="back-title-section">
                <h1 className="back-title">
                  {data.media.title}
                  {data.media.season && ` - Season ${data.media.season}`}
                </h1>
                <div className="back-meta">
                  <span className="back-year">{data.media.year}</span>
                  <span className="meta-dot">•</span>
                  <span>{data.media.genres.join(', ')}</span>
                  <span className="meta-dot">•</span>
                  <span className="back-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="star-gold" size={14} /> {data.media.rating}
                  </span>
                </div>

                {/* Badges */}
                <div className="back-badges">
                  {data.media.season && <div className="back-badge season">S{data.media.season}</div>}
                  <div className="back-badge type">{data.media.mediaType}</div>
                  <div className="back-badge network">{data.media.network}</div>
                  <div className="back-badge trailer">▶ Trailer</div>
                </div>
              </div>

              {/* Synopsis */}
              <p className={`back-synopsis ${synopsisExpanded ? '' : 'collapsed'}`}>
                {data.media.synopsis}
              </p>
              <span className="read-more" onClick={() => setSynopsisExpanded(!synopsisExpanded)}>
                {synopsisExpanded ? 'Show less' : 'Read more'}
              </span>

              {/* Action Icons */}
              <div className="back-action-icons">
                <button
                  className="back-icon-btn primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActionOverlayVisible(true)
                  }}
                >
                  <Icon name="plus" size={22} color="white" />
                </button>
                <button className="back-icon-btn" onClick={handleCommentIconClick}>
                  <Icon name="comment" size={22} color="white" />
                </button>
                <button className="back-icon-btn" onClick={onShare}>
                  <Icon name="share" size={22} color="white" />
                </button>
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

              {/* Friends Watching */}
              <div className="back-section">
                <h3 className="back-section-title">Friends Watching</h3>
                <div className="friends-categories">
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
                </div>

                {/* Friends Ratings */}
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
              </div>

              {/* Show Comments */}
              <div className="back-section show-comments-section">
                <h3 className="back-section-title">Show Comments</h3>

                {/* Comment Input */}
                <div className="comment-input-container">
                  <img src={data.user.avatar} alt="You" className="comment-input-avatar" />
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
                      <button className="comment-submit-btn">Post Comment</button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                  {data.showComments.slice(0, visibleShowComments).map((comment) => {
                    const likeState = commentLikes[comment.id]
                    return (
                      <div key={comment.id} className="comment-item">
                        <img src={comment.user.avatar} alt={comment.user.name} className="comment-avatar" />
                        <div className="comment-content">
                          <div className="comment-header">
                            <div className="comment-header-left">
                              <span className="comment-username">{comment.user.name}</span>
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
                  {visibleShowComments < data.showComments.length && (
                    <button className="load-more-btn" onClick={handleLoadMoreComments}>
                      Load More Comments ({data.showComments.length - visibleShowComments} more)
                    </button>
                  )}
                </div>
              </div>

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
    </>
  )
}

export default UserActivityCard

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

  const cardRef = useRef<HTMLDivElement>(null)

  const flipCard = () => {
    setIsFlipped(!isFlipped)
    setCommentsVisible(false)
    setCommentsExpanded(false)
    setActionOverlayVisible(false)
  }

  const toggleComments = () => {
    if (!commentsVisible) {
      setCommentsVisible(true)
      setTimeout(() => setCommentsExpanded(true), 50)
    } else {
      setCommentsExpanded(false)
      setTimeout(() => setCommentsVisible(false), 300)
    }
  }

  const handleLike = () => {
    setLocalLiked(!localLiked)
    setLocalLikeCount(localLiked ? localLikeCount - 1 : localLikeCount + 1)
    onLike?.()
  }

  const toggleActionOverlay = () => {
    setActionOverlayVisible(!actionOverlayVisible)
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
          touch-action: none;
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
          gap: 6px;
          margin-bottom: 10px;
        }

        .activity-badge {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
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
          width: 24px;
          height: 24px;
          stroke: white;
          fill: none;
          stroke-width: 1.5;
        }

        .action-btn.liked svg {
          fill: #FF3B5C;
          stroke: #FF3B5C;
        }

        .action-count {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
          color: white;
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
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
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .comments-preview {
          padding: 16px 20px;
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

        .comments-tab.expanded .comments-preview {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comments-tab.expanded .comments-full {
          display: block;
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
          gap: 10px;
          margin-bottom: 6px;
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
          margin-left: auto;
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

        .activity-comment-input-wrapper {
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 12px;
          align-items: center;
          flex-shrink: 0;
        }

        .activity-comment-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 10px 16px;
          color: white;
          font-size: 16px;
          outline: none;
        }

        .activity-comment-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .send-btn {
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
        }

        .send-btn svg {
          width: 16px;
          height: 16px;
          fill: white;
        }

        /* Back of card styles */
        .card-back-content {
          padding: 20px 16px;
          padding-top: 50px;
          padding-bottom: 20px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          overflow-y: scroll;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain;
          touch-action: pan-y;
          color: white;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
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
          cursor: pointer;
          text-align: center;
          min-width: 36px;
        }

        .back-synopsis {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .back-synopsis.collapsed {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .read-more {
          color: #FF006E;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 16px;
          display: block;
          text-align: right;
        }

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

        .friends-ratings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .rating-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .rating-stat.active-user-rating {
          background: rgba(255, 59, 92, 0.15);
          border-color: #FF3B5C;
        }

        .rating-stat svg {
          width: 28px;
          height: 28px;
          stroke: rgba(255, 255, 255, 0.6);
          fill: none;
          stroke-width: 1.5;
        }

        .rating-stat.active-user-rating svg {
          stroke: #FF3B5C;
          fill: #FF3B5C;
        }

        .rating-stat-count {
          font-size: 14px;
          font-weight: 600;
        }

        .similar-shows {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .similar-show {
          flex-shrink: 0;
          width: 100px;
          height: 150px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: flex-end;
          padding: 8px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .similar-show::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        }

        .similar-show-title {
          font-size: 11px;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        .show-comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
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
          gap: 8px;
          margin-bottom: 4px;
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
          margin-bottom: 8px;
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
                      <Icon name="heart" state="filled" size={14} color={badge.textColor} />
                    )}
                    {badge.text === 'Currently Watching' && (
                      <Icon name="play" state="filled" size={14} color={badge.textColor} />
                    )}
                    {badge.text}
                  </div>
                ))}
              </div>

              {/* Show Info */}
              <div className="show-title">{data.media.title}</div>
              <div className="show-meta">
                {data.media.year} <span className="meta-dot">•</span>{' '}
                {data.media.genres.join(', ')} <span className="meta-dot">•</span> ⭐{' '}
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
                    name="heart"
                    state={localLiked ? 'filled' : 'default'}
                    size={24}
                    color={localLiked ? '#FF3B5C' : 'white'}
                  />
                  <div className="action-count">{localLikeCount}</div>
                </button>
              </div>

              {/* Add Button */}
              <div>
                <button className="action-btn" onClick={toggleActionOverlay}>
                  <Icon name="plus" size={24} color="white" />
                </button>
              </div>

              {/* Comment Button */}
              <div>
                <button className="action-btn" onClick={toggleComments}>
                  <Icon name="comment" size={24} color="white" />
                  <div className="action-count">{data.stats.commentCount}</div>
                </button>
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
                  💬 View {data.stats.commentCount} comments...
                </div>
                <button className="comments-close-btn" onClick={(e) => {
                  e.stopPropagation()
                  toggleComments()
                }}>
                  <Icon name="close" size={14} color="white" />
                </button>
              </div>

              <div className="comments-full">
                {data.comments.map((comment) => (
                  <div key={comment.id} className="activity-comment-item">
                    <div className="activity-comment-header">
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
                    <div className="activity-comment-text">{comment.text}</div>
                    <div className="comment-actions">
                      <button
                        className={`comment-like-btn ${comment.userLiked ? 'liked' : ''}`}
                      >
                        <Icon
                          name="heart"
                          state={comment.userLiked ? 'filled' : 'default'}
                          size={14}
                          color={comment.userLiked ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                        />
                        {comment.likes}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="activity-comment-input-wrapper">
                  <input
                    type="text"
                    className="activity-comment-input"
                    placeholder="Add a comment..."
                  />
                  <button className="send-btn">
                    <Icon name="send" size={16} color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="card-face card-back">
            <button className="close-btn" onClick={flipCard}>
              <Icon name="close" size={16} color="white" />
            </button>

            <div className="card-back-content">
              {/* Title */}
              <h1 className="back-title">{data.media.title}</h1>
              <div className="back-meta">
                <span>{data.media.year}</span>
                <span className="meta-dot">•</span>
                <span>{data.media.genres.join(', ')}</span>
                <span className="meta-dot">•</span>
                <span>⭐ {data.media.rating}</span>
              </div>

              {/* Badges */}
              <div className="back-badges">
                {data.media.season && <div className="back-badge">S{data.media.season}</div>}
                <div className="back-badge">{data.media.mediaType}</div>
                <div className="back-badge">{data.media.network}</div>
                <div className="back-badge">▶ Trailer</div>
              </div>

              {/* Synopsis */}
              <p className={`back-synopsis ${synopsisExpanded ? '' : 'collapsed'}`}>
                {data.media.synopsis}
              </p>
              {!synopsisExpanded && (
                <span className="read-more" onClick={() => setSynopsisExpanded(true)}>
                  Read more
                </span>
              )}

              {/* Action Icons */}
              <div className="back-action-icons">
                <button className="back-icon-btn">
                  <Icon name="plus" size={22} color="white" />
                </button>
                <button className="back-icon-btn">
                  <Icon name="comment" size={22} color="white" />
                </button>
                <button className="back-icon-btn">
                  <Icon name="share" size={20} color="white" />
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
                <div className="back-section-title">Cast</div>
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
                <div className="back-section-title">Friends Watching</div>
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
              </div>

              {/* Friends Ratings */}
              <div className="back-section">
                <div className="back-section-title">Friends Ratings</div>
                <div className="friends-ratings-grid">
                  <div className={`rating-stat ${data.friendsActivity.ratings.userRating === 'meh' ? 'active-user-rating' : ''}`}>
                    <Icon
                      name="meh-face"
                      state={data.friendsActivity.ratings.userRating === 'meh' ? 'filled' : 'default'}
                      size={28}
                      color={data.friendsActivity.ratings.userRating === 'meh' ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                    />
                    <div className="rating-stat-count">{data.friendsActivity.ratings.meh}</div>
                  </div>
                  <div className={`rating-stat ${data.friendsActivity.ratings.userRating === 'like' ? 'active-user-rating' : ''}`}>
                    <Icon
                      name="thumbs-up"
                      state={data.friendsActivity.ratings.userRating === 'like' ? 'filled' : 'default'}
                      size={28}
                      color={data.friendsActivity.ratings.userRating === 'like' ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                    />
                    <div className="rating-stat-count">{data.friendsActivity.ratings.like}</div>
                  </div>
                  <div className={`rating-stat ${data.friendsActivity.ratings.userRating === 'love' ? 'active-user-rating' : ''}`}>
                    <Icon
                      name="heart"
                      state={data.friendsActivity.ratings.userRating === 'love' ? 'filled' : 'default'}
                      size={28}
                      color={data.friendsActivity.ratings.userRating === 'love' ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                    />
                    <div className="rating-stat-count">{data.friendsActivity.ratings.love}</div>
                  </div>
                </div>
              </div>

              {/* Show Comments */}
              <div className="back-section">
                <div className="back-section-title">Show Comments</div>
                <div className="show-comments-list">
                  {data.showComments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <img src={comment.user.avatar} alt={comment.user.name} className="comment-avatar" />
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">{comment.user.name}</span>
                          <span className="comment-timestamp">{comment.timestamp}</span>
                        </div>
                        <div className="comment-text">{comment.text}</div>
                        <div className="comment-actions">
                          <button className={`comment-like-btn ${comment.userLiked ? 'liked' : ''}`}>
                            <Icon
                              name="heart"
                              state={comment.userLiked ? 'filled' : 'default'}
                              size={14}
                              color={comment.userLiked ? '#FF3B5C' : 'rgba(255, 255, 255, 0.6)'}
                            />
                            {comment.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="load-more-btn">Load More Comments</button>
                </div>
              </div>

              {/* Similar Shows */}
              <div className="back-section">
                <div className="back-section-title">Similar Shows</div>
                <div className="similar-shows">
                  {data.similarShows.map((show) => (
                    <div
                      key={show.id}
                      className="similar-show"
                      style={{ background: show.gradient }}
                    >
                      <div className="similar-show-title">{show.title}</div>
                    </div>
                  ))}
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

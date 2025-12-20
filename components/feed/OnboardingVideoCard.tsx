'use client'

import React, { useState, useRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useThemeColors } from '@/hooks/useThemeColors'

// Video variants - add more paths as needed
const ONBOARDING_VIDEOS = [
  '/videos/onboarding-v1.mp4',
  // '/videos/onboarding-v2.mp4',
]

interface OnboardingVideoCardProps {
  /** Called when user dismisses the card */
  onDismiss?: () => void
  /** If true, hides the dismiss button (for re-watching from settings) */
  hideDismiss?: boolean
  /** Optional: force a specific video (for testing) */
  videoSrc?: string
}

export default function OnboardingVideoCard({ 
  onDismiss, 
  hideDismiss = false,
  videoSrc: forcedVideoSrc 
}: OnboardingVideoCardProps) {
  const colors = useThemeColors()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(42)
  const [commentCount] = useState(7)
  const [videoSrc] = useState(() => 
    forcedVideoSrc || ONBOARDING_VIDEOS[Math.floor(Math.random() * ONBOARDING_VIDEOS.length)]
  )

  const handlePlay = () => {
    if (videoRef.current) {
      // Unmute when user explicitly clicks play
      videoRef.current.muted = false
      videoRef.current.play()
      setIsPlaying(true)
      setHasStarted(true)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss?.()
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation()
    // For demo purposes - doesn't do anything functional
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    // For demo purposes - doesn't do anything functional
  }

  return (
    <>
      <style jsx>{`
        .onboarding-card {
          width: 398px;
          height: 645px;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          border: 0.5px solid ${colors.goldAccent};
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .video-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Gradient overlay at bottom for controls visibility */
        .bottom-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Welcome badge at top left */
        .welcome-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255, 193, 37, 0.25);
          border: 1px solid rgba(255, 193, 37, 0.5);
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 2;
        }

        /* Three dots menu button (top right) */
        .menu-btn {
          position: absolute;
          top: 16px;
          right: 12px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: ${colors.goldGlassBg};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: ${colors.goldBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
        }

        /* Initial play button (shows before video starts) - gold glassmorphism */
        .initial-play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: ${colors.goldGlassBg};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: ${colors.goldBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(255, 193, 37, 0.3);
          z-index: 3;
        }

        .initial-play-btn:hover {
          transform: translate(-50%, -50%) scale(1.05);
          box-shadow: 0 6px 30px rgba(255, 193, 37, 0.4);
          background: rgba(255, 193, 37, 0.25);
        }

        .initial-play-btn:active {
          transform: translate(-50%, -50%) scale(0.95);
        }

        /* Play/pause indicator (shows when paused after starting) - gold glassmorphism */
        .play-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${colors.goldGlassBg};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: ${colors.goldBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .play-indicator.visible {
          opacity: 1;
        }

        /* Tap to play area */
        .tap-area {
          position: absolute;
          inset: 60px 80px 200px 0;
          cursor: pointer;
          z-index: 1;
        }

        /* Right side action buttons (stacked vertically) */
        .action-buttons-right {
          position: absolute;
          right: 12px;
          bottom: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 2;
        }

        .action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .action-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: ${colors.goldGlassBg};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: ${colors.goldBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:active {
          transform: scale(0.9);
        }

        .action-count {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
          color: white;
        }

        /* Bottom content area (left side) */
        .bottom-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 80px;
          padding: 16px 20px 20px;
          z-index: 2;
        }

        .title-section {
          margin-bottom: 0;
        }

        .card-title {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin: 0 0 4px 0;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }

        .card-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        /* Dismiss section (below action buttons) */
        .dismiss-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 8px;
        }

        .dismiss-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: ${colors.goldGlassBg};
          border: ${colors.goldBorder};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dismiss-btn:hover {
          background: rgba(255, 193, 37, 0.25);
        }

        .dismiss-btn:active {
          transform: scale(0.9);
        }

        .dismiss-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
      `}</style>

      <div className="onboarding-card">
        <div className="video-container">
          <video
            ref={videoRef}
            className="video-element"
            src={videoSrc}
            muted
            playsInline
            loop
            poster=""
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Initial play button - shows before video starts */}
          {!hasStarted && (
            <button className="initial-play-btn" onClick={handlePlay}>
              <Icon name="play-c-default" size={64} color={colors.goldAccent} />
            </button>
          )}

          {/* Tap area for play/pause (only after video has started) */}
          {hasStarted && <div className="tap-area" onClick={togglePlayPause} />}

          {/* Play indicator when paused (only after video has started) */}
          {hasStarted && (
            <div className={`play-indicator ${!isPlaying ? 'visible' : ''}`}>
              <Icon name="play-c-default" size={48} color={colors.goldAccent} />
            </div>
          )}

          {/* Welcome badge (top left) */}
          <div className="welcome-badge">
            <Icon name="sparkles" size={14} color={colors.goldAccent} />
            Welcome to Been Watching
          </div>

          {/* Three dots menu button (top right) - for visual reference */}
          <button className="menu-btn" onClick={(e) => e.stopPropagation()}>
            <Icon name="menu-dots" size={20} color="white" />
          </button>

          {/* Bottom gradient */}
          <div className="bottom-gradient" />

          {/* Right side action buttons (stacked vertically) */}
          <div className="action-buttons-right">
            {/* Heart */}
            <div className="action-item">
              <button className="action-btn" onClick={handleLike}>
                <Icon
                  name="heart-nav"
                  state={isLiked ? 'active' : 'default'}
                  size={24}
                />
              </button>
              <span className="action-count">{likeCount}</span>
            </div>

            {/* Plus */}
            <div className="action-item">
              <button className="action-btn" onClick={handlePlus}>
                <Icon name="plus" state="default" size={24} />
              </button>
            </div>

            {/* Comment */}
            <div className="action-item">
              <button className="action-btn" onClick={handleComment}>
                <Icon name="comment" state="default" size={24} />
              </button>
              <span className="action-count">{commentCount}</span>
            </div>

            {/* Dismiss button with label */}
            {!hideDismiss && onDismiss && (
              <div className="dismiss-section">
                <button className="dismiss-btn" onClick={handleDismiss} title="Dismiss">
                  <Icon name="close" state="default" size={20} />
                </button>
                <span className="dismiss-label">Dismiss</span>
              </div>
            )}
          </div>

          {/* Bottom content (left side) */}
          <div className="bottom-content">
            <div className="title-section">
              <h2 className="card-title">Getting Started</h2>
              <p className="card-subtitle">Learn how to use Been Watching</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


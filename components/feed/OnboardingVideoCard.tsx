'use client'

import React, { useState, useRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Volume2, VolumeX } from 'lucide-react'

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
  const [isMuted, setIsMuted] = useState(true)
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
      setIsMuted(false)
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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
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
          height: 150px;
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
          top: 20px;
          right: 12px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          cursor: pointer;
          z-index: 2;
          opacity: 0.8;
        }

        .menu-btn:hover {
          opacity: 1;
        }

        /* Initial play button (shows before video starts) - using glassmorphism */
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

        /* Play/pause indicator (shows when paused after starting) */
        .play-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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
          inset: 60px 60px 140px 60px;
          cursor: pointer;
          z-index: 1;
        }

        /* Bottom content area */
        .bottom-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 20px 20px;
          z-index: 2;
        }

        .title-section {
          margin-bottom: 16px;
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

        /* Action buttons row */
        .actions-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .action-buttons-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
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

        /* Dismiss section (right side) */
        .dismiss-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dismiss-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(80, 80, 80, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dismiss-btn:hover {
          background: rgba(100, 100, 100, 0.6);
        }

        .dismiss-btn:active {
          transform: scale(0.9);
        }

        .dismiss-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Mute button (floating, top area after video starts) */
        .mute-btn {
          position: absolute;
          top: 70px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .mute-btn:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .mute-btn:active {
          transform: scale(0.9);
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
              <Icon name="play-c-default" size={64} />
            </button>
          )}

          {/* Tap area for play/pause (only after video has started) */}
          {hasStarted && <div className="tap-area" onClick={togglePlayPause} />}

          {/* Play indicator when paused (only after video has started) */}
          {hasStarted && (
            <div className={`play-indicator ${!isPlaying ? 'visible' : ''}`}>
              <Icon name="play" size={40} color="white" />
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

          {/* Mute/unmute button (shows after video starts) */}
          {hasStarted && (
            <button className="mute-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeX size={18} color="white" /> : <Volume2 size={18} color="white" />}
            </button>
          )}

          {/* Bottom gradient */}
          <div className="bottom-gradient" />

          {/* Bottom content */}
          <div className="bottom-content">
            <div className="title-section">
              <h2 className="card-title">Getting Started</h2>
              <p className="card-subtitle">Learn how to use Been Watching</p>
            </div>

            {/* Action buttons row */}
            <div className="actions-row">
              {/* Left side: Heart, Plus, Comment */}
              <div className="action-buttons-left">
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
              </div>

              {/* Right side: Dismiss button with label */}
              {!hideDismiss && onDismiss && (
                <div className="dismiss-section">
                  <button className="dismiss-btn" onClick={handleDismiss} title="Dismiss">
                    <Icon name="close" state="default" size={20} />
                  </button>
                  <span className="dismiss-label">Dismiss</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


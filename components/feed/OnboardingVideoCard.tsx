'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  const [isPlaying, setIsPlaying] = useState(true)
  const [videoSrc] = useState(() => 
    forcedVideoSrc || ONBOARDING_VIDEOS[Math.floor(Math.random() * ONBOARDING_VIDEOS.length)]
  )

  // Auto-play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, user needs to interact
        setIsPlaying(false)
      })
    }
  }, [])

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
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

        .video-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* Gradient overlay at bottom for controls visibility */
        .bottom-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Welcome badge at top */
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
        }

        /* Mute/unmute button */
        .mute-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 193, 37, 0.15);
          border: 1px solid rgba(255, 193, 37, 0.3);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mute-btn:hover {
          background: rgba(255, 193, 37, 0.25);
          transform: scale(1.05);
        }

        .mute-btn:active {
          transform: scale(0.95);
        }

        /* Play/pause indicator (shows when paused) */
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

        /* Bottom content area */
        .bottom-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          z-index: 2;
        }

        .title-section {
          margin-bottom: 12px;
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

        /* Dismiss button */
        .dismiss-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 3;
        }

        .dismiss-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .dismiss-btn:active {
          transform: scale(0.95);
        }

        /* Tap to play area */
        .tap-area {
          position: absolute;
          inset: 60px 60px 100px 60px;
          cursor: pointer;
          z-index: 1;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="onboarding-card">
        <div className="video-container">
          <video
            ref={videoRef}
            className="video-element"
            src={videoSrc}
            autoPlay
            muted
            playsInline
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Tap area for play/pause */}
          <div className="tap-area" onClick={togglePlayPause} />

          {/* Play indicator when paused */}
          <div className={`play-indicator ${!isPlaying ? 'visible' : ''}`}>
            <Icon name="play" size={40} color="white" />
          </div>

          {/* Welcome badge */}
          <div className="welcome-badge">
            <Icon name="sparkles" size={14} color={colors.goldAccent} />
            Welcome to Been Watching
          </div>

          {/* Mute/unmute button */}
          <button className="mute-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? (
              <VolumeX size={20} color="white" />
            ) : (
              <Volume2 size={20} color="white" />
            )}
          </button>

          {/* Bottom gradient */}
          <div className="bottom-gradient" />

          {/* Bottom content */}
          <div className="bottom-content">
            <div className="title-section">
              <h2 className="card-title">Getting Started</h2>
              <p className="card-subtitle">Learn how to use Been Watching</p>
            </div>
          </div>

          {/* Dismiss button */}
          {!hideDismiss && onDismiss && (
            <button className="dismiss-btn" onClick={handleDismiss} title="Dismiss">
              <Icon name="close" size={20} color="white" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}


'use client'

import { useState } from 'react'
import Icon from '@/components/ui/Icon'
import { ShareModal } from './ShareModal'
import { trackEvent } from '@/utils/analytics'
import { trackShareEvent, createShareUrl } from '@/utils/share-tracking'

export type ShareContentType = 'show' | 'profile' | 'list' | 'top3' | 'invite' | 'achievement'

export interface ShareData {
  // Common fields
  contentType: ShareContentType
  contentId: string
  title: string
  url?: string

  // Show/Movie specific
  posterUrl?: string
  year?: number
  genres?: string[]
  rating?: number | string // Number for stars, string for 'love'/'like'/'meh'
  comment?: string

  // User info (for attribution)
  username?: string
  avatarUrl?: string
  userId?: string

  // List specific
  items?: Array<{
    id: string
    title: string
    posterUrl: string
  }>

  // Profile specific
  displayName?: string
  bio?: string
  showCount?: number
  followerCount?: number
  topShows?: Array<{
    id: string
    title: string
    posterUrl: string
  }>
}

interface ShareButtonProps {
  data: ShareData
  variant?: 'icon' | 'button' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  onShareComplete?: (method: string) => void
}

/**
 * ShareButton Component
 *
 * Intelligently decides between native share sheet (simple content)
 * and custom modal (rich content) based on content type
 */
export function ShareButton({
  data,
  variant = 'icon',
  size = 'md',
  className = '',
  disabled = false,
  onShareComplete
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Determine if content needs custom modal (rich content) or can use native share (simple)
  const isSimpleShare = data.contentType === 'invite' ||
    (data.contentType === 'profile' && !data.topShows) // Simple profile link

  const handleClick = async () => {
    if (disabled || isSharing) return

    // Track share button click
    trackEvent('share_button_clicked', {
      content_type: data.contentType,
      content_id: data.contentId
    })

    if (isSimpleShare) {
      // Use native share sheet for simple content
      await handleNativeShare()
    } else {
      // Open custom modal for rich content
      setShowModal(true)
    }
  }

  const handleNativeShare = async () => {
    setIsSharing(true)

    const shareUrl = data.url || generateShareUrl(data)
    const shareText = generateShareText(data)

    try {
      if (navigator.share) {
        // Use Web Share API
        await navigator.share({
          title: data.title,
          text: shareText,
          url: shareUrl
        })

        // Track successful share
        trackEvent('content_shared', {
          content_type: data.contentType,
          content_id: data.contentId,
          share_method: 'native_sheet',
          share_destination: 'external'
        })

        onShareComplete?.('native_sheet')
      } else {
        // Fallback to clipboard
        const fullMessage = `${shareText}\n${shareUrl}`
        await navigator.clipboard.writeText(fullMessage)

        // Show toast notification
        showCopySuccessToast()

        // Track copy
        trackEvent('content_shared', {
          content_type: data.contentType,
          content_id: data.contentId,
          share_method: 'copy_link',
          share_destination: 'external'
        })

        onShareComplete?.('copy_link')
      }
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled or failed:', err)
    } finally {
      setIsSharing(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
  }

  const handleShareComplete = (method: string) => {
    onShareComplete?.(method)
    // Keep modal open unless it's a redirect (Twitter, etc.)
    if (method === 'twitter' || method === 'native_sheet') {
      setShowModal(false)
    }
  }

  // Render button based on variant
  const renderButton = () => {
    const sizeMap = {
      sm: 16,
      md: 20,
      lg: 24
    }

    const buttonSizeMap = {
      sm: 'padding: 6px 12px; font-size: 12px;',
      md: 'padding: 8px 16px; font-size: 14px;',
      lg: 'padding: 10px 20px; font-size: 16px;'
    }

    switch (variant) {
      case 'icon':
        return (
          <button
            className={`share-icon-btn ${className}`}
            onClick={handleClick}
            disabled={disabled || isSharing}
            aria-label="Share"
          >
            <Icon
              name="share"
              variant="circle"
              size={sizeMap[size]}
              color="white"
              state={isSharing ? 'active' : 'default'}
            />
          </button>
        )

      case 'button':
        return (
          <button
            className={`share-button ${className}`}
            onClick={handleClick}
            disabled={disabled || isSharing}
            style={{ ...parseStyleString(buttonSizeMap[size]) }}
          >
            <Icon name="share" variant="circle" size={16} color="white" />
            <span>{isSharing ? 'Sharing...' : 'Share'}</span>
          </button>
        )

      case 'text':
        return (
          <button
            className={`share-text-btn ${className}`}
            onClick={handleClick}
            disabled={disabled || isSharing}
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderButton()}

      {/* Custom share modal for rich content */}
      {!isSimpleShare && showModal && (
        <ShareModal
          isOpen={showModal}
          onClose={handleModalClose}
          data={data}
          onShareComplete={handleShareComplete}
        />
      )}

      <style jsx>{`
        .share-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .share-icon-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .share-icon-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .share-icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .share-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .share-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .share-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .share-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .share-text-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 4px 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          text-decoration: underline;
        }

        .share-text-btn:hover:not(:disabled) {
          color: white;
        }

        .share-text-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

// Helper functions
function generateShareUrl(data: ShareData): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://beenwatching.com'

  // Add UTM parameters for tracking
  const utm = new URLSearchParams({
    utm_source: 'share',
    utm_medium: 'native',
    utm_campaign: 'organic_share'
  })

  // Add shared_by parameter if we have username
  if (data.username) {
    utm.set('shared_by', data.username)
  }

  switch (data.contentType) {
    case 'show':
      return `${baseUrl}/show/${data.contentId}?${utm.toString()}`
    case 'profile':
      return `${baseUrl}/${data.username}?${utm.toString()}`
    case 'list':
      return `${baseUrl}/${data.username}/${data.contentId}?${utm.toString()}`
    case 'top3':
      return `${baseUrl}/${data.username}/top-shows?${utm.toString()}`
    case 'achievement':
      return `${baseUrl}/achievement/${data.contentId}?user=${data.username}&${utm.toString()}`
    default:
      return baseUrl
  }
}

function generateShareText(data: ShareData): string {
  switch (data.contentType) {
    case 'show':
      const reaction = data.rating === 'love' ? 'loved' :
                      data.rating === 'like' ? 'liked' :
                      data.rating === 'meh' ? 'watched' : 'watching'
      return `Just ${reaction} ${data.title} on Been Watching!${data.comment ? ` "${data.comment}"` : ''}`

    case 'profile':
      return `Check out my Been Watching profile to see what I've been watching!`

    case 'list':
      return `Check out my ${data.title} on Been Watching`

    case 'top3':
      return `These are my top 3 shows right now on Been Watching`

    case 'invite':
      return `I just got an invite code to Been Watching, a new social show and movie discovery platform that I think you'd like! Come join me see what I've been watching here:`

    case 'achievement':
      return `Just unlocked "${data.title}" on Been Watching!`

    default:
      return `Check this out on Been Watching`
  }
}

function parseStyleString(styleStr: string): React.CSSProperties {
  const styles: Record<string, string> = {}
  styleStr.split(';').forEach(style => {
    const [key, value] = style.split(':').map(s => s.trim())
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      styles[camelKey] = value
    }
  })
  return styles
}

function showCopySuccessToast() {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = 'share-copy-toast'
  toast.textContent = 'Link copied to clipboard!'
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(74, 222, 128, 0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    animation: slideUp 0.3s ease-out;
  `

  document.body.appendChild(toast)

  // Remove after 2 seconds
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 2000)
}

// Add global animation styles
if (typeof document !== 'undefined' && !document.querySelector('#share-animations')) {
  const style = document.createElement('style')
  style.id = 'share-animations'
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translate(-50%, 100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }

    @keyframes slideDown {
      from {
        transform: translate(-50%, 0);
        opacity: 1;
      }
      to {
        transform: translate(-50%, 100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}
'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/ui/Icon'
import { ShareData } from './ShareButton'
import { trackEvent } from '@/utils/analytics'
import {
  generateInstagramStoryCard,
  generateInstagramPostCard,
  generateTwitterCard,
  downloadImage
} from '@/lib/share-card-generator'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  data: ShareData
  onShareComplete?: (method: string) => void
}

/**
 * ShareModal Component
 *
 * Mobile-first bottom sheet modal for rich content sharing
 * Provides platform-specific templates and in-app sharing
 */
export function ShareModal({
  isOpen,
  onClose,
  data,
  onShareComplete
}: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructionType, setInstructionType] = useState<'story' | 'post' | null>(null)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Handle touch gestures for swipe down to dismiss
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    let startY = 0
    let currentY = 0
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      // Only start drag from the drag handle area
      const target = e.target as HTMLElement
      if (target.closest('.modal-drag-handle')) {
        startY = e.touches[0].clientY
        isDragging = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      currentY = e.touches[0].clientY
      const deltaY = currentY - startY

      // Only allow downward dragging
      if (deltaY > 0 && modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY}px)`
      }
    }

    const handleTouchEnd = () => {
      if (!isDragging) return
      isDragging = false

      const deltaY = currentY - startY
      if (deltaY > 100) {
        // Swipe down threshold met, close modal
        onClose()
      } else if (modalRef.current) {
        // Reset position
        modalRef.current.style.transform = ''
      }
    }

    const modal = modalRef.current
    modal.addEventListener('touchstart', handleTouchStart)
    modal.addEventListener('touchmove', handleTouchMove)
    modal.addEventListener('touchend', handleTouchEnd)

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart)
      modal.removeEventListener('touchmove', handleTouchMove)
      modal.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleInstagramStory = async () => {
    setIsGenerating(true)

    try {
      const blob = await generateInstagramStoryCard({
        posterUrl: data.posterUrl || '',
        title: data.title,
        year: data.year,
        genres: data.genres,
        rating: typeof data.rating === 'number' ? data.rating : undefined,
        comment: data.comment,
        username: data.username || 'user',
        avatarUrl: data.avatarUrl,
        profileUrl: generateShareUrl()
      })

      // Download the image
      const filename = `beenwatching-${data.title.toLowerCase().replace(/\s+/g, '-')}-story.png`
      downloadImage(blob, filename)

      // Show instructions
      setInstructionType('story')
      setShowInstructions(true)

      // Track event
      trackEvent('content_shared', {
        content_type: data.contentType,
        content_id: data.contentId,
        share_method: 'instagram_story',
        share_destination: 'external'
      })

      onShareComplete?.('instagram_story')
    } catch (error) {
      console.error('Failed to generate Instagram story:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInstagramPost = async () => {
    setIsGenerating(true)

    try {
      const blob = await generateInstagramPostCard({
        posterUrl: data.posterUrl || '',
        title: data.title,
        year: data.year,
        genres: data.genres,
        rating: typeof data.rating === 'number' ? data.rating : undefined,
        comment: data.comment,
        username: data.username || 'user',
        avatarUrl: data.avatarUrl,
        profileUrl: generateShareUrl()
      })

      // Download the image
      const filename = `beenwatching-${data.title.toLowerCase().replace(/\s+/g, '-')}-post.png`
      downloadImage(blob, filename)

      // Show instructions
      setInstructionType('post')
      setShowInstructions(true)

      // Track event
      trackEvent('content_shared', {
        content_type: data.contentType,
        content_id: data.contentId,
        share_method: 'instagram_post',
        share_destination: 'external'
      })

      onShareComplete?.('instagram_post')
    } catch (error) {
      console.error('Failed to generate Instagram post:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTwitterShare = () => {
    const shareUrl = generateShareUrl()
    const shareText = generateShareText()

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')

    // Track event
    trackEvent('content_shared', {
      content_type: data.contentType,
      content_id: data.contentId,
      share_method: 'twitter',
      share_destination: 'external'
    })

    onShareComplete?.('twitter')
  }

  const handleNativeShare = async () => {
    const shareUrl = generateShareUrl()
    const shareText = generateShareText()

    try {
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: shareText,
          url: shareUrl
        })

        trackEvent('content_shared', {
          content_type: data.contentType,
          content_id: data.contentId,
          share_method: 'native_sheet',
          share_destination: 'external'
        })

        onShareComplete?.('native_sheet')
      } else {
        // Fallback to copy
        handleCopyLink()
      }
    } catch (err) {
      console.log('Share cancelled:', err)
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = generateShareUrl()
    const shareText = generateShareText()
    const fullMessage = `${shareText}\n${shareUrl}`

    try {
      await navigator.clipboard.writeText(fullMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      trackEvent('content_shared', {
        content_type: data.contentType,
        content_id: data.contentId,
        share_method: 'copy_link',
        share_destination: 'external'
      })

      onShareComplete?.('copy_link')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateShareUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://beenwatching.com'
    const utm = new URLSearchParams({
      utm_source: 'share',
      utm_medium: 'custom_modal',
      utm_campaign: 'organic_share'
    })

    if (data.username) {
      utm.set('shared_by', data.username)
    }

    switch (data.contentType) {
      case 'show':
        return `${baseUrl}/show/${data.contentId}?${utm.toString()}`
      case 'profile':
        return `${baseUrl}/${data.username}?${utm.toString()}`
      default:
        return baseUrl
    }
  }

  const generateShareText = (): string => {
    switch (data.contentType) {
      case 'show':
        const reaction = data.rating === 'love' ? 'loved' :
                        data.rating === 'like' ? 'liked' :
                        data.rating === 'meh' ? 'watched' : 'watching'
        return `Just ${reaction} ${data.title} on Been Watching!${data.comment ? ` "${data.comment}"` : ''}`
      default:
        return `Check out ${data.title} on Been Watching`
    }
  }

  // Check if we're on desktop
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="share-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`share-modal ${isDesktop ? 'desktop' : 'mobile'}`}
      >
        {/* Drag handle (mobile only) */}
        {!isDesktop && (
          <div className="modal-drag-handle">
            <div className="drag-handle-bar" />
          </div>
        )}

        {/* Close button (desktop only) */}
        {isDesktop && (
          <button className="modal-close-btn" onClick={onClose}>
            <Icon name="close" size={24} color="white" />
          </button>
        )}

        {/* Header */}
        <div className="modal-header">
          <h2>Share "{data.title}"</h2>
        </div>

        {/* Preview */}
        <div className="preview-section">
          <div className="section-label">PREVIEW</div>
          <div className="preview-card">
            {data.posterUrl && (
              <img
                src={data.posterUrl}
                alt={data.title}
                className="preview-poster"
              />
            )}
            <div className="preview-content">
              <div className="preview-title">{data.title}</div>
              {data.year && data.genres && (
                <div className="preview-meta">
                  {data.year} • {data.genres.slice(0, 2).join(', ')}
                </div>
              )}
              {data.rating && (
                <div className="preview-rating">
                  {typeof data.rating === 'string' ? (
                    <span className="reaction-emoji">
                      {data.rating === 'love' ? '❤️ Loved' :
                       data.rating === 'like' ? '👍 Liked' :
                       '😐 Meh'}
                    </span>
                  ) : (
                    '⭐'.repeat(data.rating)
                  )}
                </div>
              )}
              {data.comment && (
                <div className="preview-comment">"{data.comment}"</div>
              )}
              {data.username && (
                <div className="preview-user">@{data.username}</div>
              )}
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="share-section">
          <div className="section-label">SHARE TO</div>

          <div className="platform-buttons">
            <button
              className="platform-btn"
              onClick={handleInstagramStory}
              disabled={isGenerating}
            >
              <div className="platform-icon">📱</div>
              <div className="platform-label">IG Story</div>
            </button>

            <button
              className="platform-btn"
              onClick={handleInstagramPost}
              disabled={isGenerating}
            >
              <div className="platform-icon">📱</div>
              <div className="platform-label">IG Post</div>
            </button>

            <button
              className="platform-btn"
              onClick={handleTwitterShare}
              disabled={isGenerating}
            >
              <div className="platform-icon">🐦</div>
              <div className="platform-label">Twitter</div>
            </button>
          </div>

          <button
            className="full-width-btn"
            onClick={handleNativeShare}
            disabled={isGenerating}
          >
            <Icon name="share" size={20} color="white" />
            Share via...
          </button>

          <button
            className="full-width-btn secondary"
            onClick={handleCopyLink}
            disabled={isGenerating}
          >
            <Icon name="copy" size={20} color="white" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Instructions Dialog */}
        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-card">
              <div className="instructions-icon">✓</div>
              <h3>Image saved!</h3>
              <p>
                Open Instagram and:
                <br />
                1. Tap {instructionType === 'story' ? 'Story' : 'Post'} camera
                <br />
                2. Select from Camera Roll
                <br />
                3. Find "{data.title}" card
              </p>
              <div className="instructions-actions">
                <button
                  className="instructions-btn primary"
                  onClick={() => {
                    window.open('instagram://story-camera', '_blank')
                    setShowInstructions(false)
                  }}
                >
                  Open Instagram
                </button>
                <button
                  className="instructions-btn"
                  onClick={() => setShowInstructions(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .share-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        .share-modal {
          position: fixed;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          z-index: 2001;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .share-modal.mobile {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 398px;
          max-width: 100vw;
          border-radius: 16px 16px 0 0;
          padding: 0 20px 20px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .share-modal.desktop {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          max-width: 90vw;
          border-radius: 16px;
          padding: 24px;
          max-height: 80vh;
          overflow-y: auto;
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-drag-handle {
          padding: 12px 0 8px;
          cursor: grab;
          display: flex;
          justify-content: center;
        }

        .drag-handle-bar {
          width: 40px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px;
          line-height: 1.3;
        }

        .section-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.6;
          margin-bottom: 10px;
        }

        .preview-section {
          margin-bottom: 24px;
        }

        .preview-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          gap: 12px;
        }

        .preview-poster {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .preview-content {
          flex: 1;
        }

        .preview-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .preview-meta {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 8px;
        }

        .preview-rating {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .reaction-emoji {
          font-size: 16px;
        }

        .preview-comment {
          font-size: 13px;
          font-style: italic;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .preview-user {
          font-size: 14px;
          font-weight: 600;
          opacity: 0.7;
        }

        .share-section {
          margin-top: 20px;
        }

        .platform-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .platform-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 16px 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .platform-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .platform-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .platform-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .platform-label {
          font-size: 12px;
          font-weight: 600;
        }

        .full-width-btn {
          width: 100%;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .full-width-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .full-width-btn.secondary {
          background: transparent;
        }

        .full-width-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .instructions-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2002;
          padding: 20px;
        }

        .instructions-card {
          background: rgba(20, 20, 20, 0.98);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          max-width: 320px;
          color: white;
        }

        .instructions-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FF006E, #FF8E53);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        }

        .instructions-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .instructions-card p {
          font-size: 14px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 20px;
        }

        .instructions-actions {
          display: flex;
          gap: 12px;
        }

        .instructions-btn {
          flex: 1;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .instructions-btn.primary {
          background: linear-gradient(135deg, #FF006E, #FF8E53);
          border: none;
        }

        .instructions-btn:hover {
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  )
}
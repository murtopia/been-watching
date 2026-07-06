'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/ui/Icon'
import { ShareData } from './ShareButton'
import { trackEvent } from '@/utils/analytics'
import {
  generateShareCard,
  downloadImage,
  ShareCardData,
  ShareCardFormat
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
 * Slim, image-first share flow: live preview of the generated card,
 * plus Share Image (system sheet), Download, and Copy Link actions.
 */
export function ShareModal({
  isOpen,
  onClose,
  data,
  onShareComplete
}: ShareModalProps) {
  const [format, setFormat] = useState<ShareCardFormat>('story')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showInstagramHint, setShowInstagramHint] = useState(false)
  const blobRef = useRef<Blob | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

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

      if (deltaY > 0 && modalRef.current) {
        modalRef.current.style.transform = `translate(-50%, ${deltaY}px)`
      }
    }

    const handleTouchEnd = () => {
      if (!isDragging) return
      isDragging = false

      const deltaY = currentY - startY
      if (deltaY > 100) {
        onClose()
      } else if (modalRef.current) {
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

  // Generate the card whenever the modal opens or the format changes
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setIsGenerating(true)

    const cardData: ShareCardData = {
      title: data.title,
      posterUrl: data.posterUrl || data.items?.[0]?.posterUrl,
      season: data.season,
      status: data.status,
      rating: typeof data.rating === 'string'
        ? (data.rating as 'love' | 'like' | 'meh')
        : null,
      comment: data.comment,
      username: data.username || '',
      avatarUrl: data.avatarUrl,
      year: data.year,
      genre: data.genres?.slice(0, 2).join(' '),
      items: data.contentType === 'list' || data.contentType === 'top3'
        ? data.items
        : undefined,
      headline: data.headline,
      subtitle: data.subtitle
    }

    generateShareCard(cardData, format)
      .then((blob) => {
        if (cancelled) return
        blobRef.current = blob
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(blob)
        })
      })
      .catch((err) => {
        console.error('Failed to generate share card:', err)
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false)
      })

    return () => { cancelled = true }
  }, [isOpen, format, data])

  // Revoke the preview URL on unmount
  useEffect(() => {
    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [])

  if (!isOpen) return null

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
      case 'top3':
        if (!data.username) return `${baseUrl}?${utm.toString()}`
        return `${baseUrl}/${data.username}?${utm.toString()}`
      case 'list':
        // Chart/hero shares are 'list' type but have no profile to link to
        if (!data.username) return `${baseUrl}?${utm.toString()}`
        utm.set('list', data.contentId)
        return `${baseUrl}/${data.username}?${utm.toString()}`
      default:
        return baseUrl
    }
  }

  const generateShareText = (): string => {
    if (data.contentType === 'show') {
      const lead = data.status === 'watching' ? "I'm currently watching" :
                   data.status === 'watched' ? 'I just finished watching' :
                   data.status === 'want' ? 'I want to watch' : 'Check out'
      return `${lead} ${data.title} on Been Watching`
    }
    if (data.headline) return `${data.headline} on Been Watching`
    return `Check out ${data.title} on Been Watching`
  }

  const buildFilename = () => {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `beenwatching-${slug || 'share'}-${format}.png`
  }

  // Phones/tablets that can share files get "Save Image" via the system
  // sheet (anchor-download of a blob doesn't reach the camera roll on iOS).
  const supportsFileShare = (() => {
    try {
      return typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [new File([], 'card.png', { type: 'image/png' })] })
    } catch {
      return false
    }
  })()

  const handleShareImage = async () => {
    if (!blobRef.current || isSharing) return
    setIsSharing(true)

    try {
      const file = new File([blobRef.current], buildFilename(), { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: data.title,
          text: generateShareText()
        })

        trackEvent('content_shared', {
          content_type: data.contentType,
          content_id: data.contentId,
          share_method: 'share_image',
          share_destination: 'external'
        })

        onShareComplete?.('share_image')
      } else {
        // No file sharing support (most desktop browsers): download instead
        downloadImage(blobRef.current, buildFilename())

        trackEvent('content_shared', {
          content_type: data.contentType,
          content_id: data.contentId,
          share_method: 'download_fallback',
          share_destination: 'external'
        })

        onShareComplete?.('download')
      }
    } catch (err) {
      // User cancelled the sheet — not an error
      console.log('Share cancelled:', err)
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = async () => {
    if (!blobRef.current || isSharing) return

    if (supportsFileShare) {
      // Route through the system sheet so "Save Image" actually reaches
      // the camera roll; a plain anchor download can't do that on iOS.
      setIsSharing(true)
      try {
        const file = new File([blobRef.current], buildFilename(), { type: 'image/png' })
        await navigator.share({ files: [file] })

        // Sheet completed (not cancelled): remind them where the card went
        setShowInstagramHint(true)

        trackEvent('content_shared', {
          content_type: data.contentType,
          content_id: data.contentId,
          share_method: 'save_image',
          share_destination: 'external'
        })

        onShareComplete?.('download')
      } catch (err) {
        // User cancelled the sheet — not an error
        console.log('Save cancelled:', err)
      } finally {
        setIsSharing(false)
      }
      return
    }

    downloadImage(blobRef.current, buildFilename())

    trackEvent('content_shared', {
      content_type: data.contentType,
      content_id: data.contentId,
      share_method: 'download',
      share_destination: 'external'
    })

    onShareComplete?.('download')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareUrl())
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

  // Check if we're on desktop
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  return (
    <>
      {/* Backdrop */}
      <div className="share-modal-backdrop" onClick={onClose} />

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
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={24} color="white" />
          </button>
        )}

        {/* Header */}
        <div className="modal-header">
          <h2>Share</h2>
          <div className="format-toggle">
            <button
              className={`format-chip ${format === 'story' ? 'active' : ''}`}
              onClick={() => setFormat('story')}
            >
              Story
            </button>
            <button
              className={`format-chip ${format === 'square' ? 'active' : ''}`}
              onClick={() => setFormat('square')}
            >
              Square
            </button>
          </div>
        </div>

        {/* Live preview of the generated card */}
        <div className={`preview-area ${format}`}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Share card for ${data.title}`}
              className="preview-image"
            />
          ) : (
            <div className="preview-loading">Building your card…</div>
          )}
          {isGenerating && previewUrl && <div className="preview-refreshing" />}
        </div>

        {/* Actions */}
        <div className="actions">
          <button
            className="action-btn primary"
            onClick={handleShareImage}
            disabled={isGenerating || isSharing || !previewUrl}
          >
            <Icon name="share" size={20} color="#0c0c10" />
            {isSharing ? 'Sharing…' : 'Share Image'}
          </button>

          <div className="action-row">
            <button
              className="action-btn"
              onClick={handleDownload}
              disabled={isGenerating || isSharing || !previewUrl}
            >
              <Icon name="download" size={20} color="white" />
              {supportsFileShare ? 'Save Image' : 'Download'}
            </button>

            <button
              className="action-btn"
              onClick={handleCopyLink}
            >
              <Icon name="copy" size={20} color="white" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Instagram hint after the save sheet completes (mobile) */}
        {showInstagramHint && (
          <div className="instructions-overlay">
            <div className="instructions-card">
              <h3>Ready for Instagram</h3>
              <p>
                If you picked Save Image, the card is in your camera roll —
                open Instagram, start a Story or Post, and add it from there.
              </p>
              <div className="instructions-actions">
                <button
                  className="instructions-btn primary"
                  onClick={() => {
                    window.open('instagram://story-camera', '_blank')
                    setShowInstagramHint(false)
                  }}
                >
                  Open Instagram
                </button>
                <button
                  className="instructions-btn"
                  onClick={() => setShowInstagramHint(false)}
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
          padding: 0 20px 24px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .share-modal.desktop {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 480px;
          max-width: 90vw;
          border-radius: 16px;
          padding: 24px;
          max-height: 90vh;
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
          z-index: 1;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-right: 44px;
        }

        .share-modal.mobile .modal-header {
          padding-right: 0;
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          line-height: 1.3;
        }

        .format-toggle {
          display: flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          padding: 3px;
        }

        .format-chip {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .format-chip.active {
          background: #FFC125;
          color: #0c0c10;
        }

        .preview-area {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          min-height: 200px;
        }

        .preview-area.story .preview-image {
          max-height: 380px;
        }

        .preview-area.square .preview-image {
          max-height: 300px;
        }

        .preview-image {
          max-width: 100%;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }

        .preview-loading {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          padding: 60px 0;
        }

        .preview-refreshing {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 10, 0.4);
          border-radius: 12px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .action-btn {
          width: 100%;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.primary {
          background: #FFC125;
          border-color: #FFC125;
          color: #0c0c10;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: #ffce4d;
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
          border: 1px solid rgba(255, 193, 37, 0.4);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          max-width: 320px;
          color: white;
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
          background: #FFC125;
          border: none;
          color: #0c0c10;
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
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
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

'use client'

import { useState, useRef, useEffect } from 'react'
import Icon from '@/components/ui/Icon'
import { QRCodeDisplay } from './QRCodeDisplay'
import { trackEvent } from '@/utils/analytics'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
  subtitle?: string
  username?: string
}

/**
 * QRCodeModal Component
 *
 * Mobile-first bottom sheet modal for displaying QR codes
 * Allows users to share profiles, shows, and invites via QR
 */
export function QRCodeModal({
  isOpen,
  onClose,
  url,
  title,
  subtitle,
  username
}: QRCodeModalProps) {
  const [downloading, setDownloading] = useState(false)
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

  // Handle swipe down to dismiss on mobile
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
        modalRef.current.style.transform = `translateY(${deltaY}px)`
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

  if (!isOpen) return null

  const handleDownloadQR = async () => {
    setDownloading(true)

    try {
      // Get the canvas element
      const canvas = document.querySelector('.qr-code-wrapper canvas') as HTMLCanvasElement
      if (!canvas) {
        throw new Error('QR code canvas not found')
      }

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to convert QR code to image')
        }

        // Create download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `beenwatching-${username || 'qr'}-code.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Track download
        trackEvent('qr_code_downloaded', {
          url: url,
          username: username
        })
      }, 'image/png')
    } catch (error) {
      console.error('Failed to download QR code:', error)
      alert('Failed to download QR code. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleShareQR = async () => {
    try {
      // Get the canvas element
      const canvas = document.querySelector('.qr-code-wrapper canvas') as HTMLCanvasElement
      if (!canvas) {
        throw new Error('QR code canvas not found')
      }

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to convert QR code to image')
        }

        // Create a file from the blob
        const file = new File([blob], `beenwatching-${username || 'qr'}-code.png`, {
          type: 'image/png'
        })

        // Try to share using Web Share API
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            text: `${subtitle || 'Scan to view on Been Watching'}\n${url}`,
            files: [file]
          })

          // Track share
          trackEvent('qr_code_shared', {
            url: url,
            username: username,
            method: 'native_share'
          })
        } else {
          // Fallback to download
          handleDownloadQR()
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to share QR code:', error)
      // Fallback to download
      handleDownloadQR()
    }
  }

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  return (
    <>
      {/* Backdrop */}
      <div
        className="qr-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`qr-modal ${isDesktop ? 'desktop' : 'mobile'}`}
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
          <h2>{title}</h2>
          {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        </div>

        {/* QR Code */}
        <div className="qr-code-section">
          <QRCodeDisplay url={url} size={280} />
        </div>

        {/* URL Display */}
        <div className="url-section">
          {username && (
            <div className="username-display">@{username}</div>
          )}
          <div className="url-display">{url.replace('https://', '')}</div>
        </div>

        {/* Action Buttons */}
        <div className="actions-section">
          <button
            className="action-btn primary"
            onClick={handleDownloadQR}
            disabled={downloading}
          >
            <Icon name="download" size={20} color="white" />
            {downloading ? 'Downloading...' : 'Download QR'}
          </button>

          <button
            className="action-btn secondary"
            onClick={handleShareQR}
            disabled={downloading}
          >
            <Icon name="share" size={20} color="white" />
            Share QR
          </button>
        </div>
      </div>

      <style jsx>{`
        .qr-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        .qr-modal {
          position: fixed;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          z-index: 2001;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }

        .qr-modal.mobile {
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 398px;
          margin: 0 auto;
          border-radius: 16px 16px 0 0;
          padding: 0 20px 20px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .qr-modal.desktop {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 480px;
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

        .modal-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px;
          line-height: 1.3;
        }

        .modal-subtitle {
          font-size: 14px;
          opacity: 0.7;
          margin: 0;
        }

        .qr-code-section {
          margin-bottom: 24px;
        }

        .url-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .username-display {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .url-display {
          font-size: 12px;
          opacity: 0.6;
          word-break: break-all;
        }

        .actions-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .action-btn {
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #FF006E, #FF8E53);
          color: white;
        }

        .action-btn.secondary {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
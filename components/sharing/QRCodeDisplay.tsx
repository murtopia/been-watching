'use client'

import { QRCodeCanvas } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
  size?: number
  showLogo?: boolean
  logoSrc?: string
}

/**
 * QRCodeDisplay Component
 *
 * Generates QR codes for sharing profiles, shows, and invite links
 * Supports embedded logo in center (high error correction)
 */
export function QRCodeDisplay({
  url,
  size = 280,
  showLogo = true,
  logoSrc = '/logo-icon.png'
}: QRCodeDisplayProps) {
  return (
    <div className="qr-code-container">
      <div className="qr-code-wrapper">
        <QRCodeCanvas
          value={url}
          size={size}
          level="H" // High error correction (30% - allows for logo)
          includeMargin={false}
          imageSettings={showLogo ? {
            src: logoSrc,
            height: size * 0.2, // 20% of QR size for logo
            width: size * 0.2,
            excavate: true, // Removes QR dots behind logo
          } : undefined}
        />
      </div>

      <style jsx>{`
        .qr-code-container {
          display: inline-block;
        }

        .qr-code-wrapper {
          padding: 20px;
          background: white;
          border-radius: 12px;
          display: inline-block;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
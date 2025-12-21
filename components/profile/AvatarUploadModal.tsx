'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Icon } from '@/components/ui/Icon'

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentAvatarUrl: string | null
  onAvatarUpdated: (newUrl: string | null) => void
}

export default function AvatarUploadModal({
  isOpen,
  onClose,
  userId,
  currentAvatarUrl,
  onAvatarUpdated
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const supabase = createClient()
  const colors = useThemeColors()

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (50MB - generous limit since we resize before upload)
    if (file.size > 50 * 1024 * 1024) {
      setError('Image must be less than 50MB')
      return
    }

    setError(null)
    setSelectedFile(file)
    setZoom(1)
    setPosition({ x: 0, y: 0 })

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Calculate max allowed position based on zoom
    // At zoom 1, image shouldn't move. At zoom 2, image can move half its width/height
    const containerSize = 200
    const maxOffset = (containerSize * (zoom - 1)) / 2

    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageRef.current) return
    const touch = e.touches[0]

    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y

    // Calculate max allowed position based on zoom
    const containerSize = 200
    const maxOffset = (containerSize * (zoom - 1)) / 2

    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for cropping
          const canvas = document.createElement('canvas')
          const outputSize = 512
          canvas.width = outputSize
          canvas.height = outputSize

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Calculate source dimensions based on zoom
          const scale = zoom
          const sourceWidth = img.width / scale
          const sourceHeight = img.height / scale

          // Calculate source position (centered, adjusted by position offset)
          // Position is in screen pixels, need to convert to image pixels
          const containerSize = 200 // Size of preview container
          const positionScaleX = img.width / containerSize
          const positionScaleY = img.height / containerSize

          let sourceX = (img.width - sourceWidth) / 2 - (position.x * positionScaleX / scale)
          let sourceY = (img.height - sourceHeight) / 2 - (position.y * positionScaleY / scale)

          // Ensure we don't go out of bounds
          sourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth))
          sourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight))

          // Draw cropped and scaled image
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            outputSize,
            outputSize
          )

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to create blob'))
              }
            },
            'image/jpeg',
            0.85 // 85% quality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      // Resize image
      const resizedBlob = await resizeImage(selectedFile)

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldPath}`])
        }
      }

      // Upload new avatar
      const fileName = `avatar-${Date.now()}.jpg`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      // Success!
      onAvatarUpdated(publicUrl)
      onClose()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setUploading(true)
    setError(null)

    try {
      // Delete from storage
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldPath}`])
        }
      }

      // Update profile to null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) throw updateError

      // Success!
      onAvatarUpdated(null)
      onClose()
    } catch (err: any) {
      console.error('Remove error:', err)
      setError(err.message || 'Failed to remove image')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      setPreviewUrl(null)
      setError(null)
      onClose()
    }
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.goldAccent}`,
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={uploading}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: uploading ? 0.5 : 1
          }}
        >
          <Icon name="close-c-default" size={36} />
        </button>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: colors.textPrimary
        }}>
          Update Profile Picture
        </h2>

        {/* Preview */}
        {previewUrl && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `3px solid ${colors.goldAccent}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.1s',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Zoom Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                disabled={zoom <= 1}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `1px solid ${colors.borderColor}`,
                  background: colors.buttonBg,
                  color: colors.textPrimary,
                  cursor: zoom <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: zoom <= 1 ? 0.5 : 1
                }}
              >
                −
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  maxWidth: '150px',
                  accentColor: colors.goldAccent
                }}
              />
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                disabled={zoom >= 3}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `1px solid ${colors.borderColor}`,
                  background: colors.buttonBg,
                  color: colors.textPrimary,
                  cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: zoom >= 3 ? 0.5 : 1
                }}
              >
                +
              </button>
            </div>

            {/* Instruction text */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: colors.textSecondary,
              marginBottom: '1.5rem'
            }}>
              Drag to reposition • Use slider to zoom
            </p>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#c00',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {!selectedFile ? (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '1rem',
                  background: colors.goldAccent,
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                📸 Add Photo
              </button>

              {currentAvatarUrl && (
                <button
                  onClick={handleRemove}
                  disabled={uploading}
                  style={{
                    padding: '1rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {uploading ? 'Removing...' : '🗑️ Remove Current Picture'}
                </button>
              )}

              <button
                onClick={handleClose}
                disabled={uploading}
                style={{
                  padding: '1rem',
                  background: 'transparent',
                  color: colors.textSecondary,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  padding: '1rem',
                  background: colors.goldAccent,
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {uploading ? 'Uploading...' : '✓ Upload'}
              </button>

              <button
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  setError(null)
                }}
                disabled={uploading}
                style={{
                  padding: '1rem',
                  background: 'transparent',
                  color: colors.textSecondary,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                Choose Different Photo
              </button>
            </>
          )}
        </div>

        {/* Info text */}
        {!selectedFile && (
          <p style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            color: colors.textSecondary,
            textAlign: 'center'
          }}>
            Images will be resized to 512×512px
          </p>
        )}
      </div>
    </div>
  )
}

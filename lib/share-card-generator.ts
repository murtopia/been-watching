/**
 * Share Card Generator
 *
 * Client-side image generation using Canvas API
 * Creates Instagram Story/Post cards and other social media templates
 */

export interface ShareCardData {
  posterUrl: string
  title: string
  year?: number
  genres?: string[]
  rating?: number // 1-5 for stars, or 'love'/'like'/'meh' for reactions
  comment?: string
  username: string
  avatarUrl?: string
  profileUrl?: string // For QR code
}

/**
 * Load image with CORS support
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`)
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
}

/**
 * Truncate text to fit within specified lines
 */
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
      if (lines.length >= maxLines) {
        // Add ellipsis to last line if truncating
        const lastLine = lines[maxLines - 1]
        const ellipsisLine = lastLine + '...'
        if (ctx.measureText(ellipsisLine).width <= maxWidth) {
          lines[maxLines - 1] = ellipsisLine
        } else {
          // Remove words from last line until ellipsis fits
          const lastWords = lastLine.split(' ')
          while (lastWords.length > 1) {
            lastWords.pop()
            const truncated = lastWords.join(' ') + '...'
            if (ctx.measureText(truncated).width <= maxWidth) {
              lines[maxLines - 1] = truncated
              break
            }
          }
        }
        break
      }
    } else {
      currentLine = testLine
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  return lines.join('\n')
}

/**
 * Wrap text into multiple lines
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines?: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
      if (maxLines && lines.length >= maxLines) {
        // Add ellipsis to last word if it fits
        const lastLine = currentLine + '...'
        if (ctx.measureText(lastLine).width <= maxWidth) {
          lines[maxLines - 1] = lastLine
        }
        break
      }
    } else {
      currentLine = testLine
    }
  }

  if (currentLine && (!maxLines || lines.length < maxLines)) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Draw reaction emoji based on rating
 */
function drawReaction(ctx: CanvasRenderingContext2D, rating: string, x: number, y: number, size: number) {
  ctx.font = `${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const emoji = rating === 'love' ? '❤️' : rating === 'like' ? '👍' : '😐'
  ctx.fillText(emoji, x, y)
}

/**
 * Generate Instagram Story Card (1080×1920)
 */
export async function generateInstagramStoryCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')!

  // 1. Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(1, '#1a0a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1920)

  // 2. Logo/Brand
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('BEEN WATCHING', 540, 140)

  // 3. Poster (with fallback)
  const posterY = 220
  const posterWidth = 700
  const posterHeight = 1050
  const posterX = (1080 - posterWidth) / 2

  try {
    const poster = await loadImage(data.posterUrl)

    // Add subtle shadow for poster
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 10

    ctx.drawImage(poster, posterX, posterY, posterWidth, posterHeight)

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  } catch (err) {
    // Fallback: Gray rectangle with text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(posterX, posterY, posterWidth, posterHeight)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Poster not available', 540, posterY + posterHeight / 2)
  }

  // 4. Title
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  const titleY = posterY + posterHeight + 80

  // Wrap title if too long
  const titleLines = wrapText(ctx, data.title, 900, 2)
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 540, titleY + (i * 60))
  })

  // 5. Rating or Reaction
  const ratingY = titleY + (titleLines.length * 60) + 40

  if (data.rating) {
    if (typeof data.rating === 'string') {
      // Reaction emoji
      drawReaction(ctx, data.rating, 540, ratingY, 60)
    } else {
      // Star rating
      ctx.font = '50px serif'
      ctx.textAlign = 'center'
      const stars = '⭐'.repeat(Math.floor(data.rating)) + '☆'.repeat(5 - Math.floor(data.rating))
      ctx.fillText(stars, 540, ratingY)
    }
  }

  // 6. Comment (if provided)
  if (data.comment) {
    const commentY = ratingY + 80
    ctx.font = 'italic 32px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.textAlign = 'center'

    const commentText = `"${data.comment}"`
    const truncated = truncateText(ctx, commentText, 900, 3)
    const commentLines = truncated.split('\n')

    commentLines.forEach((line, i) => {
      ctx.fillText(line, 540, commentY + (i * 45))
    })
  }

  // 7. User info (avatar + username)
  const userY = 1780

  // Avatar
  if (data.avatarUrl) {
    try {
      const avatar = await loadImage(data.avatarUrl)

      // Draw circular avatar
      ctx.save()
      ctx.beginPath()
      ctx.arc(100, userY, 30, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, 70, userY - 30, 60, 60)
      ctx.restore()
    } catch (err) {
      // Fallback: Circle with initial
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.arc(100, userY, 30, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(data.username[0].toUpperCase(), 100, userY)
    }
  }

  // Username
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`@${data.username}`, 150, userY)

  // 8. Bottom branding
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillText('beenwatching.com', 980, 1880)

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate image'))
      }
    }, 'image/png', 0.95)
  })
}

/**
 * Generate Instagram Post Card (1080×1080)
 */
export async function generateInstagramPostCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

  // 1. Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(1, '#1a0a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1080)

  // 2. Poster (left side, vertically centered)
  const posterWidth = 460
  const posterHeight = 690
  const posterX = 60
  const posterY = (1080 - posterHeight) / 2 - 40 // Slight offset up for bottom strip

  try {
    const poster = await loadImage(data.posterUrl)

    // Add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 10

    ctx.drawImage(poster, posterX, posterY, posterWidth, posterHeight)

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  } catch (err) {
    // Fallback
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(posterX, posterY, posterWidth, posterHeight)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Poster', posterX + posterWidth / 2, posterY + posterHeight / 2)
  }

  // 3. Right side content
  const rightX = 580
  let currentY = posterY + 60

  // Title
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  const titleLines = wrapText(ctx, data.title, 440, 2)
  titleLines.forEach((line) => {
    ctx.fillText(line, rightX, currentY)
    currentY += 52
  })
  currentY += 20

  // Meta info (year + genres)
  if (data.year || data.genres) {
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'

    const metaParts = []
    if (data.year) metaParts.push(data.year.toString())
    if (data.genres && data.genres.length > 0) {
      metaParts.push(data.genres.slice(0, 2).join(', '))
    }

    if (metaParts.length > 0) {
      ctx.fillText(metaParts.join(' • '), rightX, currentY)
      currentY += 60
    }
  }

  // Rating or Reaction
  if (data.rating) {
    if (typeof data.rating === 'string') {
      drawReaction(ctx, data.rating, rightX + 50, currentY, 50)
    } else {
      ctx.font = '45px serif'
      ctx.textAlign = 'left'
      const stars = '⭐'.repeat(Math.floor(data.rating)) + '☆'.repeat(5 - Math.floor(data.rating))
      ctx.fillText(stars, rightX, currentY)
    }
    currentY += 70
  }

  // Comment
  if (data.comment) {
    ctx.font = 'italic 26px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'

    const commentLines = wrapText(ctx, `"${data.comment}"`, 440, 4)
    commentLines.forEach((line) => {
      ctx.fillText(line, rightX, currentY)
      currentY += 36
    })
  }

  // 4. Bottom strip (user info + branding)
  const stripY = 960

  // Background bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, stripY, 1080, 120)

  // Avatar
  if (data.avatarUrl) {
    try {
      const avatar = await loadImage(data.avatarUrl)

      ctx.save()
      ctx.beginPath()
      ctx.arc(100, stripY + 60, 35, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(avatar, 65, stripY + 25, 70, 70)
      ctx.restore()
    } catch (err) {
      // Fallback
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.arc(100, stripY + 60, 35, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(data.username[0].toUpperCase(), 100, stripY + 60)
    }
  }

  // Username
  ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`@${data.username}`, 160, stripY + 60)

  // Logo (right side)
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('BEEN WATCHING', 1020, stripY + 60)

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate image'))
      }
    }, 'image/png', 0.95)
  })
}

/**
 * Generate Twitter/X Card (1200×630)
 * Note: This is typically done server-side for OG tags, but can be used client-side for downloads
 */
export async function generateTwitterCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')!

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(1, '#1a0a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1200, 630)

  // Poster (left side)
  const posterWidth = 350
  const posterHeight = 525
  const posterX = 50
  const posterY = (630 - posterHeight) / 2

  try {
    const poster = await loadImage(data.posterUrl)
    ctx.drawImage(poster, posterX, posterY, posterWidth, posterHeight)
  } catch (err) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(posterX, posterY, posterWidth, posterHeight)
  }

  // Content (right side)
  const contentX = 450
  let currentY = 120

  // Title
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText(data.title, contentX, currentY)
  currentY += 70

  // Meta
  if (data.year || data.genres) {
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    const meta = []
    if (data.year) meta.push(data.year.toString())
    if (data.genres) meta.push(data.genres.slice(0, 2).join(', '))
    ctx.fillText(meta.join(' • '), contentX, currentY)
    currentY += 60
  }

  // Rating
  if (data.rating) {
    if (typeof data.rating === 'string') {
      drawReaction(ctx, data.rating, contentX + 60, currentY, 48)
    } else {
      ctx.font = '48px serif'
      const stars = '⭐'.repeat(Math.floor(data.rating))
      ctx.fillText(stars, contentX, currentY)
    }
    currentY += 80
  }

  // Comment
  if (data.comment) {
    ctx.font = 'italic 32px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    const truncated = data.comment.length > 60 ? data.comment.substring(0, 57) + '...' : data.comment
    ctx.fillText(`"${truncated}"`, contentX, currentY)
    currentY += 80
  }

  // Footer
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.fillText(`@${data.username} • BEEN WATCHING`, contentX, 530)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate image'))
      }
    }, 'image/png', 0.95)
  })
}

/**
 * Download blob as file
 */
export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
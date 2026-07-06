/**
 * Share Card Generator
 *
 * Client-side image generation using the Canvas API.
 * Produces story (1080x1920) and square (1080x1080) share cards that match
 * the activity-card aesthetic: dark gradient, gold outline, big cover art,
 * status-aware headline, sprite-style rating glyphs (no emoji, no stars).
 */

export type ShareCardStatus = 'want' | 'watching' | 'watched'
export type ShareCardRating = 'love' | 'like' | 'meh'
export type ShareCardFormat = 'story' | 'square'

export interface ShareCardData {
  title: string
  posterUrl?: string
  season?: number | null
  status?: ShareCardStatus | null
  rating?: ShareCardRating | null
  comment?: string
  username: string
  avatarUrl?: string
  /** When present, renders the list layout (poster grid) instead of the single-show layout */
  items?: Array<{ title: string; posterUrl: string }>
  /** Overrides the status-derived headline (used for lists/charts) */
  headline?: string
  subtitle?: string
}

const GOLD = '#FFC125'
const BG_TOP = '#16161c'
const BG_BOTTOM = '#0c0c10'
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'

// Sprite path data (24x24 viewBox) from public/icons/feed-sprite.svg
const HEART_PATH = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
const THUMB_PATH = 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'

function loadImageOnce(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  try {
    return await loadImageOnce(src)
  } catch (err) {
    // CDNs (notably TMDB) sometimes serve cached responses without CORS
    // headers; a cache-busting param forces a fresh, CORS-enabled response.
    if (/^https?:\/\//.test(src)) {
      const sep = src.includes('?') ? '&' : '?'
      return loadImageOnce(`${src}${sep}cors=1`)
    }
    throw err
  }
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draw an image cover-fit inside a rounded rect (poster style) */
async function drawPoster(
  ctx: CanvasRenderingContext2D,
  src: string | undefined,
  x: number, y: number, w: number, h: number,
  radius: number,
  withShadow = true
) {
  let img: HTMLImageElement | null = null
  if (src) {
    try { img = await loadImage(src) } catch { img = null }
  }

  if (withShadow) {
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 16
    roundedRectPath(ctx, x, y, w, h, radius)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.restore()
  }

  ctx.save()
  roundedRectPath(ctx, x, y, w, h, radius)
  ctx.clip()
  if (img) {
    // cover fit
    const scale = Math.max(w / img.width, h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = `500 ${Math.round(w / 12)}px ${FONT_STACK}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('BW', x + w / 2, y + h / 2)
  }
  ctx.restore()

  // subtle inner border like card art
  ctx.save()
  roundedRectPath(ctx, x, y, w, h, radius)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, BG_TOP)
  gradient.addColorStop(1, BG_BOTTOM)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

function drawGoldFrame(ctx: CanvasRenderingContext2D, w: number, h: number, inset: number, radius: number) {
  ctx.save()
  roundedRectPath(ctx, inset, inset, w - inset * 2, h - inset * 2, radius)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.restore()
}

function drawWordmark(ctx: CanvasRenderingContext2D, centerX: number, y: number, size = 34) {
  ctx.save()
  ctx.fillStyle = GOLD
  ctx.font = `700 ${size}px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  try { (ctx as any).letterSpacing = `${Math.round(size * 0.22)}px` } catch { /* older browsers */ }
  ctx.fillText('BEEN WATCHING', centerX, y)
  try { (ctx as any).letterSpacing = '0px' } catch { /* noop */ }
  ctx.restore()
}

/** Draw a sprite-style rating glyph (heart / thumb / meh) at the given box */
function drawRatingGlyph(ctx: CanvasRenderingContext2D, rating: ShareCardRating, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (rating === 'love') {
    const p = new Path2D(HEART_PATH)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'
    ctx.strokeStyle = '#ef4444'
    ctx.fill(p)
    ctx.stroke(p)
  } else if (rating === 'like') {
    const p = new Path2D(THUMB_PATH)
    ctx.fillStyle = 'rgba(255, 193, 37, 0.2)'
    ctx.strokeStyle = GOLD
    ctx.fill(p)
    ctx.stroke(p)
  } else {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.beginPath()
    ctx.arc(12, 12, 10, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(8, 15); ctx.lineTo(16, 15)
    ctx.stroke()
    ctx.lineWidth = 2.4
    ctx.beginPath(); ctx.moveTo(9, 9); ctx.lineTo(9, 10); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(15, 9); ctx.lineTo(15, 10); ctx.stroke()
  }
  ctx.restore()
}

const RATING_LABELS: Record<ShareCardRating, string> = {
  love: 'Loved it',
  like: 'Liked it',
  meh: 'It was meh'
}

function statusHeadline(status?: ShareCardStatus | null): string {
  switch (status) {
    case 'watching': return "I'm currently watching"
    case 'watched': return 'I just finished watching'
    case 'want': return 'I want to watch'
    default: return 'Check out'
  }
}

/** Strip a trailing " - Season N" and return base title + season number */
function splitTitleSeason(title: string, season?: number | null): { base: string; season: number | null } {
  const match = title.match(/^(.*?)\s*[-\u2013]\s*Season\s+(\d+)$/i)
  if (match) return { base: match[1], season: season ?? parseInt(match[2]) }
  return { base: title, season: season ?? null }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
      if (lines.length >= maxLines) break
    } else {
      current = test
    }
  }
  if (lines.length < maxLines && current) lines.push(current)
  else if (lines.length === maxLines && current && lines[maxLines - 1] !== current) {
    let last = lines[maxLines - 1]
    while (last.length > 1 && ctx.measureText(last + '\u2026').width > maxWidth) {
      last = last.slice(0, -1)
    }
    lines[maxLines - 1] = last + '\u2026'
  }
  return lines
}

/** Draw "Title S3" with the season chip in gold; returns lines drawn */
function drawTitleWithSeason(
  ctx: CanvasRenderingContext2D,
  base: string,
  season: number | null,
  centerX: number,
  y: number,
  fontSize: number,
  maxWidth: number,
  lineHeight: number
): number {
  ctx.font = `700 ${fontSize}px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const seasonText = season != null ? ` S${season}` : ''
  const lines = wrapText(ctx, base, maxWidth - (seasonText ? ctx.measureText(seasonText).width : 0), 2)

  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1
    const lineY = y + i * lineHeight
    if (isLast && seasonText) {
      const lineWidth = ctx.measureText(line).width
      const seasonWidth = ctx.measureText(seasonText).width
      const startX = centerX - (lineWidth + seasonWidth) / 2
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(line, startX, lineY)
      ctx.fillStyle = GOLD
      ctx.fillText(seasonText, startX + lineWidth, lineY)
      ctx.textAlign = 'center'
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillText(line, centerX, lineY)
    }
  })
  return lines.length
}

async function drawFooter(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  leftX: number,
  rightX: number,
  y: number,
  avatarRadius = 34
) {
  // Avatar
  let textX = leftX
  if (data.username) {
    if (data.avatarUrl) {
      try {
        const avatar = await loadImage(data.avatarUrl)
        ctx.save()
        ctx.beginPath()
        ctx.arc(leftX + avatarRadius, y, avatarRadius, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(avatar, leftX, y - avatarRadius, avatarRadius * 2, avatarRadius * 2)
        ctx.restore()
        ctx.save()
        ctx.beginPath()
        ctx.arc(leftX + avatarRadius, y, avatarRadius, 0, Math.PI * 2)
        ctx.strokeStyle = GOLD
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.restore()
        textX = leftX + avatarRadius * 2 + 20
      } catch {
        textX = leftX
      }
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = `600 ${avatarRadius * 0.9}px ${FONT_STACK}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`@${data.username}`, textX, y)
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.font = `500 ${avatarRadius * 0.75}px ${FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('beenwatching.com', rightX, y)
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to generate image'))
    }, 'image/png', 0.95)
  })
}

// ============================================================
// Single show cards
// ============================================================

async function drawShowStory(canvas: HTMLCanvasElement, data: ShareCardData) {
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')!
  const centerX = 540

  drawBackground(ctx, 1080, 1920)
  drawGoldFrame(ctx, 1080, 1920, 36, 56)
  drawWordmark(ctx, centerX, 150, 36)

  // Status headline
  const headline = data.headline || statusHeadline(data.status)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.font = `500 44px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(headline, centerX, 258)

  // Big poster
  await drawPoster(ctx, data.posterUrl, 165, 330, 750, 1125, 32)

  // Title + season
  const { base, season } = splitTitleSeason(data.title, data.season)
  const titleLines = drawTitleWithSeason(ctx, base, season, centerX, 1560, 64, 920, 76)

  // Rating (only when watched + rated)
  let cursorY = 1560 + (titleLines - 1) * 76 + 62
  if (data.rating && data.status === 'watched') {
    const label = RATING_LABELS[data.rating]
    ctx.font = `600 40px ${FONT_STACK}`
    const labelWidth = ctx.measureText(label).width
    const glyphSize = 52
    const totalWidth = glyphSize + 20 + labelWidth
    const startX = centerX - totalWidth / 2
    drawRatingGlyph(ctx, data.rating, startX, cursorY - glyphSize / 2 - 6, glyphSize)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, startX + glyphSize + 20, cursorY + 16)
    cursorY += 80
  }

  // Comment
  if (data.comment) {
    ctx.font = `italic 400 34px ${FONT_STACK}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const lines = wrapText(ctx, `\u201C${data.comment}\u201D`, 880, 2)
    lines.forEach((line, i) => ctx.fillText(line, centerX, cursorY + 12 + i * 46))
  }

  await drawFooter(ctx, data, 110, 970, 1810)
}

async function drawShowSquare(canvas: HTMLCanvasElement, data: ShareCardData) {
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

  drawBackground(ctx, 1080, 1080)
  drawGoldFrame(ctx, 1080, 1080, 30, 48)

  // Poster left
  await drawPoster(ctx, data.posterUrl, 80, 160, 440, 660, 24)

  // Right column
  const rightX = 580
  const rightWidth = 410
  const rightCenter = rightX + rightWidth / 2

  drawWordmark(ctx, rightCenter, 210, 26)

  const headline = data.headline || statusHeadline(data.status)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.font = `500 32px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const headlineLines = wrapText(ctx, headline, rightWidth, 2)
  headlineLines.forEach((line, i) => ctx.fillText(line, rightCenter, 300 + i * 42))

  const { base, season } = splitTitleSeason(data.title, data.season)
  const titleLines = drawTitleWithSeason(ctx, base, season, rightCenter, 420 + (headlineLines.length - 1) * 42, 48, rightWidth, 58)

  let cursorY = 420 + (headlineLines.length - 1) * 42 + (titleLines - 1) * 58 + 60
  if (data.rating && data.status === 'watched') {
    const label = RATING_LABELS[data.rating]
    ctx.font = `600 30px ${FONT_STACK}`
    const labelWidth = ctx.measureText(label).width
    const glyphSize = 40
    const totalWidth = glyphSize + 16 + labelWidth
    const startX = rightCenter - totalWidth / 2
    drawRatingGlyph(ctx, data.rating, startX, cursorY - glyphSize / 2, glyphSize)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, startX + glyphSize + 16, cursorY + 12)
    cursorY += 64
  }

  if (data.comment) {
    ctx.font = `italic 400 26px ${FONT_STACK}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const lines = wrapText(ctx, `\u201C${data.comment}\u201D`, rightWidth, 3)
    lines.forEach((line, i) => ctx.fillText(line, rightCenter, cursorY + 8 + i * 36))
  }

  await drawFooter(ctx, data, 100, 980, 960, 28)
}

// ============================================================
// List cards (My Lists tabs, charts)
// ============================================================

async function drawListStory(canvas: HTMLCanvasElement, data: ShareCardData) {
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')!
  const centerX = 540
  const items = (data.items || []).slice(0, 6)

  drawBackground(ctx, 1080, 1920)
  drawGoldFrame(ctx, 1080, 1920, 36, 56)
  drawWordmark(ctx, centerX, 150, 36)

  // Headline
  const headline = data.headline || data.title
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 56px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const headlineLines = wrapText(ctx, headline, 900, 2)
  headlineLines.forEach((line, i) => ctx.fillText(line, centerX, 262 + i * 68))

  let gridTop = 262 + headlineLines.length * 68 + 30
  if (data.subtitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = `500 36px ${FONT_STACK}`
    ctx.fillText(data.subtitle, centerX, gridTop)
    gridTop += 70
  }

  // Poster grid: 3 cols x up to 2 rows, centered between headline and footer
  const cols = 3
  const gap = 32
  const posterW = 300
  const posterH = 450
  const gridWidth = cols * posterW + (cols - 1) * gap
  const startX = (1080 - gridWidth) / 2
  const rows = Math.max(1, Math.ceil(items.length / cols))
  const gridHeight = rows * posterH + (rows - 1) * gap
  const footerTop = 1720
  gridTop = Math.max(gridTop, gridTop + (footerTop - gridTop - gridHeight) / 2)

  for (let i = 0; i < items.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    await drawPoster(
      ctx,
      items[i].posterUrl,
      startX + col * (posterW + gap),
      gridTop + row * (posterH + gap),
      posterW,
      posterH,
      20,
      false
    )
  }

  await drawFooter(ctx, data, 110, 970, 1810)
}

async function drawListSquare(canvas: HTMLCanvasElement, data: ShareCardData) {
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!
  const centerX = 540
  const items = (data.items || []).slice(0, 3)

  drawBackground(ctx, 1080, 1080)
  drawGoldFrame(ctx, 1080, 1080, 30, 48)
  drawWordmark(ctx, centerX, 120, 28)

  const headline = data.headline || data.title
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 46px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const headlineLines = wrapText(ctx, headline, 900, 2)
  headlineLines.forEach((line, i) => ctx.fillText(line, centerX, 210 + i * 56))

  let gridTop = 210 + headlineLines.length * 56 + 20
  if (data.subtitle) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = `500 30px ${FONT_STACK}`
    ctx.fillText(data.subtitle, centerX, gridTop)
    gridTop += 56
  }

  const cols = 3
  const gap = 30
  const posterW = 290
  const posterH = 435
  const gridWidth = cols * posterW + (cols - 1) * gap
  const startX = (1080 - gridWidth) / 2
  gridTop = Math.max(gridTop, 360)

  for (let i = 0; i < items.length; i++) {
    await drawPoster(ctx, items[i].posterUrl, startX + i * (posterW + gap), gridTop, posterW, posterH, 18, false)
  }

  await drawFooter(ctx, data, 100, 980, 960, 28)
}

// ============================================================
// Public API
// ============================================================

/**
 * Generate a share card image. Uses the list layout when `items` is set,
 * otherwise the single-show layout.
 */
export async function generateShareCard(data: ShareCardData, format: ShareCardFormat = 'story'): Promise<Blob> {
  const canvas = document.createElement('canvas')
  if (data.items && data.items.length > 0) {
    if (format === 'story') await drawListStory(canvas, data)
    else await drawListSquare(canvas, data)
  } else {
    if (format === 'story') await drawShowStory(canvas, data)
    else await drawShowSquare(canvas, data)
  }
  return canvasToBlob(canvas)
}

/** Download blob as file */
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

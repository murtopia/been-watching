/**
 * Share Card Generator
 *
 * Client-side image generation using the Canvas API.
 * Produces story (1080x1920) and square (1080x1080) share cards that mirror
 * the activity-card front: full-bleed cover art inside the gold frame,
 * bottom gradient, gold status pill, lower-left title block, and a
 * circle-and-bar username footer (chart-row style).
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
  year?: number
  genre?: string
  /** When present, renders the list layout (poster grid) instead of the single-show layout */
  items?: Array<{ title: string; posterUrl: string }>
  /** Overrides the status-derived pill text (used for lists/charts) */
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

/** Full-bleed art needs more pixels than the w342/w500 used in the feed */
function upgradePosterUrl(src: string): string {
  return src.replace(/(image\.tmdb\.org\/t\/p\/)w(?:185|342|500)\//, '$1w780/')
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

/** Draw an image cover-fit inside a rounded rect (poster style, used for grids) */
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

/**
 * Draw the poster full-bleed inside the gold frame area, with the
 * activity card's bottom gradient and a top scrim for the wordmark.
 * The vertical anchor is biased upward (30%) so square crops keep faces.
 */
async function drawFullBleedArt(
  ctx: CanvasRenderingContext2D,
  src: string | undefined,
  x: number, y: number, w: number, h: number,
  radius: number
) {
  let img: HTMLImageElement | null = null
  if (src) {
    try { img = await loadImage(upgradePosterUrl(src)) } catch { img = null }
  }

  ctx.save()
  roundedRectPath(ctx, x, y, w, h, radius)
  ctx.clip()

  if (img) {
    const scale = Math.max(w / img.width, h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * 0.3, dw, dh)
  } else {
    const fallback = ctx.createLinearGradient(0, y, 0, y + h)
    fallback.addColorStop(0, '#26262e')
    fallback.addColorStop(1, '#101014')
    ctx.fillStyle = fallback
    ctx.fillRect(x, y, w, h)
  }

  // Bottom gradient (matches .background-overlay on activity cards)
  const overlay = ctx.createLinearGradient(0, y, 0, y + h)
  overlay.addColorStop(0, 'rgba(0, 0, 0, 0)')
  overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)')
  overlay.addColorStop(1, 'rgba(0, 0, 0, 0.92)')
  ctx.fillStyle = overlay
  ctx.fillRect(x, y, w, h)

  // Top scrim so the wordmark reads over bright art
  const scrim = ctx.createLinearGradient(0, y, 0, y + Math.min(360, h * 0.3))
  scrim.addColorStop(0, 'rgba(0, 0, 0, 0.6)')
  scrim.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = scrim
  ctx.fillRect(x, y, w, Math.min(360, h * 0.3))

  ctx.restore()
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
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 2
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

function statusPillText(status?: ShareCardStatus | null): string {
  switch (status) {
    case 'watching': return "I'm currently watching"
    case 'watched': return 'I just finished watching'
    case 'want': return 'I want to watch'
    default: return 'Check this out'
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

/** Gold status pill (activity-badge style); returns pill height */
function drawStatusPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  topY: number,
  fontSize: number,
  maxWidth: number
): number {
  ctx.save()
  ctx.font = `700 ${fontSize}px ${FONT_STACK}`
  let label = text
  const padX = Math.round(fontSize * 0.9)
  while (label.length > 4 && ctx.measureText(label).width + padX * 2 > maxWidth) {
    label = label.slice(0, -2).trimEnd() + '\u2026'
  }
  const textW = ctx.measureText(label).width
  const pillH = Math.round(fontSize * 2.1)
  const pillW = textW + padX * 2

  roundedRectPath(ctx, x, topY, pillW, pillH, Math.round(pillH * 0.35))
  ctx.fillStyle = 'rgba(255, 193, 37, 0.22)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 193, 37, 0.8)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + padX, topY + pillH / 2 + 1)
  ctx.restore()
  return pillH
}

/** Left-aligned "Title S3" with the season chip in gold. Draws each line at baselineY + i*lineHeight. */
function drawTitleLeft(
  ctx: CanvasRenderingContext2D,
  base: string,
  season: number | null,
  x: number,
  baselineY: number,
  fontSize: number,
  maxWidth: number,
  lineHeight: number
): number {
  ctx.save()
  ctx.font = `700 ${fontSize}px ${FONT_STACK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 2

  const seasonText = season != null ? ` S${season}` : ''
  const seasonWidth = seasonText ? ctx.measureText(seasonText).width : 0
  const lines = wrapText(ctx, base, maxWidth - seasonWidth, 2)

  lines.forEach((line, i) => {
    const lineY = baselineY + i * lineHeight
    ctx.fillStyle = '#ffffff'
    ctx.fillText(line, x, lineY)
    if (seasonText && i === lines.length - 1) {
      ctx.fillStyle = GOLD
      ctx.fillText(seasonText, x + ctx.measureText(line).width, lineY)
    }
  })
  ctx.restore()
  return lines.length
}

/** Measure how many lines the title will take without drawing */
function measureTitleLines(ctx: CanvasRenderingContext2D, base: string, season: number | null, fontSize: number, maxWidth: number): number {
  ctx.save()
  ctx.font = `700 ${fontSize}px ${FONT_STACK}`
  const seasonText = season != null ? ` S${season}` : ''
  const seasonWidth = seasonText ? ctx.measureText(seasonText).width : 0
  const lines = wrapText(ctx, base, maxWidth - seasonWidth, 2)
  ctx.restore()
  return lines.length
}

/**
 * Circle-and-bar footer (chart-row style): avatar in a white-ringed circle
 * with a gold gradient bar tucked behind it carrying @USERNAME, plus
 * "beenwatching.com" on the right.
 */
async function drawFooterBar(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  leftX: number,
  rightX: number,
  centerY: number,
  scale = 1
) {
  const r = Math.round(52 * scale)
  const urlFont = Math.round(28 * scale)

  if (data.username) {
    const barH = Math.round(64 * scale)
    const nameFont = Math.round(30 * scale)
    ctx.font = `800 ${nameFont}px ${FONT_STACK}`
    let label = `@${data.username.toUpperCase()}`
    const padLeft = r + Math.round(26 * scale)
    const padRight = Math.round(30 * scale)
    const maxBarW = rightX - leftX - Math.round(320 * scale)
    while (label.length > 4 && padLeft + ctx.measureText(label).width + padRight > maxBarW) {
      label = label.slice(0, -2) + '\u2026'
    }
    const barW = padLeft + ctx.measureText(label).width + padRight
    const barX = leftX + r // bar starts at circle center, tucked behind it

    // Bar
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 3
    roundedRectPath(ctx, barX, centerY - barH / 2, barW, barH, barH / 2)
    const barGradient = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    barGradient.addColorStop(0, '#FFC125')
    barGradient.addColorStop(1, '#E8A200')
    ctx.fillStyle = barGradient
    ctx.fill()
    ctx.restore()

    // Bar label
    ctx.save()
    ctx.font = `800 ${nameFont}px ${FONT_STACK}`
    ctx.fillStyle = '#141414'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, barX + padLeft, centerY + 1)
    ctx.restore()

    // Circle: avatar or gold initial fallback
    let avatar: HTMLImageElement | null = null
    if (data.avatarUrl) {
      try { avatar = await loadImage(data.avatarUrl) } catch { avatar = null }
    }
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 2
    ctx.beginPath()
    ctx.arc(leftX + r, centerY, r, 0, Math.PI * 2)
    ctx.fillStyle = '#222'
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.beginPath()
    ctx.arc(leftX + r, centerY, r, 0, Math.PI * 2)
    ctx.clip()
    if (avatar) {
      const cover = Math.max((r * 2) / avatar.width, (r * 2) / avatar.height)
      const dw = avatar.width * cover
      const dh = avatar.height * cover
      ctx.drawImage(avatar, leftX + r - dw / 2, centerY - dh / 2, dw, dh)
    } else {
      ctx.fillStyle = GOLD
      ctx.fillRect(leftX, centerY - r, r * 2, r * 2)
      ctx.fillStyle = '#141414'
      ctx.font = `800 ${Math.round(r * 1.05)}px ${FONT_STACK}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(data.username.charAt(0).toUpperCase(), leftX + r, centerY + 2)
    }
    ctx.restore()

    // White ring (chart-poster style)
    ctx.save()
    ctx.beginPath()
    ctx.arc(leftX + r, centerY, r - 2, 0, Math.PI * 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = Math.max(4, Math.round(5 * scale))
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = `500 ${urlFont}px ${FONT_STACK}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 8
  ctx.fillText('beenwatching.com', rightX, centerY)
  ctx.restore()
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

interface ShowLayout {
  width: number
  height: number
  frameInset: number
  frameRadius: number
  wordmarkY: number
  wordmarkSize: number
  leftX: number
  /** Center of the footer circle/bar */
  footerY: number
  footerScale: number
  pillFont: number
  titleFont: number
  titleLineHeight: number
  metaFont: number
  ratingGlyph: number
  ratingFont: number
  commentFont: number
  commentLineHeight: number
}

const STORY_LAYOUT: ShowLayout = {
  width: 1080,
  height: 1920,
  frameInset: 36,
  frameRadius: 56,
  wordmarkY: 200,
  wordmarkSize: 40,
  leftX: 104,
  // Keeps the footer (and everything above it) clear of Instagram's
  // bottom caption/UI zone (~250px on a 1920 canvas).
  footerY: 1592,
  footerScale: 1,
  pillFont: 36,
  titleFont: 68,
  titleLineHeight: 82,
  metaFont: 38,
  ratingGlyph: 50,
  ratingFont: 40,
  commentFont: 36,
  commentLineHeight: 50
}

const SQUARE_LAYOUT: ShowLayout = {
  width: 1080,
  height: 1080,
  frameInset: 30,
  frameRadius: 48,
  wordmarkY: 130,
  wordmarkSize: 32,
  leftX: 96,
  footerY: 946,
  footerScale: 0.88,
  pillFont: 30,
  titleFont: 56,
  titleLineHeight: 68,
  metaFont: 32,
  ratingGlyph: 42,
  ratingFont: 34,
  commentFont: 30,
  commentLineHeight: 42
}

async function drawShowCard(canvas: HTMLCanvasElement, data: ShareCardData, layout: ShowLayout) {
  const L = layout
  canvas.width = L.width
  canvas.height = L.height
  const ctx = canvas.getContext('2d')!

  drawBackground(ctx, L.width, L.height)

  // Full-bleed art clipped to the frame rect; the gold stroke goes on top
  await drawFullBleedArt(
    ctx,
    data.posterUrl,
    L.frameInset, L.frameInset,
    L.width - L.frameInset * 2, L.height - L.frameInset * 2,
    L.frameRadius
  )

  drawWordmark(ctx, L.width / 2, L.wordmarkY, L.wordmarkSize)

  // ---- Bottom-left content block (bottom-anchored above the footer) ----
  const maxW = L.width - L.leftX * 2
  const circleR = Math.round(52 * L.footerScale)
  const contentBottom = L.footerY - circleR - Math.round(52 * L.footerScale)

  const pillText = data.headline || statusPillText(data.status)
  const pillH = Math.round(L.pillFont * 2.1)
  const pillGap = Math.round(L.pillFont * 0.95)

  const titleParts = splitTitleSeason(data.title, data.season)
  const titleLines = measureTitleLines(ctx, titleParts.base, titleParts.season, L.titleFont, maxW)
  const titleBlockH = titleLines * L.titleLineHeight

  const metaParts: string[] = []
  if (data.year) metaParts.push(String(data.year))
  if (data.genre) metaParts.push(data.genre)
  const metaText = metaParts.join('  \u2022  ')
  const metaH = metaText ? Math.round(L.metaFont * 1.5) : 0

  const showRating = !!data.rating && data.status === 'watched'
  const ratingH = showRating ? L.ratingGlyph + Math.round(L.ratingGlyph * 0.45) : 0

  let commentLines: string[] = []
  if (data.comment) {
    ctx.font = `italic 400 ${L.commentFont}px ${FONT_STACK}`
    commentLines = wrapText(ctx, `\u201C${data.comment}\u201D`, maxW, 2)
  }
  const commentH = commentLines.length
    ? commentLines.length * L.commentLineHeight + Math.round(L.commentFont * 0.5)
    : 0

  const totalH = pillH + pillGap + titleBlockH + metaH + ratingH + commentH
  let cursorY = contentBottom - totalH

  // Pill
  drawStatusPill(ctx, pillText, L.leftX, cursorY, L.pillFont, maxW)
  cursorY += pillH + pillGap

  // Title (baseline of first line sits ~0.78em below its top)
  const titleBaseline = cursorY + Math.round(L.titleFont * 0.78)
  drawTitleLeft(ctx, titleParts.base, titleParts.season, L.leftX, titleBaseline, L.titleFont, maxW, L.titleLineHeight)
  cursorY += titleBlockH

  // Meta line: year • genre
  if (metaText) {
    ctx.save()
    ctx.font = `500 ${L.metaFont}px ${FONT_STACK}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillText(metaText, L.leftX, cursorY + Math.round(L.metaFont * 0.9))
    ctx.restore()
    cursorY += metaH
  }

  // Rating row (only when watched + rated)
  if (showRating && data.rating) {
    const rowCenter = cursorY + Math.round(ratingH * 0.55)
    drawRatingGlyph(ctx, data.rating, L.leftX, rowCenter - L.ratingGlyph / 2, L.ratingGlyph)
    ctx.save()
    ctx.font = `600 ${L.ratingFont}px ${FONT_STACK}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.fillText(RATING_LABELS[data.rating], L.leftX + L.ratingGlyph + Math.round(L.ratingGlyph * 0.4), rowCenter)
    ctx.restore()
    cursorY += ratingH
  }

  // Comment
  if (commentLines.length) {
    ctx.save()
    ctx.font = `italic 400 ${L.commentFont}px ${FONT_STACK}`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    commentLines.forEach((line, i) => {
      ctx.fillText(line, L.leftX, cursorY + Math.round(L.commentFont * 0.9) + i * L.commentLineHeight)
    })
    ctx.restore()
  }

  // Footer + frame on top
  await drawFooterBar(ctx, data, L.leftX, L.width - L.leftX, L.footerY, L.footerScale)
  drawGoldFrame(ctx, L.width, L.height, L.frameInset, L.frameRadius)
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
  drawWordmark(ctx, centerX, 170, 36)

  // Headline
  const headline = data.headline || data.title
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 56px ${FONT_STACK}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const headlineLines = wrapText(ctx, headline, 900, 2)
  headlineLines.forEach((line, i) => ctx.fillText(line, centerX, 282 + i * 68))

  let gridTop = 282 + headlineLines.length * 68 + 30
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
  const footerTop = 1480
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

  // Same Instagram-safe footer position as the show story card
  await drawFooterBar(ctx, data, 104, 976, 1592, 1)
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
  gridTop = Math.max(gridTop, 340)

  for (let i = 0; i < items.length; i++) {
    await drawPoster(ctx, items[i].posterUrl, startX + i * (posterW + gap), gridTop, posterW, posterH, 18, false)
  }

  await drawFooterBar(ctx, data, 96, 984, 946, 0.88)
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
    await drawShowCard(canvas, data, format === 'story' ? STORY_LAYOUT : SQUARE_LAYOUT)
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

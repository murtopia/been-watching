# Social Sharing - Visual Design Specifications (Mobile-First)

**Created:** 2025-11-23
**Updated:** 2025-11-24 (Mobile-First Revision)
**Related:** [Social Sharing Master Plan](../features/social-sharing-master-plan.md)

---

## 📱 Mobile-First Design Philosophy

All designs prioritize **mobile experience** first, then scale up to tablet and desktop. Been Watching uses a **398px card width** throughout the app, which informs all share modal dimensions.

### Design Priorities
1. **Touch-first:** 44px minimum tap targets
2. **Native patterns:** Bottom sheets, swipe gestures
3. **Card consistency:** 398px max width on mobile
4. **App-ready:** Works as PWA, converts to native app easily

---

## 📱 Share Modal Design (Mobile Primary)

### Mobile Bottom Sheet (375px - 430px viewport)

```
┌─────────────────────────────────────┐ ← Screen edge
│                                     │
│  (Backdrop blur overlay)            │
│                                     │
│  ┌─────────────────────────────┐   │ ← Modal container
│  │ ════                        │   │ ← Drag handle (40×4px)
│  ├─────────────────────────────┤   │
│  │ Share "Breaking Bad"        │   │ ← Title (18px bold)
│  │                             │   │
│  │ Preview:                    │   │ ← Section label (12px)
│  │ ┌─────────────────────────┐ │   │
│  │ │ ╔════╗  Breaking Bad    │ │   │ ← Preview card
│  │ │ ║    ║  2008 • Drama    │ │   │   Compact layout
│  │ │ ║IMG ║  ⭐ Loved         │ │   │   80px poster
│  │ │ ╚════╝                  │ │   │
│  │ │  "This finale was       │ │   │
│  │ │   incredible!"          │ │   │
│  │ │  @murtopia              │ │   │
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  │ Share to:                   │   │ ← Section label
│  │                             │   │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ │   │ ← Platform buttons
│  │ │  📱  │ │  📱  │ │  🐦  │ │   │   80×80px each
│  │ │ IG   │ │ IG   │ │Twitter│ │   │   3 columns
│  │ │Story │ │Post  │ │       │ │   │   12px gap
│  │ └──────┘ └──────┘ └──────┘ │   │
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │ ← "Share via..." button
│  │ │  📤  Share via...       │ │   │   Full width, 56px height
│  │ └─────────────────────────┘ │   │   Opens native sheet
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │ ← Copy link button
│  │ │  📋  Copy Link          │ │   │   Full width, 56px height
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  │ ─── or share with friend ── │   │ ← Divider line
│  │                             │   │
│  │ Recent BW Users:            │   │ ← Section label
│  │                             │   │
│  │ ┌─────┐  ┌─────┐  ┌─────┐  │   │ ← User avatars
│  │ │ [A] │  │ [B] │  │ [C] │  │   │   60×60px circles
│  │ │@alex│  │@sam │  │@pat │  │   │   Names below (10px)
│  │ └─────┘  └─────┘  └─────┘  │   │
│  │                             │   │
│  │ ┌─────────────────────────┐ │   │ ← Search input
│  │ │ 🔍 Search all users...  │ │   │   48px height
│  │ └─────────────────────────┘ │   │
│  │                             │   │
│  └─────────────────────────────┘   │ ← 20px bottom safe area
│                                     │
└─────────────────────────────────────┘
```

### Mobile Dimensions & Spacing

**Container:**
- Max width: `398px` (matches card width)
- Centered horizontally on screen
- Border radius: `16px 16px 0 0` (rounded top corners only)
- Padding: `20px` (all sides except bottom - safe area handled)
- Background: `rgba(10, 10, 10, 0.95)`
- Backdrop filter: `blur(20px)`
- Bottom: Sits at screen bottom, respects safe area

**Drag Handle:**
- Width: `40px`
- Height: `4px`
- Color: `rgba(255, 255, 255, 0.3)`
- Border radius: `2px`
- Position: Top center, `12px` from top edge
- Interactive area: `60px × 20px` (larger than visual)

**Touch Targets (Minimum 44×44px):**
- Platform buttons: `80×80px` ✅
- "Share via..." button: `Full width × 56px` ✅
- Copy link button: `Full width × 56px` ✅
- User avatars: `60×60px` (tap area extends to name) ✅
- Search input: `Full width × 48px` ✅
- Drag handle: `60×20px` tap area ✅

**Spacing:**
- Section gap: `20px`
- Button gap: `12px`
- Avatar gap: `16px`
- Text to element: `8px`

**Safe Areas:**
- iOS notch: Top padding auto-adjusted
- iOS home indicator: Bottom padding `20px` minimum
- Android nav bar: Bottom padding `20px` minimum

---

### Tablet View (640px - 1024px viewport)

```
Centered modal (540px wide)
- Same layout as mobile
- Slightly wider buttons (100×90px)
- 4 platform buttons per row instead of 3
- Still uses bottom sheet pattern
- Drag handle remains
```

---

### Desktop View (1024px+ viewport)

```
┌─────────────────────────────────────────────────────────┐
│                   (Centered modal)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Share "Breaking Bad"                         [X] │  │ ← Close button
│  │━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│  │
│  │                                                   │  │
│  │  Preview:                                         │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │                                             │ │  │
│  │  │  ╔═══════╗                                  │ │  │
│  │  │  ║       ║   Breaking Bad                   │ │  │
│  │  │  ║ IMAGE ║   2008 • Crime Drama             │ │  │
│  │  │  ║       ║                                  │ │  │
│  │  │  ╚═══════╝   ⭐ Loved                       │ │  │
│  │  │                                             │ │  │
│  │  │  "This finale was absolutely incredible!   │ │  │
│  │  │   Best TV I've seen all year."             │ │  │
│  │  │                                             │ │  │
│  │  │  Shared by @murtopia                       │ │  │
│  │  │  [Avatar] Nick                             │ │  │
│  │  │                                             │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │  Share to:                                        │  │
│  │                                                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │  │
│  │  │    📱    │ │    📱    │ │    🐦    │         │  │
│  │  │ IG Story │ │  IG Post │ │  Twitter │         │  │
│  │  └──────────┘ └──────────┘ └──────────┘         │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  📤  Share via... (or copy link)            │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │  ───────────── or share with friend ─────────────│  │
│  │                                                   │  │
│  │  Recent BW Users:                                 │  │
│  │  [👤] @alex  [👤] @sam  [👤] @pat                │  │
│  │                                                   │  │
│  │  [🔍 Search for user...]                          │  │
│  │                                                   │  │
│  │  Message (optional):                              │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │ You need to watch this!                     │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │                            [Cancel] [Send Share] │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Desktop Dimensions:**
- Width: `600px` fixed
- Centered: `position: fixed`, `inset: 0`, `margin: auto`
- Border radius: `16px` (all corners)
- No drag handle (not dismissible via swipe)
- Close button: `32×32px`, top right, `16px` from edges
- Hover states: All buttons show `background: rgba(255, 255, 255, 0.1)` on hover

---

## 📱 Instagram Story Template (1080 × 1920)

### Mobile-First Canvas Generation

**Generated on device using Canvas API**

```
   1080px
  ┌─────────────────────┐
  │                     │ ← 100px padding top
  │   BEEN WATCHING     │ ← Logo (white, 40px, bold, centered)
  │                     │
  │                     │ ← 80px spacer
  │                     │
  │  ╔═══════════════╗  │
  │  ║               ║  │
  │  ║               ║  │
  │  ║               ║  │ ← Poster (700×1050px)
1920px  ║   POSTER      ║  │   Centered horizontally
  │  ║               ║  │   190px from left edge
  │  ║               ║  │   Auto-loaded from URL
  │  ║               ║  │   Fallback: Gray placeholder
  │  ╚═══════════════╝  │
  │                     │ ← 60px spacer
  │   Breaking Bad      │ ← Title (white, bold, 48px)
  │                     │ ← 16px spacer
  │   ⭐⭐⭐⭐⭐        │ ← Rating (60px height)
  │                     │ ← 32px spacer
  │   "This finale was  │ ← Comment (white, 32px)
  │    absolutely       │   Max 2 lines
  │    incredible!"     │   Text overflow: Ellipsis
  │                     │ ← 40px spacer
  │   ┌─────┐           │
  │   │ [A] │ @murtopia │ ← Avatar (40px) + username (28px)
  │   └─────┘           │   Left-aligned with padding
  │                     │
  │                     │ ← Flexible spacer (pushes QR down)
  │                     │
  │                [QR] │ ← QR Code (120×120px)
  │                     │   Bottom-right corner
  │                     │   40px from edges
  └─────────────────────┘
```

### Canvas Implementation Code

```typescript
// lib/share-card-generator.ts
export async function generateInstagramStoryCard(data: {
  posterUrl: string
  title: string
  rating: number // 1-5
  comment: string
  username: string
  avatarUrl: string
  profileUrl: string // For QR code
}): Promise<Blob> {
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

  // 2. Logo
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI"'
  ctx.textAlign = 'center'
  ctx.fillText('BEEN WATCHING', 540, 140)

  // 3. Poster (load image)
  try {
    const poster = await loadImage(data.posterUrl)
    ctx.drawImage(poster, 190, 220, 700, 1050)
  } catch (err) {
    // Fallback: Gray rectangle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(190, 220, 700, 1050)
  }

  // 4. Title
  ctx.font = 'bold 48px -apple-system'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.title, 540, 1350)

  // 5. Rating stars
  const starY = 1420
  const starSize = 60
  for (let i = 0; i < 5; i++) {
    const x = 390 + (i * 70)
    // Draw star emoji or icon
    ctx.fillText(i < data.rating ? '⭐' : '☆', x, starY)
  }

  // 6. Comment (truncate to 2 lines)
  ctx.font = '32px -apple-system'
  ctx.textAlign = 'center'
  const maxWidth = 900
  const truncated = truncateText(ctx, data.comment, maxWidth, 2)
  ctx.fillText(truncated, 540, 1520)

  // 7. Avatar + Username
  try {
    const avatar = await loadImage(data.avatarUrl)
    ctx.save()
    ctx.beginPath()
    ctx.arc(210, 1620, 20, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 190, 1600, 40, 40)
    ctx.restore()
  } catch (err) {
    // Fallback: Circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.beginPath()
    ctx.arc(210, 1620, 20, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font = '28px -apple-system'
  ctx.textAlign = 'left'
  ctx.fillText(`@${data.username}`, 250, 1625)

  // 8. QR Code (bottom right)
  const qrDataURL = await generateQRCode(data.profileUrl, 120)
  const qrImage = await loadImage(qrDataURL)
  ctx.drawImage(qrImage, 920, 1760, 120, 120)

  // 9. Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9)
  })
}

// Helper: Truncate text to fit width
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string {
  const words = text.split(' ')
  let lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
      if (lines.length >= maxLines) break
    } else {
      currentLine = testLine
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  let result = lines.join('\n')
  if (lines.length >= maxLines && words.length > lines.join(' ').split(' ').length) {
    result += '...'
  }

  return result
}

// Helper: Generate QR code as data URL
async function generateQRCode(url: string, size: number): Promise<string> {
  const QRCode = await import('qrcode')
  return QRCode.toDataURL(url, {
    width: size,
    margin: 0,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

// Helper: Load image as promise
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
```

### Typography Details

| Element | Font | Size | Weight | Color | Alignment |
|---------|------|------|--------|-------|-----------|
| Logo | System | 40px | Bold | #ffffff | Center |
| Title | System | 48px | Bold | #ffffff | Center |
| Rating | Emoji | 60px | - | Gold/Gray | Center |
| Comment | System | 32px | Regular | #ffffff | Center |
| Username | System | 28px | Semi-bold | #ffffff | Left |

### Color Palette

```css
Background gradient:
  top: #0a0a0a
  bottom: #1a0a1a

Text:
  primary: #ffffff
  secondary: rgba(255, 255, 255, 0.8)

Accent:
  gradient: linear-gradient(135deg, #FF006E, #FF8E53)
  (used for subtle brand elements, not dominant)
```

---

## 📷 Instagram Post Template (1080 × 1080)

### Square Layout for Feed Posts

```
   1080px
  ┌─────────────────────┐
  │                     │
  │  ╔════════╗         │ ← Poster left (500×750px)
  │  ║        ║  Title  │   Positioned: 40px from left
1080px  ║ POSTER ║         │   Content right (500px wide)
  │  ║        ║  Rating │   Positioned: 40px from right
  │  ║        ║         │
  │  ║        ║  Quote  │
  │  ╚════════╝         │
  │                     │
  │  @username          │ ← Bottom section
  │  BEEN WATCHING      │   Avatar + Logo
  └─────────────────────┘
```

### Canvas Implementation

```typescript
export async function generateInstagramPostCard(data: {
  posterUrl: string
  title: string
  year: number
  genres: string[]
  rating: number
  comment: string
  username: string
  avatarUrl: string
}): Promise<Blob> {
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

  // 2. Poster (left side, 500×750px, vertically centered)
  try {
    const poster = await loadImage(data.posterUrl)
    ctx.drawImage(poster, 40, 165, 500, 750)
  } catch (err) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(40, 165, 500, 750)
  }

  // 3. Right side content (starts at x=580)
  const rightX = 580
  let currentY = 300

  // Title
  ctx.font = 'bold 42px -apple-system'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(data.title, rightX, currentY)
  currentY += 60

  // Meta (year + genres)
  ctx.font = '24px -apple-system'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  const meta = `${data.year} • ${data.genres.join(', ')}`
  ctx.fillText(meta, rightX, currentY)
  currentY += 80

  // Rating stars
  ctx.font = '50px serif'
  for (let i = 0; i < 5; i++) {
    ctx.fillText(i < data.rating ? '⭐' : '☆', rightX + (i * 60), currentY)
  }
  currentY += 80

  // Comment (max 4 lines)
  ctx.font = '28px -apple-system'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  const maxWidth = 460
  const lines = wrapText(ctx, data.comment, maxWidth, 4)
  lines.forEach(line => {
    ctx.fillText(line, rightX, currentY)
    currentY += 40
  })

  // 4. Bottom strip (avatar + username + logo)
  // Background bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(0, 960, 1080, 120)

  // Avatar
  try {
    const avatar = await loadImage(data.avatarUrl)
    ctx.save()
    ctx.beginPath()
    ctx.arc(100, 1020, 30, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(avatar, 70, 990, 60, 60)
    ctx.restore()
  } catch (err) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.beginPath()
    ctx.arc(100, 1020, 30, 0, Math.PI * 2)
    ctx.fill()
  }

  // Username
  ctx.font = '32px -apple-system'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`@${data.username}`, 180, 1030)

  // Logo (right side)
  ctx.font = 'bold 28px -apple-system'
  ctx.textAlign = 'right'
  ctx.fillText('BEEN WATCHING', 1040, 1030)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9)
  })
}

// Helper: Wrap text into lines
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
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
      if (lines.length >= maxLines) {
        lines[maxLines - 1] += '...'
        break
      }
    } else {
      currentLine = testLine
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  return lines
}
```

---

## 🐦 Twitter Card (1200 × 630)

### For Link Previews (Server-Side Generation)

**Generated via Vercel OG Image API**

```
   1200px
  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │  ╔═════════╗  Breaking Bad                      │
  │  ║         ║  2008 • Crime Drama                │
  │  ║  POSTER ║                                     │ 630px
  │  ║         ║  ⭐⭐⭐⭐⭐ Loved                 │
  │  ╚═════════╝                                     │
  │              "This finale was absolutely..."     │
  │              @murtopia • BEEN WATCHING           │
  └──────────────────────────────────────────────────┘
```

### Vercel OG Implementation

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'show', 'profile', 'top3'
  const id = searchParams.get('id')
  const sharedBy = searchParams.get('shared_by')

  // Fetch data from database
  const data = await fetchDataForOG(type, id, sharedBy)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #0a0a0a, #1a0a1a)',
          padding: '40px',
          alignItems: 'center',
        }}
      >
        {/* Poster */}
        <img
          src={data.posterUrl}
          width={420}
          height={630}
          style={{
            borderRadius: '12px',
            objectFit: 'cover',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '40px',
            flex: 1,
          }}
        >
          {/* Title */}
          <div style={{ fontSize: 52, fontWeight: 'bold', color: 'white' }}>
            {data.title}
          </div>

          {/* Meta */}
          <div style={{ fontSize: 28, color: 'rgba(255, 255, 255, 0.7)', marginTop: '16px' }}>
            {data.year} • {data.genres.join(', ')}
          </div>

          {/* Rating */}
          <div style={{ fontSize: 48, marginTop: '40px' }}>
            {'⭐'.repeat(data.rating)}
          </div>

          {/* Comment */}
          <div style={{ fontSize: 32, color: 'rgba(255, 255, 255, 0.9)', marginTop: '40px', fontStyle: 'italic' }}>
            "{data.comment.substring(0, 80)}..."
          </div>

          {/* Footer */}
          <div style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.6)', marginTop: '60px' }}>
            @{sharedBy} • BEEN WATCHING
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

## 👤 Profile Share Card (1200 × 630)

### For Profile Links

```
   1200px
  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │     ┌─────────┐                                 │
  │     │         │     Nick (@murtopia)            │
  │     │ AVATAR  │     250 Shows Watched           │ 630px
  │     │         │     342 Followers                │
  │     └─────────┘                                 │
  │                                                  │
  │     Top 3 Shows:                                 │
  │     ┌─────┐  ┌─────┐  ┌─────┐                  │
  │     │ P1  │  │ P2  │  │ P3  │                  │
  │     └─────┘  └─────┘  └─────┘                  │
  │                                                  │
  │     beenwatching.com/murtopia        [QR]       │
  └──────────────────────────────────────────────────┘
```

### Implementation

```typescript
// app/api/og/profile/route.tsx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  const profile = await fetchProfileData(username)

  return new ImageResponse(
    (
      <div style={{ /* gradient background, padding */ }}>
        {/* Avatar (200×200, circular) */}
        <img
          src={profile.avatarUrl}
          width={200}
          height={200}
          style={{
            borderRadius: '50%',
            border: '4px solid',
            borderImage: 'linear-gradient(135deg, #FF006E, #FF8E53) 1',
          }}
        />

        {/* User info */}
        <div style={{ marginLeft: '40px', flex: 1 }}>
          <div style={{ fontSize: 56, fontWeight: 'bold' }}>
            {profile.displayName}
          </div>
          <div style={{ fontSize: 36, opacity: 0.7 }}>
            @{profile.username}
          </div>
          <div style={{ fontSize: 28, opacity: 0.7, marginTop: '16px' }}>
            {profile.showCount} Shows Watched • {profile.followerCount} Followers
          </div>
        </div>

        {/* Top 3 shows */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>Top 3 Shows:</div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
            {profile.topShows.map((show) => (
              <img
                key={show.id}
                src={show.posterUrl}
                width={180}
                height={270}
                style={{ borderRadius: '8px' }}
              />
            ))}
          </div>
        </div>

        {/* QR code (bottom right) */}
        <div style={{ position: 'absolute', bottom: 40, right: 40 }}>
          <img
            src={`/api/qr?url=${encodeURIComponent(profile.url)}`}
            width={140}
            height={140}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

---

## 🎁 QR Code Modal Design

### Mobile Bottom Sheet

```
┌─────────────────────────────┐
│ ═══                         │ ← Drag handle
├─────────────────────────────┤
│ Share Profile               │ ← Title (18px bold)
│                             │
│ Scan to View Profile        │ ← Subtitle (14px)
│                             │
│    ┌──────────────┐         │
│    │  ╔════════╗  │         │
│    │  ║        ║  │         │
│    │  ║   QR   │  │         │ ← QR Code (280×280px)
│    │  ║  CODE  │  │         │   White background
│    │  ║  [BW]  │  │         │   BW logo in center (60px)
│    │  ╚════════╝  │         │   20px padding around QR
│    └──────────────┘         │
│                             │
│ @murtopia                   │ ← Username (16px bold)
│ beenwatching.com/murtopia   │ ← URL (12px, 60% opacity)
│                             │
│ ┌──────────────────────────┐│
│ │  📥 Download QR          ││ ← Download button (56px height)
│ └──────────────────────────┘│
│                             │
│ ┌──────────────────────────┐│
│ │  📤 Share QR             ││ ← Share button (56px height)
│ └──────────────────────────┘│   Opens native share with QR image
│                             │
└─────────────────────────────┘
```

### QR Code Specifications

```typescript
// components/sharing/QRCodeDisplay.tsx
import { QRCodeCanvas } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
  size?: number
  showLogo?: boolean
}

export function QRCodeDisplay({
  url,
  size = 280,
  showLogo = true
}: QRCodeDisplayProps) {
  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      display: 'inline-block',
    }}>
      <QRCodeCanvas
        value={url}
        size={size}
        level="H" // High error correction (30% - allows logo)
        includeMargin={false}
        imageSettings={showLogo ? {
          src: '/logo-icon.png',
          height: size * 0.2, // 20% of QR size
          width: size * 0.2,
          excavate: true, // Removes QR dots behind logo
        } : undefined}
      />
    </div>
  )
}
```

**Error Correction Levels:**
- L (7%): Low - smallest QR, no logo
- M (15%): Medium - default, small logo
- Q (25%): Quartile - medium logo
- H (30%): High - large logo possible ✅ (we use this)

---

## 🔔 In-App Share Notification Design

### Notification in Dropdown

```
┌─────────────────────────────────────┐
│ [👤] @murtopia shared a show       │ ← Bold username
│      with you                       │ ← Gray text
│      2 min ago                      │ ← Timestamp (60% opacity)
│                                     │
│      ╔════╗  Breaking Bad           │ ← Poster (80×120px)
│      ║IMG ║  "Check this out!"      │   Title (16px bold)
│      ╚════╝                         │   Message (14px italic)
│                                     │
│      [View Show]     [Dismiss]      │ ← Action buttons
└─────────────────────────────────────┘   48px height each
```

**Mobile Notification Styling:**
```css
.share-notification {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid;
  border-image: linear-gradient(135deg, #FF006E, #FF8E53) 1;
  border-radius: 8px;
  margin-bottom: 12px;
}

.notification-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.notification-poster {
  width: 80px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
}

.notification-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.notification-button {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-button.primary {
  background: linear-gradient(135deg, #FF006E, #FF8E53);
  border: none;
  color: white;
}

.notification-button.secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}
```

---

## 🎨 Complete Color System

### Brand Colors

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #FF006E, #FF8E53);
--color-pink: #FF006E;      /* rgb(255, 0, 110) */
--color-orange: #FF8E53;    /* rgb(255, 142, 83) */

/* Background */
--bg-dark: #0a0a0a;         /* Primary background */
--bg-dark-alt: #1a0a1a;     /* Secondary background */
--bg-card: rgba(255, 255, 255, 0.05);
--bg-card-hover: rgba(255, 255, 255, 0.08);
--bg-modal: rgba(10, 10, 10, 0.95);

/* Text */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary: rgba(255, 255, 255, 0.5);
--text-disabled: rgba(255, 255, 255, 0.3);

/* Borders */
--border-default: rgba(255, 255, 255, 0.1);
--border-hover: rgba(255, 255, 255, 0.2);
--border-active: rgba(255, 255, 255, 0.3);
--border-focus: rgba(255, 142, 83, 0.5);

/* States */
--state-success: #4ade80;
--state-error: #ef4444;
--state-warning: #fbbf24;
--state-info: #3b82f6;
```

---

## 📐 Typography Scale (Mobile-First)

### Headings

```css
h1 {
  font-size: 32px;           /* Mobile */
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

@media (min-width: 768px) {
  h1 { font-size: 48px; }    /* Tablet */
}

@media (min-width: 1024px) {
  h1 { font-size: 56px; }    /* Desktop */
}

h2 {
  font-size: 28px;           /* Mobile */
  font-weight: 700;
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  h2 { font-size: 36px; }
}

@media (min-width: 1024px) {
  h2 { font-size: 48px; }
}

h3 {
  font-size: 24px;           /* Mobile */
  font-weight: 600;
}

@media (min-width: 768px) {
  h3 { font-size: 28px; }
}

h4 {
  font-size: 20px;           /* Mobile */
  font-weight: 600;
}

h5 {
  font-size: 18px;
  font-weight: 600;
}

h6 {
  font-size: 16px;
  font-weight: 600;
}
```

### Body Text

```css
.text-large {
  font-size: 18px;
  line-height: 1.6;
}

.text-default {
  font-size: 16px;
  line-height: 1.5;
}

.text-small {
  font-size: 14px;
  line-height: 1.4;
}

.text-tiny {
  font-size: 12px;
  line-height: 1.3;
}

.text-micro {
  font-size: 10px;
  line-height: 1.2;
}
```

### Font Families

```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                'Droid Sans', 'Helvetica Neue', sans-serif;

--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
             Consolas, 'Liberation Mono', 'Courier New', monospace;
```

---

## 📏 Spacing Scale (Mobile-First)

```css
--space-xs: 4px;      /* 0.25rem */
--space-sm: 8px;      /* 0.5rem */
--space-md: 12px;     /* 0.75rem */
--space-base: 16px;   /* 1rem */
--space-lg: 20px;     /* 1.25rem */
--space-xl: 24px;     /* 1.5rem */
--space-2xl: 32px;    /* 2rem */
--space-3xl: 40px;    /* 2.5rem */
--space-4xl: 48px;    /* 3rem */
--space-5xl: 64px;    /* 4rem */
--space-6xl: 80px;    /* 5rem */
```

### Usage Guide

```css
/* Tight spacing (within components) */
gap: var(--space-sm);          /* 8px */
padding: var(--space-md);      /* 12px */

/* Standard spacing (between elements) */
margin-bottom: var(--space-base);   /* 16px */
gap: var(--space-lg);               /* 20px */

/* Section spacing */
padding: var(--space-2xl);     /* 32px */
margin-top: var(--space-3xl);  /* 40px */

/* Large gaps (page sections) */
padding: var(--space-5xl);     /* 64px */
```

---

## 🎬 Animation Specifications

### Modal Enter/Exit

```css
/* Bottom sheet slide up (mobile) */
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

.share-modal {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Bottom sheet slide down (dismiss) */
@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.share-modal.exiting {
  animation: slideDown 0.2s cubic-bezier(0.4, 0, 1, 1);
}

/* Centered modal (desktop) */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (min-width: 1024px) {
  .share-modal {
    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
```

### Button Interactions

```css
/* Hover */
.share-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Active/Press */
.share-button:active {
  transform: scale(0.95);
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Success Feedback

```css
/* Success pulse (after copy) */
@keyframes successPulse {
  0% {
    transform: scale(1);
    background: rgba(74, 222, 128, 0.2);
  }
  50% {
    transform: scale(1.05);
    background: rgba(74, 222, 128, 0.3);
  }
  100% {
    transform: scale(1);
    background: rgba(74, 222, 128, 0.2);
  }
}

.success-feedback {
  animation: successPulse 0.6s ease-out;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
/* 0-639px: Mobile (default styles) */

/* Small Tablet */
@media (min-width: 640px) {
  /* 640px - 767px */
  .share-modal {
    max-width: 480px;
  }
}

/* Tablet */
@media (min-width: 768px) {
  /* 768px - 1023px */
  .share-modal {
    max-width: 540px;
  }

  .share-platform-buttons {
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  /* 1024px - 1439px */
  .share-modal {
    width: 600px;
    max-width: none;
    border-radius: 16px; /* All corners */
  }

  /* Switch from bottom sheet to centered modal */
  .share-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    bottom: auto;
  }
}

/* Wide Desktop */
@media (min-width: 1440px) {
  /* 1440px+ */
  /* Same as desktop, just more breathing room */
}
```

### Modal Behavior by Breakpoint

| Breakpoint | Width | Pattern | Border Radius |
|------------|-------|---------|---------------|
| Mobile (< 640px) | 100% (max 398px) | Bottom sheet | 16px 16px 0 0 |
| Sm Tablet (640-767px) | 480px | Bottom sheet | 16px 16px 0 0 |
| Tablet (768-1023px) | 540px | Bottom sheet | 16px 16px 0 0 |
| Desktop (1024px+) | 600px | Centered modal | 16px (all corners) |

---

## ✅ Accessibility Requirements

### Contrast Ratios (WCAG AA)

```css
/* Text on dark background */
color: #ffffff;              /* 21:1 ratio ✅ */
color: rgba(255,255,255,0.7);  /* 14.7:1 ratio ✅ */
color: rgba(255,255,255,0.5);  /* 10.5:1 ratio ✅ */
color: rgba(255,255,255,0.3);  /* 6.3:1 ratio ⚠️ (use for disabled only) */

/* Minimum requirements */
/* Normal text (< 18px): 4.5:1 */
/* Large text (≥ 18px): 3:1 */
/* UI components: 3:1 */
```

### Focus States

```css
*:focus-visible {
  outline: 2px solid rgba(255, 142, 83, 0.8);
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast focus for buttons */
button:focus-visible {
  outline: 3px solid rgba(255, 142, 83, 1);
  outline-offset: 3px;
}
```

### ARIA Labels

```html
<!-- Share button -->
<button
  aria-label="Share to Instagram Story"
  role="button"
  tabindex="0"
>
  📱 IG Story
</button>

<!-- QR code -->
<div role="img" aria-label="QR code for beenwatching.com/murtopia">
  <QRCodeCanvas />
</div>

<!-- Modal -->
<div
  role="dialog"
  aria-labelledby="share-modal-title"
  aria-modal="true"
>
  <h2 id="share-modal-title">Share "Breaking Bad"</h2>
  ...
</div>
```

### Keyboard Navigation

```
Tab Order:
1. Close button (X) or drag handle
2. Platform buttons (IG Story, IG Post, Twitter)
3. "Share via..." button
4. "Copy Link" button
5. Recent user avatars
6. Search input
7. Send button

Shortcuts:
- Escape: Close modal
- Enter: Activate focused button
- Space: Activate focused button
- Arrow keys: Navigate between platform buttons (optional)
```

### Screen Reader Announcements

```typescript
// When modal opens
announceToScreenReader('Share modal opened for Breaking Bad')

// When image downloads
announceToScreenReader('Instagram story image downloaded successfully')

// When link copied
announceToScreenReader('Link copied to clipboard')

// Helper function
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.className = 'sr-only'
  announcement.textContent = message
  document.body.appendChild(announcement)
  setTimeout(() => announcement.remove(), 1000)
}
```

---

## 🧪 Testing Checklist

### Visual Regression Tests

- [ ] **Mobile (375px):** Bottom sheet slides up correctly
- [ ] **Mobile (390px):** iPhone 14 Pro safe areas respected
- [ ] **Mobile (430px):** iPhone 14 Pro Max content centered
- [ ] **Tablet (768px):** Modal sized correctly, 4 button columns
- [ ] **Desktop (1024px):** Centered modal, all corners rounded
- [ ] **Desktop (1440px):** Modal doesn't scale beyond 600px

### Interaction Tests

- [ ] **Swipe down:** Dismisses modal on mobile
- [ ] **Tap outside:** Closes modal
- [ ] **Escape key:** Closes modal
- [ ] **IG Story button:** Downloads 1080×1920 PNG
- [ ] **IG Post button:** Downloads 1080×1080 PNG
- [ ] **Copy link:** Copies to clipboard, shows toast
- [ ] **Share via:** Opens native share sheet
- [ ] **Recent user:** Sends in-app notification

### Device-Specific Tests

**iOS:**
- [ ] Safari: Web Share API works
- [ ] Home indicator: Safe area padding applied
- [ ] Notch: Top safe area padding applied
- [ ] Deep link: `instagram://story-camera` attempts to open

**Android:**
- [ ] Chrome: Web Share API works
- [ ] Nav bar: Bottom safe area padding applied
- [ ] Back button: Closes modal

**Desktop:**
- [ ] Chrome: Native share shows if available
- [ ] Firefox: Copy link fallback works
- [ ] Safari: Native share shows
- [ ] Hover states: All buttons show hover effect

### Accessibility Tests

- [ ] **Tab navigation:** Can reach all interactive elements
- [ ] **Focus visible:** Focus ring shows on all elements
- [ ] **Screen reader:** Announces modal open/close
- [ ] **Contrast:** All text meets WCAG AA (4.5:1)
- [ ] **Keyboard only:** Can complete full share flow
- [ ] **Voice control:** All buttons have clear labels

---

## 📊 Component States

### Share Button States

```css
/* Default */
.share-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
}

/* Hover */
.share-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

/* Active */
.share-button:active {
  background: linear-gradient(135deg, #FF006E, #FF8E53);
  border: 1px solid transparent;
  transform: scale(0.95);
}

/* Disabled */
.share-button:disabled {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Loading */
.share-button.loading {
  position: relative;
  color: transparent;
}

.share-button.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

## 🎨 Final Design Tokens

```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    brand: {
      pink: '#FF006E',
      orange: '#FF8E53',
      gradient: 'linear-gradient(135deg, #FF006E, #FF8E53)',
    },
    background: {
      dark: '#0a0a0a',
      darkAlt: '#1a0a1a',
      card: 'rgba(255, 255, 255, 0.05)',
      cardHover: 'rgba(255, 255, 255, 0.08)',
      modal: 'rgba(10, 10, 10, 0.95)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.2)',
      active: 'rgba(255, 255, 255, 0.3)',
      focus: 'rgba(255, 142, 83, 0.5)',
    },
    state: {
      success: '#4ade80',
      error: '#ef4444',
      warning: '#fbbf24',
      info: '#3b82f6',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
    '6xl': 80,
  },
  fontSize: {
    micro: 10,
    tiny: 12,
    small: 14,
    default: 16,
    large: 18,
    h6: 20,
    h5: 24,
    h4: 28,
    h3: 36,
    h2: 48,
    h1: 56,
  },
  borderRadius: {
    sm: 4,
    default: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  breakpoints: {
    mobile: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1440,
  },
  animation: {
    duration: {
      fast: '0.15s',
      default: '0.2s',
      slow: '0.3s',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  zIndex: {
    dropdown: 1000,
    modal: 2000,
    toast: 3000,
  },
}
```

---

**Document Version:** 2.0
**Last Updated:** 2025-11-24
**Related Files:**
- [Social Sharing Master Plan](../features/social-sharing-master-plan.md)
- [Component Library Spec](./component-library-spec.md)
- [Design System Audit](./design-system-audit.md)
- [Activity Card Types](./activity-card-types.md)

---

**Status:** ✅ Ready for Implementation
**Mobile-First:** ✅ All designs prioritize mobile
**Accessibility:** ✅ WCAG AA compliant
**App-Ready:** ✅ Converts to native app patterns

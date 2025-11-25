# Social Sharing Master Plan - Been Watching

**Created:** 2025-11-23
**Updated:** 2025-11-24 (User Feedback Revision)
**Status:** Planning Phase → Ready for Implementation
**Owner:** Product Team

---

## 📋 Executive Summary

This document outlines a comprehensive **mobile-first social sharing system** for Been Watching, enabling users to share shows, activities, profiles, watchlists, and invite codes across multiple platforms with rich previews and tracking.

### Mobile-First Philosophy

Been Watching is designed as a **mobile-first web app** that will eventually convert to a native app. All sharing features prioritize:
- ✅ Mobile UX patterns (bottom sheets, touch-first)
- ✅ Native share integration (Web Share API)
- ✅ App-ready architecture (deep links, offline support)
- ✅ 398px card width consistency

### Hybrid Sharing Strategy

We use **TWO sharing approaches** based on context:

| Share Type | Approach | Why |
|------------|----------|-----|
| **Simple Links** (Invite codes, profile links) | Native Share Sheet | Quick, gets recent contacts, works everywhere |
| **Rich Content** (Shows, top 3, watchlists) | Custom Share Modal | Beautiful branded cards, platform-specific templates, full control |

### Goals
1. **Increase user acquisition** via viral sharing
2. **Boost engagement** through social validation
3. **Build brand awareness** with beautiful share cards
4. **Track sharing behavior** for growth insights

---

## 🎯 What Users Can Share

### 1. Shows & Movies (Activity Cards) - **CUSTOM MODAL**
**From:** Feed cards (back side), media detail modals
**Share Method:** Custom modal with platform-specific templates

**Share Options:**
- **Instagram Story** → Generates 9:16 card, downloads to device
- **Instagram Post** → Generates 1:1 square card, downloads to device
- **Twitter/X** → Opens web intent with preview URL
- **Recent BW Users** → Quick-share to friends on Been Watching (in-app notification)
- **Share via...** → Opens native share sheet (SMS, email, etc.)
- **Copy Link** → Copies URL with UTM tracking

**Example Share:**
```
Just watched Breaking Bad and I'm obsessed! 🎬
Check it out on Been Watching
[Dynamic preview card with poster, rating, user comment]
https://beenwatching.com/show/1396?shared_by=murtopia
```

**Preview Card Includes:**
- Show poster (vertical orientation)
- Show title + year
- User's rating (❤️ Love / 👍 Like / 😐 Meh)
- User's comment (if any)
- "Shared by @username" with avatar
- Been Watching branding + gradient
- QR code (bottom corner) → **Links to:** `beenwatching.com/show/[id]?shared_by=[username]`

---

### 2. User Profiles - **HYBRID**
**From:** Profile page, user header
**Share Method:** Simple link → Native sheet, OR custom modal for rich card

**Simple Share (Native Sheet):**
- Text + URL
- "Check out my Been Watching profile to see what I've been watching!"
- Gets recent SMS contacts automatically

**Rich Share (Custom Modal):**
- Profile card download (image)
- QR code for in-person sharing
- Instagram Story/Post templates

**Profile Card Includes:**
- User avatar (large, circular)
- Display name + @username
- Top 3 shows (thumbnails)
- Total shows watched
- Followers/following count
- QR code (bottom corner) → **Links to:** `beenwatching.com/[username]`
- Been Watching branding

**Private Profile Handling:**
When sharing a private profile, the share card and link destination still work but show limited info:
- ✅ Username, avatar, bio (public info)
- ✅ Total shows in watchlists (count only)
- ❌ Top 3 shows (hidden - shows placeholder or "Private Account")
- ❌ Activity feed (hidden)
- ❌ Full watchlist details (hidden)
- **Call to Action:** "Follow @username to see what they're watching"

---

### 3. Invite Codes - **NATIVE SHEET** ✅ Already Implemented
**From:** Profile → Invite Section
**Current Implementation:** Working via Web Share API
**Share Method:** Native share sheet only

**Keep as-is because:**
- Simple text + URL
- Gets recent contacts for free
- Quick and easy
- No need for custom UI

**Potential Enhancements:**
- Add Instagram Story template option (custom modal)
- Add QR code to invite card
- Track which platform users share to (capture share method)

---

### 4. Top 3 Shows - **CUSTOM MODAL**
**From:** Profile page
**Share Method:** Custom modal with multi-poster templates

**Share Options:**
- Instagram Story (3-panel vertical, swipeable)
- Instagram Post (carousel - 3 images)
- Twitter/X (single card with 3 posters side-by-side)
- Share via... (native sheet)
- Copy link

**Example Share:**
```
My Top 3 Shows Right Now:
1. Breaking Bad ⭐⭐⭐⭐⭐
2. The Bear ⭐⭐⭐⭐⭐
3. Succession ⭐⭐⭐⭐⭐

See my full profile on Been Watching
https://beenwatching.com/murtopia/top-shows
```

**Preview Card (Single Image):**
- 3 show posters side by side (equal width)
- User avatar (top center)
- "Top 3 Shows" heading
- Star ratings under each poster
- Been Watching branding (bottom)
- QR code (bottom corner) → **Links to:** `beenwatching.com/[username]/top-shows`

---

### 5. Watchlists - **CUSTOM MODAL**
**From:** Profile → Watch Status tabs
**Share Method:** Custom modal with grid layout

**Lists to Share:**
- Want to Watch
- Currently Watching
- Watched

**Example Share:**
```
My Want to Watch List (12 shows):
[Grid of 6 posters + "...and 6 more"]
https://beenwatching.com/murtopia/want-to-watch
```

**Preview Card:**
- Grid layout: 2×3 (6 posters)
- If >6 items: "+X more" overlay on 6th poster
- List title at top
- User info (avatar + username)
- Been Watching branding
- QR code (bottom corner) → **Links to:** `beenwatching.com/[username]/[list-type]`
  - Example: `beenwatching.com/murtopia/want-to-watch`

**Truncation Rules:**
- Show first 6 items in preview card
- Full list available at link
- Link goes to profile with list pre-opened

---

### 6. Year-End Recaps (Future) - **CUSTOM MODAL**
**From:** Profile → Recaps
**Share Method:** Multi-slide Instagram Story + standard options

**Includes:**
- Total shows watched
- Total hours watched
- Top genre
- Most active month
- Favorite show of the year
- Social stats (comments given, likes received)

**Inspiration:** Spotify Wrapped, Strava Year in Sport

---

### 7. Achievements & Milestones (Future) - **CUSTOM MODAL**

**Milestone Examples:**
- "Just watched my 100th show!"
- "Completed entire Breaking Bad series (5 seasons)"
- "5-star streak: Rated 10 shows 5 stars in a row"
- "Social butterfly: Followed 50 friends"
- "Binge Master: Watched 10 episodes in one day"
- "Critic: Left 50 comments on shows"

#### Auto-Prompt Share Dialog

**When:** System detects user completed a milestone

**Trigger Examples:**
- User marks final episode of a show as "Watched"
- User hits 25th, 50th, 100th show milestone
- User completes all seasons of a multi-season show
- User achieves rating streak

**Prompt Dialog (Toast Notification):**
```
┌─────────────────────────────────────────┐
│  🎉 Achievement Unlocked!               │
│                                         │
│  You just finished Breaking Bad S5!     │
│                                         │
│  [ Share with Friends ]  [ Not Now ]    │
└─────────────────────────────────────────┘
```

**If User Clicks "Share with Friends":**
→ Opens share modal with pre-generated achievement card
→ Card includes: Show poster, season badge, completion date, "Shared by @username"
→ QR code → **Links to:** `beenwatching.com/achievement/[id]?user=[username]`

**Analytics Tracking:**
```typescript
// Track prompt display
trackEvent('achievement_share_prompted', {
  achievement_type: 'season_completed',
  show_id: 'tv-1396',
  season_number: 5,
  user_id: currentUser.id
})

// Track user response
trackEvent('achievement_share_accepted', { ... })  // If they share
trackEvent('achievement_share_dismissed', { ... }) // If they click "Not Now"
```

**Prompt Frequency Rules:**
- Maximum 1 prompt per hour (avoid spam)
- Maximum 3 prompts per day
- User can disable prompts in settings: "Share Reminders"
- Never prompt if user has "Do Not Disturb" mode active

---

## 📱 Share UI/UX Flow (Mobile-First)

### Decision Tree: Which Share Method?

```
User clicks Share icon
    ↓
Is it simple content? (invite code, profile link, basic text)
    ↓ YES
    Use NATIVE SHARE SHEET
    - Quick
    - Gets recent contacts
    - Text + URL only
    ↓ NO (rich content: show, top 3, watchlist)
    Use CUSTOM SHARE MODAL
    - Platform-specific templates
    - Image generation
    - Full control
```

---

### Flow 1: Rich Content Share (Custom Modal)

**Mobile (Primary Experience):**

#### Step 1: User Clicks Share Icon
```
User taps share icon on:
- Activity card (back side)
- Media detail modal
- Profile page "Share Profile" button
- Top 3 section
- Watchlist
```

#### Step 2: Bottom Sheet Slides Up
```
┌─────────────────────────────────┐
│ ═══ (Swipe down to dismiss)    │ ← Drag handle
├─────────────────────────────────┤
│ Share "Breaking Bad"            │
│                                 │
│ Preview:                        │
│ ┌─────────────────────────────┐ │
│ │ ╔════╗  Breaking Bad        │ │
│ │ ║IMG ║  ⭐ Loved             │ │
│ │ ╚════╝  "Incredible show!"  │ │
│ │         @murtopia           │ │
│ └─────────────────────────────┘ │
│                                 │
│ Share to:                       │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │  📱  │ │  📱  │ │  🐦  │     │
│ │ IG   │ │ IG   │ │Twitter│    │
│ │Story │ │Post  │ │      │     │
│ └──────┘ └──────┘ └──────┘     │
│                                 │
│ ┌──────────────────────────┐   │
│ │  📤  Share via...        │   │ ← Opens native sheet
│ └──────────────────────────┘   │
│                                 │
│ ┌──────────────────────────┐   │
│ │  📋  Copy Link           │   │
│ └──────────────────────────┘   │
│                                 │
│ ──── or share with friend ──   │
│                                 │
│ Recent BW Users:                │
│ [👤] @alex  [👤] @sam           │
│                                 │
│ [🔍 Search all users...]        │
│                                 │
└─────────────────────────────────┘
```

**Styling (Mobile):**
- Slides up from bottom (native app pattern)
- Max width: 398px (matches card width)
- Centered on screen
- Background: `rgba(10, 10, 10, 0.95)` with `backdrop-filter: blur(20px)`
- Border radius: `16px 16px 0 0` (rounded top only)
- Drag handle: 40px wide × 4px tall gray bar
- Padding: `20px`
- Safe area: Respects iOS notch/home indicator

**Touch Targets:**
- All buttons: Minimum 44×44px
- Share platform buttons: 80px × 80px
- "Share via..." button: Full width, 56px height
- Recent users: 60px circles

#### Step 3: Platform-Specific Actions

**If user taps "Instagram Story":**
```
1. Generate 9:16 image (1080×1920) with Canvas API
2. Download image to device
3. Show success message:
   ┌─────────────────────────────┐
   │ ✓ Image saved!              │
   │                             │
   │ Open Instagram and:         │
   │ 1. Tap Story camera         │
   │ 2. Select from Camera Roll  │
   │ 3. Find "Breaking Bad" card │
   │                             │
   │ [Open Instagram] [Done]     │
   └─────────────────────────────┘
4. "Open Instagram" tries deep link: instagram://story-camera
5. Track event: content_shared (method: instagram_story)
```

**If user taps "Instagram Post":**
```
Same flow as Story, but generates 1:1 square (1080×1080)
```

**If user taps "Twitter":**
```
1. Open Twitter web intent in new tab:
   https://twitter.com/intent/tweet?text={text}&url={url}
2. Track event: content_shared (method: twitter)
3. Close modal
```

**If user taps "Share via...":**
```
1. Call navigator.share() with text + URL
2. Native share sheet appears
3. User sees recent SMS contacts, email, etc.
4. Track event: content_shared (method: native_sheet)
```

**If user taps "Copy Link":**
```
1. Copy URL to clipboard (with UTM tracking)
2. Show success feedback:
   [📋 Copied!] (2 second toast)
3. Track event: content_shared (method: copy_link)
```

**If user taps Recent BW User:**
```
1. Send in-app notification to that user
2. Notification type: 'content_shared'
3. Show success:
   [✓ Shared with @alex] (2 second toast)
4. Track event: content_shared (method: in_app, recipient_id: alex)
```

#### Step 4: Dismiss Modal
```
User can:
- Swipe down (drag handle)
- Tap outside modal (backdrop)
- Tap "Done" button
```

---

### Flow 2: Simple Share (Native Sheet)

**Mobile (Primary Experience):**

#### User Clicks Share Icon
```
User taps share on:
- Profile "Share my profile" button
- Invite code "Share" button
```

#### Native Share Sheet Opens Immediately
```
No custom modal!
Goes straight to OS share sheet.

Shows:
- Recent SMS contacts (OS provides)
- Installed apps (Messages, Mail, etc.)
- Copy, AirDrop, etc.
```

**Code:**
```typescript
const handleSimpleShare = async () => {
  if (navigator.share) {
    await navigator.share({
      title: 'Join me on Been Watching',
      text: shareMessage,
      url: shareUrl,
    })
  } else {
    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(`${shareMessage} ${shareUrl}`)
  }
}
```

---

## 🖼️ Social Card Generation (Open Graph)

### Image Generation Strategy

**For Instagram/Twitter Templates (Client-Side):**

Use **HTML5 Canvas API** to generate images in-browser:

**Why Canvas API:**
- ✅ Works offline (future app support)
- ✅ Generates images instantly on device
- ✅ No server/API calls needed
- ✅ User can download immediately
- ✅ Full control over fonts, images, layout

**Technology:**
```typescript
// lib/share-card-generator.ts
import { createCanvas, loadImage } from 'canvas-api-wrapper'

export async function generateInstagramStoryCard(data: {
  posterUrl: string
  title: string
  rating: string
  comment: string
  username: string
  avatarUrl: string
}): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')!

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, 1920)
  gradient.addColorStop(0, '#0a0a0a')
  gradient.addColorStop(1, '#1a0a1a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1920)

  // Draw logo
  // Draw poster
  // Draw text elements
  // Draw user info
  // Draw QR code

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}
```

**Download Flow:**
```typescript
const handleShareToInstagramStory = async () => {
  // Generate image
  const imageBlob = await generateInstagramStoryCard(shareData)

  // Create download link
  const url = URL.createObjectURL(imageBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `beenwatching-${showTitle}-story.png`
  a.click()

  // Show instructions
  setShowInstagramInstructions(true)

  // Track event
  trackContentShared({
    contentType: 'show',
    contentId: showId,
    shareMethod: 'instagram_story',
  })
}
```

---

### For Link Previews (Open Graph) - Server-Side

Use **Vercel OG Image** for URL previews:

**Why Vercel OG:**
- ✅ Built into Next.js
- ✅ Edge function (fast)
- ✅ CDN cached
- ✅ Only generated when link shared (not on every visit)

**Implementation:**
```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'show', 'profile', 'top3'
  const id = searchParams.get('id')
  const sharedBy = searchParams.get('shared_by')

  // Fetch data
  const data = await fetchDataForOG(type, id, sharedBy)

  // Render card
  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #0a0a0a, #1a0a1a)',
        // ... more styling
      }}>
        {/* Render show poster, title, user info, etc. */}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

**Used For:**
- SMS preview bubbles
- WhatsApp link previews
- Twitter/X cards (when shared via URL)
- Facebook/LinkedIn previews
- Email clients

---

### Open Graph Meta Tags

**Dynamic Metadata per Page:**

```typescript
// app/show/[id]/page.tsx
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ shared_by?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { shared_by } = await searchParams

  const show = await fetchShowDetails(id)
  const sharer = shared_by ? await fetchUser(shared_by) : null

  const title = sharer
    ? `${sharer.display_name} shared ${show.title} on Been Watching`
    : `${show.title} on Been Watching`

  const description = sharer
    ? `${sharer.display_name} (@${sharer.username}) is watching ${show.title}. See what they're watching!`
    : `${show.title} (${show.year}) - ${show.overview}`

  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og?type=show&id=${id}${shared_by ? `&shared_by=${shared_by}` : ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.tv_show',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/show/${id}?shared_by=${shared_by}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: sharer ? `@${sharer.username}` : '@beenwatching',
    },
  }
}
```

---

## 📍 Navigation & Routing Strategy

### New Routes Required

#### Standalone Share Pages
```
/show/[id]                    → Show detail page with OG tags
/show/[id]?shared_by=username → Personalized OG (shows who shared)
/profile/[username]/top-shows → Top 3 shows standalone page
/profile/[username]/watching  → Currently Watching list
/profile/[username]/watched   → Watched list
/profile/[username]/want      → Want to Watch list
/recap/[year]/[username]      → Year-end recap (future)
/achievement/[id]             → Achievement share page (future)
```

#### API Routes
```
/api/og                       → Open Graph image generation (Vercel OG)
/api/share                    → Track share events (analytics)
/api/share/notification       → Send in-app share notification
```

### Handling Incoming Shares

**User Flow:**
1. User clicks shared link (e.g., from SMS): `beenwatching.com/show/1396?shared_by=murtopia`
2. Page loads with personalized OG tags (for link preview)
3. If not logged in: Show preview + "Sign up to see more" CTA
4. If logged in: Open media detail modal OR standalone page
5. Track share attribution: `share_link_clicked` event

**Modal vs Page Decision:**
```typescript
// app/show/[id]/page.tsx
useEffect(() => {
  const isDirectLink = document.referrer === '' || !document.referrer.includes('beenwatching.com')

  if (isDirectLink) {
    // User came from external link (SMS, Twitter, etc.)
    // Show standalone page with full SEO
    setViewMode('page')
  } else {
    // User navigated from within app
    // Show modal overlay (better UX)
    setViewMode('modal')
  }
}, [])
```

---

## 🔔 In-App Share Notifications

### Notification Type: `content_shared`

**Notification Payload:**
```typescript
{
  type: 'content_shared',
  actor: {
    username: 'murtopia',
    display_name: 'Nick',
    avatar_url: 'https://...'
  },
  target_type: 'show', // or 'profile', 'list', 'top3'
  target_id: 'tv-1396',
  metadata: {
    title: 'Breaking Bad',
    poster_url: 'https://...',
    message: 'Check this out!' // Optional personal message from sharer
  },
  created_at: '2025-11-24T10:30:00Z'
}
```

**Notification UI (In Dropdown):**
```
┌─────────────────────────────────────┐
│ [👤] @murtopia shared a show       │
│      with you                       │
│      2 min ago                      │
│                                     │
│      ╔════╗  Breaking Bad           │
│      ║IMG ║  "Check this out!"      │
│      ╚════╝                         │
│                                     │
│      [View Show]     [Dismiss]      │
└─────────────────────────────────────┘
```

**Clicking Notification:**
- Opens media detail modal
- Marks notification as read (after 3 seconds)
- Tracks event: `share_notification_clicked`

**Database Function:**
```sql
-- supabase/functions/send_share_notification.sql
CREATE OR REPLACE FUNCTION send_share_notification(
  sender_user_id UUID,
  recipient_user_id UUID,
  content_type TEXT,
  content_id TEXT,
  content_title TEXT,
  content_poster_url TEXT,
  personal_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    actor_id,
    target_type,
    target_id,
    metadata,
    read,
    created_at
  ) VALUES (
    recipient_user_id,
    'content_shared',
    sender_user_id,
    content_type,
    content_id,
    jsonb_build_object(
      'title', content_title,
      'poster_url', content_poster_url,
      'message', personal_message
    ),
    FALSE,
    NOW()
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Analytics & Tracking

### Share Events to Track

**Event 1: `content_shared`**
```typescript
{
  event: 'content_shared',
  properties: {
    content_type: 'show' | 'profile' | 'list' | 'top3' | 'invite',
    content_id: string,
    content_title: string,
    share_method:
      'instagram_story' | 'instagram_post' | 'twitter' |
      'native_sheet' | 'copy_link' | 'in_app',
    share_destination: 'external' | 'in_app',
    recipient_user_id?: string, // For in-app shares only
    utm_source: 'share',
    utm_medium: string,
  }
}
```

**Event 2: `share_link_clicked`**
```typescript
{
  event: 'share_link_clicked',
  properties: {
    content_type: string,
    content_id: string,
    shared_by_user_id: string,
    utm_source: string,
    utm_medium: string,
    referrer: string, // Where they came from
    is_logged_in: boolean,
  }
}
```

**Event 3: `share_notification_received`**
```typescript
{
  event: 'share_notification_received',
  properties: {
    sender_user_id: string,
    content_type: string,
    content_id: string,
  }
}
```

**Event 4: `share_notification_clicked`**
```typescript
{
  event: 'share_notification_clicked',
  properties: {
    notification_id: string,
    sender_user_id: string,
    content_type: string,
    action_taken: 'view_content' | 'dismiss',
  }
}
```

**Event 5: `instagram_card_downloaded`**
```typescript
{
  event: 'instagram_card_downloaded',
  properties: {
    content_type: string,
    content_id: string,
    template_type: 'story' | 'post',
    image_size: string, // '1080x1920' or '1080x1080'
  }
}
```

### Attribution Tracking

**Share Link Format:**
```
https://beenwatching.com/show/1396
  ?shared_by=murtopia
  &utm_source=share
  &utm_medium=instagram_story
  &utm_campaign=organic_share
```

**UTM Parameter Mapping:**
| Share Method | utm_medium | utm_source |
|-------------|------------|------------|
| Instagram Story | `instagram_story` | `share` |
| Instagram Post | `instagram_post` | `share` |
| Twitter | `twitter` | `share` |
| Native Sheet | `native_share` | `share` |
| Copy Link | `copy_link` | `share` |
| In-App | `in_app` | `share` |

**Database Schema (New Table):**
```sql
CREATE TABLE share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sharer_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  share_method TEXT NOT NULL,
  recipient_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Attribution
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  clicked_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  conversion_type TEXT, -- 'signup', 'follow', 'rate_show', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_share_events_sharer ON share_events(sharer_user_id);
CREATE INDEX idx_share_events_content ON share_events(content_type, content_id);
CREATE INDEX idx_share_events_method ON share_events(share_method);
CREATE INDEX idx_share_events_created ON share_events(created_at DESC);
```

---

## 🎁 QR Code Implementation

### Use Cases
1. Share profile in person (meetups, events)
2. Share invite code (print on merch, posters)
3. Share specific show recommendation face-to-face

### Technology
**Library:** `qrcode.react`

**Installation:**
```bash
npm install qrcode.react
```

**Component:**
```tsx
// components/sharing/QRCodeDisplay.tsx
import { QRCodeCanvas } from 'qrcode.react'

interface QRCodeDisplayProps {
  url: string
  size?: number
  showLogo?: boolean
}

export function QRCodeDisplay({
  url,
  size = 200,
  showLogo = true
}: QRCodeDisplayProps) {
  return (
    <QRCodeCanvas
      value={url}
      size={size}
      level="H" // High error correction (can embed logo)
      includeMargin={true}
      imageSettings={showLogo ? {
        src: '/logo-icon.png',
        height: size * 0.2,
        width: size * 0.2,
        excavate: true, // Removes QR dots behind logo
      } : undefined}
    />
  )
}
```

**QR Code Modal (Mobile):**
```
┌─────────────────────────────┐
│ ═══                         │ ← Drag handle
├─────────────────────────────┤
│ Share Profile               │
│                             │
│ Scan to View Profile        │
│                             │
│    ┌──────────────┐         │
│    │              │         │
│    │   QR CODE    │         │
│    │   [BW LOGO]  │         │
│    │              │         │
│    └──────────────┘         │
│                             │
│ @murtopia                   │
│ beenwatching.com/murtopia   │
│                             │
│ [Download QR]  [Share QR]   │
└─────────────────────────────┘
```

**Download QR Code:**
```typescript
const handleDownloadQR = () => {
  const canvas = document.querySelector('canvas')!
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob!)
    const a = document.createElement('a')
    a.href = url
    a.download = `beenwatching-${username}-qr.png`
    a.click()
  })
}
```

---

## 📧 Email & SMS Sharing

### SMS Sharing (via Native Sheet)

**Web Share API (Mobile):**
```typescript
if (navigator.share) {
  await navigator.share({
    title: 'Breaking Bad on Been Watching',
    text: 'Just watched Breaking Bad and loved it! Check it out:',
    url: shareUrl,
  })
  // Native sheet shows recent SMS contacts
}
```

**Fallback (Desktop/Unsupported):**
```typescript
const message = `Just watched Breaking Bad and loved it! Check it out: ${shareUrl}`
await navigator.clipboard.writeText(message)
showToast('Message copied! Paste into your SMS app')
```

### Email Sharing

**Option 1: Mailto Link (Simple)**
```typescript
const subject = encodeURIComponent('Check out Breaking Bad on Been Watching')
const body = encodeURIComponent(`
Hi!

I just watched Breaking Bad and thought you'd love it!

${shareUrl}

Join me on Been Watching to see what I'm watching.

- ${userName}
`)

window.location.href = `mailto:?subject=${subject}&body=${body}`
```

**Option 2: Resend API (Rich HTML - Future)**
```typescript
// app/api/share/email/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'shares@beenwatching.com',
  to: recipientEmail,
  subject: `${userName} shared ${showTitle} with you`,
  html: ShareEmailTemplate({ show, userName, shareUrl }),
})
```

---

## 🏗️ Component Architecture

### New Components to Build

#### 1. `ShareModal` (Mobile Bottom Sheet)
```tsx
// components/sharing/ShareModal.tsx
interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: 'show' | 'profile' | 'list' | 'top3'
  contentId: string
  contentData: {
    title: string
    imageUrl: string
    description?: string
  }
}

export function ShareModal({ isOpen, onClose, contentType, contentData }: ShareModalProps) {
  // Mobile: Slides up from bottom
  // Desktop: Centered modal
  // Handles all share methods
}
```

#### 2. `ShareButton`
```tsx
// components/sharing/ShareButton.tsx
interface ShareButtonProps {
  contentType: string
  contentId: string
  contentData: any
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
  // Decides: Simple (native sheet) vs Rich (custom modal)
}
```

#### 3. `InstagramStoryGenerator`
```tsx
// components/sharing/InstagramStoryGenerator.tsx
interface InstagramStoryGeneratorProps {
  showData: {
    posterUrl: string
    title: string
    rating: string
    comment: string
  }
  userData: {
    username: string
    avatar: string
  }
}

export async function generateInstagramStoryImage(props): Promise<Blob> {
  // Canvas API generation
  // Returns downloadable image blob
}
```

#### 4. `QRCodeModal`
```tsx
// components/sharing/QRCodeModal.tsx
interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
  subtitle?: string
}
```

#### 5. `RecentBWUsers`
```tsx
// components/sharing/RecentBWUsers.tsx
// Shows users they've recently shared with on BW
// Quick-share to BW friends
```

---

## 🎯 Feature Prioritization (Revised)

### Phase 1: Foundation (Week 1-2)
**Goal:** Basic sharing with native sheet + custom modal foundation

**Tasks:**
1. ✅ Create ShareButton component (decides native vs custom)
2. ✅ Create ShareModal component (mobile bottom sheet)
3. ✅ Implement native share sheet for simple content
4. ✅ Add share tracking (analytics + database)
5. ✅ Add Open Graph meta tags to show/profile pages
6. ✅ Create /api/og route for link previews (Vercel OG)
7. ✅ Add share button to UserActivityCard (back side)
8. ✅ Test share links with preview in iMessage, WhatsApp

**Deliverable:** Users can share shows via native sheet + custom modal appears

---

### Phase 2: Instagram Templates (Week 3-4)
**Goal:** Beautiful Instagram Story/Post cards

**Tasks:**
1. ✅ Build Canvas-based card generator
2. ✅ Instagram Story template (9:16 - 1080×1920)
3. ✅ Instagram Post template (1:1 - 1080×1080)
4. ✅ Download to device functionality
5. ✅ "Open Instagram" deep link (try, fallback to instructions)
6. ✅ Track downloads: `instagram_card_downloaded` event
7. ✅ Test on iOS/Android devices

**Deliverable:** Beautiful Instagram share cards download to device

---

### Phase 3: In-App Sharing (Week 5-6)
**Goal:** Share content with BW users directly

**Tasks:**
1. ✅ Recent BW Users component (show in modal)
2. ✅ User search in ShareModal
3. ✅ Send share notification via database function
4. ✅ Handle `content_shared` notification type in NotificationDropdown
5. ✅ Share notification UI (with "View Show" action)
6. ✅ Track in-app share engagement
7. ✅ Personal message option (optional text field)

**Deliverable:** Users can recommend shows to BW friends with in-app notifications

---

### Phase 4: QR Codes & Advanced (Week 7-8)
**Goal:** QR codes, Top 3, watchlists, profile sharing

**Tasks:**
1. ✅ QR code generator component
2. ✅ QR code modal (download, share)
3. ✅ Add QR to profile page (toggle visibility)
4. ✅ Share Top 3 shows (multi-poster template)
5. ✅ Share watchlists (truncated preview, 6 shows max)
6. ✅ Profile share cards (avatar + top 3 + stats)
7. ✅ Twitter/X web intent integration

**Deliverable:** Complete sharing toolkit with QR codes

---

### Phase 5: Gamification (Future - Not Scoped)
**Goal:** Achievements, recaps, viral loops

**Tasks:**
1. Year-end recap generator (Spotify Wrapped style)
2. Milestone achievements (100th show, etc.)
3. Auto-prompt shares on achievements
4. Referral rewards system
5. Share leaderboard (most shared users)

**Deliverable:** Viral sharing mechanics for growth

---

## ⚠️ Edge Cases & Considerations

### Privacy
1. **Private Profiles:** Don't allow sharing if profile is private (show warning)
2. **Private Lists:** Option to make lists unshareable (profile settings)
3. **Share Permissions:** User can disable sharing entirely (privacy settings)

### Performance
1. **Canvas Generation:** Optimize image generation (< 500ms)
2. **OG Image Caching:** Cache generated OG images at CDN (24 hours)
3. **Rate Limiting:** Limit share API calls (20 per minute per user)
4. **Image Optimization:** Compress Canvas output (PNG → 80% quality)

### Accessibility
1. **Alt Text:** Always include on generated images
2. **Keyboard Navigation:** Share modal fully keyboard accessible
3. **Screen Readers:** ARIA labels on all share buttons
4. **Focus Management:** Trap focus in modal, return on close

### Mobile Considerations
1. **iOS Share Sheet:** Respects user's installed apps
2. **Android Share Intent:** Same behavior via Web Share API
3. **Deep Links:** `instagram://`, `twitter://` may not work on all devices
4. **Download Permissions:** Some browsers prompt for download permission
5. **Safe Areas:** Modal respects notch/home indicator on iOS

### Error Handling
1. **Failed Download:** Show retry button + error message
2. **Web Share Unavailable:** Fall back to copy link
3. **Canvas Errors:** Graceful fallback to simple share
4. **Network Issues:** Retry failed notification sends (3 attempts)

---

## 🧪 Testing Plan

### Manual Testing (Mobile-First)

**Mobile (iOS):**
- [ ] Native share sheet appears (simple shares)
- [ ] Custom modal slides up from bottom (rich shares)
- [ ] Swipe down to dismiss works
- [ ] Instagram Story downloads correctly
- [ ] Instagram Post downloads correctly
- [ ] Deep link to Instagram works (or shows instructions)
- [ ] Recent contacts appear in native sheet
- [ ] Recent BW users appear in custom modal
- [ ] QR code scans correctly
- [ ] Share links preview in iMessage with image

**Mobile (Android):**
- [ ] Native share intent appears
- [ ] Same tests as iOS

**Desktop:**
- [ ] Centered modal appears (not bottom sheet)
- [ ] Native share works (if supported by browser)
- [ ] Copy link fallback works
- [ ] Downloaded images open correctly

### Analytics Verification
- [ ] `content_shared` event fires with correct method
- [ ] `instagram_card_downloaded` tracks correctly
- [ ] `share_link_clicked` captures UTM parameters
- [ ] Share attribution links to correct user

### Performance Testing
- [ ] Canvas image generation < 500ms
- [ ] Modal opens < 200ms
- [ ] OG image generation < 500ms
- [ ] No memory leaks on repeated shares

---

## 📊 Success Metrics

### Key Metrics to Track
1. **Share Rate:** % of active users who share content (target: 15%)
2. **Viral Coefficient:** Average shares per user (target: 0.5)
3. **Click-Through Rate:** % of shared links clicked (target: 30%)
4. **Conversion Rate:** % of clicks that result in signup (target: 10%)
5. **Share Method Distribution:** Which methods are most popular
6. **Instagram Download Rate:** % who download IG cards (target: 50% of custom shares)
7. **In-App Share Rate:** % of shares sent to BW users (target: 20%)

### Dashboard Views (Admin)
- Total shares (all time, 7d, 30d)
- Share method breakdown (pie chart)
- Most shared shows (leaderboard)
- Most shared users (leaderboard)
- Share funnel: Share → Download/Send → Click → Signup
- Share attribution: Which users drive most signups

---

## 🚀 Launch Strategy

### Soft Launch (Internal Testing)
1. Enable sharing for admin accounts only
2. Test all share methods on iOS/Android/Desktop
3. Verify analytics tracking in PostHog
4. Fix bugs and edge cases
5. Gather feedback from team

### Beta Launch (Alpha Users)
1. Enable for all current users
2. Add in-app announcement about new sharing
3. Add share prompt after first 5-star rating
4. Monitor analytics for 1 week
5. Iterate based on user behavior

### Public Launch
1. Announce via email + in-app notification
2. Create share tutorial for first-time users
3. Add share prompts to key moments:
   - After rating 5 stars
   - After adding 10th show
   - After completing profile
4. Monitor viral growth metrics
5. Run A/B tests on share messaging

---

## 📝 Open Questions & Future Considerations

### Technical Questions
1. **Offline support:** Should Canvas generation work offline? (Yes for future app)
2. **Image caching:** Cache generated images locally? (Storage considerations)
3. **Share queue:** Queue failed in-app shares for retry? (Network reliability)

### Product Questions
1. **Share limits:** Prevent spam with rate limits? (20/hour seems reasonable)
2. **Private notes:** Allow sharing private notes? (Probably no)
3. **Share rewards:** Badge for sharing? (Gamification potential)
4. **Watermark:** Add subtle BW logo to all cards? (Brand awareness)

### Platform Questions
1. **TikTok support:** Add TikTok share option? (Younger audience)
2. **LinkedIn:** For professional TV content? (Documentaries, etc.)
3. **Discord/Slack:** Gaming/community servers? (API integration needed)
4. **Pinterest:** Visual discovery platform? (Poster-heavy)

---

## 🔗 Related Documents

- [Visual Design Specifications](../../design/social-sharing-visual-specs.md) - Pixel-perfect mockups
- [Invite System](./invite-system.md) - Current invite sharing (native sheet)
- [Analytics (PostHog)](./analytics-posthog.md) - Event tracking setup
- [Feed System](./feed-system.md) - Activity cards architecture
- [Notification System](../../architecture/notifications.md) - In-app notifications

---

## 💬 Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-23 | Initial draft (desktop-first) |
| 2.0 | 2025-11-24 | **Major revision:** Mobile-first, hybrid strategy, Canvas API, native sheet integration |

---

**Document Version:** 2.0
**Last Updated:** 2025-11-24
**Status:** Ready for Phase 1 Implementation
**Primary Author:** Claude (AI Assistant)
**Approved By:** Nick (Product Owner)

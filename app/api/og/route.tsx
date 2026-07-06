import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

/**
 * Open Graph image generator (1200x630).
 *
 * Real Supabase data, styled to match the activity-card aesthetic:
 * dark gradient, gold outline, big cover art, no emoji.
 *
 * ?type=show&id={mediaId}
 * ?type=profile&id={username}
 * ?type=list&id={username}&list={want|watching|watched}
 * (anything else renders the default branded card)
 */

const GOLD = '#FFC125'
const BG = 'linear-gradient(180deg, #16161c 0%, #0c0c10 100%)'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function splitTitleSeason(title: string, seasonNumber?: number | null): { base: string; season: number | null } {
  const match = title.match(/^(.*?)\s*[-\u2013]\s*Season\s+(\d+)$/i)
  if (match) return { base: match[1], season: seasonNumber ?? parseInt(match[2]) }
  return { base: title, season: seasonNumber ?? null }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (type === 'show' && id) {
      const card = await buildShowCard(id)
      if (card) return card
    } else if (type === 'profile' && id) {
      const card = await buildProfileCard(id)
      if (card) return card
    } else if (type === 'list' && id) {
      const card = await buildListCard(id, searchParams.get('list'))
      if (card) return card
    }

    return await defaultCard()
  } catch (e: any) {
    console.log(`Error generating OG image: ${e.message}`)
    return brandedCard()
  }
}

// ============================================================
// Shared frame
// ============================================================

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: BG,
        fontFamily: FONT,
        padding: '28px',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          border: `3px solid ${GOLD}`,
          borderRadius: '28px',
          padding: '36px 44px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: size,
        fontWeight: 700,
        color: GOLD,
        letterSpacing: '6px',
      }}
    >
      BEEN WATCHING
    </div>
  )
}

// ============================================================
// Show card
// ============================================================

async function buildShowCard(mediaId: string) {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: media } = await supabase
    .from('media')
    .select('id, title, poster_path, overview, release_date, tmdb_data')
    .eq('id', mediaId)
    .maybeSingle()

  if (!media) return null

  const tmdbData = media.tmdb_data || {}
  const { base, season } = splitTitleSeason(media.title, tmdbData.season_number)
  const year = media.release_date?.substring(0, 4)
  const genres = (tmdbData.genres || []).slice(0, 3).map((g: any) => g.name).join(', ')
  const posterUrl = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null
  const overview = media.overview
    ? media.overview.length > 180 ? `${media.overview.slice(0, 177)}...` : media.overview
    : null

  return new ImageResponse(
    (
      <Frame>
        {posterUrl && (
          <img
            src={posterUrl}
            width={340}
            height={510}
            style={{
              borderRadius: '20px',
              objectFit: 'cover',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: posterUrl ? '48px' : '0',
            flex: 1,
          }}
        >
          <Wordmark />

          <div
            style={{
              display: 'flex',
              fontSize: 58,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              marginTop: '28px',
              flexWrap: 'wrap',
            }}
          >
            <span>{base}</span>
            {season != null && (
              <span style={{ color: GOLD, marginLeft: '16px' }}>{`S${season}`}</span>
            )}
          </div>

          {(year || genres) && (
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                color: 'rgba(255,255,255,0.65)',
                marginTop: '16px',
              }}
            >
              {[year, genres].filter(Boolean).join(' \u2022 ')}
            </div>
          )}

          {overview && (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.8)',
                marginTop: '24px',
              }}
            >
              {overview}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: 'rgba(255,255,255,0.45)',
              marginTop: '32px',
            }}
          >
            beenwatching.com
          </div>
        </div>
      </Frame>
    ),
    { width: 1200, height: 630 }
  )
}

// ============================================================
// Profile card
// ============================================================

async function buildProfileCard(username: string) {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, top_show_1, top_show_2, top_show_3')
    .ilike('username', username)
    .maybeSingle()

  if (!profile) return null

  const { count: watchedCount } = await supabase
    .from('watch_status')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('status', 'watched')

  const topShows = [profile.top_show_1, profile.top_show_2, profile.top_show_3]
    .filter((s: any) => s?.poster_path)
    .map((s: any) => `https://image.tmdb.org/t/p/w342${s.poster_path}`)

  const displayName = profile.display_name || profile.username

  return new ImageResponse(
    (
      <Frame>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <Wordmark />

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '32px' }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                width={120}
                height={120}
                style={{
                  borderRadius: '60px',
                  border: `3px solid ${GOLD}`,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '60px',
                  border: `3px solid ${GOLD}`,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 52,
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {profile.username[0]?.toUpperCase()}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '28px' }}>
              <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, color: 'white' }}>
                {displayName}
              </div>
              <div style={{ display: 'flex', fontSize: 28, color: GOLD, marginTop: '4px' }}>
                @{profile.username}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: 'rgba(255,255,255,0.65)',
                  marginTop: '12px',
                }}
              >
                {`${watchedCount ?? 0} shows watched`}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: 'rgba(255,255,255,0.45)',
              marginTop: '36px',
            }}
          >
            beenwatching.com
          </div>
        </div>

        {topShows.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {topShows.map((url, i) => (
              <img
                key={i}
                src={url}
                width={170}
                height={255}
                style={{
                  borderRadius: '14px',
                  objectFit: 'cover',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </Frame>
    ),
    { width: 1200, height: 630 }
  )
}

// ============================================================
// List card
// ============================================================

const LIST_HEADLINES: Record<string, string> = {
  want: 'wants to watch',
  watching: 'is currently watching',
  watched: 'has been watching',
}

async function buildListCard(username: string, listTab: string | null) {
  const supabase = getSupabase()
  if (!supabase) return null

  const tab = listTab && LIST_HEADLINES[listTab] ? listTab : 'watching'

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .ilike('username', username)
    .maybeSingle()

  if (!profile) return null

  const { data: items, count } = await supabase
    .from('watch_status')
    .select('media:media_id (poster_path)', { count: 'exact' })
    .eq('user_id', profile.id)
    .eq('status', tab)
    .order('updated_at', { ascending: false })
    .limit(5)

  const posters = (items || [])
    .map((row: any) => row.media?.poster_path)
    .filter(Boolean)
    .map((p: string) => `https://image.tmdb.org/t/p/w342${p}`)

  const displayName = profile.display_name || profile.username

  return new ImageResponse(
    (
      <Frame>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Wordmark />

          <div
            style={{
              display: 'flex',
              fontSize: 44,
              fontWeight: 700,
              color: 'white',
              marginTop: '24px',
              textAlign: 'center',
            }}
          >
            {`${displayName} ${LIST_HEADLINES[tab]} ${count ?? posters.length} shows`}
          </div>

          {posters.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '36px' }}>
              {posters.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  width={160}
                  height={240}
                  style={{
                    borderRadius: '14px',
                    objectFit: 'cover',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
                  }}
                />
              ))}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: 'rgba(255,255,255,0.45)',
              marginTop: '32px',
            }}
          >
            beenwatching.com
          </div>
        </div>
      </Frame>
    ),
    { width: 1200, height: 630 }
  )
}

// ============================================================
// Default card: today's #1 shows across streaming
// ============================================================

const CHART_PLATFORM_ORDER = ['netflix', 'max', 'disney', 'prime', 'paramount', 'hulu', 'apple', 'peacock']

/** The most recent #1 TV show on each platform (same data as the feed's hero card) */
async function fetchNumberOnePosters(): Promise<string[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: rows } = await supabase
    .from('platform_charts')
    .select('platform, chart_type, chart_date, rank, title, tmdb_id, poster_path')
    .eq('region', 'US')
    .eq('rank', 1)
    .eq('chart_type', 'tv')
    .gte('chart_date', since)
    .not('poster_path', 'is', null)
    .order('chart_date', { ascending: false })
    .limit(200)

  if (!rows?.length) return []

  // Latest #1 per platform, deduped across platforms
  const byPlatform = new Map<string, any>()
  for (const row of rows) {
    if (!byPlatform.has(row.platform)) byPlatform.set(row.platform, row)
  }

  const seen = new Set<string>()
  const posters: string[] = []
  for (const platform of CHART_PLATFORM_ORDER) {
    const row = byPlatform.get(platform)
    if (!row) continue
    const key = String(row.tmdb_id || row.title)
    if (seen.has(key)) continue
    seen.add(key)
    posters.push(`https://image.tmdb.org/t/p/w342${row.poster_path}`)
    if (posters.length >= 5) break
  }
  return posters
}

async function defaultCard() {
  let posters: string[] = []
  try {
    posters = await fetchNumberOnePosters()
  } catch {
    posters = []
  }

  if (posters.length < 3) return brandedCard()

  return new ImageResponse(
    (
      <Frame>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Wordmark size={30} />

          <div
            style={{
              display: 'flex',
              fontSize: 34,
              fontWeight: 700,
              color: 'white',
              marginTop: '18px',
            }}
          >
            The #1 shows on streaming right now
          </div>

          <div style={{ display: 'flex', gap: '22px', marginTop: '32px' }}>
            {posters.map((url, i) => (
              <img
                key={i}
                src={url}
                width={170}
                height={255}
                style={{
                  borderRadius: '14px',
                  objectFit: 'cover',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: 'rgba(255,255,255,0.5)',
              marginTop: '28px',
            }}
          >
            Track. Share. Discover. — beenwatching.com
          </div>
        </div>
      </Frame>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // The chart data changes at most daily; let CDNs reuse the image for a few hours
        'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400',
      },
    }
  )
}

// ============================================================
// Branded fallback card (no data needed)
// ============================================================

function brandedCard() {
  return new ImageResponse(
    (
      <Frame>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 700,
              color: GOLD,
              letterSpacing: '10px',
            }}
          >
            BEEN WATCHING
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: 'rgba(255,255,255,0.75)',
              marginTop: '20px',
            }}
          >
            Track. Share. Discover.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: 'rgba(255,255,255,0.45)',
              marginTop: '36px',
            }}
          >
            beenwatching.com
          </div>
        </div>
      </Frame>
    ),
    { width: 1200, height: 630 }
  )
}

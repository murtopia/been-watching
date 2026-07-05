import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type {
  FeedV2Response,
  FriendDigest,
  DigestShowItem,
  PlatformChart,
  ChartEntry,
  VlyItem,
  ComingSoonItem,
  BylItem,
  FollowSuggestionItem
} from '@/lib/feed/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

const DIGEST_WINDOW_DAYS = 7
const PLATFORM_LABELS: Record<string, string> = {
  netflix: 'Netflix',
  max: 'Max',
  disney: 'Disney+',
  prime: 'Prime Video',
  paramount: 'Paramount+',
  hulu: 'Hulu',
  apple: 'Apple TV+',
  peacock: 'Peacock'
}
const SOURCE_LABELS: Record<string, string> = {
  netflix_tudum: 'Netflix Top 10 (official)',
  flixpatrol: 'FlixPatrol',
  tmdb: 'TMDB popularity'
}

function mediaYear(row: any): number | null {
  const d = row?.release_date || ''
  const y = parseInt(String(d).substring(0, 4))
  return y || null
}

function mediaGenres(row: any): string[] {
  return row?.tmdb_data?.genres?.map((g: any) => g.name).slice(0, 3) || []
}

function seasonFromId(mediaId: string): number | null {
  const m = String(mediaId).match(/-s(\d+)$/)
  return m ? parseInt(m[1]) : null
}

/** Pick the most significant action for a digest item */
function digestAction(rating: string | null, status: string | null): DigestShowItem['action'] {
  if (rating === 'love') return 'loved'
  if (rating === 'like') return 'liked'
  if (rating === 'meh') return 'meh'
  if (status === 'watching') return 'watching'
  if (status === 'want') return 'want'
  return 'watched'
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const digestSince = new Date(now.getTime() - DIGEST_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const today = now.toISOString().split('T')[0]

  // ---- Stage 1: friends + own data + charts (parallel) ----
  const [followsRes, ownStatusRes, ownRatingsRes, chartsRes] = await Promise.all([
    supabase.from('follows').select('following_id').eq('follower_id', user.id).eq('status', 'accepted'),
    supabase.from('watch_status').select('media_id, status').eq('user_id', user.id),
    supabase.from('ratings').select('media_id, rating').eq('user_id', user.id),
    supabase
      .from('platform_charts')
      .select('platform, chart_type, period, chart_date, rank, title, metric_label, metric_value, is_new, weeks_on_chart, tmdb_id, media_type, poster_path, source')
      .eq('region', 'US')
      .gte('chart_date', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('chart_date', { ascending: false })
      .limit(400)
  ])

  const friendIds = (followsRes.data || []).map(f => f.following_id)

  const userStatuses: Record<string, 'want' | 'watching' | 'watched'> = {}
  const userStatusBaseIds = new Set<string>()
  for (const s of ownStatusRes.data || []) {
    userStatuses[s.media_id] = s.status
    userStatusBaseIds.add(s.media_id.replace(/-s\d+$/, ''))
  }
  const userRatings: Record<string, 'meh' | 'like' | 'love'> = {}
  for (const r of ownRatingsRes.data || []) {
    userRatings[r.media_id] = r.rating
  }

  // ---- Stage 2: friend activities + community ratings + own media rows (parallel) ----
  const [activitiesRes, allRatingsRes, ownMediaRes] = await Promise.all([
    friendIds.length > 0
      ? supabase
          .from('activities')
          .select(`
            id, user_id, media_id, activity_type, activity_data, created_at,
            profiles:user_id (id, username, display_name, avatar_url),
            media:media_id (id, tmdb_id, media_type, title, poster_path, overview, release_date, vote_average, tmdb_data)
          `)
          .in('user_id', friendIds)
          .in('activity_type', ['rated', 'status_changed'])
          .gte('created_at', digestSince)
          .order('created_at', { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [] as any[] }),
    // Community ratings for Viewers Like You (small user base - fetch all)
    supabase.from('ratings').select('user_id, media_id, rating').neq('user_id', user.id).limit(10000),
    // User's tracked media rows (for coming-soon lookups)
    Object.keys(userStatuses).length > 0
      ? supabase.from('media').select('id, tmdb_id, media_type').in('id', Object.keys(userStatuses).slice(0, 500))
      : Promise.resolve({ data: [] as any[] })
  ])

  const activities = (activitiesRes.data as any[]) || []

  // ---- Friend digests ----
  // Group by friend, then by media
  const digestByUser = new Map<string, Map<string, { activityRows: any[]; media: any; profile: any }>>()
  for (const a of activities) {
    if (!a.media) continue
    if (!digestByUser.has(a.user_id)) digestByUser.set(a.user_id, new Map())
    const byMedia = digestByUser.get(a.user_id)!
    if (!byMedia.has(a.media_id)) {
      byMedia.set(a.media_id, { activityRows: [], media: a.media, profile: a.profiles })
    }
    byMedia.get(a.media_id)!.activityRows.push(a)
  }

  // Comment counts for digest media (single query)
  const digestMediaIds = Array.from(new Set(activities.map(a => a.media_id).filter(Boolean)))
  const commentCounts = new Map<string, number>()
  if (digestMediaIds.length > 0) {
    const { data: commentRows } = await supabase
      .from('show_comments')
      .select('media_id')
      .in('media_id', digestMediaIds)
    for (const c of commentRows || []) {
      commentCounts.set(c.media_id, (commentCounts.get(c.media_id) || 0) + 1)
    }
  }

  const digests: FriendDigest[] = []
  for (const [, byMedia] of digestByUser) {
    const entries = Array.from(byMedia.values())
    const profile = entries[0]?.profile
    if (!profile) continue

    let rated = 0
    let statusChanges = 0
    const items: DigestShowItem[] = entries.map(({ activityRows, media }) => {
      let rating: string | null = null
      let status: string | null = null
      for (const a of activityRows) {
        if (a.activity_type === 'rated') {
          rated++
          if (!rating) rating = a.activity_data?.rating || null
        } else if (a.activity_type === 'status_changed') {
          statusChanges++
          if (!status) status = a.activity_data?.status || null
        }
      }
      return {
        mediaId: media.id,
        tmdbId: media.tmdb_id ?? null,
        title: media.title,
        posterPath: media.poster_path,
        mediaType: media.media_type,
        action: digestAction(rating, status),
        rating: rating as DigestShowItem['rating'],
        status: status as DigestShowItem['status'],
        lastActivityAt: activityRows[0].created_at,
        commentCount: commentCounts.get(media.id) || 0,
        season: seasonFromId(media.id),
        overview: media.overview,
        year: mediaYear(media),
        genres: mediaGenres(media),
        voteAverage: media.vote_average ?? null
      }
    })

    items.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))

    digests.push({
      user: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url
      },
      periodLabel: 'This week',
      items: items.slice(0, 8),
      totals: { rated, statusChanges },
      lastActivityAt: items[0]?.lastActivityAt || ''
    })
  }
  digests.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))

  // ---- Platform charts (best source per platform, latest date) ----
  const chartRows = (chartsRes.data as any[]) || []
  // Source priority per platform: flixpatrol > netflix_tudum > tmdb
  const sourcePriority = (s: string) => (s === 'flixpatrol' ? 3 : s === 'netflix_tudum' ? 2 : 1)
  const bestByPlatform = new Map<string, { source: string; chartDate: string; period: string }>()
  for (const r of chartRows) {
    const cur = bestByPlatform.get(r.platform)
    if (
      !cur ||
      sourcePriority(r.source) > sourcePriority(cur.source) ||
      (r.source === cur.source && r.chart_date > cur.chartDate)
    ) {
      bestByPlatform.set(r.platform, { source: r.source, chartDate: r.chart_date, period: r.period })
    }
  }

  // Friend avatars per chart tmdb_id: map chart tmdb ids -> media rows -> friend watch_status
  const chartTmdbIds = Array.from(new Set(chartRows.map(r => r.tmdb_id).filter(Boolean)))
  const friendsByTmdbId = new Map<number, Array<{ id: string; name: string; avatar: string | null }>>()
  const dbMediaByTmdbId = new Map<string, string>() // `${type}:${tmdbId}` -> best media id
  if (chartTmdbIds.length > 0) {
    const { data: chartMediaRows } = await supabase
      .from('media')
      .select('id, tmdb_id, media_type, release_date')
      .in('tmdb_id', chartTmdbIds)

    const mediaIdToTmdb = new Map<string, { tmdbId: number; type: string }>()
    for (const m of chartMediaRows || []) {
      mediaIdToTmdb.set(m.id, { tmdbId: m.tmdb_id, type: m.media_type })
      // Prefer season rows (latest) over base rows for TV; movies use movie row
      const key = `${m.media_type}:${m.tmdb_id}`
      const existing = dbMediaByTmdbId.get(key)
      const isSeasonRow = /-s\d+$/.test(m.id)
      if (!existing) {
        dbMediaByTmdbId.set(key, m.id)
      } else {
        const existingIsSeason = /-s\d+$/.test(existing)
        if (isSeasonRow && (!existingIsSeason || m.id > existing)) {
          dbMediaByTmdbId.set(key, m.id)
        }
      }
    }

    if (friendIds.length > 0 && (chartMediaRows || []).length > 0) {
      const { data: friendStatuses } = await supabase
        .from('watch_status')
        .select('media_id, user_id, profiles:user_id (id, display_name, username, avatar_url)')
        .in('user_id', friendIds)
        .in('media_id', (chartMediaRows || []).map(m => m.id))

      for (const fs of (friendStatuses as any[]) || []) {
        const info = mediaIdToTmdb.get(fs.media_id)
        if (!info || !fs.profiles) continue
        const list = friendsByTmdbId.get(info.tmdbId) || []
        if (!list.some(f => f.id === fs.profiles.id)) {
          list.push({
            id: fs.profiles.id,
            name: fs.profiles.display_name || fs.profiles.username,
            avatar: fs.profiles.avatar_url
          })
        }
        friendsByTmdbId.set(info.tmdbId, list)
      }
    }
  }

  const charts: PlatformChart[] = []
  for (const [platform, best] of bestByPlatform) {
    const rows = chartRows.filter(
      r => r.platform === platform && r.source === best.source && r.chart_date === best.chartDate
    )
    const toEntry = (r: any): ChartEntry => ({
      rank: r.rank,
      title: r.title,
      tmdbId: r.tmdb_id,
      posterPath: r.poster_path,
      metricLabel: r.metric_label,
      metricValue: r.metric_value,
      isNew: !!r.is_new,
      weeksOnChart: r.weeks_on_chart,
      dbMediaId: r.tmdb_id ? dbMediaByTmdbId.get(`${r.media_type}:${r.tmdb_id}`) || null : null,
      friends: r.tmdb_id ? friendsByTmdbId.get(r.tmdb_id) || [] : []
    })

    charts.push({
      platform,
      platformLabel: PLATFORM_LABELS[platform] || platform,
      source: best.source,
      sourceLabel: SOURCE_LABELS[best.source] || best.source,
      period: best.period as 'day' | 'week',
      chartDate: best.chartDate,
      tv: rows.filter(r => r.chart_type === 'tv').sort((a, b) => a.rank - b.rank).map(toEntry),
      movies: rows.filter(r => r.chart_type === 'movie').sort((a, b) => a.rank - b.rank).map(toEntry)
    })
  }
  // Netflix first, then alphabetical
  charts.sort((a, b) => (a.platform === 'netflix' ? -1 : b.platform === 'netflix' ? 1 : a.platform.localeCompare(b.platform)))

  // ---- Viewers Like You (collaborative filtering on ratings overlap) ----
  const allRatings = (allRatingsRes.data as any[]) || []
  const myPositive = new Set(
    Object.entries(userRatings).filter(([, r]) => r === 'like' || r === 'love').map(([id]) => id)
  )
  // Also match on base ids so tv-x-s1 vs tv-x-s2 counts as overlap
  const myPositiveBase = new Set(Array.from(myPositive).map(id => id.replace(/-s\d+$/, '')))

  const similarity = new Map<string, number>()
  for (const r of allRatings) {
    if (r.rating !== 'like' && r.rating !== 'love') continue
    const baseId = r.media_id.replace(/-s\d+$/, '')
    if (myPositive.has(r.media_id) || myPositiveBase.has(baseId)) {
      similarity.set(r.user_id, (similarity.get(r.user_id) || 0) + (r.rating === 'love' ? 2 : 1))
    }
  }

  const candidateScores = new Map<string, { score: number; supporters: Set<string> }>()
  for (const r of allRatings) {
    const sim = similarity.get(r.user_id)
    if (!sim || (r.rating !== 'like' && r.rating !== 'love')) continue
    const baseId = r.media_id.replace(/-s\d+$/, '')
    // Exclude anything the user already rated or tracks (any season)
    if (userRatings[r.media_id] || userStatuses[r.media_id]) continue
    if (myPositiveBase.has(baseId) || userStatusBaseIds.has(baseId)) continue
    const cur = candidateScores.get(baseId) || { score: 0, supporters: new Set<string>() }
    cur.score += sim * (r.rating === 'love' ? 2 : 1)
    cur.supporters.add(r.user_id)
    candidateScores.set(baseId, cur)
  }

  const topCandidates = Array.from(candidateScores.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 12)

  let viewersLikeYou: VlyItem[] = []
  if (topCandidates.length > 0) {
    // Fetch media rows for candidates (base ids and their season rows)
    const baseIds = topCandidates.map(([id]) => id)
    const { data: vlyMedia } = await supabase
      .from('media')
      .select('id, tmdb_id, media_type, title, poster_path, overview, release_date, vote_average, tmdb_data')
      .or(baseIds.map(id => `id.eq.${id},id.like.${id}-s%`).join(','))

    const byBase = new Map<string, any>()
    for (const m of (vlyMedia as any[]) || []) {
      const base = m.id.replace(/-s\d+$/, '')
      const existing = byBase.get(base)
      // Prefer the base row for display; fall back to lowest season
      if (!existing || m.id === base || (existing.id !== base && m.id < existing.id)) {
        byBase.set(base, m)
      }
    }

    viewersLikeYou = topCandidates
      .map(([baseId, info]) => {
        const m = byBase.get(baseId)
        if (!m) return null
        return {
          mediaId: m.id,
          tmdbId: m.tmdb_id ?? null,
          title: (m.title || '').replace(/\s*-\s*Season\s+\d+$/i, ''),
          posterPath: m.poster_path,
          mediaType: m.media_type,
          season: seasonFromId(m.id),
          overview: m.overview,
          year: mediaYear(m),
          genres: mediaGenres(m),
          voteAverage: m.vote_average ?? null,
          supporters: info.supporters.size
        } as VlyItem
      })
      .filter((x): x is VlyItem => x !== null)
      .slice(0, 6)
  }

  // ---- Coming Soon (upcoming seasons of tracked shows, straight from DB) ----
  const trackedTmdbIds = Array.from(
    new Set(((ownMediaRes.data as any[]) || []).filter(m => m.media_type === 'tv' && m.tmdb_id).map(m => m.tmdb_id))
  )
  let comingSoon: ComingSoonItem[] = []
  if (trackedTmdbIds.length > 0) {
    const [upcomingRes, remindersRes] = await Promise.all([
      supabase
        .from('media')
        .select('id, tmdb_id, title, poster_path, overview, release_date, vote_average, tmdb_data')
        .eq('media_type', 'tv')
        .in('tmdb_id', trackedTmdbIds)
        .gt('release_date', today)
        .order('release_date', { ascending: true })
        .limit(20),
      supabase.from('show_reminders').select('media_id').eq('user_id', user.id)
    ])

    const reminderIds = new Set((remindersRes.data || []).map((r: any) => r.media_id))
    const seenTmdb = new Set<number>()
    for (const m of (upcomingRes.data as any[]) || []) {
      if (seenTmdb.has(m.tmdb_id)) continue
      // Skip if the user already tracks this exact season
      if (userStatuses[m.id]) continue
      seenTmdb.add(m.tmdb_id)
      comingSoon.push({
        mediaId: m.id,
        tmdbId: m.tmdb_id,
        title: (m.title || '').replace(/\s*-\s*Season\s+\d+$/i, ''),
        posterPath: m.poster_path,
        airDate: m.release_date,
        season: seasonFromId(m.id),
        overview: m.overview,
        genres: mediaGenres(m),
        voteAverage: m.vote_average ?? null,
        hasReminder: reminderIds.has(m.id)
      })
    }
    comingSoon = comingSoon.slice(0, 4)
  }

  // ---- Because You Liked (US-filtered TMDB recommendations, cached 24h per source) ----
  const becauseYouLiked: BylItem[] = []
  if (TMDB_API_KEY) {
    // Pick the user's most recent loves (up to 2 sources)
    const lovedIds = Object.entries(userRatings)
      .filter(([, r]) => r === 'love')
      .map(([id]) => id)
      .slice(-2)
    const excludeTmdb = new Set<number>()
    for (const m of (ownMediaRes.data as any[]) || []) {
      if (m.tmdb_id) excludeTmdb.add(m.tmdb_id)
    }

    for (const sourceId of lovedIds) {
      const base = sourceId.replace(/-s\d+$/, '')
      const [type, tmdbIdStr] = base.split('-')
      if (!tmdbIdStr || (type !== 'tv' && type !== 'movie')) continue
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/${type}/${tmdbIdStr}/recommendations?api_key=${TMDB_API_KEY}&language=en-US`,
          { next: { revalidate: 86400 } }
        )
        if (!res.ok) continue
        const data = await res.json()
        // Get source title from user's media rows if possible
        const { data: sourceMedia } = await supabase.from('media').select('title').eq('id', sourceId).maybeSingle()
        const sourceTitle = (sourceMedia?.title || '').replace(/\s*-\s*Season\s+\d+$/i, '') || 'a show you loved'

        const picks = (data.results || [])
          .filter((r: any) => (r.original_language === 'en') && !excludeTmdb.has(r.id) && r.poster_path)
          .slice(0, 2)
        for (const p of picks) {
          becauseYouLiked.push({
            sourceTitle,
            tmdbId: p.id,
            mediaType: type as 'tv' | 'movie',
            title: p.name || p.title || '',
            posterPath: p.poster_path,
            overview: p.overview || null,
            year: parseInt((p.first_air_date || p.release_date || '').substring(0, 4)) || null,
            genreIds: p.genre_ids || [],
            voteAverage: p.vote_average ?? null
          })
        }
      } catch {
        // non-fatal
      }
    }
  }

  // ---- Follow suggestions (only when the user has few friends) ----
  let followSuggestions: FollowSuggestionItem[] = []
  if (friendIds.length < 10) {
    const { data: candidates } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .neq('id', user.id)
      .limit(30)

    const notFollowed = (candidates || []).filter(c => !friendIds.includes(c.id)).slice(0, 6)
    if (notFollowed.length > 0) {
      const { data: statusRows } = await supabase
        .from('watch_status')
        .select('user_id, status')
        .in('user_id', notFollowed.map(c => c.id))

      const statsByUser = new Map<string, { want: number; watching: number; watched: number }>()
      for (const s of statusRows || []) {
        const cur = statsByUser.get(s.user_id) || { want: 0, watching: 0, watched: 0 }
        if (s.status === 'want') cur.want++
        else if (s.status === 'watching') cur.watching++
        else if (s.status === 'watched') cur.watched++
        statsByUser.set(s.user_id, cur)
      }

      followSuggestions = notFollowed
        .filter(c => statsByUser.has(c.id)) // only suggest active users
        .map(c => {
          const stats = statsByUser.get(c.id)!
          return {
            id: c.id,
            name: c.display_name || c.username,
            username: c.username,
            avatar: c.avatar_url || '',
            matchPercentage: 0,
            bio: c.bio || '',
            stats: { wantToWatch: stats.want, watching: stats.watching, watched: stats.watched },
            friendsInCommon: { count: 0, avatars: [] }
          }
        })
        .slice(0, 4)
    }
  }

  const response: FeedV2Response = {
    digests,
    charts,
    viewersLikeYou,
    comingSoon,
    becauseYouLiked,
    followSuggestions,
    userRatings,
    userStatuses,
    friendCount: friendIds.length
  }

  return NextResponse.json(response)
}

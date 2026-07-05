import type { SupabaseClient } from '@supabase/supabase-js'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const FLIXPATROL_API_KEY = process.env.FLIXPATROL_API_KEY

/** TMDB watch-provider IDs (US) for per-platform popularity charts */
const TMDB_PROVIDERS: Record<string, number> = {
  netflix: 8,
  prime: 9,
  hulu: 15,
  disney: 337,
  apple: 350,
  peacock: 386,
  paramount: 531,
  max: 1899
}

/** FlixPatrol company names (resolved to cmp_ IDs at runtime, cached) */
const FLIXPATROL_COMPANIES: Record<string, string> = {
  netflix: 'Netflix',
  prime: 'Amazon Prime Video',
  hulu: 'Hulu',
  disney: 'Disney+',
  apple: 'Apple TV+',
  paramount: 'Paramount+',
  max: 'HBO Max'
}

export interface IngestChartsResult {
  netflixTudum: { rows: number; week?: string; error?: string }
  tmdbPlatforms: { rows: number; error?: string }
  flixpatrol: { rows: number; skipped?: boolean; error?: string }
}

interface ChartRow {
  platform: string
  chart_type: 'tv' | 'movie'
  region: string
  period: 'day' | 'week'
  chart_date: string
  rank: number
  title: string
  metric_label?: string | null
  metric_value?: number | null
  is_new?: boolean
  weeks_on_chart?: number | null
  tmdb_id?: number | null
  media_type?: 'tv' | 'movie' | null
  poster_path?: string | null
  source: string
}

// ---------- shared helpers ----------

function parseTsv(text: string): Array<Record<string, string>> {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split('\t').map(h => h.trim())
  return lines.slice(1).map(line => {
    const cells = line.split('\t')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      const v = (cells[i] || '').trim()
      // Netflix uses literal "N/A" for empty fields (e.g. season_title on films)
      row[h] = v === 'N/A' ? '' : v
    })
    return row
  })
}

async function getCache(supabase: SupabaseClient, key: string): Promise<any | null> {
  const { data } = await supabase
    .from('chart_ingest_cache')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value ?? null
}

async function setCache(supabase: SupabaseClient, key: string, value: any) {
  await supabase
    .from('chart_ingest_cache')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

/** Match a chart title to TMDB (search by name), cached in chart_ingest_cache */
async function matchTmdbTitle(
  supabase: SupabaseClient,
  title: string,
  mediaType: 'tv' | 'movie'
): Promise<{ tmdb_id: number; poster_path: string | null } | null> {
  const cacheKey = `tmdbmatch:${mediaType}:${title.toLowerCase()}`
  const cached = await getCache(supabase, cacheKey)
  if (cached) return cached.miss ? null : cached

  // Netflix chart titles often include ": Season N" or ": Part N" - strip for search
  const searchTitle = title.replace(/:\s*(Season|Part|Volume|Chapter|Series)\s+\d+.*$/i, '').trim()

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTitle)}&region=US`
    )
    if (!res.ok) return null
    const data = await res.json()
    const hit = data.results?.[0]
    if (!hit) {
      await setCache(supabase, cacheKey, { miss: true })
      return null
    }
    const match = { tmdb_id: hit.id, poster_path: hit.poster_path || null }
    await setCache(supabase, cacheKey, match)
    return match
  } catch {
    return null
  }
}

async function upsertChartRows(supabase: SupabaseClient, rows: ChartRow[]): Promise<string | null> {
  if (rows.length === 0) return null
  const { error } = await supabase
    .from('platform_charts')
    .upsert(rows, { onConflict: 'platform,chart_type,region,period,chart_date,rank,source' })
  return error ? error.message : null
}

// ---------- Netflix Tudum (official weekly Top 10) ----------

async function ingestNetflixTudum(supabase: SupabaseClient): Promise<IngestChartsResult['netflixTudum']> {
  try {
    const [countriesRes, globalRes] = await Promise.all([
      fetch('https://www.netflix.com/tudum/top10/data/all-weeks-countries.tsv'),
      fetch('https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv')
    ])
    if (!countriesRes.ok) return { rows: 0, error: `countries TSV ${countriesRes.status}` }

    const countriesRows = parseTsv(await countriesRes.text())
    const usRows = countriesRows.filter(r => (r.country_iso2 || '').toUpperCase() === 'US')
    if (usRows.length === 0) return { rows: 0, error: 'no US rows in Tudum data' }

    // Latest week only
    const latestWeek = usRows.map(r => r.week).sort().pop()!
    const latestUsRows = usRows.filter(r => r.week === latestWeek)

    // Previous week ranks (to compute is_new)
    const weeks = Array.from(new Set(usRows.map(r => r.week))).sort()
    const prevWeek = weeks[weeks.length - 2]
    const prevTitles = new Set(
      usRows.filter(r => r.week === prevWeek).map(r => r.season_title || r.show_title)
    )

    // Global hours-viewed lookup (title -> hours) for the same week
    const hoursByTitle = new Map<string, number>()
    if (globalRes.ok) {
      const globalRows = parseTsv(await globalRes.text())
      globalRows
        .filter(r => r.week === latestWeek)
        .forEach(r => {
          const key = r.season_title || r.show_title
          const hours = parseInt(r.weekly_hours_viewed?.replace(/[^0-9]/g, '') || '0')
          if (key && hours) hoursByTitle.set(key, hours)
        })
    }

    const rows: ChartRow[] = []
    for (const r of latestUsRows) {
      const displayTitle = r.season_title || r.show_title
      if (!displayTitle) continue
      const chartType: 'tv' | 'movie' = (r.category || '').toLowerCase().includes('film') ? 'movie' : 'tv'
      const match = await matchTmdbTitle(supabase, r.show_title || displayTitle, chartType)
      const hours = hoursByTitle.get(displayTitle) ?? null

      rows.push({
        platform: 'netflix',
        chart_type: chartType,
        region: 'US',
        period: 'week',
        chart_date: latestWeek,
        rank: parseInt(r.weekly_rank) || 0,
        title: displayTitle,
        metric_label: hours ? 'hours viewed' : null,
        metric_value: hours,
        is_new: !prevTitles.has(displayTitle),
        weeks_on_chart: parseInt(r.cumulative_weeks_in_top_10) || null,
        tmdb_id: match?.tmdb_id ?? null,
        media_type: chartType,
        poster_path: match?.poster_path ?? null,
        source: 'netflix_tudum'
      })
    }

    const error = await upsertChartRows(supabase, rows)
    return error ? { rows: 0, error } : { rows: rows.length, week: latestWeek }
  } catch (e: any) {
    return { rows: 0, error: e.message || 'unknown' }
  }
}

// ---------- TMDB per-platform popularity (free daily fallback for all platforms) ----------

async function ingestTmdbPlatformCharts(supabase: SupabaseClient): Promise<IngestChartsResult['tmdbPlatforms']> {
  if (!TMDB_API_KEY) return { rows: 0, error: 'TMDB_API_KEY not configured' }

  const today = new Date().toISOString().split('T')[0]
  const rows: ChartRow[] = []

  try {
    for (const [platform, providerId] of Object.entries(TMDB_PROVIDERS)) {
      for (const chartType of ['tv', 'movie'] as const) {
        const res = await fetch(
          `${TMDB_BASE_URL}/discover/${chartType}?api_key=${TMDB_API_KEY}` +
          `&with_watch_providers=${providerId}&watch_region=US` +
          `&with_watch_monetization_types=flatrate&sort_by=popularity.desc`
        )
        if (!res.ok) continue
        const data = await res.json()
        const top = (data.results || []).slice(0, 10)
        top.forEach((item: any, idx: number) => {
          rows.push({
            platform,
            chart_type: chartType,
            region: 'US',
            period: 'day',
            chart_date: today,
            rank: idx + 1,
            title: item.name || item.title || '',
            metric_label: 'popularity',
            metric_value: Math.round(item.popularity || 0),
            tmdb_id: item.id,
            media_type: chartType,
            poster_path: item.poster_path || null,
            source: 'tmdb'
          })
        })
      }
    }

    const error = await upsertChartRows(supabase, rows)
    return error ? { rows: 0, error } : { rows: rows.length }
  } catch (e: any) {
    return { rows: 0, error: e.message || 'unknown' }
  }
}

// ---------- FlixPatrol (paid daily Top 10 per platform; skipped without API key) ----------

async function flixpatrolFetch(path: string): Promise<any> {
  const res = await fetch(`https://api.flixpatrol.com/v2${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${FLIXPATROL_API_KEY}:`).toString('base64')}`
    }
  })
  if (!res.ok) throw new Error(`FlixPatrol ${res.status} for ${path}`)
  return res.json()
}

async function resolveFlixpatrolId(
  supabase: SupabaseClient,
  kind: 'companies' | 'countries',
  name: string
): Promise<string | null> {
  const cacheKey = `flixpatrol:${kind}:${name.toLowerCase()}`
  const cached = await getCache(supabase, cacheKey)
  if (cached) return cached.id

  const data = await flixpatrolFetch(`/${kind}?name[contains]=${encodeURIComponent(name)}`)
  const items = Array.isArray(data) ? data : data?.data || []
  const first = items[0]
  const id = first?.data?.id || first?.id || null
  if (id) await setCache(supabase, cacheKey, { id })
  return id
}

async function ingestFlixPatrol(supabase: SupabaseClient): Promise<IngestChartsResult['flixpatrol']> {
  if (!FLIXPATROL_API_KEY) return { rows: 0, skipped: true }

  try {
    const usId = await resolveFlixpatrolId(supabase, 'countries', 'United States')
    if (!usId) return { rows: 0, error: 'could not resolve US country ID' }

    // Today's chart may not be published yet early in the day, so query a
    // two-day window and keep only the newest chart date per platform.
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const rows: ChartRow[] = []

    for (const [platform, companyName] of Object.entries(FLIXPATROL_COMPANIES)) {
      const companyId = await resolveFlixpatrolId(supabase, 'companies', companyName)
      if (!companyId) continue

      // type 2 = Movies, 3 = TVShows; date operators nest as date[from][eq]
      const data = await flixpatrolFetch(
        `/top10s?company[eq]=${companyId}&country[eq]=${usId}` +
        `&type[in]=2,3&date[from][gte]=${yesterday}&date[to][lte]=${today}`
      )
      const items = Array.isArray(data) ? data : data?.data || []

      const platformRows: ChartRow[] = []
      for (const item of items) {
        const d = item.data || item
        // Title name + TMDB id are inlined in the response - no extra calls needed
        const t = d.movie?.data
        if (!t?.title) continue

        const chartType: 'tv' | 'movie' = d.type === 3 ? 'tv' : 'movie'
        let poster: string | null = null
        if (t.tmdbId) {
          const match = await matchTmdbTitle(supabase, t.title, chartType)
          poster = match?.poster_path ?? null
        }

        platformRows.push({
          platform,
          chart_type: chartType,
          region: 'US',
          period: 'day',
          chart_date: d.date?.from || today,
          rank: d.ranking,
          title: t.title,
          metric_label: 'chart points',
          metric_value: d.value ?? null,
          is_new: d.rankingLast == null,
          weeks_on_chart: d.daysTotal ? Math.ceil(d.daysTotal / 7) : null,
          tmdb_id: t.tmdbId ?? null,
          media_type: chartType,
          poster_path: poster,
          source: 'flixpatrol'
        })
      }

      // Keep only the most recent chart date for this platform
      const latestDate = platformRows.map(r => r.chart_date).sort().pop()
      rows.push(...platformRows.filter(r => r.chart_date === latestDate))
    }

    const error = await upsertChartRows(supabase, rows)
    return error ? { rows: 0, error } : { rows: rows.length }
  } catch (e: any) {
    return { rows: 0, error: e.message || 'unknown' }
  }
}

// ---------- entrypoint ----------

export async function ingestCharts(supabase: SupabaseClient): Promise<IngestChartsResult> {
  const [netflixTudum, tmdbPlatforms, flixpatrol] = await Promise.all([
    ingestNetflixTudum(supabase),
    ingestTmdbPlatformCharts(supabase),
    ingestFlixPatrol(supabase)
  ])
  return { netflixTudum, tmdbPlatforms, flixpatrol }
}

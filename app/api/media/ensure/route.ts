import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

/**
 * Ensures a media row exists for a TMDB title and returns it.
 * For TV shows, resolves to the latest aired season row (tv-{id}-s{n}),
 * creating all season rows if missing (keeps the canonical season model).
 *
 * POST { tmdbId: number, mediaType: 'tv' | 'movie' }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const tmdbId = parseInt(body?.tmdbId)
  const mediaType = body?.mediaType
  if (!tmdbId || (mediaType !== 'tv' && mediaType !== 'movie')) {
    return NextResponse.json({ error: 'tmdbId and mediaType required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Existing rows for this title
  const { data: existing } = await admin
    .from('media')
    .select('id, tmdb_id, media_type, title, poster_path, overview, release_date, vote_average, tmdb_data')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)

  if (mediaType === 'movie') {
    const movieRow = (existing || []).find(m => m.id === `movie-${tmdbId}`)
    if (movieRow) return NextResponse.json({ media: movieRow })

    const res = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`)
    if (!res.ok) return NextResponse.json({ error: 'TMDB fetch failed' }, { status: 502 })
    const movie = await res.json()
    const row = {
      id: `movie-${tmdbId}`,
      tmdb_id: tmdbId,
      media_type: 'movie',
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      release_date: movie.release_date || null,
      vote_average: movie.vote_average,
      tmdb_data: movie
    }
    const { error } = await admin.from('media').upsert(row, { onConflict: 'id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ media: row })
  }

  // TV: make sure all season rows exist, then return the latest aired one
  const res = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`)
  if (!res.ok) return NextResponse.json({ error: 'TMDB fetch failed' }, { status: 502 })
  const show = await res.json()
  const validSeasons = (show.seasons || []).filter((s: any) => s.season_number > 0)

  if (validSeasons.length === 0) {
    return NextResponse.json({ error: 'No seasons found' }, { status: 404 })
  }

  const existingIds = new Set((existing || []).map(m => m.id))
  const missing = validSeasons.filter((s: any) => !existingIds.has(`tv-${tmdbId}-s${s.season_number}`))
  if (missing.length > 0) {
    const rows = missing.map((s: any) => ({
      id: `tv-${tmdbId}-s${s.season_number}`,
      tmdb_id: tmdbId,
      media_type: 'tv',
      title: `${show.name} - Season ${s.season_number}`,
      poster_path: s.poster_path || show.poster_path,
      backdrop_path: show.backdrop_path,
      overview: s.overview || show.overview,
      release_date: s.air_date || null,
      vote_average: show.vote_average,
      tmdb_data: { ...show, season_number: s.season_number, season_id: s.id }
    }))
    const { error } = await admin.from('media').upsert(rows, { onConflict: 'id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Latest aired season (fallback: latest overall)
  const todayStr = new Date().toISOString().split('T')[0]
  const aired = validSeasons.filter((s: any) => s.air_date && s.air_date <= todayStr)
  const target = (aired.length > 0 ? aired[aired.length - 1] : validSeasons[validSeasons.length - 1])

  const { data: mediaRow } = await admin
    .from('media')
    .select('id, tmdb_id, media_type, title, poster_path, overview, release_date, vote_average, tmdb_data')
    .eq('id', `tv-${tmdbId}-s${target.season_number}`)
    .single()

  return NextResponse.json({ media: mediaRow })
}

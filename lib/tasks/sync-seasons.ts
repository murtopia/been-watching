import type { SupabaseClient } from '@supabase/supabase-js'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export interface SyncSeasonsResult {
  showsChecked: number
  seasonsInserted: number
  inserted: string[]
  failed: Array<{ tmdbId: number; error: string }>
}

/**
 * For every TV show anyone tracks, check TMDB for seasons that don't yet
 * exist as media rows (tv-{tmdbId}-s{n}) and insert them.
 * This prevents the recurring "new season missing from database" problem.
 */
export async function syncSeasons(supabase: SupabaseClient): Promise<SyncSeasonsResult> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY not configured')
  }

  const { data: tvRows, error } = await supabase
    .from('media')
    .select('id, tmdb_id, title')
    .eq('media_type', 'tv')

  if (error) {
    throw new Error(error.message)
  }

  const existingIds = new Set((tvRows || []).map(r => r.id))
  const showsByTmdbId = new Map<number, string>()
  for (const row of tvRows || []) {
    if (row.tmdb_id && !showsByTmdbId.has(row.tmdb_id)) {
      // Base show title (strip any " - Season N" suffix)
      const baseTitle = (row.title || '').replace(/\s*-\s*Season\s+\d+$/i, '')
      showsByTmdbId.set(row.tmdb_id, baseTitle)
    }
  }

  const inserted: string[] = []
  const failed: Array<{ tmdbId: number; error: string }> = []

  const tmdbIds = Array.from(showsByTmdbId.keys())
  const CONCURRENCY = 8

  for (let i = 0; i < tmdbIds.length; i += CONCURRENCY) {
    const batch = tmdbIds.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(async (tmdbId) => {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`)
        if (!res.ok) {
          failed.push({ tmdbId, error: `TMDB ${res.status}` })
          return
        }
        const show = await res.json()
        const validSeasons = (show.seasons || []).filter((s: any) => s.season_number > 0)

        const missing = validSeasons.filter(
          (s: any) => !existingIds.has(`tv-${tmdbId}-s${s.season_number}`)
        )
        if (missing.length === 0) return

        const rows = missing.map((s: any) => ({
          id: `tv-${tmdbId}-s${s.season_number}`,
          tmdb_id: tmdbId,
          media_type: 'tv',
          title: `${show.name || showsByTmdbId.get(tmdbId)} - Season ${s.season_number}`,
          poster_path: s.poster_path || show.poster_path,
          backdrop_path: show.backdrop_path,
          overview: s.overview || show.overview,
          release_date: s.air_date || null,
          vote_average: show.vote_average,
          tmdb_data: {
            ...show,
            season_number: s.season_number,
            season_id: s.id
          }
        }))

        const { error: insertError } = await supabase
          .from('media')
          .upsert(rows, { onConflict: 'id' })

        if (insertError) {
          failed.push({ tmdbId, error: insertError.message })
        } else {
          rows.forEach((r: any) => {
            inserted.push(r.id)
            existingIds.add(r.id)
          })
        }
      } catch (e: any) {
        failed.push({ tmdbId, error: e.message || 'unknown' })
      }
    }))
  }

  return {
    showsChecked: tmdbIds.length,
    seasonsInserted: inserted.length,
    inserted,
    failed
  }
}

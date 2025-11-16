import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { checkAdminAccess } from '@/utils/admin/permissions'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchTMDBData(mediaType: 'tv' | 'movie', tmdbId: number, seasonNumber?: number) {
  try {
    let url: string
    if (mediaType === 'tv' && seasonNumber) {
      url = `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
    } else if (mediaType === 'tv') {
      url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
    } else {
      url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    await delay(250) // Rate limit: 4 requests per second
    return data
  } catch (error) {
    console.error('Error fetching TMDB data:', error)
    return null
  }
}

async function ensureMediaExists(
  supabase: any,
  mediaId: string,
  tmdbId: number,
  mediaType: 'tv' | 'movie',
  seasonNumber?: number
) {
  // Check if media already exists
  const { data: existing } = await supabase
    .from('media')
    .select('id')
    .eq('id', mediaId)
    .single()

  if (existing) {
    return true
  }

  // Fetch from TMDB
  const tmdbData = await fetchTMDBData(mediaType, tmdbId, seasonNumber)
  if (!tmdbData) {
    return false
  }

  // Create media entry
  const mediaEntry = {
    id: mediaId,
    tmdb_id: tmdbId,
    media_type: mediaType,
    title: seasonNumber
      ? `${tmdbData.name || tmdbData.title} - Season ${seasonNumber}`
      : (tmdbData.name || tmdbData.title),
    poster_path: tmdbData.poster_path,
    backdrop_path: tmdbData.backdrop_path,
    overview: tmdbData.overview,
    release_date: tmdbData.release_date || tmdbData.first_air_date || tmdbData.air_date,
    vote_average: tmdbData.vote_average,
    tmdb_data: tmdbData
  }

  const { error } = await supabase
    .from('media')
    .insert(mediaEntry)

  return !error
}

/**
 * POST /api/import/trakt
 * Import Trakt.tv watch history
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // Verify user is authenticated and has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { targetUserId, watchedShows, watchedMovies } = body

    if (!targetUserId || (!watchedShows && !watchedMovies)) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const results = {
      shows: { processed: 0, imported: 0, skipped: 0, errors: 0 },
      movies: { processed: 0, imported: 0, skipped: 0, errors: 0 }
    }

    // Import TV shows
    if (watchedShows && Array.isArray(watchedShows)) {
      for (const showData of watchedShows) {
        const { show, seasons, last_watched_at } = showData
        const tmdbId = show.ids?.tmdb

        if (!tmdbId) {
          results.shows.skipped++
          continue
        }

        results.shows.processed++

        // Process each season
        for (const season of seasons || []) {
          const mediaId = `tv-${tmdbId}-s${season.number}`

          // Check if already tracked
          const { data: existingActivity } = await supabase
            .from('activities')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('media_id', mediaId)
            .single()

          if (existingActivity) {
            continue
          }

          // Ensure media exists
          const mediaExists = await ensureMediaExists(
            supabase,
            mediaId,
            tmdbId,
            'tv',
            season.number
          )

          if (!mediaExists) {
            results.shows.errors++
            continue
          }

          // Create watch_status entry (no activity for imports to avoid flooding feed)
          const { error: watchStatusError } = await supabase
            .from('watch_status')
            .insert({
              user_id: targetUserId,
              media_id: mediaId,
              status: 'watched',
              progress: 0
            })

          if (watchStatusError) {
            console.error('Error creating watch_status:', watchStatusError)
            results.shows.errors++
          } else {
            results.shows.imported++
          }
        }
      }
    }

    // Import movies
    if (watchedMovies && Array.isArray(watchedMovies)) {
      for (const movieData of watchedMovies) {
        const { movie, last_watched_at, plays } = movieData
        const tmdbId = movie.ids?.tmdb

        if (!tmdbId) {
          results.movies.skipped++
          continue
        }

        results.movies.processed++

        const mediaId = `movie-${tmdbId}`

        // Check if already tracked
        const { data: existingActivity } = await supabase
          .from('activities')
          .select('id')
          .eq('user_id', targetUserId)
          .eq('media_id', mediaId)
          .single()

        if (existingActivity) {
          continue
        }

        // Ensure media exists
        const mediaExists = await ensureMediaExists(
          supabase,
          mediaId,
          tmdbId,
          'movie'
        )

        if (!mediaExists) {
          results.movies.errors++
          continue
        }

        // Create watch_status entry (no activity for imports to avoid flooding feed)
        const { error: watchStatusError } = await supabase
          .from('watch_status')
          .insert({
            user_id: targetUserId,
            media_id: mediaId,
            status: 'watched',
            progress: 0
          })

        if (watchStatusError) {
          console.error('Error creating watch_status:', watchStatusError)
          results.movies.errors++
        } else {
          results.movies.imported++
        }
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Release Notification Service
 * 
 * Polls TMDB API to find:
 * - Upcoming TV seasons for shows user has watched
 * - New movie theatrical releases
 * - Movies newly available on streaming services
 */

import { createClient } from '@/utils/supabase/server'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

interface ReleaseNotification {
  user_id: string
  media_id: string
  season_number?: number
  release_date: string
  notification_type: 'announcement' | 'week_before' | 'day_of' | 'theatrical_release' | 'streaming_available'
  streaming_service?: string
}

/**
 * Check for upcoming TV seasons
 */
async function checkUpcomingTVSeasons(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  mediaId: string,
  tmdbId: number
): Promise<ReleaseNotification[]> {
  const notifications: ReleaseNotification[] = []

  try {
    // Fetch TV show details from TMDB
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=seasons`
    )

    if (!response.ok) return notifications

    const data = await response.json()

    if (!data.seasons) return notifications

    // Find the latest season that aired
    const airedSeasons = data.seasons.filter((s: any) => 
      s.air_date && new Date(s.air_date) <= new Date()
    ).sort((a: any, b: any) => 
      new Date(b.air_date).getTime() - new Date(a.air_date).getTime()
    )

    if (airedSeasons.length === 0) return notifications

    const lastWatchedSeason = airedSeasons[0]
    const nextSeasonNumber = lastWatchedSeason.season_number + 1

    // Check if next season exists and has a release date
    const nextSeason = data.seasons.find((s: any) => s.season_number === nextSeasonNumber)

    if (!nextSeason || !nextSeason.air_date) return notifications

    const releaseDate = new Date(nextSeason.air_date)
    const today = new Date()
    const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Create notifications for different time windows
    if (daysUntilRelease > 7) {
      // Announcement notification
      notifications.push({
        user_id: userId,
        media_id: mediaId,
        season_number: nextSeasonNumber,
        release_date: nextSeason.air_date,
        notification_type: 'announcement'
      })
    } else if (daysUntilRelease > 1 && daysUntilRelease <= 7) {
      // Week before notification
      notifications.push({
        user_id: userId,
        media_id: mediaId,
        season_number: nextSeasonNumber,
        release_date: nextSeason.air_date,
        notification_type: 'week_before'
      })
    } else if (daysUntilRelease >= 0 && daysUntilRelease <= 1) {
      // Day of notification
      notifications.push({
        user_id: userId,
        media_id: mediaId,
        season_number: nextSeasonNumber,
        release_date: nextSeason.air_date,
        notification_type: 'day_of'
      })
    }
  } catch (error) {
    console.error(`Error checking TV seasons for ${mediaId}:`, error)
  }

  return notifications
}

/**
 * Check for new movie releases
 */
async function checkUpcomingMovieReleases(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  daysAhead: number = 30
): Promise<ReleaseNotification[]> {
  const notifications: ReleaseNotification[] = []

  try {
    // Fetch upcoming movies from TMDB
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&region=US`
    )

    if (!response.ok) return notifications

    const data = await response.json()

    if (!data.results) return notifications

    // Filter movies releasing in the next N days
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    const upcomingMovies = data.results.filter((movie: any) => {
      if (!movie.release_date) return false
      const releaseDate = new Date(movie.release_date)
      return releaseDate >= today && releaseDate <= futureDate
    })

    // Get user's watched movies to check if they're interested
    const { data: userWatched } = await supabase
      .from('watch_status')
      .select('media_id')
      .eq('user_id', userId)
      .eq('status', 'watched')

    // For now, we'll notify about popular upcoming movies
    // In the future, you might want to filter based on user preferences
    const popularMovies = upcomingMovies
      .filter((m: any) => m.vote_average >= 7.0)
      .slice(0, 10) // Limit to top 10

    for (const movie of popularMovies) {
      const mediaId = `movie-${movie.id}`
      
      // Check if we already have this movie in our database
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id')
        .eq('id', mediaId)
        .single()

      if (!existingMedia) {
        // Save movie to database first
        await supabase
          .from('media')
          .insert({
            id: mediaId,
            tmdb_id: movie.id,
            media_type: 'movie',
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            tmdb_data: movie
          })
          .onConflict('id')
          .ignore()
      }

      notifications.push({
        user_id: userId,
        media_id: mediaId,
        release_date: movie.release_date,
        notification_type: 'theatrical_release'
      })
    }
  } catch (error) {
    console.error('Error checking upcoming movie releases:', error)
  }

  return notifications
}

/**
 * Check for movies newly available on streaming
 */
async function checkStreamingAvailability(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  mediaId: string,
  tmdbId: number
): Promise<ReleaseNotification[]> {
  const notifications: ReleaseNotification[] = []

  try {
    // Fetch watch providers from TMDB
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`
    )

    if (!response.ok) return notifications

    const data = await response.json()
    const providers = data.results?.US || {}

    // Check for streaming services (not rent/buy)
    const streamingServices = providers.flatrate || []

    if (streamingServices.length === 0) return notifications

    // Check if we already have a notification for this streaming availability
    const { data: existingNotifications } = await supabase
      .from('release_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('notification_type', 'streaming_available')
      .is('seen_at', null) // Only check unseen notifications

    if (existingNotifications && existingNotifications.length > 0) {
      // Already notified, skip
      return notifications
    }

    // Create notification for each streaming service
    for (const service of streamingServices) {
      notifications.push({
        user_id: userId,
        media_id: mediaId,
        release_date: new Date().toISOString().split('T')[0], // Today
        notification_type: 'streaming_available',
        streaming_service: service.provider_name
      })
    }
  } catch (error) {
    console.error(`Error checking streaming availability for ${mediaId}:`, error)
  }

  return notifications
}

/**
 * Check for upcoming releases for a specific user
 */
export async function checkUserReleases(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<ReleaseNotification[]> {
  const allNotifications: ReleaseNotification[] = []

  try {
    // Get shows user has watched
    const { data: watchedShows } = await supabase
      .from('watch_status')
      .select(`
        media_id,
        media:media_id (
          id,
          tmdb_id,
          media_type
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'watched')
      .eq('media.media_type', 'tv')

    if (watchedShows) {
      for (const watch of watchedShows) {
        const media = watch.media as any
        if (media && media.tmdb_id && media.media_type === 'tv') {
          const notifications = await checkUpcomingTVSeasons(
            supabase,
            userId,
            media.id,
            media.tmdb_id
          )
          allNotifications.push(...notifications)
        }
      }
    }

    // Get movies user has watched (for streaming availability checks)
    const { data: watchedMovies } = await supabase
      .from('watch_status')
      .select(`
        media_id,
        media:media_id (
          id,
          tmdb_id,
          media_type
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'watched')
      .eq('media.media_type', 'movie')

    if (watchedMovies) {
      for (const watch of watchedMovies) {
        const media = watch.media as any
        if (media && media.tmdb_id && media.media_type === 'movie') {
          const notifications = await checkStreamingAvailability(
            supabase,
            userId,
            media.id,
            media.tmdb_id
          )
          allNotifications.push(...notifications)
        }
      }
    }

    // Check for upcoming movie releases (general, not user-specific)
    const movieNotifications = await checkUpcomingMovieReleases(supabase, userId, 30)
    allNotifications.push(...movieNotifications)

    // Save notifications to database
    if (allNotifications.length > 0) {
      await supabase
        .from('release_notifications')
        .insert(allNotifications)
        .onConflict('id')
        .ignore()
    }
  } catch (error) {
    console.error(`Error checking releases for user ${userId}:`, error)
  }

  return allNotifications
}

/**
 * Check releases for all users (background job)
 */
export async function checkAllUsersReleases(
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  try {
    // Get all users
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1000)

    if (!users) return

    console.log(`Checking releases for ${users.length} users...`)

    for (const user of users) {
      try {
        await checkUserReleases(supabase, user.id)
      } catch (error) {
        console.error(`Error checking releases for user ${user.id}:`, error)
      }
    }

    console.log('Release checking complete!')
  } catch (error) {
    console.error('Error in checkAllUsersReleases:', error)
  }
}


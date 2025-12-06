/**
 * TMDB API Utilities
 * Helper functions for fetching data from TMDB via our API proxy
 */

export interface TMDBShow {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  first_air_date?: string
  release_date?: string
  media_type?: 'tv' | 'movie'
  genre_ids?: number[]
}

export interface TMDBSimilarResponse {
  page: number
  results: TMDBShow[]
  total_pages: number
  total_results: number
}

export interface TMDBTVDetails {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  first_air_date: string
  next_episode_to_air?: {
    id: number
    air_date: string
    episode_number: number
    season_number: number
    name: string
  }
  last_episode_to_air?: {
    air_date: string
    episode_number: number
    season_number: number
  }
  number_of_seasons: number
  status: string  // 'Returning Series', 'Ended', 'Canceled', etc.
  seasons: Array<{
    id: number
    season_number: number
    air_date: string
    episode_count: number
    name: string
    poster_path: string | null
  }>
}

/**
 * Get similar shows for a TV series
 */
export async function getSimilarTVShows(tmdbId: number): Promise<TMDBShow[]> {
  try {
    const response = await fetch(`/api/tmdb/tv/${tmdbId}/similar`)
    if (!response.ok) {
      console.error('Failed to fetch similar TV shows:', response.status)
      return []
    }
    const data: TMDBSimilarResponse = await response.json()
    return data.results.map(show => ({ ...show, media_type: 'tv' as const }))
  } catch (error) {
    console.error('Error fetching similar TV shows:', error)
    return []
  }
}

/**
 * Get similar movies
 */
export async function getSimilarMovies(tmdbId: number): Promise<TMDBShow[]> {
  try {
    const response = await fetch(`/api/tmdb/movie/${tmdbId}/similar`)
    if (!response.ok) {
      console.error('Failed to fetch similar movies:', response.status)
      return []
    }
    const data: TMDBSimilarResponse = await response.json()
    return data.results.map(movie => ({ ...movie, media_type: 'movie' as const }))
  } catch (error) {
    console.error('Error fetching similar movies:', error)
    return []
  }
}

/**
 * Get similar shows (auto-detects TV vs movie based on media type)
 */
export async function getSimilarShows(tmdbId: number, mediaType: 'tv' | 'movie'): Promise<TMDBShow[]> {
  if (mediaType === 'tv') {
    return getSimilarTVShows(tmdbId)
  } else {
    return getSimilarMovies(tmdbId)
  }
}

/**
 * Get TV show details including next_episode_to_air for upcoming seasons
 */
export async function getTVShowDetails(tmdbId: number): Promise<TMDBTVDetails | null> {
  try {
    const response = await fetch(`/api/tmdb/tv/${tmdbId}`)
    if (!response.ok) {
      console.error('Failed to fetch TV show details:', response.status)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching TV show details:', error)
    return null
  }
}

/**
 * Check if a TV show has a truly upcoming season (not yet started)
 * Only returns seasons where the first episode hasn't aired yet
 */
export async function getUpcomingSeasonInfo(tmdbId: number): Promise<{
  hasUpcoming: boolean
  airDate: string | null
  seasonNumber: number | null
}> {
  const details = await getTVShowDetails(tmdbId)
  
  if (!details) {
    return { hasUpcoming: false, airDate: null, seasonNumber: null }
  }
  
  const today = new Date().toISOString().split('T')[0]
  
  // Look for seasons that haven't started yet (air_date is in the future)
  // Sort seasons by number to get them in order
  const sortedSeasons = [...details.seasons]
    .filter(s => s.season_number > 0) // Exclude specials (season 0)
    .sort((a, b) => a.season_number - b.season_number)
  
  for (const season of sortedSeasons) {
    // Check if this season's air_date is in the future
    if (season.air_date && season.air_date > today) {
      return {
        hasUpcoming: true,
        airDate: season.air_date,
        seasonNumber: season.season_number
      }
    }
  }
  
  // Also check next_episode_to_air, but ONLY if it's episode 1 of a season
  // (meaning the season hasn't started yet)
  if (details.next_episode_to_air) {
    const nextEp = details.next_episode_to_air
    if (nextEp.episode_number === 1 && nextEp.air_date > today) {
      return {
        hasUpcoming: true,
        airDate: nextEp.air_date,
        seasonNumber: nextEp.season_number
      }
    }
  }
  
  return { hasUpcoming: false, airDate: null, seasonNumber: null }
}


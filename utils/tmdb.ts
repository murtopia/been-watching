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
  vote_count?: number
  popularity?: number
  first_air_date?: string
  release_date?: string
  media_type?: 'tv' | 'movie'
  genre_ids?: number[]
}

/**
 * Filter and score similar shows based on relevance
 * Higher score = better match
 */
export function scoreSimilarShow(
  show: TMDBShow,
  sourceGenres: number[],
  minVoteCount: number = 50
): number {
  let score = 0
  
  // Must have enough votes to be considered (filter out obscure content)
  if ((show.vote_count || 0) < minVoteCount) {
    return -1 // Exclude
  }
  
  // Genre overlap bonus (max 30 points)
  const showGenres = show.genre_ids || []
  const genreOverlap = showGenres.filter(g => sourceGenres.includes(g)).length
  score += genreOverlap * 10 // 10 points per matching genre
  
  // Vote average bonus (max 20 points)
  // Scale: 0-10 rating → 0-20 points
  score += (show.vote_average || 0) * 2
  
  // Popularity bonus (max 50 points)
  // TMDB popularity scores vary widely, so we cap at reasonable levels
  const popularity = show.popularity || 0
  if (popularity > 100) score += 50
  else if (popularity > 50) score += 40
  else if (popularity > 20) score += 30
  else if (popularity > 10) score += 20
  else if (popularity > 5) score += 10
  
  return score
}

/**
 * Filter and sort similar shows by relevance
 */
export function filterAndSortSimilarShows(
  shows: TMDBShow[],
  sourceGenres: number[],
  minVoteCount: number = 50,
  limit: number = 10
): TMDBShow[] {
  return shows
    .map(show => ({
      show,
      score: scoreSimilarShow(show, sourceGenres, minVoteCount)
    }))
    .filter(item => item.score >= 0) // Exclude items with -1 score
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, limit)
    .map(item => item.show)
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
 * Get show details to extract genre_ids
 */
export async function getShowGenres(tmdbId: number, mediaType: 'tv' | 'movie'): Promise<number[]> {
  try {
    const endpoint = mediaType === 'tv' ? `tv/${tmdbId}` : `movie/${tmdbId}`
    const response = await fetch(`/api/tmdb/${endpoint}`)
    if (!response.ok) return []
    const data = await response.json()
    // TMDB returns genres as objects with id and name
    return (data.genres || []).map((g: { id: number }) => g.id)
  } catch (error) {
    console.error('Error fetching show genres:', error)
    return []
  }
}

/**
 * Get similar shows for a TV series (raw, unfiltered)
 */
async function getSimilarTVShowsRaw(tmdbId: number): Promise<TMDBShow[]> {
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
 * Get similar movies (raw, unfiltered)
 */
async function getSimilarMoviesRaw(tmdbId: number): Promise<TMDBShow[]> {
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
 * Get similar shows with genre filtering and popularity weighting
 * Returns shows sorted by relevance score
 */
export async function getSimilarShows(
  tmdbId: number, 
  mediaType: 'tv' | 'movie',
  options?: {
    minVoteCount?: number
    limit?: number
    filterByGenre?: boolean
  }
): Promise<TMDBShow[]> {
  const { minVoteCount = 50, limit = 10, filterByGenre = true } = options || {}
  
  // Get raw similar shows
  const rawShows = mediaType === 'tv' 
    ? await getSimilarTVShowsRaw(tmdbId)
    : await getSimilarMoviesRaw(tmdbId)
  
  if (rawShows.length === 0) return []
  
  // Get source show genres for filtering
  let sourceGenres: number[] = []
  if (filterByGenre) {
    sourceGenres = await getShowGenres(tmdbId, mediaType)
  }
  
  // Filter and sort by relevance
  return filterAndSortSimilarShows(rawShows, sourceGenres, minVoteCount, limit)
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


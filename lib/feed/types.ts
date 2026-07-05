/**
 * Shared types for the server-assembled feed (/api/feed/v2)
 */

export interface FeedProfileLite {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export interface DigestShowItem {
  mediaId: string
  tmdbId: number | null
  title: string
  posterPath: string | null
  mediaType: 'tv' | 'movie'
  /** Most significant action in the period */
  action: 'loved' | 'liked' | 'meh' | 'watching' | 'want' | 'watched'
  rating: 'meh' | 'like' | 'love' | null
  status: 'want' | 'watching' | 'watched' | null
  lastActivityAt: string
  commentCount: number
  /** Season number if this is a season row */
  season: number | null
  overview: string | null
  year: number | null
  genres: string[]
  voteAverage: number | null
}

export interface FriendDigest {
  user: FeedProfileLite
  periodLabel: string
  items: DigestShowItem[]
  totals: { rated: number; statusChanges: number }
  lastActivityAt: string
}

export interface ChartEntry {
  rank: number
  title: string
  tmdbId: number | null
  posterPath: string | null
  metricLabel: string | null
  metricValue: number | null
  isNew: boolean
  weeksOnChart: number | null
  /** Best matching media row in our DB (latest season for TV), if any */
  dbMediaId: string | null
  /** Friends tracking this show */
  friends: Array<{ id: string; name: string; avatar: string | null }>
}

export interface PlatformChart {
  platform: string
  platformLabel: string
  source: string
  sourceLabel: string
  period: 'day' | 'week'
  chartDate: string
  tv: ChartEntry[]
  movies: ChartEntry[]
}

export interface VlyItem {
  mediaId: string
  tmdbId: number | null
  title: string
  posterPath: string | null
  mediaType: 'tv' | 'movie'
  season: number | null
  overview: string | null
  year: number | null
  genres: string[]
  voteAverage: number | null
  /** How many similar viewers loved/liked it */
  supporters: number
}

export interface ComingSoonItem {
  mediaId: string
  tmdbId: number | null
  title: string
  posterPath: string | null
  airDate: string
  season: number | null
  overview: string | null
  genres: string[]
  voteAverage: number | null
  hasReminder: boolean
}

export interface BylItem {
  sourceTitle: string
  tmdbId: number
  mediaType: 'tv' | 'movie'
  title: string
  posterPath: string | null
  overview: string | null
  year: number | null
  genreIds: number[]
  voteAverage: number | null
}

export interface FollowSuggestionItem {
  id: string
  name: string
  username: string
  avatar: string
  matchPercentage: number
  bio: string
  stats: { wantToWatch: number; watching: number; watched: number }
  friendsInCommon: { count: number; avatars: string[] }
}

export interface FeedV2Response {
  digests: FriendDigest[]
  charts: PlatformChart[]
  viewersLikeYou: VlyItem[]
  comingSoon: ComingSoonItem[]
  becauseYouLiked: BylItem[]
  followSuggestions: FollowSuggestionItem[]
  userRatings: Record<string, 'meh' | 'like' | 'love'>
  userStatuses: Record<string, 'want' | 'watching' | 'watched'>
  friendCount: number
}

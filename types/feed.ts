/**
 * Feed Card Types and Interfaces
 *
 * Type definitions for the activity feed card system
 */

export type ActivityType = 'loved' | 'watching' | 'watched' | 'want-to-watch'
export type NotificationType = 'coming-soon' | 'now-streaming' | 'top-update'
export type RecommendationType = 'similar-taste' | 'social'

export interface User {
  id: string
  name: string
  username: string
  avatar: string
}

export interface Media {
  id: string
  title: string
  year: number
  genres: string[]
  rating: number
  posterUrl: string
  synopsis: string
  creator?: string
  cast?: string[]
  network?: string
  trailer?: string
  seasonNumber?: number
  episodeNumber?: number
}

export interface Comment {
  id: string
  user: User
  text: string
  timestamp: Date
  likeCount: number
}

export interface FriendStats {
  avatars: User[]
  count: number
}

export interface RatingStats {
  meh: number
  like: number
  love: number
}

// Base card interface
export interface BaseCardData {
  id: string
  timestamp: Date
  media: Media
  stats: {
    likeCount: number
    commentCount: number
  }
}

// Card 1: User Activity Card
export interface UserActivityCard extends BaseCardData {
  type: 'user-activity'
  user: User
  activityType: ActivityType
  friends: FriendStats & {
    watching?: User[]
    wantToWatch?: User[]
    watched?: User[]
  }
  ratings: RatingStats
  comments: Comment[]
}

// Card 2: Recommendation Card (Because You Liked)
export interface RecommendationCard extends BaseCardData {
  type: 'recommendation'
  recommendationType: RecommendationType
  basedOn: {
    mediaId: string
    title: string
  }
  friends: FriendStats
}

// Card 3: Group Activity Card (Your Friends Loved)
export interface GroupActivityCard extends BaseCardData {
  type: 'group-activity'
  activityType: ActivityType
  friends: FriendStats
  ratings: RatingStats
  comments: Comment[]
}

// Card 4: Coming Soon Card
export interface ComingSoonCard extends BaseCardData {
  type: 'coming-soon'
  releaseDate: Date
  friends: FriendStats
}

// Card 5: Now Streaming Card
export interface NowStreamingCard extends BaseCardData {
  type: 'now-streaming'
  streamingService: string
  friends: FriendStats
}

// Card 6: Top Update Card
export interface TopUpdateCard extends BaseCardData {
  type: 'top-update'
  ranking: number
  previousRanking?: number
  category: 'shows' | 'movies'
  friends: FriendStats
}

// Card 7: Follow Suggestions
export interface FollowSuggestion {
  user: User
  matchPercentage: number
  bio: string
  stats: {
    wantToWatch: number
    watching: number
    watched: number
  }
  mutualFriends: FriendStats
  isFollowing: boolean
}

export interface FollowSuggestionsCard {
  type: 'follow-suggestions'
  id: string
  timestamp: Date
  suggestions: FollowSuggestion[]
}

// Union type for all card types
export type FeedCard =
  | UserActivityCard
  | RecommendationCard
  | GroupActivityCard
  | ComingSoonCard
  | NowStreamingCard
  | TopUpdateCard
  | FollowSuggestionsCard

// Analytics tracking types
export interface CardAnalytics {
  cardId: string
  cardType: FeedCard['type']
  action: 'view' | 'like' | 'comment' | 'share' | 'flip' | 'click-media' | 'click-user' | 'follow'
  metadata?: Record<string, any>
}

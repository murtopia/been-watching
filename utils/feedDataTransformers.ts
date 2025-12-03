/**
 * Feed Data Transformers
 * 
 * Utilities to transform API responses from Supabase into
 * the data formats expected by our React feed card components.
 * 
 * API Data → FeedCardData / UserActivityCardData
 */

import { 
  FeedCardData, 
  UserActivityCardData, 
  FeedCardBadge, 
  FeedCardUser,
  FeedCardMedia,
  BADGE_PRESETS 
} from '@/components/feed/UserActivityCard'

// ============================================================================
// API Response Types (from Supabase)
// ============================================================================

export interface APIActivity {
  id: string
  user_id: string
  media_id: string
  activity_type: 'rated' | 'status_changed' | 'commented' | 'top_spot_updated'
  activity_data: {
    rating?: 'meh' | 'like' | 'love'
    status?: 'want' | 'watching' | 'watched'
    previous_status?: 'want' | 'watching' | 'watched'
    top_spot_rank?: 1 | 2 | 3
  }
  activity_group_id?: string
  created_at: string
  
  // Joined data
  profiles: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  
  media: APIMedia
  
  // Enriched data (added by feed page)
  comments?: APIComment[]
  likes?: APILike[]
  like_count?: number
  comment_count?: number
  user_liked?: boolean
}

export interface APIMedia {
  id: string
  tmdb_id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  release_date: string | null
  vote_average: number | null
  media_type: 'movie' | 'tv'
  tmdb_data?: {
    genres?: Array<{ id: number; name: string }>
    created_by?: Array<{ id: number; name: string }>
    credits?: {
      cast?: Array<{ name: string; character: string; profile_path: string | null }>
    }
    networks?: Array<{ id: number; name: string; logo_path: string }>
    production_companies?: Array<{ id: number; name: string; logo_path: string | null }>
    number_of_seasons?: number
    seasons?: Array<{ season_number: number; name: string }>
    videos?: { results: Array<{ key: string; type: string; site: string }> }
    similar?: { results: Array<{ id: number; title?: string; name?: string; poster_path: string }> }
  }
}

export interface APIComment {
  id: string
  comment_text: string
  user_id: string
  created_at: string
  user?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  like_count?: number
  user_liked?: boolean
}

export interface APILike {
  id: string
  user_id: string
  user?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface APIFriendsActivity {
  watching: Array<{ user_id: string; avatar_url: string | null; display_name: string }>
  wantToWatch: Array<{ user_id: string; avatar_url: string | null; display_name: string }>
  watched: Array<{ user_id: string; avatar_url: string | null; display_name: string }>
  ratings: {
    meh: number
    like: number
    love: number
  }
  userRating?: 'meh' | 'like' | 'love'
  userStatus?: 'want' | 'watching' | 'watched'
}

export interface APIShowComment {
  id: string
  user_id: string
  comment_text: string
  created_at: string
  user?: {
    display_name: string
    avatar_url: string | null
  }
  like_count?: number
  user_liked?: boolean
}

// ============================================================================
// Transformation Functions
// ============================================================================

/**
 * Get the TMDB image URL for a poster or profile
 */
export function getTMDBImageUrl(path: string | null, size: 'w500' | 'original' = 'original'): string {
  if (!path) return '/images/placeholder-poster.jpg'
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/${size}${path}`
}

/**
 * Transform API media to FeedCardMedia format
 */
export function transformMedia(media: APIMedia, streamingPlatforms?: string[]): FeedCardMedia {
  const tmdb = media.tmdb_data || {}
  const genres = tmdb.genres?.map(g => g.name) || []
  const creator = tmdb.created_by?.[0]?.name || ''
  const cast = tmdb.credits?.cast?.slice(0, 4).map(c => c.name) || []
  
  // For TV shows: use networks, for movies: use production_companies (fallback if no streaming platforms)
  const isTV = media.media_type === 'tv'
  const network = isTV 
    ? (tmdb.networks?.[0]?.name || '')
    : (tmdb.production_companies?.[0]?.name || '')
  
  const year = media.release_date ? new Date(media.release_date).getFullYear() : 0
  
  // Extract season number from media ID if present (format: tv-{id}-s{season})
  let season: number | undefined
  if (media.id.includes('-s')) {
    const match = media.id.match(/-s(\d+)$/)
    if (match) season = parseInt(match[1])
  }
  
  return {
    id: media.id,
    title: media.title,
    year,
    genres: genres.slice(0, 2), // Max 2 genres for display
    rating: media.vote_average || 0,
    posterUrl: getTMDBImageUrl(media.poster_path || media.backdrop_path),
    synopsis: media.overview || '',
    creator,
    cast,
    network, // Keep for backward compatibility
    streamingPlatforms: streamingPlatforms || [],
    season,
    mediaType: media.media_type === 'tv' ? 'TV' : 'Movie'
  }
}

/**
 * Transform API user profile to FeedCardUser format
 */
export function transformUser(profile: APIActivity['profiles']): FeedCardUser {
  return {
    id: profile.id,
    name: profile.display_name || profile.username,
    username: profile.username,
    avatar: profile.avatar_url || '/images/default-avatar.png'
  }
}

/**
 * Transform API comments to card comment format
 */
export function transformComments(comments: APIComment[] | undefined): FeedCardData['comments'] {
  if (!comments) return []
  
  return comments.map(c => ({
    id: c.id,
    user: {
      name: c.user?.display_name || 'Unknown',
      avatar: c.user?.avatar_url || '/images/default-avatar.png'
    },
    text: c.comment_text,
    timestamp: formatTimeAgo(c.created_at),
    likes: c.like_count || 0,
    userLiked: c.user_liked || false
  }))
}

/**
 * Transform show comments (different from activity comments)
 */
export function transformShowComments(comments: APIShowComment[] | undefined): FeedCardData['showComments'] {
  if (!comments) return []
  
  return comments.map(c => ({
    id: c.id,
    user: {
      name: c.user?.display_name || 'Unknown',
      avatar: c.user?.avatar_url || '/images/default-avatar.png'
    },
    text: c.comment_text,
    timestamp: formatTimeAgo(c.created_at),
    likes: c.like_count || 0,
    userLiked: c.user_liked || false
  }))
}

// Custom badges for ratings not in BADGE_PRESETS
const RATING_BADGES: Record<string, FeedCardBadge> = {
  love: {
    text: 'Loved',
    icon: 'heart',
    color: 'rgba(255, 59, 92, 0.25)',
    borderColor: 'rgba(255, 59, 92, 0.5)',
    textColor: 'white',
  },
  like: {
    text: 'Liked',
    icon: 'thumbs-up',
    color: 'rgba(59, 130, 246, 0.25)',
    borderColor: 'rgba(59, 130, 246, 0.5)',
    textColor: 'white',
  },
  meh: {
    text: 'Meh',
    icon: 'meh-face',
    color: 'rgba(142, 142, 147, 0.25)',
    borderColor: 'rgba(142, 142, 147, 0.5)',
    textColor: 'white',
  }
}

/**
 * Get appropriate badges based on activity type and data
 */
export function getActivityBadges(activity: APIActivity): FeedCardBadge[] {
  const badges: FeedCardBadge[] = []
  const data = activity.activity_data
  
  // Add rating badge if present
  if (data.rating && RATING_BADGES[data.rating]) {
    badges.push(RATING_BADGES[data.rating])
  }
  
  // Add status badge if present
  if (data.status) {
    switch (data.status) {
      case 'watching':
        badges.push(BADGE_PRESETS.watching)
        break
      case 'want':
        badges.push(BADGE_PRESETS.wantToWatch)
        break
      case 'watched':
        badges.push(BADGE_PRESETS.watched)
        break
    }
  }
  
  // Handle top 3 update
  if (activity.activity_type === 'top_spot_updated' && data.top_spot_rank) {
    badges.push(BADGE_PRESETS.top3Update(data.top_spot_rank))
  }
  
  return badges
}

/**
 * Format a timestamp to "X ago" format
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString()
}

/**
 * Transform friends activity data
 */
export function transformFriendsActivity(
  friendsData: APIFriendsActivity | undefined,
  userRating?: 'meh' | 'like' | 'love' | null,
  userStatus?: 'want' | 'watching' | 'watched' | null
): FeedCardData['friendsActivity'] {
  if (!friendsData) {
    return {
      watching: { count: 0, avatars: [] },
      wantToWatch: { count: 0, avatars: [] },
      watched: { count: 0, avatars: [] },
      ratings: { meh: 0, like: 0, love: 0, userRating: userRating || undefined }
    }
  }
  
  return {
    watching: {
      count: friendsData.watching.length,
      avatars: friendsData.watching.slice(0, 3).map(f => f.avatar_url || '/images/default-avatar.png')
    },
    wantToWatch: {
      count: friendsData.wantToWatch.length,
      avatars: friendsData.wantToWatch.slice(0, 3).map(f => f.avatar_url || '/images/default-avatar.png')
    },
    watched: {
      count: friendsData.watched.length,
      avatars: friendsData.watched.slice(0, 3).map(f => f.avatar_url || '/images/default-avatar.png')
    },
    ratings: {
      meh: friendsData.ratings.meh,
      like: friendsData.ratings.like,
      love: friendsData.ratings.love,
      userRating: userRating || friendsData.userRating || undefined
    }
  }
}

/**
 * Get friends display text
 */
export function getFriendsText(activity: APIActivity, friendsData?: APIFriendsActivity): string {
  const totalFriends = friendsData 
    ? friendsData.watching.length + friendsData.wantToWatch.length + friendsData.watched.length
    : 0
  
  if (totalFriends === 0) return ''
  
  // Determine text based on activity type
  const data = activity.activity_data
  if (data.rating === 'love') {
    return `${totalFriends} friends also loved this`
  }
  if (data.status === 'watched') {
    return `${totalFriends} friends watched this`
  }
  if (data.status === 'watching') {
    return `${totalFriends} friends are watching this`
  }
  
  return `${totalFriends} friends know this show`
}

// ============================================================================
// Main Transformation Functions
// ============================================================================

/**
 * Transform a user activity (Card 1, 6) from API to component props
 */
export function activityToUserActivityCardData(
  activity: APIActivity,
  friendsData?: APIFriendsActivity,
  showComments?: APIShowComment[],
  userRating?: 'meh' | 'like' | 'love' | null,
  userStatus?: 'want' | 'watching' | 'watched' | null,
  userLiked?: boolean,
  likeCount?: number,
  streamingPlatforms?: string[]
): UserActivityCardData {
  const badges = getActivityBadges(activity)
  const friendsActivity = transformFriendsActivity(friendsData, userRating, userStatus)
  
  // Get activity type for legacy format
  let activityType: UserActivityCardData['activityType'] = 'watched'
  if (activity.activity_data.rating === 'love') activityType = 'loved'
  else if (activity.activity_data.status === 'watching') activityType = 'watching'
  else if (activity.activity_data.status === 'want') activityType = 'want-to-watch'
  
  // Build friends avatars from watching/watched/want data
  const allFriends = [
    ...(friendsData?.watching || []),
    ...(friendsData?.wantToWatch || []),
    ...(friendsData?.watched || [])
  ].slice(0, 3)
  
  return {
    id: activity.id,
    user: transformUser(activity.profiles),
    timestamp: formatTimeAgo(activity.created_at),
    activityType,
    activityBadges: badges.map(b => ({
      text: b.text,
      color: b.color,
      borderColor: b.borderColor,
      textColor: b.textColor || 'white'
    })),
    media: transformMedia(activity.media, streamingPlatforms),
    friends: {
      avatars: allFriends.map(f => ({
        id: f.user_id,
        name: f.display_name,
        username: '',
        avatar: f.avatar_url || '/images/default-avatar.png'
      })),
      count: allFriends.length,
      text: getFriendsText(activity, friendsData)
    },
    stats: {
      likeCount: likeCount !== undefined ? likeCount : (activity.like_count || 0),
      commentCount: activity.comment_count || 0,
      userLiked: userLiked !== undefined ? userLiked : (activity.user_liked || false)
    },
    friendsActivity,
    comments: transformComments(activity.comments),
    showComments: transformShowComments(showComments)
  }
}

/**
 * Transform a recommendation (Cards 2, 3, 5, 8) from API to component props
 */
export function recommendationToFeedCardData(
  media: APIMedia,
  friendsData?: APIFriendsActivity,
  showComments?: APIShowComment[]
): FeedCardData {
  const friendsActivity = transformFriendsActivity(friendsData)
  
  // Build friends list from activity data
  const allFriends = [
    ...(friendsData?.watching || []),
    ...(friendsData?.wantToWatch || []),
    ...(friendsData?.watched || [])
  ].slice(0, 3)
  
  const totalFriends = friendsData 
    ? friendsData.watching.length + friendsData.wantToWatch.length + friendsData.watched.length
    : 0
  
  return {
    id: media.id,
    media: transformMedia(media),
    friends: {
      avatars: allFriends.map(f => ({
        id: f.user_id,
        name: f.display_name,
        username: '',
        avatar: f.avatar_url || '/images/default-avatar.png'
      })),
      count: totalFriends,
      text: totalFriends > 0 ? `${totalFriends} friends know this show` : ''
    },
    stats: {
      likeCount: 0, // Recommendations don't have likes
      commentCount: showComments?.length || 0,
      userLiked: false
    },
    friendsActivity,
    comments: [], // Recommendations don't have activity comments
    showComments: transformShowComments(showComments)
  }
}

/**
 * Get badge for recommendation type
 */
export function getRecommendationBadge(
  type: 'because_you_liked' | 'friends_loved' | 'you_might_like' | 'now_streaming' | 'coming_soon',
  sourceShowTitle?: string,
  releaseDate?: string,
  platform?: string
): FeedCardBadge {
  switch (type) {
    case 'because_you_liked':
      return BADGE_PRESETS.becauseYouLiked(sourceShowTitle || 'a show')
    case 'friends_loved':
      return BADGE_PRESETS.friendsLoved
    case 'you_might_like':
      return BADGE_PRESETS.youMightLike
    case 'now_streaming':
      return BADGE_PRESETS.nowStreaming(platform || 'streaming')
    case 'coming_soon':
      return BADGE_PRESETS.comingSoon(releaseDate || 'soon')
    default:
      return BADGE_PRESETS.youMightLike
  }
}


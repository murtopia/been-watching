import posthog from 'posthog-js'

// Helper to check if PostHog is available
const isPostHogAvailable = () => {
  return typeof window !== 'undefined' && posthog
}

// ============================================
// AUTHENTICATION EVENTS
// ============================================

export const trackUserSignedUp = (data: {
  signup_method: 'google' | 'email' | 'invite'
  invite_code?: string
  username: string
  email?: string
  display_name?: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('user_signed_up', {
    signup_method: data.signup_method,
    invite_code: data.invite_code,
    $set: {
      username: data.username,
      email: data.email,
      display_name: data.display_name,
    },
  })
}

export const trackUserLoggedIn = (data: {
  login_method: 'session' | 'token' | 'oauth'
  username?: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('user_logged_in', {
    login_method: data.login_method,
  })
}

export const trackUserLoggedOut = () => {
  if (!isPostHogAvailable()) return

  posthog.capture('user_logged_out')
}

// Identify user (call after login/signup)
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!isPostHogAvailable()) return

  posthog.identify(userId, properties)
}

// Reset user (call after logout)
export const resetUser = () => {
  if (!isPostHogAvailable()) return

  posthog.reset()
}

// ============================================
// CONTENT EVENTS
// ============================================

export const trackMediaRated = (data: {
  media_id: string
  media_type: 'movie' | 'tv'
  media_title: string
  rating: 'meh' | 'like' | 'love'
  season_number?: number
  has_comment: boolean
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('media_rated', data)
}

export const trackWatchStatusChanged = (data: {
  media_id: string
  media_type: 'movie' | 'tv'
  media_title: string
  old_status: 'want' | 'watching' | 'watched' | null
  new_status: 'want' | 'watching' | 'watched' | null
  season_number?: number
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('watch_status_changed', data)
}

export const trackTopShowAdded = (data: {
  media_id: string
  media_title: string
  position: 1 | 2 | 3
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('top_show_added', data)
}

export const trackTopShowRemoved = (data: {
  media_id: string
  media_title: string
  position: 1 | 2 | 3
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('top_show_removed', data)
}

export const trackShowCommentAdded = (data: {
  media_id: string
  media_title: string
  comment_length: number
  is_public: boolean
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('show_comment_added', data)
}

// ============================================
// SOCIAL EVENTS
// ============================================

export const trackUserFollowed = (data: {
  following_user_id: string
  following_username: string
  follow_type: 'public' | 'pending'
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('user_followed', data)
}

export const trackUserUnfollowed = (data: {
  unfollowed_user_id: string
  unfollowed_username: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('user_unfollowed', data)
}

export const trackActivityLiked = (data: {
  activity_id: string
  activity_type: string
  activity_user_id: string
  activity_username: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('activity_liked', data)
}

export const trackActivityUnliked = (data: {
  activity_id: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('activity_unliked', data)
}

export const trackActivityCommented = (data: {
  activity_id: string
  activity_type: string
  comment_length: number
  has_mentions: boolean
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('activity_commented', data)
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

export const trackFeedViewed = (data: {
  feed_type: 'following' | 'global'
  items_shown: number
  scroll_depth?: number
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('feed_viewed', data)
}

export const trackProfileViewed = (data: {
  viewed_user_id: string
  viewed_username: string
  is_own_profile: boolean
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('profile_viewed', data)
}

export const trackSearchPerformed = (data: {
  query: string
  results_count: number
  media_type_filter: 'all' | 'movie' | 'tv'
  result_clicked: boolean
  clicked_position?: number
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('search_performed', data)
}

export const trackMediaDetailViewed = (data: {
  media_id: string
  media_title: string
  media_type: 'movie' | 'tv'
  source: 'search' | 'feed' | 'profile' | 'direct'
  season_number?: number
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('media_detail_viewed', data)
}

export const trackMyShowsViewed = (data: {
  tab: 'want' | 'watching' | 'watched'
  view_mode: 'grid' | 'list'
  items_count: number
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('myshows_viewed', data)
}

// ============================================
// INVITE EVENTS
// ============================================

export const trackInviteGenerated = (data: {
  invite_method: 'link' | 'qr_code'
  max_uses?: number
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('invite_generated', data)
}

export const trackInviteShared = (data: {
  share_method: 'native' | 'clipboard' | 'social'
  invite_code: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('invite_shared', data)
}

export const trackInviteAccepted = (data: {
  invite_code: string
  inviter_user_id: string
  inviter_username: string
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('invite_accepted', data)
}

export const trackProfileCompletionProgress = (data: {
  completion_percentage: number
  completed_tasks: string[] // ['avatar', 'bio', 'top_3', 'add_want', 'add_watching', 'add_watched']
}) => {
  if (!isPostHogAvailable()) return

  posthog.capture('profile_completion_progress', data)
}

// ============================================
// SESSION EVENTS
// ============================================

export const trackSessionStarted = () => {
  if (!isPostHogAvailable()) return

  posthog.capture('session_started', {
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    is_mobile: typeof navigator !== 'undefined' ? /mobile/i.test(navigator.userAgent) : undefined,
  })
}

// ============================================
// FEATURE FLAGS (Advanced - for A/B testing)
// ============================================

export const isFeatureEnabled = (flagKey: string): boolean => {
  if (!isPostHogAvailable()) return false

  return posthog.isFeatureEnabled(flagKey) || false
}

export const getFeatureFlagPayload = (flagKey: string): any => {
  if (!isPostHogAvailable()) return null

  return posthog.getFeatureFlagPayload(flagKey)
}

// ============================================
// CUSTOM PROPERTIES (User attributes)
// ============================================

export const setUserProperty = (property: string, value: any) => {
  if (!isPostHogAvailable()) return

  posthog.setPersonProperties({
    [property]: value,
  })
}

export const setUserProperties = (properties: Record<string, any>) => {
  if (!isPostHogAvailable()) return

  posthog.setPersonProperties(properties)
}

// ============================================
// GROUPS (for organizations, teams, etc.)
// ============================================

export const setGroup = (groupType: string, groupKey: string, groupProperties?: Record<string, any>) => {
  if (!isPostHogAvailable()) return

  posthog.group(groupType, groupKey, groupProperties)
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Opt out of tracking
export const optOutTracking = () => {
  if (!isPostHogAvailable()) return

  posthog.opt_out_capturing()
  localStorage.setItem('analytics-consent', 'false')
}

// Opt in to tracking
export const optInTracking = () => {
  if (!isPostHogAvailable()) return

  posthog.opt_in_capturing()
  localStorage.setItem('analytics-consent', 'true')
}

// Check if tracking is enabled
export const isTrackingEnabled = (): boolean => {
  if (!isPostHogAvailable()) return false

  return !posthog.has_opted_out_capturing()
}

// Export posthog instance for advanced usage
export { posthog }

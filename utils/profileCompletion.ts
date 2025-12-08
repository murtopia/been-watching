import { createClient } from '@/utils/supabase/client'

export interface ProfileCompletionStatus {
  hasAvatar: boolean
  hasBio: boolean
  hasTopShows: boolean
  hasWant: boolean
  hasWatching: boolean
  hasWatched: boolean
  alreadyEarned: boolean
  isComplete: boolean
  completedCount: number
  totalCount: number
}

/**
 * Check if user has completed all profile requirements
 */
export async function checkProfileCompletion(userId: string): Promise<ProfileCompletionStatus> {
  const supabase = createClient()

  // Call the database function
  const { data, error} = await supabase
    .rpc('check_profile_completion', { user_id: userId })

  if (error) {
    console.error('Error checking profile completion:', error)
    // Return default uncompleted state
    return {
      hasAvatar: false,
      hasBio: false,
      hasTopShows: false,
      hasWant: false,
      hasWatching: false,
      hasWatched: false,
      alreadyEarned: false,
      isComplete: false,
      completedCount: 0,
      totalCount: 6
    }
  }

  // Database returns snake_case, convert to camelCase
  const dbData = data as any
  const status: ProfileCompletionStatus = {
    hasAvatar: dbData.has_avatar || false,
    hasBio: dbData.has_bio || false,
    hasTopShows: dbData.has_top_shows || false,
    hasWant: dbData.has_want || false,
    hasWatching: dbData.has_watching || false,
    hasWatched: dbData.has_watched || false,
    alreadyEarned: dbData.already_earned || false,
    isComplete: dbData.is_complete || false,
    completedCount: 0,
    totalCount: 6
  }

  // Calculate completed count
  const completedCount = [
    status.hasAvatar,
    status.hasBio,
    status.hasTopShows,
    status.hasWant,
    status.hasWatching,
    status.hasWatched
  ].filter(Boolean).length

  return {
    ...status,
    completedCount,
    totalCount: 6
  }
}

/**
 * Award profile completion invite if eligible
 * Returns true if invite was awarded, false if not eligible or already earned
 */
export async function awardProfileCompletionInvite(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('award_profile_completion_invite', { user_id: userId })

  if (error) {
    console.error('Error awarding profile completion invite:', error)
    return false
  }

  return data as boolean
}

/**
 * Get user's invite earning progress
 */
export interface InviteProgress {
  invitesRemaining: number
  invitesUsed: number
  profileInviteEarned: boolean
  watchlistMilestone: number
  referralInvitesEarned: number
  totalShows: number
  showsUntilNextInvite: number
  nextMilestone: number
}

export async function getInviteProgress(userId: string): Promise<InviteProgress | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_invite_progress', { target_user_id: userId })

  if (error) {
    console.error('Error getting invite progress:', error)
    return null
  }

  return {
    invitesRemaining: data.invites_remaining,
    invitesUsed: data.invites_used,
    profileInviteEarned: data.profile_invite_earned,
    watchlistMilestone: data.watchlist_milestone,
    referralInvitesEarned: data.referral_invites_earned,
    totalShows: data.total_shows,
    showsUntilNextInvite: data.shows_until_next_invite,
    nextMilestone: data.next_milestone
  }
}

/**
 * Get user-friendly labels for each completion step
 */
export function getCompletionStepLabel(step: keyof ProfileCompletionStatus): string {
  const labels: Record<string, string> = {
    hasAvatar: 'Upload an avatar photo',
    hasBio: 'Add a short bio',
    hasTopShows: 'Add your Top 3 favorite Shows',
    hasWant: 'Add a show to your Want to Watch list',
    hasWatching: 'Add a show to your Watching list',
    hasWatched: 'Add a show to your Watched list'
  }
  return labels[step] || step
}

/**
 * Get completion step description
 */
export function getCompletionStepDescription(step: keyof ProfileCompletionStatus): string {
  const descriptions: Record<string, string> = {
    hasAvatar: 'Add a profile picture',
    hasBio: 'Tell others about yourself',
    hasTopShows: 'Select your 3 favorite shows',
    hasWant: 'Add at least one show you want to watch',
    hasWatching: 'Add at least one show you\'re currently watching',
    hasWatched: 'Add at least one show you\'ve finished'
  }
  return descriptions[step] || ''
}

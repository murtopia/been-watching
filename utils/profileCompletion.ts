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
  const { data, error } = await supabase
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

  const status = data as ProfileCompletionStatus

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
 * Get user-friendly labels for each completion step
 */
export function getCompletionStepLabel(step: keyof ProfileCompletionStatus): string {
  const labels: Record<string, string> = {
    hasAvatar: 'Upload avatar',
    hasBio: 'Write bio',
    hasTopShows: 'Add Top 3 Shows',
    hasWant: 'Add to Want to Watch',
    hasWatching: 'Add to Currently Watching',
    hasWatched: 'Add to Finished Watching'
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

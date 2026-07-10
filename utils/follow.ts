import type { SupabaseClient } from '@supabase/supabase-js'

export interface FollowResult {
  /** Status of the follow row after the call */
  status: 'accepted' | 'pending'
  /** True if a row already existed and nothing was inserted */
  alreadyExisted: boolean
}

/**
 * Follow a user, respecting private-account approval and notification
 * preferences. Single source of truth for every follow surface (profile
 * pages, feed suggestions, onboarding).
 *
 * - Private target: inserts a `pending` follow + `follow_request`
 *   notification (always sent — the owner must act on it).
 * - Public target: inserts an `accepted` follow + `follow` notification,
 *   skipped if the target turned off `push_new_follower`.
 */
export async function followUser(
  supabase: SupabaseClient,
  followerId: string,
  targetId: string
): Promise<FollowResult> {
  const { data: existing } = await supabase
    .from('follows')
    .select('status')
    .eq('follower_id', followerId)
    .eq('following_id', targetId)
    .maybeSingle()

  if (existing) {
    return { status: existing.status === 'pending' ? 'pending' : 'accepted', alreadyExisted: true }
  }

  const { data: target } = await supabase
    .from('profiles')
    .select('is_private, push_new_follower')
    .eq('id', targetId)
    .single()

  const isPrivate = target?.is_private === true
  const status = isPrivate ? 'pending' : 'accepted'

  const { error: insertError } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: targetId,
    status
  })
  if (insertError) throw insertError

  const wantsFollowerNotifications = target?.push_new_follower !== false
  if (isPrivate || wantsFollowerNotifications) {
    await supabase.from('notifications').insert({
      user_id: targetId,
      actor_id: followerId,
      type: isPrivate ? 'follow_request' : 'follow',
      target_type: 'profile',
      target_id: targetId
    })
  }

  return { status, alreadyExisted: false }
}

/** Unfollow a user (deletes the follow row regardless of status). */
export async function unfollowUser(
  supabase: SupabaseClient,
  followerId: string,
  targetId: string
): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', targetId)
  if (error) throw error
}

/** Cancel an outgoing pending follow request and its notification. */
export async function cancelFollowRequest(
  supabase: SupabaseClient,
  followerId: string,
  targetId: string
): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', targetId)
    .eq('status', 'pending')
  if (error) throw error

  await supabase
    .from('notifications')
    .delete()
    .eq('actor_id', followerId)
    .eq('user_id', targetId)
    .eq('type', 'follow_request')
}

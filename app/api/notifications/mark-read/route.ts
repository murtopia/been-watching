import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/notifications/mark-read
 * Mark notification(s) as read
 * Body: { notificationIds: string[] } or { markAll: true }
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationIds, markAll } = body

    if (markAll) {
      // Mark all user's notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, markedAll: true })
    }

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'notificationIds array required' }, { status: 400 })
    }

    // Mark specific notifications as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', notificationIds)
      .eq('user_id', user.id) // Ensure user owns these notifications

    if (error) {
      console.error('Error marking notifications as read:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, marked: notificationIds.length })

  } catch (error: any) {
    console.error('Error in mark-read API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

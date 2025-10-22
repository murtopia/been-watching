import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for current user
 */
export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get unread count
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })

  } catch (error: any) {
    console.error('Error in unread-count API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

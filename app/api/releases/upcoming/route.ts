import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET /api/releases/upcoming
 * 
 * Returns upcoming release notifications for the authenticated user
 * 
 * Query params:
 * - limit: number of releases (default: 20)
 * - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get upcoming releases for user
    const today = new Date().toISOString().split('T')[0]

    const { data: releases, error } = await supabase
      .from('release_notifications')
      .select(`
        *,
        media:media_id (
          id,
          title,
          poster_path,
          backdrop_path,
          overview,
          release_date,
          vote_average,
          media_type,
          tmdb_data
        )
      `)
      .eq('user_id', user.id)
      .gte('release_date', today)
      .order('release_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching releases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch releases' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      releases: releases || [],
      limit,
      offset,
      hasMore: releases ? releases.length === limit : false
    })
  } catch (error) {
    console.error('Error in releases API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/releases/mark-seen
 * 
 * Mark a release notification as seen
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      )
    }

    // Update notification
    const { error } = await supabase
      .from('release_notifications')
      .update({ seen_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user can only update their own notifications

    if (error) {
      console.error('Error marking notification as seen:', error)
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in mark-seen API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


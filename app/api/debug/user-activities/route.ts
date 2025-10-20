import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get('username')
  const userId = searchParams.get('userId')

  if (!username && !userId) {
    return NextResponse.json({ error: 'username or userId required' }, { status: 400 })
  }

  const supabase = await createClient()

  // First, check if user exists (by username or userId)
  let query = supabase
    .from('profiles')
    .select('id, username, display_name')

  if (username) {
    query = query.eq('username', username)
  } else {
    query = query.eq('id', userId)
  }

  const { data: profileData, error: profileError } = await query.maybeSingle()

  if (profileError) {
    return NextResponse.json({
      error: 'Error fetching profile',
      details: profileError
    }, { status: 500 })
  }

  if (!profileData) {
    return NextResponse.json({
      error: 'User not found'
    }, { status: 404 })
  }

  const foundUserId = profileData.id

  // Check activities count
  const { count: activitiesCount, error: countError } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', foundUserId)

  // Get all activities (without join first)
  const { data: activitiesRaw, error: activitiesRawError } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', foundUserId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get activities WITH media join (same as profile page)
  // Using !left for LEFT JOIN to include activities even if media doesn't exist
  const { data: activitiesWithMedia, error: activitiesWithMediaError } = await supabase
    .from('activities')
    .select(`
      id,
      activity_type,
      activity_data,
      created_at,
      media:media_id!left (
        id,
        title,
        poster_path,
        media_type
      )
    `)
    .eq('user_id', foundUserId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Check media table for orphaned references
  const mediaIds = activitiesRaw?.map(a => a.media_id).filter(Boolean) || []
  const { data: mediaRecords, error: mediaError } = await supabase
    .from('media')
    .select('id, title')
    .in('id', mediaIds)

  return NextResponse.json({
    debug: {
      userId: foundUserId,
      profile: profileData,
      activitiesCount,
      activitiesRaw: {
        count: activitiesRaw?.length || 0,
        data: activitiesRaw,
        error: activitiesRawError
      },
      activitiesWithMedia: {
        count: activitiesWithMedia?.length || 0,
        data: activitiesWithMedia,
        error: activitiesWithMediaError
      },
      mediaRecords: {
        requestedIds: mediaIds,
        foundCount: mediaRecords?.length || 0,
        found: mediaRecords,
        error: mediaError
      }
    }
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET /api/recommendations
 * 
 * Returns personalized recommendations for the authenticated user
 * 
 * Query params:
 * - limit: number of recommendations (default: 20)
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

    // Get recommendations for user
    const { data: recommendations, error } = await supabase
      .from('recommendations')
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
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching recommendations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      )
    }

    // Update shown_at timestamp for recommendations that are being shown
    if (recommendations && recommendations.length > 0) {
      const recommendationIds = recommendations
        .filter(r => r.shown_at === null)
        .map(r => r.id)

      if (recommendationIds.length > 0) {
        await supabase
          .from('recommendations')
          .update({ shown_at: new Date().toISOString() })
          .in('id', recommendationIds)
      }
    }

    return NextResponse.json({
      recommendations: recommendations || [],
      limit,
      offset,
      hasMore: recommendations ? recommendations.length === limit : false
    })
  } catch (error) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


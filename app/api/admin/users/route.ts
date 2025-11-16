import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { checkAdminAccess } from '@/utils/admin/permissions'

export async function GET(request: NextRequest) {
  try {
    // Check if user has admin access (any role)
    const { hasAccess, role } = await checkAdminAccess()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const search = searchParams.get('search') || ''
    const roleFilter = searchParams.get('role') || null
    const statusFilter = searchParams.get('status') || null
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * pageSize

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Build the query with optimized single-query approach
    let query = adminClient
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        created_at,
        last_active_at,
        admin_role,
        is_admin
      `, { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      if (roleFilter === 'none') {
        query = query.is('admin_role', null)
      } else {
        query = query.eq('admin_role', roleFilter)
      }
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('account_status', statusFilter)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    if (sortBy === 'created_at' || sortBy === 'last_active_at') {
      query = query.order(sortBy, { ascending, nullsFirst: false })
    } else if (sortBy === 'username' || sortBy === 'display_name') {
      query = query.order(sortBy, { ascending })
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get stats for each user in a single batch query
    const userIds = users?.map(u => u.id) || []

    const [ratingsData, activitiesData, followingData, followersData] = await Promise.all([
      adminClient
        .from('ratings')
        .select('user_id')
        .in('user_id', userIds),
      adminClient
        .from('activities')
        .select('user_id, created_at')
        .in('user_id', userIds),
      adminClient
        .from('follows')
        .select('follower_id')
        .in('follower_id', userIds)
        .eq('status', 'accepted'),
      adminClient
        .from('follows')
        .select('following_id')
        .in('following_id', userIds)
        .eq('status', 'accepted'),
    ])

    // Aggregate stats by user
    const userStats = userIds.reduce((acc, userId) => {
      acc[userId] = {
        ratings: ratingsData.data?.filter(r => r.user_id === userId).length || 0,
        activities: activitiesData.data?.filter(a => a.user_id === userId).length || 0,
        following: followingData.data?.filter(f => f.follower_id === userId).length || 0,
        followers: followersData.data?.filter(f => f.following_id === userId).length || 0,
        lastActivityAt: activitiesData.data
          ?.filter(a => a.user_id === userId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at || null
      }
      return acc
    }, {} as Record<string, any>)

    // Combine users with their stats
    const usersWithStats = users?.map(user => ({
      ...user,
      stats: userStats[user.id] || {
        ratings: 0,
        activities: 0,
        following: 0,
        followers: 0,
        lastActivityAt: null
      }
    }))

    return NextResponse.json({
      users: usersWithStats || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      },
      filters: {
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      }
    })

  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

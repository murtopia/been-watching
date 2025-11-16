import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { checkAdminAccess, AdminRole } from '@/utils/admin/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Check if user has permission to grant roles
    const { hasAccess, role: adminRole, userId: adminUserId } = await checkAdminAccess('canGrantAdmin')

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { newRole, reason } = body as { newRole: AdminRole; reason?: string }

    // Validate new role
    if (newRole && !['owner', 'admin', 'analyst', null].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Only owners can grant owner role
    if (newRole === 'owner' && adminRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can grant owner role' },
        { status: 403 }
      )
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Get current user data
    const { data: targetUser } = await adminClient
      .from('profiles')
      .select('admin_role, username')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const oldRole = targetUser.admin_role

    // Update the user's role
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ admin_role: newRole })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating role:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the role change in audit history
    const { error: historyError } = await adminClient
      .from('admin_role_history')
      .insert({
        user_id: userId,
        changed_by_user_id: adminUserId,
        old_role: oldRole,
        new_role: newRole,
        reason: reason || null
      })

    if (historyError) {
      console.error('Error logging role history:', historyError)
      // Don't fail the request if history logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Role updated from ${oldRole || 'none'} to ${newRole || 'none'}`,
      user: {
        id: userId,
        username: targetUser.username,
        oldRole,
        newRole
      }
    })

  } catch (error: any) {
    console.error('Grant role API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update role' },
      { status: 500 }
    )
  }
}

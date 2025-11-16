/**
 * Admin Permission System
 *
 * Role-based access control for the admin console
 * Roles: Owner > Admin > Analyst > None
 */

import { createClient } from '@/utils/supabase/server'

// Re-export AdminRole type from roles.ts (client-safe)
export type { AdminRole } from '@/utils/admin/roles'

export interface AdminPermissions {
  // View access
  canView: boolean

  // User management
  canManageUsers: boolean
  canGrantAdmin: boolean
  canGrantAnalyst: boolean
  canRevokeAdmin: boolean

  // Content moderation
  canModerate: boolean
  canDeleteContent: boolean
  canBanUsers: boolean

  // Communication
  canSendAnnouncements: boolean
  canSendEmails: boolean

  // System
  canManageInvites: boolean
  canExportData: boolean
  canViewSystemHealth: boolean

  // Ownership
  canChangeOwner: boolean
}

/**
 * Get permission object for a given role
 */
export function getAdminPermissions(role: AdminRole): AdminPermissions {
  const isOwner = role === 'owner'
  const isAdmin = role === 'admin' || isOwner
  const isAnalyst = role === 'analyst' || isAdmin

  return {
    // View - all admin roles can view
    canView: isAnalyst,

    // User management - admins only
    canManageUsers: isAdmin,
    canGrantAdmin: isAdmin,
    canGrantAnalyst: isAdmin,
    canRevokeAdmin: isAdmin,

    // Moderation - admins only
    canModerate: isAdmin,
    canDeleteContent: isAdmin,
    canBanUsers: isAdmin,

    // Communication - admins only
    canSendAnnouncements: isAdmin,
    canSendEmails: isAdmin,

    // System - admins only
    canManageInvites: isAdmin,
    canExportData: isAdmin, // Only admins can export data
    canViewSystemHealth: isAdmin,

    // Ownership - owners only
    canChangeOwner: isOwner,
  }
}

/**
 * Check if a role has a specific permission
 */
export function requirePermission(
  userRole: AdminRole,
  permission: keyof AdminPermissions
): boolean {
  const permissions = getAdminPermissions(userRole)
  return permissions[permission]
}

// Re-export helper functions from roles.ts for backwards compatibility
export { getRoleName, getRoleBadgeColor } from '@/utils/admin/roles'

/**
 * Server-side: Check if current user has admin access
 * Returns user's role and whether they have the required permission
 */
export async function checkAdminAccess(
  requiredPermission?: keyof AdminPermissions
): Promise<{
  role: AdminRole
  hasAccess: boolean
  userId: string | null
}> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { role: null, hasAccess: false, userId: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('admin_role')
    .eq('id', user.id)
    .single()

  const role = (profile?.admin_role as AdminRole) || null

  // If no specific permission required, just check if they have any admin role
  if (!requiredPermission) {
    return {
      role,
      hasAccess: role !== null,
      userId: user.id,
    }
  }

  // Check specific permission
  const hasAccess = requirePermission(role, requiredPermission)
  return { role, hasAccess, userId: user.id }
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: AdminRole): string {
  switch (role) {
    case 'owner':
      return 'Full control of the platform. Can manage all users and settings.'
    case 'admin':
      return 'Can manage users, content, and send communications. Cannot change ownership.'
    case 'analyst':
      return 'Read-only access to all admin data. Can export data but cannot make changes.'
    default:
      return 'Regular user with no admin access.'
  }
}

/**
 * Get available roles a user can grant based on their own role
 */
export function getGrantableRoles(userRole: AdminRole): AdminRole[] {
  switch (userRole) {
    case 'owner':
      return ['owner', 'admin', 'analyst']
    case 'admin':
      return ['admin', 'analyst']
    case 'analyst':
      return []
    default:
      return []
  }
}

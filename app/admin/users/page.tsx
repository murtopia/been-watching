import { checkAdminAccess, getAdminPermissions } from '@/utils/admin/permissions'
import { redirect } from 'next/navigation'
import UsersTableClient from './UsersTableClient'

export default async function AdminUsersPage() {
  // Check if user has admin access (any role: owner, admin, or analyst)
  const { hasAccess, role } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  // Get permissions for this role
  const permissions = getAdminPermissions(role)

  // Pass the user's role and canManageUsers permission to the client component
  return <UsersTableClient userRole={role} canManageUsers={permissions.canManageUsers} />
}

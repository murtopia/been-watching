import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import MessagingOverview from './MessagingOverview'

export default async function AdminMessagingPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  return <MessagingOverview />
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ModerationOverview from './ModerationOverview'

export default async function AdminModerationPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Fetch moderation statistics
  const [
    { count: pendingReports },
    { count: totalReports },
    { count: flaggedContent },
    { count: bannedUsers }
  ] = await Promise.all([
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('flagged_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true)
  ])

  // Get reports from last 24 hours
  const last24Hours = new Date(Date.now() - 86400000).toISOString()
  const { count: reportsLast24h } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', last24Hours)

  const stats = {
    pendingReports: pendingReports || 0,
    totalReports: totalReports || 0,
    reportsLast24h: reportsLast24h || 0,
    flaggedContent: flaggedContent || 0,
    bannedUsers: bannedUsers || 0
  }

  return <ModerationOverview stats={stats} />
}

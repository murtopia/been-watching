import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SystemOverview from './SystemOverview'

export default async function AdminSystemPage() {
  const supabase = await createClient()

  // Check if user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/feed')
  }

  // Fetch system health metrics
  const startTime = Date.now()

  // Database health check
  const { error: dbError, data: dbCheck } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single()

  const dbResponseTime = Date.now() - startTime
  const dbStatus = dbError ? 'error' : 'healthy'

  // Get table sizes and counts
  const [
    { count: totalUsers },
    { count: totalActivities },
    { count: totalRatings },
    { count: totalComments }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true })
  ])

  // Get error logs from last 24 hours (if error_logs table exists)
  const last24Hours = new Date(Date.now() - 86400000).toISOString()
  let recentErrors = 0
  try {
    const { count } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24Hours)
    recentErrors = count || 0
  } catch (error) {
    // error_logs table doesn't exist yet, that's okay
    recentErrors = 0
  }

  // Calculate uptime (using oldest user as proxy for system start)
  const { data: oldestUser } = await supabase
    .from('profiles')
    .select('created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const systemStartTime = oldestUser?.created_at ? new Date(oldestUser.created_at).getTime() : Date.now()
  const uptimeMs = Date.now() - systemStartTime
  const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24))

  const stats = {
    database: {
      status: dbStatus,
      responseTime: dbResponseTime,
      totalUsers: totalUsers || 0,
      totalActivities: totalActivities || 0,
      totalRatings: totalRatings || 0,
      totalComments: totalComments || 0
    },
    api: {
      status: 'healthy', // API is healthy if we got here
      avgResponseTime: dbResponseTime, // Use DB response as proxy
    },
    system: {
      uptime: uptimeDays,
      recentErrors: recentErrors || 0
    }
  }

  return <SystemOverview stats={stats} />
}

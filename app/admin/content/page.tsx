import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import ContentOverview from './ContentOverview'

export default async function AdminContentPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  const supabase = await createClient()

  // Get quick stats for overview
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString()

  const [
    { count: totalActivities },
    { count: activitiesLast24h },
    { count: totalRatings },
    { count: ratingsLast24h },
    { count: totalSearches },
    { count: searchesLast24h }
  ] = await Promise.all([
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }).gte('created_at', oneDayAgo),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
    supabase.from('ratings').select('*', { count: 'exact', head: true }).gte('created_at', oneDayAgo),
    supabase.from('search_history').select('*', { count: 'exact', head: true }),
    supabase.from('search_history').select('*', { count: 'exact', head: true }).gte('created_at', oneDayAgo)
  ])

  const stats = {
    totalActivities: totalActivities || 0,
    activitiesLast24h: activitiesLast24h || 0,
    totalRatings: totalRatings || 0,
    ratingsLast24h: ratingsLast24h || 0,
    totalSearches: totalSearches || 0,
    searchesLast24h: searchesLast24h || 0
  }

  return <ContentOverview stats={stats} />
}

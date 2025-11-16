import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import AnnouncementForm from './AnnouncementForm'
import AnnouncementHistory from './AnnouncementHistory'

export default async function AnnouncementsPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  // Fetch announcement stats
  const adminClient = createAdminClient()
  const { data: stats, error } = await adminClient.rpc('get_announcement_stats')

  const announcementStats = stats || []

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Announcements
        </h1>
        <p style={{ color: '#888' }}>
          Send targeted announcements to users
        </p>
      </div>

      {/* Announcement Form */}
      <AnnouncementForm />

      {/* Announcement History */}
      {announcementStats.length > 0 && (
        <AnnouncementHistory stats={announcementStats} />
      )}
    </div>
  )
}

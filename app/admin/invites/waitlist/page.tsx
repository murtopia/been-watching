import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import { Users, Clock, Mail, UserCheck } from 'lucide-react'
import InvitesNav from '../InvitesNav'
import WaitlistTable from './WaitlistTable'

export default async function AdminWaitlistPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  // Use admin client to bypass RLS and fetch all waitlist entries
  const adminClient = createAdminClient()
  const { data: waitlist, error } = await adminClient
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching waitlist:', error)
  }

  const totalSignups = waitlist?.length || 0
  const pending = waitlist?.filter(w => !w.invited_at).length || 0
  const invited = waitlist?.filter(w => w.invited_at && !w.converted_to_user_id).length || 0
  const converted = waitlist?.filter(w => w.converted_to_user_id).length || 0

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Invites & Waitlist
        </h1>
        <p style={{ color: '#888' }}>
          Manage invite codes and waitlist signups
        </p>
      </div>

      <InvitesNav />

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={<Users size={20} />}
          label="Total Signups"
          value={totalSignups}
          color="#3b82f6"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pending"
          value={pending}
          color="#f59e0b"
        />
        <StatCard
          icon={<Mail size={20} />}
          label="Invited"
          value={invited}
          color="#8b5cf6"
        />
        <StatCard
          icon={<UserCheck size={20} />}
          label="Converted"
          value={converted}
          color="#10b981"
        />
      </div>

      {/* Waitlist Table */}
      <WaitlistTable initialData={waitlist || []} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: `${color}20`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.125rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}


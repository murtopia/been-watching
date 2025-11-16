import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/utils/admin/permissions'
import { Gift, CheckCircle, Clock } from 'lucide-react'
import InviteCodeManager from './InviteCodeManager'
import InviteRow from './InviteRow'

export default async function AdminInvitesPage() {
  // Check if user has admin access
  const { hasAccess } = await checkAdminAccess()

  if (!hasAccess) {
    redirect('/auth')
  }

  // Use admin client to bypass RLS and fetch all invite codes
  const adminClient = createAdminClient()
  const { data: invites } = await adminClient
    .from('admin_master_code_stats')
    .select('*')
    .order('created_at', { ascending: false })

  const totalInvites = invites?.length || 0
  const activeInvites = invites?.filter(i => i.is_active).length || 0
  const totalSignups = invites?.reduce((sum, i) => sum + (i.total_signups || 0), 0) || 0

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Invite Codes Management
        </h1>
        <p style={{ color: '#888' }}>
          Manage and track all invite codes
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={<Gift size={20} />}
          label="Total Codes"
          value={totalInvites}
          color="#3b82f6"
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Total Signups"
          value={totalSignups}
          color="#10b981"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Active Codes"
          value={activeInvites}
          color="#f59e0b"
        />
      </div>

      {/* Invite Code Manager */}
      <InviteCodeManager />

      {/* Invites Table */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            All Invite Codes
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)'
              }}>
                <th style={tableHeaderStyle}>Code</th>
                <th style={tableHeaderStyle}>Type</th>
                <th style={tableHeaderStyle}>Uses</th>
                <th style={tableHeaderStyle}>Signups</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites?.map((invite) => (
                <InviteRow key={invite.code} invite={invite} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
      padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
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
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}


const tableHeaderStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#888'
}

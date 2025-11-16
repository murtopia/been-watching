'use client'

import { useThemeColors } from '@/hooks/useThemeColors'

interface AnnouncementStat {
  id: string
  title: string
  type: string
  sent_at: string
  total_recipients: number
  read_rate: number
  click_rate: number
}

export default function AnnouncementHistory({ stats }: { stats: AnnouncementStat[] }) {
  const colors = useThemeColors()

  return (
    <div style={{
      background: colors.cardBg,
      border: colors.cardBorder,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: colors.textPrimary
      }}>
        Announcement History ({stats.length})
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: colors.cardBorder }}>
              <th style={headerStyle}>Title</th>
              <th style={headerStyle}>Type</th>
              <th style={headerStyle}>Sent</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Recipients</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Read Rate</th>
              <th style={{ ...headerStyle, textAlign: 'right' }}>Click Rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.id} style={{ borderBottom: colors.cardBorder }}>
                <td style={{ padding: '1rem', color: colors.textPrimary, fontSize: '0.875rem' }}>
                  {stat.title}
                </td>
                <td style={{ padding: '1rem', color: colors.textSecondary, fontSize: '0.875rem' }}>
                  {stat.type.replace('_', ' ')}
                </td>
                <td style={{ padding: '1rem', color: colors.textSecondary, fontSize: '0.875rem' }}>
                  {new Date(stat.sent_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td style={{ padding: '1rem', color: colors.textPrimary, fontSize: '0.875rem', textAlign: 'right' }}>
                  {stat.total_recipients.toLocaleString()}
                </td>
                <td style={{ padding: '1rem', color: colors.textPrimary, fontSize: '0.875rem', textAlign: 'right' }}>
                  {stat.read_rate}%
                </td>
                <td style={{ padding: '1rem', color: colors.textPrimary, fontSize: '0.875rem', textAlign: 'right' }}>
                  {stat.click_rate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  color: '#888',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase'
}

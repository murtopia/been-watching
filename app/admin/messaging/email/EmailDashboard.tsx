'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { useRouter } from 'next/navigation'
import MessagingNav from '../MessagingNav'

interface EmailDashboardProps {
  settings: any
  campaigns: any[]
}

export default function EmailDashboard({ settings, campaigns }: EmailDashboardProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSendTestEmail = async () => {
    setSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      setMessage({
        type: 'success',
        text: data.message || 'Test email sent successfully!'
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send test email'
      })
    } finally {
      setSending(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <MessagingNav />

      <div style={{ marginTop: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: colors.textPrimary
        }}>
          📧 Email Campaigns
        </h1>
        <p style={{ fontSize: '0.875rem', color: colors.textSecondary, marginBottom: '2rem' }}>
          Manage automated email campaigns and send test emails
        </p>

        {/* Success/Error Message */}
        {message && (
          <div style={{
            padding: '1rem',
            background: message.type === 'success' ? '#10b98120' : '#ef444420',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px',
            marginBottom: '1.5rem',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            {message.text}
          </div>
        )}

        {/* Test Email Section */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: colors.textPrimary
          }}>
            🧪 Test Email
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            marginBottom: '1rem'
          }}>
            Send a sample Weekly Recap email to your account to see how it looks
          </p>
          <button
            onClick={handleSendTestEmail}
            disabled={sending}
            style={{
              padding: '0.75rem 1.5rem',
              background: sending ? colors.textSecondary : colors.brandPink,
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.6 : 1
            }}
          >
            {sending ? 'Sending...' : 'Send Test Email to Myself'}
          </button>
        </div>

        {/* Auto-Send Settings */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: colors.textPrimary
          }}>
            ⚙️ Auto-Send Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Weekly Recap */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '0.25rem' }}>
                  Weekly Recap (Fridays 9am)
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                  Status: {settings?.auto_send_weekly_recap ? '🟢 Auto-Send ON' : '🔴 Manual Approval'}
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: settings?.auto_send_weekly_recap ? '#10b98120' : '#f59e0b20',
                border: `1px solid ${settings?.auto_send_weekly_recap ? '#10b981' : '#f59e0b'}`,
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: settings?.auto_send_weekly_recap ? '#10b981' : '#f59e0b'
              }}>
                {settings?.auto_send_weekly_recap ? 'AUTOMATIC' : 'MANUAL'}
              </div>
            </div>

            {/* Monthly Recap */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '0.25rem' }}>
                  Monthly Recap (1st of month, 9am)
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                  Status: {settings?.auto_send_monthly_recap ? '🟢 Auto-Send ON' : '🔴 Manual Approval'}
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: settings?.auto_send_monthly_recap ? '#10b98120' : '#f59e0b20',
                border: `1px solid ${settings?.auto_send_monthly_recap ? '#10b981' : '#f59e0b'}`,
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: settings?.auto_send_monthly_recap ? '#10b981' : '#f59e0b'
              }}>
                {settings?.auto_send_monthly_recap ? 'AUTOMATIC' : 'MANUAL'}
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: colors.textSecondary,
            marginTop: '1rem',
            padding: '0.75rem',
            background: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px',
            border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
          }}>
            💡 <strong>Note:</strong> Auto-send is OFF by default. When OFF, emails are created as drafts and require your manual approval before sending. You can toggle this setting once you've tested and are happy with the email quality.
          </p>
        </div>

        {/* Recent Campaigns */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: colors.textPrimary
          }}>
            📊 Recent Campaigns
          </h3>

          {campaigns.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              No campaigns yet. Send your first test email above!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  style={{
                    padding: '1rem',
                    background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '8px',
                    border: colors.cardBorder
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: colors.textPrimary }}>
                        {campaign.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.25rem' }}>
                        {campaign.campaign_type} • {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      background: campaign.status === 'sent' ? '#10b98120' : '#f59e0b20',
                      border: `1px solid ${campaign.status === 'sent' ? '#10b981' : '#f59e0b'}`,
                      borderRadius: '6px',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: campaign.status === 'sent' ? '#10b981' : '#f59e0b',
                      textTransform: 'uppercase'
                    }}>
                      {campaign.status}
                    </div>
                  </div>
                  {campaign.total_sent > 0 && (
                    <div style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.5rem' }}>
                      {campaign.total_sent} sent • {campaign.total_opened} opened ({Math.round((campaign.total_opened / campaign.total_sent) * 100)}%)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

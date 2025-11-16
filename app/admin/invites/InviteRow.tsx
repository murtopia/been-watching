'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Copy, Check } from 'lucide-react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { createClient } from '@/utils/supabase/client'

export default function InviteRow({ invite }: { invite: any }) {
  const colors = useThemeColors()
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [copied, setCopied] = useState(false)

  const deactivateCode = async () => {
    if (!confirm(`Are you sure you want to deactivate code "${invite.code}"?\n\nExisting users who used this code will keep their access, but no new signups will be allowed.`)) {
      return
    }

    setIsDeactivating(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.rpc('deactivate_master_code', {
        code_to_deactivate: invite.code
      })

      if (error) throw error

      alert('Code deactivated successfully!')
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error: any) {
      console.error('Error deactivating code:', error)
      alert('Error: ' + error.message)
    } finally {
      setIsDeactivating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invite.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <tr style={{
      borderBottom: colors.cardBorder,
      transition: 'background 0.2s'
    }}>
      <td style={tableCellStyle}>
        <code style={{
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          color: colors.textPrimary
        }}>
          {invite.code}
        </code>
      </td>
      <td style={{ ...tableCellStyle, color: colors.textSecondary }}>
        {invite.type}
      </td>
      <td style={{ ...tableCellStyle, color: colors.textPrimary }}>
        {invite.current_uses} / {invite.max_uses || '∞'}
      </td>
      <td style={{ ...tableCellStyle, color: colors.textPrimary }}>
        {invite.total_signups}
      </td>
      <td style={tableCellStyle}>
        {invite.is_active ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            background: '#22c55e20',
            color: '#22c55e',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            <CheckCircle size={12} />
            Active
          </span>
        ) : (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            background: '#ef444420',
            color: '#ef4444',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            <XCircle size={12} />
            Inactive
          </span>
        )}
      </td>
      <td style={tableCellStyle}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '0.5rem',
              background: copied ? '#10b981' : colors.cardBg,
              border: colors.cardBorder,
              borderRadius: '6px',
              color: copied ? '#fff' : colors.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          {invite.is_active && (
            <button
              onClick={deactivateCode}
              disabled={isDeactivating}
              style={{
                padding: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: isDeactivating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isDeactivating ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              title="Deactivate code"
              onMouseEnter={(e) => {
                if (!isDeactivating) {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

const tableCellStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.875rem'
}

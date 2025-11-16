'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { createClient } from '@/utils/supabase/client'
import { Plus, Copy, Check, XCircle } from 'lucide-react'

export default function InviteCodeManager() {
  const colors = useThemeColors()
  const [newCodeType, setNewCodeType] = useState<'limited' | 'unlimited'>('limited')
  const [creatingCode, setCreatingCode] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [copied, setCopied] = useState(false)

  const createNewCode = async () => {
    setCreatingCode(true)
    setNewCode('')

    try {
      const supabase = createClient()

      if (newCodeType === 'unlimited') {
        // Create unlimited code
        const code = 'BW_' + Math.random().toString(36).substring(2, 10).toUpperCase()
        const { error } = await supabase
          .from('master_codes')
          .insert({
            code,
            type: 'master_unlimited',
            max_uses: null,
            is_active: true
          })

        if (error) throw error
        setNewCode(code)
      } else {
        // Create limited code using the RPC function
        const { data, error } = await supabase.rpc('create_bwalpha_code')

        if (error) throw error
        if (data) setNewCode(data)
      }

      // Refresh the page to show new code
      window.location.reload()
    } catch (error: any) {
      console.error('Error creating code:', error)
      alert('Error creating code: ' + error.message)
    } finally {
      setCreatingCode(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        marginBottom: '1rem',
        color: colors.textPrimary
      }}>
        Create New Invite Code
      </h2>

      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Code Type Selection */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setNewCodeType('limited')}
            style={{
              padding: '0.5rem 1rem',
              background: newCodeType === 'limited' ? colors.brandPink : colors.cardBg,
              color: newCodeType === 'limited' ? 'white' : colors.textPrimary,
              border: newCodeType === 'limited' ? 'none' : colors.cardBorder,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Limited (5 uses)
          </button>
          <button
            onClick={() => setNewCodeType('unlimited')}
            style={{
              padding: '0.5rem 1rem',
              background: newCodeType === 'unlimited' ? colors.brandPink : colors.cardBg,
              color: newCodeType === 'unlimited' ? 'white' : colors.textPrimary,
              border: newCodeType === 'unlimited' ? 'none' : colors.cardBorder,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Unlimited
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={createNewCode}
          disabled={creatingCode}
          style={{
            padding: '0.5rem 1rem',
            background: colors.brandPink,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: creatingCode ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: creatingCode ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          <Plus size={16} />
          {creatingCode ? 'Creating...' : 'Create Code'}
        </button>
      </div>

      {/* New Code Display */}
      {newCode && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              New {newCodeType} code created:
            </div>
            <code style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: colors.brandPink,
              fontFamily: 'monospace'
            }}>
              {newCode}
            </code>
          </div>
          <button
            onClick={copyToClipboard}
            style={{
              padding: '0.5rem 1rem',
              background: copied ? '#10b981' : colors.cardBg,
              color: copied ? 'white' : colors.textPrimary,
              border: colors.cardBorder,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        fontSize: '0.75rem',
        color: colors.textSecondary
      }}>
        <strong>Limited codes:</strong> Can be used 5 times. Created via create_bwalpha_code() function.<br />
        <strong>Unlimited codes:</strong> Can be used indefinitely. Stored in master_codes table.
      </div>
    </div>
  )
}

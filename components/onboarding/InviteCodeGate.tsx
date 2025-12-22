'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'

interface InviteCodeGateProps {
  userId: string
  onSuccess: () => void
}

export default function InviteCodeGate({ userId, onSuccess }: InviteCodeGateProps) {
  const colors = useThemeColors()
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Gold accent color
  const goldAccent = '#FFC125'

  const validateInviteCode = async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_master_code_valid', { master_code: code })

      if (error) {
        console.error('Error validating invite code:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('Error validating invite code:', error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate invite code
      const isValid = await validateInviteCode(inviteCode.trim().toUpperCase())
      if (!isValid) {
        setError('Invalid or expired invite code')
        setLoading(false)
        return
      }

      // Use the master code (increment usage counter)
      const masterCode = inviteCode.trim().toUpperCase()
      const { error: rpcError } = await supabase.rpc('use_master_code', {
        master_code: masterCode,
        user_id: userId
      })
      
      if (rpcError) {
        console.error('Failed to increment code usage:', rpcError)
      }

      // Update profile with master code and tier
      const tier = masterCode === 'BOOZEHOUND' ? 'boozehound' :
                  masterCode.startsWith('BWALPHA_') ? 'alpha' : 'beta'

      await supabase
        .from('profiles')
        .update({
          invited_by_master_code: masterCode,
          invite_tier: tier,
          invites_remaining: 0, // All users start with 0 invites, earn 1 from profile completion
          is_approved: true
        })
        .eq('id', userId)

      // Code is valid, proceed to profile setup
      onSuccess()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: goldAccent,
              marginBottom: '0.5rem',
            }}
          >
            Invite Code Required
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Enter your invite code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter your code"
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${goldAccent}80`
                e.target.style.boxShadow = `0 0 0 3px ${goldAccent}20`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder
                e.target.style.boxShadow = 'none'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.5rem' }}>
              Don't have a code?{' '}
              <a
                href="/waitlist"
                style={{ color: goldAccent, textDecoration: 'none' }}
              >
                Join the waitlist
              </a>
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !inviteCode}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading || !inviteCode
                ? colors.inputBg
                : goldAccent,
              border: 'none',
              borderRadius: '12px',
              color: loading || !inviteCode ? colors.textSecondary : '#000',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading || !inviteCode ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading || !inviteCode ? 0.6 : 1,
              marginBottom: '0.75rem',
            }}
            onMouseEnter={(e) => {
              if (!loading && inviteCode) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 10px 25px ${goldAccent}40`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>

          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1.5rem', 
            borderTop: `1px solid ${colors.inputBorder}`,
            textAlign: 'center'
          }}>
            <p style={{ 
              color: colors.textSecondary, 
              fontSize: '0.8125rem', 
              margin: 0,
              marginBottom: '0.75rem'
            }}>
              Wrong account?
            </p>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.inputBorder
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBg
              }}
            >
              Sign Out & Return Home
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

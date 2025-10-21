'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface InviteCodeGateProps {
  userId: string
  onValidated: () => void
}

export default function InviteCodeGate({ userId, onValidated }: InviteCodeGateProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

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

      // Use the master code
      await supabase.rpc('use_master_code', {
        master_code: inviteCode.trim().toUpperCase(),
        user_id: userId
      })

      // Update profile with master code and tier
      const masterCode = inviteCode.trim().toUpperCase()
      const tier = masterCode === 'BOOZEHOUND' ? 'boozehound' :
                  masterCode.startsWith('BWALPHA_') ? 'alpha' : 'beta'

      await supabase
        .from('profiles')
        .update({
          invited_by_master_code: masterCode,
          invite_tier: tier,
          invites_remaining: tier === 'boozehound' ? 10 : tier === 'alpha' ? 3 : 0,
          is_approved: true
        })
        .eq('id', userId)

      // Code is valid, proceed to profile setup
      onValidated()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
  const inputBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const inputBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const inputFocusBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'

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
          background: cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${cardBorder}`,
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: isDarkMode
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            Invite Code Required
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Enter your invite code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: textPrimary,
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
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '12px',
                color: textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(233, 77, 136, 0.5)'
                e.target.style.background = inputFocusBg
              }}
              onBlur={(e) => {
                e.target.style.borderColor = inputBorder
                e.target.style.background = inputBg
              }}
            />
            <p style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.5rem' }}>
              Don't have a code?{' '}
              <a
                href="/waitlist"
                style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none' }}
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
                ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
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
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(233, 77, 136, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${inputBorder}`,
              borderRadius: '12px',
              color: textPrimary,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}

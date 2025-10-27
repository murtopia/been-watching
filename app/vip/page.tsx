'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function VIPPage() {
  const router = useRouter()
  const supabase = createClient()
  const colors = useThemeColors()
  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // User is already logged in
      router.push('/feed')
    }
  }

  const validateCode = async () => {
    if (!code.trim()) {
      setError('Please enter an invite code')
      return
    }

    setValidating(true)
    setError('')

    try {
      const { data, error: rpcError } = await supabase
        .rpc('is_master_code_valid', { master_code: code.trim().toUpperCase() })

      if (rpcError) {
        console.error('Error validating code:', rpcError)
        setError('Error validating code. Please try again.')
        setValidating(false)
        return
      }

      if (data === true) {
        // Valid code! Store it and redirect to signup
        sessionStorage.setItem('vip_code', code.trim().toUpperCase())
        router.push('/auth?signup=true&vip=true')
      } else {
        setError('Invalid or expired invite code')
        setValidating(false)
      }
    } catch (err) {
      console.error('Error validating code:', err)
      setError('Error validating code. Please try again.')
      setValidating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    validateCode()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCode()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        {/* Logo / Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem'
        }}>
          🎟️
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '0.75rem',
          color: colors.textPrimary
        }}>
          Got an Invite Code?
        </h1>

        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Enter your exclusive VIP invite code to get started with Been Watching.
        </p>

        {/* Code input form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your code"
            disabled={validating}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: colors.cardBg,
              border: error ? '2px solid #ef4444' : colors.cardBorder,
              borderRadius: '8px',
              color: colors.textPrimary,
              marginBottom: '1rem',
              outline: 'none',
              fontFamily: 'monospace'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.brandPink
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = colors.borderColor
              }
            }}
          />

          {error && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={validating}
            style={{
              width: '100%',
              padding: '1rem',
              background: validating ? colors.textSecondary : colors.brandGradient,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: validating ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              opacity: validating ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!validating) {
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {validating ? 'Validating...' : 'Validate Code'}
          </button>
        </form>

        {/* Info box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(233, 77, 136, 0.1) 0%, rgba(242, 113, 33, 0.1) 100%)',
          border: '1px solid rgba(233, 77, 136, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary, lineHeight: '1.8' }}>
            <strong style={{ color: colors.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
              VIP codes grant you:
            </strong>
            <div style={{ marginBottom: '0.5rem' }}>🎬 Full platform access</div>
            <div style={{ marginBottom: '0.5rem' }}>🎁 Bonus invites to share</div>
            <div>⚡ Early feature access</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
          color: colors.textTertiary,
          fontSize: '0.875rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: colors.borderColor }} />
          OR
          <div style={{ flex: 1, height: '1px', background: colors.borderColor }} />
        </div>

        {/* Alternative options */}
        <div style={{
          fontSize: '0.875rem',
          color: colors.textSecondary
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.brandPink,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Sign In
            </button>
          </div>
          <div>
            Got a friend invite?{' '}
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.brandPink,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Use their link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

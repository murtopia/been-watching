'use client'

// Skip static generation - this page needs runtime env vars
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

function JoinPageContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const router = useRouter()
  const supabase = createClient()
  const colors = useThemeColors()
  const [loading, setLoading] = useState(true)
  const [validation, setValidation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (code) {
      validateToken()
    } else {
      setError('no_code')
      setLoading(false)
    }
  }, [code])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // User is already logged in
      router.push('/feed')
    }
  }

  const validateToken = async () => {
    if (!code) return

    try {
      const { data, error: rpcError } = await supabase
        .rpc('validate_invite_token', { invite_token: code })

      if (rpcError) {
        console.error('Error validating token:', rpcError)
        setError('unknown')
        setLoading(false)
        return
      }

      setValidation(data)
      setLoading(false)

      // If valid, store token in sessionStorage for signup flow
      if (data.valid) {
        sessionStorage.setItem('invite_token', code)
      }
    } catch (err) {
      console.error('Error validating invite:', err)
      setError('unknown')
      setLoading(false)
    }
  }

  const handleAcceptInvite = () => {
    // Store token and redirect to signup
    if (code && validation?.valid) {
      sessionStorage.setItem('invite_token', code)
      router.push('/auth?signup=true')
    }
  }

  const handleSignIn = () => {
    router.push('/auth')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: colors.textPrimary
        }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🎬
          </div>
          <div>Validating invite...</div>
        </div>
      </div>
    )
  }

  // Error: No code provided
  if (error === 'no_code' || !code) {
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
          padding: '2rem',
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: colors.textPrimary
          }}>
            Missing Invite Code
          </h1>
          <p style={{
            color: colors.textSecondary,
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            This invite link appears to be incomplete. Please check the link and try again, or request a new invite from your friend.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.75rem 1.5rem',
              background: colors.brandGradient,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Error: Invalid token
  if (!validation?.valid) {
    const errorMessages: Record<string, { emoji: string; title: string; message: string }> = {
      token_not_found: {
        emoji: '🔍',
        title: 'Invalid Invite Code',
        message: 'This invite code doesn\'t exist. Please check the link or request a new invite.'
      },
      token_expired: {
        emoji: '⏰',
        title: 'Invite Expired',
        message: 'This invite has expired. Invite links are valid for 7 days. Please request a new invite from your friend.'
      },
      token_already_used: {
        emoji: '✅',
        title: 'Invite Already Used',
        message: 'This invite has already been used by someone else. Each invite can only be used once. Please request a new invite.'
      },
      token_revoked: {
        emoji: '🚫',
        title: 'Invite Revoked',
        message: 'This invite has been cancelled by the person who shared it. Please request a new invite.'
      },
      no_invites_remaining: {
        emoji: '😔',
        title: 'No Invites Available',
        message: 'The person who shared this invite has used all their available invites. Please ask them to complete their profile to earn more invites, or find another friend on Been Watching!'
      }
    }

    const errorInfo = errorMessages[validation?.error] || {
      emoji: '⚠️',
      title: 'Something Went Wrong',
      message: 'We encountered an error processing this invite. Please try again later.'
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
          padding: '2rem',
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{errorInfo.emoji}</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: colors.textPrimary
          }}>
            {errorInfo.title}
          </h1>
          <p style={{
            color: colors.textSecondary,
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {errorInfo.message}
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.75rem 1.5rem',
              background: colors.brandGradient,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Success: Valid invite!
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
          🎬
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '0.75rem',
          color: colors.textPrimary
        }}>
          You've Been Invited!
        </h1>

        {/* Inviter info - only show username for privacy */}
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          <span style={{ color: colors.brandPink, fontWeight: '600' }}>
            @{validation.inviter_username}
          </span>
          {' '}invited you to join <strong style={{ color: colors.textPrimary }}>Been Watching</strong>,
          a social platform to track shows, discover new favorites, and share what you're watching with friends.
        </p>

        {/* Features preview */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(233, 77, 136, 0.1) 0%, rgba(242, 113, 33, 0.1) 100%)',
          border: '1px solid rgba(233, 77, 136, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary, lineHeight: '1.8' }}>
            <div style={{ marginBottom: '0.5rem' }}>📺 Track what you're watching</div>
            <div style={{ marginBottom: '0.5rem' }}>⭐ Rate and review shows</div>
            <div style={{ marginBottom: '0.5rem' }}>🔍 Discover recommendations</div>
            <div>👥 Connect with friends</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <button
          onClick={handleAcceptInvite}
          style={{
            width: '100%',
            padding: '1rem',
            background: colors.brandGradient,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1rem',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Accept Invite & Sign Up
        </button>

        <div style={{
          fontSize: '0.875rem',
          color: colors.textSecondary,
          marginTop: '1.5rem'
        }}>
          Already have an account?{' '}
          <button
            onClick={handleSignIn}
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
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading...</div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  )
}

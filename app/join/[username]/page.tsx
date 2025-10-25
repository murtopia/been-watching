'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function JoinPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const colors = useThemeColors()
  const [loading, setLoading] = useState(true)
  const [inviter, setInviter] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkInvite()
  }, [])

  const checkInvite = async () => {
    try {
      // Look up inviter by username
      const { data: inviterProfile, error: inviterError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, invites_remaining')
        .eq('username', username)
        .single()

      if (inviterError || !inviterProfile) {
        setError('user_not_found')
        setLoading(false)
        return
      }

      // Check if they have invites available
      if (inviterProfile.invites_remaining <= 0) {
        setError('no_invites_available')
        setInviter(inviterProfile)
        setLoading(false)
        return
      }

      // Valid invite! Store referrer in sessionStorage and redirect to home
      sessionStorage.setItem('referrer_username', username)
      router.push('/')
    } catch (err) {
      console.error('Error checking invite:', err)
      setError('unknown')
      setLoading(false)
    }
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
        <div style={{ color: colors.textPrimary }}>Loading...</div>
      </div>
    )
  }

  if (error === 'user_not_found') {
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
            User Not Found
          </h1>
          <p style={{
            color: colors.textSecondary,
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            We couldn't find a user with the username "{username}".
            Please check the invite link and try again.
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
            Go to Home Page
          </button>
        </div>
      </div>
    )
  }

  if (error === 'no_invites_available') {
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
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: colors.textPrimary
          }}>
            Invite Link No Longer Available
          </h1>
          <p style={{
            color: colors.textSecondary,
            marginBottom: '1rem',
            lineHeight: '1.6'
          }}>
            This invite link from {inviter?.display_name || inviter?.username} has already been used.
          </p>
          <p style={{
            color: colors.textSecondary,
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Want to join Been Watching? Join our waitlist to get notified when we have more spots available!
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
            Join Waitlist
          </button>
        </div>
      </div>
    )
  }

  // Fallback error
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: colors.textPrimary
        }}>
          Something Went Wrong
        </h1>
        <p style={{
          color: colors.textSecondary,
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          We encountered an error processing this invite link. Please try again later.
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
          Go to Home Page
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const colors = useThemeColors()
  const [loading, setLoading] = useState(true)

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    checkAuth()
  }, [])

  // Set html background to black for iOS overscroll
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#0d0d0d'
    document.body.style.backgroundColor = '#0d0d0d'
    return () => {
      document.documentElement.style.backgroundColor = ''
      document.body.style.backgroundColor = ''
    }
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Land on whichever home surface the user used last (feed or lists)
      const lastHome = typeof window !== 'undefined' ? localStorage.getItem('bw_last_home') : null
      router.push(lastHome === '/myshows' ? '/myshows' : '/feed')
    } else {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid',
          borderColor: `${colors.goldAccent} transparent`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100svh',
      position: 'relative',
      color: colors.textPrimary
    }}>
      {/* Fixed background image - works on mobile */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('/landing-bg.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }} />
      {/* Fixed overlay - lighter for more background visibility */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.65) 100%)',
        zIndex: 1
      }} />
      {/* Header - consistent with app header style */}
      <header style={{
        padding: '5px 1.5rem',
        background: colors.glassBg,
        borderBottom: colors.goldBorder,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          maxWidth: '398px',
          margin: '0 auto'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <img
              src="/BW_header_v2.png"
              alt="Been Watching"
              style={{
                height: '52px',
                width: 'auto'
              }}
            />
            <h1 style={{
              color: colors.textPrimary,
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0
            }}>
              Been Watching
            </h1>
          </div>

          {/* Sign In button */}
          <button
            onClick={() => router.push('/auth')}
            style={{
              padding: '0.5rem 1rem',
              background: colors.goldAccent,
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.goldAccent}4D`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content - mobile first width */}
      <main style={{
        maxWidth: '398px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '0.75rem',
            lineHeight: 1.3,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            What Have You Been Watching?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.6,
            textShadow: '0 1px 4px rgba(0,0,0,0.3)'
          }}>
            Track what you watch, find out what your friends are watching, and never miss a great show.
          </p>
        </section>

        {/* Sign Up Card - Primary CTA */}
        <div style={{
          background: isDark ? 'rgba(18, 18, 18, 0.97)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: '0.75rem'
          }}>
            Join Been Watching
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            marginBottom: '1.25rem',
            lineHeight: 1.5
          }}>
            Registration is open - create a free account and start tracking your shows in seconds.
          </p>
          <button
            onClick={() => router.push('/auth?signup=true')}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: colors.goldAccent,
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 10px 25px ${colors.goldAccent}4D`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Sign Up Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Footer variant="full" />
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

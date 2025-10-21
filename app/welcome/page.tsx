'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function WelcomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }
    checkAuth()

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
  const featureBg = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Theme Toggle */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: '0.5rem 1rem',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
            borderRadius: '8px',
            color: textPrimary,
            fontSize: '0.875rem',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Dark' : 'Light'}
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center',
        }}
      >
        {/* Logo/Brand */}
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}
        >
          Been Watching
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: textSecondary,
            marginBottom: '3rem',
            lineHeight: 1.6,
          }}
        >
          Track what you've been watching. Share your favorites. Discover what's next.
        </p>

        {/* Features Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{
              background: featureBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📺</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '0.5rem' }}>
              Track Everything
            </h3>
            <p style={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.6 }}>
              Movies and TV shows, organized by season. Keep track of what you want to watch, what you're watching, and what you've watched.
            </p>
          </div>

          <div
            style={{
              background: featureBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⭐</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '0.5rem' }}>
              Rate & Review
            </h3>
            <p style={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.6 }}>
              Love it, like it, or meh? Share your quick takes and see what your friends think.
            </p>
          </div>

          <div
            style={{
              background: featureBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '0.5rem' }}>
              Social Feed
            </h3>
            <p style={{ fontSize: '0.875rem', color: textSecondary, lineHeight: 1.6 }}>
              See what your friends are watching, comment on their takes, and discover your next binge.
            </p>
          </div>
        </div>

        {/* CTA Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Join Waitlist Card */}
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : '0 20px 60px rgba(0, 0, 0, 0.08)',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: textPrimary,
                marginBottom: '1rem',
              }}
            >
              Join the Waitlist
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: textSecondary,
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              We're currently in private alpha. Join the waitlist to get early access when we open up.
            </p>
            <button
              onClick={() => router.push('/waitlist')}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(233, 77, 136, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Join Waitlist
            </button>
          </div>

          {/* I Have a Code Card */}
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: isDarkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : '0 20px 60px rgba(0, 0, 0, 0.08)',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: textPrimary,
                marginBottom: '1rem',
              }}
            >
              I Have a Code
            </h2>
            <p
              style={{
                fontSize: '0.9375rem',
                color: textSecondary,
                marginBottom: '1.5rem',
                lineHeight: 1.6,
              }}
            >
              Already have an invite code? Sign in or create your account to get started.
            </p>
            <button
              onClick={() => router.push('/auth')}
              style={{
                width: '100%',
                padding: '1rem',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${cardBorder}`,
                borderRadius: '12px',
                color: textPrimary,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Sign In / Sign Up
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.8125rem',
              color: textSecondary,
            }}
          >
            v0.1.0 Alpha • Built with Next.js, Supabase, and TMDB
          </p>
        </div>
      </div>
    </div>
  )
}

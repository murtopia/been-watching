'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemeColors } from '@/hooks/useThemeColors'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const colors = useThemeColors()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // User is logged in, redirect to feed
      router.push('/feed')
    } else {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid',
          borderColor: `${colors.brandPink} transparent`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.textPrimary
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem 1.5rem',
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        maxWidth: '600px',
        margin: '0 auto',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <h1 style={{
            background: colors.brandGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Been Watching
            <span style={{
              display: 'inline-block',
              background: `rgba(233, 77, 136, ${resolvedTheme === 'dark' ? '0.2' : '0.15'})`,
              color: resolvedTheme === 'dark' ? colors.brandPink : '#d4356f',
              border: `1px solid ${colors.brandPink}`,
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              WebkitBackgroundClip: 'unset',
              WebkitTextFillColor: 'unset'
            }}>
              Alpha
            </span>
          </h1>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <ThemeToggle />
            <button
              onClick={() => router.push('/auth')}
              style={{
                padding: '0.5rem 1rem',
                background: colors.brandGradient,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.brandPink}4D`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Logo */}
      <section style={{
        textAlign: 'center',
        padding: '1rem 2rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <img
              src={resolvedTheme === 'dark' ? '/BW-Logo-dark.png' : '/BW-Logo-light.png'}
              alt="Been Watching Logo"
              style={{
                width: '120px',
                height: '120px',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) rotate(2deg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
              }}
            />
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            background: colors.brandGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Track Shows with Friends
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: colors.textSecondary,
            marginBottom: '1.5rem',
            lineHeight: 1.6
          }}>
            Track what you've been watching. Share your favorites. Discover what's next.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {[
            {
              icon: '📺',
              title: 'Track Everything',
              description: 'Movies and TV shows, organized by season. Keep track of what you want to watch, what you\'re watching, and what you\'ve watched.'
            },
            {
              icon: '⭐',
              title: 'Rate & Review',
              description: 'Love it, like it, or meh? Share your quick takes and see what your friends think.'
            },
            {
              icon: '👥',
              title: 'Social Feed',
              description: 'See what your friends are watching, comment on their takes, and discover your next binge.'
            },
            {
              icon: '💬',
              title: 'Share Your Thoughts',
              description: 'Leave comments on shows, @mention friends, and start conversations about what you\'re watching.'
            },
            {
              icon: '🎯',
              title: 'Taste Matching',
              description: 'Find friends with similar taste and discover shows you\'ll love based on their recommendations.'
            },
            {
              icon: '🏆',
              title: 'Top 3 Shows',
              description: 'Showcase your all-time favorites on your profile and see what shows define your friends.'
            }
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: colors.cardBg,
                backdropFilter: 'blur(20px)',
                border: colors.cardBorder,
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'left',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 10px 40px ${colors.brandPink}33`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: '0.5rem'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                lineHeight: 1.6
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          margin: '1.5rem 0 4rem'
        }}>
          {/* Join Waitlist Card */}
          <div style={{
            background: colors.cardBg,
            backdropFilter: 'blur(20px)',
            border: colors.cardBorder,
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: colors.shadowLg
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '1rem'
            }}>
              Join the Waitlist
            </h2>
            <p style={{
              fontSize: '0.9375rem',
              color: colors.textSecondary,
              marginBottom: '1.5rem',
              lineHeight: 1.6
            }}>
              We're currently in private alpha. Join the waitlist to get early access when we open up.
            </p>
            <button
              onClick={() => router.push('/waitlist')}
              style={{
                width: '100%',
                padding: '1rem',
                background: colors.brandGradient,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 10px 25px ${colors.brandPink}4D`
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
          <div style={{
            background: colors.cardBg,
            backdropFilter: 'blur(20px)',
            border: colors.cardBorder,
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: colors.shadowLg
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '1rem'
            }}>
              Got an Invite Code?
            </h2>
            <p style={{
              fontSize: '0.9375rem',
              color: colors.textSecondary,
              marginBottom: '1.5rem',
              lineHeight: 1.6
            }}>
              Already have an invite code? Sign in to get started.
            </p>
            <button
              onClick={() => router.push('/auth')}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                border: `2px solid ${colors.brandPink}`,
                borderRadius: '12px',
                color: colors.brandPink,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${colors.brandPink}1A`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Login or Signup
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="full" />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  )
}

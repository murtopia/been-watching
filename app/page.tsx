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
  const [vipCode, setVipCode] = useState('')
  const [validatingCode, setValidatingCode] = useState(false)
  const [codeError, setCodeError] = useState('')
  
  // Waitlist modal state
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistName, setWaitlistName] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistError, setWaitlistError] = useState('')
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null)

  const isDark = resolvedTheme === 'dark'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)'
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)'

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/feed')
    } else {
      setLoading(false)
    }
  }

  const handleVipCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')

    if (!vipCode.trim()) {
      setCodeError('Please enter a VIP code')
      return
    }

    setValidatingCode(true)

    try {
      const { data, error } = await supabase
        .rpc('is_master_code_valid', { master_code: vipCode.trim().toUpperCase() })

      if (error) throw error

      if (data === true) {
        sessionStorage.setItem('vip_code', vipCode.trim().toUpperCase())
        router.push('/auth?signup=true&vip=true')
      } else {
        setCodeError('Invalid VIP code. Please check and try again.')
      }
    } catch (err) {
      console.error('Error validating VIP code:', err)
      setCodeError('Failed to validate code. Please try again.')
    } finally {
      setValidatingCode(false)
    }
  }

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setWaitlistError('')
    setWaitlistLoading(true)

    try {
      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          email: waitlistEmail.toLowerCase().trim(),
          name: waitlistName.trim() || null
        })
        .select('position')
        .single()

      if (error) {
        if (error.code === '23505') {
          setWaitlistError('This email is already on the waitlist!')
        } else {
          setWaitlistError(error.message)
        }
      } else if (data) {
        setWaitlistSuccess(true)
        setWaitlistPosition(data.position)
      }
    } catch (err: any) {
      setWaitlistError(err.message || 'An error occurred')
    } finally {
      setWaitlistLoading(false)
    }
  }

  const closeWaitlistModal = () => {
    setShowWaitlistModal(false)
    // Reset form after closing
    setTimeout(() => {
      setWaitlistEmail('')
      setWaitlistName('')
      setWaitlistError('')
      setWaitlistSuccess(false)
      setWaitlistPosition(null)
    }, 300)
  }

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
      {/* Header - consistent with app header style */}
      <header style={{
        padding: '1rem 1.5rem',
        background: cardBg,
        borderBottom: cardBorder,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
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
          {/* Logo + Alpha badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <img
              src="/bw-logo.png"
              alt="Been Watching"
              style={{
                height: '40px',
                width: 'auto'
              }}
            />
            <h1 style={{
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Been Watching
              <span style={{
                display: 'inline-block',
                background: `rgba(233, 77, 136, ${isDark ? '0.2' : '0.15'})`,
                color: isDark ? colors.brandPink : '#d4356f',
                border: `1px solid ${colors.brandPink}`,
                padding: '0.15rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: 'unset'
              }}>
                Alpha
              </span>
            </h1>
          </div>

          {/* Sign In button */}
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
      </header>

      {/* Main Content - mobile first width */}
      <main style={{
        maxWidth: '398px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            background: colors.brandGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
            lineHeight: 1.2
          }}>
            Track Shows with Friends
          </h2>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            lineHeight: 1.5
          }}>
            Track. Share. Discover what's next.
          </p>
        </section>

        {/* Join Waitlist Card - Primary CTA */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1rem',
          boxShadow: colors.shadowLg
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: '0.75rem'
          }}>
            Join the Waitlist
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            marginBottom: '1.25rem',
            lineHeight: 1.5
          }}>
            We're currently in private alpha. Join the waitlist to get early access.
          </p>
          <button
            onClick={() => setShowWaitlistModal(true)}
            style={{
              width: '100%',
              padding: '0.875rem',
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

        {/* VIP Code Entry Card */}
        <div style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: colors.shadowLg
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: '0.75rem'
          }}>
            Got a VIP Code?
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            marginBottom: '1.25rem',
            lineHeight: 1.5
          }}>
            Enter your code to skip the waitlist.
          </p>
          <form onSubmit={handleVipCodeSubmit}>
            <input
              type="text"
              value={vipCode}
              onChange={(e) => {
                setVipCode(e.target.value.toUpperCase())
                setCodeError('')
              }}
              placeholder="Enter VIP Code"
              disabled={validatingCode}
              style={{
                width: '100%',
                padding: '0.875rem',
                marginBottom: '0.75rem',
                background: colors.background,
                border: codeError ? '2px solid #ef4444' : colors.cardBorder,
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '1rem',
                fontWeight: 600,
                textAlign: 'center',
                letterSpacing: '0.1em',
                outline: 'none',
                transition: 'all 0.2s',
                opacity: validatingCode ? 0.6 : 1,
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!codeError) {
                  e.currentTarget.style.borderColor = colors.brandPink
                }
              }}
              onBlur={(e) => {
                if (!codeError) {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                }
              }}
            />
            {codeError && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                {codeError}
              </p>
            )}
            <button
              type="submit"
              disabled={validatingCode || !vipCode.trim()}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: validatingCode || !vipCode.trim() ? colors.textSecondary : 'transparent',
                border: `2px solid ${colors.brandPink}`,
                borderRadius: '12px',
                color: validatingCode || !vipCode.trim() ? colors.background : colors.brandPink,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: validatingCode || !vipCode.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: validatingCode || !vipCode.trim() ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!validatingCode && vipCode.trim()) {
                  e.currentTarget.style.background = `${colors.brandPink}1A`
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!validatingCode && vipCode.trim()) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {validatingCode ? 'Validating...' : 'Continue'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="full" />

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={closeWaitlistModal}
        >
          <div 
            style={{
              background: isDark ? '#1a1a2e' : '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeWaitlistModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: colors.textSecondary,
                padding: '0.25rem'
              }}
            >
              ×
            </button>

            {!waitlistSuccess ? (
              <>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background: colors.brandGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>
                  Join the Waitlist
                </h2>
                <p style={{
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5
                }}>
                  Be among the first to track what you've been watching.
                </p>

                <form onSubmit={handleWaitlistSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: '0.5rem'
                    }}>
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      placeholder="Your name"
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: cardBorder,
                        borderRadius: '12px',
                        color: colors.textPrimary,
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: '0.5rem'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: waitlistError ? '2px solid #ef4444' : cardBorder,
                        borderRadius: '12px',
                        color: colors.textPrimary,
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {waitlistError && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      {waitlistError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: waitlistLoading ? colors.textSecondary : colors.brandGradient,
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: waitlistLoading ? 'not-allowed' : 'pointer',
                      opacity: waitlistLoading ? 0.6 : 1
                    }}
                  >
                    {waitlistLoading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </form>

                <p style={{
                  marginTop: '1.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: colors.textSecondary
                }}>
                  Already have an invite code?{' '}
                  <button
                    onClick={() => {
                      closeWaitlistModal()
                      router.push('/auth')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.brandPink,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Sign up here
                  </button>
                </p>
              </>
            ) : (
              /* Success state */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: colors.brandGradient,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2rem'
                }}>
                  ✓
                </div>

                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: colors.textPrimary,
                  marginBottom: '0.75rem'
                }}>
                  You're on the list!
                </h2>

                <div style={{
                  background: isDark ? 'rgba(233, 77, 136, 0.1)' : 'rgba(233, 77, 136, 0.1)',
                  border: '1px solid rgba(233, 77, 136, 0.3)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ color: colors.textSecondary, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Your position
                  </p>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    background: colors.brandGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    #{waitlistPosition}
                  </div>
                </div>

                <p style={{
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5
                }}>
                  We'll send you an invite code when it's your turn!
                </p>

                <button
                  onClick={closeWaitlistModal}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    border: cardBorder,
                    borderRadius: '12px',
                    color: colors.textPrimary,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

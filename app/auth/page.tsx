'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'
import { trackUserSignedUp, trackUserLoggedIn, identifyUser } from '@/utils/analytics'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [inviteType, setInviteType] = useState<'token' | 'vip' | null>(null)
  const [inviterUsername, setInviterUsername] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  // Check if already logged in
  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/')
    }
  }

  // Check for invite token or VIP code in sessionStorage
  useEffect(() => {
    const inviteToken = sessionStorage.getItem('invite_token')
    const vipCode = sessionStorage.getItem('vip_code')

    if (inviteToken) {
      // Friend invite via secure token
      setInviteType('token')
      setIsSignup(true)
      validateAndLoadInviteToken(inviteToken)
    } else if (vipCode) {
      // VIP code invite
      setInviteType('vip')
      setIsSignup(true)
      setInviteCode(vipCode)
    }
  }, [])

  const validateAndLoadInviteToken = async (token: string) => {
    try {
      const { data, error } = await supabase
        .rpc('validate_invite_token', { invite_token: token })

      if (error || !data?.valid) {
        console.error('Invalid invite token:', error || data?.error)
        setErrorMessage('Your invite link is invalid or has expired. Please request a new one.')
        sessionStorage.removeItem('invite_token')
        setInviteType(null)
        return
      }

      // Store inviter username for display
      setInviterUsername(data.inviter_username)
    } catch (err) {
      console.error('Error validating invite token:', err)
      setErrorMessage('Error validating invite. Please try again.')
      sessionStorage.removeItem('invite_token')
      setInviteType(null)
    }
  }

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
    setMessage('')
    setErrorMessage('')

    try {
      if (isSignup) {
        // Signup flow
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match')
          setLoading(false)
          return
        }

        // Validation based on invite type
        if (inviteType === 'vip') {
          // VIP code flow - require code validation
          if (!inviteCode) {
            setErrorMessage('Invite code is required to sign up')
            setLoading(false)
            return
          }

          const isValid = await validateInviteCode(inviteCode.trim().toUpperCase())
          if (!isValid) {
            setErrorMessage('Invalid or expired invite code')
            setLoading(false)
            return
          }
        } else if (inviteType === 'token') {
          // Friend invite token flow - already validated on page load
          const inviteToken = sessionStorage.getItem('invite_token')
          if (!inviteToken) {
            setErrorMessage('Invite token expired. Please request a new invite.')
            setLoading(false)
            return
          }
        } else {
          // No invite type - shouldn't happen, but show error
          setErrorMessage('No valid invite found. Please use an invite link or code.')
          setLoading(false)
          return
        }

        // Create account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              invite_type: inviteType
            }
          }
        })

        if (error) {
          setErrorMessage(error.message)
        } else if (data.user) {
          // Handle invite redemption based on type
          if (inviteType === 'token') {
            // Redeem friend invite token
            const inviteToken = sessionStorage.getItem('invite_token')
            if (inviteToken) {
              try {
                const { data: redeemResult, error: redeemError } = await supabase
                  .rpc('redeem_invite_token', {
                    invite_token: inviteToken,
                    referee_user_id: data.user.id
                  })

                if (redeemError) {
                  console.error('Error redeeming invite token:', redeemError)
                } else if (redeemResult?.success) {
                  console.log('✅ Successfully redeemed invite from @' + redeemResult.inviter_username)
                  sessionStorage.removeItem('invite_token')

                  // Friend invites start with 0 invites (must earn via profile completion)
                  await supabase
                    .from('profiles')
                    .update({
                      invites_remaining: 0,
                      is_approved: true
                    })
                    .eq('id', data.user.id)
                } else {
                  console.warn('Failed to redeem invite:', redeemResult?.error)
                }
              } catch (err) {
                console.error('Error processing invite token:', err)
              }
            }

          } else if (inviteType === 'vip') {
            // VIP code flow - use master code and award bulk invites
            const masterCode = inviteCode.trim().toUpperCase()

            try {
              // Use the master code
              await supabase.rpc('use_master_code', {
                master_code: masterCode,
                user_id: data.user.id
              })

              // Determine tier and award invites
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
                .eq('id', data.user.id)

              console.log(`✅ VIP code ${masterCode} used - awarded ${tier === 'boozehound' ? 10 : tier === 'alpha' ? 3 : 0} invites`)
              sessionStorage.removeItem('vip_code')

            } catch (err) {
              console.error('Error processing VIP code:', err)
            }
          }

          // Track signup event
          identifyUser(data.user.id, {
            email: data.user.email,
            signup_date: new Date().toISOString()
          })

          trackUserSignedUp({
            signup_method: 'email',
            invite_code: inviteType === 'vip' ? inviteCode.trim().toUpperCase() : undefined,
            username: data.user.email?.split('@')[0] || 'unknown',
            email: data.user.email
          })

          setMessage('Account created! Check your email to verify your account.')
        }
      } else {
        // Login flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMessage(error.message)
          setShowForgotPassword(true)
        } else {
          // Track login event
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            identifyUser(user.id, {
              email: user.email
            })
            trackUserLoggedIn({
              login_method: 'session',
              username: user.email?.split('@')[0]
            })
          }
          router.push('/')
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    if (error) {
      setErrorMessage(error.message)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      setErrorMessage(error.message)
    } else {
      setMessage('Password reset email sent! Check your inbox.')
      setShowForgotPassword(false)
    }
    setLoading(false)
  }

  const bgColor = isDarkMode ? '#0a0a0a' : '#ffffff'
  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
  const inputBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const inputBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const inputFocusBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
  const dividerColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const oauthButtonBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const oauthButtonHoverBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'

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
      {/* Login Card */}
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
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <a
            href="/welcome"
            style={{
              padding: '0.5rem 1rem',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '8px',
              color: textPrimary,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ← Back
          </a>
          <ThemeToggle />
        </div>

        {/* Logo/Brand */}
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
            Been Watching
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Track what you've been watching
          </p>
        </div>

        {/* Toggle Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            padding: '0.25rem',
            borderRadius: '12px',
          }}
        >
          <button
            onClick={() => {
              setIsSignup(false)
              setShowForgotPassword(false)
              setErrorMessage('')
              setMessage('')
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: !isSignup
                ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
                : 'transparent',
              color: !isSignup ? textPrimary : textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignup(true)
              setShowForgotPassword(false)
              setErrorMessage('')
              setMessage('')
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: isSignup
                ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')
                : 'transparent',
              color: isSignup ? textPrimary : textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: oauthButtonBg,
              border: `1px solid ${inputBorder}`,
              borderRadius: '12px',
              color: textPrimary,
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = oauthButtonHoverBg
              e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = oauthButtonBg
              e.currentTarget.style.borderColor = inputBorder
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                fill="#4285F4"
              />
              <path
                d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
                fill="#34A853"
              />
              <path
                d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* OAuth Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1.5rem 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: dividerColor }} />
          <span style={{ color: textSecondary, fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: dividerColor }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
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
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: isSignup ? '1.25rem' : '0.75rem' }}>
            <label
              style={{
                display: 'block',
                color: textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (showForgotPassword) {
                  setShowForgotPassword(false)
                  setErrorMessage('')
                }
              }}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: inputBg,
                border: `1px solid ${errorMessage ? '#ef4444' : inputBorder}`,
                borderRadius: '12px',
                color: textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errorMessage ? '#ef4444' : 'rgba(233, 77, 136, 0.5)'
                e.target.style.background = inputFocusBg
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errorMessage ? '#ef4444' : inputBorder
                e.target.style.background = inputBg
              }}
            />
          </div>

          {/* Error Message & Forgot Password (Login only, shown after error) */}
          {!isSignup && errorMessage && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                {errorMessage}
              </div>
            </div>
          )}

          {/* Forgot Password - Only shows after failed login */}
          {!isSignup && showForgotPassword && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(233, 77, 136, 1)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Confirm Password (Signup only) */}
          {isSignup && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  color: textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required={isSignup}
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
            </div>
          )}

          {/* Invite Info/Code (Signup only) */}
          {isSignup && inviteType === 'token' && inviterUsername && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(233, 77, 136, 0.1) 0%, rgba(242, 113, 33, 0.1) 100%)',
              border: '1px solid rgba(233, 77, 136, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <div style={{ color: textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>
                Invited by <span style={{ color: '#e94d88' }}>@{inviterUsername}</span>
              </div>
              <div style={{ color: textSecondary, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                No invite code needed!
              </div>
            </div>
          )}

          {isSignup && inviteType === 'vip' && (
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
                VIP Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="BWALPHA_XXXXXXXX"
                required={true}
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
              <p style={{
                color: textSecondary,
                fontSize: '0.75rem',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                Don't have a code?{' '}
                <a
                  href="/waitlist"
                  style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none' }}
                >
                  Join the waitlist
                </a>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading
                ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1,
              marginTop: !isSignup && !showForgotPassword ? '1.5rem' : '0',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(233, 77, 136, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Processing...
              </span>
            ) : isSignup ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>

          {/* Success/Error Message Display */}
          {message && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#22c55e',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {message}
            </div>
          )}

          {isSignup && errorMessage && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: textSecondary, fontSize: '0.8125rem', lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <a
              href="/terms"
              style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none' }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none' }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Full Footer */}
      <div style={{ marginTop: '3rem', width: '100%' }}>
        <Footer variant="full" />
      </div>

      {/* Keyframes for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

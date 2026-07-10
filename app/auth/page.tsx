'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'
import PasswordChecklist from '@/components/auth/PasswordChecklist'
import { validatePassword, friendlyAuthError } from '@/utils/passwordPolicy'
import { trackUserSignedUp, trackUserLoggedIn, identifyUser } from '@/utils/analytics'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = useThemeColors()
  const isDarkMode = resolvedTheme === 'dark'

  // Check if already logged in
  useEffect(() => {
    checkUser()
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

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/')
    }
  }

  // Open the Sign Up tab directly when linked with ?signup=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('signup') === 'true') {
      setIsSignup(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    try {
      if (isSignup) {
        // Signup flow - registration is open, no invite required
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match')
          setLoading(false)
          return
        }

        if (!validatePassword(password).valid) {
          setErrorMessage("Your password doesn't meet the requirements yet — check the list below the password field.")
          setLoading(false)
          return
        }

        // Create account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setErrorMessage(friendlyAuthError(error))
        } else if (data.user) {
          // Track signup event
          identifyUser(data.user.id, {
            email: data.user.email,
            signup_date: new Date().toISOString()
          })

          trackUserSignedUp({
            signup_method: 'email',
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
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          prompt: 'select_account'
        }
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

  // Use centralized theme colors
  const textPrimary = colors.textPrimary
  const textSecondary = colors.textSecondary
  const inputBg = colors.inputBg
  const inputBorder = colors.inputBorder
  const inputFocusBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
  const dividerColor = colors.dividerColor
  const oauthButtonBg = colors.inputBg
  const oauthButtonHoverBg = colors.cardBgHover

  return (
    <div
      style={{
        minHeight: '100svh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Fixed background image */}
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
      {/* Fixed overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.65) 100%)',
        zIndex: 1
      }} />
      {/* Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.goldBorder,
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: colors.shadowLg,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <a
            href="/"
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
        </div>

        {/* Logo/Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: colors.textPrimary,
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
                e.target.style.borderColor = '${colors.goldAccent}'
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
                e.target.style.borderColor = errorMessage ? '#ef4444' : '${colors.goldAccent}'
                e.target.style.background = inputFocusBg
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errorMessage ? '#ef4444' : inputBorder
                e.target.style.background = inputBg
              }}
            />
            {isSignup && <PasswordChecklist password={password} />}
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
                  color: '${colors.goldAccent}',
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
                  e.target.style.borderColor = '${colors.goldAccent}'
                  e.target.style.background = inputFocusBg
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = inputBorder
                  e.target.style.background = inputBg
                }}
              />
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
                : colors.goldAccent,
              border: 'none',
              borderRadius: '12px',
              color: loading ? '#fff' : '#000',
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
                e.currentTarget.style.boxShadow = `0 10px 25px ${colors.goldAccent}4D`
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
                textAlign: 'left',
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
              style={{ color: '${colors.goldAccent}', textDecoration: 'none' }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              style={{ color: '${colors.goldAccent}', textDecoration: 'none' }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Full Footer */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2,
        width: '100vw',
        marginLeft: '-2rem',
        marginRight: '-2rem',
        marginTop: '2rem'
      }}>
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

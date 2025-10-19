'use client'

import { useState, useEffect } from 'react'

export default function LoginPreview() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check system preference on mount
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    // Simulate API call with potential failure
    setTimeout(() => {
      setLoading(false)

      // Simulate password error on login
      if (!isSignup && password === 'wrong') {
        setErrorMessage('Incorrect email or password')
        setShowForgotPassword(true)
      } else {
        setMessage(isSignup ? 'Signup preview - no actual account created' : 'Login preview - not actually logging in')
        setShowForgotPassword(false)
      }
    }, 1000)
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Preview Badge & Theme Toggle */}
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
        <div
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(249, 115, 22, 0.2)',
            border: '1px solid rgba(249, 115, 22, 0.5)',
            borderRadius: '8px',
            color: '#f97316',
            fontSize: '0.875rem',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
          }}
        >
          🎨 Preview Mode
        </div>
      </div>

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

        {/* OAuth Buttons (moved up) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setMessage('Google OAuth preview - not actually authenticating')}
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

          <button
            type="button"
            onClick={() => setMessage('Apple OAuth preview - not actually authenticating')}
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15.469 7.969c-.12.096-2.243 1.297-2.243 3.969 0 3.094 2.712 4.182 2.808 4.206-.012.072-.432 1.512-1.44 2.976-.876 1.297-1.8 2.58-3.204 2.58-1.404 0-1.776-.828-3.384-.828-1.56 0-2.124.852-3.42.852-1.296 0-2.244-1.224-3.24-2.688C.324 16.753-.612 13.755-.612 10.949c0-4.518 2.94-6.912 5.832-6.912 1.536 0 2.82.996 3.78.996.912 0 2.34-1.068 4.08-1.068.66 0 3.036.06 4.488 2.292-.12.084-.108.072-.108.072-.06.048.06-.036 0 0zM12.588 3.3c.66-.804 1.152-1.932 1.152-3.048 0-.156-.012-.312-.036-.444-1.104.036-2.412.732-3.204 1.656-.612.696-1.188 1.8-1.188 2.94 0 .168.024.336.036.384.06.012.156.024.252.024.996 0 2.244-.66 2.988-1.512z" />
            </svg>
            Continue with Apple
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
                onClick={() => {
                  setMessage('Password reset preview - no email sent')
                  setErrorMessage('')
                  setShowForgotPassword(false)
                }}
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

          {/* Success Message Display */}
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
        </form>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: textSecondary, fontSize: '0.8125rem', lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setMessage('Terms of Service preview')
              }}
              style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none' }}
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setMessage('Privacy Policy preview')
              }}
              style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none' }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
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

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const supabase = createClient()

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
    setError('')
    setSuccess(false)

    try {
      // Insert into waitlist
      const { data, error: insertError } = await supabase
        .from('waitlist')
        .insert({
          email: email.toLowerCase().trim(),
          name: name.trim() || null
        })
        .select('position')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation - email already exists
          setError('This email is already on the waitlist!')
        } else {
          setError(insertError.message)
        }
      } else if (data) {
        setSuccess(true)
        setPosition(data.position)
        setEmail('')
        setName('')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
      {/* Top Bar */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Back
        </a>
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

      {/* Waitlist Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
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
        {!success ? (
          <>
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
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: textPrimary,
                  marginBottom: '0.5rem',
                }}
              >
                Join the Waitlist
              </h2>
              <p style={{ color: textSecondary, fontSize: '0.875rem', lineHeight: 1.6 }}>
                Be among the first to track what you've been watching. We'll send you an invite code when it's your turn.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Name Input */}
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
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
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

              {/* Email Input */}
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
                    border: `1px solid ${error ? '#ef4444' : inputBorder}`,
                    borderRadius: '12px',
                    color: textPrimary,
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = error ? '#ef4444' : 'rgba(233, 77, 136, 0.5)'
                    e.target.style.background = inputFocusBg
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? '#ef4444' : inputBorder
                    e.target.style.background = inputBg
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    marginBottom: '1.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
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
                    Joining...
                  </span>
                ) : (
                  'Join Waitlist'
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
                Already have an invite code?{' '}
                <a
                  href="/auth"
                  style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Sign up here
                </a>
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.5rem',
                }}
              >
                ✓
              </div>

              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: textPrimary,
                  marginBottom: '1rem',
                }}
              >
                You're on the list!
              </h2>

              <div
                style={{
                  background: isDarkMode ? 'rgba(233, 77, 136, 0.1)' : 'rgba(233, 77, 136, 0.1)',
                  border: `1px solid ${isDarkMode ? 'rgba(233, 77, 136, 0.3)' : 'rgba(233, 77, 136, 0.3)'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '1.5rem',
                }}
              >
                <p style={{ color: textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Your position in line
                </p>
                <div
                  style={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  #{position}
                </div>
              </div>

              <p style={{ color: textSecondary, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                We'll send you an invite code when it's your turn. Keep an eye on your inbox!
              </p>

              <button
                onClick={() => {
                  setSuccess(false)
                  setPosition(null)
                }}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'transparent',
                  border: `1px solid ${inputBorder}`,
                  borderRadius: '12px',
                  color: textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Add Another Email
              </button>

              <div style={{ marginTop: '2rem' }}>
                <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
                  Already have an invite code?{' '}
                  <a
                    href="/auth"
                    style={{ color: 'rgba(233, 77, 136, 1)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </div>
          </>
        )}
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

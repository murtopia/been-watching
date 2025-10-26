'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setMessage('Password updated successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
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
      {/* Reset Password Card */}
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
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
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
            Reset Password
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleResetPassword}>
          {/* New Password Input */}
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
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

          {/* Confirm Password Input */}
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
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
                Updating...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          {/* Success Message */}
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

          {/* Error Message */}
          {errorMessage && (
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

        {/* Back to Login Link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a
            href="/auth"
            style={{
              color: 'rgba(233, 77, 136, 1)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Back to Login
          </a>
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

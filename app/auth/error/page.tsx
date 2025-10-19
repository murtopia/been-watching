'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorDescription) {
      setError(errorDescription)
    } else if (errorParam) {
      setError(errorParam)
    } else {
      setError('An error occurred during authentication')
    }
  }, [searchParams])

  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'

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
      <div
        style={{
          background: cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${cardBorder}`,
          borderRadius: '16px',
          padding: '3rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
          }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: textPrimary,
            marginBottom: '1rem',
          }}
        >
          Authentication Error
        </h1>

        {/* Error Message */}
        <p
          style={{
            color: textSecondary,
            fontSize: '1rem',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          {error}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            href="/auth"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Try Again
          </Link>

          <Link
            href="/waitlist"
            style={{
              padding: '0.75rem 1.5rem',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: textPrimary,
              border: `1px solid ${cardBorder}`,
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Join Waitlist
          </Link>
        </div>

        {/* Help Text */}
        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: textSecondary,
          }}
        >
          Need help? Contact support or try logging in with a different method.
        </p>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function CCPAPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would submit to your backend
    setSubmitted(true)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
          zIndex: 100,
        }}
      >
        <ThemeToggle />
      </div>

      {/* Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '4rem auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem',
            }}
          >
            Do Not Sell My Personal Information
          </h1>
          <p style={{ color: textSecondary, fontSize: '1rem' }}>
            California Consumer Privacy Act (CCPA) Rights
          </p>
        </div>

        {/* Content */}
        <div style={{ color: textPrimary, lineHeight: 1.8, marginBottom: '3rem' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Your Privacy Rights
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              Under the California Consumer Privacy Act (CCPA), California residents have the right to opt-out of the "sale" of their personal information.
            </p>
            <p style={{ color: textSecondary }}>
              <strong>Important:</strong> Been Watching does not sell your personal information to third parties. However, we respect your right to make this request.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              What We Do With Your Data
            </h2>
            <ul style={{ color: textSecondary, paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>
                We use your data to provide and improve our service
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                We share necessary data with service providers (like Supabase for authentication)
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                We do not sell your personal information for monetary or other valuable consideration
              </li>
              <li>
                We do not share your data with third parties for their direct marketing purposes
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Your CCPA Rights
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              As a California resident, you have the right to:
            </p>
            <ul style={{ color: textSecondary, paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Know</strong> what personal information we collect, use, and disclose
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Request deletion</strong> of your personal information
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Opt-out</strong> of the sale of your personal information
              </li>
              <li>
                <strong>Non-discrimination</strong> for exercising your CCPA rights
              </li>
            </ul>
          </section>
        </div>

        {/* Opt-Out Form */}
        {!submitted ? (
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: isDark
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : '0 20px 60px rgba(0, 0, 0, 0.08)',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
              Submit Your Request
            </h3>
            <p style={{ color: textSecondary, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              To exercise your CCPA rights or submit a "Do Not Sell" request, please provide your email address below.
            </p>
            <form onSubmit={handleSubmit}>
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
                  Email Address
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
                  }}
                />
              </div>
              <button
                type="submit"
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
                }}
              >
                Submit Request
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: isDark
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : '0 20px 60px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: textPrimary, marginBottom: '0.75rem' }}>
              Request Submitted
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.9375rem' }}>
              Thank you for submitting your request. We will process it within 45 days as required by law and send a confirmation to {email}.
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: isDark
              ? '0 20px 60px rgba(0, 0, 0, 0.5)'
              : '0 20px 60px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
            Need More Information?
          </h3>
          <p style={{ color: textSecondary, marginBottom: '1rem', fontSize: '0.9375rem' }}>
            For more details about how we collect, use, and protect your data, please review our{' '}
            <a href="/privacy" style={{ color: '#e94d88', textDecoration: 'none', fontWeight: 600 }}>
              Privacy Policy
            </a>.
          </p>
          <p style={{ color: textSecondary, fontSize: '0.9375rem' }}>
            For other inquiries, please{' '}
            <a href="/contact" style={{ color: '#e94d88', textDecoration: 'none', fontWeight: 600 }}>
              contact us
            </a>.
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 600,
            }}
          >
            Back to Home
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', width: '100%' }}>
        <Footer variant="full" />
      </div>
    </div>
  )
}

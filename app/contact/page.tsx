'use client'

import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function ContactPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'

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
            Contact Us
          </h1>
          <p style={{ color: textSecondary, fontSize: '1.125rem' }}>
            We'd love to hear from you
          </p>
        </div>

        {/* Contact Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Email Card */}
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: textPrimary, marginBottom: '0.75rem' }}>
              General Inquiries
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              For general questions, feedback, or support
            </p>
            <a
              href="mailto:hello@beenwatching.com"
              style={{
                color: '#e94d88',
                fontSize: '1.125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              hello@beenwatching.com
            </a>
          </div>

          {/* Support Card */}
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: textPrimary, marginBottom: '0.75rem' }}>
              Technical Support
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              Having trouble? Need help with your account?
            </p>
            <a
              href="mailto:support@beenwatching.com"
              style={{
                color: '#e94d88',
                fontSize: '1.125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              support@beenwatching.com
            </a>
          </div>

          {/* Press Card */}
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: textPrimary, marginBottom: '0.75rem' }}>
              Press & Media
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              Media inquiries and press kit requests
            </p>
            <a
              href="mailto:press@beenwatching.com"
              style={{
                color: '#e94d88',
                fontSize: '1.125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              press@beenwatching.com
            </a>
          </div>
        </div>

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
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textPrimary, marginBottom: '0.5rem' }}>
            Response Time
          </h3>
          <p style={{ color: textSecondary, fontSize: '0.9375rem' }}>
            We typically respond within 24-48 hours during business days
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

'use client'

import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function CookiesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
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
            Cookie Policy
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div style={{ color: textPrimary, lineHeight: 1.8 }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              What Are Cookies?
            </h2>
            <p style={{ color: textSecondary }}>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              How We Use Cookies
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              We use cookies for the following purposes:
            </p>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>
              Essential Cookies
            </h3>
            <p style={{ color: textSecondary }}>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management. You cannot opt-out of these cookies.
            </p>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>
              Preference Cookies
            </h3>
            <p style={{ color: textSecondary }}>
              These cookies remember your preferences and settings, such as your language preference, theme selection (light or dark mode), and display settings.
            </p>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>
              Analytics Cookies
            </h3>
            <p style={{ color: textSecondary }}>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service and user experience.
            </p>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>
              Performance Cookies
            </h3>
            <p style={{ color: textSecondary }}>
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Third-Party Cookies
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              We use the following third-party services that may set cookies:
            </p>
            <ul style={{ color: textSecondary, paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Supabase:</strong> For authentication and database services
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>The Movie Database (TMDB):</strong> For movie and TV show data
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Vercel Analytics:</strong> For performance monitoring (if enabled)
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Managing Cookies
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              You can control and manage cookies in several ways:
            </p>
            <ul style={{ color: textSecondary, paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                Most browsers allow you to view, manage, delete, and block cookies through their settings
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                You can set your browser to refuse all cookies or to indicate when a cookie is being sent
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Please note that if you disable cookies, some features of our service may not function properly
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Cookie Retention
            </h2>
            <p style={{ color: textSecondary }}>
              Session cookies are deleted when you close your browser. Persistent cookies remain on your device until they expire or you delete them. The retention period varies depending on the purpose of the cookie.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Updates to This Policy
            </h2>
            <p style={{ color: textSecondary }}>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Contact Us
            </h2>
            <p style={{ color: textSecondary }}>
              If you have questions about our use of cookies, please{' '}
              <a href="/contact" style={{ color: '#e94d88', textDecoration: 'none', fontWeight: 600 }}>
                contact us
              </a>.
            </p>
          </section>
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

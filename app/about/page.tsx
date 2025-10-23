'use client'

import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function AboutPage() {
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
            About Been Watching
          </h1>
          <p style={{ color: textSecondary, fontSize: '1.125rem' }}>
            Track what you've been watching. Share your favorites. Discover what's next.
          </p>
        </div>

        {/* Content Sections */}
        <div style={{ color: textPrimary, lineHeight: 1.8 }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Our Mission
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              Been Watching is a social platform designed for TV and movie enthusiasts who want to keep track of what they've watched, share their thoughts with friends, and discover their next favorite show.
            </p>
            <p style={{ color: textSecondary }}>
              We believe that watching TV and movies is a social experience, and we're building a community where you can connect with friends over shared interests and discover new content through the people you trust.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Been Watching
            </h2>
            <ul style={{ color: textSecondary, paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Keep Track of Everything:</strong> Organize your personal lists of what you want to watch, what you're currently watching, and what you've already seen
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Share Your Takes:</strong> Rate and review shows and movies, and see what your friends think
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Social Feed:</strong> Stay up to date with what your friends are watching and loving
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>Discover Together:</strong> Find your next binge through friends with similar taste
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Our Story
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              Been Watching was created by TV lovers who were tired of forgetting what they watched, losing track of recommendations from friends, and endlessly scrolling through streaming services trying to find something to watch.
            </p>
            <p style={{ color: textSecondary }}>
              We're currently in private alpha, building the platform with our early community and refining the experience based on real feedback from real TV enthusiasts.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Get in Touch
            </h2>
            <p style={{ color: textSecondary }}>
              Have questions, feedback, or just want to say hi? We'd love to hear from you.{' '}
              <a href="/contact" style={{ color: '#e94d88', textDecoration: 'none', fontWeight: 600 }}>
                Contact us
              </a>
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

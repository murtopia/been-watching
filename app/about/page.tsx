'use client'

import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'

export default function AboutPage() {
  const colors = useThemeColors()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '398px',
          margin: '0 auto',
          padding: '2rem 1rem',
          flex: 1,
        }}
      >
        {/* Back Button */}
        <a
          href="/"
          style={{
            color: colors.goldAccent,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: '1.5rem',
          }}
        >
          ← Back to Home
        </a>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            About Been Watching
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '1rem' }}>
            Track what you've been watching. Share your favorites. Discover what's next.
          </p>
        </div>

        {/* Content Sections */}
        <div style={{ color: colors.textPrimary, lineHeight: 1.8 }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: colors.textPrimary }}>
              Our Mission
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: '1rem', fontSize: '0.9375rem' }}>
              Been Watching is a social platform designed for TV and movie enthusiasts who want to keep track of what they've watched, share their thoughts with friends, and discover their next favorite show.
            </p>
            <p style={{ color: colors.textSecondary, fontSize: '0.9375rem' }}>
              We believe that watching TV and movies is a social experience, and we're building a community where you can connect with friends over shared interests and discover new content through the people you trust.
            </p>
          </section>

          {/* Divider */}
          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: colors.textPrimary }}>
              Features
            </h2>
            <ul style={{ color: colors.textSecondary, paddingLeft: '1.25rem', fontSize: '0.9375rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: colors.textPrimary }}>Keep Track of Everything:</strong> Organize your personal lists of what you want to watch, what you're currently watching, and what you've already seen
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: colors.textPrimary }}>Share Your Takes:</strong> Rate and review shows and movies, and see what your friends think
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: colors.textPrimary }}>Social Feed:</strong> Stay up to date with what your friends are watching and loving
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: colors.textPrimary }}>Discover Together:</strong> Find your next binge through friends with similar taste
              </li>
            </ul>
          </section>

          {/* Divider */}
          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: colors.textPrimary }}>
              Our Story
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: '1rem', fontSize: '0.9375rem' }}>
              Been Watching was created by TV lovers who were tired of forgetting what they watched, losing track of recommendations from friends, and endlessly scrolling through streaming services trying to find something to watch.
            </p>
            <p style={{ color: colors.textSecondary, fontSize: '0.9375rem' }}>
              We're currently in private alpha, building the platform with our early community and refining the experience based on real feedback from real TV enthusiasts.
            </p>
          </section>

          {/* Divider */}
          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: colors.textPrimary }}>
              A Special Thanks
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '0.9375rem' }}>
              I'd like to shoutout a special thank you to my buddy Tony Rosland, the creator of{' '}
              <a 
                href="https://studioledger.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: colors.goldAccent, textDecoration: 'none', fontWeight: 600 }}
              >
                Studio Ledger
              </a>
              . Tony has been my guide, mentor, troubleshooter, and advisor throughout this project and others. I have learned so much from him in a relatively short amount of time. Because of Tony, I now approach all of my projects in such a more advanced way that allows for faster development, less errors, and more awesomeness. Thanks Tony, I appreciate you!
            </p>
          </section>

          {/* Divider */}
          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: colors.textPrimary }}>
              Get in Touch
            </h2>
            <p style={{ color: colors.textSecondary, fontSize: '0.9375rem' }}>
              Have questions, feedback, or just want to say hi? We'd love to hear from you.{' '}
              <a href="/contact" style={{ color: colors.goldAccent, textDecoration: 'none', fontWeight: 600 }}>
                Contact us →
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

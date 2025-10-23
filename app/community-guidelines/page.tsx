'use client'

import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function CommunityGuidelinesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'

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
            Community Guidelines
          </h1>
          <p style={{ color: textSecondary, fontSize: '1.125rem' }}>
            Let's keep Been Watching fun, friendly, and safe for everyone
          </p>
        </div>

        {/* Content */}
        <div style={{ color: textPrimary, lineHeight: 1.8 }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Our Values
            </h2>
            <p style={{ color: textSecondary }}>
              Been Watching is a community of TV and movie lovers who share their passion for great entertainment. We're building a space where everyone feels welcome to share their thoughts, discover new shows, and connect with friends over shared interests.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Be Respectful
            </h2>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <ul style={{ color: textSecondary, paddingLeft: '1.5rem', margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  Treat others the way you want to be treated
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Respect different opinions and tastes - not everyone will love the same shows you do
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Disagree respectfully and keep discussions constructive
                </li>
                <li>
                  No harassment, bullying, or personal attacks
                </li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Keep It Clean
            </h2>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <ul style={{ color: textSecondary, paddingLeft: '1.5rem', margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  No hate speech, discrimination, or offensive content
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Keep language appropriate for all ages
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  No sexually explicit or graphic violent content
                </li>
                <li>
                  Mark spoilers clearly when discussing plot details
                </li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Be Authentic
            </h2>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <ul style={{ color: textSecondary, paddingLeft: '1.5rem', margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  Use your real name or a genuine username
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Don't impersonate others or create fake accounts
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Share your honest opinions - we value genuine recommendations
                </li>
                <li>
                  Don't manipulate ratings or reviews
                </li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Respect Privacy
            </h2>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <ul style={{ color: textSecondary, paddingLeft: '1.5rem', margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  Don't share other people's personal information
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  Respect private profiles and privacy settings
                </li>
                <li>
                  Don't screenshot or share private conversations
                </li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              No Spam or Self-Promotion
            </h2>
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <ul style={{ color: textSecondary, paddingLeft: '1.5rem', margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  Don't spam comments or excessive self-promotion
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  No advertising or commercial content
                </li>
                <li>
                  Keep content relevant to TV shows and movies
                </li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Reporting Violations
            </h2>
            <p style={{ color: textSecondary, marginBottom: '1rem' }}>
              If you see content or behavior that violates these guidelines, please{' '}
              <a href="/contact" style={{ color: '#e94d88', textDecoration: 'none', fontWeight: 600 }}>
                contact our support team
              </a>{' '}
              with details about the violation. We review all reports and take appropriate action, which may include:
            </p>
            <ul style={{ color: textSecondary, paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Content removal</li>
              <li style={{ marginBottom: '0.5rem' }}>Account warnings</li>
              <li style={{ marginBottom: '0.5rem' }}>Temporary suspension</li>
              <li>Permanent account termination for serious or repeated violations</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Questions?
            </h2>
            <p style={{ color: textSecondary }}>
              If you have questions about these guidelines or need to report something, please{' '}
              <a href="/contact" style={{ color: '#e94d88', textDecoration: 'none', fontWeight: 600 }}>
                contact us
              </a>.
            </p>
          </section>

          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: textSecondary, fontSize: '0.875rem', margin: 0 }}>
              Last updated: January 2025
            </p>
          </div>
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

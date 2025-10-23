'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface FooterProps {
  variant?: 'full' | 'minimal'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'
  const linkColor = '#e94d88'
  const dividerColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  const currentYear = new Date().getFullYear()

  if (variant === 'minimal') {
    // Minimal footer card for logged-in pages
    return (
      <div style={{
        maxWidth: '600px',
        margin: '2rem auto 0',
        padding: '0 1.5rem',
        paddingBottom: '6rem' // Extra space for BottomNav
      }}>
        <div style={{
          background: cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${cardBorder}`,
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
            <a href="/privacy" style={{ color: linkColor, textDecoration: 'none', margin: '0 0.75rem', fontWeight: '600' }}>
              Privacy
            </a>
            <a href="/terms" style={{ color: linkColor, textDecoration: 'none', margin: '0 0.75rem', fontWeight: '600' }}>
              Terms
            </a>
            <a href="/ccpa" style={{ color: linkColor, textDecoration: 'none', margin: '0 0.75rem', fontWeight: '600' }}>
              Do Not Sell My Info
            </a>
          </div>
          <div style={{ color: textSecondary, fontSize: '0.8125rem' }}>
            © {currentYear} Been Watching. All rights reserved.
          </div>
        </div>
      </div>
    )
  }

  // Full footer card for marketing/public pages
  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto 0',
      padding: '0 1.5rem'
    }}>
      <div style={{
        background: cardBg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${cardBorder}`,
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: isDark
          ? '0 20px 60px rgba(0, 0, 0, 0.5)'
          : '0 20px 60px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Brand Section */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '1.5rem',
          borderBottom: `1px solid ${dividerColor}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            Been Watching
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: textSecondary,
            lineHeight: '1.6'
          }}>
            Track what you've been watching. Share your favorites. Discover what's next.
          </p>
        </div>

        {/* Links Grid - 3 columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Company - Left Aligned */}
          <div style={{ textAlign: 'left' }}>
            <h3 style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: textPrimary,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Company
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/about" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  About
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/contact" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Been Watching - Center Aligned */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: textPrimary,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Been Watching
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/help" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Help
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/community-guidelines" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Legal - Right Aligned */}
          <div style={{ textAlign: 'right' }}>
            <h3 style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: textPrimary,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Legal
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/privacy" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Privacy
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/terms" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Terms
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/cookies" style={{ color: textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Cookies
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/ccpa" style={{ color: linkColor, textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>
                  CCPA Opt-Out
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${dividerColor}`,
          paddingTop: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.8125rem',
            color: textSecondary,
            marginBottom: '0.5rem'
          }}>
            © {currentYear} Been Watching. All rights reserved.
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: textSecondary
          }}>
            Made with ❤️ for TV lovers
          </div>
        </div>
      </div>
    </div>
  )
}

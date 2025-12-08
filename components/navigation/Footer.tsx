'use client'

import { useThemeColors } from '@/hooks/useThemeColors'

interface FooterProps {
  variant?: 'full' | 'minimal'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  const colors = useThemeColors()

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
          background: colors.glassBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: colors.glassBorder,
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: colors.shadowLg,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
            <a href="/privacy" style={{ color: colors.brandPink, textDecoration: 'none', margin: '0 0.75rem', fontWeight: '600' }}>
              Privacy
            </a>
            <a href="/terms" style={{ color: colors.brandPink, textDecoration: 'none', margin: '0 0.75rem', fontWeight: '600' }}>
              Terms
            </a>
            <a href="/ccpa" style={{ color: colors.brandPink, textDecoration: 'none', margin: '0 0.75rem', fontWeight: '600' }}>
              Do Not Sell My Info
            </a>
          </div>
          <div style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
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
        background: colors.glassBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: colors.glassBorder,
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: colors.shadowLg
      }}>
        {/* Brand Section */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '1.5rem',
          borderBottom: `1px solid ${colors.borderColor}`,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            background: colors.brandGradient,
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
            color: colors.textSecondary,
            lineHeight: '1.6'
          }}>
            Track. Share. Discover what's next.
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
              color: colors.textPrimary,
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
                <a href="/about" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  About
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/contact" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
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
              color: colors.textPrimary,
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
                <a href="/help" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Help
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/community-guidelines" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
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
              color: colors.textPrimary,
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
                <a href="/privacy" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Privacy
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/terms" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Terms
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/cookies" style={{ color: colors.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
                  Cookies
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a href="/ccpa" style={{ color: colors.brandPink, textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>
                  CCPA Opt-Out
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: `1px solid ${colors.borderColor}`,
          paddingTop: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.8125rem',
            color: colors.textSecondary
          }}>
            © {currentYear} Been Watching. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useThemeColors } from '@/hooks/useThemeColors'

interface FooterProps {
  /** @deprecated Use withBottomNav instead. Will be removed in future version. */
  variant?: 'full' | 'minimal'
  /** Add extra bottom padding to account for BottomNav on logged-in pages */
  withBottomNav?: boolean
}

export default function Footer({ variant = 'full', withBottomNav = false }: FooterProps) {
  const colors = useThemeColors()

  const currentYear = new Date().getFullYear()

  // Full footer card - used on all pages now
  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto 0',
      padding: '0 1.5rem',
      paddingBottom: withBottomNav ? '6rem' : '2rem' // Extra space for BottomNav when needed
    }}>
      <div style={{
        background: colors.glassBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: colors.goldBorder,
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: colors.shadowLg
      }}>
        {/* Brand Section */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '1.5rem',
          borderBottom: colors.goldBorder,
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            color: colors.textPrimary,
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
                <a href="/ccpa" style={{ color: colors.textPrimary, textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600' }}>
                  CCPA Opt-Out
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: colors.goldBorder,
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

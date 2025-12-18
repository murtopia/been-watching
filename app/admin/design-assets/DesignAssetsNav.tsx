'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function DesignAssetsNav() {
  const pathname = usePathname()
  const colors = useThemeColors()

  const navItems = [
    { label: 'Overview', href: '/admin/design-assets' },
    { label: 'Icon Library', href: '/admin/design-assets/icons' },
    { label: 'Card Gallery', href: '/admin/design-assets/cards' },
    { label: 'Feed Cards (React)', href: '/admin/design-assets/feed-cards' },
    { label: 'Components', href: '/admin/design-assets/components' }
  ]

  return (
    <>
      <style>{`
        .design-assets-nav-wrapper {
          margin-left: -1rem;
          margin-right: -1rem;
          padding-left: 1rem;
          padding-right: 1rem;
          margin-bottom: 2rem;
          overflow: hidden;
        }
        .design-assets-nav {
          display: flex;
          gap: 0;
          border-bottom: 1px solid ${colors.borderColor};
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 0;
        }
        .design-assets-nav::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 768px) {
          .design-assets-nav-wrapper {
            margin-left: -1rem;
            margin-right: -1rem;
          }
          .design-assets-nav a {
            padding: 0.75rem 0.75rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
      <div className="design-assets-nav-wrapper">
        <div className="design-assets-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: pathname === item.href ? colors.goldAccent : colors.textSecondary,
                textDecoration: 'none',
                borderBottom: pathname === item.href ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

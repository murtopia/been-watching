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
        .design-assets-nav {
          display: flex;
          gap: 0;
          border-bottom: 1px solid ${colors.borderColor};
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 0;
          margin-bottom: 1.5rem;
          max-width: 100%;
        }
        .design-assets-nav::-webkit-scrollbar {
          display: none;
        }
        .design-assets-nav a {
          padding: 0.75rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.2s;
        }
      `}</style>
      <div className="design-assets-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: pathname === item.href ? colors.goldAccent : colors.textSecondary,
              borderBottom: pathname === item.href ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  )
}

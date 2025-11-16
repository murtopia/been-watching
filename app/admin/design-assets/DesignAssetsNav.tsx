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
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      borderBottom: colors.cardBorder,
      paddingBottom: '0',
      overflowX: 'auto'
    }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: pathname === item.href ? colors.brandPink : colors.textSecondary,
            textDecoration: 'none',
            borderBottom: pathname === item.href ? `2px solid ${colors.brandPink}` : '2px solid transparent',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

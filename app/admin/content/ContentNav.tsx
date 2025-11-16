'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function ContentNav() {
  const pathname = usePathname()
  const colors = useThemeColors()

  const navItems = [
    { label: 'Overview', href: '/admin/content' },
    { label: 'Activity', href: '/admin/content/activity' },
    { label: 'Ratings', href: '/admin/content/ratings' },
    { label: 'Top Media', href: '/admin/content/top' },
    { label: 'Search', href: '/admin/content/search' }
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

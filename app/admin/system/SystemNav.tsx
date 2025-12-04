'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SystemNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Overview', href: '/admin/system', exact: true },
    { label: 'Health', href: '/admin/system/health' },
    { label: 'Errors', href: '/admin/system/errors' },
    { label: 'API', href: '/admin/system/api' },
    { label: 'Database', href: '/admin/system/database' },
    { label: 'Streaming Platforms', href: '/admin/settings/streaming-platforms' }
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: 'var(--border)',
      borderRadius: '12px',
      padding: '0.5rem',
      marginBottom: '2rem',
      display: 'flex',
      gap: '0.5rem',
      overflowX: 'auto'
    }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            background: isActive(item.href, item.exact)
              ? 'linear-gradient(135deg, #E94D88 0%, #C2185B 100%)'
              : 'transparent',
            color: isActive(item.href, item.exact)
              ? 'white'
              : 'var(--text-secondary)',
            border: isActive(item.href, item.exact)
              ? 'none'
              : '1px solid transparent'
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

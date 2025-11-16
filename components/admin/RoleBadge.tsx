'use client'

import { AdminRole, getRoleName, getRoleBadgeColor } from '@/utils/admin/roles'

interface RoleBadgeProps {
  role: AdminRole
  size?: 'sm' | 'md'
}

export default function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  if (!role) return null

  const colors = getRoleBadgeColor(role)
  const name = getRoleName(role)

  const fontSize = size === 'sm' ? '0.6875rem' : '0.75rem'
  const padding = size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.75rem'

  return (
    <span
      style={{
        display: 'inline-block',
        padding,
        fontSize,
        fontWeight: 600,
        color: colors.text,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {name}
    </span>
  )
}

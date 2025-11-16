// Client-safe role utilities (no server imports)

export type AdminRole = 'owner' | 'admin' | 'analyst' | null

export function getRoleName(role: AdminRole): string {
  if (!role) return 'No Role'

  const names: Record<NonNullable<AdminRole>, string> = {
    owner: 'Owner',
    admin: 'Admin',
    analyst: 'Analyst',
  }

  return names[role]
}

export function getRoleBadgeColor(role: AdminRole): { bg: string; text: string; border: string } {
  if (!role) {
    return {
      bg: '#6B7280',
      text: '#FFFFFF',
      border: '#4B5563',
    }
  }

  const colors: Record<NonNullable<AdminRole>, { bg: string; text: string; border: string }> = {
    owner: {
      bg: '#7C3AED',
      text: '#FFFFFF',
      border: '#6D28D9',
    },
    admin: {
      bg: '#EC4899',
      text: '#FFFFFF',
      border: '#DB2777',
    },
    analyst: {
      bg: '#3B82F6',
      text: '#FFFFFF',
      border: '#2563EB',
    },
  }

  return colors[role]
}

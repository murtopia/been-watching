'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Search,
  Shield,
  Ticket,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const colors = useThemeColors()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      setUser(user)

      // Check if user has admin access (via admin_role)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Check if user has any admin role (owner, admin, or analyst)
      if (!profileData?.admin_role) {
        router.push('/feed')
        return
      }

      setProfile(profileData)
      setLoading(false)
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/feed')
    }
  }

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
      isActive: pathname === '/admin'
    },
    {
      icon: Users,
      label: 'Users',
      href: '/admin/users',
      isActive: pathname?.startsWith('/admin/users')
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      href: '/admin/analytics',
      isActive: pathname?.startsWith('/admin/analytics')
    },
    {
      icon: Search,
      label: 'Engagement',
      href: '/admin/content',
      isActive: pathname?.startsWith('/admin/content')
    },
    {
      icon: Shield,
      label: 'Moderation',
      href: '/admin/moderation',
      isActive: pathname?.startsWith('/admin/moderation')
    },
    {
      icon: Ticket,
      label: 'Invites',
      href: '/admin/invites',
      isActive: pathname?.startsWith('/admin/invites')
    },
    {
      icon: MessageSquare,
      label: 'Push Messaging',
      href: '/admin/messaging',
      isActive: pathname?.startsWith('/admin/messaging')
    },
    {
      icon: Palette,
      label: 'Design Assets',
      href: '/admin/design-assets',
      isActive: pathname?.startsWith('/admin/design-assets')
    },
    {
      icon: Settings,
      label: 'System',
      href: '/admin/system',
      isActive: pathname?.startsWith('/admin/system')
    }
  ]

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid',
          borderColor: `${colors.brandPink} transparent`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  const sidebarWidth = sidebarCollapsed ? '80px' : '240px'

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: colors.background
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        background: colors.cardBg,
        borderRight: colors.cardBorder,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1rem',
          borderBottom: colors.cardBorder,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!sidebarCollapsed && (
            <div>
              <h1 style={{
                background: colors.brandGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0
              }}>
                Admin
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: colors.textSecondary,
                margin: '0.25rem 0 0 0'
              }}>
                {profile?.display_name}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '1rem 0.5rem',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  margin: '0.25rem 0',
                  background: item.isActive
                    ? colors.isDark ? 'rgba(233, 77, 136, 0.2)' : 'rgba(233, 77, 136, 0.1)'
                    : 'transparent',
                  border: item.isActive ? `1px solid ${colors.brandPink}` : 'none',
                  borderRadius: '8px',
                  color: item.isActive ? colors.brandPink : colors.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: item.isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (!item.isActive) {
                    e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: colors.cardBorder,
          fontSize: '0.75rem',
          color: colors.textSecondary,
          textAlign: sidebarCollapsed ? 'center' : 'left'
        }}>
          {!sidebarCollapsed && (
            <>
              <div>Been Watching v0.1.5</div>
              <div style={{ marginTop: '0.25rem', opacity: 0.7 }}>Alpha</div>
            </>
          )}
          {sidebarCollapsed && <div>v0.1.5</div>}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {children}
      </main>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

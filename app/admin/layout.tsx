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
  Palette,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const colors = useThemeColors()
  const supabase = createClient()

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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

  // Get current section name for mobile header
  const currentSection = navItems.find(item => item.isActive)?.label || 'Admin'

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
          borderColor: `${colors.goldAccent} transparent`,
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
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 1001
        }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textPrimary,
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={24} />
          </button>
          <span style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary
          }}>
            {currentSection}
          </span>
          <div style={{ width: '40px' }} /> {/* Spacer for centering */}
        </header>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1002
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? '280px' : sidebarWidth,
        background: colors.cardBg,
        borderRight: `1px solid ${colors.borderColor}`,
        position: 'fixed',
        top: 0,
        left: isMobile ? (mobileMenuOpen ? '0' : '-280px') : 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: isMobile ? 'left 0.3s ease' : 'width 0.3s ease',
        zIndex: 1003
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1rem',
          borderBottom: `1px solid ${colors.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {(!sidebarCollapsed || isMobile) && (
            <div>
              <h1 style={{
                color: colors.textPrimary,
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
          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.textSecondary,
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px'
              }}
            >
              <X size={20} />
            </button>
          ) : (
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
          )}
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '1rem 0.5rem',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const showLabel = !sidebarCollapsed || isMobile
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  if (isMobile) setMobileMenuOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  margin: '0.25rem 0',
                  background: item.isActive
                    ? colors.goldGlassBg
                    : 'transparent',
                  border: item.isActive ? `1px solid ${colors.goldAccent}` : '1px solid transparent',
                  borderRadius: '8px',
                  color: item.isActive ? colors.goldAccent : colors.textPrimary,
                  fontSize: '0.875rem',
                  fontWeight: item.isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  justifyContent: showLabel ? 'flex-start' : 'center'
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
                {showLabel && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: `1px solid ${colors.borderColor}`,
          fontSize: '0.75rem',
          color: colors.textSecondary,
          textAlign: (sidebarCollapsed && !isMobile) ? 'center' : 'left'
        }}>
          {(!sidebarCollapsed || isMobile) ? (
            <>
              <div>Been Watching v0.1.5</div>
              <div style={{ marginTop: '0.25rem', opacity: 0.7 }}>Alpha</div>
            </>
          ) : (
            <div>v0.1.5</div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarWidth,
        marginTop: isMobile ? '56px' : 0,
        transition: 'margin-left 0.3s ease',
        minHeight: isMobile ? 'calc(100vh - 56px)' : '100vh'
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

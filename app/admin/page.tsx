'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface InviteStats {
  code: string
  type: string
  max_uses: number | null
  current_uses: number
  uses_status: string
  is_active: boolean
  created_at: string
  total_signups: number
}

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  position: number
  invited_at: string | null
  invite_code: string | null
  created_at: string
}

interface AdminUser {
  id: string
  username: string
  display_name: string
  is_admin: boolean
  is_super_admin: boolean
  admin_granted_at: string | null
  granted_by_username: string | null
  created_at: string
}

interface SocialMetrics {
  totalFollows: number
  avgFollowsPerUser: number
  mostFollowed: Array<{ username: string; display_name: string; followerCount: number }>
  mostActive: Array<{ username: string; display_name: string; activityCount: number }>
  orphanedUsers: Array<{ username: string; display_name: string }>
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [inviteStats, setInviteStats] = useState<InviteStats[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [newCodeType, setNewCodeType] = useState<'limited' | 'unlimited'>('limited')
  const [creatingCode, setCreatingCode] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [socialMetrics, setSocialMetrics] = useState<SocialMetrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Check system preference on mount
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    // Check if user is admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData?.is_admin) {
      alert('Access denied. You must be an admin to view this page.')
      router.push('/')
      return
    }

    setIsAdmin(profileData.is_admin)
    setIsSuperAdmin(profileData.is_super_admin || false)
    setProfile(profileData)
    setUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/auth')
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'AD'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'
  }

  const loadData = async () => {
    // Load master code stats
    const { data: invites } = await supabase
      .from('admin_master_code_stats')
      .select('*')
      .order('created_at', { ascending: false })

    if (invites) {
      setInviteStats(invites)
    }

    // Load waitlist
    const { data: waitlistData } = await supabase
      .from('waitlist')
      .select('*')
      .order('position', { ascending: true })
      .limit(50)

    if (waitlistData) {
      setWaitlist(waitlistData)
    }

    // Load users for admin management (super admins only)
    if (isSuperAdmin) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, display_name, is_admin, is_super_admin, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (users) {
        setAllUsers(users as any)
        setAdminUsers(users.filter(u => u.is_admin) as any)
      }
    }

    // Load social metrics
    loadSocialMetrics()
  }

  const loadSocialMetrics = async () => {
    setLoadingMetrics(true)
    try {
      // Total follows count
      const { count: totalFollows } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Calculate average follows per user
      const avgFollowsPerUser = totalUsers && totalFollows
        ? Math.round((totalFollows / totalUsers) * 10) / 10
        : 0

      // Most followed users
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('status', 'accepted')

      const followCounts: Record<string, number> = {}
      followsData?.forEach(f => {
        followCounts[f.following_id] = (followCounts[f.following_id] || 0) + 1
      })

      const topFollowedIds = Object.entries(followCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id)

      const { data: mostFollowedProfiles } = await supabase
        .from('profiles')
        .select('username, display_name, id')
        .in('id', topFollowedIds)

      const mostFollowed = mostFollowedProfiles?.map(p => ({
        username: p.username,
        display_name: p.display_name,
        followerCount: followCounts[p.id]
      }))
        .sort((a, b) => b.followerCount - a.followerCount) || []

      // Most active users (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: activitiesData } = await supabase
        .from('activities')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const activityCounts: Record<string, number> = {}
      activitiesData?.forEach(a => {
        activityCounts[a.user_id] = (activityCounts[a.user_id] || 0) + 1
      })

      const topActiveIds = Object.entries(activityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id)

      const { data: mostActiveProfiles } = await supabase
        .from('profiles')
        .select('username, display_name, id')
        .in('id', topActiveIds)

      const mostActive = mostActiveProfiles?.map(p => ({
        username: p.username,
        display_name: p.display_name,
        activityCount: activityCounts[p.id]
      }))
        .sort((a, b) => b.activityCount - a.activityCount) || []

      // Orphaned users (no follows, no followers)
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, username, display_name')

      const { data: allFollows } = await supabase
        .from('follows')
        .select('follower_id, following_id')

      const userWithFollows = new Set<string>()
      allFollows?.forEach(f => {
        userWithFollows.add(f.follower_id)
        userWithFollows.add(f.following_id)
      })

      const orphanedUsers = allProfiles?.filter(p => !userWithFollows.has(p.id))
        .map(p => ({
          username: p.username,
          display_name: p.display_name
        })) || []

      setSocialMetrics({
        totalFollows: totalFollows || 0,
        avgFollowsPerUser,
        mostFollowed,
        mostActive,
        orphanedUsers
      })
    } catch (error) {
      console.error('Error loading social metrics:', error)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const grantAdminAccess = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('grant_admin_access', { target_user_id: userId })
      if (error) throw error
      alert('Admin access granted successfully!')
      loadData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const revokeAdminAccess = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('revoke_admin_access', { target_user_id: userId })
      if (error) throw error
      alert('Admin access revoked successfully!')
      loadData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`Copied: ${text}`)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const deactivateCode = async (code: string) => {
    if (!confirm(`Are you sure you want to deactivate code: ${code}?\n\nExisting users who used this code will keep their access, but no new signups will be allowed.`)) {
      return
    }

    try {
      const { error } = await supabase.rpc('deactivate_master_code', { code_to_deactivate: code })

      if (error) throw error
      alert('Code deactivated successfully!')
      loadData()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const createNewCode = async () => {
    setCreatingCode(true)
    setNewCode('')

    try {
      if (newCodeType === 'unlimited') {
        // Create unlimited code (like BOOZEHOUND)
        const code = 'BW_' + Math.random().toString(36).substring(2, 10).toUpperCase()
        const { error } = await supabase
          .from('master_codes')
          .insert({
            code,
            type: 'master_unlimited',
            max_uses: null,
            is_active: true
          })

        if (error) throw error
        setNewCode(code)
      } else {
        // Create limited code using the function
        const { data, error } = await supabase.rpc('create_bwalpha_code')

        if (error) throw error
        if (data) setNewCode(data)
      }

      loadData()
    } catch (error: any) {
      console.error('Error creating code:', error)
      alert('Error creating code: ' + error.message)
    } finally {
      setCreatingCode(false)
    }
  }

  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
  const inputBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const inputBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '4px solid rgba(233, 77, 136, 0.3)',
            borderTopColor: '#e94d88',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgGradient,
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* User Profile & Controls */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: '0.5rem',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
            borderRadius: '8px',
            color: textPrimary,
            fontSize: '1.25rem',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        {/* User Info */}
        {profile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {getInitials(profile.display_name)}
              </div>
            )}

            {/* Username */}
            <span style={{ color: textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>
              {profile.username}
            </span>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: '0.375rem 0.75rem',
                background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: textSecondary, fontSize: '1rem' }}>
            Manage invite codes and waitlist
          </p>
        </div>

        {/* Create New Code Card */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: isDarkMode
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary, marginBottom: '1rem' }}>
            Create New Invite Code
          </h2>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setNewCodeType('limited')}
              style={{
                padding: '0.75rem 1.5rem',
                background: newCodeType === 'limited'
                  ? 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)'
                  : inputBg,
                border: `1px solid ${newCodeType === 'limited' ? 'transparent' : inputBorder}`,
                borderRadius: '8px',
                color: newCodeType === 'limited' ? '#fff' : textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Limited (5 uses)
            </button>

            <button
              onClick={() => setNewCodeType('unlimited')}
              style={{
                padding: '0.75rem 1.5rem',
                background: newCodeType === 'unlimited'
                  ? 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)'
                  : inputBg,
                border: `1px solid ${newCodeType === 'unlimited' ? 'transparent' : inputBorder}`,
                borderRadius: '8px',
                color: newCodeType === 'unlimited' ? '#fff' : textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Unlimited
            </button>

            <button
              onClick={createNewCode}
              disabled={creatingCode}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: creatingCode ? 'not-allowed' : 'pointer',
                opacity: creatingCode ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {creatingCode ? 'Creating...' : 'Generate Code'}
            </button>
          </div>

          {newCode && (
            <div
              style={{
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                marginTop: '1rem',
              }}
            >
              <p style={{ color: textSecondary, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                New code created:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <p
                  style={{
                    color: '#22c55e',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {newCode}
                </p>
                <button
                  onClick={() => copyToClipboard(newCode)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '8px',
                    color: '#22c55e',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invite Stats Card */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: isDarkMode
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary, marginBottom: '1.5rem' }}>
            Invite Codes ({inviteStats.length})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${inputBorder}` }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Code
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Type
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Uses
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Signups
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {inviteStats.map((stat) => (
                  <tr key={stat.code} style={{ borderBottom: `1px solid ${inputBorder}` }}>
                    <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                      {stat.code}
                    </td>
                    <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                      {stat.type}
                    </td>
                    <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem' }}>
                      {stat.current_uses} / {stat.max_uses || '∞'}
                    </td>
                    <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem' }}>
                      {stat.total_signups}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: stat.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: stat.is_active ? '#22c55e' : '#ef4444',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {stat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => copyToClipboard(stat.code)}
                          style={{
                            padding: '0.5rem',
                            background: inputBg,
                            border: `1px solid ${inputBorder}`,
                            borderRadius: '6px',
                            color: textPrimary,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Copy code"
                        >
                          📋
                        </button>
                        {stat.is_active && (
                          <button
                            onClick={() => deactivateCode(stat.code)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '6px',
                              color: '#ef4444',
                              fontSize: '1rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Deactivate code"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waitlist Card */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: isDarkMode
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary, marginBottom: '1.5rem' }}>
            Waitlist ({waitlist.length})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${inputBorder}` }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Position
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Email
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Name
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Joined
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: `1px solid ${inputBorder}` }}>
                    <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 700 }}>
                      #{entry.position}
                    </td>
                    <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem' }}>
                      {entry.email}
                    </td>
                    <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                      {entry.name || '-'}
                    </td>
                    <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: entry.invited_at ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                          color: entry.invited_at ? '#22c55e' : '#fbbf24',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {entry.invited_at ? 'Invited' : 'Waiting'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Metrics Card */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: isDarkMode
              ? '0 10px 30px rgba(0, 0, 0, 0.3)'
              : '0 10px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: textPrimary, margin: 0 }}>
              📊 Social Metrics
            </h2>
            <button
              onClick={loadSocialMetrics}
              disabled={loadingMetrics}
              style={{
                padding: '0.5rem 1rem',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loadingMetrics ? 'not-allowed' : 'pointer',
                opacity: loadingMetrics ? 0.6 : 1,
              }}
            >
              {loadingMetrics ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {socialMetrics && (
            <>
              {/* Overview Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                <div
                  style={{
                    padding: '1.5rem',
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Total Follows
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: textPrimary }}>
                    {socialMetrics.totalFollows}
                  </div>
                </div>
                <div
                  style={{
                    padding: '1.5rem',
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Avg per User
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: textPrimary }}>
                    {socialMetrics.avgFollowsPerUser}
                  </div>
                </div>
                <div
                  style={{
                    padding: '1.5rem',
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Orphaned Users
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: socialMetrics.orphanedUsers.length > 0 ? '#ef4444' : '#22c55e' }}>
                    {socialMetrics.orphanedUsers.length}
                  </div>
                </div>
              </div>

              {/* Most Followed Users */}
              {socialMetrics.mostFollowed.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
                    🏆 Most Followed Users
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${inputBorder}` }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Rank
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Username
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Display Name
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Followers
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {socialMetrics.mostFollowed.map((user, index) => (
                          <tr key={user.username} style={{ borderBottom: `1px solid ${inputBorder}` }}>
                            <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 700 }}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </td>
                            <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                              @{user.username}
                            </td>
                            <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                              {user.display_name}
                            </td>
                            <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>
                              {user.followerCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Most Active Users */}
              {socialMetrics.mostActive.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
                    🔥 Most Active (Last 30 Days)
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${inputBorder}` }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Rank
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Username
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Display Name
                          </th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            Activities
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {socialMetrics.mostActive.map((user, index) => (
                          <tr key={user.username} style={{ borderBottom: `1px solid ${inputBorder}` }}>
                            <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 700 }}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </td>
                            <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                              @{user.username}
                            </td>
                            <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                              {user.display_name}
                            </td>
                            <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>
                              {user.activityCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orphaned Users */}
              {socialMetrics.orphanedUsers.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
                    ⚠️ Orphaned Users ({socialMetrics.orphanedUsers.length})
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: textSecondary, marginBottom: '1rem' }}>
                    Users with no follows and no followers
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {socialMetrics.orphanedUsers.slice(0, 12).map((user) => (
                      <div
                        key={user.username}
                        style={{
                          padding: '0.75rem',
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: textPrimary, fontFamily: 'monospace' }}>
                          @{user.username}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: textSecondary }}>
                          {user.display_name}
                        </div>
                      </div>
                    ))}
                  </div>
                  {socialMetrics.orphanedUsers.length > 12 && (
                    <p style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.75rem', textAlign: 'center' }}>
                      ... and {socialMetrics.orphanedUsers.length - 12} more
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {!socialMetrics && !loadingMetrics && (
            <div style={{ textAlign: 'center', padding: '2rem', color: textSecondary }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontSize: '0.875rem' }}>Click refresh to load metrics</div>
            </div>
          )}
        </div>

        {/* Admin Management (Super Admins Only) */}
        {isSuperAdmin && (
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '2rem',
              marginTop: '2rem',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: textPrimary, margin: 0 }}>
                Admin Management
              </h2>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(168, 85, 247, 0.1)',
                  color: '#a855f7',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Super Admin Only
              </span>
            </div>

            {/* Current Admins */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
                Current Admins ({adminUsers.length})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${cardBorder}` }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Username
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Display Name
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Role
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((adminUser) => (
                      <tr key={adminUser.id} style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 500 }}>
                          {adminUser.username}
                        </td>
                        <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                          {adminUser.display_name}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: adminUser.is_super_admin ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              color: adminUser.is_super_admin ? '#a855f7' : '#3b82f6',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {adminUser.is_super_admin ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {!adminUser.is_super_admin && (
                            <button
                              onClick={() => revokeAdminAccess(adminUser.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Users - Can Grant Admin */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '1rem' }}>
                All Users ({allUsers.length})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${cardBorder}` }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Username
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Display Name
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Status
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.slice(0, 20).map((u) => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <td style={{ padding: '1rem', color: textPrimary, fontSize: '0.875rem', fontWeight: 500 }}>
                          {u.username}
                        </td>
                        <td style={{ padding: '1rem', color: textSecondary, fontSize: '0.875rem' }}>
                          {u.display_name}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {u.is_admin ? (
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(34, 197, 94, 0.1)',
                                color: '#22c55e',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              Admin
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(156, 163, 175, 0.1)',
                                color: '#9ca3af',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              User
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {!u.is_admin && (
                            <button
                              onClick={() => grantAdminAccess(u.id)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Grant Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Back to App Link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              color: 'rgba(233, 77, 136, 1)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            ← Back to App
          </a>
        </div>
      </div>

      {/* Keyframes for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

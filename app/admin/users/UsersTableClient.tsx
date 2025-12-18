'use client'

import { useState, useEffect } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AdminRole } from '@/utils/admin/roles'
import RoleBadge from '@/components/admin/RoleBadge'
import GrantRoleModal from './GrantRoleModal'

interface User {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  created_at: string
  last_active_at: string | null
  admin_role: AdminRole
  stats: {
    ratings: number
    activities: number
    following: number
    followers: number
  }
}

interface UsersTableClientProps {
  userRole: AdminRole
  canManageUsers: boolean
}

export default function UsersTableClient({ userRole, canManageUsers }: UsersTableClientProps) {
  const colors = useThemeColors()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Role management modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '1000', // Fetch all users for grouping
        search,
        role: 'all',
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      console.log('Fetching users with params:', params.toString())
      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()
      console.log('API response:', { ok: response.ok, status: response.status, data })

      if (response.ok) {
        setUsers(data.users)
      } else {
        console.error('API error:', data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search])

  const handleGrantRole = (user: User) => {
    setSelectedUser(user)
    setShowRoleModal(true)
  }

  const handleRoleUpdated = () => {
    setShowRoleModal(false)
    setSelectedUser(null)
    fetchUsers() // Refresh the list
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatRelativeTime = (date: string | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
  }

  // Group users by role
  const owners = users.filter(u => u.admin_role === 'owner')
  const admins = users.filter(u => u.admin_role === 'admin')
  const analysts = users.filter(u => u.admin_role === 'analyst')
  const regularUsers = users.filter(u => !u.admin_role)

  // Render a user table
  const renderUserTable = (tableUsers: User[], title: string, roleColor: string, showRoleBadge: boolean = false) => {
    if (tableUsers.length === 0) return null

    return (
      <div key={title} style={{ marginBottom: '3rem' }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: 0
          }}>
            {title}
          </h2>
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            background: `${roleColor}20`,
            border: `1px solid ${roleColor}40`,
            fontSize: '0.875rem',
            fontWeight: '600',
            color: roleColor
          }}>
            {tableUsers.length}
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                <th style={{ width: '35%', padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  User
                </th>
                <th style={{ width: '18%', padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Stats
                </th>
                <th style={{ width: '16%', padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Joined
                </th>
                <th style={{ width: '16%', padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Last Active
                </th>
                {canManageUsers && (
                  <th style={{ width: '15%', padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {tableUsers.map((user, idx) => (
                <tr key={user.id} style={{ borderTop: idx === 0 ? 'none' : colors.cardBorder }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.goldAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: '600', color: '#000', flexShrink: 0 }}>
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            @{user.username}
                          </span>
                          {showRoleBadge && user.admin_role && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '6px',
                              background: roleColor,
                              fontSize: '0.625rem',
                              fontWeight: '700',
                              color: 'white',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              flexShrink: 0
                            }}>
                              {user.admin_role}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.display_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: '1.5' }}>
                      <div>{user.stats.ratings} ratings</div>
                      <div>{user.stats.followers} followers</div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: colors.textSecondary }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8125rem', color: colors.textSecondary }}>
                    {formatRelativeTime(user.last_active_at)}
                  </td>
                  {canManageUsers && (
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleGrantRole(user)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: colors.goldAccent,
                          background: 'transparent',
                          border: `1px solid ${colors.goldAccent}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Manage Role
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: colors.textPrimary }}>
          Users Management
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
          Total: {users.length} users • {owners.length} owners, {admins.length} admins, {analysts.length} analysts, {regularUsers.length} regular users
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            border: colors.cardBorder,
            borderRadius: '8px',
            background: colors.cardBg,
            color: colors.textPrimary,
            outline: 'none',
          }}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: colors.textSecondary }}>
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: colors.textSecondary }}>
          No users found
        </div>
      ) : (
        <>
          {/* Owners */}
          {renderUserTable(owners, 'Owners', '#7C3AED', true)}

          {/* Admins */}
          {renderUserTable(admins, 'Admins', '#EC4899', true)}

          {/* Analysts */}
          {renderUserTable(analysts, 'Analysts', '#3B82F6', true)}

          {/* Regular Users */}
          {renderUserTable(regularUsers, 'Users', '#6B7280', false)}
        </>
      )}

      {/* Grant Role Modal */}
      {showRoleModal && selectedUser && (
        <GrantRoleModal
          user={selectedUser}
          currentUserRole={userRole}
          onClose={() => {
            setShowRoleModal(false)
            setSelectedUser(null)
          }}
          onSuccess={handleRoleUpdated}
        />
      )}
    </div>
  )
}

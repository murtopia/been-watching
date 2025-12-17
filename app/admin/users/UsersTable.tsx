'use client'

import { useState, useMemo } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  is_admin: boolean
  stats: {
    ratings: number
    activities: number
    likesReceived: number
  }
}

type SortField = 'username' | 'created_at' | 'ratings' | 'activities' | 'likesReceived'
type SortDirection = 'asc' | 'desc'

export default function UsersTable({ users }: { users: User[] }) {
  const colors = useThemeColors()
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users

    const query = searchQuery.toLowerCase()
    return users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  // Sort users
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      let aVal: any
      let bVal: any

      if (sortField === 'username') {
        aVal = a.username.toLowerCase()
        bVal = b.username.toLowerCase()
      } else if (sortField === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (sortField === 'ratings') {
        aVal = a.stats.ratings
        bVal = b.stats.ratings
      } else if (sortField === 'activities') {
        aVal = a.stats.activities
        bVal = b.stats.activities
      } else if (sortField === 'likesReceived') {
        aVal = a.stats.likesReceived
        bVal = b.stats.likesReceived
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredUsers, sortField, sortDirection])

  // Paginate users
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedUsers.slice(start, start + itemsPerPage)
  }, [sortedUsers, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div>
      {/* Search and Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.textSecondary
            }}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              background: colors.cardBg,
              border: colors.cardBorder,
              borderRadius: '8px',
              color: colors.textPrimary,
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
          Showing {paginatedUsers.length} of {filteredUsers.length} users
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{
                background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderBottom: colors.cardBorder
              }}>
                <th style={headerStyle}>
                  <button
                    onClick={() => handleSort('username')}
                    style={sortButtonStyle}
                  >
                    User
                    <SortIcon field="username" />
                  </button>
                </th>
                <th style={headerStyle}>
                  <button
                    onClick={() => handleSort('ratings')}
                    style={sortButtonStyle}
                  >
                    Ratings
                    <SortIcon field="ratings" />
                  </button>
                </th>
                <th style={headerStyle}>
                  <button
                    onClick={() => handleSort('activities')}
                    style={sortButtonStyle}
                  >
                    Activities
                    <SortIcon field="activities" />
                  </button>
                </th>
                <th style={headerStyle}>
                  <button
                    onClick={() => handleSort('likesReceived')}
                    style={sortButtonStyle}
                  >
                    Likes
                    <SortIcon field="likesReceived" />
                  </button>
                </th>
                <th style={headerStyle}>
                  <button
                    onClick={() => handleSort('created_at')}
                    style={sortButtonStyle}
                  >
                    Joined
                    <SortIcon field="created_at" />
                  </button>
                </th>
                <th style={headerStyle}>Role</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: colors.cardBorder,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: colors.goldAccent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#000'
                        }}>
                          {user.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: colors.textPrimary }}>
                          {user.username}
                        </div>
                        {user.display_name && (
                          <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                            {user.display_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                      {user.stats.ratings.toLocaleString()}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                      {user.stats.activities.toLocaleString()}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                      {user.stats.likesReceived.toLocaleString()}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <span style={{ color: colors.textSecondary }}>
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    {user.is_admin ? (
                      <span style={{
                        background: colors.goldAccent,
                        color: '#000',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        ADMIN
                      </span>
                    ) : (
                      <span style={{ color: colors.textSecondary }}>User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          gap: '1rem'
        }}>
          <div style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Page {currentPage} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                background: colors.cardBg,
                border: colors.cardBorder,
                borderRadius: '8px',
                color: currentPage === 1 ? colors.textSecondary : colors.textPrimary,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                background: colors.cardBg,
                border: colors.cardBorder,
                borderRadius: '8px',
                color: currentPage === totalPages ? colors.textSecondary : colors.textPrimary,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const sortButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: 0,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  textTransform: 'inherit',
  letterSpacing: 'inherit'
}

const cellStyle: React.CSSProperties = {
  padding: '1rem'
}

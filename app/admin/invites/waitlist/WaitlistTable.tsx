'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Mail, Trash2, Download, Check, Search, X } from 'lucide-react'

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  position: number
  invited_at: string | null
  invite_code: string | null
  converted_to_user_id: string | null
  created_at: string
}

export default function WaitlistTable({ initialData }: { initialData: WaitlistEntry[] }) {
  const colors = useThemeColors()
  const [data, setData] = useState(initialData)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Filter data based on search
  const filteredData = data.filter(entry =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredData.map(e => e.id)))
    }
  }

  const sendInvite = async (id: string) => {
    setLoading(id)
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', ids: [id] })
      })
      const result = await response.json()
      if (result.success) {
        // Update local state
        setData(prev => prev.map(entry =>
          entry.id === id
            ? { ...entry, invited_at: new Date().toISOString(), invite_code: result.codes?.[id] }
            : entry
        ))
      } else {
        alert(result.error || 'Failed to send invite')
      }
    } catch (err) {
      alert('Failed to send invite')
    } finally {
      setLoading(null)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    
    setLoading(id)
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: [id] })
      })
      const result = await response.json()
      if (result.success) {
        setData(prev => prev.filter(entry => entry.id !== id))
        selectedIds.delete(id)
        setSelectedIds(new Set(selectedIds))
      } else {
        alert(result.error || 'Failed to delete entry')
      }
    } catch (err) {
      alert('Failed to delete entry')
    } finally {
      setLoading(null)
    }
  }

  const bulkInvite = async () => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', ids: Array.from(selectedIds) })
      })
      const result = await response.json()
      if (result.success) {
        setData(prev => prev.map(entry =>
          selectedIds.has(entry.id)
            ? { ...entry, invited_at: new Date().toISOString(), invite_code: result.codes?.[entry.id] }
            : entry
        ))
        setSelectedIds(new Set())
      } else {
        alert(result.error || 'Failed to send invites')
      }
    } catch (err) {
      alert('Failed to send invites')
    } finally {
      setBulkLoading(false)
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} entries?`)) return
    
    setBulkLoading(true)
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: Array.from(selectedIds) })
      })
      const result = await response.json()
      if (result.success) {
        setData(prev => prev.filter(entry => !selectedIds.has(entry.id)))
        setSelectedIds(new Set())
      } else {
        alert(result.error || 'Failed to delete entries')
      }
    } catch (err) {
      alert('Failed to delete entries')
    } finally {
      setBulkLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Email', 'Name', 'Position', 'Date Joined', 'Status', 'Invite Code']
    const rows = data.map(entry => [
      entry.email,
      entry.name || '',
      entry.position,
      new Date(entry.created_at).toLocaleDateString(),
      entry.converted_to_user_id ? 'Converted' : entry.invited_at ? 'Invited' : 'Pending',
      entry.invite_code || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatus = (entry: WaitlistEntry) => {
    if (entry.converted_to_user_id) return { label: 'Converted', color: '#10b981' }
    if (entry.invited_at) return { label: 'Invited', color: '#8b5cf6' }
    return { label: 'Pending', color: '#f59e0b' }
  }

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header with search and actions */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
            Waitlist Signups
          </h2>
          
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888'
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                width: '200px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#888',
                  padding: '0.25rem'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Bulk actions when items selected */}
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={bulkInvite}
                disabled={bulkLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#8b5cf6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: bulkLoading ? 'not-allowed' : 'pointer',
                  opacity: bulkLoading ? 0.6 : 1
                }}
              >
                <Mail size={16} />
                Invite ({selectedIds.size})
              </button>
              <button
                onClick={bulkDelete}
                disabled={bulkLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: bulkLoading ? 'not-allowed' : 'pointer',
                  opacity: bulkLoading ? 0.6 : 1
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              background: 'var(--bg)',
              borderBottom: '1px solid var(--border)'
            }}>
              <th style={{ ...tableHeaderStyle, width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={tableHeaderStyle}>#</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Joined</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                  {searchQuery ? 'No results found' : 'No waitlist signups yet'}
                </td>
              </tr>
            ) : (
              filteredData.map((entry) => {
                const status = getStatus(entry)
                const isSelected = selectedIds.has(entry.id)
                const isLoading = loading === entry.id

                return (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                    }}
                  >
                    <td style={tableCellStyle}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(entry.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ ...tableCellStyle, color: '#888' }}>
                      {entry.position}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{ fontWeight: 500 }}>{entry.email}</span>
                    </td>
                    <td style={{ ...tableCellStyle, color: entry.name ? 'var(--text-primary)' : '#666' }}>
                      {entry.name || '—'}
                    </td>
                    <td style={{ ...tableCellStyle, color: '#888', fontSize: '0.8125rem' }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        background: `${status.color}20`,
                        color: status.color,
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {status.label === 'Converted' && <Check size={12} />}
                        {status.label}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!entry.invited_at && (
                          <button
                            onClick={() => sendInvite(entry.id)}
                            disabled={isLoading}
                            title="Send Invite"
                            style={{
                              padding: '0.375rem',
                              background: '#8b5cf620',
                              color: '#8b5cf6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              opacity: isLoading ? 0.5 : 1
                            }}
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={isLoading}
                          title="Delete"
                          style={{
                            padding: '0.375rem',
                            background: '#ef444420',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.5 : 1
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '0.875rem 1rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const tableCellStyle: React.CSSProperties = {
  padding: '0.875rem 1rem',
  fontSize: '0.875rem'
}


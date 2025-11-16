'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { AdminRole } from '@/utils/admin/roles'
import RoleBadge from '@/components/admin/RoleBadge'

interface User {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  admin_role: AdminRole
}

interface GrantRoleModalProps {
  user: User
  currentUserRole: AdminRole
  onClose: () => void
  onSuccess: () => void
}

export default function GrantRoleModal({ user, currentUserRole, onClose, onSuccess }: GrantRoleModalProps) {
  const colors = useThemeColors()
  const [selectedRole, setSelectedRole] = useState<string>(user.admin_role || 'none')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwner = currentUserRole === 'owner'

  const roleOptions = [
    {
      value: 'owner',
      label: 'Owner',
      description: 'Full system control. Can grant any role including Owner.',
      disabled: !isOwner, // Only owners can grant owner role
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage users, content, and send announcements. Cannot grant Owner role.',
      disabled: false,
    },
    {
      value: 'analyst',
      label: 'Analyst',
      description: 'Read-only access to all admin pages. Cannot perform any actions or export data.',
      disabled: false,
    },
    {
      value: 'none',
      label: 'No Role',
      description: 'Remove all admin privileges. User will have standard access only.',
      disabled: false,
    },
  ]

  const handleSubmit = async () => {
    if (selectedRole === (user.admin_role || 'none')) {
      setError('Please select a different role to make changes.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newRole: selectedRole === 'none' ? null : selectedRole,
          reason: reason.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            background: colors.isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${colors.isDark ? '#333' : '#e5e5e5'}`,
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: colors.isDark ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: colors.textSecondary,
              fontSize: '1.25rem',
              fontWeight: '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
              e.currentTarget.style.color = colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              e.currentTarget.style.color = colors.textSecondary
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{
            padding: '2rem',
            paddingRight: '4rem',
            borderBottom: `1px solid ${colors.isDark ? '#333' : '#e5e5e5'}`,
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '1rem',
            }}>
              Manage Admin Role
            </h2>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: colors.brandPink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'white',
                }}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}>
                  @{user.username}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.25rem',
                }}>
                  Current role: {user.admin_role ? <RoleBadge role={user.admin_role} size="sm" /> : <span style={{ color: colors.textSecondary }}>None</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '1rem',
            }}>
              Select New Role
            </label>

            {/* Role Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {roleOptions.map((option) => {
                const isSelected = selectedRole === option.value

                return (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      border: isSelected ? `2px solid ${colors.brandPink}` : `1px solid ${colors.isDark ? '#333' : '#e5e5e5'}`,
                      borderRadius: '8px',
                      cursor: option.disabled ? 'not-allowed' : 'pointer',
                      opacity: option.disabled ? 0.5 : 1,
                      background: isSelected ? (colors.isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.08)') : (colors.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      disabled={option.disabled}
                      style={{
                        marginTop: '0.25rem',
                        accentColor: colors.brandPink,
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                      }}>
                        <span style={{
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: colors.textPrimary,
                        }}>
                          {option.label}
                        </span>
                        {option.disabled && isOwner === false && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: colors.textSecondary,
                            fontStyle: 'italic',
                          }}>
                            (Owner only)
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: colors.textSecondary,
                        margin: 0,
                        lineHeight: '1.4',
                      }}>
                        {option.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Reason Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.5rem',
              }}>
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you making this change?"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  border: `1px solid ${colors.isDark ? '#333' : '#e5e5e5'}`,
                  borderRadius: '8px',
                  background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  color: colors.textPrimary,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: colors.textSecondary,
                marginTop: '0.5rem',
                marginBottom: 0,
              }}>
                This will be recorded in the audit log for transparency.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '1.5rem 2rem',
            borderTop: `1px solid ${colors.isDark ? '#333' : '#e5e5e5'}`,
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            background: colors.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.01)',
          }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textPrimary,
                background: 'transparent',
                border: `1px solid ${colors.isDark ? '#444' : '#d1d5db'}`,
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedRole === (user.admin_role || 'none')}
              style={{
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: colors.brandPink,
                border: 'none',
                borderRadius: '8px',
                cursor: (loading || selectedRole === (user.admin_role || 'none')) ? 'not-allowed' : 'pointer',
                opacity: (loading || selectedRole === (user.admin_role || 'none')) ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedRole !== (user.admin_role || 'none')) {
                  e.currentTarget.style.background = '#d91b7a'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.brandPink
              }}
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

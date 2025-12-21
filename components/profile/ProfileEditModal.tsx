'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Icon } from '@/components/ui/Icon'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: {
    id: string
    username: string
    display_name: string
    bio: string
  }
  onSave: (updatedProfile: { username: string; display_name: string; bio: string }) => void
}

export default function ProfileEditModal({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) {
  const colors = useThemeColors()
  const [username, setUsername] = useState(profile.username || '')
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  // Reset form when modal opens with new profile data
  useEffect(() => {
    if (isOpen) {
      setUsername(profile.username || '')
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setMessage(null)
    }
  }, [isOpen, profile])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Check if username is taken (by someone else)
      if (username !== profile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .single()

        if (existingUser && existingUser.id !== profile.id) {
          setMessage({ type: 'error', text: 'Username is already taken' })
          setSaving(false)
          return
        }
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase(),
          display_name: displayName,
          bio
        })
        .eq('id', profile.id)

      if (profileError) throw profileError

      setMessage({ type: 'success', text: 'Profile updated!' })
      
      // Call onSave callback with updated data
      onSave({
        username: username.toLowerCase(),
        display_name: displayName,
        bio
      })

      // Close modal after a brief delay to show success
      setTimeout(() => {
        onClose()
      }, 800)

    } catch (error: any) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '398px',
          background: colors.cardBg,
          border: `1px solid ${colors.goldAccent}`,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: `1px solid ${colors.dividerColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: 700,
            color: colors.textPrimary
          }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="close-c-default" size={36} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '1.25rem' }}>
          {/* Success/Error Message */}
          {message && (
            <div style={{
              padding: '0.75rem 1rem',
              background: message.type === 'success' ? '#10b98120' : '#ef444420',
              border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
              borderRadius: '10px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: message.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{message.text}</span>
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '1rem',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.goldAccent}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
            <p style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              margin: '0.5rem 0 0 0'
            }}>
              beenwatching.com/{username}
            </p>
          </div>

          {/* Display Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '1rem',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.goldAccent}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={150}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px',
                fontSize: '1rem',
                color: colors.textPrimary,
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.goldAccent}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
            <p style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              margin: '0.5rem 0 0 0',
              textAlign: 'right'
            }}>
              {bio.length}/150
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !username || !displayName}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: saving ? colors.inputBg : colors.goldAccent,
              border: 'none',
              borderRadius: '10px',
              color: saving ? colors.textSecondary : '#000',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: saving || !username || !displayName ? 'not-allowed' : 'pointer',
              opacity: saving || !username || !displayName ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}


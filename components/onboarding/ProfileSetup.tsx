'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { suggestUsername, cleanUsername } from '@/utils/usernameValidation'
import { useThemeColors } from '@/hooks/useThemeColors'

interface ProfileSetupProps {
  userId: string
  initialUsername?: string
  initialDisplayName?: string
  userEmail?: string
  onComplete: (updatedProfile: { username: string; display_name: string }) => void
}

export default function ProfileSetup({ 
  userId, 
  initialUsername = '',
  initialDisplayName = '',
  userEmail = '',
  onComplete 
}: ProfileSetupProps) {
  const colors = useThemeColors()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('What have you been watching?')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Pre-fill display name and suggest a clean username
    if (initialDisplayName) {
      setDisplayName(initialDisplayName)
    }
    
    // Suggest a clean username based on display name or email
    const suggested = suggestUsername(initialDisplayName, userEmail)
    setUsername(suggested)
    
    // Load bio from profile if it exists and is not default
    const loadBio = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('bio')
        .eq('id', userId)
        .single()

      if (profile?.bio && profile.bio !== 'What have you been watching?') {
        setBio(profile.bio)
      }
    }
    
    loadBio()
  }, [userId, initialUsername, initialDisplayName, userEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if username is taken (by someone else)
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUser && existingUser.id !== userId) {
        setError('Username is already taken')
        setLoading(false)
        return
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase(),
          display_name: displayName,
          bio: bio
        })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      onComplete({
        username: username.toLowerCase(),
        display_name: displayName
      })
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Gold color constant
  const goldAccent = '#FFC125'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: goldAccent,
              marginBottom: '0.5rem',
            }}
          >
            Welcome to Been Watching!
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Set up your profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(cleanUsername(e.target.value))}
              placeholder="username"
              required
              minLength={3}
              maxLength={20}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${goldAccent}80`
                e.target.style.boxShadow = `0 0 0 3px ${goldAccent}20`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder
                e.target.style.boxShadow = 'none'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.5rem' }}>
              Lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
              maxLength={50}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${goldAccent}80`
                e.target.style.boxShadow = `0 0 0 3px ${goldAccent}20`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What have you been watching?"
              rows={3}
              maxLength={150}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                color: colors.textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = `${goldAccent}80`
                e.target.style.boxShadow = `0 0 0 3px ${goldAccent}20`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder
                e.target.style.boxShadow = 'none'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, marginTop: '0.5rem' }}>
              {bio.length}/150
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !displayName}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading
                ? colors.inputBg
                : goldAccent,
              border: 'none',
              borderRadius: '12px',
              color: loading ? colors.textSecondary : '#000',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading || !username || !displayName ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading || !username || !displayName ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && username && displayName) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 10px 25px ${goldAccent}40`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? 'Creating Profile...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}

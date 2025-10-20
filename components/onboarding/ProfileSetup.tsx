'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { suggestUsername, cleanUsername } from '@/utils/usernameValidation'

interface ProfileSetupProps {
  userId: string
  onComplete: () => void
}

export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('What have you been watching?')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    // Load current profile to pre-fill fields and suggest username
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        // Pre-fill display name if exists
        if (profile.display_name) {
          setDisplayName(profile.display_name)
        }

        // Suggest a clean username based on display name or email
        const suggested = suggestUsername(profile.display_name, user?.email)
        setUsername(suggested)

        // Pre-fill bio if it's not default
        if (profile.bio && profile.bio !== 'What have you been watching?') {
          setBio(profile.bio)
        }
      }
    }

    loadProfile()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if username is taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUser) {
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

      onComplete()
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
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
  const inputFocusBg = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'

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
          background: cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${cardBorder}`,
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: isDarkMode
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            Welcome to Been Watching!
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Set up your profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: textPrimary,
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
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '12px',
                color: textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(233, 77, 136, 0.5)'
                e.target.style.background = inputFocusBg
              }}
              onBlur={(e) => {
                e.target.style.borderColor = inputBorder
                e.target.style.background = inputBg
              }}
            />
            <p style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.5rem' }}>
              Lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: textPrimary,
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
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '12px',
                color: textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(233, 77, 136, 0.5)'
                e.target.style.background = inputFocusBg
              }}
              onBlur={(e) => {
                e.target.style.borderColor = inputBorder
                e.target.style.background = inputBg
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: textPrimary,
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
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '12px',
                color: textPrimary,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                resize: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(233, 77, 136, 0.5)'
                e.target.style.background = inputFocusBg
              }}
              onBlur={(e) => {
                e.target.style.borderColor = inputBorder
                e.target.style.background = inputBg
              }}
            />
            <p style={{ fontSize: '0.75rem', color: textSecondary, marginTop: '0.5rem' }}>
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
                ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading || !username || !displayName ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading || !username || !displayName ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && username && displayName) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(233, 77, 136, 0.3)'
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

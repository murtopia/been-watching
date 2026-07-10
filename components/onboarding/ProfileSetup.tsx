'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { suggestUsername, cleanUsername } from '@/utils/usernameValidation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { followUser } from '@/utils/follow'
import { trackUserFollowed, trackEvent } from '@/utils/analytics'

interface ProfileSetupProps {
  userId: string
  initialUsername?: string
  initialDisplayName?: string
  userEmail?: string
  onComplete: (updatedProfile: { username: string; display_name: string }) => void
}

interface FollowSuggestion {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  showCount: number
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
  const [step, setStep] = useState<'profile' | 'follow'>('profile')
  const [savedProfile, setSavedProfile] = useState<{ username: string; display_name: string } | null>(null)
  const [followerUserId, setFollowerUserId] = useState('')
  const [suggestions, setSuggestions] = useState<FollowSuggestion[]>([])
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [followingInFlight, setFollowingInFlight] = useState<Set<string>>(new Set())
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

    // Get current user ID directly from Supabase auth as fallback
    let effectiveUserId = userId
    
    // Debug logging
    console.log('ProfileSetup handleSubmit - prop userId:', userId, 'type:', typeof userId)

    // If prop userId is invalid, try to get it from auth
    if (!effectiveUserId || effectiveUserId.trim() === '' || effectiveUserId.length < 10) {
      console.warn('ProfileSetup: Prop userId invalid, fetching from auth...')
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        effectiveUserId = user.id
        console.log('ProfileSetup: Got userId from auth:', effectiveUserId)
      }
    }

    // Final validation
    if (!effectiveUserId || effectiveUserId.trim() === '' || effectiveUserId.length < 10) {
      console.error('ProfileSetup: No valid userId available')
      setError('Session error. Please refresh the page and try again.')
      setLoading(false)
      return
    }

    try {
      // Check if username is taken (by someone else)
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username.toLowerCase())
        .single()

      if (existingUser && existingUser.id !== effectiveUserId) {
        setError('Username is already taken')
        setLoading(false)
        return
      }

      // Use upsert to handle case where profile row doesn't exist yet
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: effectiveUserId,
          username: username.toLowerCase(),
          display_name: displayName,
          bio: bio
        }, { onConflict: 'id' })

      if (updateError) {
        console.error('Failed to save profile:', updateError)
        setError(updateError.message)
        setLoading(false)
        return
      }

      const profile = {
        username: username.toLowerCase(),
        display_name: displayName
      }

      // Move to the follow-suggestions step; skip straight to the feed
      // if there's nobody to suggest yet.
      const found = await loadSuggestions(effectiveUserId)
      if (found.length === 0) {
        onComplete(profile)
        return
      }

      setSavedProfile(profile)
      setFollowerUserId(effectiveUserId)
      setSuggestions(found)
      setStep('follow')
      setLoading(false)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const loadSuggestions = async (selfId: string): Promise<FollowSuggestion[]> => {
    try {
      const { data: candidates } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .neq('id', selfId)
        .eq('is_private', false)
        .limit(20)

      if (!candidates || candidates.length === 0) return []

      const { data: statusRows } = await supabase
        .from('watch_status')
        .select('user_id')
        .in('user_id', candidates.map(c => c.id))

      const countByUser = new Map<string, number>()
      for (const row of statusRows || []) {
        countByUser.set(row.user_id, (countByUser.get(row.user_id) || 0) + 1)
      }

      return candidates
        .filter(c => (countByUser.get(c.id) || 0) > 0) // only active users
        .sort((a, b) => (countByUser.get(b.id) || 0) - (countByUser.get(a.id) || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          username: c.username,
          display_name: c.display_name || c.username,
          avatar_url: c.avatar_url,
          bio: c.bio,
          showCount: countByUser.get(c.id) || 0
        }))
    } catch (err) {
      console.error('Error loading follow suggestions:', err)
      return []
    }
  }

  const handleSuggestionFollow = async (suggestion: FollowSuggestion) => {
    if (followedIds.has(suggestion.id) || followingInFlight.has(suggestion.id)) return
    setFollowingInFlight(prev => new Set([...prev, suggestion.id]))
    try {
      await followUser(supabase, followerUserId, suggestion.id)
      setFollowedIds(prev => new Set([...prev, suggestion.id]))
      trackUserFollowed({
        followed_user_id: suggestion.id,
        followed_username: suggestion.username,
        followed_display_name: suggestion.display_name,
        follow_type: 'public',
        source: 'onboarding'
      })
    } catch (err) {
      console.error('Error following user:', err)
    } finally {
      setFollowingInFlight(prev => {
        const next = new Set(prev)
        next.delete(suggestion.id)
        return next
      })
    }
  }

  const handleFinish = () => {
    trackEvent('onboarding_follow_step_completed', {
      suggestions_shown: suggestions.length,
      users_followed: followedIds.size
    })
    if (savedProfile) onComplete(savedProfile)
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
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          margin: 'auto',
        }}
      >
        {step === 'follow' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: goldAccent,
                  marginBottom: '0.5rem',
                }}
              >
                Find people to follow
              </h1>
              <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                Your feed is built from people you follow. Here are a few active
                members to get you started.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {suggestions.map((s) => {
                const followed = followedIds.has(s.id)
                const inFlight = followingInFlight.has(s.id)
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      borderRadius: '12px',
                    }}
                  >
                    {s.avatar_url ? (
                      <img
                        src={s.avatar_url}
                        alt=""
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `${goldAccent}30`,
                          color: goldAccent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          flexShrink: 0,
                        }}
                      >
                        {s.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: colors.textPrimary,
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {s.display_name}
                      </div>
                      <div style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                        @{s.username} · {s.showCount} show{s.showCount === 1 ? '' : 's'} tracked
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSuggestionFollow(s)}
                      disabled={followed || inFlight}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        border: followed ? `1px solid ${colors.inputBorder}` : 'none',
                        background: followed ? 'transparent' : goldAccent,
                        color: followed ? colors.textSecondary : '#000',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: followed || inFlight ? 'default' : 'pointer',
                        opacity: inFlight ? 0.6 : 1,
                        flexShrink: 0,
                        transition: 'all 0.2s',
                      }}
                    >
                      {followed ? 'Following' : inFlight ? '...' : 'Follow'}
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              style={{
                width: '100%',
                padding: '1rem',
                background: goldAccent,
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {followedIds.size > 0 ? 'Continue to your feed' : 'Skip for now'}
            </button>
          </div>
        ) : (
        <>
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
        </>
        )}
      </div>
    </div>
  )
}

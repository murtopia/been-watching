'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { checkProfileCompletion, awardProfileCompletionInvite, getCompletionStepLabel, ProfileCompletionStatus } from '@/utils/profileCompletion'
import { Share2, Copy, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface InviteSectionProps {
  userId: string
  username: string
  invitesRemaining: number
  onInviteEarned?: () => void
  onOpenAvatarUpload?: () => void
  onOpenSearch?: () => void
  onNavigateToMyShows?: () => void
}

export default function InviteSection({ userId, username, invitesRemaining, onInviteEarned, onOpenAvatarUpload, onOpenSearch, onNavigateToMyShows }: InviteSectionProps) {
  const router = useRouter()
  const colors = useThemeColors()
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [generatingToken, setGeneratingToken] = useState(false)

  useEffect(() => {
    if (userId) {
      loadCompletionStatus()
      loadInviteToken()
    }
  }, [userId])

  const loadCompletionStatus = async () => {
    setLoading(true)
    const status = await checkProfileCompletion(userId)
    setCompletionStatus(status)
    setLoading(false)

    // If complete and not already earned, try to award invite
    if (status.isComplete && !status.alreadyEarned) {
      await tryAwardInvite()
    }
  }

  const tryAwardInvite = async () => {
    setChecking(true)
    const awarded = await awardProfileCompletionInvite(userId)
    setChecking(false)

    if (awarded) {
      // Create notification for earning invite
      await createInviteEarnedNotification(userId, username)

      // Reload profile data first to update invites_remaining
      if (onInviteEarned) {
        await onInviteEarned()
      }

      // Reload completion status to update alreadyEarned flag
      const updatedStatus = await checkProfileCompletion(userId)
      setCompletionStatus(updatedStatus)

      // Show celebration after profile is reloaded
      setShowCelebration(true)
      setTimeout(() => {
        setShowCelebration(false)
      }, 10000) // Show celebration for 10 seconds
    }
  }

  const handleCloseCelebration = () => {
    setShowCelebration(false)
  }

  const createInviteEarnedNotification = async (userId: string, username: string) => {
    try {
      const supabase = createClient()

      // For now, we'll use the 'mentioned' type since 'invite_earned' might not be in the constraint yet
      // We can distinguish it by target_type being null and having specific content
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: null, // System notification
          type: 'mentioned', // Using existing type temporarily
          target_type: null,
          target_id: null,
          activity_id: null,
          read: false
        })

      if (error) {
        console.error('Error creating invite notification:', error)
      } else {
        console.log('✅ Created invite earned notification!')
      }
    } catch (err) {
      console.error('Error in createInviteEarnedNotification:', err)
    }
  }

  const loadInviteToken = async () => {
    try {
      const supabase = createClient()

      // Get the user's active invite token
      const { data, error } = await supabase
        .from('invite_tokens')
        .select('token')
        .eq('inviter_id', userId)
        .eq('status', 'active')
        .eq('invite_type', 'username')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading invite token:', error)
        return
      }

      if (data) {
        setInviteToken(data.token)
      }
    } catch (err) {
      console.error('Error loading invite token:', err)
    }
  }

  const generateInviteToken = async () => {
    setGeneratingToken(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('create_user_invite_token', { user_id: userId })

      if (error) {
        console.error('Error generating invite token:', error)
        alert('Failed to generate invite link. Please try again.')
        setGeneratingToken(false)
        return
      }

      if (data.success) {
        setInviteToken(data.token)
      } else {
        alert(data.error === 'no_invites_remaining'
          ? 'You have no invites remaining. Complete more tasks to earn invites!'
          : 'Failed to generate invite link.')
      }
    } catch (err) {
      console.error('Error generating invite token:', err)
      alert('Failed to generate invite link. Please try again.')
    } finally {
      setGeneratingToken(false)
    }
  }

  const handleShare = async () => {
    // If no token exists, generate it first
    if (!inviteToken) {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .rpc('create_user_invite_token', { user_id: userId })

        if (error || !data?.success) {
          alert('Failed to generate invite link. Please try again.')
          return
        }

        // Use the newly generated token immediately
        const newToken = data.token
        setInviteToken(newToken)

        const shareUrl = `https://beenwatching.com/join?code=${newToken}`
        const shareText = `I just got an invite code to Been Watching, a new social show and movie discovery platform that I think you'd like! Come join me see what I've been watching here:`

        try {
          // Try native share first
          if (navigator.share) {
            await navigator.share({
              title: 'Join me on Been Watching',
              text: shareText,
              url: shareUrl
            })
          } else {
            // Fallback to copy with full message
            const fullMessage = `${shareText} ${shareUrl}`
            await navigator.clipboard.writeText(fullMessage)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
        } catch (err) {
          // User cancelled or error occurred
          console.log('Share cancelled or failed:', err)
        }
      } catch (err) {
        console.error('Error:', err)
        alert('Failed to generate invite link.')
      }
      return
    }

    // Token already exists, share it
    const shareUrl = `https://beenwatching.com/join?code=${inviteToken}`
    const shareText = `I just got an invite code to Been Watching, a new social show and movie discovery platform that I think you'd like! Come join me see what I've been watching here:`

    try {
      // Try native share first
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on Been Watching',
          text: shareText,
          url: shareUrl
        })
      } else {
        // Fallback to copy with full message
        const fullMessage = `${shareText} ${shareUrl}`
        await navigator.clipboard.writeText(fullMessage)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err)
    }
  }

  const handleCopy = async () => {
    // If no token exists, generate it first
    if (!inviteToken) {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .rpc('create_user_invite_token', { user_id: userId })

        if (error || !data?.success) {
          alert('Failed to generate invite link. Please try again.')
          return
        }

        // Use the newly generated token immediately
        const newToken = data.token
        setInviteToken(newToken)

        const shareUrl = `https://beenwatching.com/join?code=${newToken}`
        const shareMessage = `I just got an invite code to Been Watching, a new social show and movie discovery platform that I think you'd like! Come join me see what I've been watching here: ${shareUrl}`

        await navigator.clipboard.writeText(shareMessage)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Error:', err)
        alert('Failed to generate and copy invite link.')
      }
      return
    }

    // Token already exists, just copy it
    const shareUrl = `https://beenwatching.com/join?code=${inviteToken}`
    const shareMessage = `I just got an invite code to Been Watching, a new social show and movie discovery platform that I think you'd like! Come join me see what I've been watching here: ${shareUrl}`

    try {
      await navigator.clipboard.writeText(shareMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleStepClick = (step: string) => {
    // Don't do anything if already complete
    if (completionStatus && completionStatus[step as keyof ProfileCompletionStatus]) {
      return
    }

    switch (step) {
      case 'hasAvatar':
        onOpenAvatarUpload?.()
        break
      case 'hasBio':
        router.push('/profile/settings/account')
        break
      case 'hasTopShows':
        onNavigateToMyShows?.()
        break
      case 'hasWant':
      case 'hasWatching':
      case 'hasWatched':
        onOpenSearch?.()
        break
    }
  }

  if (loading) {
    return (
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px'
      }}>
        <div style={{ color: colors.textSecondary }}>Loading...</div>
      </div>
    )
  }

  // Show celebration when invite is earned
  if (showCelebration) {
    return (
      <div style={{
        position: 'relative',
        padding: '3rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(233, 77, 136, 0.2) 0%, rgba(242, 113, 33, 0.2) 100%)',
        border: `2px solid ${colors.brandPink}`,
        borderRadius: '12px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in'
      }}>
        {/* Close button */}
        <button
          onClick={handleCloseCelebration}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.textPrimary,
            fontSize: '1.25rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ✕
        </button>

        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'bounce 0.6s ease-in-out infinite'
        }}>
          🎉
        </div>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '0.75rem',
          color: colors.textPrimary,
          background: colors.brandGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Congratulations!
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: colors.textSecondary,
          lineHeight: '1.6'
        }}>
          You've completed your profile and earned an invite!
        </p>
      </div>
    )
  }

  // State 1: Profile Incomplete (haven't earned profile completion invite yet)
  // Show checklist if they haven't earned their invite through profile completion
  if (completionStatus && !completionStatus.alreadyEarned) {
    const progress = (completionStatus.completedCount / completionStatus.totalCount) * 100

    return (
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: colors.textPrimary
        }}>
          🎯 Earn an Invite for a friend
        </h3>
        <p style={{
          color: colors.textSecondary,
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          Complete your profile to unlock the ability to invite a friend:
        </p>

        {/* Completion Checklist */}
        <div style={{ marginBottom: '1.5rem' }}>
          {['hasAvatar', 'hasBio', 'hasTopShows', 'hasWant', 'hasWatching', 'hasWatched'].map((step) => {
            const isComplete = completionStatus[step as keyof ProfileCompletionStatus]
            return (
              <div
                key={step}
                onClick={() => handleStepClick(step)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  cursor: isComplete ? 'default' : 'pointer',
                  borderRadius: '8px',
                  background: isComplete ? 'transparent' : colors.cardBg,
                  border: isComplete ? 'none' : `1px solid ${colors.borderColor}`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isComplete) {
                    e.currentTarget.style.background = colors.cardBgHover
                    e.currentTarget.style.borderColor = colors.brandPink
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isComplete) {
                    e.currentTarget.style.background = colors.cardBg
                    e.currentTarget.style.borderColor = colors.borderColor
                  }
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: isComplete ? '2px solid #10b981' : `2px solid ${colors.borderColor}`,
                  background: isComplete ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  color: 'white',
                  fontWeight: '700'
                }}>
                  {isComplete ? '✓' : ''}
                </div>
                <span style={{
                  color: isComplete ? colors.textPrimary : colors.textSecondary,
                  fontWeight: isComplete ? '500' : '400',
                  textDecoration: isComplete ? 'line-through' : 'none',
                  opacity: isComplete ? 0.7 : 1,
                  flex: 1
                }}>
                  {getCompletionStepLabel(step as keyof ProfileCompletionStatus)}
                </span>
                {!isComplete && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: colors.textTertiary
                  }}>
                    →
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            color: colors.textSecondary
          }}>
            <span>{completionStatus.completedCount} of {completionStatus.totalCount} complete</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{
            height: '8px',
            background: colors.cardBorder,
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: colors.brandGradient,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {checking && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            color: colors.textPrimary,
            textAlign: 'center'
          }}>
            Checking completion...
          </div>
        )}
      </div>
    )
  }

  // State 2: Invite Earned and Available (invites > 0)
  if (invitesRemaining > 0) {
    const shareUrl = inviteToken ? `beenwatching.com/join?code=${inviteToken}` : null

    return (
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: colors.textPrimary
        }}>
          🎉 Share Been Watching
        </h3>
        <p style={{
          color: colors.textSecondary,
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          Invite a friend to join Been Watching!
        </p>

        {/* Invite Link Display */}
        {inviteToken ? (
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(233, 77, 136, 0.1) 0%, rgba(242, 113, 33, 0.1) 100%)',
            border: '1px solid rgba(233, 77, 136, 0.2)',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              Your Secure Invite Link
            </div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              fontFamily: 'monospace',
              color: colors.textPrimary,
              wordBreak: 'break-all'
            }}>
              {shareUrl}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textTertiary,
              marginTop: '0.5rem'
            }}>
              Expires in 7 days • One-time use
            </div>
          </div>
        ) : (
          <div style={{
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            marginBottom: '1rem',
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: '0.875rem'
          }}>
            Click "Share" or "Copy Link" to generate your secure invite link
          </div>
        )}

        {/* Share Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={handleShare}
            disabled={generatingToken}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: generatingToken ? colors.textSecondary : colors.brandGradient,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: generatingToken ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: generatingToken ? 0.6 : 1
            }}
          >
            <Share2 size={18} />
            {generatingToken ? 'Generating...' : 'Share'}
          </button>
          <button
            onClick={handleCopy}
            disabled={generatingToken}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: colors.cardBg,
              color: colors.textPrimary,
              border: colors.cardBorder,
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: generatingToken ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: generatingToken ? 0.6 : 1
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : generatingToken ? 'Generating...' : 'Copy Link'}
          </button>
        </div>

        {/* Invites Remaining */}
        <div style={{
          padding: '0.75rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: colors.textPrimary
        }}>
          <span style={{ fontWeight: '700' }}>{invitesRemaining}</span> invite{invitesRemaining !== 1 ? 's' : ''} remaining
        </div>
      </div>
    )
  }

  // State 3: Invite Used (invites = 0, already earned)
  return (
    <div style={{
      padding: '1.5rem',
      background: colors.cardBg,
      border: colors.cardBorder,
      borderRadius: '12px'
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        color: colors.textPrimary
      }}>
        ⏳ Invite Used
      </h3>
      <p style={{
        color: colors.textSecondary,
        marginBottom: '1rem',
        fontSize: '0.9rem',
        lineHeight: '1.6'
      }}>
        You've shared your invite! Waiting for your friend to join.
      </p>
      <p style={{
        color: colors.textSecondary,
        fontSize: '0.9rem',
        lineHeight: '1.6'
      }}>
        Want more invites? Stay tuned for special invite drops! 🎁
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { checkProfileCompletion, awardProfileCompletionInvite, getCompletionStepLabel, ProfileCompletionStatus } from '@/utils/profileCompletion'
import { Share2, Copy, Check } from 'lucide-react'

interface InviteSectionProps {
  userId: string
  username: string
  invitesRemaining: number
  onInviteEarned?: () => void
}

export default function InviteSection({ userId, username, invitesRemaining, onInviteEarned }: InviteSectionProps) {
  const colors = useThemeColors()
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    loadCompletionStatus()
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

    if (awarded && onInviteEarned) {
      onInviteEarned()
    }
  }

  const handleShare = async () => {
    const shareUrl = `https://beenwatching.app/join/${username}`
    const shareData = {
      title: 'Join Been Watching',
      text: `Track your favorite TV shows with me on Been Watching!`,
      url: shareUrl
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback to copy
        await handleCopy()
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err)
    }
  }

  const handleCopy = async () => {
    const shareUrl = `https://beenwatching.app/join/${username}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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

  // State 1: Profile Incomplete (invites = 0, not earned)
  if (invitesRemaining === 0 && completionStatus && !completionStatus.alreadyEarned) {
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
          🎯 Earn Your Invite
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 0',
                  marginBottom: '0.25rem'
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: isComplete ? '2px solid #10b981' : `2px solid ${colors.cardBorder}`,
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
                  opacity: isComplete ? 0.7 : 1
                }}>
                  {getCompletionStepLabel(step as keyof ProfileCompletionStatus)}
                </span>
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
    const shareUrl = `beenwatching.app/join/${username}`

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
            Your Invite Link
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: 'monospace',
            color: colors.textPrimary,
            wordBreak: 'break-all'
          }}>
            {shareUrl}
          </div>
        </div>

        {/* Share Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: colors.brandGradient,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Share2 size={18} />
            Share
          </button>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: colors.cardBg,
              color: colors.textPrimary,
              border: colors.cardBorder,
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Link'}
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

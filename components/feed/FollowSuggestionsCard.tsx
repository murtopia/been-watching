/**
 * Follow Suggestions Card (Card 7)
 *
 * Horizontal carousel showing suggested users to follow
 * Features: Auto-rotate carousel, match percentage, mutual friends
 */

'use client'

import React, { useState, useEffect } from 'react'
import { FollowSuggestionsCard as FollowSuggestionsCardType } from '@/types/feed'
import { Icon } from '@/components/ui/Icon'
import { Avatar, AvatarStack, Badge } from './shared/CardElements'

interface Props {
  data: FollowSuggestionsCardType
  onFollow?: (userId: string) => void
  onUserClick?: (userId: string) => void
  onTrack?: (action: string, metadata?: any) => void
}

export const FollowSuggestionsCard: React.FC<Props> = ({
  data,
  onFollow,
  onUserClick,
  onTrack
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused || data.suggestions.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.suggestions.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isPaused, data.suggestions.length])

  const handleFollow = (userId: string) => {
    setFollowStates((prev) => ({ ...prev, [userId]: !prev[userId] }))
    onFollow?.(userId)
    onTrack?.('follow', { userId, cardId: data.id })
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    onTrack?.('carousel-navigate', { cardId: data.id, slideIndex: index })
  }

  const currentSuggestion = data.suggestions[currentIndex]

  return (
    <div
      style={{
        width: '398px',
        height: '420px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.1) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(251,191,36,0.3)',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Badge */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <Badge
          text="Find New Friends"
          icon="link-chain"
          color="#F59E0B"
          variant="glass"
        />
      </div>

      {/* Carousel Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100% - 80px)'
        }}
      >
        {/* Profile Card */}
        <div
          key={currentSuggestion.user.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(251,191,36,0.5)',
              marginBottom: '16px',
              cursor: 'pointer'
            }}
            onClick={() => {
              onUserClick?.(currentSuggestion.user.id)
              onTrack?.('click-user', { userId: currentSuggestion.user.id })
            }}
          >
            <img
              src={currentSuggestion.user.avatar}
              alt={currentSuggestion.user.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Name & Username */}
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              margin: '0 0 4px 0',
              cursor: 'pointer'
            }}
            onClick={() => {
              onUserClick?.(currentSuggestion.user.id)
              onTrack?.('click-user', { userId: currentSuggestion.user.id })
            }}
          >
            {currentSuggestion.user.name}
          </h3>
          <div style={{
            fontSize: '14px',
            opacity: 0.7,
            marginBottom: '16px'
          }}>
            @{currentSuggestion.user.username}
          </div>

          {/* Match Percentage */}
          <div
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#FBB F24',
              marginBottom: '8px'
            }}
          >
            {currentSuggestion.matchPercentage}%
          </div>
          <div style={{
            fontSize: '13px',
            opacity: 0.8,
            marginBottom: '20px'
          }}>
            Match
          </div>

          {/* Follow Button */}
          <button
            onClick={() => handleFollow(currentSuggestion.user.id)}
            style={{
              padding: '12px 32px',
              background: followStates[currentSuggestion.user.id] || currentSuggestion.isFollowing
                ? 'rgba(255,255,255,0.1)'
                : '#F59E0B',
              border: '1px solid rgba(251,191,36,0.5)',
              borderRadius: '24px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '20px'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {followStates[currentSuggestion.user.id] || currentSuggestion.isFollowing ? 'Following' : 'Follow'}
          </button>

          {/* Bio */}
          <p style={{
            fontSize: '13px',
            lineHeight: 1.5,
            opacity: 0.85,
            margin: '0 0 16px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {currentSuggestion.bio}
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>
                {currentSuggestion.stats.wantToWatch}
              </div>
              <div style={{ opacity: 0.7 }}>Want</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>
                {currentSuggestion.stats.watching}
              </div>
              <div style={{ opacity: 0.7 }}>Watching</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>
                {currentSuggestion.stats.watched}
              </div>
              <div style={{ opacity: 0.7 }}>Watched</div>
            </div>
          </div>

          {/* Mutual Friends */}
          {currentSuggestion.mutualFriends.count > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <AvatarStack
                users={currentSuggestion.mutualFriends.avatars}
                maxVisible={2}
                size={20}
              />
              <span>
                {currentSuggestion.mutualFriends.count} mutual {currentSuggestion.mutualFriends.count === 1 ? 'friend' : 'friends'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Dots */}
      {data.suggestions.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px'
          }}
        >
          {data.suggestions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentIndex === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentIndex === index
                  ? '#FBB F24'
                  : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      )}

      {/* CSS for fade animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

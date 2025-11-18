/**
 * Feed Cards Preview Page
 *
 * Preview and approve React feed card components before integration
 */

'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import DesignAssetsNav from '../DesignAssetsNav'
import { UserActivityCard, UserActivityCardData } from '@/components/feed/UserActivityCard'

export default function FeedCardsPreviewPage() {
  const colors = useThemeColors()
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark')
  const [trackingLog, setTrackingLog] = useState<string[]>([])

  // Sample data for User Activity Card
  const userActivityData: UserActivityCardData = {
    id: '1',
    timestamp: '2 hours ago',
    user: {
      id: 'user-1',
      name: 'Sarah Miller',
      username: 'sarahmiller',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    activityType: 'loved' as 'loved',
    activityBadges: [
      {
        text: 'Loved',
        color: 'rgba(255, 59, 92, 0.25)',
        borderColor: 'rgba(255, 59, 92, 0.5)',
        textColor: 'white'
      },
      {
        text: 'Currently Watching',
        color: 'rgba(59, 130, 246, 0.25)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        textColor: 'white'
      }
    ],
    media: {
      id: 'media-1',
      title: 'Breaking Bad Season 5',
      year: 2012,
      genres: ['Crime', 'Drama'],
      rating: 9.5,
      posterUrl: 'https://image.tmdb.org/t/p/original/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
      synopsis: 'In the final season, being bad is all that remains for Walter White. His empire grows, endangering his family and himself in ways he could never have imagined.',
      creator: 'Vince Gilligan',
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
      network: 'AMC',
      season: 5,
      mediaType: 'TV' as const
    },
    friends: {
      avatars: [
        { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' },
        { id: '4', name: 'Mike Wilson', username: 'mikewilson', avatar: 'https://i.pravatar.cc/150?img=33' }
      ],
      count: 8,
      text: '8 friends also loved this'
    },
    stats: {
      likeCount: 24,
      commentCount: 7,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: 8,
        avatars: [
          'https://i.pravatar.cc/150?img=12',
          'https://i.pravatar.cc/150?img=20',
          'https://i.pravatar.cc/150?img=33'
        ]
      },
      wantToWatch: {
        count: 12,
        avatars: [
          'https://i.pravatar.cc/150?img=15',
          'https://i.pravatar.cc/150?img=25',
          'https://i.pravatar.cc/150?img=35'
        ]
      },
      watched: {
        count: 42,
        avatars: [
          'https://i.pravatar.cc/150?img=40',
          'https://i.pravatar.cc/150?img=45',
          'https://i.pravatar.cc/150?img=50'
        ]
      },
      ratings: {
        meh: 5,
        like: 23,
        love: 48,
        userRating: 'love' as const
      }
    },
    comments: [
      {
        id: 'c1',
        user: { name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=12' },
        text: 'This season was absolutely incredible! Best TV finale ever.',
        timestamp: '1 hour ago',
        likes: 12,
        userLiked: false
      },
      {
        id: 'c2',
        user: { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=20' },
        text: 'The intensity in every episode is unmatched.',
        timestamp: '45 min ago',
        likes: 8,
        userLiked: true
      }
    ],
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Mike Wilson', avatar: 'https://i.pravatar.cc/150?img=33' },
        text: 'I can\'t stop thinking about this show. Masterpiece!',
        timestamp: '30 min ago',
        likes: 15,
        userLiked: false
      },
      {
        id: 'sc2',
        user: { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=40' },
        text: 'The character development is phenomenal.',
        timestamp: '15 min ago',
        likes: 7,
        userLiked: true
      }
    ],
    similarShows: [
      { id: 's1', title: 'Better Call Saul', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 's2', title: 'Ozark', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 's3', title: 'The Sopranos', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 's4', title: 'The Wire', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
    ]
  }


  const handleTrack = (action: string, metadata?: any) => {
    const log = `[${new Date().toLocaleTimeString()}] ${action}: ${JSON.stringify(metadata || {})}`
    setTrackingLog((prev) => [log, ...prev].slice(0, 10))
    console.log('Analytics:', action, metadata)
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: colors.background }}>
      {/* Sub Navigation */}
      <DesignAssetsNav />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 0.5rem 0'
          }}>
            Feed Cards (React Components)
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            margin: 0
          }}>
            Preview and test React feed card components with sample data
          </p>
        </div>

        {/* Theme Toggle */}
        <div style={{
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '8px',
          padding: '0.25rem',
          display: 'flex',
          gap: '0.25rem'
        }}>
          <button
            onClick={() => setSelectedTheme('dark')}
            style={{
              padding: '0.5rem 1rem',
              background: selectedTheme === 'dark' ? colors.brandPink : 'transparent',
              color: selectedTheme === 'dark' ? 'white' : colors.textSecondary,
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Dark
          </button>
          <button
            onClick={() => setSelectedTheme('light')}
            style={{
              padding: '0.5rem 1rem',
              background: selectedTheme === 'light' ? colors.brandPink : 'transparent',
              color: selectedTheme === 'light' ? 'white' : colors.textSecondary,
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Light
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 0.5rem 0'
        }}>
          Interactive Preview
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: colors.textSecondary,
          margin: '0 0 1rem 0',
          lineHeight: 1.6
        }}>
          These cards are fully interactive React components with analytics tracking. Try clicking on elements,
          flipping cards, and following users to see the tracking events below.
        </p>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: colors.isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)',
            border: `1px solid ${colors.isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)'}`,
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#8B5CF6',
            fontWeight: 600
          }}>
            ✓ Analytics Integrated
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: colors.isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)',
            border: `1px solid ${colors.isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)'}`,
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#22C55E',
            fontWeight: 600
          }}>
            ✓ Theme Support
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            background: colors.isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
            border: `1px solid ${colors.isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'}`,
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#3B82F6',
            fontWeight: 600
          }}>
            ✓ Icon System
          </div>
        </div>
      </div>

      {/* Cards Vertical Stack */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: User Activity */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Card 1: User Activity
          </h3>
          <UserActivityCard
            data={userActivityData}
            onLike={() => handleTrack('like', { cardId: userActivityData.id })}
            onComment={() => handleTrack('comment', { cardId: userActivityData.id })}
            onShare={() => handleTrack('share', { cardId: userActivityData.id })}
            onAddToWatchlist={() => handleTrack('watchlist', { cardId: userActivityData.id })}
            onUserClick={(userId) => handleTrack('click-user', { userId })}
            onMediaClick={(mediaId) => handleTrack('click-media', { mediaId })}
            onTrack={handleTrack}
          />
        </div>
      </div>

      {/* Analytics Tracking Log */}
      <div style={{
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 1rem 0'
        }}>
          Analytics Tracking Log (Last 10 Events)
        </h3>
        <div style={{
          background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
          borderRadius: '8px',
          padding: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {trackingLog.length === 0 ? (
            <div style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
              No events yet. Interact with the cards above to see tracking events.
            </div>
          ) : (
            trackingLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  color: colors.textPrimary,
                  padding: '0.25rem 0',
                  borderBottom: idx < trackingLog.length - 1 ? `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none'
                }}
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Section */}
      <div style={{
        marginTop: '2rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 1rem 0'
        }}>
          Implementation Status
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700
            }}>⏳</div>
            <span style={{ fontSize: '0.875rem', color: colors.textPrimary }}>
              Card 1: User Activity - Converting from HTML to React
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700
            }}>◯</div>
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Cards 2-7: Pending Card 1 approval
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

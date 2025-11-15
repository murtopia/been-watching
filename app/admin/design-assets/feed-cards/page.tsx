/**
 * Feed Cards Preview Page
 *
 * Preview and approve React feed card components before integration
 */

'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import DesignAssetsNav from '../DesignAssetsNav'
import { UserActivityCard } from '@/components/feed/UserActivityCard'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'

export default function FeedCardsPreviewPage() {
  const colors = useThemeColors()
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark')
  const [trackingLog, setTrackingLog] = useState<string[]>([])

  // Sample data for User Activity Card
  const userActivityData = {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: {
      id: 'user-1',
      name: 'Sarah Mitchell',
      username: 'sarahmitchell',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    activityType: 'loved',
    media: {
      id: 'media-1',
      title: 'Breaking Bad',
      year: 2008,
      genres: ['Crime', 'Drama', 'Thriller'],
      rating: 9.5,
      posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      synopsis: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      creator: 'Vince Gilligan',
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
      network: 'AMC',
      trailer: 'https://youtube.com/watch?v=example'
    },
    friends: {
      avatars: [
        { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' },
        { id: '4', name: 'Mike Wilson', username: 'mikewilson', avatar: 'https://i.pravatar.cc/150?img=33' }
      ],
      count: 8
    },
    ratings: {
      meh: 2,
      like: 5,
      love: 12
    },
    stats: {
      likeCount: 24,
      commentCount: 7
    },
    comments: []
  }

  // Sample data for Follow Suggestions Card
  const followSuggestionsData = {
    id: '2',
    timestamp: new Date(),
    suggestions: [
      {
        user: {
          id: 'suggest-1',
          name: 'Alex Thompson',
          username: 'alexthompson',
          avatar: 'https://i.pravatar.cc/150?img=15'
        },
        matchPercentage: 89,
        bio: 'Sci-fi enthusiast and TV show addict. Always looking for the next binge-worthy series!',
        stats: {
          wantToWatch: 42,
          watching: 8,
          watched: 156
        },
        mutualFriends: {
          avatars: [
            { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
            { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' }
          ],
          count: 5
        },
        isFollowing: false
      },
      {
        user: {
          id: 'suggest-2',
          name: 'Emily Chen',
          username: 'emilychen',
          avatar: 'https://i.pravatar.cc/150?img=25'
        },
        matchPercentage: 92,
        bio: 'Drama lover with a soft spot for British shows. Let\'s discuss our favorite series!',
        stats: {
          wantToWatch: 38,
          watching: 12,
          watched: 203
        },
        mutualFriends: {
          avatars: [
            { id: '4', name: 'Mike Wilson', username: 'mikewilson', avatar: 'https://i.pravatar.cc/150?img=33' }
          ],
          count: 3
        },
        isFollowing: false
      },
      {
        user: {
          id: 'suggest-3',
          name: 'Marcus Johnson',
          username: 'marcusj',
          avatar: 'https://i.pravatar.cc/150?img=40'
        },
        matchPercentage: 85,
        bio: 'Animation fan and comedy connoisseur. Love discovering hidden gems!',
        stats: {
          wantToWatch: 29,
          watching: 6,
          watched: 178
        },
        mutualFriends: {
          avatars: [
            { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
            { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' },
            { id: '4', name: 'Mike Wilson', username: 'mikewilson', avatar: 'https://i.pravatar.cc/150?img=33' }
          ],
          count: 7
        },
        isFollowing: false
      }
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

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, 398px)',
        gap: '2rem',
        justifyContent: 'start',
        marginBottom: '2rem'
      }}>
        {/* Card 1: User Activity */}
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Card 1: User Activity
          </h3>
          <div style={{
            background: selectedTheme === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '20px',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
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

        {/* Card 7: Follow Suggestions */}
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Card 7: Follow Suggestions
          </h3>
          <div style={{
            background: selectedTheme === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '20px',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <FollowSuggestionsCard
              data={followSuggestionsData}
              onFollow={(userId) => handleTrack('follow', { userId })}
              onUserClick={(userId) => handleTrack('click-user', { userId })}
              onTrack={handleTrack}
            />
          </div>
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
              background: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700
            }}>✓</div>
            <span style={{ fontSize: '0.875rem', color: colors.textPrimary }}>
              Card 1: User Activity (with flip animation & full back face)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: '#22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700
            }}>✓</div>
            <span style={{ fontSize: '0.875rem', color: colors.textPrimary }}>
              Card 7: Follow Suggestions (with auto-rotate carousel)
            </span>
          </div>
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
            <span style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              Cards 2-6: Awaiting approval before implementation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile Test Page for React Card 1 (UserActivityCard)
 * 
 * Purpose: Isolated test page for mobile testing
 * URL: /preview/card-1
 * 
 * - No auth required
 * - No database calls
 * - Self-contained with sample data
 * - Mobile-optimized viewport
 */

'use client'

import { useState } from 'react'
import { UserActivityCard, UserActivityCardData } from '@/components/feed/UserActivityCard'

export default function Card1MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data matching the approved HTML design
  const sampleData: UserActivityCardData = {
    id: '1',
    timestamp: '2 hours ago',
    user: {
      id: 'user-1',
      name: 'Sarah Miller',
      username: 'sarahmiller',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    activityType: 'loved',
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
      title: 'Breaking Bad',
      year: 2012,
      genres: ['Crime', 'Drama'],
      rating: 9.5,
      posterUrl: 'https://image.tmdb.org/t/p/original/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
      synopsis: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future. As Walter White descends deeper into the criminal underworld, he transforms from mild-mannered educator to ruthless drug kingpin.',
      creator: 'Vince Gilligan',
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
      network: 'AMC',
      season: 5,
      mediaType: 'TV'
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
      commentCount: 8,
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
        userRating: undefined
      }
    },
    comments: [
      {
        id: 'c1',
        user: { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=5' },
        text: 'This finale was absolutely incredible! Best TV I\'ve seen all year.',
        timestamp: '1h ago',
        likes: 8,
        userLiked: true
      },
      {
        id: 'c2',
        user: { name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=6' },
        text: 'Can\'t believe it\'s over. What a ride! 🎬',
        timestamp: '45m ago',
        likes: 3,
        userLiked: false
      },
      {
        id: 'c3',
        user: { name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?img=7' },
        text: 'The character development throughout this season was masterful.',
        timestamp: '2h ago',
        likes: 15,
        userLiked: true
      },
      {
        id: 'c4',
        user: { name: 'Jordan Martinez', avatar: 'https://i.pravatar.cc/150?img=8' },
        text: 'Just finished binging the whole season. Mind = blown 🤯',
        timestamp: '3h ago',
        likes: 7,
        userLiked: false
      },
      {
        id: 'c5',
        user: { name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=9' },
        text: 'This is peak television. Nothing comes close!',
        timestamp: '4h ago',
        likes: 22,
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
      },
      {
        id: 'sc3',
        user: { name: 'David Chen', avatar: 'https://i.pravatar.cc/150?img=15' },
        text: 'Walter White is one of the greatest TV characters ever written.',
        timestamp: '1h ago',
        likes: 23,
        userLiked: false
      },
      {
        id: 'sc4',
        user: { name: 'Emily Rodriguez', avatar: 'https://i.pravatar.cc/150?img=25' },
        text: 'The chemistry between Bryan Cranston and Aaron Paul is incredible.',
        timestamp: '2h ago',
        likes: 19,
        userLiked: true
      },
      {
        id: 'sc5',
        user: { name: 'James Patterson', avatar: 'https://i.pravatar.cc/150?img=30' },
        text: 'Every episode is perfectly crafted. The writing is top tier.',
        timestamp: '3h ago',
        likes: 12,
        userLiked: false
      },
      {
        id: 'sc6',
        user: { name: 'Lisa Wang', avatar: 'https://i.pravatar.cc/150?img=35' },
        text: 'This show changed television forever. A true masterpiece.',
        timestamp: '4h ago',
        likes: 28,
        userLiked: true
      }
    ],
  }

  const handleTrack = (action: string, metadata?: any) => {
    const log = `[${new Date().toLocaleTimeString()}] ${action}: ${JSON.stringify(metadata || {})}`
    setTrackingLog((prev) => [log, ...prev].slice(0, 20))
    console.log('Track:', action, metadata)
  }

  return (
    <>
      {/* Lock page scroll to isolate card scroll testing */}
      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100% !important;
          position: fixed !important;
          width: 100% !important;
        }
      `}</style>
      <div style={{
        height: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 10px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
      }}>
      {/* Test Header */}
      <div style={{
        width: '100%',
        maxWidth: '398px',
        marginBottom: '16px',
        padding: '16px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#3B82F6',
          margin: '0 0 8px 0'
        }}>
          🧪 React Card 1 - Mobile Test v9
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'rgba(0,0,0,0.6)',
          margin: 0,
          lineHeight: '1.4'
        }}>
          UserActivityCard Component
        </p>
        <div style={{
          display: 'inline-block',
          marginTop: '10px',
          padding: '4px 12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#22C55E',
          fontWeight: '600'
        }}>
          ✓ 398×645px
        </div>
      </div>

      {/* The Card */}
      <div style={{
        width: '100%',
        maxWidth: '398px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <UserActivityCard
          data={sampleData}
          onLike={() => handleTrack('like')}
          onComment={() => handleTrack('comment')}
          onShare={() => handleTrack('share')}
          onAddToWatchlist={() => handleTrack('add_to_watchlist')}
          onUserClick={(userId) => handleTrack('user_click', { userId })}
          onMediaClick={(mediaId) => handleTrack('media_click', { mediaId })}
          onTrack={handleTrack}
        />
      </div>

      {/* Test Checklist */}
      <div style={{
        width: '100%',
        maxWidth: '398px',
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '12px'
      }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#3B82F6',
          margin: '0 0 12px 0'
        }}>
          Test Checklist
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '13px',
          color: 'rgba(0,0,0,0.7)',
          lineHeight: '2'
        }}>
          <li>→ Tap menu dots (top right) to flip card</li>
          <li>→ Tap ❤️ heart to like (should fill red)</li>
          <li>→ Tap ➕ plus to open rating modal</li>
          <li>→ Tap 💬 comment to open comments tab</li>
          <li>→ On back: scroll content, tap ratings</li>
          <li>→ Check all icons render correctly</li>
        </ul>
      </div>

      {/* Tracking Log Toggle */}
      <button
        onClick={() => setShowLog(!showLog)}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.2)',
          borderRadius: '8px',
          color: 'rgba(0,0,0,0.7)',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        {showLog ? 'Hide' : 'Show'} Event Log ({trackingLog.length})
      </button>

      {/* Tracking Log */}
      {showLog && trackingLog.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '398px',
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#22C55E',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {trackingLog.map((log, i) => (
            <div key={i} style={{ marginBottom: '4px', opacity: 1 - i * 0.05 }}>
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '11px',
        color: 'rgba(0,0,0,0.4)'
      }}>
        Card 1 of 8 | React Component Test | Been Watching
      </div>
    </div>
    </>
  )
}


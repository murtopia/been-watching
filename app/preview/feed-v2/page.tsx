/**
 * Preview Feed V2 - Fresh Start
 * 
 * Purpose: Rebuild the feed page from scratch, preserving pixel-perfect cards
 * URL: /preview/feed-v2
 * 
 * Approach: Add cards one at a time, using the EXACT same imports and data
 * structures as the approved individual preview pages.
 */

'use client'

import { useState } from 'react'
import { UserActivityCard, UserActivityCardData } from '@/components/feed/UserActivityCard'

export default function PreviewFeedV2Page() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])

  const handleTrack = (action: string, metadata?: any) => {
    const log = `[${new Date().toLocaleTimeString()}] ${action}: ${JSON.stringify(metadata || {})}`
    setTrackingLog((prev) => [log, ...prev].slice(0, 50))
    console.log('Track:', action, metadata)
  }

  // ============================================================================
  // Card 1 Data - EXACT copy from /preview/card-1/page.tsx
  // ============================================================================
  const card1Data: UserActivityCardData = {
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
      synopsis: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
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
        text: 'This finale was absolutely incredible!',
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
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      paddingTop: '20px',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 8px 0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Feed V2 Test
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Step 1: Card 1 only (using UserActivityCard)
        </p>
      </div>

      {/* Card Container - EXACT match to /preview/card-1 structure */}
      <div style={{
        width: '100%',
        maxWidth: '398px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <UserActivityCard
          data={card1Data}
          onLike={() => handleTrack('like', { card: 1 })}
          onComment={() => handleTrack('comment', { card: 1 })}
          onShare={() => handleTrack('share', { card: 1 })}
          onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 1 })}
          onUserClick={(userId) => handleTrack('user_click', { userId })}
          onMediaClick={(mediaId) => handleTrack('media_click', { mediaId })}
          onTrack={handleTrack}
        />
      </div>

      {/* Status */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        ✓ Card 1 added using UserActivityCard wrapper<br/>
        → Compare to /preview/card-1 to verify match
      </div>
    </div>
  )
}


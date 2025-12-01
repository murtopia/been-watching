/**
 * Preview Feed V2 - Hybrid Scroll Implementation
 * 
 * Purpose: Test feed with scroll-snap + scroll lock on flip
 * URL: /preview/feed-v2
 * 
 * Features:
 * 1. CSS scroll-snap: Cards lightly snap to center when scrolling
 * 2. Scroll lock on flip: When card is flipped, page scroll is locked
 *    (This fixes iOS Safari 3D rendering issues on the back of card)
 */

'use client'

import { useState, useCallback } from 'react'
import { UserActivityCard, UserActivityCardData } from '@/components/feed/UserActivityCard'

export default function PreviewFeedV2Page() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [isAnyCardFlipped, setIsAnyCardFlipped] = useState(false)

  // Scroll lock is now handled via CSS class on the container
  // The className includes 'scroll-locked' when isAnyCardFlipped is true

  const handleTrack = (action: string, metadata?: any) => {
    const log = `[${new Date().toLocaleTimeString()}] ${action}: ${JSON.stringify(metadata || {})}`
    setTrackingLog((prev) => [log, ...prev].slice(0, 50))
    console.log('Track:', action, metadata)
  }

  const handleCardFlip = useCallback((isFlipped: boolean) => {
    setIsAnyCardFlipped(isFlipped)
    console.log('Card flip:', isFlipped ? 'showing back' : 'showing front')
  }, [])

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

  return (
    <>
      {/* Global styles for scroll-snap */}
      <style>{`
        .feed-scroll-container {
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          background: #1a1a1a;
        }
        
        .feed-scroll-container.scroll-locked {
          overflow: hidden !important;
        }
        
        .card-snap-wrapper {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 20px;
          padding-bottom: 20px;
        }
        
        .card-inner-wrapper {
          width: 100%;
          max-width: 398px;
          display: flex;
          justify-content: center;
        }
        
        .feed-header {
          scroll-snap-align: start;
          padding: 20px 20px 0 20px;
          display: flex;
          justify-content: center;
        }
      `}</style>

      <div className={`feed-scroll-container ${isAnyCardFlipped ? 'scroll-locked' : ''}`}>
        {/* Header */}
        <div className="feed-header">
          <div style={{
            textAlign: 'center',
            padding: '16px 20px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            maxWidth: '398px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 8px 0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Feed V2 - Hybrid Scroll Test
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Scroll-snap + scroll lock on flip
            </p>
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: isAnyCardFlipped ? '#FF3B5C' : '#22C55E',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {isAnyCardFlipped ? '🔒 Scroll locked (card flipped)' : '✓ Scroll enabled'}
            </div>
          </div>
        </div>

        {/* Card 1 */}
        <div className="card-snap-wrapper" style={{ paddingTop: '20px' }}>
          <div className="card-inner-wrapper">
            <UserActivityCard
              data={{...card1Data, id: '1'}}
              onLike={() => handleTrack('like', { card: 1 })}
              onComment={() => handleTrack('comment', { card: 1 })}
              onShare={() => handleTrack('share', { card: 1 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 1 })}
              onUserClick={(userId) => handleTrack('user_click', { userId })}
              onMediaClick={(mediaId) => handleTrack('media_click', { mediaId })}
              onTrack={handleTrack}
              onFlip={handleCardFlip}
            />
          </div>
        </div>

        {/* Card 2 (duplicate for scroll testing) */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <UserActivityCard
              data={{...card1Data, id: '2'}}
              onLike={() => handleTrack('like', { card: 2 })}
              onComment={() => handleTrack('comment', { card: 2 })}
              onShare={() => handleTrack('share', { card: 2 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 2 })}
              onUserClick={(userId) => handleTrack('user_click', { userId })}
              onMediaClick={(mediaId) => handleTrack('media_click', { mediaId })}
              onTrack={handleTrack}
              onFlip={handleCardFlip}
            />
          </div>
        </div>

        {/* Card 3 (duplicate for scroll testing) */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <UserActivityCard
              data={{...card1Data, id: '3'}}
              onLike={() => handleTrack('like', { card: 3 })}
              onComment={() => handleTrack('comment', { card: 3 })}
              onShare={() => handleTrack('share', { card: 3 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 3 })}
              onUserClick={(userId) => handleTrack('user_click', { userId })}
              onMediaClick={(mediaId) => handleTrack('media_click', { mediaId })}
              onTrack={handleTrack}
              onFlip={handleCardFlip}
            />
          </div>
        </div>

        {/* Footer spacer for scroll */}
        <div style={{ height: '50vh' }} />
      </div>
    </>
  )
}

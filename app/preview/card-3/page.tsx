/**
 * Mobile Test Page for React Card 3 (Your Friends Loved)
 * 
 * Purpose: Isolated test page for Template B social recommendation card
 * URL: /preview/card-3
 * 
 * Template B Features:
 * - No user header (social recommendation)
 * - No heart action button
 * - Badge: "Your Friends Loved" (pink)
 * - Side actions: Plus + Share
 * - Emphasizes friend social proof
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'

export default function Card3MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 3 - The Last of Us (your friends loved this)
  const sampleData: FeedCardData = {
    id: '3',
    media: {
      id: 'media-3',
      title: 'The Last of Us',
      year: 2023,
      genres: ['Drama', 'Sci-Fi'],
      rating: 8.8,
      posterUrl: 'https://image.tmdb.org/t/p/original/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      synopsis: 'Twenty years after a fungal outbreak ravages the planet, Joel Miller is tasked with escorting teenager Ellie across a post-apocalyptic United States. As they journey across the ruins of civilization, their relationship deepens while they face infected monsters and desperate survivors in their path.',
      creator: 'Craig Mazin & Neil Druckmann',
      cast: ['Pedro Pascal', 'Bella Ramsey', 'Anna Torv', 'Gabriel Luna'],
      network: 'HBO',
      season: 1,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'Alex Rivera', username: 'alexr', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: '3', name: 'Jordan Kim', username: 'jordank', avatar: 'https://i.pravatar.cc/150?img=7' },
        { id: '4', name: 'Sam Taylor', username: 'samt', avatar: 'https://i.pravatar.cc/150?img=11' },
        { id: '5', name: 'Casey Brown', username: 'caseyb', avatar: 'https://i.pravatar.cc/150?img=15' }
      ],
      count: 12,
      text: '12 friends loved this'
    },
    stats: {
      likeCount: 0, // Not used for Template B
      commentCount: 15,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: 6,
        avatars: [
          'https://i.pravatar.cc/150?img=3',
          'https://i.pravatar.cc/150?img=7',
          'https://i.pravatar.cc/150?img=11'
        ]
      },
      wantToWatch: {
        count: 18,
        avatars: [
          'https://i.pravatar.cc/150?img=15',
          'https://i.pravatar.cc/150?img=19',
          'https://i.pravatar.cc/150?img=23'
        ]
      },
      watched: {
        count: 35,
        avatars: [
          'https://i.pravatar.cc/150?img=27',
          'https://i.pravatar.cc/150?img=31',
          'https://i.pravatar.cc/150?img=35'
        ]
      },
      ratings: {
        meh: 3,
        like: 15,
        love: 52,
        userRating: undefined
      }
    },
    comments: [], // Not used for Template B front
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=3' },
        text: 'Episode 3 absolutely destroyed me. Bill and Frank\'s story was perfect.',
        timestamp: '2h ago',
        likes: 45,
        userLiked: true
      },
      {
        id: 'sc2',
        user: { name: 'Jordan Kim', avatar: 'https://i.pravatar.cc/150?img=7' },
        text: 'Best video game adaptation ever made. Pedro Pascal is incredible.',
        timestamp: '3h ago',
        likes: 38,
        userLiked: false
      },
      {
        id: 'sc3',
        user: { name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=11' },
        text: 'The infected are terrifying but the human moments hit even harder.',
        timestamp: '5h ago',
        likes: 27,
        userLiked: true
      },
      {
        id: 'sc4',
        user: { name: 'Casey Brown', avatar: 'https://i.pravatar.cc/150?img=15' },
        text: 'I need to rewatch this immediately. So many details I missed the first time!',
        timestamp: '6h ago',
        likes: 19,
        userLiked: false
      },
      {
        id: 'sc5',
        user: { name: 'Morgan Lee', avatar: 'https://i.pravatar.cc/150?img=19' },
        text: 'The writing is just incredible. Every line matters.',
        timestamp: '7h ago',
        likes: 32,
        userLiked: true
      },
      {
        id: 'sc6',
        user: { name: 'Taylor White', avatar: 'https://i.pravatar.cc/150?img=23' },
        text: 'Best season finale I\'ve ever seen. Period.',
        timestamp: '8h ago',
        likes: 41,
        userLiked: false
      },
      {
        id: 'sc7',
        user: { name: 'Jamie Park', avatar: 'https://i.pravatar.cc/150?img=27' },
        text: 'The emotional payoff was everything. I\'m still processing it.',
        timestamp: '9h ago',
        likes: 24,
        userLiked: true
      },
      {
        id: 'sc8',
        user: { name: 'Drew Anderson', avatar: 'https://i.pravatar.cc/150?img=31' },
        text: 'This show set the bar so high, nothing else compares now.',
        timestamp: '10h ago',
        likes: 16,
        userLiked: false
      },
      {
        id: 'sc9',
        user: { name: 'Quinn Rodriguez', avatar: 'https://i.pravatar.cc/150?img=35' },
        text: 'The tension in every scene was masterfully crafted. Absolutely brilliant.',
        timestamp: '11h ago',
        likes: 29,
        userLiked: true
      },
      {
        id: 'sc10',
        user: { name: 'Blake Thompson', avatar: 'https://i.pravatar.cc/150?img=39' },
        text: 'I\'ve been recommending this to everyone. It\'s that good!',
        timestamp: '12h ago',
        likes: 35,
        userLiked: false
      },
      {
        id: 'sc11',
        user: { name: 'Avery Wilson', avatar: 'https://i.pravatar.cc/150?img=43' },
        text: 'Joel and Ellie\'s relationship is the heart of this show. Beautiful.',
        timestamp: '1 day ago',
        likes: 48,
        userLiked: true
      },
      {
        id: 'sc12',
        user: { name: 'Riley Chen', avatar: 'https://i.pravatar.cc/150?img=47' },
        text: 'Can\'t wait for season 2. This show has ruined other shows for me.',
        timestamp: '1 day ago',
        likes: 22,
        userLiked: false
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
          overscroll-behavior: none !important;
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
          padding: '12px 16px',
          background: 'rgba(236, 72, 153, 0.1)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#EC4899',
            margin: '0'
          }}>
            React Card 3: Your Friends Loved
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template B (Social recommendation)
          </p>
        </div>

        {/* The Card */}
        <div style={{
          width: '100%',
          maxWidth: '398px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <FeedCard
            variant="b"
            backVariant="standard"
            badges={[BADGE_PRESETS.friendsLoved()]}
            data={sampleData}
            onShare={() => handleTrack('share')}
            onAddToWatchlist={() => handleTrack('add_to_watchlist')}
            onMediaClick={(mediaId) => handleTrack('media_click', { mediaId })}
            onTrack={handleTrack}
          />
        </div>

        {/* Test Checklist */}
        <div style={{
          width: '100%',
          maxWidth: '398px',
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#EC4899',
            margin: '0 0 8px 0'
          }}>
            Card 3 Specifics
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ Pink "Your Friends Loved" badge</li>
            <li>✓ 12 friends loved this (social proof)</li>
            <li>✓ The Last of Us - Season 1</li>
            <li>✓ Template B (no header, no heart)</li>
            <li>→ Same back behavior as Cards 1 & 2</li>
          </ul>
        </div>

        {/* Tracking Log Toggle */}
        <button
          onClick={() => setShowLog(!showLog)}
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            background: 'rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: '8px',
            color: 'rgba(0,0,0,0.7)',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          {showLog ? 'Hide' : 'Show'} Log ({trackingLog.length})
        </button>

        {/* Tracking Log */}
        {showLog && trackingLog.length > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '398px',
            marginTop: '8px',
            padding: '10px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#22C55E',
            maxHeight: '150px',
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
          marginTop: 'auto',
          paddingTop: '12px',
          textAlign: 'center',
          fontSize: '10px',
          color: 'rgba(0,0,0,0.4)'
        }}>
          Card 3 of 8 | Template B | Been Watching
        </div>
      </div>
    </>
  )
}


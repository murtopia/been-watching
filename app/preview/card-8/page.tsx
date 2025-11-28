/**
 * Mobile Test Page for React Card 8 (You Might Like)
 * 
 * Purpose: Isolated test page for Template B personalized recommendation
 * URL: /preview/card-8
 * 
 * Template B Features:
 * - No user header (system recommendation)
 * - No heart action button
 * - Badge: "You Might Like" (purple with thumbs up)
 * - Side actions: Plus + Share
 * - Standard back
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'

export default function Card8MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 8 - Better Call Saul (You Might Like)
  const sampleData: FeedCardData = {
    id: '8',
    media: {
      id: 'media-8',
      title: 'Better Call Saul',
      year: 2022,
      genres: ['Crime', 'Drama'],
      rating: 9.0,
      posterUrl: 'https://image.tmdb.org/t/p/original/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
      synopsis: 'Six years before Saul Goodman meets Walter White. We meet him when the man who will become Saul Goodman is known as Jimmy McGill, a small-time lawyer searching for his destiny, and, more immediately, parsing the line between high-minded ambition and low-level slippin\' Jimmy schemes.',
      creator: 'Vince Gilligan, Peter Gould',
      cast: ['Bob Odenkirk', 'Rhea Seehorn', 'Jonathan Banks', 'Michael McKean'],
      network: 'AMC',
      season: 6,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'Ryan Miller', username: 'ryanm', avatar: 'https://i.pravatar.cc/150?img=6' },
        { id: '3', name: 'Sophie Chen', username: 'sophiec', avatar: 'https://i.pravatar.cc/150?img=7' }
      ],
      count: 2,
      text: '2 friends loved this'
    },
    stats: {
      likeCount: 0,
      commentCount: 14,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: 3,
        avatars: [
          'https://i.pravatar.cc/150?img=6',
          'https://i.pravatar.cc/150?img=7',
          'https://i.pravatar.cc/150?img=8'
        ]
      },
      wantToWatch: {
        count: 22,
        avatars: [
          'https://i.pravatar.cc/150?img=10',
          'https://i.pravatar.cc/150?img=12',
          'https://i.pravatar.cc/150?img=14'
        ]
      },
      watched: {
        count: 18,
        avatars: [
          'https://i.pravatar.cc/150?img=16',
          'https://i.pravatar.cc/150?img=18',
          'https://i.pravatar.cc/150?img=20'
        ]
      },
      ratings: {
        meh: 0,
        like: 4,
        love: 36,
        userRating: undefined
      }
    },
    comments: [],
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Ryan Miller', avatar: 'https://i.pravatar.cc/150?img=6' },
        text: 'The final season is absolutely perfect. Every loose end tied up beautifully.',
        timestamp: '2h ago',
        likes: 78,
        userLiked: true
      },
      {
        id: 'sc2',
        user: { name: 'Sophie Chen', avatar: 'https://i.pravatar.cc/150?img=7' },
        text: 'Rhea Seehorn deserved an Emmy for every single season.',
        timestamp: '4h ago',
        likes: 92,
        userLiked: false
      },
      {
        id: 'sc3',
        user: { name: 'Marcus Johnson', avatar: 'https://i.pravatar.cc/150?img=11' },
        text: 'Better than Breaking Bad. I said what I said.',
        timestamp: '6h ago',
        likes: 156,
        userLiked: true
      },
      {
        id: 'sc4',
        user: { name: 'Emma Williams', avatar: 'https://i.pravatar.cc/150?img=15' },
        text: 'The character development in this show is unmatched in television.',
        timestamp: '8h ago',
        likes: 67,
        userLiked: false
      },
      {
        id: 'sc5',
        user: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?img=19' },
        text: 'Started as a spin-off, ended as a masterpiece.',
        timestamp: '10h ago',
        likes: 84,
        userLiked: true
      },
      {
        id: 'sc6',
        user: { name: 'Olivia Martinez', avatar: 'https://i.pravatar.cc/150?img=23' },
        text: 'The cinematography alone is worth watching this show.',
        timestamp: '12h ago',
        likes: 45,
        userLiked: false
      },
      {
        id: 'sc7',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=27' },
        text: 'Bob Odenkirk should have won everything.',
        timestamp: '1 day ago',
        likes: 103,
        userLiked: true
      },
      {
        id: 'sc8',
        user: { name: 'Ava Thompson', avatar: 'https://i.pravatar.cc/150?img=31' },
        text: 'Every time I rewatch I notice something new.',
        timestamp: '1 day ago',
        likes: 38,
        userLiked: false
      },
      {
        id: 'sc9',
        user: { name: 'Noah Garcia', avatar: 'https://i.pravatar.cc/150?img=35' },
        text: 'The Chicanery scene lives rent-free in my head.',
        timestamp: '2 days ago',
        likes: 127,
        userLiked: true
      },
      {
        id: 'sc10',
        user: { name: 'Isabella Brown', avatar: 'https://i.pravatar.cc/150?img=39' },
        text: 'This show made me appreciate slow-burn storytelling.',
        timestamp: '2 days ago',
        likes: 52,
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
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#8B5CF6',
            margin: '0'
          }}>
            React Card 8: You Might Like
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template B (Personalized recommendation)
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
            badges={[BADGE_PRESETS.youMightLike]}
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
            color: '#8B5CF6',
            margin: '0 0 8px 0'
          }}>
            Card 8 Specifics
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ Purple "You Might Like" badge</li>
            <li>✓ Thumbs up icon</li>
            <li>✓ Better Call Saul S6</li>
            <li>✓ Template B (no header, no heart)</li>
            <li>✓ Standard back (full features)</li>
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
          Card 8 of 8 | Template B | Been Watching
        </div>
      </div>
    </>
  )
}


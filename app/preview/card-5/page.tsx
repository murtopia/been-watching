/**
 * Mobile Test Page for React Card 5 (Now Streaming)
 * 
 * Purpose: Isolated test page for Template B streaming notification card
 * URL: /preview/card-5
 * 
 * Template B Features:
 * - No user header (system notification)
 * - No heart action button
 * - Badge: "Now Streaming on [Platform]" (purple)
 * - Side actions: Plus + Share
 * - Standard back (not unreleased)
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'

export default function Card5MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 5 - Dune: Part Two (now streaming)
  const sampleData: FeedCardData = {
    id: '5',
    media: {
      id: 'media-5',
      title: 'Dune: Part Two',
      year: 2024,
      genres: ['Sci-Fi', 'Adventure'],
      rating: 8.7,
      posterUrl: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
      creator: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin'],
      network: 'Netflix',
      season: undefined, // Movie, no season
      mediaType: 'Movie'
    },
    friends: {
      avatars: [
        { id: '2', name: 'Ryan Miller', username: 'ryanm', avatar: 'https://i.pravatar.cc/150?img=6' },
        { id: '3', name: 'Sophie Chen', username: 'sophiec', avatar: 'https://i.pravatar.cc/150?img=7' }
      ],
      count: 3,
      text: '3 friends watched this'
    },
    stats: {
      likeCount: 0,
      commentCount: 18,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: 4,
        avatars: [
          'https://i.pravatar.cc/150?img=6',
          'https://i.pravatar.cc/150?img=7',
          'https://i.pravatar.cc/150?img=8'
        ]
      },
      wantToWatch: {
        count: 28,
        avatars: [
          'https://i.pravatar.cc/150?img=10',
          'https://i.pravatar.cc/150?img=12',
          'https://i.pravatar.cc/150?img=14'
        ]
      },
      watched: {
        count: 15,
        avatars: [
          'https://i.pravatar.cc/150?img=16',
          'https://i.pravatar.cc/150?img=18',
          'https://i.pravatar.cc/150?img=20'
        ]
      },
      ratings: {
        meh: 2,
        like: 8,
        love: 32,
        userRating: undefined
      }
    },
    comments: [],
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Ryan Miller', avatar: 'https://i.pravatar.cc/150?img=6' },
        text: 'Finally on streaming! This movie is absolutely breathtaking on a big screen but still incredible at home.',
        timestamp: '2h ago',
        likes: 45,
        userLiked: true
      },
      {
        id: 'sc2',
        user: { name: 'Sophie Chen', avatar: 'https://i.pravatar.cc/150?img=7' },
        text: 'Hans Zimmer\'s score deserves its own appreciation post. Unreal.',
        timestamp: '4h ago',
        likes: 38,
        userLiked: false
      },
      {
        id: 'sc3',
        user: { name: 'Marcus Johnson', avatar: 'https://i.pravatar.cc/150?img=11' },
        text: 'Timothée and Zendaya have amazing chemistry. Can\'t wait for Part 3.',
        timestamp: '6h ago',
        likes: 29,
        userLiked: true
      },
      {
        id: 'sc4',
        user: { name: 'Emma Williams', avatar: 'https://i.pravatar.cc/150?img=15' },
        text: 'The sandworm sequences are even better than the first movie!',
        timestamp: '8h ago',
        likes: 52,
        userLiked: false
      },
      {
        id: 'sc5',
        user: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?img=19' },
        text: 'Denis Villeneuve is a master. This is how you do a book adaptation.',
        timestamp: '10h ago',
        likes: 41,
        userLiked: true
      },
      {
        id: 'sc6',
        user: { name: 'Olivia Martinez', avatar: 'https://i.pravatar.cc/150?img=23' },
        text: 'Watched it three times already. Still finding new details.',
        timestamp: '12h ago',
        likes: 23,
        userLiked: false
      },
      {
        id: 'sc7',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=27' },
        text: 'The costume design is Oscar-worthy. Every frame is art.',
        timestamp: '1 day ago',
        likes: 34,
        userLiked: true
      },
      {
        id: 'sc8',
        user: { name: 'Ava Thompson', avatar: 'https://i.pravatar.cc/150?img=31' },
        text: 'Best sci-fi movie in years. The world-building is incredible.',
        timestamp: '1 day ago',
        likes: 47,
        userLiked: false
      },
      {
        id: 'sc9',
        user: { name: 'Noah Garcia', avatar: 'https://i.pravatar.cc/150?img=35' },
        text: 'Austin Butler as Feyd-Rautha is terrifying and perfect.',
        timestamp: '2 days ago',
        likes: 56,
        userLiked: true
      },
      {
        id: 'sc10',
        user: { name: 'Isabella Brown', avatar: 'https://i.pravatar.cc/150?img=39' },
        text: 'This movie made me want to read the books. Starting tonight!',
        timestamp: '2 days ago',
        likes: 19,
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
            React Card 5: Now Streaming
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template B (Streaming notification)
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
            badges={[BADGE_PRESETS.nowStreaming('Netflix')]}
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
            Card 5 Specifics
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ Purple "Now Streaming on Netflix" badge</li>
            <li>✓ Movie (not TV show) - no season</li>
            <li>✓ Dune: Part Two</li>
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
          Card 5 of 8 | Template B | Been Watching
        </div>
      </div>
    </>
  )
}


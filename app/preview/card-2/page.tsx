/**
 * Mobile Test Page for React Card 2 (Because You Liked)
 * 
 * Purpose: Isolated test page for Template B recommendation card
 * URL: /preview/card-2
 * 
 * Template B Features:
 * - No user header (system-generated recommendation)
 * - No heart action button
 * - Badge: "Because you liked [Show]"
 * - Side actions: Plus + Share
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'

export default function Card2MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 2 - Better Call Saul (recommended because you liked Breaking Bad)
  const sampleData: FeedCardData = {
    id: '2',
    media: {
      id: 'media-2',
      title: 'Better Call Saul',
      year: 2022,
      genres: ['Crime', 'Drama'],
      rating: 9.0,
      posterUrl: 'https://image.tmdb.org/t/p/original/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
      synopsis: 'The final season finds Jimmy McGill living as Gene Takavic in Omaha. As he completes his transformation into criminal lawyer Saul Goodman, tensions between Gus Fring and Lalo Salamanca escalate. Kim and Jimmy\'s relationship reaches a breaking point as they navigate an increasingly dangerous world.',
      creator: 'Vince Gilligan',
      cast: ['Bob Odenkirk', 'Rhea Seehorn', 'Jonathan Banks', 'Giancarlo Esposito'],
      network: 'AMC',
      season: 6,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' },
        { id: '4', name: 'Mike Wilson', username: 'mikewilson', avatar: 'https://i.pravatar.cc/150?img=33' }
      ],
      count: 5,
      text: '5 friends loved this'
    },
    stats: {
      likeCount: 0, // Not used for Template B
      commentCount: 12,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: 8,
        avatars: [
          'https://i.pravatar.cc/150?img=5',
          'https://i.pravatar.cc/150?img=6',
          'https://i.pravatar.cc/150?img=7'
        ]
      },
      wantToWatch: {
        count: 12,
        avatars: [
          'https://i.pravatar.cc/150?img=8',
          'https://i.pravatar.cc/150?img=9',
          'https://i.pravatar.cc/150?img=10'
        ]
      },
      watched: {
        count: 42,
        avatars: [
          'https://i.pravatar.cc/150?img=11',
          'https://i.pravatar.cc/150?img=12',
          'https://i.pravatar.cc/150?img=13'
        ]
      },
      ratings: {
        meh: 5,
        like: 23,
        love: 48,
        userRating: undefined
      }
    },
    comments: [], // Not used for Template B front
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Jessica Chen', avatar: 'https://i.pravatar.cc/150?img=14' },
        text: 'This season is absolutely phenomenal. The tension keeps building and you can\'t look away. Best TV I\'ve ever watched.',
        timestamp: '3 days ago',
        likes: 20,
        userLiked: true
      },
      {
        id: 'sc2',
        user: { name: 'Marcus Williams', avatar: 'https://i.pravatar.cc/150?img=16' },
        text: 'Bob Odenkirk deserves every award for this performance. Incredible work.',
        timestamp: '1 week ago',
        likes: 35,
        userLiked: false
      },
      {
        id: 'sc3',
        user: { name: 'Emily Nakamura', avatar: 'https://i.pravatar.cc/150?img=18' },
        text: 'The cinematography in this show is unreal. Every frame is a painting.',
        timestamp: '2 weeks ago',
        likes: 18,
        userLiked: true
      },
      {
        id: 'sc4',
        user: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?img=22' },
        text: 'I was skeptical of a Breaking Bad spinoff but this might be even better.',
        timestamp: '2 weeks ago',
        likes: 42,
        userLiked: false
      },
      {
        id: 'sc5',
        user: { name: 'Rachel Torres', avatar: 'https://i.pravatar.cc/150?img=26' },
        text: 'Kim Wexler is one of the best characters ever written for TV.',
        timestamp: '3 weeks ago',
        likes: 28,
        userLiked: true
      },
      {
        id: 'sc6',
        user: { name: 'Alex Morrison', avatar: 'https://i.pravatar.cc/150?img=28' },
        text: 'The Gene timeline is so suspenseful. I need to know what happens!',
        timestamp: '1 month ago',
        likes: 15,
        userLiked: false
      },
      {
        id: 'sc7',
        user: { name: 'Sarah Kim', avatar: 'https://i.pravatar.cc/150?img=32' },
        text: 'This show proves that slow-burn storytelling can be just as gripping as action.',
        timestamp: '1 month ago',
        likes: 22,
        userLiked: true
      },
      {
        id: 'sc8',
        user: { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?img=36' },
        text: 'Rewatching from season 1 after finishing this. It\'s even better the second time.',
        timestamp: '1 month ago',
        likes: 31,
        userLiked: false
      },
      {
        id: 'sc9',
        user: { name: 'Olivia Johnson', avatar: 'https://i.pravatar.cc/150?img=38' },
        text: 'The way they connected everything to Breaking Bad was masterful.',
        timestamp: '2 months ago',
        likes: 45,
        userLiked: true
      },
      {
        id: 'sc10',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=42' },
        text: 'I cried at the finale. What a perfect ending to an incredible show.',
        timestamp: '2 months ago',
        likes: 56,
        userLiked: false
      },
      {
        id: 'sc11',
        user: { name: 'Lisa Park', avatar: 'https://i.pravatar.cc/150?img=44' },
        text: 'Howard deserved better but what a performance by Patrick Fabian.',
        timestamp: '2 months ago',
        likes: 38,
        userLiked: true
      },
      {
        id: 'sc12',
        user: { name: 'Chris Martinez', avatar: 'https://i.pravatar.cc/150?img=46' },
        text: 'Lalo Salamanca might be the best villain in the BB universe.',
        timestamp: '3 months ago',
        likes: 29,
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
            React Card 2: Because You Liked
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template B (No user header, no heart)
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
            badges={[BADGE_PRESETS.becauseYouLiked('Breaking Bad')]}
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
            Template B Differences
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ No user header (system recommendation)</li>
            <li>✓ Purple "Because you liked" badge</li>
            <li>✓ No heart button (no activity to like)</li>
            <li>✓ Plus + Share buttons only</li>
            <li>→ Back should work the same as Card 1</li>
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
          Card 2 of 8 | Template B | Been Watching
        </div>
      </div>
    </>
  )
}


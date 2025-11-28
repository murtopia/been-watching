/**
 * Mobile Test Page for React Card 4 (Coming Soon)
 * 
 * Purpose: Isolated test page for Template B UNRELEASED content card
 * URL: /preview/card-4
 * 
 * SPECIAL FEATURES (different from other Template B cards):
 * - Badge: "Coming Soon on [Date]" with clock icon
 * - Front: Bookmark + Bell buttons (NO + icon, NO heart)
 * - Back: Bookmark + Comment + Share + Bell (NO + quick action modal)
 * - Back: Only shows "Want to Watch" section (no Watching/Watched/Ratings)
 * 
 * This is for shows that haven't been released yet, so users can't
 * rate them or add to "Watching" or "Watched" lists.
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'

export default function Card4MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 4 - House of the Dragon S2 (coming soon)
  const sampleData: FeedCardData = {
    id: '4',
    media: {
      id: 'media-4',
      title: 'House of the Dragon',
      year: 2024,
      genres: ['Fantasy', 'Drama'],
      rating: 8.5, // Expected rating
      posterUrl: 'https://image.tmdb.org/t/p/original/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
      synopsis: 'The reign of House Targaryen begins with this prequel to Game of Thrones. Based on George R.R. Martin\'s Fire & Blood, the series chronicles the civil war within the Targaryen dynasty that would become known as the Dance of the Dragons.',
      creator: 'Ryan Condal & George R.R. Martin',
      cast: ['Matt Smith', 'Emma D\'Arcy', 'Olivia Cooke', 'Rhys Ifans'],
      network: 'HBO',
      season: 2,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'Emma Rodriguez', username: 'emmar', avatar: 'https://i.pravatar.cc/150?img=6' },
        { id: '3', name: 'Daniel Kim', username: 'dkim', avatar: 'https://i.pravatar.cc/150?img=7' }
      ],
      count: 5,
      text: '5 friends want to watch this'
    },
    stats: {
      likeCount: 0,
      commentCount: 8,
      userLiked: false
    },
    friendsActivity: {
      // For unreleased content, only wantToWatch is relevant
      watching: {
        count: 0,
        avatars: []
      },
      wantToWatch: {
        count: 24,
        avatars: [
          'https://i.pravatar.cc/150?img=6',
          'https://i.pravatar.cc/150?img=7',
          'https://i.pravatar.cc/150?img=8'
        ]
      },
      watched: {
        count: 0,
        avatars: []
      },
      ratings: {
        meh: 0,
        like: 0,
        love: 0,
        userRating: undefined
      }
    },
    comments: [],
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Emma Rodriguez', avatar: 'https://i.pravatar.cc/150?img=6' },
        text: 'Cannot WAIT for this season! The trailer looks incredible.',
        timestamp: '1 day ago',
        likes: 32,
        userLiked: true
      },
      {
        id: 'sc2',
        user: { name: 'Daniel Kim', avatar: 'https://i.pravatar.cc/150?img=7' },
        text: 'Finally! The Dance of the Dragons is about to begin.',
        timestamp: '2 days ago',
        likes: 28,
        userLiked: false
      },
      {
        id: 'sc3',
        user: { name: 'Sophie Martinez', avatar: 'https://i.pravatar.cc/150?img=10' },
        text: 'Season 1 was amazing. High hopes for this one!',
        timestamp: '3 days ago',
        likes: 19,
        userLiked: true
      },
      {
        id: 'sc4',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=14' },
        text: 'The book material for this season is insane. Get ready.',
        timestamp: '4 days ago',
        likes: 45,
        userLiked: false
      },
      {
        id: 'sc5',
        user: { name: 'Olivia Chen', avatar: 'https://i.pravatar.cc/150?img=18' },
        text: 'I\'ve set a reminder for the premiere date!',
        timestamp: '5 days ago',
        likes: 12,
        userLiked: true
      },
      {
        id: 'sc6',
        user: { name: 'Marcus Brown', avatar: 'https://i.pravatar.cc/150?img=22' },
        text: 'Daemon Targaryen is going to steal every scene again.',
        timestamp: '1 week ago',
        likes: 38,
        userLiked: false
      },
      {
        id: 'sc7',
        user: { name: 'Ava Thompson', avatar: 'https://i.pravatar.cc/150?img=26' },
        text: 'The costume design in this show is unmatched.',
        timestamp: '1 week ago',
        likes: 21,
        userLiked: true
      },
      {
        id: 'sc8',
        user: { name: 'Liam Garcia', avatar: 'https://i.pravatar.cc/150?img=30' },
        text: 'Counting down the days! This is going to be epic.',
        timestamp: '2 weeks ago',
        likes: 16,
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
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#A855F7',
            margin: '0'
          }}>
            React Card 4: Coming Soon
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template B + UNRELEASED back variant
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
            backVariant="unreleased"
            badges={[BADGE_PRESETS.comingSoon('May 5, 2026')]}
            data={sampleData}
            onShare={() => handleTrack('share')}
            onAddToWatchlist={() => handleTrack('add_to_want_to_watch')}
            onRemindMe={() => handleTrack('remind_me')}
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
            color: '#A855F7',
            margin: '0 0 8px 0'
          }}>
            Card 4 Special Features
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ Purple "Coming Soon on May 5, 2026" badge</li>
            <li>✓ Front: Bookmark + Bell (no + icon)</li>
            <li>→ Back: Bookmark instead of + icon</li>
            <li>→ Back: Only "Want to Watch" section</li>
            <li>→ Back: No ratings section (unreleased)</li>
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
          Card 4 of 8 | Template B (Unreleased) | Been Watching
        </div>
      </div>
    </>
  )
}


/**
 * Mobile Test Page for React Card 6 (Top 3 Update)
 * 
 * Purpose: Isolated test page for Template A Top 3 ranking activity
 * URL: /preview/card-6
 * 
 * Template A Features:
 * - User header (Alex Thompson)
 * - Heart action button
 * - Badge: "Added to #1 Top Show!" (gold)
 * - Side actions: Heart + Plus + Comment
 * - Standard back
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'

export default function Card6MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 6 - The Bear Season 2 (Top 3 update)
  const sampleData: FeedCardData = {
    id: '6',
    media: {
      id: 'media-6',
      title: 'The Bear',
      year: 2022,
      genres: ['Comedy', 'Drama'],
      rating: 8.6,
      posterUrl: 'https://image.tmdb.org/t/p/original/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
      synopsis: 'A young chef from the fine dining world returns to Chicago to run his family\'s Italian beef sandwich shop. Carmy struggles to transform the shop and himself, while working alongside a rough-around-the-edges kitchen crew.',
      creator: 'Christopher Storer',
      cast: ['Jeremy Allen White', 'Ayo Edebiri', 'Ebon Moss-Bachrach', 'Lionel Boyce'],
      network: 'FX/Hulu',
      season: 2,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'Ryan Miller', username: 'ryanm', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', name: 'Sophie Chen', username: 'sophiec', avatar: 'https://i.pravatar.cc/150?img=3' },
        { id: '4', name: 'Marcus Johnson', username: 'marcusj', avatar: 'https://i.pravatar.cc/150?img=4' }
      ],
      count: 8,
      text: '8 friends also loved this'
    },
    stats: {
      likeCount: 47,
      commentCount: 10,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: 6,
        avatars: [
          'https://i.pravatar.cc/150?img=6',
          'https://i.pravatar.cc/150?img=7',
          'https://i.pravatar.cc/150?img=8'
        ]
      },
      wantToWatch: {
        count: 19,
        avatars: [
          'https://i.pravatar.cc/150?img=10',
          'https://i.pravatar.cc/150?img=12',
          'https://i.pravatar.cc/150?img=14'
        ]
      },
      watched: {
        count: 24,
        avatars: [
          'https://i.pravatar.cc/150?img=16',
          'https://i.pravatar.cc/150?img=18',
          'https://i.pravatar.cc/150?img=20'
        ]
      },
      ratings: {
        meh: 1,
        like: 5,
        love: 18,
        userRating: undefined
      }
    },
    comments: [
      {
        id: 'c1',
        user: { name: 'Ryan Miller', avatar: 'https://i.pravatar.cc/150?img=2' },
        text: 'YES! Finally giving it the recognition it deserves 🔥',
        timestamp: '2h ago',
        likes: 12,
        userLiked: true
      },
      {
        id: 'c2',
        user: { name: 'Sophie Chen', avatar: 'https://i.pravatar.cc/150?img=3' },
        text: 'The forks episode changed me as a person',
        timestamp: '3h ago',
        likes: 8,
        userLiked: false
      },
      {
        id: 'c3',
        user: { name: 'Marcus Johnson', avatar: 'https://i.pravatar.cc/150?img=11' },
        text: 'About time! This show is a masterpiece.',
        timestamp: '4h ago',
        likes: 15,
        userLiked: false
      },
      {
        id: 'c4',
        user: { name: 'Emma Williams', avatar: 'https://i.pravatar.cc/150?img=15' },
        text: 'Richie\'s character development 😭',
        timestamp: '5h ago',
        likes: 22,
        userLiked: true
      },
      {
        id: 'c5',
        user: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?img=19' },
        text: 'Best show on TV right now, no contest.',
        timestamp: '6h ago',
        likes: 19,
        userLiked: false
      },
      {
        id: 'c6',
        user: { name: 'Olivia Martinez', avatar: 'https://i.pravatar.cc/150?img=23' },
        text: 'The anxiety I feel watching this show is unmatched 😅',
        timestamp: '7h ago',
        likes: 27,
        userLiked: true
      },
      {
        id: 'c7',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=27' },
        text: 'Sydney is the GOAT. That\'s it. That\'s the comment.',
        timestamp: '8h ago',
        likes: 31,
        userLiked: false
      },
      {
        id: 'c8',
        user: { name: 'Ava Thompson', avatar: 'https://i.pravatar.cc/150?img=31' },
        text: 'Convinced everyone at work to watch. You\'re welcome.',
        timestamp: '9h ago',
        likes: 14,
        userLiked: true
      },
      {
        id: 'c9',
        user: { name: 'Noah Garcia', avatar: 'https://i.pravatar.cc/150?img=35' },
        text: 'The soundtrack alone deserves its own award.',
        timestamp: '10h ago',
        likes: 18,
        userLiked: false
      },
      {
        id: 'c10',
        user: { name: 'Isabella Brown', avatar: 'https://i.pravatar.cc/150?img=39' },
        text: 'This show made me want to quit my job and become a chef.',
        timestamp: '11h ago',
        likes: 25,
        userLiked: true
      }
    ],
    showComments: [
      {
        id: 'sc1',
        user: { name: 'Marcus Johnson', avatar: 'https://i.pravatar.cc/150?img=11' },
        text: 'Jeremy Allen White deserved every award for this performance.',
        timestamp: '1h ago',
        likes: 67,
        userLiked: true
      },
      {
        id: 'sc2',
        user: { name: 'Emma Williams', avatar: 'https://i.pravatar.cc/150?img=15' },
        text: 'Season 2 is even better than the first. The Christmas episode!',
        timestamp: '3h ago',
        likes: 54,
        userLiked: false
      },
      {
        id: 'sc3',
        user: { name: 'David Park', avatar: 'https://i.pravatar.cc/150?img=19' },
        text: 'Richie\'s arc in this season is absolutely incredible.',
        timestamp: '5h ago',
        likes: 89,
        userLiked: true
      },
      {
        id: 'sc4',
        user: { name: 'Olivia Martinez', avatar: 'https://i.pravatar.cc/150?img=23' },
        text: 'Every episode feels like a masterclass in storytelling.',
        timestamp: '7h ago',
        likes: 41,
        userLiked: false
      },
      {
        id: 'sc5',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=27' },
        text: 'The way they use music in this show is perfect.',
        timestamp: '9h ago',
        likes: 33,
        userLiked: true
      },
      {
        id: 'sc6',
        user: { name: 'Ava Thompson', avatar: 'https://i.pravatar.cc/150?img=31' },
        text: 'I started watching this because of Alex\'s recommendation. No regrets!',
        timestamp: '12h ago',
        likes: 28,
        userLiked: false
      },
      {
        id: 'sc7',
        user: { name: 'Noah Garcia', avatar: 'https://i.pravatar.cc/150?img=35' },
        text: 'Sydney and Carmy\'s dynamic is everything.',
        timestamp: '1 day ago',
        likes: 45,
        userLiked: true
      },
      {
        id: 'sc8',
        user: { name: 'Isabella Brown', avatar: 'https://i.pravatar.cc/150?img=39' },
        text: 'This show makes me want to learn how to cook.',
        timestamp: '1 day ago',
        likes: 22,
        userLiked: false
      },
      {
        id: 'sc9',
        user: { name: 'Liam Chen', avatar: 'https://i.pravatar.cc/150?img=43' },
        text: 'Cousin forever.',
        timestamp: '2 days ago',
        likes: 76,
        userLiked: true
      },
      {
        id: 'sc10',
        user: { name: 'Mia Rodriguez', avatar: 'https://i.pravatar.cc/150?img=47' },
        text: 'The anxiety this show gives me is worth it for the payoff.',
        timestamp: '2 days ago',
        likes: 31,
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
          background: 'rgba(255, 215, 0, 0.15)',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#B8860B',
            margin: '0'
          }}>
            React Card 6: Top 3 Update
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(0,0,0,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template A (User activity)
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
            variant="a"
            backVariant="standard"
            badges={[BADGE_PRESETS.top3Update(1)]}
            data={sampleData}
            user={{
              id: 'user-alex',
              name: 'Alex Thompson',
              username: 'alexthompson',
              avatar: 'https://i.pravatar.cc/150?img=9'
            }}
            timestamp="5 hours ago"
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
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#B8860B',
            margin: '0 0 8px 0'
          }}>
            Card 6 Specifics
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(0,0,0,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ Gold "Added to #1 Top Show!" badge</li>
            <li>✓ User: Alex Thompson</li>
            <li>✓ Show: The Bear S2</li>
            <li>✓ Template A (header, heart, comments)</li>
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
          Card 6 of 8 | Template A | Been Watching
        </div>
      </div>
    </>
  )
}


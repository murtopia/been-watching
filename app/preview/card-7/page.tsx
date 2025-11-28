/**
 * Mobile Test Page for React Card 7 (Follow Suggestions)
 * 
 * Purpose: Isolated test page for Template C - user suggestions carousel
 * URL: /preview/card-7
 * 
 * Template C Features:
 * - Completely different from media cards
 * - Gold glassmorphic container
 * - Carousel of user profile suggestions
 * - Match percentage, bio, stats, friends in common
 * - Follow button with toggle state
 * - Swipe navigation + dot indicators
 */

'use client'

import { useState } from 'react'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'

export default function Card7MobileTestPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Sample data for Card 7 - User suggestions
  const suggestions = [
    {
      id: 'user-jamie',
      name: 'Jamie Chen',
      username: 'jamiechen',
      avatar: 'https://i.pravatar.cc/150?img=10',
      matchPercentage: 92,
      bio: 'Drama enthusiast who loves binge-watching award-winning shows and tracking every major film festival. Always looking for the next critically acclaimed series to obsess over!',
      stats: {
        wantToWatch: 5,
        watching: 14,
        watched: 187
      },
      friendsInCommon: {
        count: 8,
        avatars: [
          'https://i.pravatar.cc/150?img=2',
          'https://i.pravatar.cc/150?img=3',
          'https://i.pravatar.cc/150?img=4'
        ]
      }
    },
    {
      id: 'user-marcus',
      name: 'Marcus Rodriguez',
      username: 'marcusr',
      avatar: 'https://i.pravatar.cc/150?img=11',
      matchPercentage: 88,
      bio: 'Sci-fi nerd • Binge-watcher extraordinaire',
      stats: {
        wantToWatch: 12,
        watching: 8,
        watched: 243
      },
      friendsInCommon: {
        count: 5,
        avatars: [
          'https://i.pravatar.cc/150?img=5',
          'https://i.pravatar.cc/150?img=6',
          'https://i.pravatar.cc/150?img=7'
        ]
      }
    },
    {
      id: 'user-priya',
      name: 'Priya Patel',
      username: 'priyap',
      avatar: 'https://i.pravatar.cc/150?img=12',
      matchPercentage: 85,
      bio: 'Crime drama devotee • True story fanatic',
      stats: {
        wantToWatch: 8,
        watching: 6,
        watched: 156
      },
      friendsInCommon: {
        count: 11,
        avatars: [
          'https://i.pravatar.cc/150?img=8',
          'https://i.pravatar.cc/150?img=9',
          'https://i.pravatar.cc/150?img=14'
        ]
      }
    },
    {
      id: 'user-alex',
      name: 'Alex Thompson',
      username: 'alexthompson',
      avatar: 'https://i.pravatar.cc/150?img=13',
      matchPercentage: 81,
      bio: 'Comedy buff • Reality TV guilty pleasure',
      stats: {
        wantToWatch: 15,
        watching: 11,
        watched: 198
      },
      friendsInCommon: {
        count: 6,
        avatars: [
          'https://i.pravatar.cc/150?img=15',
          'https://i.pravatar.cc/150?img=16',
          'https://i.pravatar.cc/150?img=17'
        ]
      }
    }
  ]

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
        background: '#1a1a1a',
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
            color: '#FFD700',
            margin: '0'
          }}>
            React Card 7: Find New Friends
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            margin: '4px 0 0 0'
          }}>
            Template C (User suggestions carousel)
          </p>
        </div>

        {/* The Card */}
        <div style={{
          width: '100%',
          maxWidth: '398px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <FollowSuggestionsCard
            suggestions={suggestions}
            onFollow={(userId) => handleTrack('follow_toggle', { userId })}
            onUserClick={(userId) => handleTrack('user_click', { userId })}
            onTrack={handleTrack}
          />
        </div>

        {/* Test Checklist */}
        <div style={{
          width: '100%',
          maxWidth: '398px',
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#FFD700',
            margin: '0 0 8px 0'
          }}>
            Card 7 Specifics
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: '1.8'
          }}>
            <li>✓ Gold glassmorphic container</li>
            <li>✓ "Find New Friends" badge</li>
            <li>✓ Carousel with 4 user profiles</li>
            <li>✓ Swipe left/right to navigate</li>
            <li>✓ Follow button toggles state</li>
            <li>✓ Match %, bio, stats, mutual friends</li>
          </ul>
        </div>

        {/* Tracking Log Toggle */}
        <button
          onClick={() => setShowLog(!showLog)}
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.7)',
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
          color: 'rgba(255,255,255,0.4)'
        }}>
          Card 7 of 8 | Template C | Been Watching
        </div>
      </div>
    </>
  )
}


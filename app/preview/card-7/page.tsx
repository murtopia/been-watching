'use client'

import React, { useState } from 'react'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'

// Mock data for testing the Find New Friends card
const MOCK_SUGGESTIONS = [
  {
    id: 'test-1',
    name: 'Alex Thompson',
    username: 'alexthompson',
    avatar: '',
    matchPercentage: 92,
    bio: 'Horror movie enthusiast 🎬 Always looking for the next great scare!',
    stats: {
      wantToWatch: 15,
      watching: 3,
      watched: 47
    },
    friendsInCommon: {
      count: 5,
      avatars: []
    }
  },
  {
    id: 'test-2',
    name: 'Jordan Rivera',
    username: 'jordanr',
    avatar: '',
    matchPercentage: 87,
    bio: 'Binge-watching expert. Currently obsessed with true crime docs.',
    stats: {
      wantToWatch: 23,
      watching: 2,
      watched: 89
    },
    friendsInCommon: {
      count: 3,
      avatars: []
    }
  },
  {
    id: 'test-3',
    name: 'Sam Chen',
    username: 'samchen',
    avatar: '',
    matchPercentage: 81,
    bio: 'Sci-fi nerd and anime lover. Lets talk about your favorite shows!',
    stats: {
      wantToWatch: 45,
      watching: 5,
      watched: 120
    },
    friendsInCommon: {
      count: 8,
      avatars: []
    }
  },
  {
    id: 'test-4',
    name: 'Taylor Kim',
    username: 'taylork',
    avatar: '',
    matchPercentage: 78,
    bio: 'Comedy is my therapy. Also love a good drama that makes me cry.',
    stats: {
      wantToWatch: 12,
      watching: 1,
      watched: 65
    },
    friendsInCommon: {
      count: 2,
      avatars: []
    }
  }
]

export default function Card7PreviewPage() {
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS)
  const [followed, setFollowed] = useState<string[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])

  const handleFollow = (userId: string) => {
    console.log('Follow:', userId)
    setFollowed(prev => [...prev, userId])
    setSuggestions(prev => prev.filter(s => s.id !== userId))
  }

  const handleDismiss = (userId: string) => {
    console.log('Dismiss:', userId)
    setDismissed(prev => [...prev, userId])
    setSuggestions(prev => prev.filter(s => s.id !== userId))
  }

  const resetCard = () => {
    setSuggestions(MOCK_SUGGESTIONS)
    setFollowed([])
    setDismissed([])
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a1a', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '10px' }}>
        Card 7: Find New Friends Preview
      </h1>
      
      <div style={{ 
        color: 'rgba(255,255,255,0.7)', 
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '400px',
        marginBottom: '10px'
      }}>
        Test the Follow and <strong>X (dismiss)</strong> buttons. 
        The X button is to the right of the Follow button.
      </div>

      {suggestions.length > 0 ? (
        <FollowSuggestionsCard
          suggestions={suggestions}
          colorTheme="purple"
          onFollow={handleFollow}
          onDismiss={handleDismiss}
          onUserClick={(userId) => console.log('Click user:', userId)}
          onTrack={(action, meta) => console.log('Track:', action, meta)}
        />
      ) : (
        <div style={{
          width: '398px',
          height: '420px',
          background: 'rgba(139, 92, 246, 0.2)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ fontSize: '48px' }}>✓</div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>All done!</div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            You followed {followed.length} and dismissed {dismissed.length}
          </div>
        </div>
      )}

      <button
        onClick={resetCard}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Reset Card
      </button>

      <div style={{ 
        color: 'rgba(255,255,255,0.5)', 
        fontSize: '12px',
        marginTop: '20px'
      }}>
        <div>Followed: {followed.join(', ') || 'none'}</div>
        <div>Dismissed: {dismissed.join(', ') || 'none'}</div>
      </div>
    </div>
  )
}

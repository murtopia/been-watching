'use client'

/**
 * Dev preview for FriendDigestCard with mock data.
 */

import React from 'react'
import FriendDigestCard from '@/components/feed/FriendDigestCard'
import type { FriendDigest } from '@/lib/feed/types'

const mockDigest: FriendDigest = {
  user: {
    id: 'mock-user',
    username: 'taylormurto',
    display_name: 'Taylor Murto',
    avatar_url: null
  },
  periodLabel: 'This week',
  items: [
    {
      mediaId: 'tv-299167-s1',
      tmdbId: 299167,
      title: 'Dutton Ranch - Season 1',
      posterPath: '/aX9YIYUlSuAxRSdvUvbLnR69B8u.jpg',
      mediaType: 'tv',
      action: 'loved',
      rating: 'love',
      status: 'watched',
      lastActivityAt: new Date().toISOString(),
      commentCount: 0,
      season: 1,
      overview: '',
      year: 2026,
      genres: ['Drama', 'Western'],
      voteAverage: 8.2
    },
    {
      mediaId: 'tv-219971-s2',
      tmdbId: 219971,
      title: 'The Agency - Season 2',
      posterPath: '/1DUwWSEt5UDzKuv3s9c3jbUCB1e.jpg',
      mediaType: 'tv',
      action: 'loved',
      rating: 'love',
      status: 'watched',
      lastActivityAt: new Date().toISOString(),
      commentCount: 2,
      season: 2,
      overview: '',
      year: 2026,
      genres: ['Drama', 'Thriller'],
      voteAverage: 7.8
    },
    {
      mediaId: 'tv-136315-s5',
      tmdbId: 136315,
      title: 'The Bear - Season 5',
      posterPath: '/8I37Nt7iUXVH6BMFXxaGmiSJ988.jpg',
      mediaType: 'tv',
      action: 'watched',
      rating: null,
      status: 'watched',
      lastActivityAt: new Date().toISOString(),
      commentCount: 0,
      season: 5,
      overview: '',
      year: 2026,
      genres: ['Drama', 'Comedy'],
      voteAverage: 8.1
    },
    {
      mediaId: 'movie-668489',
      tmdbId: 668489,
      title: 'Havoc',
      posterPath: '/r9yBjbmuAP8OrgKr1lWO2hWEXKb.jpg',
      mediaType: 'movie',
      action: 'watching',
      rating: null,
      status: 'watching',
      lastActivityAt: new Date().toISOString(),
      commentCount: 0,
      season: null,
      overview: '',
      year: 2025,
      genres: ['Action'],
      voteAverage: 6.6
    }
  ],
  totals: { rated: 2, statusChanges: 4 },
  lastActivityAt: new Date().toISOString()
}

export default function DigestCardPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
      <FriendDigestCard
        digest={mockDigest}
        onShowClick={(item) => console.log('show click', item.mediaId)}
        onUserClick={(id, username) => console.log('user click', username)}
      />
    </div>
  )
}

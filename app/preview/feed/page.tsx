/**
 * Preview Feed Page
 * 
 * Purpose: Test all 8 card types in a scrollable feed
 * URL: /preview/feed
 * 
 * This simulates the real activity feed with mock data,
 * mixing different card types to test the overall experience.
 */

'use client'

import { useState } from 'react'
import { FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'

// ============================================================================
// Mock Data for All Card Types
// ============================================================================

// Card 1: User Activity - Loved
const card1Data: FeedCardData = {
  id: '1',
  media: {
    id: 'media-1',
    title: 'Breaking Bad',
    year: 2008,
    genres: ['Crime', 'Drama', 'Thriller'],
    rating: 9.5,
    posterUrl: 'https://image.tmdb.org/t/p/original/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    synopsis: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family\'s future.',
    creator: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
    network: 'AMC',
    season: 5,
    mediaType: 'TV'
  },
  friends: {
    avatars: [
      { id: '2', name: 'Sarah Chen', username: 'sarahc', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: '3', name: 'Mike Johnson', username: 'mikej', avatar: 'https://i.pravatar.cc/150?img=8' },
      { id: '4', name: 'Emma Wilson', username: 'emmaw', avatar: 'https://i.pravatar.cc/150?img=9' }
    ],
    count: 8,
    text: '8 friends also loved this'
  },
  stats: { likeCount: 24, commentCount: 8, userLiked: false },
  friendsActivity: {
    watching: { count: 3, avatars: ['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3'] },
    wantToWatch: { count: 12, avatars: ['https://i.pravatar.cc/150?img=4', 'https://i.pravatar.cc/150?img=5', 'https://i.pravatar.cc/150?img=6'] },
    watched: { count: 8, avatars: ['https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=9'] },
    ratings: { meh: 1, like: 3, love: 12, userRating: undefined }
  },
  comments: [
    { id: 'c1', user: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=5' }, text: 'One of the best shows ever made! 🔥', timestamp: '2h ago', likes: 12, userLiked: true },
    { id: 'c2', user: { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=8' }, text: 'The character development is insane', timestamp: '3h ago', likes: 8, userLiked: false },
  ],
  showComments: [
    { id: 'sc1', user: { name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=9' }, text: 'Walter White is the greatest TV character of all time.', timestamp: '1h ago', likes: 45, userLiked: true },
    { id: 'sc2', user: { name: 'James Lee', avatar: 'https://i.pravatar.cc/150?img=11' }, text: 'I\'m rewatching for the 5th time!', timestamp: '4h ago', likes: 23, userLiked: false },
  ],
}

// Card 2: Because You Liked
const card2Data: FeedCardData = {
  id: '2',
  media: {
    id: 'media-2',
    title: 'The Wire',
    year: 2002,
    genres: ['Crime', 'Drama', 'Thriller'],
    rating: 9.3,
    posterUrl: 'https://image.tmdb.org/t/p/original/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
    synopsis: 'Told from the points of view of both the police and their targets, this series captures a dark and detailed vision of Baltimore.',
    creator: 'David Simon',
    cast: ['Dominic West', 'Idris Elba', 'Michael K. Williams'],
    network: 'HBO',
    season: 5,
    mediaType: 'TV'
  },
  friends: {
    avatars: [{ id: '5', name: 'Alex Kim', username: 'alexk', avatar: 'https://i.pravatar.cc/150?img=12' }],
    count: 5,
    text: '5 friends watched this'
  },
  stats: { likeCount: 0, commentCount: 12, userLiked: false },
  friendsActivity: {
    watching: { count: 2, avatars: ['https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=11'] },
    wantToWatch: { count: 18, avatars: ['https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=14'] },
    watched: { count: 9, avatars: ['https://i.pravatar.cc/150?img=15', 'https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=17'] },
    ratings: { meh: 2, like: 5, love: 8, userRating: undefined }
  },
  comments: [],
  showComments: [
    { id: 'sc1', user: { name: 'Ryan Davis', avatar: 'https://i.pravatar.cc/150?img=18' }, text: 'If you loved Breaking Bad, this is your next obsession.', timestamp: '2h ago', likes: 34, userLiked: true },
  ],
}

// Card 3: Your Friends Loved
const card3Data: FeedCardData = {
  id: '3',
  media: {
    id: 'media-3',
    title: 'Succession',
    year: 2018,
    genres: ['Drama'],
    rating: 8.9,
    posterUrl: 'https://image.tmdb.org/t/p/original/7HW47XbkNQ5fiwQFYGWdw9gs144.jpg',
    synopsis: 'The Roy family – known for controlling the biggest media and entertainment company – is considering their future once the aging family patriarch begins to step back.',
    creator: 'Jesse Armstrong',
    cast: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook', 'Kieran Culkin'],
    network: 'HBO',
    season: 4,
    mediaType: 'TV'
  },
  friends: {
    avatars: [
      { id: '6', name: 'Sophie Turner', username: 'sophiet', avatar: 'https://i.pravatar.cc/150?img=20' },
      { id: '7', name: 'Chris Evans', username: 'chrise', avatar: 'https://i.pravatar.cc/150?img=21' },
    ],
    count: 12,
    text: '12 friends loved this'
  },
  stats: { likeCount: 0, commentCount: 8, userLiked: false },
  friendsActivity: {
    watching: { count: 5, avatars: ['https://i.pravatar.cc/150?img=22', 'https://i.pravatar.cc/150?img=23', 'https://i.pravatar.cc/150?img=24'] },
    wantToWatch: { count: 22, avatars: ['https://i.pravatar.cc/150?img=25', 'https://i.pravatar.cc/150?img=26', 'https://i.pravatar.cc/150?img=27'] },
    watched: { count: 15, avatars: ['https://i.pravatar.cc/150?img=28', 'https://i.pravatar.cc/150?img=29', 'https://i.pravatar.cc/150?img=30'] },
    ratings: { meh: 0, like: 4, love: 20, userRating: undefined }
  },
  comments: [],
  showComments: [
    { id: 'sc1', user: { name: 'Nina Patel', avatar: 'https://i.pravatar.cc/150?img=31' }, text: 'The writing on this show is unmatched.', timestamp: '5h ago', likes: 56, userLiked: false },
  ],
}

// Card 4: Coming Soon
const card4Data: FeedCardData = {
  id: '4',
  media: {
    id: 'media-4',
    title: 'Stranger Things',
    year: 2025,
    genres: ['Sci-Fi', 'Horror', 'Drama'],
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/original/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
    synopsis: 'The final chapter. When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    creator: 'The Duffer Brothers',
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
    network: 'Netflix',
    season: 5,
    mediaType: 'TV'
  },
  friends: {
    avatars: [{ id: '8', name: 'Tom Hardy', username: 'tomh', avatar: 'https://i.pravatar.cc/150?img=32' }],
    count: 28,
    text: '28 friends want to watch'
  },
  stats: { likeCount: 0, commentCount: 0, userLiked: false },
  friendsActivity: {
    watching: { count: 0, avatars: [] },
    wantToWatch: { count: 45, avatars: ['https://i.pravatar.cc/150?img=33', 'https://i.pravatar.cc/150?img=34', 'https://i.pravatar.cc/150?img=35'] },
    watched: { count: 0, avatars: [] },
    ratings: { meh: 0, like: 0, love: 0, userRating: undefined }
  },
  comments: [],
  showComments: [],
}

// Card 5: Now Streaming
const card5Data: FeedCardData = {
  id: '5',
  media: {
    id: 'media-5',
    title: 'Dune: Part Two',
    year: 2024,
    genres: ['Sci-Fi', 'Adventure'],
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    creator: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    network: 'Max',
    mediaType: 'Movie'
  },
  friends: {
    avatars: [{ id: '9', name: 'Zoe Quinn', username: 'zoeq', avatar: 'https://i.pravatar.cc/150?img=36' }],
    count: 6,
    text: '6 friends watched this'
  },
  stats: { likeCount: 0, commentCount: 14, userLiked: false },
  friendsActivity: {
    watching: { count: 8, avatars: ['https://i.pravatar.cc/150?img=37', 'https://i.pravatar.cc/150?img=38', 'https://i.pravatar.cc/150?img=39'] },
    wantToWatch: { count: 32, avatars: ['https://i.pravatar.cc/150?img=40', 'https://i.pravatar.cc/150?img=41', 'https://i.pravatar.cc/150?img=42'] },
    watched: { count: 18, avatars: ['https://i.pravatar.cc/150?img=43', 'https://i.pravatar.cc/150?img=44', 'https://i.pravatar.cc/150?img=45'] },
    ratings: { meh: 1, like: 6, love: 25, userRating: undefined }
  },
  comments: [],
  showComments: [
    { id: 'sc1', user: { name: 'Leo Martinez', avatar: 'https://i.pravatar.cc/150?img=46' }, text: 'Finally on streaming! Visual masterpiece.', timestamp: '1h ago', likes: 67, userLiked: true },
  ],
}

// Card 6: Top 3 Update
const card6Data: FeedCardData = {
  id: '6',
  media: {
    id: 'media-6',
    title: 'The Bear',
    year: 2022,
    genres: ['Comedy', 'Drama'],
    rating: 8.6,
    posterUrl: 'https://image.tmdb.org/t/p/original/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg',
    synopsis: 'A young chef from the fine dining world returns to Chicago to run his family\'s Italian beef sandwich shop.',
    creator: 'Christopher Storer',
    cast: ['Jeremy Allen White', 'Ayo Edebiri', 'Ebon Moss-Bachrach'],
    network: 'FX/Hulu',
    season: 2,
    mediaType: 'TV'
  },
  friends: {
    avatars: [
      { id: '10', name: 'Ava Chen', username: 'avac', avatar: 'https://i.pravatar.cc/150?img=47' },
      { id: '11', name: 'Marcus Lee', username: 'marcusl', avatar: 'https://i.pravatar.cc/150?img=48' },
    ],
    count: 8,
    text: '8 friends also loved this'
  },
  stats: { likeCount: 47, commentCount: 10, userLiked: false },
  friendsActivity: {
    watching: { count: 6, avatars: ['https://i.pravatar.cc/150?img=49', 'https://i.pravatar.cc/150?img=50', 'https://i.pravatar.cc/150?img=51'] },
    wantToWatch: { count: 19, avatars: ['https://i.pravatar.cc/150?img=52', 'https://i.pravatar.cc/150?img=53', 'https://i.pravatar.cc/150?img=54'] },
    watched: { count: 24, avatars: ['https://i.pravatar.cc/150?img=55', 'https://i.pravatar.cc/150?img=56', 'https://i.pravatar.cc/150?img=57'] },
    ratings: { meh: 1, like: 5, love: 18, userRating: undefined }
  },
  comments: [
    { id: 'c1', user: { name: 'Ava Chen', avatar: 'https://i.pravatar.cc/150?img=47' }, text: 'Finally! This show is incredible 🔥', timestamp: '1h ago', likes: 15, userLiked: true },
  ],
  showComments: [
    { id: 'sc1', user: { name: 'Jordan Kim', avatar: 'https://i.pravatar.cc/150?img=58' }, text: 'Best show on TV right now.', timestamp: '3h ago', likes: 42, userLiked: false },
  ],
}

// Card 8: You Might Like
const card8Data: FeedCardData = {
  id: '8',
  media: {
    id: 'media-8',
    title: 'Better Call Saul',
    year: 2022,
    genres: ['Crime', 'Drama'],
    rating: 9.0,
    posterUrl: 'https://image.tmdb.org/t/p/original/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
    synopsis: 'Six years before Saul Goodman meets Walter White. The man who will become Saul Goodman is known as Jimmy McGill.',
    creator: 'Vince Gilligan',
    cast: ['Bob Odenkirk', 'Rhea Seehorn', 'Jonathan Banks'],
    network: 'AMC',
    season: 6,
    mediaType: 'TV'
  },
  friends: {
    avatars: [{ id: '12', name: 'Sam Wilson', username: 'samw', avatar: 'https://i.pravatar.cc/150?img=59' }],
    count: 2,
    text: '2 friends loved this'
  },
  stats: { likeCount: 0, commentCount: 14, userLiked: false },
  friendsActivity: {
    watching: { count: 3, avatars: ['https://i.pravatar.cc/150?img=60', 'https://i.pravatar.cc/150?img=61', 'https://i.pravatar.cc/150?img=62'] },
    wantToWatch: { count: 22, avatars: ['https://i.pravatar.cc/150?img=63', 'https://i.pravatar.cc/150?img=64', 'https://i.pravatar.cc/150?img=65'] },
    watched: { count: 18, avatars: ['https://i.pravatar.cc/150?img=66', 'https://i.pravatar.cc/150?img=67', 'https://i.pravatar.cc/150?img=68'] },
    ratings: { meh: 0, like: 4, love: 36, userRating: undefined }
  },
  comments: [],
  showComments: [
    { id: 'sc1', user: { name: 'Diana Ross', avatar: 'https://i.pravatar.cc/150?img=69' }, text: 'Better than Breaking Bad. I said what I said.', timestamp: '6h ago', likes: 89, userLiked: true },
  ],
}

// Card 7: Follow Suggestions
const followSuggestions = [
  {
    id: 'user-jamie',
    name: 'Jamie Chen',
    username: 'jamiechen',
    avatar: 'https://i.pravatar.cc/150?img=10',
    matchPercentage: 92,
    bio: 'Drama enthusiast who loves binge-watching award-winning shows.',
    stats: { wantToWatch: 5, watching: 14, watched: 187 },
    friendsInCommon: { count: 8, avatars: ['https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3', 'https://i.pravatar.cc/150?img=4'] }
  },
  {
    id: 'user-marcus',
    name: 'Marcus Rodriguez',
    username: 'marcusr',
    avatar: 'https://i.pravatar.cc/150?img=11',
    matchPercentage: 88,
    bio: 'Sci-fi nerd • Binge-watcher extraordinaire',
    stats: { wantToWatch: 12, watching: 8, watched: 243 },
    friendsInCommon: { count: 5, avatars: ['https://i.pravatar.cc/150?img=5', 'https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7'] }
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    username: 'priyap',
    avatar: 'https://i.pravatar.cc/150?img=12',
    matchPercentage: 85,
    bio: 'Crime drama devotee • True story fanatic',
    stats: { wantToWatch: 8, watching: 6, watched: 156 },
    friendsInCommon: { count: 11, avatars: ['https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=9', 'https://i.pravatar.cc/150?img=14'] }
  },
]

// ============================================================================
// Feed Item Type Definition
// ============================================================================

type FeedItem = 
  | { type: 'card1'; data: FeedCardData; user: { id: string; name: string; username: string; avatar: string }; timestamp: string }
  | { type: 'card2'; data: FeedCardData }
  | { type: 'card3'; data: FeedCardData }
  | { type: 'card4'; data: FeedCardData }
  | { type: 'card5'; data: FeedCardData }
  | { type: 'card6'; data: FeedCardData; user: { id: string; name: string; username: string; avatar: string }; timestamp: string }
  | { type: 'card7' }
  | { type: 'card8'; data: FeedCardData }

// ============================================================================
// Main Component
// ============================================================================

export default function PreviewFeedPage() {
  const [trackingLog, setTrackingLog] = useState<string[]>([])

  const handleTrack = (action: string, metadata?: any) => {
    const log = `[${new Date().toLocaleTimeString()}] ${action}: ${JSON.stringify(metadata || {})}`
    setTrackingLog((prev) => [log, ...prev].slice(0, 50))
    console.log('Track:', action, metadata)
  }

  // Define feed order - mix of all card types
  const feedItems: FeedItem[] = [
    { type: 'card1', data: card1Data, user: { id: 'u1', name: 'Jessica Parker', username: 'jessicap', avatar: 'https://i.pravatar.cc/150?img=1' }, timestamp: '2 hours ago' },
    { type: 'card2', data: card2Data },
    { type: 'card6', data: card6Data, user: { id: 'u2', name: 'Alex Thompson', username: 'alexthompson', avatar: 'https://i.pravatar.cc/150?img=9' }, timestamp: '5 hours ago' },
    { type: 'card3', data: card3Data },
    { type: 'card7' },
    { type: 'card5', data: card5Data },
    { type: 'card4', data: card4Data },
    { type: 'card8', data: card8Data },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Preview Feed
        </h1>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          8 card types • Scroll to explore
        </div>
      </div>

      {/* Feed */}
      <div style={{
        maxWidth: '420px',
        margin: '0 auto',
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {feedItems.map((item, index) => {
          switch (item.type) {
            case 'card1':
              return (
                <div key={index}>
                  <FeedCard
                    variant="a"
                    backVariant="standard"
                    badges={[BADGE_PRESETS.loved]}
                    data={item.data}
                    user={item.user}
                    timestamp={item.timestamp}
                    onLike={() => handleTrack('like', { card: 1 })}
                    onComment={() => handleTrack('comment', { card: 1 })}
                    onShare={() => handleTrack('share', { card: 1 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card2':
              return (
                <div key={index}>
                  <FeedCard
                    variant="b"
                    backVariant="standard"
                    badges={[BADGE_PRESETS.becauseYouLiked('Breaking Bad')]}
                    data={item.data}
                    onShare={() => handleTrack('share', { card: 2 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card3':
              return (
                <div key={index}>
                  <FeedCard
                    variant="b"
                    backVariant="standard"
                    badges={[BADGE_PRESETS.friendsLoved]}
                    data={item.data}
                    onShare={() => handleTrack('share', { card: 3 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card4':
              return (
                <div key={index}>
                  <FeedCard
                    variant="b"
                    backVariant="unreleased"
                    badges={[BADGE_PRESETS.comingSoon('July 2025')]}
                    data={item.data}
                    onShare={() => handleTrack('share', { card: 4 })}
                    onRemindMe={() => handleTrack('remind_me', { card: 4 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card5':
              return (
                <div key={index}>
                  <FeedCard
                    variant="b"
                    backVariant="standard"
                    badges={[BADGE_PRESETS.nowStreaming('Max')]}
                    data={item.data}
                    onShare={() => handleTrack('share', { card: 5 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card6':
              return (
                <div key={index}>
                  <FeedCard
                    variant="a"
                    backVariant="standard"
                    badges={[BADGE_PRESETS.top3Update(1)]}
                    data={item.data}
                    user={item.user}
                    timestamp={item.timestamp}
                    onLike={() => handleTrack('like', { card: 6 })}
                    onComment={() => handleTrack('comment', { card: 6 })}
                    onShare={() => handleTrack('share', { card: 6 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card7':
              return (
                <div key={index}>
                  <FollowSuggestionsCard
                    suggestions={followSuggestions}
                    colorTheme="gold"
                    autoRotateInterval={6000}
                    onFollow={(userId) => handleTrack('follow', { userId })}
                    onUserClick={(userId) => handleTrack('user_click', { userId })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            case 'card8':
              return (
                <div key={index}>
                  <FeedCard
                    variant="b"
                    backVariant="standard"
                    badges={[BADGE_PRESETS.youMightLike]}
                    data={item.data}
                    onShare={() => handleTrack('share', { card: 8 })}
                    onTrack={handleTrack}
                  />
                </div>
              )
            default:
              return null
          }
        })}

        {/* End of Feed */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          You're all caught up! 🎉
        </div>
      </div>
    </div>
  )
}


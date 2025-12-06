/**
 * Preview Feed V2 - Complete 8-Card Test Feed
 * 
 * Purpose: Test all 8 card types in a scrollable feed with scroll-snap
 * URL: /preview/feed-v2
 * 
 * Cards:
 * 1. User Activity (Template A) - Breaking Bad
 * 2. Because You Liked (Template B) - Better Call Saul
 * 3. Your Friends Loved (Template B) - The Last of Us
 * 4. Coming Soon (Template B, unreleased) - House of the Dragon
 * 5. Now Streaming (Template B) - Dune: Part Two
 * 6. Top 3 Update (Template A) - The Bear
 * 7. Find New Friends (Template C) - User Suggestions
 * 8. You Might Like (Template B) - Better Call Saul
 */

'use client'

import React from 'react'
import { UserActivityCard, UserActivityCardData, FeedCard, FeedCardData, BADGE_PRESETS } from '@/components/feed/UserActivityCard'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'

export default function PreviewFeedV2Page() {
  const handleTrack = (action: string, metadata?: any) => {
    console.log('Track:', action, metadata)
  }

  // ============================================================================
  // CARD 1: User Activity (Template A) - Breaking Bad
  // ============================================================================
  const card1Data: UserActivityCardData = {
    id: '1',
    timestamp: '2 hours ago',
    user: {
      id: 'user-1',
      name: 'Sarah Miller',
      username: 'sarahmiller',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    activityType: 'loved',
    activityBadges: [
      { text: 'Loved', color: 'rgba(255, 59, 92, 0.25)', borderColor: 'rgba(255, 59, 92, 0.5)', textColor: 'white' },
      { text: 'Currently Watching', color: 'rgba(59, 130, 246, 0.25)', borderColor: 'rgba(59, 130, 246, 0.5)', textColor: 'white' }
    ],
    media: {
      id: 'media-1',
      title: 'Breaking Bad',
      year: 2012,
      genres: ['Crime', 'Drama'],
      rating: 9.5,
      posterUrl: 'https://image.tmdb.org/t/p/original/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
      synopsis: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      creator: 'Vince Gilligan',
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
      network: 'AMC',
      season: 5,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' },
        { id: '4', name: 'Mike Wilson', username: 'mikewilson', avatar: 'https://i.pravatar.cc/150?img=33' }
      ],
      count: 8,
      text: '8 friends also loved this'
    },
    stats: { likeCount: 24, commentCount: 8, userLiked: false },
    friendsActivity: {
      watching: { count: 8, avatars: ['https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=20', 'https://i.pravatar.cc/150?img=33'] },
      wantToWatch: { count: 12, avatars: ['https://i.pravatar.cc/150?img=15', 'https://i.pravatar.cc/150?img=25', 'https://i.pravatar.cc/150?img=35'] },
      watched: { count: 42, avatars: ['https://i.pravatar.cc/150?img=40', 'https://i.pravatar.cc/150?img=45', 'https://i.pravatar.cc/150?img=50'] },
      ratings: { meh: 5, like: 23, love: 48, userRating: undefined }
    },
    comments: [
      { id: 'c1', user: { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=5' }, text: 'This finale was absolutely incredible!', timestamp: '1h ago', likes: 8, userLiked: true },
      { id: 'c2', user: { name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?img=6' }, text: 'Can\'t believe it\'s over. What a ride! 🎬', timestamp: '45m ago', likes: 3, userLiked: false },
      { id: 'c3', user: { name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?img=7' }, text: 'Best show ever made. Period.', timestamp: '2h ago', likes: 12, userLiked: true },
      { id: 'c4', user: { name: 'Jordan Martinez', avatar: 'https://i.pravatar.cc/150?img=8' }, text: 'The cinematography is unreal 📷', timestamp: '2h ago', likes: 5, userLiked: false },
      { id: 'c5', user: { name: 'Sam Taylor', avatar: 'https://i.pravatar.cc/150?img=9' }, text: 'Rewatching for the 5th time!', timestamp: '3h ago', likes: 7, userLiked: true },
      { id: 'c6', user: { name: 'Casey Brown', avatar: 'https://i.pravatar.cc/150?img=10' }, text: 'The tension in every episode is perfect', timestamp: '3h ago', likes: 9, userLiked: false },
      { id: 'c7', user: { name: 'Morgan Lee', avatar: 'https://i.pravatar.cc/150?img=11' }, text: 'Vince Gilligan is a genius', timestamp: '4h ago', likes: 15, userLiked: true },
      { id: 'c8', user: { name: 'Riley Kim', avatar: 'https://i.pravatar.cc/150?img=12' }, text: 'Started watching because of this post!', timestamp: '4h ago', likes: 4, userLiked: false },
      { id: 'c9', user: { name: 'Drew Anderson', avatar: 'https://i.pravatar.cc/150?img=13' }, text: 'The character arcs are incredible', timestamp: '5h ago', likes: 11, userLiked: true },
      { id: 'c10', user: { name: 'Quinn Roberts', avatar: 'https://i.pravatar.cc/150?img=14' }, text: 'Still holds up after all these years', timestamp: '5h ago', likes: 6, userLiked: false },
      { id: 'c11', user: { name: 'Avery Wilson', avatar: 'https://i.pravatar.cc/150?img=15' }, text: 'Ozymandias is the best episode of TV ever', timestamp: '6h ago', likes: 22, userLiked: true },
      { id: 'c12', user: { name: 'Blake Thompson', avatar: 'https://i.pravatar.cc/150?img=16' }, text: 'Jesse\'s transformation 😢', timestamp: '6h ago', likes: 8, userLiked: false },
      { id: 'c13', user: { name: 'Charlie Davis', avatar: 'https://i.pravatar.cc/150?img=17' }, text: 'The desert scenes are haunting', timestamp: '7h ago', likes: 10, userLiked: true },
      { id: 'c14', user: { name: 'Dakota Miller', avatar: 'https://i.pravatar.cc/150?img=18' }, text: 'I am the one who knocks!', timestamp: '7h ago', likes: 18, userLiked: false },
      { id: 'c15', user: { name: 'Elliot Garcia', avatar: 'https://i.pravatar.cc/150?img=19' }, text: 'This show changed television forever', timestamp: '8h ago', likes: 25, userLiked: true }
    ],
    showComments: [
      { id: 'sc1', user: { name: 'Mike Wilson', avatar: 'https://i.pravatar.cc/150?img=33' }, text: 'I can\'t stop thinking about this show. Masterpiece!', timestamp: '30 min ago', likes: 15, userLiked: false },
      { id: 'sc2', user: { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=40' }, text: 'The character development is phenomenal.', timestamp: '15 min ago', likes: 7, userLiked: true },
      { id: 'sc3', user: { name: 'David Chen', avatar: 'https://i.pravatar.cc/150?img=15' }, text: 'Walter White is one of the greatest TV characters ever written.', timestamp: '1h ago', likes: 23, userLiked: false },
      { id: 'sc4', user: { name: 'Emily Rodriguez', avatar: 'https://i.pravatar.cc/150?img=25' }, text: 'The chemistry between Bryan Cranston and Aaron Paul is incredible.', timestamp: '2h ago', likes: 19, userLiked: true },
      { id: 'sc5', user: { name: 'James Patterson', avatar: 'https://i.pravatar.cc/150?img=30' }, text: 'Every episode is perfectly crafted.', timestamp: '3h ago', likes: 12, userLiked: false },
      { id: 'sc6', user: { name: 'Lisa Wang', avatar: 'https://i.pravatar.cc/150?img=35' }, text: 'This show changed television forever.', timestamp: '4h ago', likes: 28, userLiked: true },
      { id: 'sc7', user: { name: 'Marcus Brown', avatar: 'https://i.pravatar.cc/150?img=41' }, text: 'The writing is absolutely flawless.', timestamp: '5h ago', likes: 16, userLiked: false },
      { id: 'sc8', user: { name: 'Nina Patel', avatar: 'https://i.pravatar.cc/150?img=42' }, text: 'Ozymandias still gives me chills.', timestamp: '6h ago', likes: 34, userLiked: true },
      { id: 'sc9', user: { name: 'Oscar Martinez', avatar: 'https://i.pravatar.cc/150?img=43' }, text: 'The transformation of Walter White is unmatched.', timestamp: '7h ago', likes: 21, userLiked: false },
      { id: 'sc10', user: { name: 'Paula Kim', avatar: 'https://i.pravatar.cc/150?img=44' }, text: 'Rewatching for the third time and still finding new details.', timestamp: '8h ago', likes: 9, userLiked: true },
      { id: 'sc11', user: { name: 'Quinn Taylor', avatar: 'https://i.pravatar.cc/150?img=45' }, text: 'The desert cinematography is breathtaking.', timestamp: '9h ago', likes: 17, userLiked: false },
      { id: 'sc12', user: { name: 'Rachel Green', avatar: 'https://i.pravatar.cc/150?img=46' }, text: 'Jesse deserved better but what a journey.', timestamp: '10h ago', likes: 26, userLiked: true },
      { id: 'sc13', user: { name: 'Steven Lee', avatar: 'https://i.pravatar.cc/150?img=47' }, text: 'The music choices are always perfect.', timestamp: '11h ago', likes: 11, userLiked: false },
      { id: 'sc14', user: { name: 'Tina Morrison', avatar: 'https://i.pravatar.cc/150?img=48' }, text: 'Gus Fring is the greatest villain ever.', timestamp: '12h ago', likes: 38, userLiked: true },
      { id: 'sc15', user: { name: 'Uma Patel', avatar: 'https://i.pravatar.cc/150?img=49' }, text: 'The tension never lets up for a second.', timestamp: '1 day ago', likes: 14, userLiked: false },
      { id: 'sc16', user: { name: 'Victor Chen', avatar: 'https://i.pravatar.cc/150?img=50' }, text: 'I wish I could watch it again for the first time.', timestamp: '1 day ago', likes: 42, userLiked: true },
      { id: 'sc17', user: { name: 'Wendy Adams', avatar: 'https://i.pravatar.cc/150?img=51' }, text: 'The finale was absolutely perfect.', timestamp: '1 day ago', likes: 31, userLiked: false },
      { id: 'sc18', user: { name: 'Xavier Jones', avatar: 'https://i.pravatar.cc/150?img=52' }, text: 'Bryan Cranston should have won more awards.', timestamp: '2 days ago', likes: 19, userLiked: true },
      { id: 'sc19', user: { name: 'Yolanda Smith', avatar: 'https://i.pravatar.cc/150?img=53' }, text: 'The symbolism throughout is incredible.', timestamp: '2 days ago', likes: 8, userLiked: false },
      { id: 'sc20', user: { name: 'Zack Williams', avatar: 'https://i.pravatar.cc/150?img=54' }, text: 'Skyler gets too much hate, she was right!', timestamp: '2 days ago', likes: 45, userLiked: true },
      { id: 'sc21', user: { name: 'Amy Roberts', avatar: 'https://i.pravatar.cc/150?img=55' }, text: 'The cold opens are legendary.', timestamp: '3 days ago', likes: 13, userLiked: false },
      { id: 'sc22', user: { name: 'Brian Wilson', avatar: 'https://i.pravatar.cc/150?img=56' }, text: 'Hank was my favorite character. RIP.', timestamp: '3 days ago', likes: 29, userLiked: true },
      { id: 'sc23', user: { name: 'Carla Davis', avatar: 'https://i.pravatar.cc/150?img=57' }, text: 'This show made me appreciate good television.', timestamp: '3 days ago', likes: 16, userLiked: false }
    ],
  }

  // ============================================================================
  // CARD 2: Because You Liked (Template B) - Better Call Saul
  // ============================================================================
  const card2Data: FeedCardData = {
    id: '2',
    media: {
      id: 'media-2',
      title: 'Better Call Saul',
      year: 2022,
      genres: ['Crime', 'Drama'],
      rating: 9.0,
      posterUrl: 'https://image.tmdb.org/t/p/original/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg',
      synopsis: 'The final season finds Jimmy McGill living as Gene Takavic in Omaha. As he completes his transformation into criminal lawyer Saul Goodman, tensions escalate.',
      creator: 'Vince Gilligan',
      cast: ['Bob Odenkirk', 'Rhea Seehorn', 'Jonathan Banks', 'Giancarlo Esposito'],
      network: 'AMC',
      season: 6,
      mediaType: 'TV'
    },
    friends: {
      avatars: [
        { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'https://i.pravatar.cc/150?img=12' },
        { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'https://i.pravatar.cc/150?img=20' }
      ],
      count: 5,
      text: '5 friends loved this'
    },
    stats: { likeCount: 0, commentCount: 12, userLiked: false },
    friendsActivity: {
      watching: { count: 8, avatars: ['https://i.pravatar.cc/150?img=5', 'https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7'] },
      wantToWatch: { count: 12, avatars: ['https://i.pravatar.cc/150?img=8', 'https://i.pravatar.cc/150?img=9', 'https://i.pravatar.cc/150?img=10'] },
      watched: { count: 42, avatars: ['https://i.pravatar.cc/150?img=11', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=13'] },
      ratings: { meh: 5, like: 23, love: 48, userRating: undefined }
    },
    comments: [],
    showComments: [
      { id: 'sc1', user: { name: 'Jessica Chen', avatar: 'https://i.pravatar.cc/150?img=14' }, text: 'This season is absolutely phenomenal. Best TV I\'ve ever watched.', timestamp: '3 days ago', likes: 20, userLiked: true },
      { id: 'sc2', user: { name: 'Marcus Williams', avatar: 'https://i.pravatar.cc/150?img=16' }, text: 'Bob Odenkirk deserves every award for this performance.', timestamp: '1 week ago', likes: 35, userLiked: false }
    ],
  }

  // ============================================================================
  // CARD 3: Your Friends Loved (Template B) - The Last of Us
  // ============================================================================
  const card3Data: FeedCardData = {
    id: '3',
    media: {
      id: 'media-3',
      title: 'The Last of Us',
      year: 2023,
      genres: ['Drama', 'Sci-Fi'],
      rating: 8.8,
      posterUrl: 'https://image.tmdb.org/t/p/original/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
      synopsis: 'Twenty years after a fungal outbreak ravages the planet, Joel Miller is tasked with escorting teenager Ellie across a post-apocalyptic United States.',
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
        { id: '4', name: 'Sam Taylor', username: 'samt', avatar: 'https://i.pravatar.cc/150?img=11' }
      ],
      count: 12,
      text: '12 friends loved this'
    },
    stats: { likeCount: 0, commentCount: 15, userLiked: false },
    friendsActivity: {
      watching: { count: 6, avatars: ['https://i.pravatar.cc/150?img=3', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=11'] },
      wantToWatch: { count: 18, avatars: ['https://i.pravatar.cc/150?img=15', 'https://i.pravatar.cc/150?img=19', 'https://i.pravatar.cc/150?img=23'] },
      watched: { count: 35, avatars: ['https://i.pravatar.cc/150?img=27', 'https://i.pravatar.cc/150?img=31', 'https://i.pravatar.cc/150?img=35'] },
      ratings: { meh: 3, like: 15, love: 52, userRating: undefined }
    },
    comments: [],
    showComments: [
      { id: 'sc1', user: { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=3' }, text: 'Episode 3 absolutely destroyed me. Bill and Frank\'s story was perfect.', timestamp: '2h ago', likes: 45, userLiked: true },
      { id: 'sc2', user: { name: 'Jordan Kim', avatar: 'https://i.pravatar.cc/150?img=7' }, text: 'Best video game adaptation ever made. Pedro Pascal is incredible.', timestamp: '3h ago', likes: 38, userLiked: false }
    ],
  }

  // ============================================================================
  // CARD 4: Coming Soon (Template B, unreleased) - House of the Dragon
  // ============================================================================
  const card4Data: FeedCardData = {
    id: '4',
    media: {
      id: 'media-4',
      title: 'House of the Dragon',
      year: 2024,
      genres: ['Fantasy', 'Drama'],
      rating: 8.5,
      posterUrl: 'https://image.tmdb.org/t/p/original/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
      synopsis: 'The reign of House Targaryen begins with this prequel to Game of Thrones. The series chronicles the civil war within the Targaryen dynasty.',
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
    stats: { likeCount: 0, commentCount: 8, userLiked: false },
    friendsActivity: {
      watching: { count: 0, avatars: [] },
      wantToWatch: { count: 24, avatars: ['https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8'] },
      watched: { count: 0, avatars: [] },
      ratings: { meh: 0, like: 0, love: 0, userRating: undefined }
    },
    comments: [],
    showComments: [
      { id: 'sc1', user: { name: 'Emma Rodriguez', avatar: 'https://i.pravatar.cc/150?img=6' }, text: 'Cannot WAIT for this season! The trailer looks incredible.', timestamp: '1 day ago', likes: 32, userLiked: true },
      { id: 'sc2', user: { name: 'Daniel Kim', avatar: 'https://i.pravatar.cc/150?img=7' }, text: 'Finally! The Dance of the Dragons is about to begin.', timestamp: '2 days ago', likes: 28, userLiked: false }
    ],
  }

  // ============================================================================
  // CARD 5: Now Streaming (Template B) - Dune: Part Two
  // ============================================================================
  const card5Data: FeedCardData = {
    id: '5',
    media: {
      id: 'media-5',
      title: 'Dune: Part Two',
      year: 2024,
      genres: ['Sci-Fi', 'Adventure'],
      rating: 8.7,
      posterUrl: 'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      creator: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin'],
      network: 'Netflix',
      season: undefined,
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
    stats: { likeCount: 0, commentCount: 18, userLiked: false },
    friendsActivity: {
      watching: { count: 4, avatars: ['https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8'] },
      wantToWatch: { count: 28, avatars: ['https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=14'] },
      watched: { count: 15, avatars: ['https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=18', 'https://i.pravatar.cc/150?img=20'] },
      ratings: { meh: 2, like: 8, love: 32, userRating: undefined }
    },
    comments: [],
    showComments: [
      { id: 'sc1', user: { name: 'Ryan Miller', avatar: 'https://i.pravatar.cc/150?img=6' }, text: 'Finally on streaming! This movie is absolutely breathtaking.', timestamp: '2h ago', likes: 45, userLiked: true },
      { id: 'sc2', user: { name: 'Sophie Chen', avatar: 'https://i.pravatar.cc/150?img=7' }, text: 'Hans Zimmer\'s score deserves its own appreciation post. Unreal.', timestamp: '4h ago', likes: 38, userLiked: false }
    ],
  }

  // ============================================================================
  // CARD 6: Top 3 Update (Template A) - The Bear
  // ============================================================================
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
    stats: { likeCount: 47, commentCount: 10, userLiked: false },
    friendsActivity: {
      watching: { count: 6, avatars: ['https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8'] },
      wantToWatch: { count: 19, avatars: ['https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=14'] },
      watched: { count: 24, avatars: ['https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=18', 'https://i.pravatar.cc/150?img=20'] },
      ratings: { meh: 1, like: 5, love: 18, userRating: undefined }
    },
    comments: [
      { id: 'c1', user: { name: 'Ryan Miller', avatar: 'https://i.pravatar.cc/150?img=2' }, text: 'YES! Finally giving it the recognition it deserves 🔥', timestamp: '2h ago', likes: 12, userLiked: true },
      { id: 'c2', user: { name: 'Sophie Chen', avatar: 'https://i.pravatar.cc/150?img=3' }, text: 'The forks episode changed me as a person', timestamp: '3h ago', likes: 8, userLiked: false }
    ],
    showComments: [
      { id: 'sc1', user: { name: 'Marcus Johnson', avatar: 'https://i.pravatar.cc/150?img=11' }, text: 'Jeremy Allen White deserved every award for this performance.', timestamp: '1h ago', likes: 67, userLiked: true },
      { id: 'sc2', user: { name: 'Emma Williams', avatar: 'https://i.pravatar.cc/150?img=15' }, text: 'Season 2 is even better than the first. The Christmas episode!', timestamp: '3h ago', likes: 54, userLiked: false }
    ],
  }

  // ============================================================================
  // CARD 7: Find New Friends (Template C) - User Suggestions
  // ============================================================================
  const card7Suggestions = [
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
    }
  ]

  // ============================================================================
  // CARD 8: You Might Like (Template B) - Better Call Saul
  // ============================================================================
  const card8Data: FeedCardData = {
    id: '8',
    media: {
      id: 'media-8',
      title: 'Severance',
      year: 2022,
      genres: ['Thriller', 'Sci-Fi'],
      rating: 8.7,
      posterUrl: 'https://image.tmdb.org/t/p/original/lFf6LLrQjYldcZItzOkGmMMigP7.jpg',
      synopsis: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
      creator: 'Dan Erickson',
      cast: ['Adam Scott', 'Britt Lower', 'Zach Cherry', 'John Turturro'],
      network: 'Apple TV+',
      season: 1,
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
    stats: { likeCount: 0, commentCount: 14, userLiked: false },
    friendsActivity: {
      watching: { count: 3, avatars: ['https://i.pravatar.cc/150?img=6', 'https://i.pravatar.cc/150?img=7', 'https://i.pravatar.cc/150?img=8'] },
      wantToWatch: { count: 22, avatars: ['https://i.pravatar.cc/150?img=10', 'https://i.pravatar.cc/150?img=12', 'https://i.pravatar.cc/150?img=14'] },
      watched: { count: 18, avatars: ['https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=18', 'https://i.pravatar.cc/150?img=20'] },
      ratings: { meh: 0, like: 4, love: 36, userRating: undefined }
    },
    comments: [],
    showComments: [
      { id: 'sc1', user: { name: 'Ryan Miller', avatar: 'https://i.pravatar.cc/150?img=6' }, text: 'The finale left me speechless. Cannot wait for season 2!', timestamp: '2h ago', likes: 78, userLiked: true },
      { id: 'sc2', user: { name: 'Sophie Chen', avatar: 'https://i.pravatar.cc/150?img=7' }, text: 'This show is a masterpiece of psychological thriller.', timestamp: '4h ago', likes: 92, userLiked: false }
    ],
  }

  return (
    <>
      {/* Global styles for scroll-snap */}
      <style>{`
        .feed-scroll-container {
          height: 100vh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          background: #1a1a1a;
          padding: calc((100vh - 645px) / 2) 0;
        }
        
        .card-snap-wrapper {
          scroll-snap-align: center;
          scroll-snap-stop: always;
          padding: 15px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .card-inner-wrapper {
          width: 100%;
          max-width: 398px;
          display: flex;
          justify-content: center;
        }
      `}</style>

      <div className="feed-scroll-container">
        {/* Card 1: User Activity */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <UserActivityCard
              data={card1Data}
              onLike={() => handleTrack('like', { card: 1 })}
              onComment={() => handleTrack('comment', { card: 1 })}
              onShare={() => handleTrack('share', { card: 1 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 1 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 2: Because You Liked */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FeedCard
              variant="b"
              backVariant="standard"
              badges={[BADGE_PRESETS.becauseYouLiked('Breaking Bad')]}
              data={card2Data}
              onShare={() => handleTrack('share', { card: 2 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 2 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 3: Your Friends Loved */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FeedCard
              variant="b"
              backVariant="standard"
              badges={[BADGE_PRESETS.friendsLoved()]}
              data={card3Data}
              onShare={() => handleTrack('share', { card: 3 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 3 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 4: Coming Soon */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FeedCard
              variant="b"
              backVariant="unreleased"
              badges={[BADGE_PRESETS.comingSoon('May 5, 2026')]}
              data={card4Data}
              onShare={() => handleTrack('share', { card: 4 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 4 })}
              onRemindMe={() => handleTrack('remind_me', { card: 4 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 5: Now Streaming */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FeedCard
              variant="b"
              backVariant="standard"
              badges={[BADGE_PRESETS.nowStreaming('Netflix')]}
              data={card5Data}
              onShare={() => handleTrack('share', { card: 5 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 5 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 6: Top 3 Update */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FeedCard
              variant="a"
              backVariant="standard"
              badges={[BADGE_PRESETS.top3Update(1)]}
              data={card6Data}
              user={{
                id: 'user-alex',
                name: 'Alex Thompson',
                username: 'alexthompson',
                avatar: 'https://i.pravatar.cc/150?img=9'
              }}
              timestamp="5 hours ago"
              onLike={() => handleTrack('like', { card: 6 })}
              onComment={() => handleTrack('comment', { card: 6 })}
              onShare={() => handleTrack('share', { card: 6 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 6 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 7: Find New Friends */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FollowSuggestionsCard
              suggestions={card7Suggestions}
              colorTheme="gold"
              autoRotateInterval={6000}
              onFollow={(userId) => handleTrack('follow_toggle', { userId })}
              onUserClick={(userId) => handleTrack('user_click', { userId })}
              onTrack={handleTrack}
            />
          </div>
        </div>

        {/* Card 8: You Might Like */}
        <div className="card-snap-wrapper">
          <div className="card-inner-wrapper">
            <FeedCard
              variant="b"
              backVariant="standard"
              badges={[BADGE_PRESETS.youMightLike]}
              data={card8Data}
              onShare={() => handleTrack('share', { card: 8 })}
              onAddToWatchlist={() => handleTrack('add_to_watchlist', { card: 8 })}
              onTrack={handleTrack}
            />
          </div>
        </div>

      </div>
    </>
  )
}


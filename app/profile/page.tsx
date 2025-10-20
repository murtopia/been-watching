'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/navigation/BottomNav'
import SearchModal from '@/components/search/SearchModal'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import EditProfileModal from '@/components/profile/EditProfileModal'
import AvatarUploadModal from '@/components/profile/AvatarUploadModal'
import UserCard from '@/components/friends/UserCard'
import { getTasteMatchBetweenUsers, findSimilarUsers } from '@/utils/tasteMatch'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [friendsTab, setFriendsTab] = useState<'following' | 'followers' | 'discover'>('following')
  const [loading, setLoading] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [following, setFollowing] = useState<any[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [tasteMatches, setTasteMatches] = useState<Map<string, number>>(new Map())
  const [mutualFriends, setMutualFriends] = useState<Map<string, any[]>>(new Map())
  const [counts, setCounts] = useState({ wantCount: 0, watchingCount: 0, watchedCount: 0 })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadFollowData()
      loadSuggestedFriends()
      loadCounts()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
    } else {
      setUser(user)
      loadProfile(user.id)
    }
  }

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error loading profile:', error)
    }

    if (data) {
      setProfile(data)
      setIsPrivate(data.is_private || false)
    } else {
      // Create default profile
      setProfile({
        id: userId,
        username: user?.email?.split('@')[0] || 'user',
        display_name: 'Your Name',
        bio: 'What have you been watching?',
        avatar_url: null
      })
    }
    setLoading(false)
  }

  const loadCounts = async () => {
    if (!user) return

    const { count: wantCount } = await supabase
      .from('watch_status')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'want')

    const { count: watchingCount } = await supabase
      .from('watch_status')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'watching')

    const { count: watchedCount } = await supabase
      .from('watch_status')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'watched')

    setCounts({ wantCount: wantCount || 0, watchingCount: watchingCount || 0, watchedCount: watchedCount || 0 })
  }

  const loadFollowData = async () => {
    // Load following
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', user.id)

    if (followingData) {
      setFollowing(followingData.map(f => f.profiles))
    }

    // Load followers
    const { data: followersData } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', user.id)

    if (followersData) {
      setFollowers(followersData.map(f => f.profiles))
    }
  }

  const loadSuggestedFriends = async () => {
    if (!user) return

    try {
      // Use taste match algorithm to find similar users
      const similarUsers = await findSimilarUsers(user.id, {
        limit: 10,
        minScore: 30,
        excludeUserIds: following.map(f => f.id)
      })

      // Get full profile data for similar users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', similarUsers.map(u => u.userId))

      if (profiles) {
        // Create taste match map
        const matches = new Map<string, number>()
        similarUsers.forEach(u => matches.set(u.userId, u.score))
        setTasteMatches(matches)

        // Load mutual friends for each suggested user
        for (const profile of profiles) {
          const mutuals = await getMutualFriends(profile.id)
          setMutualFriends(prev => new Map(prev).set(profile.id, mutuals))
        }

        setSuggestedFriends(profiles)
      }
    } catch (error) {
      console.error('Error loading suggested friends:', error)
      // Fallback to simple suggestions
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(5)

      if (data) {
        const filtered = data.filter(p => !following.some(f => f.id === p.id))
        setSuggestedFriends(filtered)
      }
    }
  }

  const getMutualFriends = async (targetUserId: string) => {
    if (!user) return []

    // Get users that both current user and target user follow
    const { data: myFollowing } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const { data: theirFollowing } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', targetUserId)

    if (!myFollowing || !theirFollowing) return []

    const myFollowingIds = myFollowing.map(f => f.following_id)
    const theirFollowingIds = theirFollowing.map(f => f.following_id)

    const mutualIds = myFollowingIds.filter(id => theirFollowingIds.includes(id))

    if (mutualIds.length === 0) return []

    const { data: mutualProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', mutualIds)

    return mutualProfiles || []
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq('id', user?.id)
      .limit(10)

    setSearchResults(data || [])
  }

  const checkIfUserFollowsBack = (userId: string): boolean => {
    return followers.some(f => f.id === userId)
  }

  const handleFollow = async (userId: string) => {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: userId
      })

    if (!error) {
      loadFollowData()
      loadSuggestedFriends()
    }
  }

  const handleUnfollow = async (userId: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (!error) {
      loadFollowData()
    }
  }

  const handlePrivacyToggle = async () => {
    const newValue = !isPrivate
    setIsPrivate(newValue)

    const { error } = await supabase
      .from('profiles')
      .update({ is_private: newValue })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating privacy:', error)
      setIsPrivate(!newValue) // Revert on error
    }
  }

  const handleDetailModalRate = (rating: string) => {
    if (selectedMedia) {
      handleMediaSelect(selectedMedia, rating, undefined)
    }
  }

  const handleDetailModalStatus = (status: string) => {
    if (selectedMedia) {
      handleMediaSelect(selectedMedia, undefined, status)
    }
  }

  const handleMediaSelect = async (media: any, rating?: string, status?: string) => {
    if (!user) return

    try {
      // Create media ID format
      const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie')
      const mediaId = `${mediaType}-${media.id}`

      // First, ensure media exists in database
      await supabase
        .from('media')
        .upsert({
          id: mediaId,
          tmdb_id: media.id,
          media_type: mediaType,
          title: media.title || media.name,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          overview: media.overview,
          release_date: media.release_date || media.first_air_date,
          vote_average: media.vote_average,
          tmdb_data: media
        }, { onConflict: 'id' })

      // Save rating if provided
      if (rating) {
        await supabase
          .from('ratings')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            rating: rating
          }, { onConflict: 'user_id,media_id' })
      }

      // Save status if provided
      if (status) {
        await supabase
          .from('watch_status')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            status: status
          }, { onConflict: 'user_id,media_id' })
      }

      // Keep modal open after selection
    } catch (error) {
      console.error('Error handling media select:', error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'YOU'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'YOU'
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/auth')
    }
  }

  if (loading || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '4px solid var(--accent-pink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '100px' }}>
      {/* Header with Logo */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'white',
        borderBottom: '1px solid #f0f0f0',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: 0
          }}>
            Been Watching
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div style={{
        padding: '1.5rem',
        background: 'white',
        margin: '0.5rem auto',
        maxWidth: '600px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Avatar */}
          <div
            onClick={() => setShowAvatarModal(true)}
            style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'white',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              getInitials(profile.display_name)
            )}
            {/* Plus indicator */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#0095f6',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'white'
            }}>
              +
            </div>
          </div>

          {/* Name and Bio */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>{profile.display_name}</h2>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>{profile.bio || 'What have you been watching?'}</p>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Edit Profile
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: '1rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{counts.wantCount}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Want to Watch</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{counts.watchingCount}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Watching</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{counts.watchedCount}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Watched</div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div style={{
        padding: '1.5rem',
        background: 'white',
        margin: '0.5rem auto',
        maxWidth: '600px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>Privacy</h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '28px',
            flexShrink: 0
          }}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={handlePrivacyToggle}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isPrivate ? '#0095f6' : '#ccc',
              borderRadius: '28px',
              transition: '0.3s'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '22px',
                width: '22px',
                left: isPrivate ? '23px' : '3px',
                bottom: '3px',
                background: 'white',
                borderRadius: '50%',
                transition: '0.3s'
              }}></span>
            </span>
          </label>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>Private Account</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Only approved followers can see your activity</div>
          </div>
        </div>
      </div>

      {/* Admin Link (only shown for admin users) */}
      {profile?.is_admin && (
        <div style={{
          padding: '1.5rem',
          background: 'white',
          margin: '0.5rem auto',
          maxWidth: '600px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>Admin</h3>
          <a
            href="/admin"
            style={{
              display: 'block',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          >
            🔧 Go to Admin Dashboard
          </a>
        </div>
      )}

      {/* Invites Section */}
      <div style={{
        padding: '1.5rem',
        background: 'white',
        margin: '0.5rem auto',
        maxWidth: '600px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>Invites</h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(233, 77, 136, 0.1) 0%, rgba(242, 113, 33, 0.1) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(233, 77, 136, 0.2)'
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>Invites Remaining</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>Share Been Watching with friends</div>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {profile?.invites_remaining || 0}
          </div>
        </div>
        {profile?.invite_code && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>Your Personal Invite Code</div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              fontFamily: 'monospace',
              color: '#1a1a1a'
            }}>
              {profile.invite_code}
            </div>
          </div>
        )}
      </div>

      {/* Friends Section */}
      <div style={{
        padding: '1.5rem',
        background: 'white',
        margin: '0.5rem auto',
        maxWidth: '600px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>Friends</h3>

        {/* Three-Tab System: Following / Followers / Discover */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setFriendsTab('following')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: friendsTab === 'following' ? '3px solid #e94d88' : '3px solid transparent',
              color: friendsTab === 'following' ? '#e94d88' : '#666',
              fontWeight: friendsTab === 'following' ? '700' : '400',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Following {following.length}
          </button>
          <button
            onClick={() => setFriendsTab('followers')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: friendsTab === 'followers' ? '3px solid #e94d88' : '3px solid transparent',
              color: friendsTab === 'followers' ? '#e94d88' : '#666',
              fontWeight: friendsTab === 'followers' ? '700' : '400',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Followers {followers.length}
          </button>
          <button
            onClick={() => setFriendsTab('discover')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: friendsTab === 'discover' ? '3px solid #e94d88' : '3px solid transparent',
              color: friendsTab === 'discover' ? '#e94d88' : '#666',
              fontWeight: friendsTab === 'discover' ? '700' : '400',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Discover 🔍
          </button>
        </div>

        {/* Tab Content */}
        {friendsTab === 'following' && (
          <div>
            {following.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {following.map((friend) => (
                  <UserCard
                    key={friend.id}
                    user={friend}
                    currentUserId={user?.id || ''}
                    isFollowing={true}
                    followsYou={checkIfUserFollowsBack(friend.id)}
                    mutualFriends={mutualFriends.get(friend.id) || []}
                    tasteMatchScore={tasteMatches.get(friend.id)}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    onClick={(username) => router.push(`/user/${username}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No one yet</div>
                <div style={{ fontSize: '0.875rem' }}>Find friends in the Discover tab!</div>
              </div>
            )}
          </div>
        )}

        {friendsTab === 'followers' && (
          <div>
            {followers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {followers.map((follower) => (
                  <UserCard
                    key={follower.id}
                    user={follower}
                    currentUserId={user?.id || ''}
                    isFollowing={following.some(f => f.id === follower.id)}
                    followsYou={true}
                    mutualFriends={mutualFriends.get(follower.id) || []}
                    tasteMatchScore={tasteMatches.get(follower.id)}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    onClick={(username) => router.push(`/user/${username}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No followers yet</div>
                <div style={{ fontSize: '0.875rem' }}>Share your profile to get followers!</div>
              </div>
            )}
          </div>
        )}

        {friendsTab === 'discover' && (
          <div>
            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search by username or name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#e94d88'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#666', marginBottom: '1rem' }}>
                  Search Results
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchResults.map((result) => (
                    <UserCard
                      key={result.id}
                      user={result}
                      currentUserId={user?.id || ''}
                      isFollowing={following.some(f => f.id === result.id)}
                      followsYou={followers.some(f => f.id === result.id)}
                      mutualFriends={mutualFriends.get(result.id) || []}
                      tasteMatchScore={tasteMatches.get(result.id)}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      onClick={(username) => router.push(`/user/${username}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999', marginBottom: '2rem' }}>
                No users found for "{searchQuery}"
              </div>
            )}

            {/* Smart Suggestions */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#666', marginBottom: '1rem' }}>
                {searchQuery.length >= 2 ? 'More Suggestions' : 'Suggested For You'}
              </h4>
              {suggestedFriends.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {suggestedFriends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      currentUserId={user?.id || ''}
                      isFollowing={false}
                      followsYou={followers.some(f => f.id === friend.id)}
                      mutualFriends={mutualFriends.get(friend.id) || []}
                      tasteMatchScore={tasteMatches.get(friend.id)}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      onClick={(username) => router.push(`/user/${username}`)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No suggestions yet</div>
                  <div style={{ fontSize: '0.875rem' }}>Add more shows to get personalized suggestions!</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMedia={handleMediaSelect}
        user={user}
      />

      <MediaDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedMedia(null)
        }}
        media={selectedMedia}
        onRate={handleDetailModalRate}
        onStatus={handleDetailModalStatus}
        user={user}
      />

      <AvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        userId={user?.id || ''}
        currentAvatarUrl={profile?.avatar_url || null}
        onAvatarUpdated={(newUrl) => {
          setProfile({ ...profile, avatar_url: newUrl })
        }}
      />

      <BottomNav onSearchOpen={() => setSearchOpen(true)} />

      {/* Modals */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            setProfile(updated)
            setShowEditModal(false)
          }}
        />
      )}

    </div>
  )
}

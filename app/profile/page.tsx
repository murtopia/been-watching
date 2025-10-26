'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/navigation/BottomNav'
import AppHeader from '@/components/navigation/AppHeader'
import SearchModal from '@/components/search/SearchModal'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import EditProfileModal from '@/components/profile/EditProfileModal'
import AvatarUploadModal from '@/components/profile/AvatarUploadModal'
import UserCard from '@/components/friends/UserCard'
import Footer from '@/components/navigation/Footer'
import InviteSection from '@/components/profile/InviteSection'
import ReferralDashboard from '@/components/profile/ReferralDashboard'
import { useThemeColors } from '@/hooks/useThemeColors'
import { getTasteMatchBetweenUsers, findSimilarUsers } from '@/utils/tasteMatch'
import { safeFormatDate } from '@/utils/dateFormatting'

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
  const [inviteSectionKey, setInviteSectionKey] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const colors = useThemeColors()

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
      // Create notification for the user being followed
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: user.id,
          type: 'follow',
          target_type: 'profile',
          target_id: userId
        })

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

      // Extract numeric ID from media.id (handles both "64356", "64356-s2", and "tv-64356-s2" formats)
      const idString = String(media.id)
      const numericMatch = idString.match(/(\d+)/)
      const numericId = numericMatch ? parseInt(numericMatch[1]) : null

      if (!numericId) {
        console.error('Could not extract numeric ID from media.id:', media.id)
        return
      }

      const mediaId = `${mediaType}-${numericId}`

      // Debug logging
      console.log('DEBUG media.id:', media.id)
      console.log('DEBUG extracted numericId:', numericId)
      console.log('DEBUG final mediaId:', mediaId)

      // First, ensure media exists in database
      const { error: mediaError } = await supabase
        .from('media')
        .upsert({
          id: mediaId,
          tmdb_id: numericId, // Use extracted numeric ID
          media_type: mediaType,
          title: media.title || media.name,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          overview: media.overview,
          release_date: safeFormatDate(media.release_date || media.first_air_date),
          vote_average: media.vote_average,
          tmdb_data: media
        }, { onConflict: 'id' })

      if (mediaError) {
        console.error('Error saving media:', mediaError)
        console.error('Media details:', JSON.stringify(mediaError, null, 2))
        return // Don't continue if media save failed
      }

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
        const { error: statusError } = await supabase
          .from('watch_status')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            status: status
          }, { onConflict: 'user_id,media_id' })

        if (statusError) {
          console.error('Error saving watch status:', statusError)
        } else {
          // Refresh InviteSection to update completion status
          setInviteSectionKey(prev => prev + 1)
        }
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
      <div style={{ minHeight: '100vh', background: colors.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bgGradient, paddingBottom: '100px' }}>
      {/* Header */}
      <AppHeader showThemeToggle showLogout onLogout={handleLogout} />

      {/* Profile Info */}
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        margin: '0.5rem auto',
        maxWidth: '600px',
        backdropFilter: 'blur(20px)'
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
              background: colors.brandGradient,
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
              background: colors.brandBlue,
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

          {/* Name, Username and Bio */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.25rem 0', color: colors.textPrimary }}>{profile.display_name}</h2>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>@{profile.username}</p>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>{profile.bio || 'What have you been watching?'}</p>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              padding: '0.5rem 1rem',
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: colors.textPrimary,
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
          borderTop: `1px solid ${colors.borderColor}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>{counts.wantCount}</div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Want to Watch</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>{counts.watchingCount}</div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Watching</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.textPrimary }}>{counts.watchedCount}</div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Watched</div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        margin: '0.5rem auto',
        maxWidth: '600px',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0', color: colors.textPrimary }}>Privacy</h3>
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
              background: isPrivate ? colors.brandBlue : '#ccc',
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
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem', color: colors.textPrimary }}>Private Account</div>
            <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Only approved followers can see your activity</div>
          </div>
        </div>
      </div>

      {/* Admin Link (only shown for admin users) */}
      {profile?.is_admin && (
        <div style={{
          padding: '1.5rem',
          background: colors.cardBg,
          border: colors.cardBorder,
          borderRadius: '12px',
          margin: '0.5rem auto',
          maxWidth: '600px',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0', color: colors.textPrimary }}>Admin</h3>
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
      <div style={{ margin: '0.5rem auto', maxWidth: '600px' }}>
        <InviteSection
          key={inviteSectionKey}
          userId={user?.id}
          username={profile?.username}
          invitesRemaining={profile?.invites_remaining || 0}
          onInviteEarned={() => {
            // Reload profile data when invite is earned
            checkUser()
          }}
          onOpenAvatarUpload={() => setShowAvatarModal(true)}
          onOpenEditProfile={() => setShowEditModal(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateToMyShows={() => router.push('/myshows')}
        />

        {/* Referral Dashboard */}
        <ReferralDashboard userId={user?.id} />
      </div>

      {/* Friends Section */}
      <div style={{
        padding: '1.5rem',
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        margin: '0.5rem auto',
        maxWidth: '600px',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0', color: colors.textPrimary }}>Friends</h3>

        {/* Three-Tab System: Following / Followers / Discover */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.borderColor}`,
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setFriendsTab('following')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: friendsTab === 'following' ? `3px solid ${colors.brandPink}` : '3px solid transparent',
              color: friendsTab === 'following' ? colors.brandPink : colors.textSecondary,
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
              borderBottom: friendsTab === 'followers' ? `3px solid ${colors.brandPink}` : '3px solid transparent',
              color: friendsTab === 'followers' ? colors.brandPink : colors.textSecondary,
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
              borderBottom: friendsTab === 'discover' ? `3px solid ${colors.brandPink}` : '3px solid transparent',
              color: friendsTab === 'discover' ? colors.brandPink : colors.textSecondary,
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
                    onClick={(username) => router.push(`/${username}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.textSecondary }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.textPrimary }}>No one yet</div>
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
                    onClick={(username) => router.push(`/${username}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.textSecondary }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.textPrimary }}>No followers yet</div>
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
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  color: colors.textPrimary,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.brandPink
                  e.target.style.background = colors.inputBg
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.inputBorder
                  e.target.style.background = colors.inputBg
                }}
              />
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && searchResults.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.textSecondary, marginBottom: '1rem' }}>
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
                      onClick={(username) => router.push(`/${username}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: colors.textSecondary, marginBottom: '2rem' }}>
                No users found for "{searchQuery}"
              </div>
            )}

            {/* Smart Suggestions */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.textSecondary, marginBottom: '1rem' }}>
                {searchQuery.length >= 2 ? 'More Suggestions' : 'Suggested For You'}
              </h4>
              {suggestedFriends.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {suggestedFriends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      currentUserId={user?.id || ''}
                      isFollowing={following.some(f => f.id === friend.id)}
                      followsYou={followers.some(f => f.id === friend.id)}
                      mutualFriends={mutualFriends.get(friend.id) || []}
                      tasteMatchScore={tasteMatches.get(friend.id)}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      onClick={(username) => router.push(`/${username}`)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.textSecondary }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.textPrimary }}>No suggestions yet</div>
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
          setInviteSectionKey(prev => prev + 1) // Force InviteSection to refresh
        }}
      />

      {/* Minimal Footer */}
      <Footer variant="minimal" />

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

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/navigation/BottomNav'
import AppHeader from '@/components/navigation/AppHeader'
import SearchModalEnhanced from '@/components/search/SearchModalEnhanced'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import AvatarUploadModal from '@/components/profile/AvatarUploadModal'
import UserCard from '@/components/friends/UserCard'
import MutualFriendsModal from '@/components/friends/MutualFriendsModal'
import Footer from '@/components/navigation/Footer'
import InviteSection from '@/components/profile/InviteSection'
import ReferralDashboard from '@/components/profile/ReferralDashboard'
import { Icon } from '@/components/ui/Icon'
import { useThemeColors } from '@/hooks/useThemeColors'
import { getTasteMatchBetweenUsers, findSimilarUsers } from '@/utils/tasteMatch'
import { safeFormatDate } from '@/utils/dateFormatting'
import { trackUserLoggedOut, resetUser } from '@/utils/analytics'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [friendsTab, setFriendsTab] = useState<'following' | 'followers' | 'discover'>('following')
  const [loading, setLoading] = useState(true)
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
  const [mutualModalOpen, setMutualModalOpen] = useState(false)
  const [mutualModalFriends, setMutualModalFriends] = useState<any[]>([])
  const [inviteSectionKey, setInviteSectionKey] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const colors = useThemeColors()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    const loadAllData = async () => {
      if (user) {
        const followingList = await loadFollowData()
        loadCounts()
        // Now load suggestions with the fresh following list
        loadSuggestedFriends(followingList)
      }
    }
    loadAllData()
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

  const loadFollowData = async (): Promise<any[]> => {
    // Load following
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)')
      .eq('follower_id', user.id)

    const followingList = followingData ? followingData.map(f => f.profiles) : []
    setFollowing(followingList)

    // Load followers
    const { data: followersData } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)')
      .eq('following_id', user.id)

    if (followersData) {
      setFollowers(followersData.map(f => f.profiles))
    }
    
    return followingList
  }

  const loadSuggestedFriends = async (followingList?: any[]) => {
    if (!user) return

    // Use provided following list or fall back to state
    const currentFollowing = followingList || following
    
    // Get current following IDs for filtering
    const followingIds = new Set(currentFollowing.map((f: any) => f.id))
    followingIds.add(user.id) // Also exclude self

    try {
      // Strategy 1: Friends of friends (people your friends follow that you don't)
      const friendsOfFriendsSet = new Set<string>()
      
      for (const friend of currentFollowing) {
        // Get who each of your friends follows
        const { data: theirFollowing } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', friend.id)
          .limit(20)
        
        if (theirFollowing) {
          theirFollowing.forEach(f => {
            if (!followingIds.has(f.following_id)) {
              friendsOfFriendsSet.add(f.following_id)
            }
          })
        }
      }

      const friendsOfFriendsIds = Array.from(friendsOfFriendsSet).slice(0, 15)
      
      // Get profiles for friends of friends
      let suggestedProfiles: any[] = []
      
      if (friendsOfFriendsIds.length > 0) {
        const { data: fofProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', friendsOfFriendsIds)
        
        if (fofProfiles) {
          suggestedProfiles = fofProfiles
        }
      }

      // Strategy 2: Add taste-matched users if we need more suggestions
      if (suggestedProfiles.length < 10) {
        const existingIds = new Set(suggestedProfiles.map(p => p.id))
        const excludeIds = [...followingIds, ...existingIds]
        
        const similarUsers = await findSimilarUsers(user.id, {
          limit: 10 - suggestedProfiles.length,
          minScore: 20,
          excludeUserIds: excludeIds
        })

        if (similarUsers.length > 0) {
          const { data: tasteProfiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', similarUsers.map(u => u.userId))

          if (tasteProfiles) {
            // Create taste match map
            const matches = new Map<string, number>(tasteMatches)
            similarUsers.forEach(u => matches.set(u.userId, u.score))
            setTasteMatches(matches)
            
            suggestedProfiles = [...suggestedProfiles, ...tasteProfiles]
          }
        }
      }

      // Final filter to ensure no one we're following is included
      const finalSuggestions = suggestedProfiles.filter(p => !followingIds.has(p.id))

      // Load mutual friends for each suggested user
      for (const profile of finalSuggestions) {
        const mutuals = await getMutualFriends(profile.id)
        setMutualFriends(prev => new Map(prev).set(profile.id, mutuals))
      }

      setSuggestedFriends(finalSuggestions)
    } catch (error) {
      console.error('Error loading suggested friends:', error)
      // Fallback: just get some users we're not following
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(20)

      if (data) {
        const filtered = data.filter(p => !followingIds.has(p.id)).slice(0, 10)
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

      const followingList = await loadFollowData()
      loadSuggestedFriends(followingList)
    }
  }

  const handleUnfollow = async (userId: string) => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (!error) {
      const followingList = await loadFollowData()
      loadSuggestedFriends(followingList)
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
    // Track logout BEFORE signing out (while user is still identified)
    trackUserLoggedOut()

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      // Reset PostHog user identity
      resetUser()
      router.push('/auth')
    }
  }

  // Softer dark background (not pure black) - matches My Lists
  const softBg = colors.isDark ? '#0d0d0d' : colors.bgGradient

  if (loading || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: softBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: softBg, paddingBottom: '100px' }}>
      {/* Header */}
      <AppHeader profile={profile} hideOnScroll />

      {/* Profile Info - no container box, floats on background */}
      <div style={{
        padding: '1.5rem 0',
        margin: '82px auto 0',
        maxWidth: '398px'
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
              background: colors.goldAccent,
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

          {/* Settings Button */}
          <button
            onClick={() => router.push('/profile/settings')}
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
            Settings
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: colors.dividerColor, margin: '1rem 0' }} />

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingBottom: '1.5rem'
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

        {/* Divider after stats */}
        <div style={{ height: '1px', background: colors.dividerColor }} />
      </div>

      {/* Admin Link (shown for any admin role: owner, admin, or analyst) */}
      {profile?.admin_role && (
        <div style={{
          padding: '1rem 0',
          margin: '0 auto',
          maxWidth: '398px'
        }}>
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
            Go to Admin Dashboard
          </a>
        </div>
      )}

      {/* Invites Section */}
      <div style={{ margin: '0 auto', maxWidth: '398px' }}>
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
          onOpenSearch={() => setSearchOpen(true)}
          onNavigateToMyShows={() => router.push('/myshows')}
        />

        {/* Referral Dashboard */}
        <ReferralDashboard userId={user?.id} />
      </div>

      {/* Divider before Friends */}
      <div style={{ maxWidth: '398px', margin: '1.5rem auto 0' }}>
        <div style={{ height: '1px', background: colors.dividerColor }} />
      </div>

      {/* Friends Section - no container box */}
      <div style={{
        padding: '1.5rem 0',
        margin: '0 auto',
        maxWidth: '398px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0', color: colors.textPrimary }}>Friends</h3>

        {/* Three-Tab System: Following / Followers / Discover */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.dividerColor}`,
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setFriendsTab('following')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: friendsTab === 'following' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
              color: friendsTab === 'following' ? colors.goldAccent : colors.textSecondary,
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
              borderBottom: friendsTab === 'followers' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
              color: friendsTab === 'followers' ? colors.goldAccent : colors.textSecondary,
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
              borderBottom: friendsTab === 'discover' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
              color: friendsTab === 'discover' ? colors.goldAccent : colors.textSecondary,
              fontWeight: friendsTab === 'discover' ? '700' : '400',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Discover <span style={{ marginLeft: '0.25rem', display: 'inline-flex', verticalAlign: 'middle' }}><Icon name="search" size={16} /></span>
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
                    onMutualFriendsClick={(friends) => {
                      setMutualModalFriends(friends)
                      setMutualModalOpen(true)
                    }}
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
                    onMutualFriendsClick={(friends) => {
                      setMutualModalFriends(friends)
                      setMutualModalOpen(true)
                    }}
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
                      onMutualFriendsClick={(friends) => {
                        setMutualModalFriends(friends)
                        setMutualModalOpen(true)
                      }}
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
                      onMutualFriendsClick={(friends) => {
                        setMutualModalFriends(friends)
                        setMutualModalOpen(true)
                      }}
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

      <SearchModalEnhanced
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMedia={handleMediaSelect}
        user={user}
        profile={profile}
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

      <MutualFriendsModal
        isOpen={mutualModalOpen}
        onClose={() => setMutualModalOpen(false)}
        friends={mutualModalFriends}
        onFriendClick={(username) => router.push(`/${username}`)}
      />

      {/* Minimal Footer */}
      <Footer variant="minimal" />

      <BottomNav onSearchOpen={() => setSearchOpen(true)} />

    </div>
  )
}

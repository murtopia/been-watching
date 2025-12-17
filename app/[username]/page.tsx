'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { getTasteMatchBetweenUsers } from '@/utils/tasteMatch'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import MediaBadges from '@/components/media/MediaBadges'
import MediaCardGrid from '@/components/media/MediaCardGrid'
import AppHeader from '@/components/navigation/AppHeader'
import BottomNav from '@/components/navigation/BottomNav'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Grid3x3, List, Flag } from 'lucide-react'
import Icon from '@/components/ui/Icon'
import { trackUserFollowed, trackUserUnfollowed, trackProfileViewed } from '@/utils/analytics'
import DropdownMenu from '@/components/ui/DropdownMenu'
import ReportModal from '@/components/moderation/ReportModal'

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  is_private: boolean
  top_show_1?: any
  top_show_2?: any
  top_show_3?: any
}

interface Activity {
  id: string
  activity_type: string
  activity_data: {
    rating?: string
    status?: string
    previous_status?: string
    my_take?: string
  }
  created_at: string
  media?: {
    id: string
    title: string
    poster_path?: string
    media_type: string
  }
}

interface WatchStats {
  want: number
  watching: number
  watched: number
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const colors = useThemeColors()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isPendingFollow, setIsPendingFollow] = useState(false)
  const [followsMe, setFollowsMe] = useState(false)
  const [tasteMatchScore, setTasteMatchScore] = useState<number | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [watchStats, setWatchStats] = useState<WatchStats>({ want: 0, watching: 0, watched: 0 })
  const [loading, setLoading] = useState(true)
  const [canViewActivities, setCanViewActivities] = useState(false)
  const [topShows, setTopShows] = useState<any[]>([null, null, null])
  const [activeWatchTab, setActiveWatchTab] = useState<'want' | 'watching' | 'watched'>('want')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [watchListItems, setWatchListItems] = useState<any[]>([])
  const [loadingWatchList, setLoadingWatchList] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [username])

  useEffect(() => {
    if (profile && canViewActivities) {
      loadWatchList(activeWatchTab)
    }
  }, [profile, activeWatchTab, canViewActivities])

  const loadUserProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Load current user's profile for AppHeader
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentUserProfile(userProfile)
      }

      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !profileData) {
        console.error('Profile not found:', profileError)
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Load top shows
      const shows = [
        profileData.top_show_1 || null,
        profileData.top_show_2 || null,
        profileData.top_show_3 || null
      ]
      setTopShows(shows)

      // Check if current user is viewing their own profile
      const isOwnProfile = user?.id === profileData.id

      // Track profile view
      if (user) {
        trackProfileViewed({
          viewed_user_id: profileData.id,
          viewed_username: profileData.username,
          is_own_profile: isOwnProfile,
          is_private_profile: profileData.is_private
        })
      }

      // Check follow status
      if (user && !isOwnProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*, status')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .maybeSingle()

        // Check if following (accepted) or pending
        if (followData) {
          if (followData.status === 'accepted') {
            setIsFollowing(true)
            setIsPendingFollow(false)
          } else if (followData.status === 'pending') {
            setIsFollowing(false)
            setIsPendingFollow(true)
          }
        } else {
          setIsFollowing(false)
          setIsPendingFollow(false)
        }

        // Check if they follow us back (only count accepted follows)
        const { data: followsBackData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', profileData.id)
          .eq('following_id', user.id)
          .eq('status', 'accepted')
          .maybeSingle()

        setFollowsMe(!!followsBackData)

        // Calculate taste match if following
        if (followData && followData.status === 'accepted') {
          const match = await getTasteMatchBetweenUsers(user.id, profileData.id)
          setTasteMatchScore(match?.score || null)
        }
      }

      // Determine if viewer can see activities
      const canView = isOwnProfile || !profileData.is_private || isFollowing
      setCanViewActivities(canView)

      // Load watch stats
      await loadWatchStats(profileData.id)

      // Load activities if allowed
      if (canView) {
        await loadActivities(profileData.id)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setLoading(false)
    }
  }

  const loadWatchStats = async (userId: string) => {
    try {
      const { count: wantCount } = await supabase
        .from('watch_status')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'want')

      const { count: watchingCount } = await supabase
        .from('watch_status')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'watching')

      const { count: watchedCount } = await supabase
        .from('watch_status')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'watched')

      setWatchStats({
        want: wantCount || 0,
        watching: watchingCount || 0,
        watched: watchedCount || 0
      })
    } catch (error) {
      console.error('Error loading watch stats:', error)
    }
  }

  const loadActivities = async (userId: string) => {
    try {
      // Using !left for LEFT JOIN to include activities even if media doesn't exist
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          activity_type,
          activity_data,
          created_at,
          media:media_id!left (
            id,
            title,
            poster_path,
            media_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading activities:', error)
      }

      // Filter out activities without media (orphaned records)
      const validActivities: Activity[] = []
      if (data) {
        for (const item of data) {
          if (item.media && typeof item.media === 'object' && !Array.isArray(item.media)) {
            const mediaObj = item.media as any
            validActivities.push({
              id: item.id,
              activity_type: item.activity_type,
              activity_data: item.activity_data,
              created_at: item.created_at,
              media: {
                id: mediaObj.id,
                title: mediaObj.title,
                poster_path: mediaObj.poster_path,
                media_type: mediaObj.media_type
              }
            })
          }
        }
      }

      setActivities(validActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const loadWatchList = async (status: 'want' | 'watching' | 'watched', append: boolean = false) => {
    if (!profile) return

    if (append) {
      setLoadingMore(true)
    } else {
      setLoadingWatchList(true)
      setWatchListItems([])
      setHasMoreItems(true)
    }

    try {
      const offset = append ? watchListItems.length : 0
      const pageSize = 40

      const { data, error } = await supabase
        .from('watch_status')
        .select(`
          *,
          media (*)
        `)
        .eq('user_id', profile.id)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (data) {
        // Fetch ratings for each media item
        const mediaWithRatings = await Promise.all(
          data.map(async (item) => {
            const { data: ratingData } = await supabase
              .from('ratings')
              .select('rating')
              .eq('user_id', profile.id)
              .eq('media_id', item.media_id)
              .maybeSingle()

            return {
              ...item,
              user_rating: ratingData?.rating || null
            }
          })
        )

        if (append) {
          setWatchListItems(prev => [...prev, ...mediaWithRatings])
        } else {
          setWatchListItems(mediaWithRatings)
        }

        // Check if there are more items
        setHasMoreItems(data.length === pageSize)
      }
    } catch (error) {
      console.error('Error loading watch list:', error)
    } finally {
      setLoadingWatchList(false)
      setLoadingMore(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || !profile) return

    // Determine follow status based on whether target is private
    const followStatus = profile.is_private ? 'pending' : 'accepted'
    const notificationType = profile.is_private ? 'follow_request' : 'follow'

    // OPTIMISTIC UPDATE - Update UI immediately
    if (profile.is_private) {
      setIsPendingFollow(true)
    } else {
      setIsFollowing(true)
      setCanViewActivities(true)
    }

    try {
      await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: profile.id,
          status: followStatus
        })

      // Create appropriate notification
      await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          actor_id: currentUser.id,
          type: notificationType,
          target_type: 'profile',
          target_id: profile.id
        })

      // Calculate taste match after following
      const match = await getTasteMatchBetweenUsers(currentUser.id, profile.id)
      setTasteMatchScore(match?.score || null)

      // Track follow event
      trackUserFollowed({
        followed_user_id: profile.id,
        followed_username: profile.username,
        followed_display_name: profile.display_name,
        is_private_profile: profile.is_private
      })

      // Reload activities if profile is private
      if (profile.is_private) {
        await loadActivities(profile.id)
      }
    } catch (error) {
      console.error('Error following user:', error)
      // ROLLBACK on error
      setIsFollowing(false)
      if (profile.is_private) {
        setCanViewActivities(false)
      }
    }
  }

  const handleUnfollow = async () => {
    if (!currentUser || !profile) return

    // OPTIMISTIC UPDATE - Update UI immediately
    const previousTasteMatch = tasteMatchScore
    setIsFollowing(false)
    setTasteMatchScore(null)
    if (profile.is_private) {
      setCanViewActivities(false)
      setActivities([])
    }

    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)

      // Track unfollow event
      trackUserUnfollowed({
        unfollowed_user_id: profile.id,
        unfollowed_username: profile.username
      })
    } catch (error) {
      console.error('Error unfollowing user:', error)
      // ROLLBACK on error
      setIsFollowing(true)
      setTasteMatchScore(previousTasteMatch)
    }
  }

  const handleCancelRequest = async () => {
    if (!currentUser || !profile) return

    // OPTIMISTIC UPDATE
    setIsPendingFollow(false)

    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .eq('status', 'pending')

      // Also delete the follow_request notification
      await supabase
        .from('notifications')
        .delete()
        .eq('actor_id', currentUser.id)
        .eq('user_id', profile.id)
        .eq('type', 'follow_request')
    } catch (error) {
      console.error('Error canceling follow request:', error)
      // ROLLBACK on error
      setIsPendingFollow(true)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getFirstName = (displayName: string) => {
    if (!displayName) return 'User'
    return displayName.split(' ')[0]
  }

  const getActivityInfo = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'rated':
        const rating = activity.activity_data?.rating
        return {
          icon: rating === 'love' ? 'heart' : rating === 'like' ? 'thumbs-up' : 'meh-face',
          text: 'Rated',
          rating
        }
      case 'status_changed':
        const status = activity.activity_data?.status
        const statusText = status === 'watching' ? 'Started watching' : status === 'watched' ? 'Finished' : 'Added to list'
        return {
          icon: status === 'watching' ? 'play' : status === 'watched' ? 'check' : 'plus',
          text: statusText,
          status
        }
      default:
        return {
          icon: 'activity',
          text: 'Updated',
          status: null
        }
    }
  }

  const formatActivityText = (activity: Activity) => {
    const info = getActivityInfo(activity)
    return `${info.text} ${activity.media?.title}`
  }

  const handleShowClick = (item: any) => {
    // Transform the watch list item to match the media format expected by MediaDetailModal
    const mediaData = {
      ...item.media,
      // Extract watch status from the item
      currentStatus: item.status,
      currentRating: item.user_rating
    }
    setSelectedMedia(mediaData)
    setMediaModalOpen(true)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: '#0d0d0d'
      }}>
        <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: '#0d0d0d',
        color: colors.textPrimary
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>User not found</div>
        <div style={{ fontSize: '1rem', color: colors.textTertiary, marginBottom: '2rem' }}>@{username} doesn't exist</div>
        <button
          onClick={() => router.push(currentUser ? '/feed' : '/welcome')}
          style={{
            padding: '0.75rem 1.5rem',
            background: colors.goldAccent,
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  // Softer background like /profile page
  const softBg = '#0d0d0d'

  return (
    <div style={{
      maxWidth: '398px',
      margin: '0 auto',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: softBg
    }}>
      {/* App Header */}
      <AppHeader profile={currentUserProfile} hideOnScroll />

      {/* Report Modal */}
      {profile && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="user"
          targetId={profile.id}
          targetUsername={profile.username}
        />
      )}

      {/* Profile Info */}
      <div style={{
        padding: '1.5rem 0',
        marginTop: '70px'
      }}>
        {/* Row 1: Avatar + Name/Username + Follow Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0.75rem'
        }}>
          {/* Avatar */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: profile.avatar_url ? 'transparent' : colors.brandGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'white',
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              getInitials(profile.display_name)
            )}
          </div>

          {/* Name and Username */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem', color: colors.textPrimary }}>
              {profile.display_name}
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
              @{profile.username}
            </div>
          </div>

          {/* Follow Button (or Settings for own profile) */}
          {!isOwnProfile ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={
                  isFollowing ? handleUnfollow : 
                  isPendingFollow ? handleCancelRequest : 
                  handleFollow
                }
                disabled={!currentUser}
                style={{
                  padding: '0.5rem 1rem',
                  background: isFollowing || isPendingFollow ? colors.cardBg : colors.goldAccent,
                  color: isFollowing || isPendingFollow ? colors.textSecondary : '#000000',
                  border: isFollowing || isPendingFollow ? colors.cardBorder : 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: currentUser ? 'pointer' : 'not-allowed',
                  opacity: currentUser ? 1 : 0.5,
                  whiteSpace: 'nowrap'
                }}
              >
                {isFollowing ? 'Following' : isPendingFollow ? 'Requested' : 'Follow'}
              </button>
              <DropdownMenu
                size={18}
                items={[
                  {
                    label: 'Report User',
                    icon: <Flag size={14} />,
                    onClick: () => setShowReportModal(true),
                    danger: true
                  }
                ]}
              />
            </div>
          ) : (
            <button
              onClick={() => router.push('/profile')}
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
          )}
        </div>

        {/* Row 2: Bio - full width */}
        <div style={{ fontSize: '0.875rem', color: colors.textSecondary, lineHeight: '1.5', marginBottom: '0.75rem' }}>
          {profile.bio || 'What have you been watching?'}
        </div>

        {/* Row 3: Taste Match and Follows badges - directly under bio */}
        {(tasteMatchScore !== null && tasteMatchScore > 0) || followsMe ? (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {tasteMatchScore !== null && tasteMatchScore > 0 && (
              <div style={{
                padding: '0.5rem 1rem',
                background: colors.goldGlassBg,
                color: colors.textPrimary,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: colors.goldBorder
              }}>
                {tasteMatchScore >= 90 ? '🔥' : tasteMatchScore >= 70 ? '⭐' : '👍'} {tasteMatchScore}% Match
              </div>
            )}
            {followsMe && (
              <div style={{
                padding: '0.5rem 1rem',
                background: colors.goldGlassBg,
                color: colors.textPrimary,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: colors.goldBorder
              }}>
                Follows You
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Divider after header */}
      <div style={{ height: '1px', background: colors.dividerColor, margin: '0.5rem 0 1rem' }} />

      {/* Old Stats - Remove this section */}
      <div style={{ display: 'none' }}>
        <div style={{
          padding: '1.5rem',
          background: colors.cardBg,
          borderRadius: '12px',
          border: colors.cardBorder,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.brandPink, marginBottom: '0.25rem' }}>
            {watchStats.want}
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textTertiary, fontWeight: '600' }}>
            Want to Watch
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          background: colors.cardBg,
          borderRadius: '12px',
          border: colors.cardBorder,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.brandOrange, marginBottom: '0.25rem' }}>
            {watchStats.watching}
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textTertiary, fontWeight: '600' }}>
            Watching
          </div>
        </div>
        <div style={{
          padding: '1.5rem',
          background: colors.cardBg,
          borderRadius: '12px',
          border: colors.cardBorder,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: colors.textSecondary, marginBottom: '0.25rem' }}>
            {watchStats.watched}
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textTertiary, fontWeight: '600' }}>
            Watched
          </div>
        </div>
      </div>

      {/* Top 3 Shows */}
      {canViewActivities && (
        <div style={{
          padding: '1rem 0',
          marginBottom: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: colors.textPrimary }}>
            {getFirstName(profile.display_name)}'s Top 3 Shows
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            {topShows.map((show, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '2/3',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: show ? 'transparent' : colors.cardBg,
                  border: show ? colors.goldBorderThin : (colors.isDark ? '2px dashed rgba(255, 255, 255, 0.2)' : '2px dashed #ddd'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                {show ? (
                  <>
                    <img
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                      alt={show.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: colors.goldAccent,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </div>
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: colors.textTertiary,
                    padding: '1rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
                    <div style={{ fontSize: '0.75rem' }}>Not set</div>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#ccc',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider before Watch Lists */}
      {canViewActivities && (
        <div style={{ height: '1px', background: colors.dividerColor, margin: '1rem 0' }} />
      )}

      {/* Watch Lists */}
      {canViewActivities && (
        <div style={{
          padding: '1rem 0',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>
              Watch Lists
            </h3>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: viewMode === 'grid' ? colors.goldAccent : colors.cardBg,
                  color: viewMode === 'grid' ? '#000' : colors.textPrimary,
                  border: colors.cardBorder,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                aria-label="Grid view"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: viewMode === 'list' ? colors.goldAccent : colors.cardBg,
                  color: viewMode === 'list' ? '#000' : colors.textPrimary,
                  border: colors.cardBorder,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                aria-label="List view"
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${colors.dividerColor}`,
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveWatchTab('want')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                borderBottom: activeWatchTab === 'want' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: colors.textPrimary
              }}>
                {watchStats.want}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: activeWatchTab === 'want' ? colors.goldAccent : colors.textSecondary,
                fontWeight: activeWatchTab === 'want' ? '700' : '400'
              }}>
                Want to Watch
              </div>
            </button>
            <button
              onClick={() => setActiveWatchTab('watching')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                borderBottom: activeWatchTab === 'watching' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: colors.textPrimary
              }}>
                {watchStats.watching}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: activeWatchTab === 'watching' ? colors.goldAccent : colors.textSecondary,
                fontWeight: activeWatchTab === 'watching' ? '700' : '400'
              }}>
                Watching
              </div>
            </button>
            <button
              onClick={() => setActiveWatchTab('watched')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                borderBottom: activeWatchTab === 'watched' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: colors.textPrimary
              }}>
                {watchStats.watched}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: activeWatchTab === 'watched' ? colors.goldAccent : colors.textSecondary,
                fontWeight: activeWatchTab === 'watched' ? '700' : '400'
              }}>
                Watched
              </div>
            </button>
          </div>

          {/* Watch List Content */}
          {loadingWatchList ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: `4px solid ${colors.goldAccent}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : watchListItems.length > 0 ? (
            <MediaCardGrid
              items={watchListItems}
              variant={viewMode === 'list' ? 'compact' : 'grid'}
              onCardClick={handleShowClick}
              showActions={false}
              showOverview={false}
              posterSize={viewMode === 'grid' ? 'w342' : 'w185'}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: colors.textTertiary }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No shows yet</div>
              <div style={{ fontSize: '0.875rem' }}>
                {activeWatchTab === 'want' ? 'No shows in want to watch list' :
                 activeWatchTab === 'watching' ? 'Not currently watching any shows' :
                 'No shows watched yet'}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {!loadingWatchList && watchListItems.length > 0 && hasMoreItems && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => loadWatchList(activeWatchTab, true)}
                disabled={loadingMore}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loadingMore ? colors.cardBg : colors.goldAccent,
                  color: loadingMore ? colors.textSecondary : '#000',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  opacity: loadingMore ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                {loadingMore ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Divider before Recent Activity */}
      <div style={{ height: '1px', background: colors.dividerColor, margin: '1rem 0' }} />

      {/* Recent Activity */}
      {canViewActivities ? (
        <div style={{
          padding: '1rem 0',
          marginBottom: '5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: colors.textPrimary }}>
            {getFirstName(profile.display_name)}'s Recent Activity
          </h3>
          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activities.map((activity) => {
                const activityInfo = getActivityInfo(activity)
                return (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.375rem 0',
                      borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
                    }}
                  >
                    {/* Poster thumbnail */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {activity.media?.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${activity.media.poster_path}`}
                          alt={activity.media?.title || ''}
                          style={{ 
                            width: '24px', 
                            height: '36px', 
                            borderRadius: '2px', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '24px',
                          height: '36px',
                          borderRadius: '2px',
                          background: colors.cardBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '0.5rem', color: colors.textTertiary }}>?</span>
                        </div>
                      )}
                    </div>

                    {/* Activity content */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.8125rem', 
                        fontWeight: '500', 
                        color: colors.textPrimary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {activity.media?.title}
                      </span>
                      {/* Rating badge for rated activities */}
                      {activity.activity_type === 'rated' && activityInfo.rating && (
                        <Icon 
                          name={activityInfo.icon as any} 
                          state="active" 
                          size={16} 
                        />
                      )}
                    </div>

                    {/* Time */}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: colors.textTertiary,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: colors.textTertiary }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <div style={{ fontSize: '0.9375rem' }}>No activity yet</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '3rem 0',
          textAlign: 'center',
          marginBottom: '5rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.textPrimary }}>
            This profile is private
          </div>
          <div style={{ fontSize: '0.9375rem', color: colors.textTertiary }}>
            Follow @{profile.username} to see their activity
          </div>
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          isOpen={mediaModalOpen}
          onClose={() => {
            setMediaModalOpen(false)
            setSelectedMedia(null)
          }}
          media={selectedMedia}
          user={currentUser}
          onStatusChange={async () => {
            // Reload the watch list and stats when status changes
            if (profile) {
              await loadWatchStats(profile.id)
              await loadWatchList(activeWatchTab)
            }
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

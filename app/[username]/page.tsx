'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { getTasteMatchBetweenUsers } from '@/utils/tasteMatch'
import ShowDetailCard from '@/components/media/ShowDetailCard'
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

// Activity grouping window - 5 minutes
// Groups rating + status changes that happen close together
const ACTIVITY_GROUP_WINDOW_MS = 5 * 60 * 1000

// Group activities by user_id + media_id within time window
// Combines "rated" and "status_changed" activities into a single item
function groupActivities(activities: any[]): any[] {
  if (!activities || activities.length === 0) return []
  
  const grouped: Map<string, any[]> = new Map()
  
  for (const activity of activities) {
    // Use activity_group_id if available (database-level grouping)
    // Otherwise fall back to user_id + media_id (for historical activities)
    const groupKey = activity.activity_group_id 
      ? `group-${activity.activity_group_id}`
      : `${activity.user_id}-${activity.media_id}`
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, [])
    }
    grouped.get(groupKey)!.push(activity)
  }
  
  // For each group, combine activities within the time window
  const result: any[] = []
  
  for (const [, groupActivities] of grouped) {
    // Sort by created_at desc
    groupActivities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    // Go through activities and combine those within the time window
    let i = 0
    while (i < groupActivities.length) {
      const primary = groupActivities[i]
      const combinedActivities = [primary]
      
      // Look for related activities within the time window
      let j = i + 1
      while (j < groupActivities.length) {
        const other = groupActivities[j]
        const timeDiff = Math.abs(
          new Date(primary.created_at).getTime() - 
          new Date(other.created_at).getTime()
        )
        
        if (timeDiff <= ACTIVITY_GROUP_WINDOW_MS) {
          combinedActivities.push(other)
          j++
        } else {
          break
        }
      }
      
      if (combinedActivities.length > 1) {
        // Merge activity_data from all combined activities
        const mergedData: any = {}
        for (const act of combinedActivities) {
          Object.assign(mergedData, act.activity_data)
        }
        mergedData.combined_activities = combinedActivities.map(a => ({
          type: a.activity_type,
          data: a.activity_data
        }))
        
        // Combine multiple activities into one
        const combined = {
          ...primary,
          id: primary.id,
          activity_type: combinedActivities.map(a => a.activity_type).join('+'),
          activity_data: mergedData,
          created_at: primary.created_at
        }
        result.push(combined)
        i = j // Skip the combined activities
      } else {
        result.push(primary)
        i++
      }
    }
  }
  
  // Sort final result by created_at desc
  result.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  return result
}

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

  // Set body background to match page background
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#0d0d0d'
    document.body.style.backgroundColor = '#0d0d0d'
    return () => {
      document.documentElement.style.backgroundColor = ''
      document.body.style.backgroundColor = ''
    }
  }, [])

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

      // Apply activity grouping to combine related activities within time window
      const groupedActivities = groupActivities(validActivities)
      setActivities(groupedActivities)
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

  // Badge styles matching UserActivityCard
  const ACTIVITY_BADGES = {
    loved: {
      text: 'Loved',
      icon: 'heart',
      color: 'rgba(255, 59, 92, 0.25)',
      borderColor: 'rgba(255, 59, 92, 0.5)',
    },
    liked: {
      text: 'Liked',
      icon: 'thumbs-up',
      color: 'rgba(59, 130, 246, 0.25)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    meh: {
      text: 'Meh',
      icon: 'meh-face',
      color: 'rgba(142, 142, 147, 0.25)',
      borderColor: 'rgba(142, 142, 147, 0.5)',
    },
    watching: {
      text: 'Started Watching',
      icon: 'play',
      color: 'rgba(59, 130, 246, 0.25)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    watched: {
      text: 'Watched',
      icon: 'check',
      color: 'rgba(52, 211, 153, 0.25)',
      borderColor: 'rgba(52, 211, 153, 0.5)',
    },
    want: {
      text: 'Want to Watch',
      icon: 'bookmark',
      color: 'rgba(168, 85, 247, 0.25)',
      borderColor: 'rgba(168, 85, 247, 0.5)',
    },
  }

  const getActivityBadges = (activity: Activity) => {
    // Handle combined activity types (e.g., "rated+status_changed")
    const types = activity.activity_type.split('+')
    const hasRating = types.includes('rated')
    const hasStatus = types.includes('status_changed')
    
    const rating = activity.activity_data?.rating
    const status = activity.activity_data?.status
    
    const badges: Array<typeof ACTIVITY_BADGES.loved> = []
    
    // Add rating badge
    if (hasRating && rating) {
      if (rating === 'love') badges.push(ACTIVITY_BADGES.loved)
      else if (rating === 'like') badges.push(ACTIVITY_BADGES.liked)
      else badges.push(ACTIVITY_BADGES.meh)
    }
    
    // Add status badge
    if (hasStatus && status) {
      if (status === 'watching') badges.push(ACTIVITY_BADGES.watching)
      else if (status === 'watched') badges.push(ACTIVITY_BADGES.watched)
      else if (status === 'want') badges.push(ACTIVITY_BADGES.want)
    }
    
    return badges
  }


  const handleShowClick = (item: any) => {
    // Transform the watch list item to match what ShowDetailCard expects
    // This matches the format used in /myshows handlePosterClick
    const tmdbData = item.media?.tmdb_data || {}
    const media = {
      id: item.media?.id,
      title: item.media?.title,
      posterUrl: item.media?.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.media.poster_path}`
        : undefined,
      backdropUrl: tmdbData.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}`
        : undefined,
      year: tmdbData.release_date?.substring(0, 4) || tmdbData.first_air_date?.substring(0, 4),
      genres: tmdbData.genres?.map((g: any) => g.name) || [],
      rating: tmdbData.vote_average,
      synopsis: tmdbData.overview,
      creator: tmdbData.created_by?.[0]?.name || tmdbData.production_companies?.[0]?.name,
      cast: tmdbData.credits?.cast?.slice(0, 6).map((c: any) => c.name) || [],
      network: tmdbData.networks?.[0]?.name || tmdbData.production_companies?.[0]?.name,
      mediaType: item.media?.media_type === 'tv' ? 'TV' : 'Movie',
      season: tmdbData.season_number,
      tmdb_id: item.media?.tmdb_id,
      // Store current rating and status for the card
      currentRating: item.user_rating,
      currentStatus: item.status
    }
    setSelectedMedia(media)
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
        background: colors.background
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
        background: colors.background,
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
  return (
    <div style={{
      maxWidth: '398px',
      margin: '0 auto',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: colors.background
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
                const badges = getActivityBadges(activity)
                return (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      gap: '0.625rem',
                      padding: '0.5rem 0',
                      borderBottom: `1px solid ${colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
                    }}
                  >
                    {/* Poster thumbnail */}
                    <div style={{ flexShrink: 0 }}>
                      {activity.media?.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${activity.media.poster_path}`}
                          alt={activity.media?.title || ''}
                          style={{ 
                            width: '32px', 
                            height: '48px', 
                            borderRadius: '4px', 
                            objectFit: 'cover' 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '48px',
                          borderRadius: '4px',
                          background: colors.cardBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '0.625rem', color: colors.textTertiary }}>?</span>
                        </div>
                      )}
                    </div>

                    {/* Activity content - Two lines */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.375rem' }}>
                      {/* Line 1: Title + Time */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: colors.textPrimary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {activity.media?.title}
                        </span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: colors.textTertiary,
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}>
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                      
                      {/* Line 2: Activity badges - text only to match activity card fronts */}
                      {badges.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {badges.map((badge, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.25rem 0.625rem',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: badge.color,
                                border: `1px solid ${badge.borderColor}`,
                                color: 'white'
                              }}
                            >
                              {badge.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

      {/* Show Detail Card - back of card design */}
      <ShowDetailCard
        isOpen={mediaModalOpen}
        onClose={() => {
          setMediaModalOpen(false)
          setSelectedMedia(null)
        }}
        media={selectedMedia || {
          id: '',
          title: '',
        }}
        currentUser={currentUserProfile ? {
          id: currentUser?.id || '',
          name: currentUserProfile.display_name || currentUserProfile.username || '',
          avatar: currentUserProfile.avatar_url
        } : undefined}
        initialRating={selectedMedia?.currentRating}
        initialStatus={selectedMedia?.currentStatus}
        onRate={async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
          if (!currentUser || !selectedMedia) return
          try {
            if (rating === null) {
              await supabase
                .from('ratings')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('media_id', mediaId)
            } else {
              await supabase
                .from('ratings')
                .upsert({
                  user_id: currentUser.id,
                  media_id: mediaId,
                  rating: rating
                }, { onConflict: 'user_id,media_id' })
            }
            // Update local state
            setSelectedMedia((prev: any) => prev ? { ...prev, currentRating: rating } : null)
          } catch (error) {
            console.error('Error rating:', error)
          }
        }}
        onSetStatus={async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
          if (!currentUser || !selectedMedia) return
          try {
            if (status === null) {
              await supabase
                .from('watch_status')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('media_id', mediaId)
            } else {
              await supabase
                .from('watch_status')
                .upsert({
                  user_id: currentUser.id,
                  media_id: mediaId,
                  status: status
                }, { onConflict: 'user_id,media_id' })
            }
            // Update local state
            setSelectedMedia((prev: any) => prev ? { ...prev, currentStatus: status } : null)
          } catch (error) {
            console.error('Error setting status:', error)
          }
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav onSearchOpen={() => {}} />
    </div>
  )
}

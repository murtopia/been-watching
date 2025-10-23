'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { getTasteMatchBetweenUsers } from '@/utils/tasteMatch'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import { useThemeColors } from '@/hooks/useThemeColors'

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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followsMe, setFollowsMe] = useState(false)
  const [tasteMatchScore, setTasteMatchScore] = useState<number | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [watchStats, setWatchStats] = useState<WatchStats>({ want: 0, watching: 0, watched: 0 })
  const [loading, setLoading] = useState(true)
  const [canViewActivities, setCanViewActivities] = useState(false)
  const [topShows, setTopShows] = useState<any[]>([null, null, null])
  const [activeWatchTab, setActiveWatchTab] = useState<'want' | 'watching' | 'watched'>('want')
  const [watchListItems, setWatchListItems] = useState<any[]>([])
  const [loadingWatchList, setLoadingWatchList] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

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

      // Check follow status
      if (user && !isOwnProfile) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .maybeSingle()

        setIsFollowing(!!followData)

        // Check if they follow us back
        const { data: followsBackData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', profileData.id)
          .eq('following_id', user.id)
          .maybeSingle()

        setFollowsMe(!!followsBackData)

        // Calculate taste match if following
        if (followData) {
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

  const loadWatchList = async (status: 'want' | 'watching' | 'watched') => {
    if (!profile) return

    setLoadingWatchList(true)
    try {
      const { data, error } = await supabase
        .from('watch_status')
        .select(`
          *,
          media (*)
        `)
        .eq('user_id', profile.id)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(20)

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
        setWatchListItems(mediaWithRatings)
      }
    } catch (error) {
      console.error('Error loading watch list:', error)
    } finally {
      setLoadingWatchList(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || !profile) return

    try {
      await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: profile.id,
          status: 'accepted'
        })

      // Create notification for the user being followed
      await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          actor_id: currentUser.id,
          type: 'follow',
          target_type: 'profile',
          target_id: profile.id
        })

      setIsFollowing(true)

      // Calculate taste match after following
      const match = await getTasteMatchBetweenUsers(currentUser.id, profile.id)
      setTasteMatchScore(match?.score || null)

      // Reload activities if profile is private
      if (profile.is_private) {
        setCanViewActivities(true)
        await loadActivities(profile.id)
      }
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleUnfollow = async () => {
    if (!currentUser || !profile) return

    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)

      setIsFollowing(false)
      setTasteMatchScore(null)

      // Hide activities if profile is private
      if (profile.is_private) {
        setCanViewActivities(false)
        setActivities([])
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatActivityText = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'rated':
        const rating = activity.activity_data?.rating
        const ratingEmoji = rating === 'love' ? '❤️' : rating === 'like' ? '👍' : rating === 'dislike' ? '👎' : '💔'
        return `Rated ${activity.media?.title} ${ratingEmoji}`
      case 'status_changed':
        const status = activity.activity_data?.status
        const statusText = status === 'watching' ? 'Started watching' : status === 'watched' ? 'Finished' : 'Added to list'
        return `${statusText} ${activity.media?.title}`
      default:
        return `Updated ${activity.media?.title}`
    }
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
        padding: '2rem'
      }}>
        <div style={{ fontSize: '1.5rem', color: colors.textTertiary }}>Loading...</div>
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
        padding: '2rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>User not found</div>
        <div style={{ fontSize: '1rem', color: colors.textTertiary, marginBottom: '2rem' }}>@{username} doesn't exist</div>
        <button
          onClick={() => router.push('/profile')}
          style={{
            padding: '0.75rem 1.5rem',
            background: colors.brandGradient,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      {/* Sticky Navigation Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: colors.cardBg,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.2s',
            fontSize: '1.25rem',
            color: colors.textPrimary
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          ←
        </button>

        {/* Profile Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: colors.textPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            @{profile.username}
          </div>
          {profile.display_name && (
            <div style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {profile.display_name}
            </div>
          )}
        </div>

        {/* Follow Button (if not own profile) */}
        {!isOwnProfile && (
          <button
            onClick={isFollowing ? handleUnfollow : handleFollow}
            disabled={!currentUser}
            style={{
              padding: '0.5rem 1rem',
              background: isFollowing ? 'transparent' : 'linear-gradient(135deg, colors.brandPink 0%, colors.brandOrange 100%)',
              color: isFollowing ? colors.brandPink : 'white',
              border: isFollowing ? `2px solid ${colors.brandPink}` : 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: currentUser ? 'pointer' : 'not-allowed',
              opacity: currentUser ? 1 : 0.5,
              whiteSpace: 'nowrap'
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '0.5rem',
        padding: '1.5rem',
        background: 'white'
      }}>
        {/* Avatar */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: profile.avatar_url ? 'transparent' : 'linear-gradient(135deg, colors.brandPink 0%, colors.brandOrange 100%)',
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
            <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials(profile.display_name)
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem', color: colors.textPrimary }}>
            {profile.display_name}
          </div>
          {profile.bio && (
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary, lineHeight: '1.5' }}>
              {profile.bio}
            </div>
          )}
        </div>
      </div>


      {/* Taste Match and Follows badges */}
      {(tasteMatchScore !== null && tasteMatchScore > 0) || followsMe ? (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem 1.5rem',
          background: 'white',
          marginBottom: '0.5rem'
        }}>
          {tasteMatchScore !== null && tasteMatchScore > 0 && (
            <div style={{
              padding: '0.5rem 1rem',
              background: tasteMatchScore >= 70 ? 'linear-gradient(135deg, colors.brandPink 0%, colors.brandOrange 100%)' : '#f0f0f0',
              color: tasteMatchScore >= 70 ? 'white' : '#666',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {tasteMatchScore >= 90 ? '🔥' : tasteMatchScore >= 70 ? '⭐' : '👍'} {tasteMatchScore}% Match
            </div>
          )}
          {followsMe && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#f0f0f0',
              color: colors.textSecondary,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              Follows You
            </div>
          )}
        </div>
      ) : null}

      {/* Old Stats - Remove this section */}
      <div style={{ display: 'none' }}>
        <div style={{
          padding: '1.5rem',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
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
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
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
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
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
          background: 'white',
          padding: '1.5rem',
          marginBottom: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: colors.textPrimary }}>
            📺 Top 3 Shows
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
                  background: show ? 'transparent' : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
                      background: colors.brandBlue,
                      color: 'white',
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

      {/* Watch Lists */}
      {canViewActivities && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          marginBottom: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: colors.textPrimary }}>
            📚 Watch Lists
          </h3>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveWatchTab('want')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                borderBottom: activeWatchTab === 'want' ? `3px solid ${colors.brandBlue}` : '3px solid transparent',
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
                color: activeWatchTab === 'want' ? colors.brandBlue : '#666',
                fontWeight: activeWatchTab === 'want' ? '600' : '400'
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
                borderBottom: activeWatchTab === 'watching' ? `3px solid ${colors.brandBlue}` : '3px solid transparent',
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
                color: activeWatchTab === 'watching' ? colors.brandBlue : '#666',
                fontWeight: activeWatchTab === 'watching' ? '600' : '400'
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
                borderBottom: activeWatchTab === 'watched' ? `3px solid ${colors.brandBlue}` : '3px solid transparent',
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
                color: activeWatchTab === 'watched' ? colors.brandBlue : '#666',
                fontWeight: activeWatchTab === 'watched' ? '600' : '400'
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
                border: `4px solid ${colors.brandPink}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : watchListItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '1rem'
            }}>
              {watchListItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleShowClick(item)}
                  style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  {item.media?.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.media.poster_path}`}
                      alt={item.media.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: colors.textTertiary,
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      {item.media?.title || 'No Image'}
                    </div>
                  )}
                  {/* Rating Badge */}
                  {item.user_rating && (
                    <div style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      {item.user_rating === 'love' ? '❤️' : item.user_rating === 'like' ? '👍' : '😐'}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
        </div>
      )}

      {/* Recent Activity */}
      {canViewActivities ? (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          marginBottom: '5rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: colors.textPrimary }}>
            📺 Recent Activity
          </h3>
          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}
                >
                  {activity.media?.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${activity.media.poster_path}`}
                      alt={activity.media.title}
                      style={{ width: '40px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: colors.textPrimary, marginBottom: '0.25rem' }}>
                      {formatActivityText(activity)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: colors.textTertiary }}>
                      {formatTimeAgo(activity.created_at)}
                    </div>
                  </div>
                </div>
              ))}
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
          background: 'white',
          padding: '3rem 1.5rem',
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

      {/* Back Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '0.75rem 2rem',
            background: 'white',
            color: colors.textSecondary,
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>

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
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/navigation/BottomNav'
import ActivityCard from '@/components/feed/ActivityCard'
import SearchModal from '@/components/search/SearchModal'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import ProfileSetup from '@/components/onboarding/ProfileSetup'
import InviteCodeGate from '@/components/onboarding/InviteCodeGate'
import { Sparkles } from 'lucide-react'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showInviteCodeGate, setShowInviteCodeGate] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && !showInviteCodeGate && !showProfileSetup) {
      loadFeed()
      loadTrending()
    }
  }, [user, showInviteCodeGate, showProfileSetup])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/welcome')
    } else {
      setUser(user)

      // Check if profile is set up
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Check if user needs to provide invite code (OAuth users who haven't been approved)
        if (!profileData.is_approved && !profileData.invited_by_master_code) {
          setShowInviteCodeGate(true)
        }
        // Check if username is set (new user check)
        else if (!profileData.username || profileData.username === user.email?.split('@')[0]) {
          setShowProfileSetup(true)
        }
      } else if (profileError) {
        // Profile doesn't exist, create it (shouldn't happen with trigger, but fallback)
        const defaultUsername = user.email?.split('@')[0] || 'user'
        // Add timestamp to make username unique
        const uniqueUsername = `${defaultUsername}_${Date.now()}`
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            user_id: user.id,
            username: uniqueUsername,
            display_name: defaultUsername
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else if (newProfile) {
          setProfile(newProfile)
          // New OAuth user needs invite code
          setShowInviteCodeGate(true)
        }
      }
    }
  }

  const loadFeed = async () => {
    try {
      // Load activities from all users (or following in the future)
      const { data: activitiesData } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          ),
          media (*)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (activitiesData && activitiesData.length > 0) {
        // Get likes and comments count for each activity
        const activitiesWithCounts = await Promise.all(
          activitiesData.map(async (activity) => {
            const { count: likeCount } = await supabase
              .from('activity_likes')
              .select('*', { count: 'exact', head: true })
              .eq('activity_id', activity.id)

            const { count: commentCount } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('activity_id', activity.id)

            const { data: userLike } = await supabase
              .from('activity_likes')
              .select('id')
              .eq('activity_id', activity.id)
              .eq('user_id', user?.id)
              .maybeSingle()

            // Get all likes with user info
            const { data: likes } = await supabase
              .from('activity_likes')
              .select(`
                id,
                user:profiles!activity_likes_user_id_fkey (
                  id,
                  display_name,
                  avatar_url
                )
              `)
              .eq('activity_id', activity.id)

            // Get all comments with user info
            const { data: comments } = await supabase
              .from('comments')
              .select(`
                id,
                comment_text,
                user_id,
                created_at,
                user:profiles!comments_user_id_fkey (
                  id,
                  display_name,
                  avatar_url
                )
              `)
              .eq('activity_id', activity.id)
              .order('created_at', { ascending: true })

            // Get current user's rating for this media
            const { data: userRating } = await supabase
              .from('ratings')
              .select('rating')
              .eq('user_id', user?.id)
              .eq('media_id', activity.media_id)
              .maybeSingle()

            // Get current user's watch status for this media
            const { data: userWatchStatus } = await supabase
              .from('watch_status')
              .select('status')
              .eq('user_id', user?.id)
              .eq('media_id', activity.media_id)
              .maybeSingle()

            return {
              ...activity,
              user: activity.profiles,
              like_count: likeCount || 0,
              comment_count: commentCount || 0,
              user_liked: !!userLike,
              likes: likes || [],
              comments: comments || [],
              user_rating: userRating?.rating || null,
              user_status: userWatchStatus?.status || null
            }
          })
        )

        setActivities(activitiesWithCounts)
      } else {
        // Show dummy data for demonstration
        const dummyActivities = [
          {
            id: 'dummy-1',
            user: {
              id: 'user-1',
              username: 'sarah_jones',
              display_name: 'Sarah Jones',
              avatar_url: null
            },
            media: {
              id: 'tv-110492',
              title: 'Peacemaker',
              poster_path: '/hE3LRZAY84fG19a18pzpkZERjTE.jpg',
              release_date: '2022-01-13',
              vote_average: 8.3,
              overview: 'The continuing story of Peacemaker – a compellingly vainglorious man who believes in peace at any cost, no matter how many people he has to kill to get it – in the aftermath of the events of "The Suicide Squad."'
            },
            activity_type: 'rated',
            activity_data: {
              rating: 'love',
              my_take: 'This show is absolutely hilarious! John Cena is perfect in this role.'
            },
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            like_count: 12,
            comment_count: 3,
            user_liked: false,
            user_rating: null,
            user_status: null,
            likes: [
              {
                id: 'like-1',
                user: {
                  id: 'user-2',
                  display_name: 'Mike Chen',
                  avatar_url: null
                }
              },
              {
                id: 'like-2',
                user: {
                  id: 'user-3',
                  display_name: 'Emily Rose',
                  avatar_url: null
                }
              }
            ],
            comments: [
              {
                id: 'comment-1',
                comment_text: 'Totally agree! John Cena was amazing in this role.',
                user_id: 'user-2',
                user: {
                  id: 'user-2',
                  display_name: 'Mike Chen',
                  avatar_url: null
                }
              },
              {
                id: 'comment-2',
                comment_text: 'One of my favorite DC shows!',
                user_id: 'user-3',
                user: {
                  id: 'user-3',
                  display_name: 'Emily Rose',
                  avatar_url: null
                }
              },
              {
                id: 'comment-3',
                comment_text: 'Can\'t wait for season 2!',
                user_id: 'user-4',
                user: {
                  id: 'user-4',
                  display_name: 'Alex Kim',
                  avatar_url: null
                }
              }
            ]
          },
          {
            id: 'dummy-2',
            user: {
              id: 'user-2',
              username: 'mike_chen',
              display_name: 'Mike Chen',
              avatar_url: null
            },
            media: {
              id: 'movie-533535',
              title: 'Deadpool & Wolverine',
              poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
              release_date: '2024-07-24',
              vote_average: 7.8,
              overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.'
            },
            activity_type: 'status_changed',
            activity_data: {
              status: 'watched',
              previous_status: 'watching'
            },
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            like_count: 8,
            comment_count: 1,
            user_liked: false,
            user_rating: null,
            user_status: null,
            likes: [],
            comments: []
          },
          {
            id: 'dummy-3',
            user: {
              id: 'user-3',
              username: 'emily_rose',
              display_name: 'Emily Rose',
              avatar_url: null
            },
            media: {
              id: 'tv-94997',
              title: 'House of the Dragon',
              poster_path: '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
              release_date: '2022-08-21',
              vote_average: 8.4,
              overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne.'
            },
            activity_type: 'rated',
            activity_data: {
              rating: 'like',
              my_take: 'Season 2 was intense! Can\'t wait for the next one.'
            },
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            like_count: 15,
            comment_count: 5,
            user_liked: false,
            user_rating: null,
            user_status: null,
            likes: [],
            comments: []
          },
          {
            id: 'dummy-4',
            user: {
              id: 'user-4',
              username: 'alex_kim',
              display_name: 'Alex Kim',
              avatar_url: null
            },
            media: {
              id: 'tv-76479',
              title: 'The Boys',
              poster_path: '/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
              release_date: '2019-07-26',
              vote_average: 8.5,
              overview: 'A group of vigilantes known informally as "The Boys" set out to take down corrupt superheroes with no more than blue-collar grit and a willingness to fight dirty.'
            },
            activity_type: 'status_changed',
            activity_data: {
              status: 'watching',
              previous_status: 'want'
            },
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            like_count: 6,
            comment_count: 2,
            user_liked: false,
            user_rating: null,
            user_status: null,
            likes: [],
            comments: []
          },
          {
            id: 'dummy-5',
            user: {
              id: 'user-5',
              username: 'jordan_taylor',
              display_name: 'Jordan Taylor',
              avatar_url: null
            },
            media: {
              id: 'movie-912649',
              title: 'Venom: The Last Dance',
              poster_path: '/k42Owka8v91trK1qMYwCQCNwJKr.jpg',
              release_date: '2024-10-22',
              vote_average: 6.8,
              overview: 'Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision that will bring the curtains down on Venom and Eddie\'s last dance.'
            },
            activity_type: 'rated',
            activity_data: {
              rating: 'meh',
              my_take: 'Disappointing ending to the trilogy. Expected more.'
            },
            created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
            like_count: 4,
            comment_count: 7,
            user_liked: false,
            user_rating: null,
            user_status: null,
            likes: [],
            comments: []
          }
        ]
        setActivities(dummyActivities)
      }
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrending = async () => {
    try {
      const response = await fetch('/api/tmdb/trending/all/week')
      const data = await response.json()
      setTrending(data.results?.slice(0, 6) || [])
    } catch (error) {
      console.error('Error loading trending:', error)
    }
  }

  const handleLike = async (activityId: string) => {
    if (!user) return

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('activity_likes')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingLike) {
        // Unlike
        await supabase
          .from('activity_likes')
          .delete()
          .eq('id', existingLike.id)
      } else {
        // Like
        await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: user.id
          })
      }

      // Reload feed to update counts
      loadFeed()
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handleComment = async (activityId: string, comment: string) => {
    if (!user || !comment.trim()) return

    try {
      await supabase
        .from('comments')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          comment_text: comment.trim()
        })

      // Reload feed to update counts
      loadFeed()
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleQuickRate = async (mediaId: string, rating: string) => {
    if (!user) return

    try {
      const { error: ratingError } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          media_id: mediaId,
          rating: rating,
          my_take: null
        }, { onConflict: 'user_id,media_id' })

      if (ratingError) {
        console.error('Error saving rating:', ratingError)
      } else {
        // Reload feed to show updated rating
        loadFeed()
      }
    } catch (error) {
      console.error('Error handling quick rate:', error)
    }
  }

  const handleQuickStatus = async (mediaId: string, status: string) => {
    if (!user) return

    try {
      const { error: statusError } = await supabase
        .from('watch_status')
        .upsert({
          user_id: user.id,
          media_id: mediaId,
          status: status
        }, { onConflict: 'user_id,media_id' })

      if (statusError) {
        console.error('Error saving status:', statusError)
      } else {
        // Reload feed to show updated status
        loadFeed()
      }
    } catch (error) {
      console.error('Error handling quick status:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // Only allow deleting your own comments

      if (error) {
        console.error('Error deleting comment:', error)
      } else {
        // Reload feed to update comment count
        loadFeed()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleMediaSelect = async (media: any, rating?: string, status?: string) => {
    if (!user) return

    try {
      // Create media ID format - handle both regular media and season-specific IDs
      let mediaId: string
      let tmdbId: number
      let mediaType: string

      // Check if this is already a season-specific ID (format: tv-{tmdb_id}-s{season_number})
      if (media.id && typeof media.id === 'string' && media.id.includes('-s')) {
        // Already has season-specific ID from TVSeasonCard
        mediaId = media.id
        // Extract TMDB ID from the format tv-{tmdb_id}-s{season_number}
        const idParts = media.id.split('-')
        tmdbId = parseInt(idParts[1])
        mediaType = idParts[0]
      } else {
        // Regular media without season
        mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie')
        tmdbId = typeof media.id === 'string' ? parseInt(media.id) : media.id
        mediaId = `${mediaType}-${tmdbId}`
      }

      // Fetch FULL media details from TMDB to get networks, seasons, etc.
      // For season-specific entries, we still fetch the full show data
      let fullMediaData = media
      try {
        const detailsResponse = await fetch(`/api/tmdb/${mediaType}/${tmdbId}`)
        if (detailsResponse.ok) {
          fullMediaData = await detailsResponse.json()
        }
      } catch (error) {
        console.error('Error fetching full media details:', error)
        // Fall back to basic media data if detailed fetch fails
      }

      // First, ensure media exists in database with FULL data
      const mediaPayload = {
        id: mediaId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title: media.title || media.name,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        overview: media.overview,
        release_date: media.release_date || media.first_air_date,
        vote_average: media.vote_average,
        tmdb_data: {
          ...fullMediaData,
          // Include season-specific info if available
          season_number: media.season_number,
          season_id: media.season_id
        }
      }

      console.log('Saving media with payload:', {
        id: mediaPayload.id,
        tmdb_id: mediaPayload.tmdb_id,
        media_type: mediaPayload.media_type,
        title: mediaPayload.title
      })

      const { error: mediaError } = await supabase
        .from('media')
        .upsert(mediaPayload, { onConflict: 'id' })

      if (mediaError) {
        console.error('Error saving media - Full error object:', mediaError)
        console.error('Error saving media:', {
          message: mediaError.message,
          details: mediaError.details,
          hint: mediaError.hint,
          code: mediaError.code
        })
        return // Don't proceed if media save fails
      }

      // Save rating if provided
      if (rating) {
        const { error: ratingError } = await supabase
          .from('ratings')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            rating: rating,
            my_take: null
          }, { onConflict: 'user_id,media_id' })

        if (ratingError) {
          console.error('Error saving rating:', {
            message: ratingError.message,
            details: ratingError.details,
            hint: ratingError.hint,
            code: ratingError.code
          })
        }
      }

      // Save watch status if provided
      if (status) {
        const { error: statusError } = await supabase
          .from('watch_status')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            status: status
          }, { onConflict: 'user_id,media_id' })

        if (statusError) {
          console.error('Error saving status:', {
            message: statusError.message,
            details: statusError.details,
            hint: statusError.hint,
            code: statusError.code
          })
        }
      }

      // Reload feed (keep modal open)
      loadFeed()
    } catch (error) {
      console.error('Error handling media selection:', error)
    }
  }

  const handlePosterClick = (media: any) => {
    setSelectedMedia(media)
    setDetailModalOpen(true)
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

  return (
    <>
      {/* Invite Code Gate for OAuth users */}
      {showInviteCodeGate && user && (
        <InviteCodeGate
          userId={user.id}
          onValidated={() => {
            setShowInviteCodeGate(false)
            setShowProfileSetup(true)
          }}
        />
      )}

      {/* Profile Setup Modal for new users */}
      {showProfileSetup && user && (
        <ProfileSetup
          userId={user.id}
          onComplete={() => {
            setShowProfileSetup(false)
            checkUser()
          }}
        />
      )}

    <div>
      {/* Header */}
      <nav className="nav-header">
        <div className="nav-content">
          <div className="logo">Been Watching</div>
          <button
            onClick={() => router.push('/profile')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.5rem'
            }}
          >
            {profile?.avatar_url ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  fontSize: '1rem'
                }}>
                  ✨
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '700'
                }}>
                  {profile?.display_name?.[0] || '?'}
                </div>
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  fontSize: '1rem'
                }}>
                  ✨
                </div>
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-container">
        {/* Trending Section */}
        {trending.length > 0 && (
          <div className="trending-section">
            <h2 className="section-title">Trending This Week</h2>
            <div className="shows-grid">
              {trending.map((item) => {
                const title = item.title || item.name
                return (
                  <div
                    key={item.id}
                    className="show-card"
                    onClick={() => handlePosterClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="poster-container">
                      <img
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={title}
                        className="show-poster"
                      />
                    </div>
                    <div className="show-title">{title}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDeleteComment={handleDeleteComment}
                  onQuickRate={handleQuickRate}
                  onQuickStatus={handleQuickStatus}
                  userRating={activity.user_rating}
                  userStatus={activity.user_status}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl">
              <p className="text-gray-500 mb-4">No activities yet</p>
              <button
                onClick={() => setSearchOpen(true)}
                className="px-6 py-2 bg-gradient-primary text-white rounded-full font-medium hover:scale-105 transition-transform"
              >
                Start Adding Shows
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onSearchOpen={() => setSearchOpen(true)} />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMedia={handleMediaSelect}
        user={user}
      />

      {/* Media Detail Modal */}
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
    </div>
    </>
  )
}
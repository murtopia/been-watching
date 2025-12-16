'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import BottomNav from '@/components/navigation/BottomNav'
import AppHeader from '@/components/navigation/AppHeader'
import SearchModalEnhanced from '@/components/search/SearchModalEnhanced'
import ShowDetailCard from '@/components/media/ShowDetailCard'
import MediaCardGrid from '@/components/media/MediaCardGrid'
import TopShowModal from '@/components/profile/TopShowModal'
import Footer from '@/components/navigation/Footer'
import { Grid3x3, List } from 'lucide-react'
import { safeFormatDate } from '@/utils/dateFormatting'
import { trackMediaRated, trackWatchStatusChanged, trackMyShowsViewed } from '@/utils/analytics'

export default function MyShowsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'want' | 'watching' | 'watched'>('watching')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ wantCount: 0, watchingCount: 0, watchedCount: 0, totalCount: 0 })
  const [searchOpen, setSearchOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [showTopShowModal, setShowTopShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [topShows, setTopShows] = useState<any[]>([null, null, null])
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [pendingRemoval, setPendingRemoval] = useState<{media: any, currentStatus: string} | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const colors = useThemeColors()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadMediaForTab(activeTab)
      loadCounts()

      // Track My Shows page view
      trackMyShowsViewed({
        tab: activeTab,
        view_mode: viewMode,
        items_count: mediaItems.length
      })
    }
  }, [user, activeTab])

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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      setProfile(data)
      // Load top 3 shows if they exist
      if (data.top_show_1) setTopShows(prev => [data.top_show_1, prev[1], prev[2]])
      if (data.top_show_2) setTopShows(prev => [prev[0], data.top_show_2, prev[2]])
      if (data.top_show_3) setTopShows(prev => [prev[0], prev[1], data.top_show_3])
    }
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

    const totalCount = (wantCount || 0) + (watchingCount || 0) + (watchedCount || 0)
    setCounts({ wantCount: wantCount || 0, watchingCount: watchingCount || 0, watchedCount: watchedCount || 0, totalCount })
  }

  const loadMediaForTab = async (status: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('watch_status')
        .select(`
          *,
          media (*)
        `)
        .eq('user_id', user.id)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (data) {
        // Fetch ratings for each media item
        const mediaWithRatings = await Promise.all(
          data.map(async (item) => {
            const { data: ratingData } = await supabase
              .from('ratings')
              .select('rating')
              .eq('user_id', user.id)
              .eq('media_id', item.media_id)
              .maybeSingle()

            return {
              ...item,
              user_rating: ratingData?.rating || null
            }
          })
        )
        setMediaItems(mediaWithRatings)
      }
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = async (media: any, rating?: string, status?: string) => {
    if (!user) return

    try {
      // Determine media type first
      const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie')

      // Get the media ID - it might already be in the correct format (e.g., "tv-12345-s1")
      // or it might just be the TMDB ID that needs formatting
      let mediaId: string
      let tmdbId: number

      if (media.id && typeof media.id === 'string' && (media.id.startsWith('tv-') || media.id.startsWith('movie-'))) {
        // Already in correct format (from database)
        mediaId = media.id
        tmdbId = media.tmdb_id || parseInt(media.id.split('-')[1])
      } else {
        // Need to construct it (from search/new media)
        tmdbId = media.tmdb_id || media.id
        mediaId = `${mediaType}-${tmdbId}`
      }

      console.log('handleMediaSelect: Using mediaId:', mediaId, 'for media:', media)

      // First, ensure media exists in database
      await supabase
        .from('media')
        .upsert({
          id: mediaId,
          tmdb_id: tmdbId,
          media_type: mediaType,
          title: media.title || media.name,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          overview: media.overview,
          release_date: safeFormatDate(media.release_date || media.first_air_date),
          vote_average: media.vote_average,
          tmdb_data: media
        }, { onConflict: 'id' })

      // Save rating if provided
      if (rating !== undefined) {
        if (rating === null) {
          // Delete rating if null (user unchecked)
          await supabase
            .from('ratings')
            .delete()
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
        } else {
          await supabase
            .from('ratings')
            .upsert({
              user_id: user.id,
              media_id: mediaId,
              rating: rating
            }, { onConflict: 'user_id,media_id' })

          // Track rating event (only when adding/changing rating, not removing)
          const mediaIdStr = String(mediaId)
          const seasonNumber = mediaIdStr.includes('-s')
            ? parseInt(mediaIdStr.split('-s')[1])
            : undefined

          // Check if there's a comment for this media
          const { data: commentData } = await supabase
            .from('show_comments')
            .select('id')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .maybeSingle()

          trackMediaRated({
            media_id: mediaId,
            media_type: mediaType as 'movie' | 'tv',
            media_title: media.title || media.name,
            rating: rating as 'meh' | 'like' | 'love',
            season_number: seasonNumber,
            has_comment: !!commentData
          })
        }
      }

      // Save status if provided
      if (status !== undefined) {
        // Get old status for tracking
        const { data: oldStatusData } = await supabase
          .from('watch_status')
          .select('status')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .maybeSingle()

        const oldStatus = oldStatusData?.status

        if (status === null) {
          // Delete watch_status if null (user unchecked)
          await supabase
            .from('watch_status')
            .delete()
            .eq('user_id', user.id)
            .eq('media_id', mediaId)

          // Track status removal
          if (oldStatus) {
            const mediaIdStr = String(mediaId)
            const seasonNumber = mediaIdStr.includes('-s')
              ? parseInt(mediaIdStr.split('-s')[1])
              : undefined

            trackWatchStatusChanged({
              media_id: mediaId,
              media_type: mediaType as 'movie' | 'tv',
              media_title: media.title || media.name,
              old_status: oldStatus as 'want' | 'watching' | 'watched',
              new_status: null,
              season_number: seasonNumber
            })
          }
        } else {
          await supabase
            .from('watch_status')
            .upsert({
              user_id: user.id,
              media_id: mediaId,
              status: status
            }, { onConflict: 'user_id,media_id' })

          // Track status change
          const mediaIdStr = String(mediaId)
          const seasonNumber = mediaIdStr.includes('-s')
            ? parseInt(mediaIdStr.split('-s')[1])
            : undefined

          trackWatchStatusChanged({
            media_id: mediaId,
            media_type: mediaType as 'movie' | 'tv',
            media_title: media.title || media.name,
            old_status: oldStatus as 'want' | 'watching' | 'watched' | null,
            new_status: status as 'want' | 'watching' | 'watched',
            season_number: seasonNumber
          })
        }
      }

      // Reload data (keep modal open)
      loadMediaForTab(activeTab)
      loadCounts()
    } catch (error) {
      console.error('Error handling media select:', error)
    }
  }

  const handlePosterClick = (mediaItem: any) => {
    // Convert media item format to match what ShowDetailCard expects
    const tmdbData = mediaItem.media.tmdb_data || {}
    const media = {
      id: mediaItem.media.id, // Use the full media ID (e.g., tv-12345-s1)
      title: mediaItem.media.title,
      posterUrl: mediaItem.media.poster_path 
        ? `https://image.tmdb.org/t/p/w500${mediaItem.media.poster_path}`
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
      mediaType: mediaItem.media.media_type === 'tv' ? 'TV' : 'Movie',
      season: tmdbData.season_number,
      tmdb_id: mediaItem.media.tmdb_id,
      // Store current rating and status for the card
      currentRating: mediaItem.rating,
      currentStatus: mediaItem.status
    }
    setSelectedMedia(media)
    setDetailModalOpen(true)
  }

  const handleDetailModalRate = async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
    if (selectedMedia && user) {
      try {
        if (rating === null) {
          await supabase
            .from('ratings')
            .delete()
            .eq('media_id', mediaId)
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('ratings')
            .upsert({
              media_id: mediaId,
              user_id: user.id,
              rating: rating
            }, { onConflict: 'user_id,media_id' })
          
          // Track rating
          trackMediaRated({
            media_id: mediaId,
            media_type: selectedMedia.mediaType === 'TV' ? 'tv' : 'movie',
            media_title: selectedMedia.title,
            rating: rating,
            has_comment: false
          })
        }
        
        // Update selected media's current rating
        setSelectedMedia((prev: any) => prev ? { ...prev, currentRating: rating } : null)
        
        // Reload data
        loadMediaForTab(activeTab)
      } catch (error) {
        console.error('Error updating rating:', error)
      }
    }
  }

  const handleDetailModalStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!selectedMedia || !user) return

    const currentStatus = selectedMedia.currentStatus
    
    // If user is unchecking (removing from list), show confirmation
    if (status === null && currentStatus) {
      setPendingRemoval({ media: selectedMedia, currentStatus })
      setShowRemoveConfirm(true)
    } else {
      try {
        if (status === null) {
          await supabase
            .from('watch_status')
            .delete()
            .eq('media_id', mediaId)
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('watch_status')
            .upsert({
              media_id: mediaId,
              user_id: user.id,
              status: status
            }, { onConflict: 'user_id,media_id' })
          
          // Track status change
          trackWatchStatusChanged({
            media_id: mediaId,
            media_type: selectedMedia.mediaType === 'TV' ? 'tv' : 'movie',
            media_title: selectedMedia.title,
            old_status: currentStatus || null,
            new_status: status
          })
        }
        
        // Update selected media's current status
        setSelectedMedia((prev: any) => prev ? { ...prev, currentStatus: status } : null)
        
        // Reload data
        loadMediaForTab(activeTab)
        loadCounts()
      } catch (error) {
        console.error('Error updating status:', error)
      }
    }
  }

  const confirmRemoval = async () => {
    if (pendingRemoval) {
      await handleMediaSelect(pendingRemoval.media, undefined, null as any)
      setShowRemoveConfirm(false)
      setPendingRemoval(null)
      setDetailModalOpen(false)
      setSelectedMedia(null)
    }
  }

  const cancelRemoval = () => {
    setShowRemoveConfirm(false)
    setPendingRemoval(null)
  }

  const handleSelectTopShow = (slot: number) => {
    // Always open the selector modal to allow changing the selection
    setSelectedSlot(slot)
    setShowTopShowModal(true)
  }

  const handleViewTopShow = async (show: any, e: React.MouseEvent) => {
    // Stop propagation to prevent triggering the parent onClick
    e.stopPropagation()

    if (!show) return

    // Fetch full media details from TMDB
    const mediaType = show.media_type || (show.first_air_date ? 'tv' : 'movie')
    const tmdbId = show.tmdb_id || show.id
    
    try {
      // Fetch details with credits
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '99b89037cac7fea56692934b534ea26a'}&append_to_response=credits`
      )
      const tmdbData = await response.json()

      // Transform to ShowDetailCard format
      const media = {
        id: show.id || `${mediaType}-${tmdbId}`,
        title: tmdbData.title || tmdbData.name,
        posterUrl: tmdbData.poster_path 
          ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
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
        mediaType: mediaType === 'tv' ? 'TV' : 'Movie',
        season: show.tmdb_data?.season_number,
        tmdb_id: tmdbId
      }

      setSelectedMedia(media)
      setDetailModalOpen(true)
    } catch (error) {
      console.error('Error fetching media details:', error)
    }
  }

  const handleSetTopShow = async (media: any) => {
    if (selectedSlot === null) return

    const column = `top_show_${selectedSlot}`
    const { error } = await supabase
      .from('profiles')
      .update({ [column]: media })
      .eq('id', user.id)

    if (!error) {
      const newTopShows = [...topShows]
      newTopShows[selectedSlot - 1] = media
      setTopShows(newTopShows)
      setShowTopShowModal(false)
    }
  }

  // Softer dark background (not pure black) - approx rgba(255,255,255,0.05) on black
  const softBg = colors.isDark ? '#0d0d0d' : colors.bgGradient

  return (
    <div style={{ minHeight: '100vh', background: softBg, paddingBottom: '100px' }}>
      {/* Header */}
      <AppHeader profile={profile} hideOnScroll />

      {/* My Shows Section - no container box, content floats on background */}
      <div style={{ maxWidth: '398px', margin: '0 auto', padding: '1.5rem 1rem', marginTop: '82px' }}>
        {/* Title + View Toggle Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: colors.textPrimary }}>My Shows</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === 'grid' ? colors.goldAccent : colors.cardBg,
                color: viewMode === 'grid' ? 'white' : colors.textSecondary,
                border: colors.cardBorder,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              aria-label="Grid view"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === 'list' ? colors.goldAccent : colors.cardBg,
                color: viewMode === 'list' ? 'white' : colors.textSecondary,
                border: colors.cardBorder,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Top 3 Shows */}
        <div style={{
          padding: '1.5rem',
          background: colors.cardBg,
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0', color: colors.textPrimary }}>My Top 3 Shows</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {[1, 2, 3].map((slot) => {
              const show = topShows[slot - 1]
              const hasShow = show?.poster_path
              return (
                <div
                  key={slot}
                  style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    border: hasShow ? 'none' : (colors.isDark ? '2px dashed rgba(255, 255, 255, 0.2)' : '2px dashed #ddd'),
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: colors.cardBg,
                    boxShadow: hasShow
                      ? '0 0 20px 2px rgba(242, 113, 33, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {show?.poster_path ? (
                    <>
                      {/* Clickable poster image - opens detail modal */}
                      <div
                        onClick={(e) => handleViewTopShow(show, e)}
                        style={{
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer'
                        }}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w342${show.poster_path}`}
                          alt={show.title || show.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>

                      {/* Slot number badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: colors.goldAccent,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        pointerEvents: 'none'
                      }}>
                        {slot}
                      </div>

                      {/* Edit button to change selection */}
                      <button
                        onClick={() => handleSelectTopShow(slot)}
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          padding: '6px 12px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Empty slot - click to add */}
                      <div
                        onClick={() => handleSelectTopShow(slot)}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '2rem', color: '#ccc' }}>+</span>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: colors.goldAccent,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        pointerEvents: 'none'
                      }}>
                        {slot}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: colors.cardBorder,
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('want')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'want' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
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
              {counts.wantCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: activeTab === 'want' ? colors.goldAccent : colors.textSecondary,
              fontWeight: activeTab === 'want' ? '600' : '400'
            }}>
              Want to Watch
            </div>
          </button>
          <button
            onClick={() => setActiveTab('watching')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'watching' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
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
              {counts.watchingCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: activeTab === 'watching' ? colors.goldAccent : colors.textSecondary,
              fontWeight: activeTab === 'watching' ? '600' : '400'
            }}>
              Watching
            </div>
          </button>
          <button
            onClick={() => setActiveTab('watched')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'watched' ? `2px solid ${colors.goldAccent}` : '2px solid transparent',
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
              {counts.watchedCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: activeTab === 'watched' ? colors.goldAccent : colors.textSecondary,
              fontWeight: activeTab === 'watched' ? '600' : '400'
            }}>
              Watched
            </div>
          </button>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : mediaItems.length > 0 ? (
            <MediaCardGrid
              items={mediaItems}
              variant={viewMode === 'list' ? 'compact' : 'grid'}
              onCardClick={(item) => handlePosterClick(item)}
              showActions={false}
              showOverview={false}
              posterSize={viewMode === 'grid' ? 'w342' : 'w185'}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: colors.textSecondary }}>
              <p style={{ fontSize: '1rem' }}>
                No shows yet. Start adding some!
              </p>
            </div>
          )}
        </div>
      </div>

      <SearchModalEnhanced
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMedia={handleMediaSelect}
        user={user}
        profile={profile}
      />

      <ShowDetailCard
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedMedia(null)
        }}
        media={selectedMedia || {
          id: '',
          title: '',
        }}
        currentUser={profile ? {
          id: user?.id || '',
          name: profile.display_name || profile.username || '',
          avatar: profile.avatar_url
        } : undefined}
        initialRating={selectedMedia?.currentRating}
        initialStatus={selectedMedia?.currentStatus}
        onRate={handleDetailModalRate}
        onSetStatus={handleDetailModalStatus}
      />

      {showTopShowModal && selectedSlot && user && (
        <TopShowModal
          onClose={() => setShowTopShowModal(false)}
          onSelect={handleSetTopShow}
          slotNumber={selectedSlot}
          userId={user.id}
        />
      )}

      {/* Remove Confirmation Dialog */}
      {showRemoveConfirm && pendingRemoval && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
          onClick={cancelRemoval}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#000' }}>
                Remove from list?
              </h3>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.9375rem', color: '#666', lineHeight: '1.5' }}>
                Remove <strong>{selectedMedia?.title || selectedMedia?.name}</strong> from your{' '}
                <strong>
                  {pendingRemoval.currentStatus === 'want' ? 'Want to Watch' :
                   pendingRemoval.currentStatus === 'watching' ? 'Watching' : 'Watched'}
                </strong> list?
              </p>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '1rem 1.5rem 1.5rem',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                onClick={cancelRemoval}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoval}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#dc3545',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <Footer variant="minimal" />

      <BottomNav onSearchOpen={() => setSearchOpen(true)} />
    </div>
  )
}

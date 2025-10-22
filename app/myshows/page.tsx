'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import BottomNav from '@/components/navigation/BottomNav'
import AppHeader from '@/components/navigation/AppHeader'
import SearchModal from '@/components/search/SearchModal'
import MediaDetailModal from '@/components/media/MediaDetailModal'
import MediaBadges from '@/components/media/MediaBadges'
import TopShowModal from '@/components/profile/TopShowModal'
import { Grid3x3, List } from 'lucide-react'

export default function MyShowsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'want' | 'watching' | 'watched'>('want')
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
  const { resolvedTheme } = useTheme()

  // Theme-based colors
  const isDark = resolvedTheme === 'dark'
  const bgGradient = isDark ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)' : '#ffffff'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'
  const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'white'
  const buttonBorder = isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ddd'
  const backdropBlur = isDark ? 'blur(20px)' : 'none'

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadMediaForTab(activeTab)
      loadCounts()
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
          release_date: media.release_date || media.first_air_date,
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
        }
      }

      // Save status if provided
      if (status !== undefined) {
        if (status === null) {
          // Delete watch_status if null (user unchecked)
          await supabase
            .from('watch_status')
            .delete()
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
        } else {
          await supabase
            .from('watch_status')
            .upsert({
              user_id: user.id,
              media_id: mediaId,
              status: status
            }, { onConflict: 'user_id,media_id' })
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
    // Convert media item format to match what MediaDetailModal expects
    const media = {
      ...mediaItem.media.tmdb_data,
      id: mediaItem.media.id, // Use the full media ID (e.g., tv-12345-s1) not just tmdb_id
      media_type: mediaItem.media.media_type,
      tmdb_id: mediaItem.media.tmdb_id,
      poster_path: mediaItem.media.poster_path,
      title: mediaItem.media.title
    }
    setSelectedMedia(media)
    setDetailModalOpen(true)
  }

  const handleDetailModalRate = async (rating: string) => {
    if (selectedMedia) {
      await handleMediaSelect(selectedMedia, rating, undefined)
    }
  }

  const handleDetailModalStatus = async (status: string, currentStatus?: string) => {
    if (!selectedMedia) return

    // If user is unchecking (removing from list), show confirmation
    if (status === null && currentStatus) {
      setPendingRemoval({ media: selectedMedia, currentStatus })
      setShowRemoveConfirm(true)
    } else {
      // Adding or changing status - proceed normally
      await handleMediaSelect(selectedMedia, undefined, status)
    }
  }

  const confirmRemoval = async () => {
    if (pendingRemoval) {
      await handleMediaSelect(pendingRemoval.media, undefined, undefined)
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
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${show.tmdb_id || show.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || '99b89037cac7fea56692934b534ea26a'}`
      )
      const fullMediaData = await response.json()

      setSelectedMedia(fullMediaData)
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

  return (
    <div style={{ minHeight: '100vh', background: bgGradient, paddingBottom: '100px' }}>
      {/* Header */}
      <AppHeader profile={profile} />

      {/* My Shows Section */}
      <div style={{ maxWidth: '600px', margin: '0 auto', background: cardBg, padding: '2rem 1.5rem', borderRadius: '12px', border: cardBorder, backdropFilter: backdropBlur }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700', color: textPrimary }}>My Shows</h2>

        {/* Top 3 Shows */}
        <div style={{
          padding: '1.5rem',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#fafafa',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0', color: textPrimary }}>My Top 3 Shows</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {[1, 2, 3].map((slot) => {
              const show = topShows[slot - 1]
              return (
                <div
                  key={slot}
                  style={{
                    position: 'relative',
                    aspectRatio: '2/3',
                    border: isDark ? '2px dashed rgba(255, 255, 255, 0.2)' : '2px dashed #ddd',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'white'
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
                        background: '#0095f6',
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
                        background: '#0095f6',
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
          borderBottom: cardBorder,
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('want')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'want' ? '2px solid #0095f6' : '2px solid transparent',
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
              color: textPrimary
            }}>
              {counts.wantCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: activeTab === 'want' ? '#0095f6' : textSecondary,
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
              borderBottom: activeTab === 'watching' ? '2px solid #0095f6' : '2px solid transparent',
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
              color: textPrimary
            }}>
              {counts.watchingCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: activeTab === 'watching' ? '#0095f6' : textSecondary,
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
              borderBottom: activeTab === 'watched' ? '2px solid #0095f6' : '2px solid transparent',
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
              color: textPrimary
            }}>
              {counts.watchedCount}
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: activeTab === 'watched' ? '#0095f6' : textSecondary,
              fontWeight: activeTab === 'watched' ? '600' : '400'
            }}>
              Watched
            </div>
          </button>
        </div>

        {/* View Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: viewMode === 'grid' ? '#0095f6' : 'white',
              color: viewMode === 'grid' ? 'white' : '#666',
              border: '1px solid #ddd',
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
              background: viewMode === 'list' ? '#0095f6' : 'white',
              color: viewMode === 'list' ? 'white' : '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            aria-label="List view"
          >
            <List size={20} />
          </button>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ width: '32px', height: '32px', border: '4px solid #e94d88', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : mediaItems.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="shows-grid">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="show-card"
                    onClick={() => handlePosterClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="poster-container" style={{ position: 'relative' }}>
                      <img
                        src={`https://image.tmdb.org/t/p/w342${item.media.poster_path}`}
                        alt={item.media.title}
                        className="show-poster"
                      />
                      {/* Rating Badge */}
                      {item.user_rating && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(10px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.125rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                          {item.user_rating === 'love' ? '❤️' : item.user_rating === 'like' ? '👍' : '😐'}
                        </div>
                      )}
                    </div>
                    <div className="show-title">{item.media.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mediaItems.map((item) => {
                  const mediaType = item.media.media_type || (item.media.tmdb_data?.first_air_date ? 'tv' : 'movie')
                  const tmdbId = item.media.tmdb_id

                  // Extract season number from ID if it's a season-specific record
                  const seasonNumber = item.media.id?.includes('-s')
                    ? parseInt(item.media.id.split('-s')[1])
                    : (item.media.tmdb_data?.season_number || null)

                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePosterClick(item)}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '0.75rem',
                        background: '#fafafa',
                        borderRadius: '12px',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w185${item.media.poster_path}`}
                        alt={item.media.title}
                        style={{
                          width: '60px',
                          height: '90px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                            {item.media.title}
                          </div>
                          {item.user_rating && (
                            <span style={{ fontSize: '1.25rem' }}>
                              {item.user_rating === 'love' ? '❤️' : item.user_rating === 'like' ? '👍' : '😐'}
                            </span>
                          )}
                        </div>
                        <MediaBadges
                          mediaType={mediaType as 'tv' | 'movie'}
                          seasonNumber={seasonNumber || undefined}
                          season={!seasonNumber && mediaType === 'tv' ? (item.media.tmdb_data?.number_of_seasons || 1) : undefined}
                          networks={item.media.tmdb_data?.networks || []}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#999' }}>
              <p style={{ fontSize: '1rem' }}>
                No shows yet. Start adding some!
              </p>
            </div>
          )}
        </div>
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

      <BottomNav onSearchOpen={() => setSearchOpen(true)} />
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import ShowDetailCard from '@/components/media/ShowDetailCard'
import { trackSearchPerformed } from '@/utils/analytics'

interface SearchModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onSelectMedia: (media: any, rating?: string, status?: string) => void
  user?: any
  profile?: any
}

export default function SearchModalEnhanced({ isOpen, onClose, onSelectMedia, user, profile }: SearchModalEnhancedProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [userWatchlistIds, setUserWatchlistIds] = useState<Set<string>>(new Set())
  
  // ShowDetailCard state
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  
  const colors = useThemeColors()

  // Increased debounce to 500ms for smoother feel
  const debouncedQuery = useDebounce(query, 500)

  // Modal-specific colors
  const modalBg = colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.55)'
  const modalBorder = colors.isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.18)'

  // Fetch user's watchlist IDs on mount
  useEffect(() => {
    async function fetchUserWatchlist() {
      if (!user) return

      const supabase = createClient()
      const { data } = await supabase
        .from('watch_status')
        .select('media_id')
        .eq('user_id', user.id)

      if (data) {
        const ids = new Set<string>()
        data.forEach((item: { media_id: string }) => {
          ids.add(item.media_id)
          const baseId = item.media_id.split('-s')[0]
          ids.add(baseId)
        })
        setUserWatchlistIds(ids)
      }
    }

    if (isOpen) {
      fetchUserWatchlist()
    }
  }, [user, isOpen])

  // Fetch trending content when modal opens
  useEffect(() => {
    async function fetchTrending() {
      if (!isOpen) return
      
      setTrendingLoading(true)
      try {
        const [tvTrending, movieTrending] = await Promise.all([
          fetch('/api/tmdb/trending/tv/week').then(r => r.ok ? r.json() : { results: [] }),
          fetch('/api/tmdb/trending/movie/week').then(r => r.ok ? r.json() : { results: [] })
        ])

        // Combine and mark media type
        const combined = [
          ...(tvTrending.results || []).slice(0, 10).map((s: any) => ({ ...s, media_type: 'tv' })),
          ...(movieTrending.results || []).slice(0, 10).map((s: any) => ({ ...s, media_type: 'movie' }))
        ]

        // Shuffle to mix TV and movies
        const shuffled = combined.sort(() => Math.random() - 0.5)
        
        setTrending(shuffled)
      } catch (error) {
        console.error('Error fetching trending:', error)
      } finally {
        setTrendingLoading(false)
      }
    }

    fetchTrending()
  }, [isOpen])

  // Prevent body scroll when modal is open and clear search on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setQuery('')
      setResults([])
      setDetailModalOpen(false)
      setSelectedMedia(null)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const searchMedia = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // Always search multi (all types) since we removed filters
      const response = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      // Filter out person results
      const filtered = data.results?.filter((item: any) => item.media_type !== 'person') || []
      setResults(filtered)

      // Track search event
      trackSearchPerformed({
        query: searchQuery,
        results_count: filtered.length,
        media_type_filter: 'all',
        result_clicked: false
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    searchMedia(debouncedQuery)
  }, [debouncedQuery, searchMedia])

  // Filter trending to exclude user's watchlist items
  const filteredTrending = trending.filter((item) => {
    const mediaId = `${item.media_type}-${item.id}`
    return !userWatchlistIds.has(mediaId)
  })

  // Handle card click - open ShowDetailCard
  const handleCardClick = async (item: any) => {
    const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie')
    const tmdbId = item.id
    
    try {
      // Fetch full details with credits
      const response = await fetch(`/api/tmdb/${mediaType}/${tmdbId}?append_to_response=credits`)
      const tmdbData = await response.json()

      // Transform to ShowDetailCard format
      const media = {
        id: `${mediaType}-${tmdbId}`,
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
        tmdb_id: tmdbId,
        media_type: mediaType
      }

      setSelectedMedia(media)
      setDetailModalOpen(true)
    } catch (error) {
      console.error('Error fetching media details:', error)
    }
  }

  // Handle rating from ShowDetailCard
  const handleDetailModalRate = async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
    if (!selectedMedia || !user) return
    
    const supabase = createClient()
    
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
      }
      
      // Update selected media's current rating
      setSelectedMedia((prev: any) => prev ? { ...prev, currentRating: rating } : null)
      
      // Notify parent (for any additional handling)
      onSelectMedia(selectedMedia, rating ?? undefined, selectedMedia.currentStatus ?? undefined)
    } catch (error) {
      console.error('Error updating rating:', error)
    }
  }

  // Handle status from ShowDetailCard
  const handleDetailModalStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!selectedMedia || !user) return
    
    const supabase = createClient()
    
    try {
      if (status === null) {
        await supabase
          .from('watch_status')
          .delete()
          .eq('media_id', mediaId)
          .eq('user_id', user.id)
      } else {
        // First ensure media exists in database
        await supabase
          .from('media')
          .upsert({
            id: mediaId,
            tmdb_id: selectedMedia.tmdb_id,
            media_type: selectedMedia.media_type,
            title: selectedMedia.title,
            poster_path: selectedMedia.posterUrl?.replace('https://image.tmdb.org/t/p/w500', ''),
            overview: selectedMedia.synopsis,
            vote_average: selectedMedia.rating
          }, { onConflict: 'id' })
        
        await supabase
          .from('watch_status')
          .upsert({
            media_id: mediaId,
            user_id: user.id,
            status: status
          }, { onConflict: 'user_id,media_id' })
      }
      
      // Update selected media's current status
      setSelectedMedia((prev: any) => prev ? { ...prev, currentStatus: status } : null)
      
      // Notify parent
      onSelectMedia(selectedMedia, selectedMedia.currentRating ?? undefined, status ?? undefined)
      
      // Update watchlist IDs
      if (status) {
        setUserWatchlistIds(prev => new Set([...prev, mediaId]))
      } else {
        setUserWatchlistIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(mediaId)
          return newSet
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (!isOpen) return null

  const showTrending = !query.trim() && filteredTrending.length > 0

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '398px',
            maxHeight: '85vh',
            background: modalBg,
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            borderRadius: '20px',
            border: modalBorder,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: colors.isDark ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row: Title + Close Button */}
          <div style={{ 
            padding: '1.25rem 1.25rem 0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.125rem', 
              fontWeight: '700', 
              color: colors.textPrimary 
            }}>
              Add or Rate a Show
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="28" height="28" style={{ color: colors.textSecondary }}>
                <use xlinkHref="/icons/feed-sprite.svg#close-c-default" />
              </svg>
            </button>
          </div>

          {/* Search Input Row */}
          <div style={{ padding: '0 1.25rem 1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '18px', 
                height: '18px', 
                color: colors.textSecondary 
              }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shows or movies..."
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.75rem',
                  border: colors.inputBorder,
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  background: colors.inputBg,
                  color: colors.textPrimary
                }}
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('')
                    setResults([])
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="18" height="18" style={{ color: colors.textSecondary }}>
                    <use xlinkHref="/icons/feed-sprite.svg#close-c-default" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results / Trending */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '0 1.25rem 1.25rem'
          }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: `3px solid ${colors.brandPink}`, 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} />
              </div>
            ) : results.length > 0 ? (
              // Search Results - 3 column grid
              <div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem'
                }}>
                  Results
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem'
                }}>
                  {results.slice(0, 12).map((item) => (
                    <PosterCard 
                      key={`${item.media_type}-${item.id}`}
                      item={item}
                      onClick={() => handleCardClick(item)}
                      colors={colors}
                    />
                  ))}
                </div>
              </div>
            ) : query.trim() ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9rem' }}>
                No results found for "{query}"
              </div>
            ) : showTrending ? (
              // Trending Section - 3x2 grid (6 cards)
              <div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem'
                }}>
                  Trending This Week
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem'
                }}>
                  {filteredTrending.slice(0, 6).map((item) => (
                    <PosterCard 
                      key={`trending-${item.media_type}-${item.id}`}
                      item={item}
                      onClick={() => handleCardClick(item)}
                      colors={colors}
                    />
                  ))}
                </div>
              </div>
            ) : trendingLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  border: `3px solid ${colors.brandPink}`, 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9rem' }}>
                Start typing to search for shows and movies
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ShowDetailCard Modal */}
      <ShowDetailCard
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedMedia(null)
        }}
        media={selectedMedia || { id: '', title: '' }}
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
    </>
  )
}

// Simple poster card component for the grid
function PosterCard({ item, onClick, colors }: { item: any; onClick: () => void; colors: any }) {
  const title = item.title || item.name || 'Untitled'
  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden',
        background: colors.cardBg,
        border: colors.cardBorder,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Poster */}
      <div style={{ aspectRatio: '2/3', position: 'relative', background: colors.surfaceBg }}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textTertiary,
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '0.5rem'
          }}>
            No Image
          </div>
        )}
      </div>
      
      {/* Title */}
      <div style={{
        padding: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: colors.textPrimary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {title}
      </div>
    </div>
  )
}

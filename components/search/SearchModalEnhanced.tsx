'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
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
  const [userRatings, setUserRatings] = useState<Record<string, string>>({})
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({})
  
  // Which card is currently flipped (null = none)
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null)
  
  const colors = useThemeColors()

  // Increased debounce to 500ms for smoother feel
  const debouncedQuery = useDebounce(query, 500)

  // Fetch user's watchlist IDs and ratings on mount
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return

      const supabase = createClient()
      
      // Fetch watch status
      const { data: statusData } = await supabase
        .from('watch_status')
        .select('media_id, status')
        .eq('user_id', user.id)

      if (statusData) {
        const ids = new Set<string>()
        const statuses: Record<string, string> = {}
        statusData.forEach((item: { media_id: string; status: string }) => {
          ids.add(item.media_id)
          const baseId = item.media_id.split('-s')[0]
          ids.add(baseId)
          statuses[item.media_id] = item.status
          statuses[baseId] = item.status
        })
        setUserWatchlistIds(ids)
        setUserStatuses(statuses)
      }

      // Fetch ratings
      const { data: ratingData } = await supabase
        .from('ratings')
        .select('media_id, rating')
        .eq('user_id', user.id)

      if (ratingData) {
        const ratings: Record<string, string> = {}
        ratingData.forEach((item: { media_id: string; rating: string }) => {
          ratings[item.media_id] = item.rating
          const baseId = item.media_id.split('-s')[0]
          ratings[baseId] = item.rating
        })
        setUserRatings(ratings)
      }
    }

    if (isOpen) {
      fetchUserData()
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

        const combined = [
          ...(tvTrending.results || []).slice(0, 10).map((s: any) => ({ ...s, media_type: 'tv' })),
          ...(movieTrending.results || []).slice(0, 10).map((s: any) => ({ ...s, media_type: 'movie' }))
        ]

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

  // Prevent body scroll when modal is open and clear on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setQuery('')
      setResults([])
      setFlippedCardId(null)
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
    setFlippedCardId(null) // Reset flipped card when searching
    try {
      const response = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      const filtered = data.results?.filter((item: any) => item.media_type !== 'person') || []
      setResults(filtered)

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

  // Handle rating
  const handleRate = async (item: any, rating: string) => {
    if (!user) return
    
    const mediaId = `${item.media_type}-${item.id}`
    const supabase = createClient()
    
    const currentRating = userRatings[mediaId]
    const newRating = currentRating === rating ? null : rating
    
    try {
      if (newRating === null) {
        await supabase.from('ratings').delete().eq('user_id', user.id).eq('media_id', mediaId)
        setUserRatings(prev => {
          const updated = { ...prev }
          delete updated[mediaId]
          return updated
        })
      } else {
        await supabase.from('ratings').upsert({
          user_id: user.id,
          media_id: mediaId,
          rating: newRating
        }, { onConflict: 'user_id,media_id' })
        setUserRatings(prev => ({ ...prev, [mediaId]: newRating }))
      }
      
      onSelectMedia(item, newRating ?? undefined, userStatuses[mediaId] ?? undefined)
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  // Handle status
  const handleStatus = async (item: any, status: string) => {
    if (!user) return
    
    const mediaId = `${item.media_type}-${item.id}`
    const supabase = createClient()
    
    const currentStatus = userStatuses[mediaId]
    const newStatus = currentStatus === status ? null : status
    
    try {
      // Ensure media exists
      await supabase.from('media').upsert({
        id: mediaId,
        tmdb_id: item.id,
        media_type: item.media_type,
        title: item.title || item.name,
        poster_path: item.poster_path,
        overview: item.overview,
        vote_average: item.vote_average
      }, { onConflict: 'id' })
      
      if (newStatus === null) {
        await supabase.from('watch_status').delete().eq('user_id', user.id).eq('media_id', mediaId)
        setUserStatuses(prev => {
          const updated = { ...prev }
          delete updated[mediaId]
          return updated
        })
        setUserWatchlistIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(mediaId)
          return newSet
        })
      } else {
        await supabase.from('watch_status').upsert({
          user_id: user.id,
          media_id: mediaId,
          status: newStatus
        }, { onConflict: 'user_id,media_id' })
        setUserStatuses(prev => ({ ...prev, [mediaId]: newStatus }))
        setUserWatchlistIds(prev => new Set([...prev, mediaId]))
      }
      
      onSelectMedia(item, userRatings[mediaId] ?? undefined, newStatus ?? undefined)
    } catch (error) {
      console.error('Error saving status:', error)
    }
  }

  if (!isOpen) return null

  const showTrending = !query.trim() && filteredTrending.length > 0
  const displayItems = query.trim() ? results : filteredTrending

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      {/* Fixed size modal matching activity feed card */}
      <div
        style={{
          width: '398px',
          height: '645px',
          background: colors.isDark ? 'rgba(20, 20, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row */}
        <div style={{ 
          padding: '1.25rem 1.25rem 0.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexShrink: 0
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
        <div style={{ padding: '0 1.25rem 1rem', flexShrink: 0 }}>
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
                onClick={() => { setQuery(''); setResults([]); setFlippedCardId(null); }}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex'
                }}
              >
                <svg width="18" height="18" style={{ color: colors.textSecondary }}>
                  <use xlinkHref="/icons/feed-sprite.svg#close-c-default" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '0 1.25rem 1.25rem'
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: `3px solid ${colors.brandPink}`, 
                borderTopColor: 'transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
            </div>
          ) : displayItems.length > 0 ? (
            <div>
              <div style={{ 
                fontSize: '0.7rem', 
                fontWeight: '600', 
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem'
              }}>
                {query.trim() ? 'Results' : 'Trending This Week'}
              </div>
              
              {/* Poster Grid - matching watchlist style */}
              <div className="shows-grid">
                {displayItems.slice(0, 6).map((item) => {
                  const mediaId = `${item.media_type}-${item.id}`
                  const isFlipped = flippedCardId === mediaId
                  const currentRating = userRatings[mediaId]
                  const currentStatus = userStatuses[mediaId]
                  
                  return (
                    <FlipCard
                      key={mediaId}
                      item={item}
                      isFlipped={isFlipped}
                      onFlip={() => setFlippedCardId(isFlipped ? null : mediaId)}
                      currentRating={currentRating}
                      currentStatus={currentStatus}
                      onRate={(rating) => handleRate(item, rating)}
                      onStatus={(status) => handleStatus(item, status)}
                      colors={colors}
                    />
                  )
                })}
              </div>
            </div>
          ) : query.trim() ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9rem' }}>
              No results found for "{query}"
            </div>
          ) : trendingLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
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
              Start typing to search
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Flip card component
function FlipCard({ 
  item, 
  isFlipped, 
  onFlip, 
  currentRating, 
  currentStatus, 
  onRate, 
  onStatus,
  colors 
}: { 
  item: any
  isFlipped: boolean
  onFlip: () => void
  currentRating?: string
  currentStatus?: string
  onRate: (rating: string) => void
  onStatus: (status: string) => void
  colors: any
}) {
  const title = item.title || item.name || 'Untitled'
  const posterUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : null

  return (
    <div 
      className="show-card"
      style={{ 
        perspective: '1000px',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRONT - Poster */}
        <div
          onClick={onFlip}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="poster-container">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title}
                className="show-poster"
              />
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors.surfaceBg,
                color: colors.textTertiary,
                fontSize: '0.7rem'
              }}>
                No Image
              </div>
            )}
            {/* Rating badge if rated */}
            {currentRating && (
              <div style={{
                position: 'absolute',
                bottom: '6px',
                right: '6px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="16" height="16">
                  <use xlinkHref={`/icons/feed-sprite.svg#${
                    currentRating === 'love' ? 'heart-active' : 
                    currentRating === 'like' ? 'thumbs-up-active' : 'meh-face-active'
                  }`} />
                </svg>
              </div>
            )}
          </div>
          <div className="show-title">{title}</div>
        </div>

        {/* BACK - Rating/Status */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: colors.cardBg,
            borderRadius: '12px',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {/* Close button */}
          <button
            onClick={onFlip}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              zIndex: 10
            }}
          >
            <svg width="20" height="20" style={{ color: colors.textSecondary }}>
              <use xlinkHref="/icons/feed-sprite.svg#close-c-default" />
            </svg>
          </button>

          {/* Title */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: colors.textPrimary,
            paddingRight: '24px',
            lineHeight: '1.2',
            marginBottom: '0.25rem'
          }}>
            {title}
          </div>

          {/* Rating buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.375rem',
            justifyContent: 'center'
          }}>
            {['meh', 'like', 'love'].map((rating) => (
              <button
                key={rating}
                onClick={() => onRate(rating)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: currentRating === rating 
                    ? (rating === 'love' ? '#ec4899' : rating === 'like' ? '#3b82f6' : '#6b7280')
                    : colors.buttonBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  color: currentRating === rating ? 'white' : colors.textSecondary,
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="14" height="14">
                  <use xlinkHref={`/icons/feed-sprite.svg#${
                    rating === 'love' ? 'heart-active' : 
                    rating === 'like' ? 'thumbs-up-active' : 'meh-face-active'
                  }`} />
                </svg>
                {rating === 'love' ? 'Love' : rating === 'like' ? 'Like' : 'Meh'}
              </button>
            ))}
          </div>

          {/* Status buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {[
              { key: 'want', label: 'Want to Watch', icon: '➕' },
              { key: 'watching', label: 'Watching', icon: '▶️' },
              { key: 'watched', label: 'Watched', icon: '✓' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => onStatus(key)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: currentStatus === key ? colors.brandBlue : colors.buttonBg,
                  color: currentStatus === key ? 'white' : colors.textSecondary,
                  fontSize: '0.7rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

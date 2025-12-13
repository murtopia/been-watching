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

export default function SearchModalEnhanced({ isOpen, onClose, onSelectMedia, user }: SearchModalEnhancedProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [userWatchlistIds, setUserWatchlistIds] = useState<Set<string>>(new Set())
  const [userRatings, setUserRatings] = useState<Record<string, string>>({})
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({})
  
  // Selected item for the back of card view
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  
  const colors = useThemeColors()
  const debouncedQuery = useDebounce(query, 500)

  // Fetch user's watchlist IDs and ratings on mount
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return

      const supabase = createClient()
      
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

  // Reset state when modal closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setQuery('')
      setResults([])
      setSelectedItem(null)
      setIsFlipped(false)
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

  const filteredTrending = trending.filter((item) => {
    const mediaId = `${item.media_type}-${item.id}`
    return !userWatchlistIds.has(mediaId)
  })

  // Handle poster click - flip to back
  const handlePosterClick = (item: any) => {
    setSelectedItem(item)
    setIsFlipped(true)
  }

  // Handle flip back to front
  const handleFlipBack = () => {
    setIsFlipped(false)
    // Delay clearing selected item until flip animation completes
    setTimeout(() => setSelectedItem(null), 300)
  }

  // Handle rating
  const handleRate = async (rating: string) => {
    if (!user || !selectedItem) return
    
    const mediaId = `${selectedItem.media_type}-${selectedItem.id}`
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
      
      onSelectMedia(selectedItem, newRating ?? undefined, userStatuses[mediaId] ?? undefined)
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  // Handle status
  const handleStatus = async (status: string) => {
    if (!user || !selectedItem) return
    
    const mediaId = `${selectedItem.media_type}-${selectedItem.id}`
    const supabase = createClient()
    
    const currentStatus = userStatuses[mediaId]
    const newStatus = currentStatus === status ? null : status
    
    try {
      await supabase.from('media').upsert({
        id: mediaId,
        tmdb_id: selectedItem.id,
        media_type: selectedItem.media_type,
        title: selectedItem.title || selectedItem.name,
        poster_path: selectedItem.poster_path,
        overview: selectedItem.overview,
        vote_average: selectedItem.vote_average
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
      
      onSelectMedia(selectedItem, userRatings[mediaId] ?? undefined, newStatus ?? undefined)
    } catch (error) {
      console.error('Error saving status:', error)
    }
  }

  if (!isOpen) return null

  const displayItems = query.trim() ? results : filteredTrending
  const selectedMediaId = selectedItem ? `${selectedItem.media_type}-${selectedItem.id}` : null
  const currentRating = selectedMediaId ? userRatings[selectedMediaId] : undefined
  const currentStatus = selectedMediaId ? userStatuses[selectedMediaId] : undefined

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
      {/* Card container with 3D perspective */}
      <div
        style={{
          width: '398px',
          height: '645px',
          perspective: '1000px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flipping card */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT - Search/Grid */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: colors.isDark ? 'rgba(20, 20, 25, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderRadius: '24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
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
                  display: 'flex'
                }}
              >
                <svg width="28" height="28" style={{ color: colors.textSecondary }}>
                  <use xlinkHref="/icons/feed-sprite.svg#close-c-default" />
                </svg>
              </button>
            </div>

            {/* Search Input */}
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
                    onClick={() => { setQuery(''); setResults([]); }}
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
                  
                  {/* Poster Grid */}
                  <div className="shows-grid">
                    {displayItems.slice(0, 6).map((item) => {
                      const mediaId = `${item.media_type}-${item.id}`
                      const itemRating = userRatings[mediaId]
                      
                      return (
                        <div 
                          key={mediaId}
                          className="show-card"
                          onClick={() => handlePosterClick(item)}
                        >
                          <div className="poster-container">
                            {item.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                alt={item.title || item.name}
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
                            {/* Rating badge */}
                            {itemRating && (
                              <div style={{
                                position: 'absolute',
                                bottom: '6px',
                                right: '6px',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <svg width="16" height="16">
                                  <use xlinkHref={`/icons/feed-sprite.svg#${
                                    itemRating === 'love' ? 'heart-active' : 
                                    itemRating === 'like' ? 'thumbs-up-active' : 'meh-face-active'
                                  }`} />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="show-title">{item.title || item.name}</div>
                        </div>
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

          {/* BACK - Show Detail/Rating */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: colors.isDark ? 'rgba(20, 20, 25, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {selectedItem && (
              <>
                {/* Background poster */}
                {selectedItem.poster_path && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(https://image.tmdb.org/t/p/w780${selectedItem.poster_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15
                  }} />
                )}
                
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: colors.isDark 
                    ? 'linear-gradient(to bottom, rgba(20,20,25,0.3) 0%, rgba(20,20,25,0.95) 50%)'
                    : 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.95) 50%)'
                }} />

                {/* Content */}
                <div style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem'
                }}>
                  {/* Close button */}
                  <button
                    onClick={handleFlipBack}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      zIndex: 10
                    }}
                  >
                    <svg width="32" height="32" style={{ color: colors.textSecondary }}>
                      <use xlinkHref="/icons/feed-sprite.svg#close-c-default" />
                    </svg>
                  </button>

                  {/* Poster + Info */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    {selectedItem.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${selectedItem.poster_path}`}
                        alt={selectedItem.title || selectedItem.name}
                        style={{
                          width: '100px',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                      />
                    )}
                    <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                      <h2 style={{
                        margin: 0,
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: colors.textPrimary,
                        lineHeight: 1.2,
                        marginBottom: '0.5rem'
                      }}>
                        {selectedItem.title || selectedItem.name}
                      </h2>
                      <div style={{
                        fontSize: '0.85rem',
                        color: colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '600' }}>
                          {selectedItem.media_type === 'tv' ? 'TV Show' : 'Movie'}
                        </span>
                        {(selectedItem.release_date || selectedItem.first_air_date) && (
                          <>
                            <span>•</span>
                            <span>{(selectedItem.release_date || selectedItem.first_air_date)?.substring(0, 4)}</span>
                          </>
                        )}
                        {selectedItem.vote_average > 0 && (
                          <>
                            <span>•</span>
                            <span>⭐ {selectedItem.vote_average.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis */}
                  {selectedItem.overview && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: colors.textSecondary,
                      lineHeight: 1.5,
                      margin: '0 0 1.5rem 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {selectedItem.overview}
                    </p>
                  )}

                  {/* Rating Section */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.75rem'
                    }}>
                      Your Rating
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {[
                        { key: 'meh', label: 'Meh', icon: 'meh-face-active', color: '#6b7280' },
                        { key: 'like', label: 'Like', icon: 'thumbs-up-active', color: '#3b82f6' },
                        { key: 'love', label: 'Love', icon: 'heart-active', color: '#ec4899' }
                      ].map(({ key, label, icon, color }) => (
                        <button
                          key={key}
                          onClick={() => handleRate(key)}
                          style={{
                            flex: 1,
                            padding: '0.875rem',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            background: currentRating === key ? color : colors.buttonBg,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.375rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <svg width="24" height="24" style={{ 
                            color: currentRating === key ? 'white' : colors.textSecondary 
                          }}>
                            <use xlinkHref={`/icons/feed-sprite.svg#${icon}`} />
                          </svg>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: currentRating === key ? 'white' : colors.textSecondary
                          }}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Section */}
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.75rem'
                    }}>
                      Add to List
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { key: 'want', label: 'Want to Watch', icon: '➕' },
                        { key: 'watching', label: 'Watching', icon: '▶️' },
                        { key: 'watched', label: 'Watched', icon: '✓' }
                      ].map(({ key, label, icon }) => (
                        <button
                          key={key}
                          onClick={() => handleStatus(key)}
                          style={{
                            padding: '0.875rem 1rem',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            background: currentStatus === key ? colors.brandBlue : colors.buttonBg,
                            color: currentStatus === key ? 'white' : colors.textPrimary,
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

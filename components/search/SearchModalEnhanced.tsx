'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import { trackSearchPerformed } from '@/utils/analytics'
import Icon from '@/components/ui/Icon'

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
  
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [pressedIcon, setPressedIcon] = useState<string | null>(null)
  
  const colors = useThemeColors()
  const debouncedQuery = useDebounce(query, 500)

  // Fetch user data
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

  // Fetch trending
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

        setTrending(combined.sort(() => Math.random() - 0.5))
      } catch (error) {
        console.error('Error fetching trending:', error)
      } finally {
        setTrendingLoading(false)
      }
    }

    fetchTrending()
  }, [isOpen])

  // Reset on close
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
    return () => { document.body.style.overflow = 'unset' }
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

  const handlePosterClick = (item: any) => {
    setSelectedItem(item)
    setIsFlipped(true)
  }

  const handleFlipBack = () => {
    setIsFlipped(false)
    setPressedIcon(null)
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
        setUserRatings(prev => { const u = { ...prev }; delete u[mediaId]; return u })
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
        setUserStatuses(prev => { const u = { ...prev }; delete u[mediaId]; return u })
        setUserWatchlistIds(prev => { const n = new Set(prev); n.delete(mediaId); return n })
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
    <>
      <style jsx>{`
        .search-card-container {
          width: 398px;
          height: 645px;
          perspective: 1000px;
        }

        .search-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.5s ease;
        }

        .search-card.flipped {
          transform: rotateY(180deg);
        }

        .search-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 24px;
          overflow: hidden;
        }

        .search-card-front {
          background: ${colors.isDark ? 'rgba(20, 20, 25, 0.98)' : 'rgba(255, 255, 255, 0.98)'};
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .search-card-back {
          transform: rotateY(180deg);
          background: #0a0a0a;
        }

        /* Back card styles matching activity card */
        .close-btn {
          position: absolute;
          top: 20px;
          right: 12px;
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .close-btn:active {
          transform: scale(0.9);
        }

        .back-content {
          padding: 0 16px 20px 16px;
          padding-top: 50px;
          height: 100%;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .back-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
          color: white;
        }

        .back-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

        .meta-dot {
          opacity: 0.5;
        }

        .back-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .back-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .back-synopsis {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .action-modal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
          background: rgba(20, 20, 20, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
        }

        .action-modal-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .action-modal-item:active {
          transform: scale(0.95);
        }

        .action-modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-modal-icon:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .action-modal-icon.pressed {
          background: rgba(255, 59, 92, 0.3) !important;
          border-color: #FF3B5C !important;
        }

        .action-modal-icon.active {
          background: rgba(255, 59, 92, 0.2) !important;
          border-color: #FF3B5C !important;
        }

        .action-modal-label {
          font-size: 10px;
          font-weight: 500;
          opacity: 0.8;
          text-align: center;
          line-height: 1.2;
          color: white;
        }

        .action-modal-divider {
          grid-column: 1 / -1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 2px 0;
        }

        .watchlist-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FF3B5C;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

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
        <div className="search-card-container" onClick={(e) => e.stopPropagation()}>
          <div className={`search-card ${isFlipped ? 'flipped' : ''}`}>
            
            {/* FRONT - Search/Grid */}
            <div className="search-card-face search-card-front">
              {/* Header */}
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                >
                  <Icon name="close" variant="circle" size={28} />
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
                      <Icon name="close" size={18} color={colors.textSecondary} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                    <div style={{ width: '32px', height: '32px', border: `3px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : displayItems.length > 0 ? (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                      {query.trim() ? 'Results' : 'Trending This Week'}
                    </div>
                    
                    <div className="shows-grid">
                      {displayItems.slice(0, 6).map((item) => {
                        const mediaId = `${item.media_type}-${item.id}`
                        const itemRating = userRatings[mediaId]
                        
                        return (
                          <div key={mediaId} className="show-card" onClick={() => handlePosterClick(item)}>
                            <div className="poster-container">
                              {item.poster_path ? (
                                <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={item.title || item.name} className="show-poster" />
                              ) : (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.surfaceBg, color: colors.textTertiary, fontSize: '0.7rem' }}>No Image</div>
                              )}
                              {itemRating && (
                                <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Icon name={itemRating === 'love' ? 'heart' : itemRating === 'like' ? 'thumbs-up' : 'meh-face'} state="active" size={16} />
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
                    <div style={{ width: '32px', height: '32px', border: `3px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9rem' }}>
                    Start typing to search
                  </div>
                )}
              </div>
            </div>

            {/* BACK - Activity Card Style */}
            <div className="search-card-face search-card-back">
              {selectedItem && (
                <>
                  <button className="close-btn" onClick={handleFlipBack}>
                    <Icon name="close" variant="circle" size={42} />
                  </button>

                  <div className="back-content">
                    {/* Title Section */}
                    <h1 className="back-title">
                      {selectedItem.title || selectedItem.name}
                    </h1>
                    <div className="back-meta">
                      <span>{(selectedItem.release_date || selectedItem.first_air_date)?.substring(0, 4)}</span>
                      {selectedItem.vote_average > 0 && (
                        <>
                          <span className="meta-dot">•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="star-gold" size={14} /> {selectedItem.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="back-badges">
                      <div className="back-badge">{selectedItem.media_type === 'tv' ? 'TV' : 'Movie'}</div>
                    </div>

                    {/* Synopsis */}
                    {selectedItem.overview && (
                      <p className="back-synopsis">{selectedItem.overview}</p>
                    )}

                    {/* Action Grid - Matching activity card style */}
                    <div className="action-modal-grid">
                      {/* Rating Icons */}
                      <div className="action-modal-item" onClick={() => handleRate('meh')} onTouchStart={() => setPressedIcon('meh')} onTouchEnd={() => setPressedIcon(null)}>
                        <div className={`action-modal-icon ${currentRating === 'meh' ? 'active' : ''} ${pressedIcon === 'meh' ? 'pressed' : ''}`}>
                          <Icon name="meh-face" state={currentRating === 'meh' ? 'active' : 'default'} size={20} color="white" />
                        </div>
                        <div className="action-modal-label">Meh</div>
                      </div>

                      <div className="action-modal-item" onClick={() => handleRate('like')} onTouchStart={() => setPressedIcon('like')} onTouchEnd={() => setPressedIcon(null)}>
                        <div className={`action-modal-icon ${currentRating === 'like' ? 'active' : ''} ${pressedIcon === 'like' ? 'pressed' : ''}`}>
                          <Icon name="thumbs-up" state={currentRating === 'like' ? 'active' : 'default'} size={20} color="white" />
                        </div>
                        <div className="action-modal-label">Like</div>
                      </div>

                      <div className="action-modal-item" onClick={() => handleRate('love')} onTouchStart={() => setPressedIcon('love')} onTouchEnd={() => setPressedIcon(null)}>
                        <div className={`action-modal-icon ${currentRating === 'love' ? 'active' : ''} ${pressedIcon === 'love' ? 'pressed' : ''}`}>
                          <Icon name="heart" state={currentRating === 'love' ? 'active' : 'default'} size={20} color="white" />
                        </div>
                        <div className="action-modal-label">Love</div>
                      </div>

                      {/* Divider */}
                      <div className="action-modal-divider"></div>

                      {/* Watchlist Icons */}
                      <div className="action-modal-item" onClick={() => handleStatus('want')} onTouchStart={() => setPressedIcon('want')} onTouchEnd={() => setPressedIcon(null)}>
                        <div className={`action-modal-icon ${currentStatus === 'want' ? 'active' : ''} ${pressedIcon === 'want' ? 'pressed' : ''}`} style={{ position: 'relative' }}>
                          <Icon name="bookmark" state={currentStatus === 'want' ? 'active' : 'default'} size={20} color="white" />
                          {currentStatus !== 'want' && (
                            <div className="watchlist-badge">
                              <Icon name="plus-small" size={10} color="white" />
                            </div>
                          )}
                        </div>
                        <div className="action-modal-label">Want To</div>
                      </div>

                      <div className="action-modal-item" onClick={() => handleStatus('watching')} onTouchStart={() => setPressedIcon('watching')} onTouchEnd={() => setPressedIcon(null)}>
                        <div className={`action-modal-icon ${currentStatus === 'watching' ? 'active' : ''} ${pressedIcon === 'watching' ? 'pressed' : ''}`} style={{ position: 'relative' }}>
                          <Icon name="play" state={currentStatus === 'watching' ? 'active' : 'default'} size={20} color="white" />
                          {currentStatus !== 'watching' && (
                            <div className="watchlist-badge">
                              <Icon name="plus-small" size={10} color="white" />
                            </div>
                          )}
                        </div>
                        <div className="action-modal-label">Watching</div>
                      </div>

                      <div className="action-modal-item" onClick={() => handleStatus('watched')} onTouchStart={() => setPressedIcon('watched')} onTouchEnd={() => setPressedIcon(null)}>
                        <div className={`action-modal-icon ${currentStatus === 'watched' ? 'active' : ''} ${pressedIcon === 'watched' ? 'pressed' : ''}`} style={{ position: 'relative' }}>
                          <Icon name="check" state={currentStatus === 'watched' ? 'active' : 'default'} size={20} color="white" />
                          {currentStatus !== 'watched' && (
                            <div className="watchlist-badge">
                              <Icon name="plus-small" size={10} color="white" />
                            </div>
                          )}
                        </div>
                        <div className="action-modal-label">Watched</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

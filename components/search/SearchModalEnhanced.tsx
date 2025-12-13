'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import { trackSearchPerformed } from '@/utils/analytics'
import Icon from '@/components/ui/Icon'
import { FeedCard, FeedCardData } from '@/components/feed/UserActivityCard'

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
  
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedCardData, setSelectedCardData] = useState<FeedCardData | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cardLoading, setCardLoading] = useState(false)
  
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
      setSelectedCardData(null)
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

  // Build FeedCardData from TMDB item
  const buildCardData = async (item: any): Promise<FeedCardData> => {
    const mediaType = item.media_type || 'movie'
    const mediaId = `${mediaType}-${item.id}`
    
    // Fetch full details from TMDB
    const detailsRes = await fetch(`/api/tmdb/${mediaType}/${item.id}?append_to_response=credits`)
    const details = await detailsRes.json()
    
    // Fetch show comments from database
    const supabase = createClient()
    const { data: showComments } = await supabase
      .from('show_comments')
      .select(`
        id,
        comment_text,
        created_at,
        user_id,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get friends activity (simplified - just counts)
    const { data: friendsWatching } = await supabase
      .from('watch_status')
      .select('user_id')
      .eq('media_id', mediaId)
      .eq('status', 'watching')
      .limit(10)

    const { data: friendsWant } = await supabase
      .from('watch_status')
      .select('user_id')
      .eq('media_id', mediaId)
      .eq('status', 'want')
      .limit(10)

    const { data: friendsWatched } = await supabase
      .from('watch_status')
      .select('user_id')
      .eq('media_id', mediaId)
      .eq('status', 'watched')
      .limit(10)

    // Get ratings counts
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('media_id', mediaId)

    const ratingCounts = { meh: 0, like: 0, love: 0 }
    ratings?.forEach((r: any) => {
      if (r.rating in ratingCounts) ratingCounts[r.rating as keyof typeof ratingCounts]++
    })

    const currentUserRating = userRatings[mediaId] as 'meh' | 'like' | 'love' | undefined

    return {
      id: mediaId,
      media: {
        id: mediaId,
        title: details.title || details.name || item.title || item.name,
        year: parseInt((details.release_date || details.first_air_date || '')?.substring(0, 4)) || 0,
        genres: details.genres?.map((g: any) => g.name) || [],
        rating: details.vote_average || 0,
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '',
        synopsis: details.overview || '',
        creator: details.created_by?.[0]?.name || details.production_companies?.[0]?.name || '',
        cast: details.credits?.cast?.slice(0, 6).map((c: any) => c.name) || [],
        network: details.networks?.[0]?.name,
        streamingPlatforms: details.networks?.map((n: any) => n.name) || [],
        mediaType: mediaType === 'tv' ? 'TV' : 'Movie'
      },
      friends: {
        avatars: [],
        count: 0,
        text: ''
      },
      stats: {
        likeCount: 0,
        commentCount: showComments?.length || 0,
        userLiked: false
      },
      friendsActivity: {
        watching: { count: friendsWatching?.length || 0, avatars: [] },
        wantToWatch: { count: friendsWant?.length || 0, avatars: [] },
        watched: { count: friendsWatched?.length || 0, avatars: [] },
        ratings: {
          meh: ratingCounts.meh,
          like: ratingCounts.like,
          love: ratingCounts.love,
          userRating: currentUserRating
        }
      },
      comments: [],
      showComments: showComments?.map((c: any) => ({
        id: c.id,
        user: {
          id: c.profiles?.id,
          name: c.profiles?.display_name || c.profiles?.username || 'User',
          avatar: c.profiles?.avatar_url,
          username: c.profiles?.username
        },
        text: c.comment_text,
        timestamp: new Date(c.created_at).toLocaleDateString(),
        likes: 0,
        userLiked: false
      })) || []
    }
  }

  const handlePosterClick = async (item: any) => {
    setSelectedItem(item)
    setCardLoading(true)
    setIsFlipped(true)
    
    try {
      const cardData = await buildCardData(item)
      setSelectedCardData(cardData)
    } catch (error) {
      console.error('Error building card data:', error)
    } finally {
      setCardLoading(false)
    }
  }

  const handleFlipBack = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setSelectedItem(null)
      setSelectedCardData(null)
    }, 300)
  }

  // Handle rating from FeedCard
  const handleRate = async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
    if (!user) return
    
    const supabase = createClient()
    
    try {
      if (rating === null) {
        await supabase.from('ratings').delete().eq('user_id', user.id).eq('media_id', mediaId)
        setUserRatings(prev => { const u = { ...prev }; delete u[mediaId]; return u })
      } else {
        await supabase.from('ratings').upsert({
          user_id: user.id,
          media_id: mediaId,
          rating: rating
        }, { onConflict: 'user_id,media_id' })
        setUserRatings(prev => ({ ...prev, [mediaId]: rating }))
      }
      
      onSelectMedia(selectedItem, rating ?? undefined, userStatuses[mediaId] ?? undefined)
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  // Handle status from FeedCard
  const handleStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!user || !selectedItem) return
    
    const supabase = createClient()
    
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
      
      if (status === null) {
        await supabase.from('watch_status').delete().eq('user_id', user.id).eq('media_id', mediaId)
        setUserStatuses(prev => { const u = { ...prev }; delete u[mediaId]; return u })
        setUserWatchlistIds(prev => { const n = new Set(prev); n.delete(mediaId); return n })
      } else {
        await supabase.from('watch_status').upsert({
          user_id: user.id,
          media_id: mediaId,
          status: status
        }, { onConflict: 'user_id,media_id' })
        setUserStatuses(prev => ({ ...prev, [mediaId]: status }))
        setUserWatchlistIds(prev => new Set([...prev, mediaId]))
      }
      
      onSelectMedia(selectedItem, userRatings[mediaId] ?? undefined, status ?? undefined)
    } catch (error) {
      console.error('Error saving status:', error)
    }
  }

  // Handle show comment submission
  const handleSubmitShowComment = async (mediaId: string, text: string) => {
    if (!user) return
    
    const supabase = createClient()
    await supabase.from('show_comments').insert({
      user_id: user.id,
      media_id: mediaId,
      comment_text: text
    })
    
    // Refresh card data
    if (selectedItem) {
      const cardData = await buildCardData(selectedItem)
      setSelectedCardData(cardData)
    }
  }

  if (!isOpen) return null

  const displayItems = query.trim() ? results : filteredTrending
  const selectedMediaId = selectedItem ? `${selectedItem.media_type}-${selectedItem.id}` : null
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
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: colors.textPrimary }}>
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
                  <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: colors.textSecondary }} />
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
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                    >
                      <Icon name="close" size={18} color={colors.textSecondary} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', padding: '0 1.25rem 1.25rem' }}>
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
                      {(query.trim() ? displayItems.slice(0, 20) : displayItems.slice(0, 6)).map((item) => {
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

            {/* BACK - FeedCard */}
            <div className="search-card-face search-card-back">
              {cardLoading ? (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#0a0a0a',
                  borderRadius: '24px'
                }}>
                  <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : selectedCardData ? (
                <FeedCard
                  variant="b"
                  data={selectedCardData}
                  initialFlipped={true}
                  initialUserStatus={currentStatus as 'want' | 'watching' | 'watched' | undefined}
                  onFlip={handleFlipBack}
                  onRate={handleRate}
                  onSetStatus={handleStatus}
                  onSubmitShowComment={handleSubmitShowComment}
                  currentUser={profile ? {
                    id: user?.id,
                    name: profile.display_name || profile.username || '',
                    avatar: profile.avatar_url || ''
                  } : undefined}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import { trackSearchPerformed } from '@/utils/analytics'
import { ensureReleaseReminder } from '@/lib/reminders'
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
  const [availableSeasons, setAvailableSeasons] = useState<Array<{ seasonNumber: number; airDate?: string | null; posterPath?: string | null; overview?: string | null }>>([])
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [lightboxPoster, setLightboxPoster] = useState<{ path: string; title: string } | null>(null)
  const detailsCache = useRef<Record<string, any>>({})
  
  const colors = useThemeColors()
  const debouncedQuery = useDebounce(query, 500)

  // Refs for JS-based scroll (same pattern as FeedCard)
  const contentScrollRef = useRef<HTMLDivElement>(null)
  const contentInnerRef = useRef<HTMLDivElement>(null)
  const scrollOffsetRef = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const scrollStartY = useRef<number>(0)
  const velocityY = useRef<number>(0)
  const lastTouchY = useRef<number>(0)
  const lastMoveTime = useRef<number>(0)
  const momentumRAF = useRef<number | null>(null)

  // Helper to apply scroll transform directly to DOM (GPU accelerated)
  const applyScrollTransform = useCallback((offset: number) => {
    if (contentInnerRef.current) {
      contentInnerRef.current.style.transform = `translate3d(0, -${offset}px, 0)`
    }
    scrollOffsetRef.current = offset
  }, [])

  // Helper to calculate max scroll based on actual content height
  const getMaxScroll = useCallback(() => {
    if (!contentScrollRef.current || !contentInnerRef.current) return 0
    const containerHeight = contentScrollRef.current.clientHeight
    const contentHeight = contentInnerRef.current.scrollHeight
    return Math.max(0, contentHeight - containerHeight)
  }, [])

  // Reset scroll when modal closes or query changes
  useEffect(() => {
    scrollOffsetRef.current = 0
    applyScrollTransform(0)
  }, [isOpen, query, applyScrollTransform])

  // Touch handlers for scroll
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Cancel any ongoing momentum
    if (momentumRAF.current) {
      cancelAnimationFrame(momentumRAF.current)
      momentumRAF.current = null
    }
    touchStartY.current = e.touches[0].clientY
    scrollStartY.current = scrollOffsetRef.current
    lastTouchY.current = e.touches[0].clientY
    lastMoveTime.current = Date.now()
    velocityY.current = 0
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!contentScrollRef.current || !contentInnerRef.current) return
    
    // Prevent page scroll
    e.preventDefault()
    e.stopPropagation()
    
    const now = Date.now()
    const touchY = e.touches[0].clientY
    const deltaYFromStart = touchStartY.current - touchY
    const maxScroll = getMaxScroll()
    
    // Calculate velocity
    const dt = now - lastMoveTime.current
    if (dt > 0) {
      const dy = lastTouchY.current - touchY
      velocityY.current = 0.8 * velocityY.current + 0.2 * (dy / dt)
    }
    
    // Calculate new offset with rubber-band effect
    const newOffset = scrollStartY.current + deltaYFromStart
    let finalOffset: number
    if (newOffset < 0) {
      finalOffset = newOffset * 0.3 // Rubber band at top
    } else if (newOffset > maxScroll) {
      finalOffset = maxScroll + (newOffset - maxScroll) * 0.3 // Rubber band at bottom
    } else {
      finalOffset = newOffset
    }
    
    applyScrollTransform(finalOffset)
    lastTouchY.current = touchY
    lastMoveTime.current = now
  }, [getMaxScroll, applyScrollTransform])

  const handleTouchEnd = useCallback(() => {
    const maxScroll = getMaxScroll()
    const currentOffset = scrollOffsetRef.current
    
    // Bounce back if over-scrolled
    if (currentOffset < 0 || currentOffset > maxScroll) {
      const targetOffset = currentOffset < 0 ? 0 : maxScroll
      if (contentInnerRef.current) {
        contentInnerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        applyScrollTransform(targetOffset)
        setTimeout(() => {
          if (contentInnerRef.current) {
            contentInnerRef.current.style.transition = ''
          }
        }, 300)
      }
      return
    }
    
    // Apply momentum
    let velocity = velocityY.current * 16.67
    if (Math.abs(velocity) < 0.5) return
    
    velocity = Math.max(-50, Math.min(50, velocity))
    
    const animateMomentum = () => {
      if (Math.abs(velocity) < 0.3) {
        momentumRAF.current = null
        return
      }
      
      const maxScroll = getMaxScroll()
      const currentOffset = scrollOffsetRef.current
      
      if ((currentOffset <= 0 && velocity < 0) || (currentOffset >= maxScroll && velocity > 0)) {
        const targetOffset = currentOffset <= 0 ? 0 : maxScroll
        if (contentInnerRef.current) {
          contentInnerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          applyScrollTransform(targetOffset)
          setTimeout(() => {
            if (contentInnerRef.current) {
              contentInnerRef.current.style.transition = ''
            }
          }, 300)
        }
        return
      }
      
      applyScrollTransform(currentOffset + velocity)
      velocity *= 0.92
      momentumRAF.current = requestAnimationFrame(animateMomentum)
    }
    
    momentumRAF.current = requestAnimationFrame(animateMomentum)
  }, [getMaxScroll, applyScrollTransform])

  // Mouse wheel support for desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const maxScroll = getMaxScroll()
    const newOffset = scrollOffsetRef.current + e.deltaY
    const clampedOffset = Math.max(0, Math.min(newOffset, maxScroll))
    applyScrollTransform(clampedOffset)
  }, [getMaxScroll, applyScrollTransform])

  // Attach native touch listeners with { passive: false }
  useEffect(() => {
    const element = contentScrollRef.current
    if (!element || !isOpen) return
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, handleTouchStart, handleTouchMove, handleTouchEnd])

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

  // iOS-safe scroll lock - prevents zoom and horizontal scroll issues
  useEffect(() => {
    if (isOpen) {
      // Save scroll position and lock body
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1)
      }
      setQuery('')
      setResults([])
      setSelectedItem(null)
      setSelectedCardData(null)
      setIsFlipped(false)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
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

  // Extract valid seasons (skip specials/season 0) from TMDB TV details
  const getValidSeasons = (details: any) => {
    return (details.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .sort((a: any, b: any) => a.season_number - b.season_number)
      .map((s: any) => ({
        seasonNumber: s.season_number,
        airDate: s.air_date || null,
        posterPath: s.poster_path || null,
        overview: s.overview || null
      }))
  }

  // Default season: the most recent season that has started airing (falls back to latest)
  const getDefaultSeason = (seasons: Array<{ seasonNumber: number; airDate?: string | null }>) => {
    if (seasons.length === 0) return null
    const today = new Date().toISOString().split('T')[0]
    const aired = seasons.filter(s => s.airDate && s.airDate <= today)
    return (aired.length > 0 ? aired[aired.length - 1] : seasons[seasons.length - 1]).seasonNumber
  }

  // Build FeedCardData from TMDB item. For TV, seasonNumber selects which season row to target.
  const buildCardData = async (item: any, seasonNumber?: number | null): Promise<{ cardData: FeedCardData; seasons: any[]; season: number | null }> => {
    const mediaType = item.media_type || 'movie'

    // Fetch full details from TMDB (cached per item)
    const cacheKey = `${mediaType}-${item.id}`
    let details = detailsCache.current[cacheKey]
    if (!details) {
      const detailsRes = await fetch(`/api/tmdb/${mediaType}/${item.id}?append_to_response=credits`)
      details = await detailsRes.json()
      detailsCache.current[cacheKey] = details
    }

    // Season-specific media ID for TV (canonical format: tv-{tmdbId}-s{n})
    const seasons = mediaType === 'tv' ? getValidSeasons(details) : []
    let season: number | null = null
    if (mediaType === 'tv' && seasons.length > 0) {
      season = seasonNumber ?? getDefaultSeason(seasons)
    }
    const mediaId = mediaType === 'tv' && season !== null
      ? `tv-${item.id}-s${season}`
      : `${mediaType}-${item.id}`
    const seasonInfo = season !== null ? seasons.find((s: any) => s.seasonNumber === season) : null
    
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

    const posterPath = seasonInfo?.posterPath || details.poster_path
    const yearSource = seasonInfo?.airDate || details.release_date || details.first_air_date || ''

    const cardData: FeedCardData = {
      id: mediaId,
      media: {
        id: mediaId,
        title: details.title || details.name || item.title || item.name,
        year: parseInt(yearSource.substring(0, 4)) || 0,
        genres: details.genres?.map((g: any) => g.name) || [],
        rating: details.vote_average || 0,
        posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '',
        synopsis: seasonInfo?.overview || details.overview || '',
        creator: details.created_by?.[0]?.name || details.production_companies?.[0]?.name || '',
        cast: details.credits?.cast?.slice(0, 6).map((c: any) => c.name) || [],
        network: details.networks?.[0]?.name,
        streamingPlatforms: details.networks?.map((n: any) => n.name) || [],
        season: season ?? undefined,
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

    return { cardData, seasons, season }
  }

  const handlePosterClick = async (item: any) => {
    setSelectedItem(item)
    setCardLoading(true)
    setIsFlipped(true)
    
    try {
      const { cardData, seasons, season } = await buildCardData(item)
      setSelectedCardData(cardData)
      setAvailableSeasons(seasons)
      setSelectedSeason(season)
    } catch (error) {
      console.error('Error building card data:', error)
    } finally {
      setCardLoading(false)
    }
  }

  const handleSeasonSelect = async (seasonNumber: number) => {
    if (!selectedItem || seasonNumber === selectedSeason) return
    setSelectedSeason(seasonNumber)
    try {
      const { cardData } = await buildCardData(selectedItem, seasonNumber)
      setSelectedCardData(cardData)
    } catch (error) {
      console.error('Error switching season:', error)
    }
  }

  const handleFlipBack = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setSelectedItem(null)
      setSelectedCardData(null)
      setAvailableSeasons([])
      setSelectedSeason(null)
    }, 300)
  }

  // Build a season-aware media object for parent onSelectMedia callbacks
  const buildMediaForParent = (mediaId: string) => {
    if (!selectedItem) return null
    const seasonMatch = mediaId.match(/-s(\d+)$/)
    const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : null
    if (seasonNumber === null) return selectedItem
    const seasonInfo = availableSeasons.find(s => s.seasonNumber === seasonNumber)
    const baseTitle = selectedItem.title || selectedItem.name
    return {
      ...selectedItem,
      id: mediaId,
      tmdb_id: selectedItem.id,
      media_type: 'tv',
      title: `${baseTitle} - Season ${seasonNumber}`,
      name: `${baseTitle} - Season ${seasonNumber}`,
      season_number: seasonNumber,
      poster_path: seasonInfo?.posterPath || selectedItem.poster_path,
      overview: seasonInfo?.overview || selectedItem.overview,
      first_air_date: seasonInfo?.airDate || selectedItem.first_air_date
    }
  }

  // Ensure a media row exists before saving a rating/status (ratings + watch_status FK to media.id)
  const ensureMediaRow = async (mediaId: string) => {
    if (!selectedItem) return
    const supabase = createClient()
    const mediaType = selectedItem.media_type || 'movie'
    const details = detailsCache.current[`${mediaType}-${selectedItem.id}`]
    const seasonMatch = mediaId.match(/-s(\d+)$/)
    const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : null
    const seasonInfo = seasonNumber !== null
      ? availableSeasons.find(s => s.seasonNumber === seasonNumber)
      : null

    const baseTitle = selectedItem.title || selectedItem.name
    const title = seasonNumber !== null ? `${baseTitle} - Season ${seasonNumber}` : baseTitle

    await supabase.from('media').upsert({
      id: mediaId,
      tmdb_id: selectedItem.id,
      media_type: mediaType,
      title,
      poster_path: seasonInfo?.posterPath || selectedItem.poster_path,
      backdrop_path: selectedItem.backdrop_path,
      overview: seasonInfo?.overview || selectedItem.overview,
      release_date: seasonInfo?.airDate || selectedItem.release_date || selectedItem.first_air_date || null,
      vote_average: selectedItem.vote_average,
      tmdb_data: details
        ? { ...details, season_number: seasonNumber ?? undefined, credits: undefined }
        : { ...selectedItem, season_number: seasonNumber ?? undefined }
    }, { onConflict: 'id' })
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
        await ensureMediaRow(mediaId)
        await supabase.from('ratings').upsert({
          user_id: user.id,
          media_id: mediaId,
          rating: rating
        }, { onConflict: 'user_id,media_id' })
        setUserRatings(prev => ({ ...prev, [mediaId]: rating }))
      }
      
      onSelectMedia(buildMediaForParent(mediaId), rating ?? undefined, userStatuses[mediaId] ?? undefined)
    } catch (error) {
      console.error('Error saving rating:', error)
    }
  }

  // Handle status from FeedCard
  const handleStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!user || !selectedItem) return
    
    const supabase = createClient()
    
    try {
      await ensureMediaRow(mediaId)
      
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
        // Unreleased show added to a list -> auto-set the release reminder
        if (status === 'want' || status === 'watching') {
          await ensureReleaseReminder(supabase, user.id, mediaId)
        }
      }
      
      onSelectMedia(buildMediaForParent(mediaId), userRatings[mediaId] ?? undefined, status ?? undefined)
    } catch (error) {
      console.error('Error saving status:', error)
    }
  }

  // Handle show comment submission
  const handleSubmitShowComment = async (mediaId: string, text: string) => {
    if (!user) return
    
    const supabase = createClient()
    await ensureMediaRow(mediaId)
    await supabase.from('show_comments').insert({
      user_id: user.id,
      media_id: mediaId,
      comment_text: text
    })
    
    // Refresh card data (keep the currently selected season)
    if (selectedItem) {
      const { cardData } = await buildCardData(selectedItem, selectedSeason)
      setSelectedCardData(cardData)
    }
  }

  if (!isOpen) return null

  const displayItems = query.trim() ? results : filteredTrending
  // Season-aware: card data ID is tv-{id}-s{n} for TV shows
  const selectedMediaId = selectedCardData?.id || (selectedItem ? `${selectedItem.media_type}-${selectedItem.id}` : null)
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
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
          border: ${colors.goldBorder};
          box-sizing: border-box;
        }

        .search-card-front {
          background: ${colors.isDark ? 'rgba(20, 20, 25, 1)' : 'rgba(255, 255, 255, 1)'};
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          height: 100%;
          min-height: 0;
          z-index: 2;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .search-card-back {
          transform: rotateY(180deg);
          background: #0a0a0a;
          z-index: 1;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
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
          padding: '1rem',
          overscrollBehavior: 'contain'
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
                  Find a Show
                </h2>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                >
                  <Icon name="close" variant="circle" size={42} />
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

              {/* Content Area - JS-based scroll */}
              <div 
                ref={contentScrollRef}
                onWheel={handleWheel}
                style={{ 
                  flex: 1, 
                  minHeight: 0, 
                  overflow: 'hidden',
                  touchAction: 'none',
                  position: 'relative'
                }}
              >
                <div 
                  ref={contentInnerRef}
                  style={{
                    padding: '0 1.25rem 1.25rem',
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                >
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                    <div style={{ width: '32px', height: '32px', border: `3px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
                              {item.poster_path && (
                                <button
                                  aria-label="View full-size poster"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setLightboxPoster({ path: item.poster_path, title: item.title || item.name || '' })
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 0, 0, 0.65)',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                >
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                  </svg>
                                </button>
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
                    <div style={{ width: '32px', height: '32px', border: `3px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9rem' }}>
                    Start typing to search
                  </div>
                )}
                </div>
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
                  <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : selectedCardData ? (
                <FeedCard
                  key={selectedCardData.id}
                  variant="b"
                  data={selectedCardData}
                  initialFlipped={true}
                  initialUserStatus={currentStatus as 'want' | 'watching' | 'watched' | undefined}
                  onFlip={handleFlipBack}
                  onRate={handleRate}
                  onSetStatus={handleStatus}
                  onSubmitShowComment={handleSubmitShowComment}
                  seasonSelector={availableSeasons.length > 1 && selectedSeason !== null ? {
                    seasons: availableSeasons,
                    selected: selectedSeason,
                    onSelect: handleSeasonSelect
                  } : undefined}
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

      {/* Full-size poster lightbox (TMDB original size) */}
      {lightboxPoster && (
        <div
          onClick={() => setLightboxPoster(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '24px',
            cursor: 'zoom-out'
          }}
        >
          <img
            src={`https://image.tmdb.org/t/p/original${lightboxPoster.path}`}
            alt={lightboxPoster.title}
            style={{
              maxWidth: '100%',
              maxHeight: '92vh',
              borderRadius: '12px',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.8)'
            }}
          />
          <button
            aria-label="Close"
            onClick={() => setLightboxPoster(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}

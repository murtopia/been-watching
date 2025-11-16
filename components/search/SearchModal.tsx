'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import TVSeasonCard from './TVSeasonCard'
import MediaCard from '@/components/media/MediaCard'
import MediaBadges from '@/components/media/MediaBadges'
import { trackSearchPerformed } from '@/utils/analytics'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMedia: (media: any, rating?: string, status?: string) => void
  user?: any
}

export default function SearchModal({ isOpen, onClose, onSelectMedia, user }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all')
  const colors = useThemeColors()

  const debouncedQuery = useDebounce(query, 300)

  // Modal-specific colors
  const modalBg = colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.55)'
  const modalBorder = colors.isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.18)'

  // Prevent body scroll when modal is open and clear search on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Clear search query when modal closes
      setQuery('')
      setResults([])
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
      const endpoint = mediaType === 'all' ? 'search/multi' : `search/${mediaType}`
      const response = await fetch(`/api/tmdb/${endpoint}?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      // Filter out person results
      const filtered = data.results?.filter((item: any) => item.media_type !== 'person') || []
      setResults(filtered)

      // Track search event
      trackSearchPerformed({
        query: searchQuery,
        results_count: filtered.length,
        media_type_filter: mediaType,
        result_clicked: false // Will be tracked separately on click
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [mediaType])

  useEffect(() => {
    searchMedia(debouncedQuery)
  }, [debouncedQuery, searchMedia])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'transparent',
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
          maxWidth: '600px',
          height: '85vh',
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
        {/* Search Input - At Top */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: modalBorder, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: colors.textSecondary }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shows or movies..."
              style={{
                width: '100%',
                padding: '0.875rem 3rem 0.875rem 3rem',
                border: colors.inputBorder,
                borderRadius: '12px',
                fontSize: '1rem',
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
                  color: colors.textSecondary,
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.brandPink
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textSecondary
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: colors.brandGradient,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <X style={{ width: '24px', height: '24px', color: 'white' }} />
          </button>
        </div>

        {/* Type Filter */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', borderBottom: modalBorder }}>
          {(['all', 'tv', 'movie'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: mediaType === type ? colors.brandBlue : colors.buttonBg,
                color: mediaType === type ? 'white' : colors.textSecondary
              }}
            >
              {type === 'all' ? 'All' : type === 'tv' ? 'TV Shows' : 'Movies'}
            </button>
          ))}
        </div>

        {/* Results */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Sticky shadow overlay at top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '20px',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 10
          }} />

          {/* Scrollable content */}
          <div style={{
            height: '100%',
            overflowY: 'auto',
            padding: '1rem 1.5rem'
          }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((item) => {
                  const isTV = item.media_type === 'tv' || mediaType === 'tv'
                  return isTV ? (
                    <TVShowWithSeasons
                      key={`tv-${item.id}`}
                      show={item}
                      onSelect={onSelectMedia}
                      user={user}
                    />
                  ) : (
                    <SearchResultCard
                      key={`movie-${item.id}`}
                      media={item}
                      onSelect={onSelectMedia}
                      user={user}
                    />
                  )
                })}
              </div>
            ) : query.trim() ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.95rem' }}>
                No results found for "{query}"
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.95rem' }}>
                Start typing to search for shows and movies
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchResultCard({ media, onSelect, user }: { media: any; onSelect: (media: any, rating?: string, status?: string) => void; user?: any }) {
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const mediaId = media.media_type === 'movie' ? `movie-${media.id}` : `tv-${media.id}`

  // Fetch existing rating/status on mount
  useEffect(() => {
    async function fetchExistingData() {
      if (!user) {
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        // Fetch rating
        const { data: ratingData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .single()

        if (ratingData) {
          setSelectedRating(ratingData.rating)
        }

        // Fetch watch status
        const { data: statusData } = await supabase
          .from('watch_status')
          .select('status')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .single()

        if (statusData) {
          setSelectedStatus(statusData.status)
        }
      } catch (error) {
        // Silently fail - it's okay if there's no existing data
      } finally {
        setLoading(false)
      }
    }

    fetchExistingData()
  }, [user, mediaId])

  const handleRating = (rating: string) => {
    const newRating = rating === selectedRating ? null : rating
    setSelectedRating(newRating)
    // Call onSelect to save in background, but don't close modal
    onSelect(media, newRating ?? undefined, selectedStatus ?? undefined)
  }

  const handleStatus = (status: string) => {
    const newStatus = status === selectedStatus ? null : status
    setSelectedStatus(newStatus)
    // Call onSelect to save in background, but don't close modal
    onSelect(media, selectedRating ?? undefined, newStatus ?? undefined)
  }

  return (
    <div className="activity-card">
      <MediaCard
        media={media}
        onRate={handleRating}
        onStatus={handleStatus}
        currentRating={selectedRating}
        currentStatus={selectedStatus}
      />
    </div>
  )
}

function TVShowWithSeasons({ show, onSelect, user }: { show: any; onSelect: (media: any, rating?: string, status?: string) => void; user?: any }) {
  const [seasons, setSeasons] = useState<any[]>([])
  const [showData, setShowData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const colors = useThemeColors()

  // Fetch seasons on mount and display them automatically
  useEffect(() => {
    fetchSeasons()
  }, [])

  const fetchSeasons = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tmdb/tv/${show.id}`)
      const data = await response.json()
      setShowData(data)
      // Filter out season 0 (specials) and sort by season number
      const validSeasons = data.seasons?.filter((s: any) => s.season_number > 0) || []
      setSeasons(validSeasons)
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <div style={{ width: '24px', height: '24px', border: `3px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        seasons.map((season) => (
          <TVSeasonCard
            key={season.id}
            show={showData || show}
            season={season}
            onSelect={onSelect}
            user={user}
          />
        ))
      )}
    </div>
  )
}
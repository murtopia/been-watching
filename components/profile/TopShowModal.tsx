'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useThemeColors } from '@/hooks/useThemeColors'
import MediaCard from '@/components/media/MediaCard'
import { safeFormatDate } from '@/utils/dateFormatting'

interface TopShowModalProps {
  onClose: () => void
  onSelect: (media: any) => void
  slotNumber: number
  userId: string
}

export default function TopShowModal({ onClose, onSelect, slotNumber, userId }: TopShowModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all')
  const supabase = createClient()
  const colors = useThemeColors()

  const debouncedQuery = useDebounce(query, 300)

  // Modal-specific colors
  const modalBg = colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.55)'
  const modalBorder = colors.isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.18)'

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

  const handleSelect = async (item: any) => {
    // Item comes from TVSeasonCard with full structure
    const mediaData = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      media_type: item.media_type || (mediaType !== 'all' ? mediaType : 'movie'),
      season_number: item.season_number,
      tmdb_id: item.tmdb_id || (typeof item.id === 'string' && item.id.includes('-') ? parseInt(item.id.split('-')[1]) : item.id)
    }

    try {
      // Save to the appropriate slot in the profile
      const columnName = `top_show_${slotNumber}`
      const { error } = await supabase
        .from('profiles')
        .update({ [columnName]: mediaData })
        .eq('id', userId)

      if (error) {
        console.error('Error saving top show:', error)
        console.error('Attempted to save:', mediaData)
        alert(`Error saving: ${error.message || JSON.stringify(error)}`)
      } else {
        onSelect(mediaData)
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

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

        {/* Results - Scrollable */}
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
                      onSelect={handleSelect}
                      slotNumber={slotNumber}
                    />
                  ) : (
                    <MovieResultCard
                      key={`movie-${item.id}`}
                      media={item}
                      onSelect={handleSelect}
                      slotNumber={slotNumber}
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

// TV Show component that fetches and displays all seasons
function TVShowWithSeasons({ show, onSelect, slotNumber }: { show: any; onSelect: Function; slotNumber: number }) {
  const [seasons, setSeasons] = useState<any[]>([])
  const [showData, setShowData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const colors = useThemeColors()

  useEffect(() => {
    fetchSeasons()
  }, [])

  const fetchSeasons = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tmdb/tv/${show.id}`)
      const data = await response.json()
      setShowData(data)
      // Filter out season 0 (specials)
      const validSeasons = data.seasons?.filter((s: any) => s.season_number > 0) || []
      setSeasons(validSeasons)
    } catch (error) {
      console.error('Error fetching seasons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeasonSelect = (season: any) => {
    const mediaWithSeason = {
      id: `tv-${show.id}-s${season.season_number}`,
      title: `${show.name} - Season ${season.season_number}`,
      name: `${show.name} - Season ${season.season_number}`,
      poster_path: season.poster_path || show.poster_path,
      media_type: 'tv',
      season_number: season.season_number,
      tmdb_id: show.id
    }
    onSelect(mediaWithSeason)
  }

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <div style={{ width: '24px', height: '24px', border: `3px solid ${colors.brandPink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        seasons.map((season) => (
          <SeasonSelectCard
            key={season.id}
            show={showData || show}
            season={season}
            onSelect={handleSeasonSelect}
            slotNumber={slotNumber}
          />
        ))
      )}
    </div>
  )
}

// Season card for selecting a specific season for Top 3
function SeasonSelectCard({ show, season, onSelect, slotNumber }: { show: any; season: any; onSelect: Function; slotNumber: number }) {
  const colors = useThemeColors()

  const seasonMediaId = `tv-${show.id}-s${season.season_number}`

  const handleAddToTop = () => {
    onSelect(season)
  }

  // Create media object for this season
  const seasonMedia = {
    id: seasonMediaId,
    title: `${show.name} - Season ${season.season_number}`,
    name: `${show.name} - Season ${season.season_number}`,
    poster_path: season.poster_path || show.poster_path,
    vote_average: season.vote_average,
    release_date: safeFormatDate(season.air_date) || undefined,
    overview: season.overview || show.overview,
    media_type: 'tv',
    tmdb_id: show.id,
    tmdb_data: {
      ...show,
      season_number: season.season_number,
      season_id: season.id,
      number_of_seasons: show.number_of_seasons,
      networks: show.networks
    }
  }

  return (
    <div style={{ marginBottom: '1rem', position: 'relative' }}>
      {/* Add to Top # button in upper right */}
      <button
        onClick={handleAddToTop}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.5rem 1rem',
          background: colors.brandGradient,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10
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
        Add to Top #{slotNumber}
      </button>

      <div className="activity-card">
        <MediaCard
          media={seasonMedia}
          showActions={false}
          seasonNumber={season.season_number}
        />
      </div>
    </div>
  )
}

// Movie card for selecting a movie for Top 3
function MovieResultCard({ media, onSelect, slotNumber }: { media: any; onSelect: Function; slotNumber: number }) {
  const colors = useThemeColors()

  const handleAddToTop = () => {
    onSelect(media)
  }

  // Format the media object with safe date formatting
  const formattedMedia = {
    ...media,
    release_date: safeFormatDate(media.release_date || media.first_air_date) || undefined
  }

  return (
    <div style={{ marginBottom: '1rem', position: 'relative' }}>
      {/* Add to Top # button in upper right */}
      <button
        onClick={handleAddToTop}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          padding: '0.5rem 1rem',
          background: colors.brandGradient,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10
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
        Add to Top #{slotNumber}
      </button>

      <div className="activity-card">
        <MediaCard
          media={formattedMedia}
          showActions={false}
        />
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import MediaCard from '@/components/media/MediaCard'

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

  const debouncedQuery = useDebounce(query, 300)

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
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '600px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.1)',
            color: '#666',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
          }}
        >
          ×
        </button>

        {/* Header with Search */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>
            Select Show for Slot #{slotNumber}
          </h2>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#999' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shows or movies..."
              autoFocus
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 3rem',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white'
              }}
            />
          </div>
        </div>

        {/* Type Filter */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
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
                background: mediaType === type ? '#0095f6' : '#f0f0f0',
                color: mediaType === type ? 'white' : '#666',
                transition: 'all 0.2s'
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
                <div style={{ width: '32px', height: '32px', border: '4px solid #e94d88', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999', fontSize: '0.95rem' }}>
                No results found for "{query}"
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#999', fontSize: '0.95rem' }}>
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
          <div style={{ width: '24px', height: '24px', border: '3px solid #e94d88', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
  const handleClick = () => {
    onSelect(season)
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        {(season.poster_path || show.poster_path) && (
          <img
            src={`https://image.tmdb.org/t/p/w185${season.poster_path || show.poster_path}`}
            alt={`Season ${season.season_number}`}
            style={{
              width: '80px',
              height: '120px',
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
            {show.name} - Season {season.season_number}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            {season.air_date && `${season.air_date.substring(0, 4)}`}
            {season.episode_count && ` • ${season.episode_count} episodes`}
          </div>
          {season.overview && (
            <div style={{ fontSize: '0.8125rem', color: '#999', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {season.overview}
            </div>
          )}
          <button
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Add to Top #{slotNumber}
          </button>
        </div>
      </div>
    </div>
  )
}

// Movie card for selecting a movie for Top 3
function MovieResultCard({ media, onSelect, slotNumber }: { media: any; onSelect: Function; slotNumber: number }) {
  const handleClick = () => {
    onSelect(media)
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {media.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w185${media.poster_path}`}
            alt={media.title || media.name}
            style={{
              width: '80px',
              height: '120px',
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
            {media.title || media.name}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            {(media.release_date || media.first_air_date) &&
              `${(media.release_date || media.first_air_date).substring(0, 4)}`}
            {media.vote_average && ` • ⭐ ${media.vote_average.toFixed(1)}`}
          </div>
          {media.overview && (
            <div style={{ fontSize: '0.8125rem', color: '#999', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {media.overview}
            </div>
          )}
        </div>
      </div>
      <button
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Add to Top #{slotNumber}
      </button>
    </div>
  )
}

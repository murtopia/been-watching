'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useThemeColors } from '@/hooks/useThemeColors'
import Icon from '@/components/ui/Icon'

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

  const debouncedQuery = useDebounce(query, 500)

  // Gold theme styling to match SearchModalEnhanced
  const goldBorder = `1px solid ${colors.goldAccent}`

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
    const itemMediaType = item.media_type || (mediaType !== 'all' ? mediaType : 'movie')
    const mediaData = {
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      media_type: itemMediaType,
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
        // Create activity for Card 6 (Top 3 Update)
        const mediaId = typeof item.id === 'string' ? item.id : `${itemMediaType}-${item.id}`
        
        // Ensure media exists in media table
        const { data: existingMedia } = await supabase
          .from('media')
          .select('id')
          .eq('id', mediaId)
          .maybeSingle()
        
        if (!existingMedia) {
          // Create media record if it doesn't exist
          await supabase.from('media').insert({
            id: mediaId,
            title: mediaData.title,
            poster_path: mediaData.poster_path,
            media_type: itemMediaType,
            tmdb_data: {
              id: mediaData.tmdb_id,
              season_number: mediaData.season_number
            }
          })
        }
        
        // Create activity for the Top 3 update
        await supabase.from('activities').insert({
          user_id: userId,
          media_id: mediaId,
          activity_type: 'top_3_update',
          activity_data: {
            rank: slotNumber,
            title: mediaData.title,
            poster_path: mediaData.poster_path
          }
        })
        
        console.log('Created Top 3 update activity for slot', slotNumber)
        
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
          height: '645px',
          maxHeight: '90vh',
          background: colors.isDark ? 'rgba(20, 20, 25, 1)' : 'rgba(255, 255, 255, 1)',
          borderRadius: '24px',
          border: goldBorder,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.25rem 0.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: colors.textPrimary }}>
            Select Top #{slotNumber}
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
                onClick={() => { setQuery(''); setResults([]) }}
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

        {/* Type Filter */}
        <div style={{ padding: '0 1.25rem 1rem', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {(['all', 'tv', 'movie'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8125rem',
                fontWeight: '600',
                border: mediaType === type ? `1px solid ${colors.goldAccent}` : '1px solid transparent',
                cursor: 'pointer',
                background: mediaType === type 
                  ? `linear-gradient(135deg, ${colors.goldAccent}22, ${colors.goldAccent}11)` 
                  : colors.buttonBg,
                color: mediaType === type ? colors.goldAccent : colors.textSecondary,
                transition: 'all 0.2s ease'
              }}
            >
              {type === 'all' ? 'All' : type === 'tv' ? 'TV Shows' : 'Movies'}
            </button>
          ))}
        </div>

        {/* Results - Scrollable */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '0 1.25rem 1.25rem',
          minHeight: 0
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{ width: '32px', height: '32px', border: `3px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9375rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: colors.textTertiary, fontSize: '0.9375rem' }}>
              Search for shows or movies to add to your Top 3
            </div>
          )}
        </div>
        
        {/* Spinner animation */}
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
          <div style={{ width: '24px', height: '24px', border: `3px solid ${colors.goldAccent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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

  const handleAddToTop = () => {
    onSelect(season)
  }

  return (
    <div style={{ 
      position: 'relative',
      background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '12px',
      padding: '0.75rem',
      border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {/* Poster */}
        <div style={{ 
          width: '60px', 
          height: '90px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          flexShrink: 0,
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        }}>
          {(season.poster_path || show.poster_path) && (
            <img 
              src={`https://image.tmdb.org/t/p/w200${season.poster_path || show.poster_path}`}
              alt={`${show.name} Season ${season.season_number}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: colors.textPrimary,
            lineHeight: 1.3,
            marginBottom: '0.25rem'
          }}>
            {show.name}
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '0.8125rem', 
            color: colors.textSecondary,
            marginBottom: '0.5rem'
          }}>
            Season {season.season_number}
          </p>
          
          {/* Add Button */}
          <button
            onClick={handleAddToTop}
            style={{
              padding: '0.375rem 0.75rem',
              background: `linear-gradient(135deg, ${colors.goldAccent}, ${colors.goldAccent}dd)`,
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
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
  const colors = useThemeColors()

  const handleAddToTop = () => {
    onSelect(media)
  }

  return (
    <div style={{ 
      position: 'relative',
      background: colors.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: '12px',
      padding: '0.75rem',
      border: `1px solid ${colors.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {/* Poster */}
        <div style={{ 
          width: '60px', 
          height: '90px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          flexShrink: 0,
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        }}>
          {media.poster_path && (
            <img 
              src={`https://image.tmdb.org/t/p/w200${media.poster_path}`}
              alt={media.title || media.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: colors.textPrimary,
            lineHeight: 1.3,
            marginBottom: '0.25rem'
          }}>
            {media.title || media.name}
          </h4>
          {(media.release_date || media.first_air_date) && (
            <p style={{ 
              margin: 0, 
              fontSize: '0.8125rem', 
              color: colors.textSecondary,
              marginBottom: '0.5rem'
            }}>
              {new Date(media.release_date || media.first_air_date).getFullYear()}
            </p>
          )}
          
          {/* Add Button */}
          <button
            onClick={handleAddToTop}
            style={{
              padding: '0.375rem 0.75rem',
              background: `linear-gradient(135deg, ${colors.goldAccent}, ${colors.goldAccent}dd)`,
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Add to Top #{slotNumber}
          </button>
        </div>
      </div>
    </div>
  )
}

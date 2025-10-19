interface MediaBadgesProps {
  mediaType: 'tv' | 'movie'
  season?: number
  seasonNumber?: number // For displaying specific season (e.g., "S2" instead of "2 Seasons")
  networks?: Array<{ id: number; name: string; logo_path?: string }>
  showTrailer?: boolean
  onTrailerClick?: () => void
}

export default function MediaBadges({ mediaType, season, seasonNumber, networks, showTrailer, onTrailerClick }: MediaBadgesProps) {
  // Network logo/badge colors mapping
  const getNetworkStyle = (networkName: string) => {
    const name = networkName.toLowerCase()
    if (name.includes('disney') || name.includes('d+')) return { bg: '#113CCF', text: 'white', label: 'D+' }
    if (name.includes('hbo')) return { bg: '#8B30D1', text: 'white', label: 'HBO' }
    if (name.includes('netflix')) return { bg: '#E50914', text: 'white', label: 'N' }
    if (name.includes('hulu')) return { bg: '#1CE783', text: 'white', label: 'Hulu' }
    if (name.includes('paramount')) return { bg: '#0064FF', text: 'white', label: 'P+' }
    if (name.includes('apple')) return { bg: '#000000', text: 'white', label: 'A+' }
    if (name.includes('amazon') || name.includes('prime')) return { bg: '#00A8E1', text: 'white', label: 'Prime' }
    if (name.includes('max')) return { bg: '#002BE7', text: 'white', label: 'MAX' }
    return { bg: '#666', text: 'white', label: networkName.substring(0, 3).toUpperCase() }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
      {/* Season Badge (for TV shows) */}
      {mediaType === 'tv' && (seasonNumber || season) && (
        <span style={{
          padding: '0.125rem 0.5rem',
          background: '#9c27b0',
          color: 'white',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600'
        }}>
          {seasonNumber ? `S${seasonNumber}` : (season === 1 ? 'S1' : `${season} Seasons`)}
        </span>
      )}

      {/* TV/Movie Badge */}
      <span style={{
        padding: '0.125rem 0.5rem',
        background: mediaType === 'tv' ? '#0095f6' : '#ff9800',
        color: 'white',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '600'
      }}>
        {mediaType === 'tv' ? 'TV' : 'Movie'}
      </span>

      {/* Network Badges */}
      {networks && (() => {
        // Deduplicate networks by name
        const uniqueNetworks = networks.filter((network, index, self) =>
          index === self.findIndex((n) => n.name === network.name)
        )
        return uniqueNetworks.slice(0, 3).map((network) => {
          const style = getNetworkStyle(network.name)
          return (
            <span
              key={network.id}
              style={{
                padding: '0.125rem 0.5rem',
                background: style.bg,
                color: style.text,
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}
            >
              {style.label}
            </span>
          )
        })
      })()}

      {/* Trailer Link */}
      {showTrailer && onTrailerClick && (
        <button
          onClick={onTrailerClick}
          style={{
            padding: '0.125rem 0.5rem',
            background: 'white',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          ▶ Trailer
        </button>
      )}
    </div>
  )
}

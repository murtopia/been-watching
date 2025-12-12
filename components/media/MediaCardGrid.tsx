'use client'

import MediaCard, { MediaCardVariant } from './MediaCard'

interface MediaCardGridProps {
  items: Array<{
    id: string
    media: {
      id?: string
      title?: string
      name?: string
      poster_path?: string
      vote_average?: number
      release_date?: string
      first_air_date?: string
      overview?: string
      media_type?: string
      tmdb_id?: number
      tmdb_data?: any
      number_of_seasons?: number
      networks?: any[]
    }
    user_rating?: string | null
    user_status?: string | null
    [key: string]: any
  }>
  variant?: MediaCardVariant
  onCardClick?: (item: any) => void
  onRate?: (mediaId: string, rating: string) => void
  onStatus?: (mediaId: string, status: string) => void
  showActions?: boolean
  showOverview?: boolean
  posterSize?: 'w185' | 'w342' | 'w500'
  className?: string
}

export default function MediaCardGrid({
  items,
  variant = 'grid',
  onCardClick,
  onRate,
  onStatus,
  showActions = false,
  showOverview = true,
  posterSize = variant === 'grid' ? 'w342' : 'w185',
  className = ''
}: MediaCardGridProps) {
  const gridClassName = variant === 'grid' ? 'shows-grid' : variant === 'compact' ? '' : 'media-card-list-container'

  return (
    <div className={`${gridClassName} ${className}`}>
      {items.map((item) => (
        <MediaCard
          key={item.id}
          media={item.media}
          variant={variant}
          onClick={onCardClick ? () => onCardClick(item) : undefined}
          onRate={onRate ? (rating: string) => onRate(item.id, rating) : undefined}
          onStatus={onStatus ? (status: string) => onStatus(item.id, status) : undefined}
          currentRating={item.user_rating || null}
          currentStatus={item.user_status || null}
          showActions={showActions}
          showOverview={showOverview}
          posterSize={posterSize}
        />
      ))}
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import MediaCard from '@/components/media/MediaCard'
import { safeFormatDate } from '@/utils/dateFormatting'

interface TVSeasonCardProps {
  show: any
  season: any
  onSelect: (media: any, rating?: string, status?: string) => void
  user?: any
}

export default function TVSeasonCard({ show, season, onSelect, user }: TVSeasonCardProps) {
  const [selectedRating, setSelectedRating] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const seasonMediaId = `tv-${show.id}-s${season.season_number}`

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
          .eq('media_id', seasonMediaId)
          .single()

        if (ratingData) {
          setSelectedRating(ratingData.rating)
        }

        // Fetch watch status
        const { data: statusData } = await supabase
          .from('watch_status')
          .select('status')
          .eq('user_id', user.id)
          .eq('media_id', seasonMediaId)
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
  }, [user, seasonMediaId])

  const handleRating = (rating: string) => {
    const newRating = rating === selectedRating ? null : rating
    setSelectedRating(newRating)
    // Create a media object with season-specific ID
    const mediaWithSeason = {
      ...show,
      id: `tv-${show.id}-s${season.season_number}`, // New season-specific ID format
      title: `${show.name} - Season ${season.season_number}`,
      name: `${show.name} - Season ${season.season_number}`,
      season_number: season.season_number,
      season_id: season.id,
      media_type: 'tv',
      poster_path: season.poster_path || show.poster_path,
      overview: season.overview || show.overview
    }
    onSelect(mediaWithSeason, newRating ?? undefined, selectedStatus ?? undefined)
  }

  const handleStatus = (status: string) => {
    const newStatus = status === selectedStatus ? null : status
    setSelectedStatus(newStatus)
    const mediaWithSeason = {
      ...show,
      id: `tv-${show.id}-s${season.season_number}`,
      title: `${show.name} - Season ${season.season_number}`,
      name: `${show.name} - Season ${season.season_number}`,
      season_number: season.season_number,
      season_id: season.id,
      media_type: 'tv',
      poster_path: season.poster_path || show.poster_path,
      overview: season.overview || show.overview
    }
    onSelect(mediaWithSeason, selectedRating ?? undefined, newStatus ?? undefined)
  }

  // Create media object for this season
  const formattedDate = safeFormatDate(season.air_date) || undefined

  const seasonMedia = {
    id: seasonMediaId,
    title: `${show.name} - Season ${season.season_number}`,
    name: `${show.name} - Season ${season.season_number}`,
    poster_path: season.poster_path || show.poster_path,
    vote_average: season.vote_average,
    release_date: formattedDate,
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
    <div className="activity-card" style={{ marginBottom: '1rem' }}>
      <MediaCard
        media={seasonMedia}
        onRate={handleRating}
        onStatus={handleStatus}
        currentRating={selectedRating}
        currentStatus={selectedStatus}
        seasonNumber={season.season_number}
      />
    </div>
  )
}
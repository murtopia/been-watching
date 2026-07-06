'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ShowDetailCard from '@/components/media/ShowDetailCard'

interface MediaRow {
  id: string
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  release_date: string | null
  vote_average: number | null
  tmdb_data: any
}

interface ShowPageClientProps {
  media: MediaRow
  viewer: { id: string; name: string; avatar: string | null; username?: string } | null
  initialRating: 'meh' | 'like' | 'love' | null
  initialStatus: 'want' | 'watching' | 'watched' | null
}

export default function ShowPageClient({ media, viewer, initialRating, initialStatus }: ShowPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const tmdbData = media.tmdb_data || {}

  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : undefined

  const cardMedia = {
    id: media.id,
    title: media.title,
    posterUrl,
    backdropUrl: media.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${media.backdrop_path}`
      : undefined,
    year: media.release_date?.substring(0, 4) || tmdbData.first_air_date?.substring(0, 4),
    genres: tmdbData.genres?.map((g: any) => g.name) || [],
    rating: media.vote_average ?? undefined,
    synopsis: media.overview || tmdbData.overview,
    creator: tmdbData.created_by?.[0]?.name || tmdbData.production_companies?.[0]?.name,
    cast: tmdbData.credits?.cast?.slice(0, 6).map((c: any) => c.name) || [],
    network: tmdbData.networks?.[0]?.name || tmdbData.production_companies?.[0]?.name,
    mediaType: media.media_type === 'tv' ? 'TV' : 'Movie',
    season: tmdbData.season_number,
    tmdb_id: media.tmdb_id
  }

  const handleRate = async (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => {
    if (!viewer) return
    if (rating === null) {
      await supabase.from('ratings').delete().eq('user_id', viewer.id).eq('media_id', mediaId)
    } else {
      await supabase.from('ratings').upsert({
        user_id: viewer.id,
        media_id: mediaId,
        rating
      }, { onConflict: 'user_id,media_id' })
    }
  }

  const handleSetStatus = async (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => {
    if (!viewer) return
    if (status === null) {
      await supabase.from('watch_status').delete().eq('user_id', viewer.id).eq('media_id', mediaId)
    } else {
      await supabase.from('watch_status').upsert({
        user_id: viewer.id,
        media_id: mediaId,
        status
      }, { onConflict: 'user_id,media_id' })
    }
  }

  // Logged-in: full show detail card (same experience as tapping a show in-app)
  if (viewer) {
    return (
      <div className="show-page-bg">
        <ShowDetailCard
          isOpen
          onClose={() => router.push('/feed')}
          media={cardMedia}
          currentUser={viewer}
          initialRating={initialRating}
          initialStatus={initialStatus}
          onRate={handleRate}
          onSetStatus={handleSetStatus}
        />
        <style jsx>{`
          .show-page-bg {
            min-height: 100vh;
            background: linear-gradient(180deg, #16161c 0%, #0c0c10 100%);
          }
        `}</style>
      </div>
    )
  }

  // Logged-out: public poster + join CTA
  const { title, seasonLabel } = (() => {
    const match = media.title.match(/^(.*?)\s*[-\u2013]\s*Season\s+(\d+)$/i)
    if (match) return { title: match[1], seasonLabel: `S${match[2]}` }
    return { title: media.title, seasonLabel: null }
  })()

  return (
    <div className="public-show-page">
      <div className="public-card">
        <div className="wordmark">BEEN WATCHING</div>
        {posterUrl && (
          <img src={posterUrl} alt={title} className="poster" />
        )}
        <h1 className="title">
          {title}
          {seasonLabel && <span className="season"> {seasonLabel}</span>}
        </h1>
        {cardMedia.year && (
          <div className="meta">
            {cardMedia.year}
            {cardMedia.genres.length > 0 && ` \u2022 ${cardMedia.genres.slice(0, 3).join(', ')}`}
          </div>
        )}
        {media.overview && <p className="overview">{media.overview}</p>}
        <a href="/auth" className="join-btn">Join Been Watching</a>
        <p className="join-sub">Track what you watch and see what your friends think.</p>
      </div>

      <style jsx>{`
        .public-show-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #16161c 0%, #0c0c10 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .public-card {
          width: 100%;
          max-width: 398px;
          border: 1px solid #FFC125;
          border-radius: 24px;
          background: linear-gradient(180deg, #16161c 0%, #0c0c10 100%);
          padding: 28px 24px 32px;
          text-align: center;
          color: white;
        }

        .wordmark {
          color: #FFC125;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-bottom: 20px;
        }

        .poster {
          width: 220px;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
          margin-bottom: 20px;
        }

        .title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 6px;
          line-height: 1.25;
        }

        .season {
          color: #FFC125;
        }

        .meta {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 14px;
        }

        .overview {
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 24px;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .join-btn {
          display: inline-block;
          background: #FFC125;
          color: #0c0c10;
          font-size: 15px;
          font-weight: 700;
          padding: 13px 32px;
          border-radius: 999px;
          text-decoration: none;
          transition: background 0.15s;
        }

        .join-btn:hover {
          background: #ffce4d;
        }

        .join-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin: 14px 0 0;
        }
      `}</style>
    </div>
  )
}

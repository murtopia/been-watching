import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ShowPageClient from './ShowPageClient'

/**
 * Public show page: /show/{mediaId} (e.g. /show/tv-93740-s3, /show/movie-603)
 *
 * Makes shared show links real: server-rendered Open Graph metadata for
 * unfurls, a public poster + join CTA for logged-out visitors, and the full
 * show detail card for logged-in users.
 */

interface ShowPageProps {
  params: Promise<{ id: string }>
}

async function fetchMedia(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('media')
    .select('id, tmdb_id, media_type, title, poster_path, backdrop_path, overview, release_date, vote_average, tmdb_data')
    .eq('id', id)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: ShowPageProps): Promise<Metadata> {
  const { id } = await params
  const media = await fetchMedia(id)

  if (!media) {
    return {
      title: 'Show not found — Been Watching'
    }
  }

  const description = media.overview
    ? media.overview.length > 200 ? `${media.overview.slice(0, 197)}...` : media.overview
    : `See what people think of ${media.title} on Been Watching.`

  const ogImage = `/api/og?type=show&id=${encodeURIComponent(media.id)}`

  return {
    title: `${media.title} — Been Watching`,
    description,
    openGraph: {
      title: media.title,
      description,
      type: 'video.tv_show',
      images: [{ url: ogImage, width: 1200, height: 630, alt: media.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title: media.title,
      description,
      images: [ogImage]
    }
  }
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { id } = await params
  const media = await fetchMedia(id)

  if (!media) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null = null
  let userRating: 'meh' | 'like' | 'love' | null = null
  let userStatus: 'want' | 'watching' | 'watched' | null = null

  if (user) {
    const [{ data: profileRow }, { data: ratingRow }, { data: statusRow }] = await Promise.all([
      supabase.from('profiles').select('id, username, display_name, avatar_url').eq('id', user.id).maybeSingle(),
      supabase.from('ratings').select('rating').eq('user_id', user.id).eq('media_id', media.id).maybeSingle(),
      supabase.from('watch_status').select('status').eq('user_id', user.id).eq('media_id', media.id).maybeSingle()
    ])
    profile = profileRow
    userRating = (ratingRow?.rating as typeof userRating) ?? null
    userStatus = (statusRow?.status as typeof userStatus) ?? null
  }

  return (
    <ShowPageClient
      media={media}
      viewer={profile && user ? {
        id: user.id,
        name: profile.display_name || profile.username || '',
        avatar: profile.avatar_url,
        username: profile.username || ''
      } : null}
      initialRating={userRating}
      initialStatus={userStatus}
    />
  )
}

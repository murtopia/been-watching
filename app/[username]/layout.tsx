import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'

/**
 * Server layout for the (client) profile page so shared profile links
 * unfurl with real Open Graph metadata.
 */

interface ProfileLayoutProps {
  children: React.ReactNode
  params: Promise<{ username: string }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio')
    .ilike('username', username)
    .maybeSingle()

  if (!profile) {
    return { title: 'Been Watching' }
  }

  const displayName = profile.display_name || profile.username
  const title = `@${profile.username} on Been Watching`
  const description = profile.bio
    ? profile.bio
    : `See what ${displayName} has been watching, their watch lists, and top shows.`
  const ogImage = `/api/og?type=profile&id=${encodeURIComponent(profile.username)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return children
}

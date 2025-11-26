import { createClient } from '@/utils/supabase/client'

/**
 * Track a share event in the database
 */
export async function trackShareEvent({
  contentType,
  contentId,
  shareMethod,
  recipientUserId,
  metadata
}: {
  contentType: 'show' | 'profile' | 'list' | 'top3' | 'invite' | 'achievement'
  contentId: string
  shareMethod: 'instagram_story' | 'instagram_post' | 'twitter' | 'native_sheet' | 'copy_link' | 'in_app' | 'qr_code'
  recipientUserId?: string
  metadata?: Record<string, any>
}): Promise<string | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .rpc('track_share_event', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_share_method: shareMethod,
        p_recipient_user_id: recipientUserId || null,
        p_utm_medium: shareMethod,
        p_metadata: metadata || {}
      })

    if (error) {
      console.error('Error tracking share event:', error)
      return null
    }

    return data as string
  } catch (err) {
    console.error('Failed to track share event:', err)
    return null
  }
}

/**
 * Track when a shared link is clicked
 */
export async function trackShareClick(shareId: string, userId?: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .rpc('track_share_click', {
        p_share_id: shareId,
        p_user_id: userId || null
      })

    if (error) {
      console.error('Error tracking share click:', error)
      return false
    }

    return data as boolean
  } catch (err) {
    console.error('Failed to track share click:', err)
    return false
  }
}

/**
 * Track when a share leads to a conversion (signup, follow, etc)
 */
export async function trackShareConversion(
  shareId: string,
  conversionType: 'signup' | 'follow' | 'rate_show' | 'watchlist_add'
): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .rpc('track_share_conversion', {
        p_share_id: shareId,
        p_conversion_type: conversionType
      })

    if (error) {
      console.error('Error tracking share conversion:', error)
      return false
    }

    return data as boolean
  } catch (err) {
    console.error('Failed to track share conversion:', err)
    return false
  }
}

/**
 * Get share analytics for a user
 */
export async function getUserShareAnalytics(userId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('share_events')
      .select('*')
      .eq('sharer_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching share analytics:', error)
      return null
    }

    // Calculate summary stats
    const totalShares = data.length
    const totalClicks = data.filter(s => s.clicked).length
    const totalConversions = data.filter(s => s.converted).length

    const clickRate = totalShares > 0 ? (totalClicks / totalShares) * 100 : 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    // Group by content type
    const sharesByType = data.reduce((acc, share) => {
      acc[share.content_type] = (acc[share.content_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by method
    const sharesByMethod = data.reduce((acc, share) => {
      acc[share.share_method] = (acc[share.share_method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalShares,
      totalClicks,
      totalConversions,
      clickRate: clickRate.toFixed(1),
      conversionRate: conversionRate.toFixed(1),
      sharesByType,
      sharesByMethod,
      recentShares: data.slice(0, 10)
    }
  } catch (err) {
    console.error('Failed to get share analytics:', err)
    return null
  }
}

/**
 * Parse share attribution from URL parameters
 */
export function parseShareAttribution(searchParams: URLSearchParams): {
  sharedBy?: string
  shareId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
} {
  return {
    sharedBy: searchParams.get('shared_by') || undefined,
    shareId: searchParams.get('share_id') || undefined,
    utmSource: searchParams.get('utm_source') || undefined,
    utmMedium: searchParams.get('utm_medium') || undefined,
    utmCampaign: searchParams.get('utm_campaign') || undefined
  }
}

/**
 * Create share URL with tracking parameters
 */
export function createShareUrl({
  baseUrl,
  path,
  shareId,
  username,
  method
}: {
  baseUrl?: string
  path: string
  shareId?: string
  username?: string
  method?: string
}): string {
  const url = new URL(path, baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://beenwatching.com')

  // Add tracking parameters
  const params = new URLSearchParams()

  if (shareId) params.set('share_id', shareId)
  if (username) params.set('shared_by', username)

  // Add UTM parameters
  params.set('utm_source', 'share')
  if (method) params.set('utm_medium', method)
  params.set('utm_campaign', 'organic_share')

  url.search = params.toString()
  return url.toString()
}
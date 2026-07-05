import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Auto-set a release reminder when a user adds an unreleased show to a list.
 *
 * Looks up the media row's release/air date; if it's in the future, upserts a
 * show_reminders row (same conflict key as the manual bell used to). No-op for
 * already-released titles or media rows without a date. The daily reminder
 * cron handles delivery.
 */
export async function ensureReleaseReminder(
  supabase: SupabaseClient,
  userId: string,
  mediaId: string
): Promise<void> {
  try {
    const { data: media } = await supabase
      .from('media')
      .select('id, release_date, tmdb_data')
      .eq('id', mediaId)
      .maybeSingle()

    const releaseDate: string | null = media?.release_date || null
    if (!releaseDate) return

    const today = new Date().toISOString().split('T')[0]
    if (releaseDate <= today) return

    const seasonMatch = mediaId.match(/-s(\d+)$/)
    const seasonNumber = seasonMatch
      ? parseInt(seasonMatch[1])
      : (media?.tmdb_data?.season_number ?? null)

    await supabase.from('show_reminders').upsert({
      user_id: userId,
      media_id: mediaId,
      season_number: seasonNumber,
      air_date: releaseDate
    }, { onConflict: 'user_id,media_id,season_number' })
  } catch (err) {
    // Reminders are best-effort; never block the status write
    console.error('ensureReleaseReminder failed:', err)
  }
}

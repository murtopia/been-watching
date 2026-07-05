import type { SupabaseClient } from '@supabase/supabase-js'

export interface CheckRemindersResult {
  remindersDue: number
  notificationsCreated: number
  emailsSent: number
  failed: Array<{ reminderId: string; error: string }>
}

/**
 * Process due show_reminders: create an in-app notification (and an email when
 * the user allows it) for every reminder whose air date has arrived, then mark
 * it notified. This is the single reminder pipeline - the legacy
 * release_notifications poller is retired.
 */
export async function checkReminders(supabase: SupabaseClient): Promise<CheckRemindersResult> {
  const today = new Date().toISOString().split('T')[0]

  const { data: due, error } = await supabase
    .from('show_reminders')
    .select('id, user_id, media_id, season_number, air_date')
    .lte('air_date', today)
    .is('notified_at', null)
    .limit(200)

  if (error) {
    throw new Error(error.message)
  }

  const result: CheckRemindersResult = {
    remindersDue: (due || []).length,
    notificationsCreated: 0,
    emailsSent: 0,
    failed: []
  }
  if (!due || due.length === 0) return result

  // Batch-fetch media titles and recipient profiles
  const mediaIds = Array.from(new Set(due.map(r => r.media_id)))
  const userIds = Array.from(new Set(due.map(r => r.user_id)))

  const [mediaRes, profilesRes] = await Promise.all([
    supabase.from('media').select('id, title, poster_path').in('id', mediaIds),
    supabase.from('profiles').select('id, email, display_name, username, email_notifications').in('id', userIds)
  ])

  const mediaById = new Map((mediaRes.data || []).map((m: any) => [m.id, m]))
  const profileById = new Map((profilesRes.data || []).map((p: any) => [p.id, p]))

  for (const reminder of due) {
    try {
      const media = mediaById.get(reminder.media_id)
      const baseTitle = (media?.title || 'A show you follow').replace(/\s*-\s*Season\s+\d+$/i, '')
      const displayTitle = reminder.season_number
        ? `${baseTitle} Season ${reminder.season_number}`
        : baseTitle

      // In-app notification (system announcement style renders in the dropdown
      // with a tappable action, no schema change needed)
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: reminder.user_id,
        actor_id: null,
        type: 'announcement',
        target_type: 'system',
        metadata: {
          title: 'Now streaming',
          message: `${displayTitle} is out now. Time to start watching!`,
          media_id: reminder.media_id,
          poster_path: media?.poster_path || null,
          action: { type: 'internal', url: '/myshows' }
        }
      })
      if (notifError) throw new Error(notifError.message)
      result.notificationsCreated++

      // Optional email
      const profile = profileById.get(reminder.user_id)
      if (profile?.email && profile.email_notifications !== false && process.env.RESEND_API_KEY) {
        const sent = await sendReminderEmail(profile.email, profile.display_name || profile.username || '', displayTitle)
        if (sent) result.emailsSent++
      }

      const { error: updateError } = await supabase
        .from('show_reminders')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', reminder.id)
      if (updateError) throw new Error(updateError.message)
    } catch (e: any) {
      result.failed.push({ reminderId: reminder.id, error: e.message || 'unknown' })
    }
  }

  return result
}

async function sendReminderEmail(to: string, name: string, showTitle: string): Promise<boolean> {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const firstName = name.split(' ')[0]
    const { error } = await resend.emails.send({
      from: 'Been Watching <hello@boxoffice.beenwatching.com>',
      to: [to],
      subject: `${showTitle} is out now!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a; margin-bottom: 8px;">It's here${firstName ? `, ${firstName}` : ''}!</h2>
          <p style="color: #444; font-size: 16px; line-height: 1.5;">
            You asked us to remind you when <strong>${showTitle}</strong> comes out &mdash; it's streaming now.
          </p>
          <a href="https://beenwatching.com/myshows"
             style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #FFC125; color: #000; text-decoration: none; border-radius: 10px; font-weight: 700;">
            Open Been Watching
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            You're getting this because you set a reminder on Been Watching.
            Manage notifications in your profile settings.
          </p>
        </div>
      `
    })
    return !error
  } catch {
    return false
  }
}

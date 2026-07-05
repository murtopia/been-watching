import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { syncSeasons } from '@/lib/tasks/sync-seasons'
import { ingestCharts } from '@/lib/tasks/ingest-charts'
import { checkReminders } from '@/lib/tasks/check-reminders'

export const maxDuration = 300

/**
 * Single daily cron entrypoint (Vercel Hobby allows limited cron jobs).
 * Runs all scheduled maintenance tasks. Individual tasks can be run
 * manually via ?task=seasons (default: all).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const task = request.nextUrl.searchParams.get('task') || 'all'
  const supabase = createAdminClient()
  const results: Record<string, any> = {}

  if (task === 'all' || task === 'seasons') {
    try {
      results.seasons = await syncSeasons(supabase)
    } catch (e: any) {
      results.seasons = { error: e.message }
    }
  }

  if (task === 'all' || task === 'charts') {
    try {
      results.charts = await ingestCharts(supabase)
    } catch (e: any) {
      results.charts = { error: e.message }
    }
  }

  if (task === 'all' || task === 'reminders') {
    try {
      results.reminders = await checkReminders(supabase)
    } catch (e: any) {
      results.reminders = { error: e.message }
    }
  }

  return NextResponse.json(results)
}

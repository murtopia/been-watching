#!/usr/bin/env node
/**
 * One-time backfill: for every TV show anyone tracks, insert any missing
 * season media rows (tv-{tmdbId}-s{n}) from TMDB.
 * Same logic as lib/tasks/sync-seasons.ts (which runs daily via cron).
 *
 * Usage: node scripts/backfill-seasons.js [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)
const TMDB_API_KEY = envVars.TMDB_API_KEY
const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  const { data: tvRows, error } = await supabase
    .from('media')
    .select('id, tmdb_id, title')
    .eq('media_type', 'tv')

  if (error) throw new Error(error.message)

  const existingIds = new Set(tvRows.map(r => r.id))
  const showsByTmdbId = new Map()
  for (const row of tvRows) {
    if (row.tmdb_id && !showsByTmdbId.has(row.tmdb_id)) {
      showsByTmdbId.set(row.tmdb_id, (row.title || '').replace(/\s*-\s*Season\s+\d+$/i, ''))
    }
  }

  console.log(`Checking ${showsByTmdbId.size} distinct TV shows...`)

  let inserted = 0
  const failed = []

  const tmdbIds = Array.from(showsByTmdbId.keys())
  const CONCURRENCY = 8

  for (let i = 0; i < tmdbIds.length; i += CONCURRENCY) {
    const batch = tmdbIds.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(async (tmdbId) => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`)
        if (!res.ok) {
          failed.push({ tmdbId, error: `TMDB ${res.status}` })
          return
        }
        const show = await res.json()
        const validSeasons = (show.seasons || []).filter(s => s.season_number > 0)
        const missing = validSeasons.filter(s => !existingIds.has(`tv-${tmdbId}-s${s.season_number}`))
        if (missing.length === 0) return

        const rows = missing.map(s => ({
          id: `tv-${tmdbId}-s${s.season_number}`,
          tmdb_id: tmdbId,
          media_type: 'tv',
          title: `${show.name || showsByTmdbId.get(tmdbId)} - Season ${s.season_number}`,
          poster_path: s.poster_path || show.poster_path,
          backdrop_path: show.backdrop_path,
          overview: s.overview || show.overview,
          release_date: s.air_date || null,
          vote_average: show.vote_average,
          tmdb_data: { ...show, season_number: s.season_number, season_id: s.id }
        }))

        if (DRY_RUN) {
          rows.forEach(r => console.log(`[dry-run] would insert: ${r.id} (${r.title})`))
          inserted += rows.length
          return
        }

        const { error: insertError } = await supabase.from('media').upsert(rows, { onConflict: 'id' })
        if (insertError) {
          failed.push({ tmdbId, error: insertError.message })
        } else {
          rows.forEach(r => {
            console.log(`inserted: ${r.id} (${r.title})`)
            existingIds.add(r.id)
          })
          inserted += rows.length
        }
      } catch (e) {
        failed.push({ tmdbId, error: e.message })
      }
    }))
  }

  console.log(`\nDone. ${DRY_RUN ? 'Would insert' : 'Inserted'} ${inserted} season rows.`)
  if (failed.length) {
    console.log('Failures:')
    failed.forEach(f => console.log(`  tmdb ${f.tmdbId}: ${f.error}`))
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

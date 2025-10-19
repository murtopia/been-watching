#!/usr/bin/env node

/**
 * Import ONLY Nick's data from Nick been watching migration data.txt
 * Uses all the corrections from reconciliation docs
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local manually
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
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const TMDB_API_KEY = envVars.NEXT_PUBLIC_TMDB_API_KEY || '99b89037cac7fea56692934b534ea26a'

const USERNAME = 'murtopia'

// Title corrections from reconciliation
const TITLE_CORRECTIONS = {
  'Life of Beth': 'Life & Beth',
  "Smithsonian's Spy Wars": 'Spy Wars With Damian Lewis',
  '30 for 30. Lance Armstrong': 'Lance',
  'Sicaro': 'Sicario',
  'Alien Earth': 'Alien: Earth',
  'Lawmen Bass Reaves': 'Lawmen: Bass Reeves',
  'The Gentleman - Netflix': 'The Gentlemen',
  'Jackpot  also its dumb but funny': 'Jackpot!',
  'Will and Harper': 'Will & Harper',
  'Terminal List': 'The Terminal List',
  'The Brother\'s Sun': 'The Brothers Sun',
  'Rebel Moon': 'Rebel Moon: Part One - A Child of Fire',
  'Roadhouse': 'Road House',
  'Wolfs': 'Wolfs',
  'Carry On': 'Carry-On',
  'Day of the Jackal': 'The Day of the Jackal',
  'Havoc': 'Havoc',
  'Solo': 'Solo: A Star Wars Story',
  'Argyle': 'Argylle',
  'Homicide': 'Homicide: Life on the Street',
  'Fall Guy': 'The Fall Guy',
  'Jack Reacher': 'Reacher'
}

// Shows to ignore
const SHOWS_TO_IGNORE = [
  'Woman of the Hour',
  'Gold & Greed: The Hunt for Fenn\'s Treasure',
  'The Ultimatum'
]

async function main() {
  console.log('🚀 Importing Nick\'s Watch Data\n')

  // Get Nick's user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', USERNAME)
    .single()

  if (!profile) {
    console.error('❌ Could not find user:', USERNAME)
    process.exit(1)
  }

  const userId = profile.id
  console.log(`✅ Found user: ${USERNAME}`)
  console.log(`   User ID: ${userId}\n`)

  // Backup current data
  const { data: currentData } = await supabase
    .from('watch_status')
    .select('*')
    .eq('user_id', userId)

  const backupFile = `scripts/backup-before-reimport-${Date.now()}.json`
  fs.writeFileSync(backupFile, JSON.stringify(currentData, null, 2))
  console.log(`📦 Backup saved: ${backupFile}`)
  console.log(`   Current entries: ${currentData?.length || 0}\n`)

  // Clear current data
  console.log('🗑️  Clearing current data...')
  await supabase.from('watch_status').delete().eq('user_id', userId)
  await supabase.from('ratings').delete().eq('user_id', userId)
  console.log('✅ Cleared\n')

  // Parse Nick's file
  const migrationFile = 'Nick been watching migration data.txt'
  const data = fs.readFileSync(migrationFile, 'utf-8')
  const lines = data.split('\n')

  const shows = { want: [], watching: [], watched: [] }
  let currentSection = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.includes('Nick Needs to watch') || trimmed.includes('Nick Currently')) {
      currentSection = trimmed.includes('Needs') ? 'want' : (trimmed.includes('Currently') ? 'watching' : null)
      continue
    } else if (trimmed.includes('Nick Done Watching')) {
      currentSection = 'watched'
      continue
    }

    if (!currentSection || !trimmed || trimmed.startsWith('---') || trimmed.startsWith('BW Notes')) continue

    // Parse show line
    let title = trimmed
    let rating = null
    let seasonMatch = null

    // Extract rating (only for "watched")
    if (currentSection === 'watched') {
      if (trimmed.includes('***')) rating = 'love'
      else if (trimmed.includes('**')) rating = 'like'
      else if (trimmed.includes('*')) rating = 'meh'

      // Remove rating from title
      title = trimmed.replace(/\*+/g, '').trim()
    }

    // Extract season number (e.g., "Fargo s2")
    seasonMatch = title.match(/^(.+?)\s+s(\d+)/i)
    let baseName = seasonMatch ? seasonMatch[1].trim() : title
    let seasonNumber = seasonMatch ? parseInt(seasonMatch[2]) : null

    // Clean up title (remove network info, dates, etc)
    baseName = baseName.replace(/\([^)]+\)/g, '').replace(/\d+\/\/\d+\/\d+/g, '').trim()

    // Skip ignored shows
    if (SHOWS_TO_IGNORE.some(ignored => baseName.includes(ignored))) {
      console.log(`   ⏭️  Skipping: ${baseName}`)
      continue
    }

    // Apply corrections
    const correctedTitle = TITLE_CORRECTIONS[baseName] || baseName

    shows[currentSection].push({
      title: correctedTitle,
      rating,
      seasonNumber,
      original: trimmed
    })
  }

  console.log(`📊 Parsed Shows:`)
  console.log(`   Want to Watch: ${shows.want.length}`)
  console.log(`   Watching: ${shows.watching.length}`)
  console.log(`   Watched: ${shows.watched.length}`)
  console.log(`   TOTAL: ${shows.want.length + shows.watching.length + shows.watched.length}\n`)

  // Import shows
  let imported = { want: 0, watching: 0, watched: 0 }
  let failed = []

  for (const [status, showList] of Object.entries(shows)) {
    console.log(`\n📺 Processing ${status.toUpperCase()}...`)

    for (const show of showList) {
      try {
        // Search TMDB
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(show.title)}`
        const searchRes = await fetch(searchUrl)
        const searchData = await searchRes.json()

        if (!searchData.results?.length) {
          console.log(`   ❌ No match: ${show.title}`)
          failed.push({ ...show, status, reason: 'No TMDB results' })
          continue
        }

        const result = searchData.results[0]
        const mediaType = result.media_type
        const tmdbId = result.id

        if (mediaType === 'movie') {
          const mediaId = `movie-${tmdbId}`

          await supabase.from('media').upsert({
            id: mediaId,
            tmdb_id: tmdbId,
            media_type: 'movie',
            title: result.title,
            poster_path: result.poster_path,
            overview: result.overview,
            release_date: result.release_date,
            vote_average: result.vote_average,
            tmdb_data: result
          }, { onConflict: 'id' })

          await supabase.from('watch_status').insert({
            user_id: userId,
            media_id: mediaId,
            status: status
          })

          if (show.rating) {
            await supabase.from('ratings').insert({
              user_id: userId,
              media_id: mediaId,
              rating: show.rating
            })
          }

          console.log(`   ✅ ${result.title} (movie)${show.rating ? ' - ' + show.rating : ''}`)
          imported[status]++

        } else if (mediaType === 'tv') {
          // For "want to watch", only import season 1
          const seasonsToImport = (status === 'want' && !show.seasonNumber) ? [1] : (show.seasonNumber ? [show.seasonNumber] : [1])

          for (const seasonNum of seasonsToImport) {
            const mediaId = `tv-${tmdbId}-s${seasonNum}`

            const seasonUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_API_KEY}`
            const seasonRes = await fetch(seasonUrl)
            const seasonData = await seasonRes.json()

            await supabase.from('media').upsert({
              id: mediaId,
              tmdb_id: tmdbId,
              media_type: 'tv',
              title: `${result.name} - Season ${seasonNum}`,
              poster_path: seasonData.poster_path || result.poster_path,
              overview: seasonData.overview || result.overview,
              release_date: seasonData.air_date || result.first_air_date,
              vote_average: result.vote_average,
              tmdb_data: { ...result, season_number: seasonNum }
            }, { onConflict: 'id' })

            await supabase.from('watch_status').insert({
              user_id: userId,
              media_id: mediaId,
              status: status
            })

            if (show.rating) {
              await supabase.from('ratings').insert({
                user_id: userId,
                media_id: mediaId,
                rating: show.rating
              })
            }

            console.log(`   ✅ ${result.name} - S${seasonNum}${show.rating ? ' - ' + show.rating : ''}`)
            imported[status]++
          }
        }

        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        console.log(`   ❌ Error: ${show.title} - ${error.message}`)
        failed.push({ ...show, status, reason: error.message })
      }
    }
  }

  // Final counts
  console.log('\n\n📊 Final Report:')
  console.log(`✅ Imported:`)
  console.log(`   Want to Watch: ${imported.want}`)
  console.log(`   Watching: ${imported.watching}`)
  console.log(`   Watched: ${imported.watched}`)
  console.log(`   TOTAL: ${imported.want + imported.watching + imported.watched}\n`)

  if (failed.length > 0) {
    console.log(`⚠️  Failed: ${failed.length} shows`)
    failed.forEach(f => console.log(`   - ${f.title} (${f.status}): ${f.reason}`))
  }

  console.log(`\n✅ Import complete!`)
}

main().catch(console.error)

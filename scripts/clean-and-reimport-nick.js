#!/usr/bin/env node

/**
 * Clean and Re-import Nick's Data
 *
 * This script:
 * 1. Backs up current data
 * 2. Clears all watch_status and ratings for Nick
 * 3. Re-imports from migration data with corrections
 * 4. Verifies final counts (should be: 34 want, 13 watching, 97 watched)
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
const TMDB_BEARER_TOKEN = envVars.NEXT_PUBLIC_TMDB_BEARER_TOKEN

// Nick's username
const USERNAME = 'murtopia'

// Show title corrections from reconciliation docs
const TITLE_CORRECTIONS = {
  // Failed matches from nm migration review.txt
  'Life of Beth': 'Life & Beth',
  "Smithsonian's Spy Wars": 'Spy Wars With Damian Lewis',
  '30 for 30. Lance Armstrong': 'Lance',
  'Sicaro': 'Sicario',
  'Alien Earth': 'Alien: Earth',
  'King of the Hill reboot': 'King of the Hill', // season 14
  'Lawmen Bass Reaves': 'Lawmen: Bass Reeves',
  'The Gentleman - Netflix': 'The Gentlemen',
  'Top Chef Wisconsin': 'Top Chef', // season 21
  'Jackpot  also its dumb but funny': 'Jackpot!',
  'Window Cliquot': 'Widow Clicquot',
  'The Fountain of Youth  minus': 'Fountain of Youth',

  // From shows to fix temp.txt
  'Acapulco': 'Acapulco', // Apple TV+ comedy (TMDB: 130529)
  'Fountain of Youth': 'Fountain of Youth', // 2025 movie
  'Number 24': 'Number 24', // 2024 movie
  'Paradise': 'Paradise', // 2025 Hulu show
  'Lift': 'Lift', // 2024 movie
  'Fall Guy': 'The Fall Guy', // 2024 movie
  'Solo': 'Solo: A Star Wars Story',
  'Argyle': 'Argylle', // 2024 movie
  'Napoleon': 'Napoleon', // 2023 movie
  'Ferrari': 'Ferrari', // 2023 movie
  'Homicide': 'Homicide: Life on the Street',

  // Auto-matched corrections from nm migration review.txt
  'End of Watch': 'End of Watch', // movie not TV series
  'Will and Harper': 'Will & Harper',
  'Terminal List': 'The Terminal List',
  'The Brother\'s Sun': 'The Brothers Sun',
  'Rebel Moon': 'Rebel Moon: Part One - A Child of Fire',
  'Roadhouse': 'Road House', // 2024 movie
  'Wolfs': 'Wolfs', // Apple movie
  'Carry On': 'Carry-On', // Netflix movie
  'Day of the Jackal': 'The Day of the Jackal', // 2024 series
  'Havoc': 'Havoc' // Netflix movie
}

// Shows to ignore (from nm migration review.txt)
const SHOWS_TO_IGNORE = [
  'Woman of the Hour',
  'Gold & Greed: The Hunt for Fenn\'s Treasure',
  'Cowboy Bourbon',
  'The Ultimatum',
  'Tokyo Vice S1' // duplicate of Tokyo Vice
]

// Specific season mappings
const SEASON_SPECIFIC = {
  'King of the Hill reboot': { show: 'King of the Hill', season: 14 },
  'Top Chef Wisconsin': { show: 'Top Chef', season: 21 }
}

async function main() {
  console.log('🚀 Starting Clean and Re-import Process\n')

  // Step 1: Get Nick's user ID
  console.log('Step 1: Finding Nick\'s profile...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', USERNAME)
    .single()

  if (profileError || !profile) {
    console.error('❌ Could not find profile for username:', USERNAME)
    process.exit(1)
  }

  console.log(`✅ Found profile: ${profile.display_name} (@${profile.username})`)
  console.log(`   User ID: ${profile.id}\n`)

  const userId = profile.id

  // Step 2: Backup current data
  console.log('Step 2: Backing up current data...')

  const { data: currentWatchStatus } = await supabase
    .from('watch_status')
    .select('*, media(*)')
    .eq('user_id', userId)

  const { data: currentRatings } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', userId)

  const backup = {
    timestamp: new Date().toISOString(),
    user: profile,
    watch_status: currentWatchStatus || [],
    ratings: currentRatings || []
  }

  const backupFile = `scripts/backup-nick-${Date.now()}.json`
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
  console.log(`✅ Backup saved to: ${backupFile}`)
  console.log(`   - ${backup.watch_status.length} watch_status entries`)
  console.log(`   - ${backup.ratings.length} ratings entries\n`)

  // Step 3: Clear current data
  console.log('Step 3: Clearing current data...')

  const { error: deleteRatingsError } = await supabase
    .from('ratings')
    .delete()
    .eq('user_id', userId)

  if (deleteRatingsError) {
    console.error('❌ Error deleting ratings:', deleteRatingsError)
    process.exit(1)
  }

  const { error: deleteStatusError } = await supabase
    .from('watch_status')
    .delete()
    .eq('user_id', userId)

  if (deleteStatusError) {
    console.error('❌ Error deleting watch_status:', deleteStatusError)
    process.exit(1)
  }

  console.log('✅ All ratings and watch_status cleared\n')

  // Step 4: Parse migration data
  console.log('Step 4: Parsing migration data...')

  const migrationFile = 'bw been watching migration data.txt'
  const migrationData = fs.readFileSync(migrationFile, 'utf-8')

  const shows = {
    want: [],
    watching: [],
    watched: []
  }

  let currentSection = null
  const lines = migrationData.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect sections
    if (trimmed.includes('Need to watch') || trimmed.includes('Needs to watch')) {
      currentSection = 'want'
      continue
    } else if (trimmed.includes('Currently Been Watching')) {
      currentSection = 'watching'
      continue
    } else if (trimmed.includes('Done Watching')) {
      currentSection = 'watched'
      continue
    }

    // Skip empty lines or section headers
    if (!trimmed || !currentSection || trimmed.startsWith('---')) continue

    // Parse show entry
    const match = trimmed.match(/^(.+?)\s*-?\s*(.*?)$/)
    if (match) {
      let title = match[1].trim()
      let metadata = match[2].trim()

      // Extract rating
      let rating = null
      if (metadata.includes('***')) rating = 'love'
      else if (metadata.includes('**')) rating = 'like'
      else if (metadata.includes('*')) rating = 'meh'

      // Skip ignored shows
      if (SHOWS_TO_IGNORE.includes(title)) {
        console.log(`   ⏭️  Skipping ignored show: ${title}`)
        continue
      }

      // Apply title corrections
      if (TITLE_CORRECTIONS[title]) {
        console.log(`   🔧 Correcting: "${title}" → "${TITLE_CORRECTIONS[title]}"`)
        title = TITLE_CORRECTIONS[title]
      }

      shows[currentSection].push({ title, rating, originalLine: trimmed })
    }
  }

  console.log(`✅ Parsed migration data:`)
  console.log(`   - Want to Watch: ${shows.want.length}`)
  console.log(`   - Watching: ${shows.watching.length}`)
  console.log(`   - Watched: ${shows.watched.length}\n`)

  // Step 5: Match with TMDB and import
  console.log('Step 5: Matching with TMDB and importing...\n')

  let imported = { want: 0, watching: 0, watched: 0 }
  let failed = []

  for (const [status, showList] of Object.entries(shows)) {
    console.log(`\n📺 Processing ${status.toUpperCase()} (${showList.length} shows)...`)

    for (const show of showList) {
      try {
        // Search TMDB
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(show.title)}`
        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()

        if (!searchData.results || searchData.results.length === 0) {
          console.log(`   ❌ No TMDB match: ${show.title}`)
          failed.push({ title: show.title, status, reason: 'No TMDB results' })
          continue
        }

        const result = searchData.results[0]
        const mediaType = result.media_type
        const tmdbId = result.id

        // For TV shows in "want" status, only import season 1
        let seasonsToImport = []
        if (mediaType === 'tv' && status === 'want') {
          seasonsToImport = [1]
        } else if (mediaType === 'tv') {
          // For watching/watched, import all seasons mentioned or just season 1
          seasonsToImport = [1] // We can expand this based on the original data
        }

        if (mediaType === 'movie') {
          // Import movie
          const mediaId = `movie-${tmdbId}`

          // Save to media table
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

          // Save watch status
          await supabase.from('watch_status').insert({
            user_id: userId,
            media_id: mediaId,
            status: status
          })

          // Save rating if exists
          if (show.rating) {
            await supabase.from('ratings').insert({
              user_id: userId,
              media_id: mediaId,
              rating: show.rating
            })
          }

          console.log(`   ✅ ${result.title} (movie)`)
          imported[status]++

        } else if (mediaType === 'tv') {
          // Import TV show season(s)
          for (const seasonNum of seasonsToImport) {
            const mediaId = `tv-${tmdbId}-s${seasonNum}`

            // Fetch season details
            const seasonUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_API_KEY}`
            const seasonResponse = await fetch(seasonUrl)
            const seasonData = await seasonResponse.json()

            // Save to media table
            await supabase.from('media').upsert({
              id: mediaId,
              tmdb_id: tmdbId,
              media_type: 'tv',
              title: `${result.name} - Season ${seasonNum}`,
              poster_path: seasonData.poster_path || result.poster_path,
              overview: seasonData.overview || result.overview,
              release_date: seasonData.air_date || result.first_air_date,
              vote_average: result.vote_average,
              tmdb_data: { ...result, season_number: seasonNum, season_data: seasonData }
            }, { onConflict: 'id' })

            // Save watch status
            await supabase.from('watch_status').insert({
              user_id: userId,
              media_id: mediaId,
              status: status
            })

            // Save rating if exists
            if (show.rating) {
              await supabase.from('ratings').insert({
                user_id: userId,
                media_id: mediaId,
                rating: show.rating
              })
            }

            console.log(`   ✅ ${result.name} - Season ${seasonNum}`)
            imported[status]++
          }
        }

        // Rate limit: 40 requests per 10 seconds
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        console.log(`   ❌ Error importing ${show.title}:`, error.message)
        failed.push({ title: show.title, status, reason: error.message })
      }
    }
  }

  // Step 6: Verify counts
  console.log('\n\nStep 6: Verifying final counts...\n')

  const { count: wantCount } = await supabase
    .from('watch_status')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'want')

  const { count: watchingCount } = await supabase
    .from('watch_status')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'watching')

  const { count: watchedCount } = await supabase
    .from('watch_status')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'watched')

  const { count: ratingsCount } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  console.log('📊 Final Counts:')
  console.log(`   Want to Watch: ${wantCount} (expected: 34)`)
  console.log(`   Watching: ${watchingCount} (expected: 13)`)
  console.log(`   Watched: ${watchedCount} (expected: 97)`)
  console.log(`   Total: ${(wantCount || 0) + (watchingCount || 0) + (watchedCount || 0)} (expected: 144)`)
  console.log(`   Ratings: ${ratingsCount}\n`)

  if (failed.length > 0) {
    console.log(`\n⚠️  Failed to import ${failed.length} shows:`)
    failed.forEach(f => console.log(`   - ${f.title} (${f.status}): ${f.reason}`))
  }

  console.log('\n✅ Import complete!')
  console.log(`\n💾 Backup file: ${backupFile}`)
}

main().catch(console.error)

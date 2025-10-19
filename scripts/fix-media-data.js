// Script to fetch missing TMDB data for existing media records
// Run with: node scripts/fix-media-data.js

const fs = require('fs')
const path = require('path')

// Load .env.local file
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  })
}

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY

if (!supabaseUrl || !supabaseKey || !tmdbApiKey) {
  console.error('Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and TMDB_API_KEY are set in .env.local')
  console.error(`Found: supabaseUrl=${!!supabaseUrl}, supabaseKey=${!!supabaseKey}, tmdbApiKey=${!!tmdbApiKey}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchFromTMDB(tmdbId, mediaType) {
  const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${tmdbApiKey}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return await response.json()
}

async function fixMediaData() {
  console.log('Fetching media records from database...')

  // Get all media records
  const { data: mediaRecords, error } = await supabase
    .from('media')
    .select('*')

  if (error) {
    console.error('Error fetching media:', error)
    return
  }

  console.log(`Found ${mediaRecords.length} media records`)

  for (const media of mediaRecords) {
    console.log(`\nProcessing: ${media.title} (${media.id})`)

    // Check if poster_path is missing
    if (!media.poster_path || !media.overview) {
      console.log('  Missing data, fetching from TMDB...')

      try {
        const tmdbData = await fetchFromTMDB(media.tmdb_id, media.media_type)

        // Update the media record
        const { error: updateError } = await supabase
          .from('media')
          .update({
            poster_path: tmdbData.poster_path,
            backdrop_path: tmdbData.backdrop_path,
            overview: tmdbData.overview,
            vote_average: tmdbData.vote_average,
            release_date: tmdbData.release_date || tmdbData.first_air_date,
            tmdb_data: tmdbData
          })
          .eq('id', media.id)

        if (updateError) {
          console.error('  ❌ Error updating:', updateError)
        } else {
          console.log('  ✅ Updated successfully!')
        }

        // Rate limit: wait 250ms between requests
        await new Promise(resolve => setTimeout(resolve, 250))

      } catch (err) {
        console.error('  ❌ Error fetching from TMDB:', err.message)
      }
    } else {
      console.log('  ✅ Already has complete data')
    }
  }

  console.log('\n✨ Done!')
}

fixMediaData().catch(console.error)

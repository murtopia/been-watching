require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findMediaInfo() {
  console.log('Looking for media information storage...\n')

  // Check sample rating to understand media_id format
  const { data: sampleRating } = await supabase
    .from('ratings')
    .select('*')
    .limit(1)

  console.log('Sample media_id format:', sampleRating[0].media_id)
  console.log('(Looks like: tv-196322-s1 or movie-866398)\n')

  // Since media_id seems to reference TMDB IDs, check if watchlist or other tables have media info
  const tablesToCheck = ['watchlist', 'user_media', 'media_cache']

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (!error && data && data.length > 0) {
      console.log(`✅ Found table: ${table}`)
      console.log('   Fields:', Object.keys(data[0]))
      console.log('   Sample:', JSON.stringify(data[0], null, 2))
      console.log('')
    }
  }
}

findMediaInfo()

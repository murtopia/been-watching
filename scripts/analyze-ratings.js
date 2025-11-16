require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeRatings() {
  console.log('Analyzing ratings system...\n')

  // Get all unique rating values
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('rating, media_id, my_take')

  const ratingValues = new Set()
  const ratingCounts = {}

  allRatings?.forEach(r => {
    ratingValues.add(r.rating)
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1
  })

  console.log('Unique rating values:', Array.from(ratingValues))
  console.log('\nRating distribution:')
  Object.entries(ratingCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rating, count]) => {
      console.log(`  ${rating}: ${count} (${((count / allRatings.length) * 100).toFixed(1)}%)`)
    })

  // Check if media_title etc exist in ratings table
  const { data: sampleWithMedia } = await supabase
    .from('ratings')
    .select('*')
    .limit(1)

  console.log('\nSample rating fields:')
  console.log(Object.keys(sampleWithMedia[0]))

  console.log('\nTotal ratings:', allRatings.length)
}

analyzeRatings()

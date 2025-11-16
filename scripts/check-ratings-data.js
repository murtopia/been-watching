require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRatingsData() {
  console.log('Checking ratings table structure and data...\n')

  // Get sample ratings
  const { data: ratings, error } = await supabase
    .from('ratings')
    .select('*')
    .limit(5)

  if (error) {
    console.error('Error fetching ratings:', error)
    return
  }

  console.log('Sample ratings data:')
  console.log(JSON.stringify(ratings, null, 2))

  // Check if ratings have all needed fields
  if (ratings && ratings.length > 0) {
    const firstRating = ratings[0]
    console.log('\nFields in ratings table:')
    console.log(Object.keys(firstRating))

    console.log('\nRating value type:', typeof firstRating.rating)
    console.log('Rating value:', firstRating.rating)
  }

  // Get count
  const { count } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })

  console.log('\nTotal ratings in database:', count)
}

checkRatingsData()

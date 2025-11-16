// Quick script to check database contents
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('Checking database contents...\n')

  // Check profiles
  const { count: profilesCount, error: profilesError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  console.log('Profiles table:')
  if (profilesError) {
    console.log('  Error:', profilesError.message)
  } else {
    console.log('  Count:', profilesCount)
  }

  // Check invite_codes
  const { count: invitesCount, error: invitesError } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact', head: true })

  console.log('\nInvite_codes table:')
  if (invitesError) {
    console.log('  Error:', invitesError.message)
  } else {
    console.log('  Count:', invitesCount)
  }

  // Check activities
  const { count: activitiesCount, error: activitiesError } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })

  console.log('\nActivities table:')
  if (activitiesError) {
    console.log('  Error:', activitiesError.message)
  } else {
    console.log('  Count:', activitiesCount)
  }

  // Check ratings
  const { count: ratingsCount, error: ratingsError } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })

  console.log('\nRatings table:')
  if (ratingsError) {
    console.log('  Error:', ratingsError.message)
  } else {
    console.log('  Count:', ratingsCount)
  }

  // Get actual profiles data
  const { data: profiles, error: profilesDataError } = await supabase
    .from('profiles')
    .select('id, username, is_admin')
    .limit(5)

  console.log('\nFirst 5 profiles:')
  if (profilesDataError) {
    console.log('  Error:', profilesDataError.message)
  } else {
    console.log(profiles)
  }
}

checkDatabase().then(() => {
  console.log('\nDone!')
  process.exit(0)
}).catch(err => {
  console.error('Error:', err)
  process.exit(1)
})

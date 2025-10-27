const { createClient } = require('@supabase/supabase-js')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  // Get Nick Testing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'nicktesting')
    .single()

  console.log('\n=== Nick Testing Profile Data ===')
  console.log(JSON.stringify(profile, null, 2))

  // Get watch_status data
  const { data: watchStatus } = await supabase
    .from('watch_status')
    .select('*')
    .eq('user_id', profile.id)

  console.log('\n=== Watch Status Data ===')
  console.log('Total entries:', watchStatus ? watchStatus.length : 0)
  if (watchStatus && watchStatus.length > 0) {
    console.log(JSON.stringify(watchStatus, null, 2))
  }
}

checkData()

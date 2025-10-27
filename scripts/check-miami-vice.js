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
    .select('id, username')
    .eq('username', 'nicktesting')
    .single()

  console.log('\n=== Watch Status for nicktesting ===')

  // Get watch_status data
  const { data: watchStatus } = await supabase
    .from('watch_status')
    .select('*, media(*)')
    .eq('user_id', profile.id)

  console.log('Total entries:', watchStatus ? watchStatus.length : 0)
  if (watchStatus && watchStatus.length > 0) {
    watchStatus.forEach(ws => {
      const title = ws.media ? ws.media.title : 'Unknown'
      console.log(`- ${title}: ${ws.status}`)
    })
  }

  // Check profile completion
  const { data: completion } = await supabase
    .rpc('check_profile_completion', { user_id: profile.id })

  console.log('\n=== Profile Completion ===')
  console.log(JSON.stringify(completion, null, 2))
}

checkData()

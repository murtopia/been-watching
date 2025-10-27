const { createClient } = require('@supabase/supabase-js')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSave() {
  // Get Nick Testing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', 'nicktesting')
    .single()

  console.log('User ID:', profile.id)

  // Try to save The Muppets (tv-261)
  const mediaId = 'tv-261'
  const status = 'watched'

  console.log('\nAttempting to save:', { user_id: profile.id, media_id: mediaId, status })

  const { data, error } = await supabase
    .from('watch_status')
    .upsert({
      user_id: profile.id,
      media_id: mediaId,
      status: status
    }, { onConflict: 'user_id,media_id' })

  if (error) {
    console.error('\n❌ ERROR:')
    console.error('Message:', error.message)
    console.error('Details:', error.details)
    console.error('Hint:', error.hint)
    console.error('Code:', error.code)
    console.error('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log('\n✅ SUCCESS! Data saved:', data)
  }
}

testSave()

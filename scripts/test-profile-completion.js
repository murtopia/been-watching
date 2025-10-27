const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileCompletion() {
  try {
    console.log('Testing profile completion function...\n')

    // Get current user (you'll need to provide a user ID)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.log('Not authenticated, using test with any user ID')
      console.log('Please provide a user ID to test with:\n')

      // Get the "Nick Testing" user
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, top_show_1, top_show_2, top_show_3')
        .or('username.eq.nicktesting,username.ilike.%nick%testing%')

      if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} matching profile(s):\n`)

        for (const profile of profiles) {
          console.log(`\n=== Testing user: ${profile.username} (${profile.id}) ===`)
          console.log(`Avatar: ${profile.avatar_url ? '✓' : '✗'}`)
          console.log(`Bio: ${profile.bio ? `"${profile.bio}"` : '✗'}`)
          console.log(`Top Shows: ${profile.top_show_1 && profile.top_show_2 && profile.top_show_3 ? '✓' : '✗'}`)

          const testUserId = profile.id
          console.log(`\nCalling check_profile_completion for ${profile.username}...\n`)

        const { data, error } = await supabase
          .rpc('check_profile_completion', { user_id: testUserId })

        if (error) {
          console.error('❌ Error calling check_profile_completion:', error)
          console.log('\nThis means the function does NOT exist in the database yet.')
          console.log('You need to run the migration in Supabase SQL Editor.')
        } else {
            console.log('✅ Function exists and returned:')
            console.log(JSON.stringify(data, null, 2))
            console.log('\nThe function is working correctly!')
          }
        }
      }
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testProfileCompletion()

// Script to clear the 3rd top show from user's profile
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function clearThirdTopShow() {
  try {
    // Get the current user (assuming nicktesting user)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'nicktesting')
      .single()

    if (profileError) {
      console.error('Error finding profile:', profileError)
      return
    }

    console.log('Current top shows:')
    console.log('  1:', profiles.top_show_1)
    console.log('  2:', profiles.top_show_2)
    console.log('  3:', profiles.top_show_3)

    // Clear the 3rd top show
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ top_show_3: null })
      .eq('id', profiles.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return
    }

    console.log('✅ Successfully cleared 3rd top show!')
    console.log('Top show 3 is now null')
  } catch (err) {
    console.error('Error:', err)
  }
}

clearThirdTopShow()

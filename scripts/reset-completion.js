// Script to reset profile completion status for testing
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function resetCompletion() {
  try {
    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'nicktesting')
      .single()

    if (profileError) {
      console.error('Error finding profile:', profileError)
      return
    }

    console.log('Found profile:', profile.username)
    console.log('Current invites_remaining:', profile.invites_remaining)
    console.log('Current profile_invite_earned:', profile.profile_invite_earned)

    // Reset the profile completion status
    // Set profile_invite_earned to FALSE and reduce invite count by 1
    const newInvitesCount = Math.max(0, (profile.invites_remaining || 0) - 1)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_invite_earned: false,
        invites_remaining: newInvitesCount
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return
    }

    console.log('✅ Reset completion status successfully!')
    console.log('New profile_invite_earned: false')
    console.log('New invites_remaining:', newInvitesCount)
    console.log('\nNow you can complete your profile again to test the flow!')
    console.log('Refresh your profile page to see the checklist.')

  } catch (err) {
    console.error('Error:', err)
  }
}

resetCompletion()

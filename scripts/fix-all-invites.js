// Script to fix all users' invite counts to match the correct system:
// - Users with incomplete profiles: 0 invites
// - Users with complete profiles: 1 invite (from profile completion)

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProfileCompletion(userId) {
  const { data, error } = await supabase.rpc('check_profile_completion', { user_id: userId })
  if (error) {
    console.error('Error checking completion:', error)
    return null
  }
  return data
}

async function fixAllInvites() {
  try {
    console.log('🔍 Auditing all user invite counts...\n')

    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, invites_remaining, profile_invite_earned')
      .order('username')

    if (error) {
      console.error('Error fetching profiles:', error)
      return
    }

    const updates = []

    for (const profile of profiles) {
      // Check their actual completion status
      const completion = await checkProfileCompletion(profile.id)

      if (!completion) continue

      const isComplete = completion.is_complete
      const correctInvites = isComplete ? 1 : 0
      const needsUpdate = profile.invites_remaining !== correctInvites

      console.log(`${profile.username}:`)
      console.log(`  Current: ${profile.invites_remaining} invites, earned: ${profile.profile_invite_earned}`)
      console.log(`  Complete: ${isComplete}`)
      console.log(`  Should have: ${correctInvites} invites`)

      if (needsUpdate) {
        console.log(`  ⚠️  NEEDS FIX: ${profile.invites_remaining} → ${correctInvites}`)
        updates.push({
          id: profile.id,
          username: profile.username,
          correctInvites,
          isComplete
        })
      } else {
        console.log(`  ✅ Correct`)
      }
      console.log('')
    }

    if (updates.length === 0) {
      console.log('\n✅ All users have correct invite counts!')
      return
    }

    console.log(`\n📝 Found ${updates.length} users that need fixing`)
    console.log('\nProceeding with updates...\n')

    // Update each user
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          invites_remaining: update.correctInvites,
          profile_invite_earned: update.isComplete
        })
        .eq('id', update.id)

      if (updateError) {
        console.error(`❌ Error updating ${update.username}:`, updateError)
      } else {
        console.log(`✅ Fixed ${update.username}: set to ${update.correctInvites} invites, earned: ${update.isComplete}`)
      }
    }

    console.log('\n🎉 All invite counts have been corrected!')
    console.log('\nSummary:')
    console.log(`  - Users with incomplete profiles: 0 invites`)
    console.log(`  - Users with complete profiles: 1 invite`)

  } catch (err) {
    console.error('Error:', err)
  }
}

fixAllInvites()

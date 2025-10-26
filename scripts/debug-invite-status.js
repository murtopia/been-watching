/**
 * Debug script to check invite completion status
 * Run with: node scripts/debug-invite-status.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugInviteStatus(username = 'murtopia') {
  console.log('🔍 Debugging invite status for user:', username)
  console.log('')

  // 1. Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    console.error('❌ Error fetching profile:', profileError)
    return
  }

  console.log('👤 Profile Data:')
  console.log('  - ID:', profile.id)
  console.log('  - Username:', profile.username)
  console.log('  - Display Name:', profile.display_name)
  console.log('  - Avatar:', profile.avatar_url ? '✅ Yes' : '❌ No')
  console.log('  - Bio:', profile.bio ? `"${profile.bio}"` : '❌ No')
  console.log('  - Top Show 1:', profile.top_show_1 || '❌ No')
  console.log('  - Top Show 2:', profile.top_show_2 || '❌ No')
  console.log('  - Top Show 3:', profile.top_show_3 || '❌ No')
  console.log('  - Profile Invite Earned:', profile.profile_invite_earned ? '✅ Yes' : '❌ No')
  console.log('  - Invites Remaining:', profile.invites_remaining)
  console.log('  - Invites Used:', profile.invites_used)
  console.log('')

  // 2. Check watch status counts
  const { data: watchCounts, error: watchError } = await supabase
    .from('watch_status')
    .select('status')
    .eq('user_id', profile.id)

  if (watchError) {
    console.error('❌ Error fetching watch status:', watchError)
  } else {
    const want = watchCounts?.filter(w => w.status === 'want').length || 0
    const watching = watchCounts?.filter(w => w.status === 'watching').length || 0
    const watched = watchCounts?.filter(w => w.status === 'watched').length || 0

    console.log('📺 Watch Status Counts:')
    console.log('  - Want to Watch:', want, want > 0 ? '✅' : '❌')
    console.log('  - Currently Watching:', watching, watching > 0 ? '✅' : '❌')
    console.log('  - Finished Watching:', watched, watched > 0 ? '✅' : '❌')
    console.log('')
  }

  // 3. Test the check_profile_completion function
  console.log('🔧 Testing check_profile_completion function...')
  const { data: completionData, error: completionError } = await supabase
    .rpc('check_profile_completion', { user_id: profile.id })

  if (completionError) {
    console.error('❌ Error calling check_profile_completion:', completionError)
    console.error('   This might mean the database function is missing!')
    console.error('   You may need to run the migration: supabase/migrations/add-invite-system-v2.sql')
  } else {
    console.log('✅ Function returned:', JSON.stringify(completionData, null, 2))
    console.log('')
    console.log('📊 Completion Status:')
    console.log('  - Has Avatar:', completionData.has_avatar ? '✅' : '❌')
    console.log('  - Has Bio:', completionData.has_bio ? '✅' : '❌')
    console.log('  - Has Top Shows:', completionData.has_top_shows ? '✅' : '❌')
    console.log('  - Has Want:', completionData.has_want ? '✅' : '❌')
    console.log('  - Has Watching:', completionData.has_watching ? '✅' : '❌')
    console.log('  - Has Watched:', completionData.has_watched ? '✅' : '❌')
    console.log('  - Already Earned:', completionData.already_earned ? '✅' : '❌')
    console.log('  - Is Complete:', completionData.is_complete ? '✅' : '❌')
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log('🎯 Summary:')
  if (completionData?.is_complete && completionData?.already_earned) {
    console.log('   Status: Profile complete and invite already earned ✅')
    console.log('   Expected UI: Share invite section (if invites > 0) or "Invite Used"')
  } else if (completionData?.is_complete && !completionData?.already_earned) {
    console.log('   Status: Profile complete but invite NOT earned ⚠️')
    console.log('   Action: Should auto-award invite on page load')
  } else {
    console.log('   Status: Profile incomplete ⏳')
    console.log('   Expected UI: Checklist with incomplete items')
  }
  console.log('=' .repeat(60))
}

// Run the debug
const username = process.argv[2] || 'murtopia'
debugInviteStatus(username).catch(console.error)

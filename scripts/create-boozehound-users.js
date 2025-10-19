const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://udfhqiipppybkuxpycay.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZmhxaWlwcHB5Ymt1eHB5Y2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTY3MjUsImV4cCI6MjA3NDI5MjcyNX0.bDBIOaAQ2EuSkpMfrCfCmA_-1T-SIMfn59OK3Qqy0BY'

const supabase = createClient(supabaseUrl, supabaseKey)

const users = [
  {
    email: 'toddw493@gmail.com',
    username: 'Toddles',
    display_name: 'Todd Williams'
  },
  {
    email: 'taylormurto@gmail.com',
    username: 'Taylor.Murto',
    display_name: 'Taylor Murto'
  },
  {
    email: 'moss.pat@gmail.com',
    username: 'Mossy',
    display_name: 'Pat Moss'
  }
]

async function createBoozehoundUsers() {
  console.log('Creating Boozehound user profiles...\n')

  for (const user of users) {
    console.log(`Creating profile for ${user.display_name} (${user.username})...`)

    // Create a temporary auth user (this will be replaced when they sign up with OAuth)
    // Actually, we can't create auth users directly via the anon key
    // Instead, we'll create placeholder profiles that will be linked when they sign up

    // Let's just create profiles with temporary UUIDs that will be updated on first login
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        username: user.username,
        display_name: user.display_name,
        bio: 'What have you been watching?',
        is_private: false,
        invite_tier: 'boozehound',
        invites_remaining: 0,
        is_approved: true
      })
      .select()

    if (error) {
      console.error(`Error creating profile for ${user.display_name}:`, error)
    } else {
      console.log(`✅ Created profile for ${user.display_name}`)
      console.log(`   ID: ${data[0]?.id}`)
      console.log(`   Username: ${user.username}`)
    }
  }

  console.log('\n✅ All Boozehound profiles created!')

  // Verify
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, display_name, invite_tier, invites_remaining')
    .in('username', ['Toddles', 'Taylor.Murto', 'Mossy', 'murtopia'])
    .order('created_at')

  console.log('\nCurrent Boozehound profiles:')
  console.table(profiles)
}

createBoozehoundUsers().catch(console.error)

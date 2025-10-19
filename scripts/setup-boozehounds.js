/**
 * Boozehounds Setup Script
 *
 * This script will:
 * 1. Map email addresses to usernames for when they sign up
 * 2. Create mutual follows between all Boozehounds
 * 3. Import watch data from Apple Notes
 *
 * Run this AFTER each person has signed up with Google OAuth
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.log('This script requires the service role key to create auth users.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const BOOZEHOUNDS = [
  {
    email: 'nick@seven2.com',
    username: 'murtopia',
    display_name: 'Nick Murto'
  },
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

async function createOrUpdateProfiles() {
  console.log('🍺 Setting up Boozehound profiles...\n')

  const userIds = {}

  for (const boozehound of BOOZEHOUNDS) {
    console.log(`Processing ${boozehound.display_name}...`)

    // Check if auth user exists with this email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error listing users:', authError)
      continue
    }

    const existingAuthUser = authUsers.users.find(u => u.email === boozehound.email)

    if (existingAuthUser) {
      console.log(`  ✅ Auth user exists: ${existingAuthUser.id}`)
      userIds[boozehound.username] = existingAuthUser.id

      // Update or create profile
      const { data: profile, error: profileError} = await supabase
        .from('profiles')
        .upsert({
          id: existingAuthUser.id,
          user_id: existingAuthUser.id, // Same as id
          username: boozehound.username,
          display_name: boozehound.display_name,
          bio: 'What have you been watching?',
          is_private: false,
          invite_tier: 'boozehound',
          invites_remaining: 0,
          is_approved: true
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (profileError) {
        console.error(`  ❌ Error creating/updating profile:`, profileError)
      } else {
        console.log(`  ✅ Profile updated: @${boozehound.username}`)
      }
    } else {
      console.log(`  ⚠️  No auth user found - they need to sign up first with Google OAuth`)
      console.log(`     Email: ${boozehound.email}`)
    }
  }

  return userIds
}

async function createMutualFollows(userIds) {
  console.log('\n🤝 Creating mutual follows between all Boozehounds...\n')

  const usernames = Object.keys(userIds)
  let followsCreated = 0

  for (let i = 0; i < usernames.length; i++) {
    for (let j = 0; j < usernames.length; j++) {
      if (i === j) continue // Don't follow yourself

      const follower = usernames[i]
      const following = usernames[j]

      const { error } = await supabase
        .from('follows')
        .upsert({
          follower_id: userIds[follower],
          following_id: userIds[following],
          status: 'accepted' // Skip pending approval for Boozehounds
        }, {
          onConflict: 'follower_id,following_id'
        })

      if (error) {
        console.error(`  ❌ Error creating follow ${follower} → ${following}:`, error)
      } else {
        console.log(`  ✅ ${follower} → ${following}`)
        followsCreated++
      }
    }
  }

  console.log(`\n✅ Created ${followsCreated} follow relationships`)
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('   🍺 BOOZEHOUNDS SETUP SCRIPT 🍺')
  console.log('═══════════════════════════════════════════\n')

  const userIds = await createOrUpdateProfiles()

  const readyUsers = Object.keys(userIds)
  console.log(`\n📊 ${readyUsers.length} of ${BOOZEHOUNDS.length} users are ready`)

  if (readyUsers.length >= 2) {
    await createMutualFollows(userIds)
  } else {
    console.log('\n⚠️  Need at least 2 users signed up to create follows')
    console.log('   Ask your friends to sign up first, then run this script again!')
  }

  // Show final status
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, display_name, invite_tier, invites_remaining')
    .in('username', BOOZEHOUNDS.map(b => b.username))

  console.log('\n═══════════════════════════════════════════')
  console.log('📋 BOOZEHOUND PROFILES:')
  console.log('═══════════════════════════════════════════\n')
  console.table(profiles)

  // Count follows
  if (readyUsers.length >= 2) {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .in('follower_id', Object.values(userIds))

    console.log(`\n✅ Total follows: ${count}`)
    console.log(`✅ Expected: ${readyUsers.length * (readyUsers.length - 1)}`)
  }

  console.log('\n✅ Setup complete!\n')
}

main().catch(console.error)

#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('\n=== CURRENT USERS IN DATABASE ===\n')

  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('username, display_name, is_approved, invite_tier, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('No users found')
    return
  }

  console.log(`Total users: ${profiles.length}\n`)

  for (const profile of profiles) {
    console.log(`Username: ${profile.username}`)
    console.log(`Display Name: ${profile.display_name}`)
    console.log(`Approved: ${profile.is_approved}`)
    console.log(`Tier: ${profile.invite_tier || 'none'}`)
    console.log(`Created: ${new Date(profile.created_at).toLocaleDateString()}`)

    // Get watch status count
    const { count } = await supabase
      .from('watch_status')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', (await supabase.from('profiles').select('id').eq('username', profile.username).single()).data.id)

    console.log(`Shows tracked: ${count || 0}`)
    console.log('---')
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})

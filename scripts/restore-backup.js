#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read .env.local manually
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

async function restore() {
  const backupFile = 'scripts/backup-nick-1760895647993.json'
  console.log('📦 Restoring from:', backupFile)

  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf-8'))
  const userId = backup.user.id

  console.log(`   User: ${backup.user.display_name}`)
  console.log(`   Watch Status: ${backup.watch_status.length}`)
  console.log(`   Ratings: ${backup.ratings.length}\n`)

  // Clear current bad data
  console.log('Clearing bad import data...')
  await supabase.from('watch_status').delete().eq('user_id', userId)
  await supabase.from('ratings').delete().eq('user_id', userId)
  console.log('✅ Cleared\n')

  // Restore watch_status
  console.log('Restoring watch_status...')
  for (const item of backup.watch_status) {
    await supabase.from('watch_status').insert({
      user_id: item.user_id,
      media_id: item.media_id,
      status: item.status,
      created_at: item.created_at
    })
  }
  console.log(`✅ Restored ${backup.watch_status.length} watch_status entries\n`)

  // Restore ratings
  console.log('Restoring ratings...')
  for (const item of backup.ratings) {
    await supabase.from('ratings').insert({
      user_id: item.user_id,
      media_id: item.media_id,
      rating: item.rating,
      created_at: item.created_at
    })
  }
  console.log(`✅ Restored ${backup.ratings.length} ratings\n`)

  console.log('✅ Restore complete!')
}

restore().catch(console.error)

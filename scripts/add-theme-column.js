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
  console.log('\n🔧 Adding theme_preference column to profiles table...\n')

  try {
    // Check if column already exists
    const { data: columns, error: checkError } = await supabase
      .from('profiles')
      .select('theme_preference')
      .limit(1)

    if (!checkError) {
      console.log('✅ Column theme_preference already exists!')
      return
    }

    // Column doesn't exist, we need to add it via SQL
    console.log('Column does not exist. Please run this SQL in Supabase SQL Editor:\n')
    console.log('=' .repeat(60))
    console.log(fs.readFileSync('supabase/add-theme-preference.sql', 'utf-8'))
    console.log('=' .repeat(60))
    console.log('\nGo to: https://supabase.com/dashboard/project/udfhqiipppybkuxpycay/sql/new')

  } catch (error) {
    console.error('Error:', error.message)
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})

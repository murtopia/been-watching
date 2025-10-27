const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('Running migration: add-invite-system-v2.sql')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add-invite-system-v2.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('\n📄 Migration SQL:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))

    console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
    console.log('1. Go to https://udfhqiipppybkuxpycay.supabase.co/project/udfhqiipppybkuxpycay/sql/new')
    console.log('2. Copy the SQL from above (or from supabase/migrations/add-invite-system-v2.sql)')
    console.log('3. Paste and run the SQL')
    console.log('\nAfter running the migration, the invite system v2 will be set up with:')
    console.log('  - profile_invite_earned column')
    console.log('  - invited_by column')
    console.log('  - referrals table')
    console.log('  - check_profile_completion() function')
    console.log('  - award_profile_completion_invite() function')
    console.log('  - redeem_invite() function')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()

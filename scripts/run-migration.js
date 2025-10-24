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
    console.log('Running migration: create-show-notes-table.sql')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create-show-notes-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('\n📄 Migration SQL:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))

    console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
    console.log('1. Go to https://udfhqiipppybkuxpycay.supabase.co/project/udfhqiipppybkuxpycay/sql/new')
    console.log('2. Copy the SQL from above (or from supabase/migrations/create-show-notes-table.sql)')
    console.log('3. Paste and run the SQL')
    console.log('\nAfter running the migration, the show_notes table will be created with:')
    console.log('  - 280 character limit on notes')
    console.log('  - Public/Private visibility')
    console.log('  - Row Level Security enabled')
    console.log('  - Proper indexes for performance')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()

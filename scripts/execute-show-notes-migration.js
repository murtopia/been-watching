const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeMigration() {
  try {
    console.log('🚀 Executing migration: create-show-notes-table.sql\n')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create-show-notes-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Execute the entire SQL as one query
    const { data, error } = await supabase.rpc('exec_sql', { query: sql })

    if (error) {
      console.error('❌ Migration failed:', error.message)
      console.error('Details:', error)

      console.log('\n💡 Please run the SQL manually in Supabase SQL Editor:')
      console.log('1. Go to https://udfhqiipppybkuxpycay.supabase.co/project/udfhqiipppybkuxpycay/sql/new')
      console.log('2. Copy from: supabase/migrations/create-show-notes-table.sql')
      console.log('3. Paste and run the SQL')

      process.exit(1)
    }

    console.log('✅ Migration executed successfully!')
    console.log('\n📊 Created:')
    console.log('  - show_notes table with 280 char limit')
    console.log('  - Public/Private visibility column')
    console.log('  - Row Level Security policies')
    console.log('  - Performance indexes')
    console.log('  - Auto-update timestamp trigger')

    if (data) {
      console.log('\nResult:', data)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    console.log('\n💡 Please run the SQL manually in Supabase SQL Editor:')
    console.log('1. Go to https://udfhqiipppybkuxpycay.supabase.co/project/udfhqiipppybkuxpycay/sql/new')
    console.log('2. Copy from: supabase/migrations/create-show-notes-table.sql')
    console.log('3. Paste and run the SQL')
    process.exit(1)
  }
}

executeMigration()

/**
 * Run notifications table migration
 * This script creates the notifications table in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Running notifications table migration...\n')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/create-notifications-table.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // If exec_sql RPC doesn't exist, we need to run it directly
      // This is a fallback - normally you'd use Supabase CLI or Dashboard
      console.log('⚠️  exec_sql RPC not available')
      console.log('📋 Please run this SQL manually in Supabase Dashboard:\n')
      console.log('Dashboard URL:', supabaseUrl.replace('https://', 'https://app.supabase.com/project/'))
      console.log('\nGo to: SQL Editor → New Query → Paste the following:\n')
      console.log('─'.repeat(80))
      console.log(sql)
      console.log('─'.repeat(80))
      return
    }

    console.log('✅ Migration completed successfully!')
    console.log('✨ Notifications table created with RLS policies')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()

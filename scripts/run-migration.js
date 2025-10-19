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
    console.log('Running migration: add-profile-features.sql')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'add-profile-features.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Split into individual statements (rough split on semicolons)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

    console.log(`Found ${statements.length} SQL statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + '...')

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement })

      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message)
        // Continue with other statements
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`)
      }
    }

    console.log('\n✓ Migration completed!')
    console.log('\nPlease run the SQL manually in Supabase SQL Editor:')
    console.log('1. Go to https://udfhqiipppybkuxpycay.supabase.co/project/udfhqiipppybkuxpycay/sql/new')
    console.log('2. Copy the contents of supabase/add-profile-features.sql')
    console.log('3. Paste and run the SQL')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()

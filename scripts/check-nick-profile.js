const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

async function checkNickProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'murtopia')
    .single()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Nick\'s profile:')
    console.log(JSON.stringify(data, null, 2))
  }
}

checkNickProfile()

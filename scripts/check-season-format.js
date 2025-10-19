/**
 * Check how season-specific shows are stored
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY

async function supabaseRequest(endpoint) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`

  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    const urlObj = new URL(url)
    options.hostname = urlObj.hostname
    options.path = urlObj.pathname + urlObj.search

    https.get(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : null)
        } catch (e) {
          resolve(data)
        }
      })
    }).on('error', reject)
  })
}

async function main() {
  console.log('\n🔍 Checking season-specific format...\n')

  // Check Tulsa King entries
  const tulsaKing = await supabaseRequest(`media?title=ilike.%25Tulsa%20King%25&select=id,title,tmdb_id,media_type,tmdb_data`)

  console.log('Tulsa King entries:')
  tulsaKing.forEach(m => {
    console.log(`\n  Title: "${m.title}"`)
    console.log(`  ID: ${m.id}`)
    console.log(`  TMDB ID: ${m.tmdb_id}`)
    console.log(`  Type: ${m.media_type}`)

    if (m.tmdb_data && m.tmdb_data.name) {
      console.log(`  TMDB Name: ${m.tmdb_data.name}`)
    }
  })

  console.log('\n' + '='.repeat(50))

  // Check Peacemaker entries
  const peacemaker = await supabaseRequest(`media?title=ilike.%25Peacemaker%25&select=id,title,tmdb_id,media_type,tmdb_data`)

  console.log('\nPeacemaker entries:')
  peacemaker.forEach(m => {
    console.log(`\n  Title: "${m.title}"`)
    console.log(`  ID: ${m.id}`)
    console.log(`  TMDB ID: ${m.tmdb_id}`)
    console.log(`  Type: ${m.media_type}`)

    if (m.tmdb_data && m.tmdb_data.name) {
      console.log(`  TMDB Name: ${m.tmdb_data.name}`)
    }
  })

  console.log('\n')
}

main().catch(console.error)

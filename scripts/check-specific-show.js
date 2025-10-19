/**
 * Check a specific show's data
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Read environment variables
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
  const searchTitle = 'Farmhouse Fixer: Camp Revamp'

  console.log(`\n🔍 Searching for "${searchTitle}"...\n`)

  const media = await supabaseRequest(`media?title=ilike.%25${encodeURIComponent(searchTitle)}%25&select=*`)

  if (media && media.length > 0) {
    media.forEach(m => {
      console.log('Found show:')
      console.log(`  Title: ${m.title}`)
      console.log(`  ID: ${m.id}`)
      console.log(`  Type: ${m.media_type}`)
      console.log(`  Release Date: ${m.release_date}`)
      console.log(`  TMDB ID: ${m.tmdb_id}`)

      if (m.tmdb_data) {
        console.log(`\n  TMDB Data:`)
        console.log(`    Name: ${m.tmdb_data.name || m.tmdb_data.title}`)
        console.log(`    First Air Date: ${m.tmdb_data.first_air_date || 'N/A'}`)
        console.log(`    Release Date: ${m.tmdb_data.release_date || 'N/A'}`)
      }
      console.log()
    })
  } else {
    console.log('❌ Show not found in database\n')
  }
}

main().catch(console.error)

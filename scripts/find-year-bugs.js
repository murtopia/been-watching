/**
 * Find and fix year display bugs in the database
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

async function supabaseRequest(endpoint, method = 'GET', body = null) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`

  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }

    const urlObj = new URL(url)
    options.hostname = urlObj.hostname
    options.path = urlObj.pathname + urlObj.search

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : null)
        } catch (e) {
          resolve(data)
        }
      })
    })

    req.on('error', reject)
    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  🔍 SCANNING FOR YEAR DISPLAY BUGS')
  console.log('═══════════════════════════════════════════\n')

  // Get all media
  const media = await supabaseRequest('media?select=id,title,release_date,tmdb_data')

  console.log(`Total media entries: ${media.length}\n`)

  const buggedShows = []

  for (const m of media) {
    if (!m.release_date) continue

    // Check if release_date has invalid year format
    const year = m.release_date.substring(0, 4)

    // Check for years with 5+ digits or invalid format
    if (year.length > 4 || parseInt(year) > 2100 || parseInt(year) < 1800) {
      buggedShows.push({
        id: m.id,
        title: m.title,
        release_date: m.release_date,
        year: year,
        tmdb_data: m.tmdb_data
      })
    }
  }

  console.log(`Found ${buggedShows.length} shows with year display bugs:\n`)

  buggedShows.forEach((show, idx) => {
    console.log(`${idx + 1}. "${show.title}"`)
    console.log(`   Current release_date: ${show.release_date}`)
    console.log(`   Bad year extracted: ${show.year}`)

    // Try to extract correct date from tmdb_data
    if (show.tmdb_data) {
      const correctDate = show.tmdb_data.first_air_date || show.tmdb_data.release_date
      if (correctDate) {
        console.log(`   Correct date from TMDB: ${correctDate}`)
      }
    }
    console.log()
  })

  if (buggedShows.length > 0) {
    console.log('═══════════════════════════════════════════')
    console.log('Ready to fix these entries? Run fix-year-bugs.js')
    console.log('═══════════════════════════════════════════\n')
  } else {
    console.log('✅ No year display bugs found!\n')
  }
}

main().catch(console.error)

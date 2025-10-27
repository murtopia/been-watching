/**
 * Fix year display bugs in the database
 * Finds media with malformed release_date values and fixes them
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

/**
 * Safely formats a date string to ensure it's a valid ISO date format (YYYY-MM-DD)
 */
function safeFormatDate(dateString) {
  if (!dateString) return null

  // If it's already a valid ISO date format (YYYY-MM-DD), return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // If it's just a year (4 digits), convert to YYYY-01-01
  if (/^\d{4}$/.test(dateString)) {
    return `${dateString}-01-01`
  }

  // If it's a malformed date like "20250", extract just the year
  const yearMatch = dateString.match(/^(\d{4})/)
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`
  }

  console.warn(`⚠️  Invalid date format: "${dateString}" - setting to null`)
  return null
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  🔧 FIXING YEAR DISPLAY BUGS')
  console.log('═══════════════════════════════════════════\n')

  // Get all media
  const media = await supabaseRequest('media?select=id,title,release_date,tmdb_data')

  console.log(`Total media entries: ${media.length}\n`)

  const buggedShows = []
  const fixedShows = []

  for (const m of media) {
    if (!m.release_date) continue

    // Check if release_date has invalid format
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(m.release_date)

    if (!isValidFormat) {
      buggedShows.push(m)

      // Try to fix it
      const correctDate = safeFormatDate(m.release_date)

      if (correctDate) {
        console.log(`📝 Fixing: "${m.title}"`)
        console.log(`   Old: ${m.release_date}`)
        console.log(`   New: ${correctDate}\n`)

        // Update the database
        const result = await supabaseRequest(
          `media?id=eq.${encodeURIComponent(m.id)}`,
          'PATCH',
          { release_date: correctDate }
        )

        fixedShows.push({
          id: m.id,
          title: m.title,
          old_date: m.release_date,
          new_date: correctDate
        })
      } else {
        console.log(`❌ Could not fix: "${m.title}" - invalid date: ${m.release_date}\n`)
      }
    }
  }

  console.log('═══════════════════════════════════════════')
  console.log('  📊 SUMMARY')
  console.log('═══════════════════════════════════════════\n')
  console.log(`Total bugged shows found: ${buggedShows.length}`)
  console.log(`Successfully fixed: ${fixedShows.length}`)
  console.log(`Could not fix: ${buggedShows.length - fixedShows.length}\n`)

  if (fixedShows.length > 0) {
    console.log('✅ All fixable year bugs have been corrected!')
    console.log('   Users may need to hard refresh their browsers to see changes.\n')
  } else if (buggedShows.length === 0) {
    console.log('✅ No year display bugs found!\n')
  }
}

main().catch(console.error)

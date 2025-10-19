/**
 * Fix Nick's imported shows - delete wrong entries
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

// Shows to delete (wrong matches)
const SHOWS_TO_DELETE = [
  'The End of the Watch',           // Should be "End of Watch" movie
  'Harpers West One',                // Should be "Will & Harper"
  'On the Job',                      // Should be "Sicario"
  'Road to the White House',         // Should be "Road House"
  'Dhillon\'s Jackpot',              // Should be "Jackpot!"
  'Wolf Boy Ken',                    // Should be "Wolfs"
  'Carry On Christmas Specials',    // Should be "Carry-On"
  'Code of Gods Havoc',              // Should be "Havoc"

  // Shows that need different versions
  'Acapulco',                        // Wrong version
  'The Fountain of Youth',           // Should be 2025 movie
  'Number 24',                       // Should be 2024 movie
  'Paradise',                        // Should be 2025 Hulu show
  'Lift',                            // Should be 2024 movie
  'Fall Guy',                        // Should be "The Fall Guy" 2024
  'Solo',                            // Should be "Solo: A Star Wars Story"
  'Argyle',                          // Should be "Argylle" 2024
  'Napoleon',                        // Should be 2023 movie
  'Ferrari',                         // Should be 2023 movie
  'Homicide',                        // Should be "Homicide: Life on the Street"

  // General show entries that should be season-specific
  'Tulsa King',                      // General entry (has specific seasons)
  'Slow Horses',                     // General entry (has specific seasons)
  'Fargo',                           // General entry (has specific seasons)
  'Acapulco',                        // General entry (has specific seasons)
  'Killing Eve',                     // General entry (has specific seasons)
  'The Recruit',                     // General entry if exists
  'The Diplomat',                    // General entry if exists
  'The Old Man',                     // General entry if exists
  'Lioness'                          // General entry if exists
]

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

async function deleteShow(userId, mediaId, title) {
  // Delete from watch_status
  await supabaseRequest(`watch_status?user_id=eq.${userId}&media_id=eq.${mediaId}`, 'DELETE')

  // Delete from ratings
  await supabaseRequest(`ratings?user_id=eq.${userId}&media_id=eq.${mediaId}`, 'DELETE')

  console.log(`  ✅ Deleted "${title}"`)
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  🔧 FIXING NICK\'S IMPORTS')
  console.log('═══════════════════════════════════════════\n')

  // Get Nick's user ID
  const profile = await supabaseRequest('profiles?username=eq.murtopia&select=id')
  const userId = profile[0].id

  console.log(`Found user: murtopia (${userId})\n`)

  // Get all media
  const media = await supabaseRequest('media?select=id,title,media_type')

  console.log('Deleting incorrect entries...\n')

  let deleted = 0
  for (const m of media) {
    if (SHOWS_TO_DELETE.includes(m.title)) {
      await deleteShow(userId, m.id, m.title)
      deleted++
    }
  }

  console.log(`\n📊 CLEANUP RESULTS:`)
  console.log(`  ✅ Deleted: ${deleted} incorrect entries\n`)

  console.log('═══════════════════════════════════════════')
  console.log('  ✅ CLEANUP COMPLETE!')
  console.log('═══════════════════════════════════════════\n')
}

main().catch(console.error)

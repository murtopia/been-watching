/**
 * Delete the final wrong entries that slipped through
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

// Shows that are still wrong after second import
const SHOWS_TO_DELETE = [
  'Harpers West One',
  'On the Job',
  'Road to the White House',
  'Dhillon\'s Jackpot',
  'Spice and Wolf: MERCHANT MEETS THE WISE WOLF',  // Should be "Wolfs"
  'Carry On Christmas Specials',
  'Code of Gods Havoc',
  'The End of the Watch'  // Should be "End of Watch" movie
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
  console.log('Deleting final incorrect entries...\n')

  // Get Nick's user ID
  const profile = await supabaseRequest('profiles?username=eq.murtopia&select=id')
  const userId = profile[0].id

  // Get all media
  const media = await supabaseRequest('media?select=id,title,media_type')

  let deleted = 0
  for (const m of media) {
    if (SHOWS_TO_DELETE.includes(m.title)) {
      await deleteShow(userId, m.id, m.title)
      deleted++
    }
  }

  console.log(`\n✅ Deleted: ${deleted} incorrect entries\n`)
}

main().catch(console.error)

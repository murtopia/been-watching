/**
 * Delete general TV show entries that should be season-specific
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

// TV shows that should ONLY exist as season-specific entries
const TV_SHOWS_TO_DELETE = [
  'Fargo',
  'Tulsa King',
  'Slow Horses',
  'Acapulco',
  'Killing Eve',
  'The Diplomat',
  'The Old Man',
  'Lioness',
  'The Recruit',
  'Peacemaker'
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

  console.log(`  ✅ Deleted general entry for "${title}"`)
}

async function main() {
  console.log('\n🔧 Deleting general TV show entries...\n')

  // Get Nick's user ID
  const profile = await supabaseRequest('profiles?username=eq.murtopia&select=id')
  const userId = profile[0].id

  // Get all media
  const media = await supabaseRequest('media?media_type=eq.tv&select=id,title,tmdb_id')

  let deleted = 0
  for (const m of media) {
    // Only delete if it's a general entry (no "-s" in the ID)
    if (TV_SHOWS_TO_DELETE.includes(m.title) && !m.id.includes('-s')) {
      await deleteShow(userId, m.id, m.title)
      deleted++
    }
  }

  console.log(`\n✅ Deleted: ${deleted} general TV show entries\n`)
}

main().catch(console.error)

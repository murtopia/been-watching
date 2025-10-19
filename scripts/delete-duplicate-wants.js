/**
 * Delete duplicate general TV show entries from "want" list
 * Keep only the season-specific entries
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
  console.log('\n🔧 Finding and deleting duplicate TV show entries in "want" list...\n')

  // Get Nick's user ID
  const profile = await supabaseRequest('profiles?username=eq.murtopia&select=id')
  const userId = profile[0].id

  // Get all "want" watch_status entries
  const wantList = await supabaseRequest(`watch_status?user_id=eq.${userId}&status=eq.want&select=media_id`)

  // Get media details for all want items
  const mediaIds = wantList.map(w => w.media_id).join(',')
  const media = await supabaseRequest(`media?id=in.(${mediaIds})&select=id,title,media_type`)

  // Find duplicates: if we have both "Show" and "Show - Season 1"
  const toDelete = []
  const titleMap = {}

  media.forEach(m => {
    if (m.media_type === 'tv') {
      const baseTitle = m.title.replace(/ - Season \d+$/, '')

      if (!titleMap[baseTitle]) {
        titleMap[baseTitle] = []
      }

      titleMap[baseTitle].push(m)
    }
  })

  // For each show that has both general and season-specific entries, delete the general one
  Object.keys(titleMap).forEach(baseTitle => {
    const entries = titleMap[baseTitle]

    if (entries.length > 1) {
      // Find general entry (without " - Season X")
      const generalEntry = entries.find(e => !e.title.includes(' - Season '))

      if (generalEntry) {
        toDelete.push(generalEntry)
      }
    }
  })

  console.log(`Found ${toDelete.length} duplicate general TV entries to delete:\n`)

  let deleted = 0
  for (const m of toDelete) {
    // Delete from watch_status
    await supabaseRequest(`watch_status?user_id=eq.${userId}&media_id=eq.${m.id}`, 'DELETE')

    // Delete from ratings (if any)
    await supabaseRequest(`ratings?user_id=eq.${userId}&media_id=eq.${m.id}`, 'DELETE')

    console.log(`  ✅ Deleted "${m.title}"`)
    deleted++
  }

  // Also handle Ferrari TV vs Movie duplicate
  const ferrariEntries = await supabaseRequest(`media?title=eq.Ferrari&select=id,title,media_type`)
  const ferrariTV = ferrariEntries.find(e => e.media_type === 'tv')

  if (ferrariTV) {
    await supabaseRequest(`watch_status?user_id=eq.${userId}&media_id=eq.${ferrariTV.id}`, 'DELETE')
    await supabaseRequest(`ratings?user_id=eq.${userId}&media_id=eq.${ferrariTV.id}`, 'DELETE')
    console.log(`  ✅ Deleted "Ferrari" [tv] (keeping movie version)`)
    deleted++
  }

  console.log(`\n✅ Deleted: ${deleted} duplicate entries\n`)
}

main().catch(console.error)

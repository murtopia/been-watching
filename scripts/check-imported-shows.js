// Check what was imported for Nick
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

async function checkImports() {
  console.log('Checking Nick\'s imported shows...\n')

  // Get Nick's user ID
  const profile = await supabaseRequest('profiles?username=eq.murtopia&select=id')
  const userId = profile[0].id

  // Get all watch_status entries
  const watchStatus = await supabaseRequest(`watch_status?user_id=eq.${userId}&select=media_id,status`)

  // Get all ratings
  const ratings = await supabaseRequest(`ratings?user_id=eq.${userId}&select=media_id,rating`)

  // Get all media
  const media = await supabaseRequest(`media?select=id,title,media_type,tmdb_id`)

  console.log(`Total shows in watch_status: ${watchStatus.length}`)
  console.log(`Total shows with ratings: ${ratings.length}`)
  console.log(`Total media entries: ${media.length}\n`)

  // Build map
  const mediaMap = {}
  media.forEach(m => {
    mediaMap[m.id] = m
  })

  const ratingMap = {}
  ratings.forEach(r => {
    ratingMap[r.media_id] = r.rating
  })

  console.log('All imported shows:\n')

  watchStatus.forEach((ws, idx) => {
    const m = mediaMap[ws.media_id]
    const r = ratingMap[ws.media_id]
    console.log(`${idx + 1}. "${m?.title}" [${m?.media_type}] - Status: ${ws.status}${r ? `, Rating: ${r}` : ''}`)
  })
}

checkImports().catch(console.error)

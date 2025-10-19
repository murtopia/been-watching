// Quick test to see what the error is
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

// Supabase helper
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
        console.log('Status Code:', res.statusCode)
        console.log('Response:', data)
        try {
          resolve(data ? JSON.parse(data) : null)
        } catch (e) {
          resolve(data)
        }
      })
    })

    req.on('error', (err) => {
      console.error('Request Error:', err)
      reject(err)
    })

    if (body) {
      const bodyStr = JSON.stringify(body)
      console.log('Sending body:', bodyStr)
      req.write(bodyStr)
    }

    req.end()
  })
}

async function test() {
  console.log('Testing single insert...\n')

  const testData = {
    user_id: 'ac15f0ac-ef46-4efc-bee3-96084ede16ad',
    tmdb_id: 60059,
    media_type: 'tv',
    watch_status: 'want',
    rating: null,
    title: 'Fargo',
    poster_path: '/gUGC68K5WGamm6j0ygBQ6xTeUzn.jpg',
    release_date: '2014-04-15',
    overview: 'An anthology series...'
  }

  const result = await supabaseRequest('user_media', 'POST', testData)
  console.log('\nFinal result:', result)
}

test().catch(console.error)

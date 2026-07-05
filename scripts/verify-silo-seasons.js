#!/usr/bin/env node
// Read-only check: list media rows for Silo (tmdb 125988)
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const envVars = {}
fs.readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) envVars[m[1].trim()] = m[2].trim()
})

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

supabase
  .from('media')
  .select('id, title, release_date')
  .eq('tmdb_id', 125988)
  .order('id')
  .then(({ data, error }) => {
    if (error) throw error
    data.forEach(r => console.log(`${r.id}  ${r.title}  (${r.release_date})`))
  })

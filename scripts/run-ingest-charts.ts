#!/usr/bin/env npx tsx
/**
 * Manual runner for the chart ingestion task (same code the daily cron runs).
 * Usage: npx tsx scripts/run-ingest-charts.ts
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load .env.local into process.env BEFORE importing the task (it reads env at module load)
const envContent = readFileSync('.env.local', 'utf-8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match && !process.env[match[1].trim()]) {
    process.env[match[1].trim()] = match[2].trim()
  }
})

async function main() {
  const { ingestCharts } = await import('../lib/tasks/ingest-charts')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const result = await ingestCharts(supabase)
  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

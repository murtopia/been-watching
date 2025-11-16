/**
 * Background job script to check for upcoming releases
 * 
 * Run this via cron job or scheduled function (e.g., daily at 6 AM)
 * 
 * Usage:
 *   node scripts/check-upcoming-releases.ts
 *   or
 *   npm run check-releases
 */

import { createClient } from '@supabase/supabase-js'
import { checkAllUsersReleases } from '../utils/release-notification-service'

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runReleaseCheck() {
  console.log('🎬 Starting release notification check...')

  try {
    await checkAllUsersReleases(supabase as any)
    console.log('✅ Release check complete!')
  } catch (error) {
    console.error('❌ Error in release check:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  runReleaseCheck()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error)
      process.exit(1)
    })
}

export { runReleaseCheck }


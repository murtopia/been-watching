/**
 * Background job script to generate recommendations for all users
 * 
 * Run this via cron job or scheduled function (e.g., daily at 2 AM)
 * 
 * Usage:
 *   node scripts/generate-recommendations.ts
 *   or
 *   npm run generate-recommendations
 */

import { createClient } from '@supabase/supabase-js'
import { generateRecommendations, saveRecommendations } from '../utils/recommendation-engine'

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

async function generateRecommendationsForAllUsers() {
  console.log('🎯 Starting recommendation generation for all users...')

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1000) // Process in batches if needed

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      console.log('No users found')
      return
    }

    console.log(`Found ${users.length} users`)

    let successCount = 0
    let errorCount = 0

    // Generate recommendations for each user
    for (const user of users) {
      try {
        console.log(`Generating recommendations for user ${user.id}...`)

        // Generate recommendations
        const recommendations = await generateRecommendations(
          supabase as any,
          user.id,
          50 // Generate top 50 recommendations
        )

        if (recommendations.length > 0) {
          await saveRecommendations(
            supabase as any,
            user.id,
            recommendations
          )
          console.log(`  ✅ Generated ${recommendations.length} recommendations`)
          successCount++
        } else {
          console.log(`  ⚠️  No recommendations generated (insufficient data)`)
          successCount++
        }
      } catch (error) {
        console.error(`  ❌ Error for user ${user.id}:`, error)
        errorCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Success: ${successCount}`)
    console.log(`  ❌ Errors: ${errorCount}`)
    console.log('🎉 Recommendation generation complete!')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  generateRecommendationsForAllUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error)
      process.exit(1)
    })
}

export { generateRecommendationsForAllUsers }


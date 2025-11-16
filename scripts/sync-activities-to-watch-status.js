/**
 * Sync activities to watch_status table
 *
 * This script creates watch_status entries for all activities that have a status
 * but don't yet have a corresponding watch_status record.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.error('Usage: node scripts/sync-activities-to-watch-status.js <username>');
    process.exit(1);
  }

  console.log(`🔄 Syncing activities to watch_status for user: ${username}\n`);

  // Get user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', username)
    .single();

  if (!profile) {
    console.error(`User ${username} not found`);
    process.exit(1);
  }

  console.log(`✓ Found user: ${profile.display_name} (@${profile.username})`);
  console.log(`  User ID: ${profile.id}\n`);

  // Get all activities with status
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', profile.id)
    .eq('activity_type', 'status_changed');

  console.log(`Found ${activities?.length || 0} status_changed activities\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const activity of activities || []) {
    const status = activity.activity_data?.status;
    const mediaId = activity.media_id;

    if (!status || !mediaId) {
      skipped++;
      continue;
    }

    // Check if watch_status already exists
    const { data: existing } = await supabase
      .from('watch_status')
      .select('id')
      .eq('user_id', profile.id)
      .eq('media_id', mediaId)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Create watch_status entry
    const { error } = await supabase
      .from('watch_status')
      .insert({
        user_id: profile.id,
        media_id: mediaId,
        status: status,
        progress: 0
      });

    if (error) {
      console.error(`❌ Error creating watch_status for ${mediaId}:`, error.message);
      errors++;
    } else {
      created++;
      if (created % 100 === 0) {
        console.log(`  ✓ Created ${created} watch_status entries...`);
      }
    }
  }

  console.log(`\n✅ Sync complete!`);
  console.log(`   - ${created} watch_status entries created`);
  console.log(`   - ${skipped} skipped (already exist or no status)`);
  console.log(`   - ${errors} errors`);
}

main().catch(console.error);

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== DATABASE STRUCTURE ANALYSIS ===\n');

  // Check which tables exist
  const tablesToCheck = [
    'activities',
    'media',
    'profiles',
    'watch_status',
    'watchlist',
    'user_media',
    'user_shows',
    'user_movies'
  ];

  console.log('1. CHECKING TABLES:\n');
  const existingTables = [];

  for (const table of tablesToCheck) {
    const { error, data } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      existingTables.push(table);
      const columns = data && data[0] ? Object.keys(data[0]).join(', ') : 'no data yet';
      console.log(`✓ ${table}`);
      console.log(`  Columns: ${columns}\n`);
    }
  }

  console.log('\n2. CHRISTIAN\'S PROFILE DATA:\n');

  // Get Christian's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'christian')
    .single();

  console.log('User ID:', profile?.id);
  console.log('Username:', profile?.username);

  console.log('\n3. CHECKING EACH TABLE FOR CHRISTIAN\'S DATA:\n');

  for (const table of existingTables) {
    const { data, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('user_id', profile.id);

    console.log(`${table}: ${count || 0} records`);
    if (data && data.length > 0) {
      console.log(`  Sample:`, JSON.stringify(data[0], null, 2).slice(0, 200));
    }
  }

  console.log('\n4. PROFILE PAGE QUERY ANALYSIS:\n');

  // Check what the profile page actually queries
  const { data: watchStatus } = await supabase
    .from('watch_status')
    .select('*')
    .eq('user_id', profile.id)
    .limit(5);

  console.log('watch_status records:', watchStatus?.length || 0);
  if (watchStatus && watchStatus.length > 0) {
    console.log('Sample:', JSON.stringify(watchStatus[0], null, 2));
  }
}

main().catch(console.error);

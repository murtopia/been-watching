/**
 * Import Trakt.tv watch history to Been Watching
 *
 * This script imports watched shows and movies from Trakt.tv export files.
 * It creates media entries (fetching from TMDB) and activities for a user.
 *
 * Usage: node scripts/import-trakt-data.js <username> [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TRAKT_DATA_DIR = path.join(__dirname, '../christian_watched_trakt');
const DRY_RUN = process.argv.includes('--dry-run');
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findUser(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', username)
    .single();

  if (error || !data) {
    throw new Error(`User ${username} not found`);
  }

  return data;
}

async function fetchTMDBData(mediaType, tmdbId, seasonNumber = null) {
  try {
    let url;
    if (mediaType === 'tv' && seasonNumber) {
      url = `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
    } else if (mediaType === 'tv') {
      url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`;
    } else {
      url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`    TMDB API error (${response.status}) for ${mediaType} ${tmdbId}`);
      return null;
    }

    const data = await response.json();
    await delay(250); // Rate limit: 4 requests per second
    return data;
  } catch (error) {
    console.error(`    Error fetching TMDB data:`, error.message);
    return null;
  }
}

async function ensureMediaExists(mediaId, tmdbId, mediaType, seasonNumber = null) {
  // Check if media already exists
  const { data: existing } = await supabase
    .from('media')
    .select('id')
    .eq('id', mediaId)
    .single();

  if (existing) {
    return true;
  }

  if (DRY_RUN) {
    return true; // Assume it would succeed in dry run
  }

  // Fetch from TMDB
  const tmdbData = await fetchTMDBData(mediaType, tmdbId, seasonNumber);
  if (!tmdbData) {
    return false;
  }

  // Create media entry
  const mediaEntry = {
    id: mediaId,
    tmdb_id: tmdbId,
    media_type: mediaType,
    title: seasonNumber
      ? `${tmdbData.name || tmdbData.title} - Season ${seasonNumber}`
      : (tmdbData.name || tmdbData.title),
    poster_path: tmdbData.poster_path,
    backdrop_path: tmdbData.backdrop_path,
    overview: tmdbData.overview,
    release_date: tmdbData.release_date || tmdbData.first_air_date || tmdbData.air_date,
    vote_average: tmdbData.vote_average,
    tmdb_data: tmdbData
  };

  const { error } = await supabase
    .from('media')
    .insert(mediaEntry);

  if (error) {
    console.error(`    Error creating media entry:`, error.message);
    return false;
  }

  return true;
}

async function importWatchedShows(userId) {
  console.log('\n📺 Importing watched TV shows...');

  const watchedShowsPath = path.join(TRAKT_DATA_DIR, 'watched-shows.json');
  const watchedShows = JSON.parse(fs.readFileSync(watchedShowsPath, 'utf8'));

  console.log(`Found ${watchedShows.length} shows to import`);

  let importedShows = 0;
  let importedSeasons = 0;
  let skippedShows = 0;

  for (const showData of watchedShows) {
    const { show, seasons, last_watched_at } = showData;
    const tmdbId = show.ids.tmdb;

    if (!tmdbId) {
      console.log(`⚠️  Skipping "${show.title}" - no TMDB ID`);
      skippedShows++;
      continue;
    }

    try {
      console.log(`\nProcessing: ${show.title} (${show.year})`);

      // Process each season as a separate activity
      for (const season of seasons) {
        const mediaId = `tv-${tmdbId}-s${season.number}`;

        // Check if this season is already in user's activities
        const { data: existingActivity } = await supabase
          .from('activities')
          .select('id')
          .eq('user_id', userId)
          .eq('media_id', mediaId)
          .single();

        if (existingActivity) {
          console.log(`  ✓ Season ${season.number} already tracked`);
          continue;
        }

        // Determine if season is completed (all episodes watched)
        const totalEpisodes = season.episodes.length;
        const watchedEpisodes = season.episodes.length; // All episodes in Trakt export are watched

        const status = watchedEpisodes === totalEpisodes ? 'watched' : 'watching';

        if (DRY_RUN) {
          console.log(`  [DRY RUN] Would add season ${season.number} as "${status}"`);
          importedSeasons++;
          continue;
        }

        // Ensure media exists
        console.log(`  📡 Fetching TMDB data for season ${season.number}...`);
        const mediaExists = await ensureMediaExists(mediaId, tmdbId, 'tv', season.number);

        if (!mediaExists) {
          console.error(`  ❌ Could not create media entry for season ${season.number}`);
          continue;
        }

        // Create activity for this season
        const { error: activityError } = await supabase
          .from('activities')
          .insert({
            user_id: userId,
            media_id: mediaId,
            activity_type: 'status_changed',
            activity_data: {
              status: status, // 'watched' or 'watching'
              previous_status: null,
              season_number: season.number,
              episodes_watched: watchedEpisodes,
              total_episodes: totalEpisodes,
              imported_from: 'trakt',
              last_watched_at: season.episodes[season.episodes.length - 1].last_watched_at
            },
            created_at: last_watched_at
          });

        if (activityError) {
          console.error(`  ❌ Error adding activity for season ${season.number}:`, activityError.message);
          continue;
        }

        // Also create watch_status entry
        const { error: watchStatusError } = await supabase
          .from('watch_status')
          .insert({
            user_id: userId,
            media_id: mediaId,
            status: status,
            progress: 0
          });

        if (watchStatusError) {
          console.error(`  ❌ Error adding watch_status for season ${season.number}:`, watchStatusError.message);
        } else {
          importedSeasons++;
          console.log(`  ✓ Added season ${season.number} (${watchedEpisodes}/${totalEpisodes} episodes)`);
        }
      }

      importedShows++;

    } catch (error) {
      console.error(`❌ Error processing show "${show.title}":`, error.message);
    }
  }

  console.log(`\n✅ Shows import complete:`);
  console.log(`   - ${importedShows} shows processed`);
  console.log(`   - ${importedSeasons} seasons ${DRY_RUN ? 'would be added' : 'added'}`);
  console.log(`   - ${skippedShows} shows skipped`);
}

async function importWatchedMovies(userId) {
  console.log('\n🎬 Importing watched movies...');

  const watchedMoviesPath = path.join(TRAKT_DATA_DIR, 'watched-movies.json');
  const watchedMovies = JSON.parse(fs.readFileSync(watchedMoviesPath, 'utf8'));

  console.log(`Found ${watchedMovies.length} movies to import`);

  let importedMovies = 0;
  let skippedMovies = 0;

  for (const movieData of watchedMovies) {
    const { movie, last_watched_at, plays } = movieData;
    const tmdbId = movie.ids.tmdb;

    if (!tmdbId) {
      console.log(`⚠️  Skipping "${movie.title}" - no TMDB ID`);
      skippedMovies++;
      continue;
    }

    try {
      const mediaId = `movie-${tmdbId}`;

      // Check if movie already exists in user's activities
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('id')
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .single();

      if (existingActivity) {
        console.log(`✓ Movie "${movie.title}" already tracked`);
        continue;
      }

      if (DRY_RUN) {
        console.log(`[DRY RUN] Would add: ${movie.title} (${movie.year})`);
        importedMovies++;
        continue;
      }

      // Ensure media exists
      console.log(`📡 Fetching TMDB data for "${movie.title}"...`);
      const mediaExists = await ensureMediaExists(mediaId, tmdbId, 'movie');

      if (!mediaExists) {
        console.error(`❌ Could not create media entry for "${movie.title}"`);
        continue;
      }

      // Create activity for this movie
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          user_id: userId,
          media_id: mediaId,
          activity_type: 'status_changed',
          activity_data: {
            status: 'watched',
            previous_status: null,
            plays: plays,
            imported_from: 'trakt',
            last_watched_at: last_watched_at
          },
          created_at: last_watched_at
        });

      if (activityError) {
        console.error(`❌ Error adding activity for movie "${movie.title}":`, activityError.message);
        continue;
      }

      // Also create watch_status entry
      const { error: watchStatusError } = await supabase
        .from('watch_status')
        .insert({
          user_id: userId,
          media_id: mediaId,
          status: 'watched',
          progress: 0
        });

      if (watchStatusError) {
        console.error(`❌ Error adding watch_status for movie "${movie.title}":`, watchStatusError.message);
        continue;
      }

      importedMovies++;
      console.log(`✓ Added movie: ${movie.title} (${movie.year})`);

    } catch (error) {
      console.error(`❌ Error processing movie "${movie.title}":`, error.message);
    }
  }

  console.log(`\n✅ Movies import complete:`);
  console.log(`   - ${importedMovies} movies ${DRY_RUN ? 'would be added' : 'added'}`);
  console.log(`   - ${skippedMovies} movies skipped`);
}

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.error('Usage: node scripts/import-trakt-data.js <username> [--dry-run]');
    process.exit(1);
  }

  if (!TMDB_API_KEY) {
    console.error('Error: TMDB_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log(`🚀 Starting Trakt.tv import for user: ${username}`);
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }

  try {
    // Find user
    const user = await findUser(username);
    console.log(`✓ Found user: ${user.display_name} (@${user.username})`);

    // Import shows
    await importWatchedShows(user.id);

    // Import movies
    await importWatchedMovies(user.id);

    console.log('\n🎉 Import complete!');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();

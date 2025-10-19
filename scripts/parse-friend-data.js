/**
 * Script to parse friend watch data and fuzzy match with TMDB
 * Run this to generate SQL insert statements for friend data
 */

const TMDB_API_KEY = '99b89037cac7fea56692934b534ea26a';

// Friend profiles
const FRIENDS = {
  nick: {
    username: 'Murtopia',
    display_name: 'Nick Murto',
    bio: 'What have you been watching?'
  },
  taylor: {
    username: 'Taylor.Murto',
    display_name: 'Taylor Murto',
    bio: 'What have you been watching?'
  },
  todd: {
    username: 'Toddles',
    display_name: 'Todd Williams',
    bio: 'What have you been watching?'
  },
  pat: {
    username: 'Mossy',
    display_name: 'Pat Moss',
    bio: 'What have you been watching?'
  }
};

// Parse ratings from stars
function parseRating(showLine) {
  if (showLine.includes('***')) return 'love';
  if (showLine.includes('**')) return 'like';
  if (showLine.includes('*')) return 'meh';
  return null;
}

// Clean show title and extract network
function parseShowLine(line) {
  // Remove stars
  let cleaned = line.replace(/\*+/g, '').trim();

  // Extract network in parentheses
  const networkMatch = cleaned.match(/\(([^)]+)\)/);
  const network = networkMatch ? networkMatch[1] : null;

  // Remove network and other metadata
  cleaned = cleaned.replace(/\([^)]+\)/g, '').trim();

  // Extract person who recommended (if at end after network)
  const parts = line.split('(');
  let recommendedBy = null;
  if (parts.length > 2) {
    const lastPart = parts[parts.length - 1];
    if (!lastPart.toLowerCase().includes('netflix') &&
        !lastPart.toLowerCase().includes('hulu') &&
        !lastPart.toLowerCase().includes('apple') &&
        !lastPart.toLowerCase().includes('prime') &&
        !lastPart.toLowerCase().includes('max') &&
        !lastPart.toLowerCase().includes('paramount') &&
        !lastPart.toLowerCase().includes('disney') &&
        !lastPart.toLowerCase().includes('peacock') &&
        !lastPart.toLowerCase().includes('hbo')) {
      recommendedBy = lastPart.replace(')', '').trim();
    }
  }

  return { title: cleaned, network, recommendedBy, rating: parseRating(line) };
}

// TMDB search with fuzzy matching
async function searchTMDB(title) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
    );
    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error(`Error searching for "${title}":`, error);
    return null;
  }
}

// Taylor's data
const TAYLOR_DATA = {
  topShows: [
    'MobLand',
    'Peacemaker S1',
    'The Morning Show S4'
  ],
  needToWatch: [
    'The Old Man (Hulu)',
    'The Order (Hulu)',
    'Silo (Apple)',
    'Black Rabbit (Netflix)',
    'Slow Horses S5 (Apple)'
  ],
  currentlyWatching: [
    'Acapulco S4 (Apple)',
    'Platonic S2 (Apple)',
    'Peacemaker S2 (HBO)',
    'Dept Q (Netflix)',
    'The Terminal List: Dark Wolf(Prime)',
    'The Morning Show S4 (Apple)'
  ],
  paused: [
    'The Curse (Paramount+)',
    'Acolyte (Disney)',
    'Griselda (Netflix)',
    'Killers of the Flower Moon (Apple)',
    'Horizon: An American Saga - Chapter 1 (Max)',
    'Cross (Prime)'
  ],
  watched: [
    'Black Bag (Movie)***',
    'F1 The Movie (Apple)**',
    'Ballard (Prime)**',
    'Smoke (Apple)***',
    'War of The Worlds (Prime)*, awful',
    'Stick (Apple)**',
    'Happy Gilmore 2 (Netflix)**',
    'Superman***',
    'Sinners (Max)**',
    'Riff Raff (Hulu)**',
    'The Bear S4 (Hulu)**',
    'Heads of State (Prime)**',
    'The Waterfront (Netflix)**',
    'Fubar S2 (Netflix)**',
    'The Better Sister (Prime)**',
    'Top Chef S22 (Peacock)**',
    'Interior Chinatown (Hulu)**',
    'Sirens (Netflix)**',
    'MobLand (Paramount)***',
    'Your Friends and Neighbors (Apple)***',
    'The Studio (Apple)***',
    'Fountain of Youth (Apple)*',
    'Andor S2 (Disney)***',
    'Mission: Impossible – The Final Reckoning***',
    'Zero Day (Netflix)***',
    '1923 S2 (Paramount)**',
    'White Lotus S3 (Max)***',
    'Drive to Survive S7 (Netflix)***',
    'Reacher S3 (Prime)**',
    'Anora (Hulu)**',
    'Prime Target (Apple)**',
    'Beast Games (Prime)***',
    'Paradise (Hulu)***',
    'The Gorge (Apple)***',
    'The Recruit S2 (Netflix)***',
    'The Night Agent S2 (Netflix)**',
    'You\'re Cordially Invited (Prime)**',
    'The Agency (Paramount)***',
    'The Diplomat S2 (Netflix)***',
    'Landman (Paramount)***',
    'Shrinking S2 (Apple)***',
    'Carry On (Netflix)**',
    'Black Doves (Netflix)***',
    'Day of the Jackal (Peacock)***',
    'Yellowstone S5 P2 (Paramount)***',
    'Senna (Netflix)**',
    'Lioness S2 (Paramount)***',
    'Deadpool & Wolverine (Disney)**',
    'Twisters (Peacock)**',
    'The Penguin (Max)**',
    'Disclaimer (Apple)***',
    'Lincoln Lawyer S3 (Netflix)**',
    'Wolfs (Apple)**',
    'Bad Monkey (Apple)***',
    'Slow Horses S4 (Apple)***',
    'Nobody Wants This (Netflix)***',
    'Rings of Power S2 (Prime)**',
    'Industry S3 (Max)***'
  ]
};

const TODD_DATA = {
  topShows: [
    'Slow Horses s1 Apple',
    'Department Q, Netflix ***',
    'Terminal List, Dark Wolf, Netflix ***'
  ],
  needToWatch: [
    'Bear - Hulu',
    'The Madness',
    'Ballard, prime'
  ],
  currentlyWatching: [
    'Task, HBO',
    'Peacemaker S2'
  ],
  watched: [
    'Rebel Moon 2 - Netflix *',
    'Finch - Apple *',
    'Masters of the Air - ***',
    'Dune 2 - ***',
    'The Ministry of Ungentlemanly Warfare - rent it ***',
    'AK-47 Kalashnikov - Prime - **',
    'Sugar - Apple ***',
    'Guilded Age - HBO ***',
    'True Detective - HBO **',
    'Slow Horses - Apple ***',
    'Fargo seasons 4 and 5 Hulu ***',
    'Reacher - Prime ***',
    'Killing Eve - Netflix ***',
    'Bad Sisters - Apple **',
    'Slow Horses season 2 - Apple ***',
    'Bad Monkey - Apple ***',
    'Lord of the Rings, rings of power s. 2***',
    'Loot seasons 1&2 Apple ****',
    'The Old Man Hulu ***',
    'Rebel Ridge - Netflix ***',
    'Lioness, Paramount ***',
    'Alex Cross, Prime ***',
    'Carry On, Netflix *',
    'Shrinking S2, Apple, ***',
    'The Six Triple Eight, Netflix, **',
    'The diplomat, Netflix, ***',
    'Yellowstone Season 5 -2, **',
    'Will and Harper, Netflix ***',
    'Landman, Paramount ***',
    'Fly me to the Moon, Apple ***',
    'Lioness season 2, Paramount, ***',
    'Dune series, HBO, **',
    'The Last of us - HBO **',
    'The Recruit season 2 - Netflix ***',
    'The Night Agent - Netflix ***',
    'The Starling movie - Netflix **',
    'Silo season 2 , Apple, ***',
    'Unfrosted, Netflix ***',
    'Number 24, Netflix, ***',
    'Fountain of Youth, Apple, **',
    'The Accountant 2, prime***',
    'Foundation of youth, Apple **',
    '1923 season 2, Paramount, ***',
    'White Lotus season 3, HBO **',
    'Mobland, Paramount ***',
    'Your Friends and Neighbors, Apple **',
    'Agency: Central Intelligence, Paramount  **',
    'Deep Cover, Prime ***',
    'Fubar S2, Netflix ***',
    'Heads of State, Prime **',
    'Happy Gilmore 2, Netflix **',
    'Department Q, Netflix ***',
    'Son of a Critch, Netflix ***',
    'Terminal List, Dark Wolf, Netflix ***',
    'Resident Alien S4, ***',
    'Star Trek S4 paramount +, **',
    'Acapulco S4, Apple, **'
  ]
};

const PAT_DATA = {
  topShows: [
    'Dune 2',
    'The Gentleman (Netflix) ***',
    'Lioness (Paramount+)***'
  ],
  needToWatch: [
    'Road House (Prime)',
    'Star Trek Discovery ()',
    'Three Body Problem (Netflix)'
  ],
  currentlyWatching: [
    'Fallout 4/11 (Amazon) **',
    'Mr. & Mrs. Smith (Prime) **',
    'Halo () **',
    'For all mandkind () **',
    'The Gentleman (Netflix) ***'
  ],
  watched: [
    'Argyle (Apple) **',
    'Invincible (Prime) ***',
    'Jack Reacher s2 (Prime)***',
    'GenV (Prime) ***',
    'TheBoys (Prime) ***',
    'Dune (HBO) ***',
    'PeaceMaker (HBO) ***',
    'Wonka () *',
    'Ferrari () *',
    'Saltburn () ***',
    'Creator () **',
    'Oppenheimer () ***',
    'Lioness (Paramount+)***',
    'Dune 2 () ***'
  ]
};

// Main processing function
async function processFriendData() {
  console.log('Starting TMDB fuzzy matching...\n');
  console.log('This will search TMDB for each show and display matches for confirmation.\n');

  const allData = {
    taylor: TAYLOR_DATA,
    todd: TODD_DATA,
    pat: PAT_DATA
  };

  const results = {};

  for (const [friend, data] of Object.entries(allData)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing ${FRIENDS[friend].display_name} (${FRIENDS[friend].username})`);
    console.log('='.repeat(60));

    results[friend] = {
      profile: FRIENDS[friend],
      topShows: [],
      shows: {
        want: [],
        watching: [],
        watched: [],
        paused: []
      }
    };

    // Process each category
    for (const [category, shows] of Object.entries(data)) {
      if (category === 'topShows') continue; // Handle separately

      console.log(`\n${category.toUpperCase()}:`);

      for (const showLine of shows) {
        const { title, network, recommendedBy, rating } = parseShowLine(showLine);

        // Search TMDB
        const match = await searchTMDB(title);

        if (match) {
          const matchedTitle = match.title || match.name;
          const year = (match.release_date || match.first_air_date || '').split('-')[0];
          const type = match.media_type;

          console.log(`✓ "${title}" → ${matchedTitle} (${year}) [${type}]`);

          const statusMap = {
            needToWatch: 'want',
            currentlyWatching: 'watching',
            watched: 'watched',
            paused: 'watching' // Paused shows are in "watching" with paused flag
          };

          results[friend].shows[statusMap[category]].push({
            tmdb_id: match.id,
            media_type: type,
            title: matchedTitle,
            poster_path: match.poster_path,
            rating: rating,
            status: statusMap[category],
            paused: category === 'paused',
            recommended_by: recommendedBy
          });
        } else {
          console.log(`✗ "${title}" → NO MATCH FOUND`);
        }

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  for (const [friend, data] of Object.entries(results)) {
    console.log(`\n${FRIENDS[friend].display_name}:`);
    console.log(`  Want to Watch: ${data.shows.want.length}`);
    console.log(`  Watching: ${data.shows.watching.filter(s => !s.paused).length}`);
    console.log(`  Paused: ${data.shows.watching.filter(s => s.paused).length}`);
    console.log(`  Watched: ${data.shows.watched.length}`);
    console.log(`  TOTAL: ${data.shows.want.length + data.shows.watching.length + data.shows.watched.length}`);
  }

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    '/Users/Nick/Desktop/Been Watching Cursor/been-watching-v2/scripts/friend-data-matches.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n\nResults saved to: scripts/friend-data-matches.json');
  console.log('\nNext step: Review the matches and then run the SQL generation script.');
}

// Run if called directly
if (require.main === module) {
  processFriendData().catch(console.error);
}

module.exports = { processFriendData, FRIENDS, TAYLOR_DATA, TODD_DATA, PAT_DATA };

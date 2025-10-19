/**
 * BOOZEHOUNDS APPLE NOTES MIGRATION SCRIPT
 *
 * This script imports watch data from the Apple Notes export
 *
 * Usage:
 *   node scripts/migrate-apple-notes.js [--dry-run] [--user username]
 *
 * Options:
 *   --dry-run      Don't actually import, just show what would be imported
 *   --user         Only import for specific user (murtopia, Toddles, Taylor.Murto, Mossy)
 */

const fs = require('fs')
const path = require('path')

// Star rating mapping
const RATING_MAP = {
  '*': 'meh',
  '**': 'like',
  '***': 'love'
}

// Parse the Apple Notes data
const APPLE_NOTES_DATA = `
Nick Needs to watch
Fargo s2
Fargo s3
Confess Fletch
Loudermilk
Life of Beth
End of Watch
Last of Us
Welcome to Wrexham
Smithsonian's Spy Wars (Paramount+)
Homicide (Peacock)
Ferrari (Hulu)
Prey (Hulu)
Oxford Blues
Fleabag
Dark (Netflix)
Sour Grapes
Woman of the Hour. Netlix.
Field to Fire
Moonstruck.
Will and Harper (Netflix)
Alone (History?)
30 for 30. Lance Armstrong.
Camp Revamp.
Lion (movie)
Workaholics
Mickey 17
Gangs of London
Hacks. (HBO)
Sicaro.
Justified.
Alien Earth : fx/hulu
Gold & Greed: The Hunt for Fenn's Treasure" which is available on Netflix.
The Ultimatum (Netflix)
King of the Hill reboot (Hulu)

Nick Currently Been Watching
The Penguin (Max)
Shrinking S2 (Apple)
1923 s1 (Paramount)
Law and Order: organized crime s1
Silo (Apple)
Pee-Wee as Himself (Max)
The Better Sister (Prime)
Terminal List s2 (Prime)
Acapulco s4 (Apple)
Peacemaker S2 (HBO)
Tulsa King s3 (Paramount)
Black Rabbit (Netflix)
Slow Horses s5 (apple)

Nick Done Watching
Jack Reacher s2 (Prime)**
Monarch (Apple)***
Slow Horses s3 (Apple)***
Fargo s5 ***
The Brother's Sun (Netflix) ***
Rebel Moon (Netflix)**
Mr. & Mrs. Smith (Prime) **
Lawmen Bass Reaves (Paramount+)***
Lioness (Paramount+)***
Rabbit Hole (Paramount+)***
Napoleon (Apple)*
The Gentleman - Netflix***
Roadhouse (Prime)*** 3//28/24
Tokyo Vice S1 (Max)*** 3/20/24
Tokyo Vice S2 (Max)***
Argyle (Apple)*
Ricky Stanicky (Prime)*
Rebel Moon: Part 2 (Netflix)***
The Diplomat s1 (Netflix?)***
Dune Part Two (Apple)**
Solo (Disney+)**
Tournament of Champions S5 (Max)**
Asteroid City (movie, Prime)***
Fool Me Once (Netflix)***
3 Body Problem (Netflix)***
The Infiltrator (Movie 2016)***
Fallout (Amazon)***
The Ministry of Ungentlemanly Warfare (movie) ***
Fall Guy (movie)***
Drops of God (apple + a while back)***
Sugar (AppleTV)***
Killing Eve S1 (Netflix)***
Killing Eve S2 (Netflix)**
Top Chef Wisconsin (Peacock)**
Acapulco S3 (Apple+)***
Dark Matter (Apple+)***
Killing Eve S3 (Netflix)***
Land of Bad (Netflix)**
Killing Eve S4 (Netflix)***
Lift (Netflix)*
Curb Your Enthusiasm s12 (Max)**
The Boys s4 (Prime)***
The Beekeeper (Prime)**
The Instigators (Apple)**
Presumed Innocent (Apple)***
Jackpot (Prime)*** also its dumb but funny
Furiosa: A Mad Max Saga (Max)***
Treason (Netflix)***
Rebel Ridge (Netflix)***
The American Society of Magical Negros (movie)**
The Perfect Couple *** (Netflix)***
Nobody Wants This (Netflix)***
Wolfs (Apple)**
Slow Horses S4 (Apple)***
Bad Monkey (Apple)***
The Old Man S1 (Hulu)***
Tulsa King S2 (Paramount+)***
The Lincoln Lawyer S2 (Netflix)***
The Diplomat (Netflix)***
Deadpool & Wolverine (Disney)**
Disclaimer (Apple) ***
The Old Man S2 (Hulu)***
Cowboy Bourbon (Prime)**
The Crow (new movie)**
The Diplomat s3 (Netflix?)***
Carry On (Netflix)**
Lioness S2 (Paramount+)***
Landman  (Paramount+)***
Day of the Jackal (Peacock)***
Black Doves (Netflix)***
Dazed and Confused (movie)**
Window Cliquot (Netflix)**
Emilia Perez (Netflix)*
Beast Games (Prime)***
Zero Day (Netflix)***
Paradise (hulu)***
The Agency (Paramount+)***
The Recruit s2 (Netflix)***
Goliath (eff. Prime)***
White Lotus s3 (max)***
Reacher s3 (Prime)**
Number 24 Movie (Netflix)***
Righteous Gemstones s4 (Max)***
The Recruit s2 (Netflix)***
The Fountain of Youth (Apple) minus*
MobLand (Paramount)***
FUBAR! (Netflix)***
Sirens (Netflix)**
Heads of State (Movie: Prime)***
Shark Whisperer (Netflix)**
Hidden Strike (Netflix)*
The Studio (Apple)**
Happy Gilmore (Netflix)**
Hostage (Netflix)**
F1 (Movie)
Havoc (Netflix)***
The Night Agent s2 (Netflix)**
`;

// This would continue with all the other users' data...

// Parse a line to extract show name, rating, and metadata
function parseLine(line) {
  line = line.trim()
  if (!line) return null

  // Extract rating
  let rating = null
  const ratingMatch = line.match(/(\*+)/)
  if (ratingMatch) {
    rating = RATING_MAP[ratingMatch[1]] || null
  }

  // Remove rating from line
  let cleanLine = line.replace(/\*+/g, '').trim()

  // Extract season info if present
  const seasonMatch = cleanLine.match(/\bs(\d+)\b/i) || cleanLine.match(/season\s*(\d+)/i)
  const seasonNumber = seasonMatch ? parseInt(seasonMatch[1]) : null

  // Remove season indicators
  cleanLine = cleanLine.replace(/\bs\d+\b/gi, '').replace(/season\s*\d+/gi, '').trim()

  // Extract network/platform in parentheses
  const networkMatch = cleanLine.match(/\(([^)]+)\)/)
  const network = networkMatch ? networkMatch[1] : null

  // Remove network from line
  cleanLine = cleanLine.replace(/\([^)]+\)/g, '').trim()

  // Remove trailing punctuation and extra info
  cleanLine = cleanLine.replace(/\d{1,2}\/\/\d{1,2}\/\d{2,4}/g, '').trim() // Remove dates
  cleanLine = cleanLine.replace(/[,.-]\s*$/g, '').trim()

  // Detect if it's a movie
  const isMovie = /\b(movie|film)\b/i.test(cleanLine) || /\b(movie|film)\b/i.test(line)
  cleanLine = cleanLine.replace(/\b(movie|film)\b/gi, '').trim()

  return {
    title: cleanLine,
    rating,
    seasonNumber,
    network,
    isMovie,
    originalLine: line
  }
}

// Parse all data for a user
function parseUserData(username, dataText) {
  const lines = dataText.trim().split('\n')
  const shows = {
    want: [],
    watching: [],
    watched: []
  }

  let currentStatus = null

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect section headers
    if (trimmed.includes('Need to watch') || trimmed.includes('Needs to watch')) {
      currentStatus = 'want'
      continue
    }
    if (trimmed.includes('Currently Been Watching')) {
      currentStatus = 'watching'
      continue
    }
    if (trimmed.includes('Done Watching')) {
      currentStatus = 'watched'
      continue
    }

    // Skip headers and empty lines
    if (!trimmed || trimmed.includes('——————') || trimmed.match(/^[A-Z\s]+:$/)) {
      continue
    }

    if (currentStatus) {
      const parsed = parseLine(trimmed)
      if (parsed && parsed.title) {
        shows[currentStatus].push(parsed)
      }
    }
  }

  return shows
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const userFilter = args.find(arg => arg.startsWith('--user='))?.split('=')[1]

  console.log('═══════════════════════════════════════════')
  console.log('  🍺 BOOZEHOUNDS DATA MIGRATION 🍺')
  console.log('═══════════════════════════════════════════\n')

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No data will be imported\n')
  }

  // For now, let's just test parsing Nick's data
  console.log('Parsing Nick\'s data...\n')

  const nickData = parseUserData('murtopia', APPLE_NOTES_DATA)

  console.log('📊 NICK\'S DATA SUMMARY:')
  console.log(`  Want to watch: ${nickData.want.length} shows`)
  console.log(`  Currently watching: ${nickData.watching.length} shows`)
  console.log(`  Done watching: ${nickData.watched.length} shows`)
  console.log(`  TOTAL: ${nickData.want.length + nickData.watching.length + nickData.watched.length} shows\n`)

  // Show sample
  console.log('Sample "Done Watching" shows:')
  nickData.watched.slice(0, 10).forEach(show => {
    console.log(`  - ${show.title}${show.rating ? ` [${show.rating}]` : ''}${show.seasonNumber ? ` (Season ${show.seasonNumber})` : ''}${show.network ? ` - ${show.network}` : ''}`)
  })

  console.log('\n✅ Parsing complete!')
  console.log('\nNext steps:')
  console.log('  1. Review the parsed data above')
  console.log('  2. I\'ll add TMDB matching next')
  console.log('  3. Then we\'ll do a dry-run to review all matches')
  console.log('  4. Finally, import the data!\n')
}

main().catch(console.error)

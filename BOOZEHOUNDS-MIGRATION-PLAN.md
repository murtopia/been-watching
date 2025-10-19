# 🍺 BOOZEHOUNDS MIGRATION PLAN

## Current Status (October 18, 2025)

### ✅ Completed
- Service role key added to `.env.local`
- Nick's profile updated to 'boozehound' tier
- Setup script created (`scripts/setup-boozehounds.js`)
- Migration parser working (`scripts/migrate-apple-notes.js`)
- Apple Notes data successfully parsed (144 shows for Nick)

### ⏳ In Progress
- TMDB matching system (needs to be built)
- Friends haven't signed up yet

## 🎯 Next Steps

### Step 1: Friends Sign Up
Have Todd, Taylor, and Pat sign up using Google OAuth with the BOOZEHOUND code:
- **Todd**: toddw493@gmail.com
- **Taylor**: taylormurto@gmail.com
- **Pat**: moss.pat@gmail.com

### Step 2: Run Setup Script
After they sign up, run:
```bash
node scripts/setup-boozehounds.js
```

This will:
- Update their profiles to 'boozehound' tier
- Set up mutual follows between all 4 of you
- Prepare them for data migration

### Step 3: Build TMDB Matching System
The migration script needs to:
1. Parse each show name from Apple Notes
2. Search TMDB API for matches
3. Handle TV shows with seasons vs full series
4. Match movies correctly
5. Generate a review list of uncertain matches

### Step 4: Complete Migration Script
Need to finish `scripts/migrate-apple-notes.js` with:
- Full TMDB API integration
- Dry-run mode to preview matches
- Actual import functionality
- Handle all 4 users' data

### Step 5: Review & Import
1. Run dry-run to see all matches
2. Review problematic matches
3. Fix any issues
4. Run actual import

### Step 6: Celebrate! 🎉
Everyone logs in and sees all their shows!

## 📝 Apple Notes Data Summary

### Nick (murtopia)
- Want to watch: 34 shows
- Currently watching: 13 shows
- Done watching: 97 shows
- **TOTAL: 144 shows**

### Todd (Toddles)
- Want to watch: ~3 shows
- Currently watching: ~2 shows
- Done watching: ~60 shows
- **TOTAL: ~65 shows**

### Taylor (Taylor.Murto)
- Want to watch: ~5 shows
- Currently watching: ~6 shows
- Done watching: ~120 shows
- **TOTAL: ~131 shows**

### Pat (Mossy)
- Want to watch: ~3 shows
- Currently watching: ~5 shows
- Done watching: ~15 shows
- **TOTAL: ~23 shows**

**GRAND TOTAL: ~363 shows to migrate!**

## 🔧 Technical Details

### Rating Mapping
- `*` (Meh) → `meh`
- `**` (Liked) → `like`
- `***` (Loved) → `love`

### Status Mapping
- "Need to watch" / "Needs to watch" → `want`
- "Currently Been Watching" → `watching`
- "Done Watching" → `watched`

### Special Cases to Handle
1. **Season-specific shows**: "Fargo s5" → Fargo Season 5
2. **Duplicate entries**: If Nick already added a show, skip it
3. **Movies vs TV**: Detect based on keywords and TMDB response
4. **Network info**: Extract but don't rely on for matching
5. **Missing info**: Some shows have minimal data

### Scripts Created
- `setup-boozehounds.js` - Creates profiles and follows
- `migrate-apple-notes.js` - Parses and imports show data (incomplete)
- `check-schema.js` - Utility to check database structure
- `check-nick-profile.js` - Utility to view profile data

## 🚨 Important Notes

1. **Service Role Key**: Keep the `SUPABASE_SERVICE_ROLE_KEY` secret! Don't commit it to git.

2. **User Creation**: We can't create auth users until people sign up with Google OAuth. The setup script will update their profiles after they sign up.

3. **Duplicate Handling**: The migration will skip any shows Nick already has in his database.

4. **TMDB API**: We have the key in `.env.local` - rate limit is 40 requests/10 seconds.

5. **Testing**: Always run with `--dry-run` first to preview before actual import!

## 📞 Next Session TODO

When you continue working on this:

1. **Complete the TMDB matching logic** in `migrate-apple-notes.js`
2. **Parse all 4 users' data** (currently only Nick's is in the script)
3. **Add actual database import** functionality
4. **Test with a few shows** first before full import
5. **Handle edge cases** (shows not found, multiple matches, etc.)

## 🎁 The Surprise

Once complete, your friends will:
1. Receive invite link from you
2. Sign up with Google OAuth using BOOZEHOUND code
3. Log in and see ALL their shows already tracked with ratings!
4. See they're already following all the Boozehounds
5. Be amazed! 🤯

---

**Last Updated**: October 18, 2025
**Status**: Ready for TMDB matching implementation

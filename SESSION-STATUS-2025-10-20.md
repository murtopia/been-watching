# Session Status - October 20, 2025

## Overview
Major session focused on fixing OAuth authentication flow, implementing invite code validation, and creating a proper landing page for the application.

---

## ✅ COMPLETED TODAY

### 1. Fixed OAuth Authentication Flow
**Problem**: OAuth users (Google login) were bypassing invite code validation and going straight to the app.

**Solution**:
- Updated database trigger to set `is_approved = false` by default for new users
- Created `InviteCodeGate` component that appears after OAuth login
- Users must enter "BOOZEHOUND" (or other valid invite code) before accessing the app

**Files Modified**:
- `supabase/fix-auto-create-profile-v2.sql` - Enhanced trigger with `SECURITY DEFINER` and `is_approved = false`
- `components/onboarding/InviteCodeGate.tsx` - NEW: Modal for entering invite codes
- `components/onboarding/ProfileSetup.tsx` - Fixed styling (replaced broken Tailwind with inline styles)
- `app/page.tsx` - Updated logic to show InviteCodeGate if `!is_approved`

**SQL to Run in Supabase** (ALREADY RUN):
```sql
-- This creates the trigger that auto-creates profiles for new OAuth users
-- See: supabase/fix-auto-create-profile-v2.sql for full script
```

### 2. Created Welcome Landing Page
**Problem**: Users landing at the root URL had no context about what Been Watching is.

**Solution**:
- Created `/welcome` page as new entry point for unauthenticated users
- Beautiful liquid glass design showcasing features
- Two clear CTAs: "Join Waitlist" or "I Have a Code"

**Files Created**:
- `app/welcome/page.tsx` - NEW: Landing page with feature showcase

**Files Modified**:
- `app/page.tsx` - Redirects unauthenticated users to `/welcome` instead of `/auth`
- `app/auth/page.tsx` - Added "Back" button to return to `/welcome`
- `app/waitlist/page.tsx` - Added "Back" button to return to `/welcome`

### 3. Fixed ProfileSetup Modal Styling
**Problem**: ProfileSetup used broken Tailwind classes (`glass-card`, `bg-gradient-primary`) that didn't exist.

**Solution**: Replaced all Tailwind classes with inline styles matching the liquid glass aesthetic.

### 4. Created Migration Scripts
Created migration scripts for importing watch data from Apple Notes:

**Files Created**:
- `scripts/migrate-taylor.js` - Migrates ~131 shows for taylormurto@gmail.com
- `scripts/migrate-todd.js` - Migrates ~65 shows for toddw493@gmail.com
- `scripts/migrate-pat.js` - Migrates ~23 shows for moss.pat@gmail.com

**How to Run** (after users sign up):
```bash
chmod +x scripts/migrate-*.js
node scripts/migrate-taylor.js
node scripts/migrate-todd.js
node scripts/migrate-pat.js
```

---

## 🔄 CURRENT OAUTH FLOW (WORKING)

1. User visits `https://been-watching-v2.vercel.app` → Redirected to `/welcome`
2. User clicks **"I Have a Code"** → Goes to `/auth`
3. User clicks **"Continue with Google"** → Google OAuth
4. **Database trigger fires**: Creates profile with `is_approved = false`
5. **InviteCodeGate appears**: User must enter "BOOZEHOUND"
6. After code validated: `is_approved = true`, `invited_by_master_code = 'BOOZEHOUND'`, `invite_tier = 'boozehound'`
7. **ProfileSetup appears**: User chooses username (duplicate checking enabled) and display name
8. **Home feed loads** ✅

---

## 📋 IMMEDIATE NEXT STEPS

### Step 1: Have Taylor, Todd, Pat Sign Up
Send them this link: `https://been-watching-v2.vercel.app`

**They should**:
1. Click "I Have a Code"
2. Sign up with Google OAuth using their emails:
   - Taylor: taylormurto@gmail.com
   - Todd: toddw493@gmail.com
   - Pat: moss.pat@gmail.com
3. Enter invite code: **BOOZEHOUND**
4. Choose their username and display name

### Step 2: Run Migration Scripts
After all three have signed up, run their migration scripts:

```bash
cd /Users/Nick/Desktop/Been\ Watching\ Cursor/been-watching-v2
node scripts/migrate-taylor.js
node scripts/migrate-todd.js
node scripts/migrate-pat.js
```

### Step 3: Set Up Custom Domain (Tomorrow)
- Point BeenWatching.com to Vercel (DNS access available tomorrow)
- Update Supabase redirect URLs to include custom domain
- Update Google OAuth redirect URLs

---

## 🔧 IMPORTANT TECHNICAL DETAILS

### Database Trigger
The trigger `on_auth_user_created` automatically creates a profile when a user signs up via OAuth:

```sql
-- Located in: supabase/fix-auto-create-profile-v2.sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Key settings**:
- `SECURITY DEFINER` - Runs with admin privileges to insert into profiles table
- Sets `is_approved = false` by default - Forces invite code requirement
- Extracts username/display_name from Google OAuth metadata

### Invite Code Validation
Invite codes are validated using Supabase RPC functions:

```javascript
// Check if code is valid
const { data } = await supabase.rpc('is_master_code_valid', {
  master_code: 'BOOZEHOUND'
})

// Use the code (marks it as used)
await supabase.rpc('use_master_code', {
  master_code: 'BOOZEHOUND',
  user_id: userId
})
```

### Username Duplicate Checking
ProfileSetup checks for duplicates before saving:

```javascript
// Query to check if username exists
const { data: existingUser } = await supabase
  .from('profiles')
  .select('username')
  .eq('username', username.toLowerCase())
  .single()

if (existingUser) {
  setError('Username is already taken')
  return
}
```

---

## 🐛 KNOWN ISSUES (Non-Breaking)

### Next.js 15 Warnings
You'll see many warnings about `params` in the console:
```
Error: Route "/api/tmdb/[type]/[id]/videos" used `params.type`.
`params` should be awaited before using its properties.
```

**Impact**: None - these are Next.js 15 deprecation warnings, not breaking errors
**Fix**: Can be addressed later by adding `await` before accessing params

---

## 📁 KEY FILES REFERENCE

### Authentication Flow
- `app/welcome/page.tsx` - Landing page
- `app/auth/page.tsx` - Login/signup page
- `app/api/auth/callback/route.ts` - OAuth callback handler
- `components/onboarding/InviteCodeGate.tsx` - Invite code validation
- `components/onboarding/ProfileSetup.tsx` - Username/profile setup

### Database
- `supabase/fix-auto-create-profile-v2.sql` - Profile creation trigger

### Migration
- `scripts/migrate-taylor.js` - Taylor's watch data
- `scripts/migrate-todd.js` - Todd's watch data
- `scripts/migrate-pat.js` - Pat's watch data
- `Taylor been watching migration data.txt` - Source data
- `Todd been watching migration data.txt` - Source data
- `Pat been watching migration data.txt` - Source data

---

## 🔐 ENVIRONMENT VARIABLES

Current environment is configured in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://udfhqiipppybkuxpycay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[redacted]
SUPABASE_SERVICE_ROLE_KEY=[redacted]

# TMDB API
TMDB_API_KEY=99b89037cac7fea56692934b534ea26a

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local only
```

**Production**: Environment variables are set in Vercel dashboard

---

## 🚀 DEPLOYMENT

### Current Setup
- **Repository**: https://github.com/murtopia/been-watching
- **Hosting**: Vercel
- **Production URL**: https://been-watching-v2.vercel.app
- **Custom Domain**: BeenWatching.com (not configured yet)

### To Deploy
Changes auto-deploy when pushed to GitHub:
```bash
git add -A
git commit -m "Your message"
git push
```

Vercel will automatically build and deploy.

---

## 🎯 USER ACCOUNTS

### Current Users
- **Nick (murtopia)**: Main account with 131 shows
  - Email: nick.murto@gmail.com
  - Status: Active, approved

### Test Accounts
- **Test Account**: nick.murto@gmail.com
  - Can reset with SQL: `UPDATE profiles SET is_approved = false WHERE id = (SELECT id FROM auth.users WHERE email = 'nick.murto@gmail.com');`

### Pending Signups
- **Taylor**: taylormurto@gmail.com (131 shows ready to migrate)
- **Todd**: toddw493@gmail.com (65 shows ready to migrate)
- **Pat**: moss.pat@gmail.com (23 shows ready to migrate)

---

## 📊 PROJECT STATS

- **Total Shows to Migrate**: ~363 shows across 4 users
- **Invite Code**: BOOZEHOUND (master code, unlimited uses)
- **Current Version**: v0.1.0 Alpha
- **Tech Stack**: Next.js 15, Supabase, TMDB API, Vercel

---

## 🔄 IF SOMETHING BREAKS

### Taylor Can't Sign Up
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify trigger exists:
   ```sql
   SELECT trigger_name FROM information_schema.triggers
   WHERE trigger_name = 'on_auth_user_created';
   ```
3. Re-run trigger SQL if needed: `supabase/fix-auto-create-profile-v2.sql`

### InviteCodeGate Not Showing
1. Check user's profile in Supabase:
   ```sql
   SELECT is_approved FROM profiles
   WHERE id = (SELECT id FROM auth.users WHERE email = 'user@email.com');
   ```
2. Should be `false` for new users
3. If `true`, reset: `UPDATE profiles SET is_approved = false WHERE id = '[user-id]';`

### Migration Script Fails
1. Verify user signed up and profile exists
2. Check email matches exactly in script
3. Run with error output: `node scripts/migrate-taylor.js 2>&1 | tee migration.log`

---

## 📝 NOTES FOR NICK

- **DNS Access Tomorrow**: Can set up BeenWatching.com custom domain
- **IT Guys**: Purchased the domain, will have access to DNS settings tomorrow
- **Main User**: murtopia (that's you!)
- **Design Aesthetic**: Liquid glass (translucent cards, blur effects, gradient accents)
- **No Coding Ability**: You're a designer - Claude provides detailed step-by-step instructions

---

## 🎨 DESIGN SYSTEM

### Colors
- **Primary Gradient**: `linear-gradient(135deg, #e94d88 0%, #f27121 100%)`
- **Background (Light)**: `linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)`
- **Background (Dark)**: `linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)`
- **Card Background (Light)**: `rgba(255, 255, 255, 0.95)`
- **Card Background (Dark)**: `rgba(255, 255, 255, 0.05)`

### Ratings
- **Love**: `#FF2D55` (3 stars ***)
- **Like**: `#007AFF` (2 stars **)
- **Meh**: `#8E8E93` (1 star *)

### Watch Status
- **Want**: User wants to watch
- **Watching**: Currently watching
- **Watched**: Finished watching

---

## 🔗 IMPORTANT LINKS

- **Production App**: https://been-watching-v2.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard (project: udfhqiipppybkuxpycay)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/murtopia/been-watching
- **TMDB API**: https://www.themoviedb.org/settings/api

---

## ✅ SESSION SUMMARY

Today we successfully:
1. ✅ Fixed OAuth authentication to require invite codes
2. ✅ Created beautiful welcome landing page
3. ✅ Fixed ProfileSetup modal styling
4. ✅ Created migration scripts for 3 friends
5. ✅ Tested complete signup flow end-to-end
6. ✅ Deployed all changes to production

**Status**: Ready for Taylor, Todd, and Pat to sign up!

---

*Last Updated: October 20, 2025 at 2:30 AM*
*Session by: Claude (Sonnet 4.5)*

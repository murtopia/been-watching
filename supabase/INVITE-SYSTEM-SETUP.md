# Launch Invite System Setup Guide

## What Was The Problem?

You were getting the error: `ERROR: 42703: column "code" does not exist`

**Root Cause**: Your database already had an `invites` table (for friend-to-friend invites), but we were trying to create a new `invites` table for master codes (BOOZEHOUND, BWALPHA), causing a naming conflict.

## The Solution

We renamed everything to avoid conflicts:
- Old conflicting table: `invites` (already exists for friend invites)
- **New table**: `master_codes` (for BOOZEHOUND, BWALPHA, etc.)
- **New view**: `admin_master_code_stats` (for admin dashboard)
- **New functions**: `is_master_code_valid()`, `use_master_code()`, `create_bwalpha_code()`

## Setup Instructions

### Step 1: Run the Migration

1. Go to your Supabase project
2. Click on **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of `/supabase/add-launch-invite-system.sql`
5. Click **Run**

You should see success messages like:
```
✅ Launch invite system migration completed successfully!
📝 BOOZEHOUND code created (unlimited uses)
🎯 To generate a BWALPHA code, run: SELECT create_bwalpha_code();
```

### Step 2: Generate Your First BWALPHA Code

In the same SQL Editor, run:
```sql
SELECT create_bwalpha_code();
```

This will return something like: `BWALPHA_K3H9N2P7`

You can run this command 5 times to create the 5 BWALPHA codes you need for your social media launch.

### Step 3: Test the System

#### Test Signup Flow:
1. Visit `http://localhost:3000/auth`
2. Click "Sign up"
3. Enter email/password
4. Use invite code: `BOOZEHOUND` or one of your `BWALPHA_XXXXXXXX` codes
5. Create account

#### Test Waitlist:
1. Visit `http://localhost:3000/waitlist`
2. Enter email
3. Check position number

#### Test Admin Dashboard:
1. Visit `http://localhost:3000/admin`
2. View all master codes and their usage
3. Create new codes using the buttons

## What Was Created

### New Database Tables

#### 1. `master_codes`
Tracks all launch invite codes:
- `BOOZEHOUND` - unlimited uses
- `BWALPHA_XXXXXXXX` - 5 uses each
- Future codes you create

#### 2. `waitlist`
Collects emails from people without codes:
- Auto-assigns position numbers
- Tracks who gets converted to users
- **Admin Management:** `/admin/invites/waitlist`
  - View all signups with search/filter
  - Send invites (generates `BW-XXXXXXXX` codes)
  - Delete spam entries
  - Export to CSV

### New Profile Columns

Added to `profiles` table:
- `invited_by_master_code` - which code was used (BOOZEHOUND, BWALPHA_XXX)
- `invite_tier` - boozehound, alpha, or beta
- `invites_remaining` - how many friend invites they can send
- `invites_used` - how many they've sent
- `is_approved` - for waitlist approval flow

### Invite Allocation

When someone signs up:
- **BOOZEHOUND** users get: 10 friend invites
- **BWALPHA** users get: 3 friend invites
- **Beta** users get: 0 friend invites (for now)

## Pages Created

1. **[/app/auth/page.tsx](../app/auth/page.tsx)** - Signup/Login with invite code validation
2. **[/app/waitlist/page.tsx](../app/waitlist/page.tsx)** - Email collection for people without codes
3. **[/app/admin/page.tsx](../app/admin/page.tsx)** - Admin dashboard to manage codes
4. **[/app/profile/page.tsx](../app/profile/page.tsx)** - Updated to show remaining invites

## Verify Everything Works

After running the migration, check these queries in SQL Editor:

### Check BOOZEHOUND code exists:
```sql
SELECT * FROM master_codes WHERE code = 'BOOZEHOUND';
```

### Check all master codes:
```sql
SELECT * FROM admin_master_code_stats;
```

### Check profile columns exist:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('invited_by_master_code', 'invite_tier', 'invites_remaining');
```

## Next Steps

1. ✅ Run the migration (`add-launch-invite-system.sql`)
2. ✅ Generate 5 BWALPHA codes
3. ✅ Test signup with BOOZEHOUND
4. ✅ Test signup with BWALPHA code
5. ✅ Test waitlist
6. Share codes with Taylor, Pat, Todd, and your social media followers!

## Troubleshooting

### "Function does not exist" error
Make sure you ran the full migration - the functions are created at the bottom of the file.

### "Table already exists" error
This is fine! The migration uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data.

### Can't see invite codes in admin dashboard
Make sure you're logged in and the view has permissions. The migration grants `SELECT` access to authenticated users.

### BOOZEHOUND code says "invalid"
Check that it was inserted:
```sql
SELECT * FROM master_codes WHERE code = 'BOOZEHOUND';
```

If it's missing, insert it manually:
```sql
INSERT INTO master_codes (code, type, max_uses, is_active)
VALUES ('BOOZEHOUND', 'master_unlimited', NULL, true);
```

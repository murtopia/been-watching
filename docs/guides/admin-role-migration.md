# Admin Role System - Migration Instructions

**Created:** November 2, 2025
**Status:** Ready to Execute
**Estimated Time:** 5 minutes

---

## 🎯 What This Migration Does

Upgrades the admin system from a simple `is_admin` boolean to a sophisticated role-based access control system with three levels:

1. **Owner** (you) - Full control, can't be removed
2. **Admin** - Full access, can manage everything except ownership
3. **Analyst** - Read-only access, can view and export data but can't make changes

---

## 📋 Pre-Migration Checklist

Before running the migration, verify:

- [ ] You know your username in the database
- [ ] You have Supabase CLI installed (`npx supabase --version`)
- [ ] You're in the `/been-watching-v2` directory
- [ ] Dev server is running (for testing after)

---

## 🚀 Migration Steps

### Step 1: Review the Migration

The migration file is located at:
```
/supabase/migrations/20251102_add_admin_role_system.sql
```

It will:
- ✅ Add `admin_role` column to `profiles`
- ✅ Add `last_active_at` tracking
- ✅ Create `admin_role_history` audit table
- ✅ Add performance indexes for search/filtering
- ✅ Enable fuzzy search with pg_trgm
- ✅ Add RLS policies for security
- ✅ Create trigger to track last active time

**Note:** It will NOT automatically migrate existing `is_admin` data. That's done manually in Step 3.

### Step 2: Run the Migration

```bash
cd /Users/Nick/Desktop/Been\ Watching\ Cursor/been-watching-v2
npx supabase db push
```

You should see output like:
```
Applying migration 20251102_add_admin_role_system.sql...
Migration complete!
```

### Step 3: Set Your User as Owner

**IMPORTANT:** Replace `'murtopia'` with your actual username!

```sql
-- Connect to your Supabase database and run:

-- Step 3a: Find your username first (if you don't know it)
SELECT username, is_admin FROM profiles WHERE is_admin = TRUE;

-- Step 3b: Set yourself as Owner
UPDATE profiles
SET admin_role = 'owner'
WHERE username = 'murtopia'; -- ⚠️ CHANGE THIS TO YOUR USERNAME

-- Step 3c: Migrate other existing admins (if any)
UPDATE profiles
SET admin_role = 'admin'
WHERE is_admin = TRUE
AND admin_role IS NULL; -- Only update users who aren't already assigned a role

-- Step 3d: Verify it worked
SELECT username, is_admin, admin_role FROM profiles WHERE admin_role IS NOT NULL;
```

Expected output:
```
username    | is_admin | admin_role
------------|----------|------------
murtopia    | true     | owner
(or your username)
```

### Step 4: Test the Migration

1. **Refresh your browser** at http://localhost:3000/admin
2. **Check that you still have access** to the admin console
3. **Try navigating** to different admin pages (Users, Analytics, etc.)

If you see any errors:
- Check the browser console (F12)
- Check the server logs
- Verify Step 3 worked correctly

### Step 5: Grant Test Roles (Optional)

If you want to test the Analyst role, create a test user:

```sql
-- Grant Analyst role to a test user
UPDATE profiles
SET admin_role = 'analyst'
WHERE username = 'test_analyst'; -- Replace with test username

-- Record the role change in history
INSERT INTO admin_role_history (user_id, changed_by_user_id, old_role, new_role, reason)
SELECT
  p1.id,
  p2.id,
  NULL,
  'analyst',
  'Testing analyst role functionality'
FROM profiles p1
CROSS JOIN profiles p2
WHERE p1.username = 'test_analyst'
AND p2.username = 'murtopia'; -- Your username
```

---

## 🧪 Testing Checklist

After migration, test these scenarios:

### As Owner:
- [ ] Can access /admin
- [ ] Can see user list at /admin/users
- [ ] Can see analytics
- [ ] (Soon) Can grant/revoke admin roles

### As Analyst (if testing):
- [ ] Can access /admin (read-only)
- [ ] Can see user list
- [ ] Can see analytics
- [ ] Cannot edit anything (all action buttons disabled)
- [ ] Cannot export data (export button disabled)
- [ ] Cannot delete, add, or modify anything

---

## 🔧 Files Created/Modified

### New Files:
1. `/supabase/migrations/20251102_add_admin_role_system.sql` - Database migration
2. `/utils/admin/permissions.ts` - Permission checking utilities
3. `ADMIN-USER-MANAGEMENT-UPGRADE.md` - Complete upgrade plan
4. This file - Migration instructions

### Modified:
- None yet (backwards compatible)

---

## 🔄 Rollback Plan

If something goes wrong, you can rollback:

```sql
-- Remove the admin_role column (will preserve is_admin)
ALTER TABLE profiles DROP COLUMN IF EXISTS admin_role;

-- Drop the history table
DROP TABLE IF EXISTS admin_role_history CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_admin_role;
DROP INDEX IF EXISTS idx_profiles_last_active;
DROP INDEX IF EXISTS idx_profiles_username_search;
DROP INDEX IF EXISTS idx_profiles_display_name_search;

-- Drop trigger
DROP TRIGGER IF EXISTS update_user_last_active ON activities;
DROP FUNCTION IF EXISTS update_last_active();
```

---

## 📊 Migration Impact

**Database Changes:**
- New columns: `admin_role`, `last_active_at` on `profiles`
- New table: `admin_role_history`
- New indexes: 6 total (for performance)
- New trigger: `update_last_active`

**Performance:**
- ✅ Improved: User list queries will be faster with indexes
- ✅ Improved: Search will be instant with trigram indexes
- ⚠️ Slight overhead: Trigger updates `last_active_at` on each activity

**Backwards Compatibility:**
- ✅ `is_admin` column is preserved
- ✅ Existing admin checks still work
- ✅ No breaking changes to current code

---

## 🐛 Troubleshooting

### Issue: "Permission denied for table profiles"
**Solution:** Make sure you're using the Supabase service role key (not anon key)

### Issue: "Column admin_role already exists"
**Solution:** The migration is idempotent. It's safe to run multiple times.

### Issue: "I can't access /admin anymore"
**Solution:** Check that you set your user as 'owner' in Step 3

### Issue: "Migration failed halfway"
**Solution:** Check Supabase logs. The migration is designed to be safe - you can re-run it.

---

## ✅ Post-Migration

After successful migration:

1. Update your team on the new role system
2. Keep `is_admin` column for now (backwards compatibility)
3. Plan to deprecate `is_admin` after full UI is built
4. Document who has what role

---

## 📞 Need Help?

If you encounter issues:
1. Check the server logs
2. Check Supabase dashboard → Database → Logs
3. Review this file for troubleshooting steps
4. Check ADMIN-USER-MANAGEMENT-UPGRADE.md for architecture details

---

## 🎉 Next Steps

After migration is complete:

**Phase 2: User List UI** (Week 2)
- Build paginated user list
- Add search and filters
- Add role badges

**Phase 3: Role Management** (Week 3)
- Build grant/revoke UI
- Add role management modals
- Show audit history

See `ADMIN-USER-MANAGEMENT-UPGRADE.md` for full timeline.

---

**Ready to proceed?** Start with Step 2 above! 🚀

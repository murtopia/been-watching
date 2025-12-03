# Setup Admin Settings Table

The `admin_settings` table is required for the streaming platforms management feature.

## Quick Setup

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/migrations/create-admin-settings-table.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

## What This Creates

- `admin_settings` table for storing application-wide settings
- RLS policies that allow:
  - Everyone to view settings (needed for feed filtering)
  - Only admins to insert/update settings
- Default setting for `feed_show_all_users`

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT * FROM admin_settings;
```

You should see at least one row with `setting_key = 'feed_show_all_users'`.

## Troubleshooting

If you get an error about `profiles.is_admin` not existing:
1. Run `supabase/add-admin-system.sql` first to add the `is_admin` column
2. Then run the admin_settings migration


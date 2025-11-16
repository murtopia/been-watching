# Admin User Management Upgrade Plan

**Date:** November 2, 2025
**Status:** Design Phase
**Priority:** High

---

## 🎯 Executive Summary

This document outlines a comprehensive upgrade to the admin user management system to support:
1. **Scalability** for thousands of users with pagination and optimized queries
2. **Role-Based Access Control (RBAC)** with a new "Viewer" role
3. **Enhanced admin capabilities** including grant/revoke admin functionality
4. **Best practices** from modern SaaS platforms (2024/2025 standards)

---

## 🔍 Current State Analysis

### What Exists Today

**File:** `/app/admin/users/page.tsx`

**Current Features:**
- ✅ Basic user list with avatars, usernames, display names
- ✅ User stats (ratings, activities, likes received)
- ✅ Admin badge indicator (`is_admin` column)
- ✅ Sorting by join date (newest first)

**Critical Limitations:**
- ❌ **No pagination** - Loads ALL users at once (will break at 1000+ users)
- ❌ **No search/filter** - Can't find specific users quickly
- ❌ **No way to grant/revoke admin** - Must manually update database
- ❌ **No role system** - Only binary: admin or not admin
- ❌ **No viewer role** - Can't give read-only access
- ❌ **Inefficient queries** - Uses Promise.all for each user's stats (N+1 problem)
- ❌ **No user detail pages** - Can't drill down into individual users
- ❌ **No bulk actions** - Can't export CSV or manage multiple users
- ❌ **Missing columns** - No email, last active, follower counts

---

## 📊 Industry Best Practices Research (2024/2025)

### Role-Based Access Control (RBAC)

**Standard Role Types:**
1. **Owner** - Full control, can't be removed (you)
2. **Admin** - Full access, can manage users and content
3. **Analyst** - Read-only access, can see everything but can't make changes
4. **No Access** - Regular users

**Why RBAC Matters:**
- **Principle of Least Privilege** - Users get minimum necessary access
- **Auditing** - Track who did what
- **Team Growth** - Easy to onboard teammates without full admin access
- **Security** - Limit blast radius of compromised accounts

### Scalability Best Practices

**For 1000+ Users:**
1. **Server-side pagination** - Load 50-100 users per page
2. **Database indexes** - Fast queries on common filters
3. **Optimized SQL** - Single query with JOINs instead of N+1
4. **Search** - Full-text search on username, email, display name
5. **Filters** - Active/Inactive, Admin/Non-Admin, Date ranges
6. **Sorting** - By any column (join date, last active, ratings, etc.)
7. **Infinite scroll** (alternative to pagination) - Good for browsing
8. **Bulk actions** - Export CSV, batch operations

**Performance Targets:**
- Page load: <500ms for 50 users
- Search: <200ms
- Filter: <300ms
- Sort: <200ms

---

## 🏗️ Proposed Architecture

### Database Schema Changes

```sql
-- Add role system to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT NULL
CHECK (admin_role IN ('owner', 'admin', 'analyst'));

-- Migrate existing is_admin to admin_role
UPDATE profiles
SET admin_role = CASE
  WHEN is_admin = TRUE THEN 'admin'
  ELSE NULL
END;

-- Keep is_admin for backwards compatibility (computed column)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin_computed BOOLEAN
GENERATED ALWAYS AS (admin_role IS NOT NULL) STORED;

-- Add last active tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Create admin_role_history table for auditing
CREATE TABLE IF NOT EXISTS admin_role_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by_user_id UUID NOT NULL REFERENCES profiles(id),
  old_role TEXT,
  new_role TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_role_history_user ON admin_role_history(user_id, created_at DESC);
CREATE INDEX idx_admin_role_history_changed_by ON admin_role_history(changed_by_user_id);

-- Performance indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_admin_role ON profiles(admin_role) WHERE admin_role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_profiles_username_search ON profiles USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_search ON profiles USING gin(display_name gin_trgm_ops);

-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Permission Matrix

| Action | Owner | Admin | Analyst | Regular User |
|--------|-------|-------|--------|--------------|
| View /admin dashboard | ✅ | ✅ | ✅ | ❌ |
| View user list | ✅ | ✅ | ✅ | ❌ |
| View user details | ✅ | ✅ | ✅ | ❌ |
| Search users | ✅ | ✅ | ✅ | ❌ |
| Export user data (CSV) | ✅ | ✅ | ❌ | ❌ |
| Grant/revoke Admin role | ✅ | ✅ | ❌ | ❌ |
| Grant/revoke Viewer role | ✅ | ✅ | ❌ | ❌ |
| Ban/suspend users | ✅ | ✅ | ❌ | ❌ |
| Delete users | ✅ | ✅ | ❌ | ❌ |
| Modify content | ✅ | ✅ | ❌ | ❌ |
| Send announcements | ✅ | ✅ | ❌ | ❌ |
| Manage invites | ✅ | ✅ | ❌ | ❌ |
| Change another Owner | ✅ | ❌ | ❌ | ❌ |
| Remove Owner role | ❌ | ❌ | ❌ | ❌ |

### Optimized User List Query

**Replace N+1 queries with single JOIN query:**

```sql
-- Efficient single query for user list with stats
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.email,
  p.created_at,
  p.last_active_at,
  p.admin_role,
  p.account_status,

  -- Aggregated stats
  COUNT(DISTINCT r.id) as ratings_count,
  COUNT(DISTINCT a.id) as activities_count,
  COUNT(DISTINCT f1.id) as following_count,
  COUNT(DISTINCT f2.id) as followers_count,
  COUNT(DISTINCT l.id) as likes_received_count,

  -- Recent activity
  MAX(a.created_at) as last_activity_at,

  -- Activity in last 7 days
  COUNT(DISTINCT CASE WHEN a.created_at > NOW() - INTERVAL '7 days' THEN a.id END) as activities_7d

FROM profiles p
LEFT JOIN ratings r ON p.id = r.user_id
LEFT JOIN activities a ON p.id = a.user_id
LEFT JOIN follows f1 ON p.id = f1.follower_id AND f1.status = 'accepted'
LEFT JOIN follows f2 ON p.id = f2.following_id AND f2.status = 'accepted'
LEFT JOIN activities l ON p.id = l.target_user_id AND l.activity_type = 'like_activity'

WHERE
  -- Search filter (if provided)
  (
    $search IS NULL OR
    p.username ILIKE '%' || $search || '%' OR
    p.display_name ILIKE '%' || $search || '%' OR
    p.email ILIKE '%' || $search || '%'
  )

  -- Role filter (if provided)
  AND ($role_filter IS NULL OR p.admin_role = $role_filter)

  -- Status filter (if provided)
  AND ($status_filter IS NULL OR p.account_status = $status_filter)

GROUP BY p.id
ORDER BY
  CASE WHEN $sort_by = 'created_at' THEN p.created_at END DESC,
  CASE WHEN $sort_by = 'last_active' THEN p.last_active_at END DESC NULLS LAST,
  CASE WHEN $sort_by = 'username' THEN p.username END ASC,
  CASE WHEN $sort_by = 'ratings' THEN COUNT(DISTINCT r.id) END DESC

LIMIT $page_size OFFSET $offset;

-- Get total count for pagination
SELECT COUNT(*) as total
FROM profiles p
WHERE
  ($search IS NULL OR p.username ILIKE '%' || $search || '%' OR p.display_name ILIKE '%' || $search || '%' OR p.email ILIKE '%' || $search || '%')
  AND ($role_filter IS NULL OR p.admin_role = $role_filter)
  AND ($status_filter IS NULL OR p.account_status = $status_filter);
```

---

## 🎨 UI/UX Design

### Enhanced User List Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Users Management                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Total: 1,247 users • Showing 1-50                              │
│                                                                 │
│ ┌─────────────────────────┐  ┌──────────┐  ┌──────────┐  📤   │
│ │ 🔍 Search users...      │  │ All Roles│  │ Active  │ Export│
│ └─────────────────────────┘  └──────────┘  └──────────┘  CSV  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ☑️  Avatar  Username      Email          Role    Stats    ⋮    │
│ ─────────────────────────────────────────────────────────────  │
│ [ ] 👤 @murtopia    nick@...  Owner    142 ratings         •••│
│ [ ] 👤 @taylormurto taylor@... Admin    38 ratings         •••│
│ [ ] 👤 @toddles     todd@...  Analyst   67 ratings         •••│
│ [ ] 👤 @mossy       moss@...  -         12 ratings         •••│
│ [ ] 👤 @newuser     new@...   -         2 ratings          •••│
│ ...                                                             │
│                                                                 │
│ ⬅️ Previous    1 2 3 ... 25 Next ➡️                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─ User Actions Menu (•••) ──────────────────────┐
│ View Profile                                   │
│ View Admin Details                             │
│ ───────────────────────────────────            │
│ ⭐ Grant Admin Access                         │
│ 📊 Grant Analyst Access                       │
│ 🚫 Revoke Admin Access                        │
│ ───────────────────────────────────            │
│ ⚠️  Warn User                                  │
│ 🔒 Suspend User                                │
│ 🚨 Ban User                                    │
└────────────────────────────────────────────────┘
```

### Grant Admin Role Modal

```
┌──────────────────────────────────────────────┐
│ Grant Admin Role to @taylormurto?            │
├──────────────────────────────────────────────┤
│                                              │
│ Role: ( ) Analyst   (•) Admin   ( ) Owner    │
│                                              │
│ ℹ️ Permissions:                              │
│ • View all admin pages                       │
│ • Manage users                               │
│ • Moderate content                           │
│ • Send announcements                         │
│ • Cannot grant/revoke Owner role             │
│                                              │
│ Reason (optional):                           │
│ ┌──────────────────────────────────────────┐ │
│ │ Adding Taylor as admin to help with     │ │
│ │ moderation during alpha                  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ⚠️ This will be logged in audit history      │
│                                              │
│ [Cancel]              [Grant Admin Role →]  │
└──────────────────────────────────────────────┘
```

### User Detail Page (`/admin/users/:userId`)

```
┌─────────────────────────────────────────────────────────┐
│ ⬅️ Back to Users                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 👤  @taylormurto (Taylor Murto)                        │
│     taylor@example.com • Joined Oct 15, 2025           │
│     Role: Admin • Last active: 2 hours ago             │
│                                                         │
│     [Manage Role ▾] [View Profile] [Message User]      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ QUICK STATS                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ Ratings  │ │ Following│ │ Followers│ │ Likes    │   │
│ │   38     │ │   12     │ │   24     │ │   67     │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│ ACTIVITY TIMELINE (Last 30 Days)                        │
│ [Activity chart showing daily ratings/follows]          │
├─────────────────────────────────────────────────────────┤
│ RECENT ACTIONS (Last 20)                                │
│ 2h ago    Rated "Breaking Bad" ★★★★★                   │
│ 4h ago    Followed @toddles                             │
│ 1d ago    Commented on "The Office"                     │
│ ...                                                     │
├─────────────────────────────────────────────────────────┤
│ ADMIN ROLE HISTORY                                      │
│ Oct 20, 2025 • Granted "Admin" by @murtopia            │
│ Reason: "Adding Taylor as admin to help with moderation"│
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Database & Backend (Week 1)

**Tasks:**
1. Create database migration for:
   - `admin_role` column
   - `admin_role_history` table
   - Performance indexes
   - Migrate existing `is_admin` data
2. Create optimized user list query function
3. Add pagination helper functions
4. Create RLS policies for role-based access
5. Build API endpoints:
   - `GET /api/admin/users` - Paginated user list
   - `POST /api/admin/users/:userId/grant-role` - Grant admin/viewer
   - `POST /api/admin/users/:userId/revoke-role` - Revoke role
   - `GET /api/admin/users/:userId` - User detail
   - `GET /api/admin/users/export` - CSV export

**Deliverables:**
- Migration file ready to run
- Optimized queries tested with 10k+ mock users
- API endpoints with permission checks

### Phase 2: User List UI (Week 2)

**Tasks:**
1. Rebuild `/app/admin/users/page.tsx` with:
   - Server-side pagination (50 users per page)
   - Search bar (username, email, display name)
   - Filter dropdowns (role, status, date range)
   - Sort headers (clickable columns)
   - Bulk select checkboxes
2. Create `UsersTable.tsx` component
3. Add export CSV functionality
4. Add loading states and error handling
5. Mobile responsive design

**Deliverables:**
- Fast, scalable user list page
- Search/filter/sort working
- CSV export working

### Phase 3: Role Management UI (Week 3)

**Tasks:**
1. Create `GrantRoleModal.tsx` component
2. Add role badge displays (Owner/Admin/Viewer chips)
3. Build user action menu (3-dot dropdown)
4. Add confirmation dialogs for role changes
5. Implement audit logging UI
6. Add role history display on user detail page

**Deliverables:**
- Grant/revoke admin functionality
- Grant/revoke viewer functionality
- Audit trail visible

### Phase 4: User Detail Page (Week 4)

**Tasks:**
1. Create `/app/admin/users/[userId]/page.tsx`
2. Build detailed stats view
3. Add activity timeline chart
4. Show recent actions table
5. Display admin role history
6. Add quick actions (message, suspend, etc.)

**Deliverables:**
- Comprehensive user detail view
- Admin can drill down into any user

### Phase 5: Testing & Polish (Week 5)

**Tasks:**
1. Load test with 10k+ users
2. Test all permission combinations
3. Test pagination edge cases
4. Ensure audit logging works
5. Mobile testing
6. Documentation

**Deliverables:**
- Production-ready system
- Performance benchmarks met
- Documentation complete

---

## 🔒 Permission Checking Utility

```typescript
// utils/admin/permissions.ts

export type AdminRole = 'owner' | 'admin' | 'analyst' | null

export interface AdminPermissions {
  canView: boolean
  canManageUsers: boolean
  canGrantAdmin: boolean
  canGrantViewer: boolean
  canRevokeAdmin: boolean
  canModerate: boolean
  canSendAnnouncements: boolean
  canManageInvites: boolean
  canExportData: boolean
  canChangeOwner: boolean
}

export function getAdminPermissions(role: AdminRole): AdminPermissions {
  const isOwner = role === 'owner'
  const isAdmin = role === 'admin' || isOwner
  const isAnalyst = role === 'analyst' || isAdmin

  return {
    canView: isAnalyst,
    canManageUsers: isAdmin,
    canGrantAdmin: isAdmin,
    canGrantViewer: isAdmin,
    canRevokeAdmin: isAdmin,
    canModerate: isAdmin,
    canSendAnnouncements: isAdmin,
    canManageInvites: isAdmin,
    canExportData: isAdmin, // Only admins can export
    canChangeOwner: isOwner,
  }
}

export function requirePermission(
  userRole: AdminRole,
  permission: keyof AdminPermissions
): boolean {
  const permissions = getAdminPermissions(userRole)
  return permissions[permission]
}

// Usage in components:
export async function checkAdminAccess(
  requiredPermission?: keyof AdminPermissions
): Promise<{ role: AdminRole; hasAccess: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { role: null, hasAccess: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('admin_role')
    .eq('id', user.id)
    .single()

  const role = profile?.admin_role as AdminRole

  if (!requiredPermission) {
    // Just check if they have any admin role
    return { role, hasAccess: role !== null }
  }

  const hasAccess = requirePermission(role, requiredPermission)
  return { role, hasAccess }
}
```

---

## 📈 Performance Benchmarks

### Target Performance (1000+ Users)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Initial page load | <500ms | ~3000ms | ❌ Needs optimization |
| Search results | <200ms | N/A | - Not implemented |
| Filter application | <300ms | N/A | - Not implemented |
| Sort column | <200ms | ~500ms | ⚠️ Acceptable but can improve |
| Export 1000 users | <5s | N/A | - Not implemented |
| Pagination nav | <100ms | N/A | - Not implemented |

### Optimization Strategies

1. **Database Indexes** - Already planned in migration
2. **Connection Pooling** - Supabase handles this
3. **Query Optimization** - Single JOIN query instead of N+1
4. **Caching** - Cache user counts for 1 minute
5. **Lazy Loading** - Load user details on-demand
6. **Virtualized Lists** - Consider react-window for 100+ users per page

---

## 🎯 Success Criteria

### Must Have (P0)
- [ ] User list loads in <500ms with 1000+ users
- [ ] Pagination works (50 users per page)
- [ ] Search by username/email works
- [ ] Grant/revoke Admin role works
- [ ] Grant/revoke Analyst role works
- [ ] Analyst role has read-only access (can see, can't edit)
- [ ] Audit trail logs all role changes
- [ ] Owner role can't be removed

### Should Have (P1)
- [ ] Filter by role (All/Owner/Admin/Analyst)
- [ ] Filter by status (Active/Suspended/Banned)
- [ ] Sort by any column
- [ ] Export CSV (admins only)
- [ ] User detail page with timeline
- [ ] Mobile responsive

### Nice to Have (P2)
- [ ] Bulk actions (select multiple users)
- [ ] Infinite scroll option
- [ ] Advanced search (date ranges, activity level)
- [ ] Role expiration (temporary admin access)
- [ ] Email notifications when role changes

---

## 🚀 Migration Strategy

### Step 1: Run Database Migration
```bash
npx supabase db push
```

### Step 2: Migrate Existing Data
```sql
-- Set your user as Owner
UPDATE profiles
SET admin_role = 'owner'
WHERE username = 'murtopia'; -- Replace with your username

-- Migrate other admins
UPDATE profiles
SET admin_role = 'admin'
WHERE is_admin = TRUE AND username != 'murtopia';
```

### Step 3: Test on Staging
- Add test users with different roles
- Test all permission combinations
- Verify read-only access for Viewers

### Step 4: Deploy to Production
- Deploy new UI
- Verify existing admins retained access
- Monitor performance

---

## 📚 Related Documentation

- [ADMIN-CONSOLE-UPGRADE-PLAN.md](./ADMIN-CONSOLE-UPGRADE-PLAN.md) - Overall admin console architecture
- [USER-REPORTING-SYSTEM.md](./USER-REPORTING-SYSTEM.md) - Moderation system
- [SETTINGS-HUB-PLAN.md](./SETTINGS-HUB-PLAN.md) - User settings

---

## ❓ FAQ

### Q: Why not use Supabase's built-in auth roles?
**A:** Supabase auth roles are for system-level access (anon, authenticated, service_role). We need application-level roles specific to our admin console.

### Q: Can we have multiple Owners?
**A:** Yes, but it's recommended to have only one Owner initially. Owners have full control including the ability to change other Owners.

### Q: What happens if the Owner account is compromised?
**A:** You can manually update the database to revoke Owner status and grant it to a new account. This should be documented in your security runbook.

### Q: Can Analysts see sensitive data like emails?
**A:** Yes, by default. You can mask emails for Analysts if needed (show `n***@gmail.com` instead of full email).

### Q: How do we handle thousands of users?
**A:** The pagination and optimized queries are designed for this. With proper indexes, the system can handle 100k+ users without performance degradation.

### Q: What about audit logging for other actions?
**A:** This plan only covers role changes. For comprehensive audit logging (content edits, user bans, etc.), see the moderation system docs.

---

## 🔄 Change Log

**v1.0 - November 2, 2025**
- Initial comprehensive plan created
- Research completed on RBAC best practices
- Performance benchmarks defined
- 5-week implementation timeline proposed

---

**Document Status:** Draft - Awaiting Approval
**Next Steps:** Review with team, approve architecture, begin Phase 1
**Owner:** Admin Team
**Version:** 1.0

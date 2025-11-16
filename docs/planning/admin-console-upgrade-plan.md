# Been Watching - Admin Console Upgrade Plan

**Date:** October 29, 2025 (Updated: October 30, 2025)
**Version:** 2.0 (Complete Redesign)
**Current Status:** Implementation in Progress (85% Complete)
**Target Completion:** November 15, 2025

---

## Executive Summary

This document outlines a comprehensive upgrade to the Been Watching admin console, transforming it from a single-page dashboard into a professional, data-driven command center. The upgrade is informed by industry best practices from Instagram, Twitter/X, TikTok, and LinkedIn, adapted for our alpha-stage social TV/movie tracking platform.

**Key Changes:**
- ✨ **Navigation Structure:** Sidebar navigation with logical groupings
- 📊 **Analytics Integration:** PostHog event tracking and custom metrics
- 📈 **Dashboard Redesign:** 12 core metrics with visual hierarchy
- 👥 **Enhanced User Management:** Detailed user views with activity history
- 🛡️ **Moderation Tools:** Content moderation and user action capabilities
- 🚩 **User Reporting System:** Complete report submission & review workflow ([See detailed doc](USER-REPORTING-SYSTEM.md))
- 🎟️ **Invite Analytics:** Deeper insights into invite system performance

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Proposed Navigation Structure](#proposed-navigation-structure)
3. [Core Metrics Dashboard](#core-metrics-dashboard)
4. [PostHog Integration](#posthog-integration)
5. [User Management Enhancements](#user-management-enhancements)
6. [Moderation System](#moderation-system)
7. [User Reporting System](#user-reporting-system)
8. [Implementation Phases](#implementation-phases)
9. [Database Changes Required](#database-changes-required)
10. [Technical Specifications](#technical-specifications)
11. [Success Metrics](#success-metrics)

---

## Current State Analysis

### What We Have Today

**Current Admin Page:** `/app/admin/page.tsx`

**Features:**
- Social metrics panel (follows, most followed users, most active users)
- User list with basic stats
- Announcement creation system
- Invite code statistics
- Waitlist management
- Admin user management

**Limitations:**
- No structured navigation (everything on one long page)
- No historical trend data
- No retention or cohort analysis
- No event tracking system
- No moderation tools
- No alerting system
- Limited user detail views

### What We're Building

**New Admin Console:** Multi-page application with:
- Sidebar navigation with 7 main sections
- 12 core metrics with trend indicators
- PostHog-powered analytics
- Comprehensive user management
- Content moderation workflow
- Real-time alerts and notifications
- Mobile-responsive design

---

## Proposed Navigation Structure

### Layout Architecture

**Design:** Sticky sidebar (240px) + main content area

```
┌─────────────┬──────────────────────────────────────┐
│             │                                      │
│  SIDEBAR    │         MAIN CONTENT                 │
│  (Fixed)    │         (Scrollable)                 │
│             │                                      │
│  📊 Dash    │  ┌──────────────────────────────┐   │
│  👥 Users   │  │     Page Content             │   │
│  📈 Analytics│  │                              │   │
│  🔍 Content │  │                              │   │
│  🛡️ Moderat.│  │                              │   │
│  🎟️ Invites │  │                              │   │
│  ⚙️ System  │  │                              │   │
│             │  └──────────────────────────────┘   │
└─────────────┴──────────────────────────────────────┘
```

### Navigation Hierarchy

```
📊 Dashboard
   └─ Overview (default landing page)

👥 Users
   ├─ User List
   ├─ User Detail (/:userId)
   ├─ Cohort Analysis
   └─ Admin Users

📈 Analytics
   ├─ Engagement Metrics
   ├─ Growth Metrics
   ├─ Content Metrics
   ├─ Social Graph
   └─ Retention Analysis

🔍 Content
   ├─ Recent Activity
   ├─ Ratings & Reviews
   ├─ Top Media
   └─ Search Activity

🛡️ Moderation ✅ COMPLETED (2025-10-30)
   ├─ Overview Dashboard ✅
   ├─ Reports Queue ✅
   ├─ Flagged Content ✅
   ├─ Moderation Log ✅
   └─ Ban List ✅

🎟️ Invites
   ├─ Invite Overview
   ├─ Referral Tracking
   ├─ Waitlist
   └─ Master Codes

⚙️ System
   ├─ Health Checks
   ├─ Error Logs
   ├─ API Performance
   └─ Database Stats
```

### Route Structure

```
/admin                          → Dashboard
/admin/users                    → User List
/admin/users/:userId            → User Detail
/admin/users/cohorts            → Cohort Analysis
/admin/users/admins             → Admin User Management
/admin/analytics/engagement     → Engagement Metrics
/admin/analytics/growth         → Growth Metrics
/admin/analytics/content        → Content Metrics
/admin/analytics/social         → Social Graph Analysis
/admin/analytics/retention      → Retention Analysis
/admin/content/activity         → Recent Activity
/admin/content/ratings          → Ratings & Reviews
/admin/content/top              → Top Media
/admin/content/search           → Search Activity
/admin/moderation               → Overview Dashboard ✅
/admin/moderation/reports       → Reports Queue ✅
/admin/moderation/flagged       → Flagged Content ✅
/admin/moderation/log           → Moderation Log ✅
/admin/moderation/bans          → Ban List ✅
/admin/invites                  → Invite Overview
/admin/invites/referrals        → Referral Tracking
/admin/invites/waitlist         → Waitlist Management
/admin/invites/codes            → Master Codes
/admin/system/health            → Health Checks
/admin/system/errors            → Error Logs
/admin/system/api               → API Performance
/admin/system/database          → Database Stats
```

---

## Core Metrics Dashboard

### Dashboard Layout (Landing Page: `/admin`)

**Design Principle:** Most critical information above the fold, secondary metrics below

```
┌───────────────────────────────────────────────────────────┐
│  🚨 CRITICAL ALERTS (if any)                              │
│  [ Error Rate >5% ]  [ No new users in 48h ]              │
└───────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  KEY METRICS GRID                                          │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Total   │ │  Active  │ │   New    │ │Retention │     │
│  │  Users   │ │  Users   │ │  Users   │ │   (D7)   │     │
│  │          │ │          │ │          │ │          │     │
│  │   142    │ │    87    │ │    12    │ │   65%    │     │
│  │  ↑ +8%   │ │  ↑ +5%   │ │  ↓ -15%  │ │  ↑ +3%   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Ratings  │ │ Activity │ │  Total   │ │  Avg     │     │
│  │ /User/Wk │ │   Feed   │ │  Follows │ │ Session  │     │
│  │          │ │   Views  │ │          │ │   Time   │     │
│  │   4.2    │ │   1,240  │ │   218    │ │  4m 32s  │     │
│  │  ↑ +12%  │ │  ↑ +18%  │ │  ↑ +7%   │ │  ↓ -8%   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ENGAGEMENT TRENDS                                         │
│                                                            │
│  ┌──────────────────────────┐  ┌──────────────────────┐   │
│  │  Daily Active Users      │  │  Ratings per User    │   │
│  │  [Line Chart - 30 days]  │  │  [Line Chart]        │   │
│  │                          │  │                      │   │
│  │        /\      /\        │  │      /\    /\        │   │
│  │       /  \    /  \       │  │     /  \  /  \       │   │
│  │      /    \  /    \      │  │    /    \/    \      │   │
│  │  ___/      \/      \___  │  │ __/            \___  │   │
│  └──────────────────────────┘  └──────────────────────┘   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY (Last 20)                                 │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Time    │ User      │ Action        │ Content        │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 2m ago  │ @murtopia │ Rated         │ Breaking Bad   │ │
│  │ 5m ago  │ @taylormurto│ Followed    │ @toddles       │ │
│  │ 8m ago  │ @mossy    │ Commented on  │ The Office     │ │
│  │ ...     │ ...       │ ...           │ ...            │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  QUICK ACTIONS                                             │
│  [Create Announcement] [View Reports] [User Search]        │
└────────────────────────────────────────────────────────────┘
```

### Tier 1 Metrics (12 Core KPIs)

#### User Health Metrics (Top Row)
1. **Total Users**
   - Current count
   - Change vs previous period
   - Sparkline (30-day trend)

2. **Active Users (7-day)**
   - Users who logged in past 7 days
   - Change vs previous 7 days
   - Percentage of total users

3. **New Users (7-day)**
   - Signups in past 7 days
   - Change vs previous 7 days
   - Signup source breakdown (on hover)

4. **Retention (Day 7)**
   - % of users who return on day 7
   - Change vs previous cohort
   - Link to full retention analysis

#### Engagement Metrics (Second Row)
5. **Ratings per User per Week**
   - Average content interactions
   - Change vs previous week
   - Distribution (median, p90)

6. **Activity Feed Views**
   - Total feed views past 7 days
   - Views per active user
   - Engagement rate

7. **Total Follows**
   - Current social connections
   - New follows past 7 days
   - Average per user

8. **Average Session Duration**
   - Mean time per session
   - Change vs previous period
   - Distribution curve

#### System Health Metrics (Below fold)
9. **Error Rate**
   - % of API requests failing
   - Critical if >5%
   - Link to error log

10. **API Response Time (P95)**
    - 95th percentile latency
    - Warning if >2s
    - Breakdown by endpoint

11. **Daily Active Sessions**
    - Total app opens today
    - Average per user
    - Peak hour breakdown

12. **Database Query Performance**
    - Slow queries (>1s)
    - Connection pool usage
    - Storage utilization

### Metric Card Component Design

```typescript
interface MetricCardProps {
  title: string
  value: number | string
  change: number // percentage change
  changeLabel: string // "vs last week"
  trend: number[] // sparkline data
  status: 'good' | 'warning' | 'critical'
  onClick?: () => void
}

// Example
<MetricCard
  title="Active Users (7d)"
  value={87}
  change={5.2}
  changeLabel="vs last week"
  trend={[72, 75, 78, 81, 85, 87, 87]}
  status="good"
  onClick={() => router.push('/admin/analytics/engagement')}
/>
```

### Visual Design Specifications

**Colors:**
- Good/Positive: `#16a34a` (green)
- Warning: `#f59e0b` (amber)
- Critical: `#dc2626` (red)
- Neutral: `#6b7280` (gray)

**Typography:**
- Metric value: `2rem` / `700` weight
- Metric label: `0.875rem` / `500` weight
- Change indicator: `0.875rem` / `600` weight

**Spacing:**
- Card padding: `1.5rem`
- Grid gap: `1rem`
- Section margin: `2rem`

---

## PostHog Integration

### Setup & Configuration

**Account:** Been Watching Production
**Region:** PostHog Cloud EU (Frankfurt) - GDPR compliant
**API Key:** `phc_[your-key-here]`

### Installation

```bash
npm install posthog-js posthog-node
```

### Client-Side Integration

**File:** `/app/providers/PostHogProvider.tsx`

```typescript
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize after user consent
    const hasConsent = localStorage.getItem('analytics-consent') === 'true'

    if (hasConsent && typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: 'https://eu.posthog.com',
        autocapture: false, // Explicit tracking only
        capture_pageview: true,
        capture_pageleave: true,
        mask_all_text: true, // Privacy-first
        mask_all_element_attributes: true,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '*',
        },
        persistence: 'localStorage',
        bootstrap: {
          distinctID: undefined, // Set after user login
        },
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

### Event Taxonomy

**Naming Convention:** `object_action` with snake_case

#### Authentication Events

```typescript
// User signed up
posthog.capture('user_signed_up', {
  signup_method: 'google' | 'email' | 'invite',
  invite_code: string,
  referrer: string,
  $set: {
    username: string,
    email: string,
    display_name: string,
  }
})

// User logged in
posthog.capture('user_logged_in', {
  login_method: 'session' | 'token' | 'oauth',
})

// User logged out
posthog.capture('user_logged_out')
```

#### Content Events

```typescript
// Media rated
posthog.capture('media_rated', {
  media_id: string,
  media_type: 'movie' | 'tv',
  media_title: string,
  rating: 'meh' | 'like' | 'love',
  season_number: number | null,
  has_comment: boolean,
})

// Watch status changed
posthog.capture('watch_status_changed', {
  media_id: string,
  media_type: 'movie' | 'tv',
  old_status: 'want' | 'watching' | 'watched' | null,
  new_status: 'want' | 'watching' | 'watched' | null,
})

// Top 3 show added
posthog.capture('top_show_added', {
  media_id: string,
  media_title: string,
  position: 1 | 2 | 3,
})

// Comment added to show
posthog.capture('show_comment_added', {
  media_id: string,
  comment_length: number,
  is_public: boolean,
})
```

#### Social Events

```typescript
// User followed
posthog.capture('user_followed', {
  following_user_id: string,
  following_username: string,
  follow_type: 'public' | 'pending',
})

// User unfollowed
posthog.capture('user_unfollowed', {
  unfollowed_user_id: string,
})

// Activity liked
posthog.capture('activity_liked', {
  activity_id: number,
  activity_type: string,
  activity_user_id: string,
})

// Activity commented
posthog.capture('activity_commented', {
  activity_id: number,
  comment_length: number,
  has_mentions: boolean,
})
```

#### Engagement Events

```typescript
// Feed viewed
posthog.capture('feed_viewed', {
  feed_type: 'following' | 'global',
  items_shown: number,
  scroll_depth: number, // percentage
})

// Profile viewed
posthog.capture('profile_viewed', {
  viewed_user_id: string,
  viewed_username: string,
  is_own_profile: boolean,
})

// Search performed
posthog.capture('search_performed', {
  query: string,
  results_count: number,
  media_type_filter: 'all' | 'movie' | 'tv',
  result_clicked: boolean,
  clicked_position: number | null,
})

// Media detail viewed
posthog.capture('media_detail_viewed', {
  media_id: string,
  media_title: string,
  media_type: 'movie' | 'tv',
  source: 'search' | 'feed' | 'profile' | 'direct',
})
```

#### Invite Events

```typescript
// Invite generated
posthog.capture('invite_generated', {
  invite_method: 'link' | 'qr_code',
  max_uses: number,
})

// Invite shared
posthog.capture('invite_shared', {
  share_method: 'native' | 'clipboard' | 'social',
})

// Invite accepted
posthog.capture('invite_accepted', {
  invite_code: string,
  inviter_user_id: string,
})

// Profile completion progress
posthog.capture('profile_completion_progress', {
  completion_percentage: number,
  completed_tasks: string[], // ['avatar', 'bio', 'top_3']
})
```

### Server-Side Event Tracking

**File:** `/utils/analytics/posthog-server.ts`

```typescript
import { PostHog } from 'posthog-node'

const posthog = new PostHog(
  process.env.POSTHOG_KEY!,
  { host: 'https://eu.posthog.com' }
)

export async function trackServerEvent(
  userId: string,
  event: string,
  properties: Record<string, any>
) {
  posthog.capture({
    distinctId: userId,
    event,
    properties,
  })
}

// Use for critical events that must not be missed
export async function trackCriticalEvent(
  userId: string,
  event: string,
  properties: Record<string, any>
) {
  await posthog.capture({
    distinctId: userId,
    event,
    properties,
  })

  await posthog.shutdown() // Ensure event is sent
}
```

### PostHog Dashboard Configuration

**Create These Insights:**

1. **User Growth**
   - Chart: Line graph
   - Metric: `user_signed_up` count by day
   - Breakdown: By `signup_method`

2. **Activation Funnel**
   - Chart: Funnel
   - Steps:
     1. `user_signed_up`
     2. `media_rated` (first rating)
     3. `user_followed` (first follow)
     4. `activity_liked` (first interaction)

3. **Retention Curves**
   - Chart: Retention table
   - Initial event: `user_signed_up`
   - Returning event: Any activity
   - Time: Daily, up to 30 days

4. **Engagement Metrics**
   - Chart: Trend
   - Metrics:
     - `media_rated` count per user
     - `feed_viewed` count per user
     - `activity_liked` count per user

5. **Social Graph Growth**
   - Chart: Line graph
   - Metric: `user_followed` count by day
   - Formula: Cumulative sum

### GDPR Compliance

**Consent Banner Implementation:**

```typescript
// components/ConsentBanner.tsx
export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('analytics-consent')
    if (!consent) setShowBanner(true)
  }, [])

  const acceptAnalytics = () => {
    localStorage.setItem('analytics-consent', 'true')
    setShowBanner(false)
    window.location.reload() // Reinitialize PostHog
  }

  const declineAnalytics = () => {
    localStorage.setItem('analytics-consent', 'false')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="consent-banner">
      <p>We use analytics to improve your experience. No personal data is sold.</p>
      <button onClick={acceptAnalytics}>Accept</button>
      <button onClick={declineAnalytics}>Decline</button>
      <a href="/privacy">Learn more</a>
    </div>
  )
}
```

**User Data Rights:**

- Data export: Implement `/api/user/export-data`
- Data deletion: Implement `/api/user/delete-data`
- Opt-out: Allow disabling analytics in settings

---

## User Management Enhancements

### User List View (`/admin/users`)

**Features:**
- Searchable table (username, email, display name)
- Sortable columns
- Filters: Active/Inactive, Signed up date range, Has avatar, etc.
- Pagination (50 per page)
- Bulk actions (export CSV)

**Columns:**
- Avatar thumbnail
- Username (@handle)
- Display Name
- Email (masked: n***@gmail.com)
- Signup Date
- Last Active
- Ratings Count
- Followers/Following
- Status (Active, Warned, Suspended, Banned)
- Actions (View, Edit, Moderate)

**SQL Query:**

```sql
SELECT
  u.id,
  u.username,
  u.display_name,
  u.email,
  u.avatar_url,
  u.created_at,
  u.account_status,
  u.is_admin,
  COUNT(DISTINCT r.id) as rating_count,
  COUNT(DISTINCT f1.id) as following_count,
  COUNT(DISTINCT f2.id) as follower_count,
  MAX(a.created_at) as last_activity,
  (
    SELECT COUNT(*)
    FROM activities
    WHERE user_id = u.id
    AND created_at > datetime('now', '-7 days')
  ) as activities_7d
FROM profiles u
LEFT JOIN watch_status ws ON u.id = ws.user_id
LEFT JOIN ratings r ON u.id = r.user_id
LEFT JOIN follows f1 ON u.id = f1.follower_id AND f1.status = 'accepted'
LEFT JOIN follows f2 ON u.id = f2.following_id AND f2.status = 'accepted'
LEFT JOIN activities a ON u.id = a.user_id
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT 50 OFFSET ?
```

### User Detail View (`/admin/users/:userId`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  USER PROFILE                                            │
│  ┌────────┐                                              │
│  │ Avatar │  @username (Display Name)                    │
│  └────────┘  Joined: Oct 15, 2025                        │
│              Last Active: 2 hours ago                    │
│              Email: nick.murto@gmail.com                 │
│              Status: Active ✅                           │
│                                                          │
│  [Warn User] [Suspend User] [Ban User] [View Profile]   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  QUICK STATS                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ Ratings │ │ Comments│ │Following│ │Followers│        │
│  │   142   │ │   38    │ │   12    │ │   8     │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  ACTIVITY TIMELINE (Last 30 Days)                        │
│  [Chart showing daily activity]                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  RECENT ACTIONS (Last 50)                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Time    │ Action        │ Content        │ Details │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ 2h ago  │ Rated         │ Breaking Bad   │ Love    │  │
│  │ 4h ago  │ Followed      │ @taylormurto   │         │  │
│  │ 1d ago  │ Commented     │ The Office     │ "Great!"│  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SOCIAL GRAPH                                            │
│  Following (12): @user1, @user2, @user3, [View All]      │
│  Followers (8): @user4, @user5, @user6, [View All]       │
│  Taste Matches: @user7 (85%), @user8 (72%)              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  MODERATION HISTORY                                      │
│  No actions taken ✅                                     │
│  (or show warnings/suspensions if any)                   │
└──────────────────────────────────────────────────────────┘
```

---

## Moderation System

**Note:** This section provides an overview. For complete details on the user reporting workflow, moderation actions, community guidelines, and enforcement policies, see **[USER-REPORTING-SYSTEM.md](USER-REPORTING-SYSTEM.md)**.

### Database Schema Additions

**New Tables:**

```sql
-- Moderation actions log
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id),
  target_user_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('warn', 'suspend', 'ban', 'delete_content', 'restore')),
  reason TEXT NOT NULL,
  details JSONB, -- Additional context
  expires_at TIMESTAMPTZ, -- For temporary suspensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_user_id);
CREATE INDEX idx_moderation_actions_admin ON moderation_actions(admin_user_id);

-- User reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  reported_activity_id UUID REFERENCES activities(id),
  reported_comment_id UUID REFERENCES comments(id),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'fake', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'actioned', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);

-- Account status tracking (add to profiles table)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'
CHECK (account_status IN ('active', 'warned', 'suspended', 'banned'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ban_reason TEXT;
```

### Moderation Workflow

#### Step 1: Report Submission

**User-facing report button:**
- On user profiles
- On activities/comments
- Categories: Spam, Harassment, Inappropriate Content, Fake Account, Other

#### Step 2: Report Queue (`/admin/moderation/reports`)

**Features:**
- List of pending reports
- Sort by: Date, Reporter, Reported User, Reason
- Quick preview of reported content
- Bulk actions: Dismiss, Action

#### Step 3: Review & Action

**Actions Available:**
1. **Dismiss Report** - No action needed, mark as reviewed
2. **Warn User** - Send warning, log in history (3 warnings = suspension)
3. **Delete Content** - Remove specific activity/comment
4. **Suspend User** - Temporary (1d, 7d, 30d)
5. **Ban User** - Permanent removal

#### Step 4: Logging & Appeals

**Moderation Log (`/admin/moderation/log`):**
- All actions taken
- Admin who took action
- Timestamp
- Reason provided
- Outcome

**Appeals Process (Future):**
- User can submit appeal
- Admin reviews
- Restore or uphold

### Moderation API Endpoints

```typescript
// Take moderation action
POST /api/admin/moderation/action
Body: {
  targetUserId: string,
  actionType: 'warn' | 'suspend' | 'ban' | 'delete_content',
  reason: string,
  details?: object,
  expiresAt?: string // For suspensions
}

// Dismiss report
POST /api/admin/moderation/reports/:reportId/dismiss
Body: {
  dismissalReason: string
}

// Get moderation history for user
GET /api/admin/moderation/history/:userId
Response: ModerationAction[]

// Get all reports
GET /api/admin/moderation/reports?status=pending&limit=50
Response: Report[]
```

---

## User Reporting System

### Overview

A comprehensive system for users to report violations and for admins to review and take action. This system is designed to scale from alpha to thousands of users while maintaining fairness and transparency.

**Full Documentation:** See [USER-REPORTING-SYSTEM.md](USER-REPORTING-SYSTEM.md) for complete details including:
- User-facing report flows and UI
- 6 report categories (spam, harassment, hate speech, etc.)
- Admin moderation workflow
- Enforcement actions (warn, suspend, ban)
- Community Guidelines template
- Block/mute functionality
- Appeal process
- Automation strategy for scale

### Key Features

**User-Facing:**
- Report button on all content (activities, comments, profiles)
- Simple category selection modal
- Optional additional context
- Immediate confirmation with block/mute options
- Anonymous reporting

**Admin-Facing:**
- Reports queue with priority system
- Detailed report review with full context
- User history and pattern detection
- Multiple enforcement actions available
- Moderation log for audit trail

### Report Categories

1. **Spam** 🤖 - Repetitive, bot-like behavior
2. **Harassment** 😠 - Targeted attacks, bullying
3. **Hate Speech** 🚫 - Discriminatory content
4. **Inappropriate Content** 🔞 - Explicit material
5. **Impersonation** 🎭 - Fake accounts
6. **Other** 💬 - Catch-all with explanation

### Enforcement Actions

| Violation | 1st Offense | 2nd Offense | 3rd Offense | Severe |
|-----------|-------------|-------------|-------------|--------|
| Spam | Warning | 7d suspend | 30d suspend | Ban |
| Harassment | Warning | 7d suspend | Ban | Ban |
| Hate Speech | 7d suspend | Ban | - | Ban |
| Inappropriate | Warning | 7d suspend | Ban | Ban |
| Impersonation | Warning | 30d suspend | Ban | Ban |

### Database Tables

**New tables created:**
- `reports` - User-submitted reports
- `moderation_actions` - Admin enforcement log
- `user_blocks` - User blocking functionality
- `user_mutes` - User muting functionality

**Modified tables:**
- `profiles` - Add account_status, warning_count, suspension fields
- `activities`, `comments`, `show_comments` - Add soft delete columns

### Implementation Priority

**Phase 1 (Week 1):**
- Database schema
- User-facing report button & modal
- Basic admin reports queue
- Dismiss report functionality

**Phase 2 (Week 2):**
- Admin moderation actions (warn, suspend, ban)
- Email notifications for users
- Block/mute functionality

**Phase 3 (Week 3+):**
- Community Guidelines page
- Appeal process
- Pattern detection
- Automation (future)

### Success Criteria

- Average report review time < 24 hours
- 100% of reports reviewed
- Zero false positives (wrongly banned users)
- Clear documentation of all decisions
- Consistent enforcement

---

## Implementation Phases

### Phase 1: Foundation (Week 1 - Nov 1-7)

**Goals:**
- ✅ Set up new admin layout with sidebar navigation
- ✅ Migrate existing features to new structure
- ✅ Implement core metrics dashboard
- ✅ Set up PostHog account and basic tracking

**Tasks:**
1. Create admin layout component with sidebar
2. Implement navigation routing
3. Build metric card component
4. Create dashboard page with 12 core metrics
5. Set up PostHog project and API keys
6. Implement basic event tracking (auth, content)
7. Test with alpha users

**Deliverables:**
- New admin console UI with navigation
- Dashboard showing real metrics
- PostHog tracking active events

### Phase 2: Analytics & User Management (Week 2 - Nov 8-14)

**Goals:**
- ✅ Complete PostHog event taxonomy
- ✅ Build comprehensive user management pages
- ✅ Create analytics sub-pages
- ✅ Set up PostHog dashboards

**Tasks:**
1. Implement remaining PostHog events (social, invites)
2. Build user list page with search/filter
3. Build user detail page with activity timeline
4. Create analytics pages (engagement, growth, social)
5. Configure PostHog insights and dashboards
6. Add retention analysis page

**Deliverables:**
- Complete event tracking
- User management system
- Analytics dashboards

### Phase 3: Moderation & System Health (Week 3 - Nov 15-21)

**Goals:**
- ✅ Implement moderation system (COMPLETED 2025-10-30)
- ⏳ Add system health monitoring (IN PROGRESS)
- ⏳ Create alerting system (PENDING)
- ⏳ Polish and optimize (PENDING)

**Tasks:**
1. ✅ Create moderation database tables (schema designed, needs migration)
2. ✅ Build report submission UI (user-facing)
   - ✅ ReportModal component with 6 categories
   - ✅ DropdownMenu component for 3-dot menus
   - ✅ Comment reporting integration
   - ✅ User profile reporting integration
3. ✅ Build reports queue and review UI (admin)
   - ✅ Reports page
   - ✅ Flagged content page
   - ✅ Moderation log page
   - ✅ Ban list page
   - ✅ Overview dashboard
4. ⏳ Implement moderation actions (UI ready, backend pending)
5. ⏳ Add system health endpoints
6. ⏳ Create alert notification system
7. ⏳ Final testing and bug fixes

**Deliverables:**
- ✅ Working moderation system (UI complete, backend pending)
- ⏳ System health monitoring (next task)
- ⏳ Alert notifications

---

## Database Changes Required

### New Tables

1. **moderation_actions** - Track all moderation actions
2. **reports** - User-submitted reports

### Modified Tables

1. **profiles** - Add columns:
   - `account_status` (active, warned, suspended, banned)
   - `suspended_until` (timestamp for temp suspensions)
   - `ban_reason` (text explanation)

### New Indexes

```sql
-- Performance indexes for admin queries
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);
CREATE INDEX idx_watch_status_user ON watch_status(user_id, created_at DESC);
CREATE INDEX idx_ratings_user ON ratings(user_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id, status, created_at DESC);
CREATE INDEX idx_follows_following ON follows(following_id, status, created_at DESC);
CREATE INDEX idx_profiles_created ON profiles(created_at DESC);
CREATE INDEX idx_profiles_status ON profiles(account_status, created_at DESC);
```

---

## Technical Specifications

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- React Server Components where possible
- Client components for interactivity
- Inline styles (maintain consistency with existing codebase)

**Backend:**
- Supabase PostgreSQL
- Supabase Auth (admin check via RLS)
- Server Actions for mutations

**Analytics:**
- PostHog (event tracking, dashboards, session replay)
- Custom SQL queries for real-time metrics

**Charting:**
- Recharts (React-based, simple, lightweight)
- Alternative: Chart.js via react-chartjs-2

### Component Architecture

```
app/
├── admin/
│   ├── layout.tsx                    # Sidebar + main content layout
│   ├── page.tsx                      # Dashboard (landing page)
│   ├── users/
│   │   ├── page.tsx                  # User list
│   │   ├── [userId]/
│   │   │   └── page.tsx              # User detail
│   │   ├── cohorts/
│   │   │   └── page.tsx              # Cohort analysis
│   │   └── admins/
│   │       └── page.tsx              # Admin user management
│   ├── analytics/
│   │   ├── engagement/
│   │   │   └── page.tsx
│   │   ├── growth/
│   │   │   └── page.tsx
│   │   ├── content/
│   │   │   └── page.tsx
│   │   ├── social/
│   │   │   └── page.tsx
│   │   └── retention/
│   │       └── page.tsx
│   ├── content/
│   │   ├── activity/
│   │   │   └── page.tsx
│   │   ├── ratings/
│   │   │   └── page.tsx
│   │   ├── top/
│   │   │   └── page.tsx
│   │   └── search/
│   │       └── page.tsx
│   ├── moderation/
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── flagged/
│   │   │   └── page.tsx
│   │   ├── log/
│   │   │   └── page.tsx
│   │   └── blocked/
│   │       └── page.tsx
│   ├── invites/
│   │   ├── page.tsx                  # Overview
│   │   ├── referrals/
│   │   │   └── page.tsx
│   │   ├── waitlist/
│   │   │   └── page.tsx
│   │   └── codes/
│   │       └── page.tsx
│   └── system/
│       ├── health/
│       │   └── page.tsx
│       ├── errors/
│       │   └── page.tsx
│       ├── api/
│       │   └── page.tsx
│       └── database/
│           └── page.tsx

components/admin/
├── AdminLayout.tsx                   # Sidebar + top bar
├── AdminSidebar.tsx                  # Navigation sidebar
├── MetricCard.tsx                    # Reusable metric display
├── TrendChart.tsx                    # Line chart component
├── UserCard.tsx                      # User preview card
├── ActivityFeed.tsx                  # Recent activity list
├── AlertBanner.tsx                   # Critical alert display
└── ModerationActions.tsx             # Moderation action buttons

utils/admin/
├── metrics.ts                        # SQL queries for metrics
├── alerts.ts                         # Alert checking logic
└── permissions.ts                    # Admin permission checks
```

### Design System

**Layout:**
- Sidebar width: `240px`
- Main content max-width: `1400px`
- Content padding: `2rem`
- Mobile breakpoint: `768px` (hide sidebar, show hamburger menu)

**Colors (consistent with existing theme):**
```typescript
const adminColors = {
  // Existing theme colors
  background: 'var(--background)',
  foreground: 'var(--foreground)',

  // Admin-specific
  sidebar: '#1a1a1a',
  sidebarText: '#e5e7eb',
  sidebarHover: '#2a2a2a',
  sidebarActive: '#3a3a3a',

  // Status colors
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',

  // Metric cards
  cardBg: '#ffffff',
  cardBgDark: '#1e293b',
  cardBorder: '#e5e7eb',
  cardBorderDark: '#334155',
}
```

**Typography:**
- Headings: System UI font stack
- Body: System UI font stack
- Monospace (for IDs, data): `ui-monospace, monospace`

---

## Success Metrics

### Phase 1 Success Criteria (Week 1)

- [ ] Admin console accessible at `/admin`
- [ ] All existing features migrated to new layout
- [ ] Dashboard showing real-time metrics
- [ ] PostHog tracking at least 10 event types
- [ ] No performance degradation
- [ ] Mobile responsive

### Phase 2 Success Criteria (Week 2)

- [ ] All 40+ PostHog events being tracked
- [ ] User management pages fully functional
- [ ] Analytics pages showing historical data
- [ ] PostHog dashboards configured and shared
- [ ] Retention analysis working
- [ ] Search and filtering on user list working

### Phase 3 Success Criteria (Week 3)

- [ ] Moderation system fully functional
- [ ] Reports can be submitted and reviewed
- [ ] At least 1 test report processed end-to-end
- [ ] System health monitoring active
- [ ] Alert system tested with mock alerts
- [ ] Documentation complete
- [ ] User guide for new admins written

### Ongoing Success Metrics

**Usage:**
- Admin console accessed daily by team
- Metrics checked before key decisions
- Alerts responded to within 1 hour
- User reports reviewed within 24 hours

**Impact:**
- Data-driven feature decisions
- Faster issue resolution
- Proactive user support
- Improved user safety

---

## Appendix

### Resources

**PostHog Documentation:**
- https://posthog.com/docs
- https://posthog.com/docs/libraries/next-js
- https://posthog.com/tutorials/nextjs-analytics

**Analytics Best Practices:**
- Andreessen Horowitz: "16 Startup Metrics"
- Amplitude: "North Star Playbook"
- Lenny's Newsletter: "How the Best Product Teams Measure Success"

**Admin Console Inspiration:**
- Vercel Analytics Dashboard
- Supabase Dashboard
- Railway Dashboard
- Render Dashboard

### Glossary

- **DAU**: Daily Active Users
- **MAU**: Monthly Active Users
- **WAU**: Weekly Active Users
- **Stickiness**: DAU/MAU ratio (measures habit formation)
- **Retention**: % of users who return after initial usage
- **Cohort**: Group of users who signed up in same time period
- **Churn**: Users who stop using the platform
- **Activation**: First meaningful action (e.g., first rating)
- **P95 Latency**: 95th percentile response time (worst 5% ignored)
- **Network Density**: How connected the social graph is

---

## Implementation Progress

### Completed Sections (85%)

✅ **Dashboard** (Page exists, needs enhancement)
- Core metrics display
- Recent activity feed
- Quick actions

✅ **Users** (Completed)
- User list with search/filter
- User management

✅ **Analytics** (Completed)
- Engagement metrics
- Growth tracking
- Content analytics

✅ **Content** (Completed)
- Recent activity page
- Ratings & reviews page
- Top media page
- Search activity page

✅ **Moderation** (Completed 2025-10-30)
- Overview dashboard with stats
- Reports queue
- Flagged content page
- Moderation log
- Ban list page
- **User-facing reporting system:**
  - ReportModal component
  - DropdownMenu component
  - Comment reporting
  - User profile reporting

✅ **Invites** (Completed)
- Invite overview
- Invite analytics

### Remaining Work (15%)

⏳ **System Section** (Not Started)
- Health checks page
- Error logs page
- API performance page
- Database stats page

⏳ **Backend Implementation**
- Moderation action handlers (warn, suspend, ban)
- Email notification system
- Appeal process

⏳ **Polish & Testing**
- End-to-end testing of moderation workflow
- Performance optimization
- Mobile responsiveness
- Documentation completion

---

## Change Log

**v1.1 - October 30, 2025**
- Completed Moderation section (all 5 pages)
- Implemented user reporting system
- Created ReportModal and DropdownMenu components
- Fixed AppHeader avatar display
- Updated progress to 85% complete

**v1.0 - October 29, 2025**
- Initial comprehensive plan created
- Research completed on industry best practices
- Navigation structure designed
- PostHog integration strategy defined
- Implementation phases outlined

---

**Document Status:** ✅ 85% Complete - System Section Remaining
**Next Review:** November 7, 2025
**Owner:** Admin Team
**Version:** 1.1

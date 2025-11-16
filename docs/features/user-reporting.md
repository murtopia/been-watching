# Been Watching - User Reporting & Content Moderation System

**Date:** October 29, 2025 (Updated: October 30, 2025)
**Version:** 1.1
**Status:** Phase 1 Complete - Testing Ready
**Priority:** HIGH (Foundation for scale)

---

## Executive Summary

A comprehensive user reporting and content moderation system designed to scale from alpha (10-15 users) to thousands of users. This system balances user safety with minimal friction, implementing industry best practices from Twitter/X, Instagram, and Reddit.

**Philosophy:**
- **Transparent** - Users know what they can report and why
- **Fast** - Reports reviewed within 24 hours
- **Fair** - Clear guidelines, consistent enforcement
- **Preventive** - Education before punishment
- **Scalable** - Designed for growth from day one

---

## Table of Contents

1. [User-Facing Reporting System](#user-facing-reporting-system)
2. [What Can Be Reported](#what-can-be-reported)
3. [Report Flow (User Experience)](#report-flow-user-experience)
4. [Admin Moderation Workflow](#admin-moderation-workflow)
5. [Moderation Actions & Enforcement](#moderation-actions--enforcement)
6. [Community Guidelines](#community-guidelines)
7. [Database Schema](#database-schema)
8. [Implementation Phases](#implementation-phases)
9. [Automation & Scaling](#automation--scaling)
10. [Legal & Safety Considerations](#legal--safety-considerations)

---

## User-Facing Reporting System

### Where Reports Can Be Submitted

Users can report content from **5 key locations:**

1. **User Profiles** - Report the user account itself
2. **Activity Feed Items** - Report specific activities (ratings, status changes)
3. **Comments** - Report individual comments
4. **Show Notes** - Report user-written show notes (when feature launches)
5. **Direct Messages** - (Future, if/when implemented)

### Report Button Placement

**Visual Design:**
- Icon: `⋯` (three dots menu) or `🚩` (flag icon)
- Color: Subtle gray, turns red on hover
- Position: Top-right corner of content
- Dropdown menu on click

**Example (Activity Card):**
```
┌────────────────────────────────────────────────┐
│  @username rated Breaking Bad ❤️               ⋯│
│  "One of the best shows ever made!"            │
│  2 hours ago · 3 likes                         │
└────────────────────────────────────────────────┘
     ↓ Click ⋯
┌────────────────────────────────────────────────┐
│  ▼ More Options                                │
│  ├─ 🔗 Copy Link                               │
│  ├─ 🔕 Mute @username                          │
│  ├─ 🚫 Block @username                         │
│  ├─ 🚩 Report this activity                    │
│  └─ ❌ Cancel                                  │
└────────────────────────────────────────────────┘
```

---

## What Can Be Reported

### Report Categories (Standardized)

Based on research from major platforms, we'll use **6 standard categories:**

1. **Spam** 🤖
   - Repetitive content
   - Mass following/unfollowing
   - Promotional content unrelated to TV/movies
   - Bot-like behavior

2. **Harassment or Bullying** 😠
   - Targeted attacks on a user
   - Repeated unwanted contact
   - Threats or intimidation
   - Coordinated harassment

3. **Hate Speech** 🚫
   - Slurs or discriminatory language
   - Content attacking protected groups
   - Symbols of hate groups

4. **Inappropriate Content** 🔞
   - Sexually explicit material
   - Graphic violence
   - Self-harm content
   - Content inappropriate for general audience

5. **Impersonation or Fake Account** 🎭
   - Pretending to be someone else
   - Misleading profile information
   - Fake celebrity/public figure accounts

6. **Other** 💬
   - Anything not covered above
   - Requires text explanation

### What's NOT a Violation

**Important:** These are NOT valid report reasons:
- ❌ Disagreeing with someone's rating/opinion
- ❌ Disliking someone's taste in shows
- ❌ Someone unfollowing you
- ❌ Someone not following you back
- ❌ Negative (but civil) comments about shows

**Why This Matters:** Prevents report abuse and maintains community trust.

---

## Report Flow (User Experience)

### Step 1: User Clicks Report

**Trigger:** User clicks `⋯` menu → "Report this [content]"

### Step 2: Category Selection Modal

```
┌───────────────────────────────────────────────────────┐
│  Report Activity                                   ✕  │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Why are you reporting this?                          │
│                                                       │
│  ○ Spam or bot-like behavior                         │
│  ○ Harassment or bullying                            │
│  ○ Hate speech or discrimination                     │
│  ○ Inappropriate content                             │
│  ○ Impersonation or fake account                     │
│  ○ Other (please explain)                            │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │ Optional: Add more details (helpful!)       │     │
│  │                                              │     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  Your report is anonymous and helps keep Been         │
│  Watching safe for everyone.                          │
│                                                       │
│  [Cancel]                        [Submit Report]      │
└───────────────────────────────────────────────────────┘
```

**UX Details:**
- Radio buttons for categories (single selection)
- Optional text area for additional context
- Character limit: 500 characters
- Anonymous disclosure
- Clear submit/cancel buttons

### Step 3: Confirmation

```
┌───────────────────────────────────────────────────────┐
│  ✅ Report Submitted                                  │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Thank you for helping keep Been Watching safe.       │
│                                                       │
│  We'll review this report within 24 hours.            │
│                                                       │
│  You can also:                                        │
│  • Block @username to stop seeing their content      │
│  • Mute @username to hide from your feed             │
│                                                       │
│  [Block User]  [Mute User]  [Done]                   │
└───────────────────────────────────────────────────────┘
```

**Post-Report Actions:**
- Immediate confirmation message
- Option to block/mute (empowers user right away)
- Sets expectation (24-hour review)
- Doesn't reveal moderation decision

### Step 4: Optional - Block/Mute

**Block:** User will not see reported user's content, and reported user cannot interact with them
**Mute:** User's feed won't show reported user's content (softer option)

---

## Admin Moderation Workflow

### Reports Queue (`/admin/moderation/reports`)

**Layout:**

```
┌──────────────────────────────────────────────────────────┐
│  Reports Queue                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Filters: [ Pending ▼ ] [ All Categories ▼ ]    │    │
│  │ Sort by: [ Newest First ▼ ]                     │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  📊 PENDING: 3 reports                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [URGENT] Report #147 - Harassment                       │
│  Reported User: @problematicuser                         │
│  Reported By: 2 users                                    │
│  Category: Harassment or bullying                        │
│  Content: "You're such an idiot for liking this show"   │
│  Date: 10 minutes ago                                    │
│  [Review] [Dismiss] [Block User]                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Report #146 - Spam                                      │
│  Reported User: @spambot123                              │
│  Reported By: 1 user                                     │
│  Category: Spam or bot-like behavior                     │
│  Content: User posted 50 identical ratings in 2 minutes  │
│  Date: 2 hours ago                                       │
│  [Review] [Dismiss] [Suspend User]                       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Report #145 - Other                                     │
│  Reported User: @normaluser                              │
│  Reported By: 1 user                                     │
│  Category: Other                                         │
│  Details: "This user gave my favorite show a bad rating" │
│  Date: 5 hours ago                                       │
│  [Review] [Dismiss]                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Priority System:**
- 🔴 **URGENT**: Multiple reports on same user/content
- 🟡 **HIGH**: Hate speech, harassment
- 🟢 **NORMAL**: Spam, inappropriate content
- ⚪ **LOW**: Other, impersonation

### Report Detail View

**Click "Review" on any report:**

```
┌──────────────────────────────────────────────────────────┐
│  Report #147 - HARASSMENT                                │
│  Status: PENDING      Priority: 🔴 URGENT                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  REPORTED CONTENT                                        │
│  ┌────────────────────────────────────────────────┐     │
│  │ @problematicuser commented:                    │     │
│  │ "You're such an idiot for liking this show.    │     │
│  │  Your taste is trash."                         │     │
│  │                                                 │     │
│  │ On: @gooduser's activity about The Office      │     │
│  │ Posted: Today at 3:42 PM                       │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  REPORT DETAILS                                          │
│  Reported By: @gooduser (+ 1 other user)                 │
│  Report Category: Harassment or bullying                 │
│  Reporter's Comment: "This user has been following       │
│    me around and leaving mean comments on everything"    │
│  Report Date: Today at 3:45 PM                           │
│                                                          │
│  REPORTED USER PROFILE                                   │
│  Username: @problematicuser                              │
│  Display Name: Problematic User                          │
│  Joined: 2 weeks ago                                     │
│  Total Comments: 42                                      │
│  Previous Warnings: 1 (spam, 1 week ago)                 │
│  Previous Suspensions: 0                                 │
│  [View Full Profile]                                     │
│                                                          │
│  CONTEXT (Recent Comments by This User)                  │
│  ┌────────────────────────────────────────────────┐     │
│  │ 2 hours ago on @gooduser's activity:           │     │
│  │ "Seriously? You like that garbage?"            │     │
│  │                                                 │     │
│  │ 1 day ago on @gooduser's activity:             │     │
│  │ "Typical. Bad taste as always."                │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  MODERATION DECISION                                     │
│  ○ Dismiss Report (no violation)                        │
│  ○ Warning (1st offense - educate)                      │
│  ○ Final Warning (2nd offense - serious)                │
│  ○ Temporary Suspension (3rd offense or severe)         │
│     Duration: [ 1 day ▼ ] [ 7 days ] [ 30 days ]       │
│  ○ Permanent Ban (extreme or repeat offender)           │
│                                                          │
│  ○ Delete Content (remove the reported comment)         │
│                                                          │
│  Reason (required, shown to user):                       │
│  ┌────────────────────────────────────────────────┐     │
│  │ Your comment violated our Community Guidelines │     │
│  │ against harassment. Repeated violations will   │     │
│  │ result in account suspension.                  │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  [Cancel]                              [Take Action]     │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Full context of reported content
- User history (previous violations)
- Related activity (pattern detection)
- Multiple action options
- Required reason (transparency)

### Decision Matrix

| Violation Type | 1st Offense | 2nd Offense | 3rd Offense | Severe Case |
|----------------|-------------|-------------|-------------|-------------|
| **Spam** | Warning | 7-day suspend | 30-day suspend | Ban |
| **Harassment** | Warning | 7-day suspend | Ban | Ban |
| **Hate Speech** | 7-day suspend | Ban | - | Ban |
| **Inappropriate Content** | Warning + Delete | 7-day suspend | Ban | Ban |
| **Impersonation** | Warning + Change Name | 30-day suspend | Ban | Ban |

**Notes:**
- All actions include content deletion
- Warnings include link to Community Guidelines
- Suspensions are temporary (user can't post, but can view)
- Bans are permanent (can't access account)

---

## Moderation Actions & Enforcement

### Action Types

#### 1. Dismiss Report (No Violation)
```sql
UPDATE reports
SET status = 'dismissed',
    reviewed_by = :admin_user_id,
    reviewed_at = NOW(),
    dismissal_reason = :reason
WHERE id = :report_id;
```

**When to Use:**
- False report (no actual violation)
- User misunderstood guidelines
- Difference of opinion (not harassment)

**Outcome:**
- No action taken against reported user
- Reporter not notified (prevents retaliation)
- Logged for pattern detection (repeat false reporters)

#### 2. Warning (Educational)
```sql
-- Create moderation action
INSERT INTO moderation_actions (
  admin_user_id,
  target_user_id,
  action_type,
  reason,
  details
) VALUES (
  :admin_id,
  :user_id,
  'warn',
  :reason,
  jsonb_build_object('report_id', :report_id, 'strike_number', 1)
);

-- Update user profile
UPDATE profiles
SET account_status = 'warned',
    warning_count = warning_count + 1
WHERE id = :user_id;

-- Mark report as actioned
UPDATE reports
SET status = 'actioned',
    reviewed_by = :admin_id,
    reviewed_at = NOW()
WHERE id = :report_id;
```

**Warning Notification (sent to user):**
```
Subject: Community Guidelines Reminder

Hi @username,

We received a report about one of your recent actions on Been Watching. After reviewing, we found it violated our Community Guidelines on [harassment/spam/etc].

Reported Content:
"[exact content that violated guidelines]"

What This Means:
• This is a formal warning
• No restrictions on your account (yet)
• Future violations may result in suspension

What You Can Do:
• Review our Community Guidelines: beenwatching.com/guidelines
• Ask questions: Reply to this email
• Appeal this decision: beenwatching.com/appeal

We want Been Watching to be welcoming for everyone. Thanks for understanding.

- The Been Watching Team
```

#### 3. Temporary Suspension
```sql
-- Create moderation action
INSERT INTO moderation_actions (
  admin_user_id,
  target_user_id,
  action_type,
  reason,
  details,
  expires_at
) VALUES (
  :admin_id,
  :user_id,
  'suspend',
  :reason,
  jsonb_build_object('report_id', :report_id, 'duration_days', :days),
  NOW() + INTERVAL ':days days'
);

-- Update user profile
UPDATE profiles
SET account_status = 'suspended',
    suspended_until = NOW() + INTERVAL ':days days',
    suspension_reason = :reason
WHERE id = :user_id;
```

**Suspended User Experience:**
- Can log in and view content
- **Cannot** post, rate, comment, or follow
- Banner at top: "Your account is suspended until [date]"
- Link to appeal process

#### 4. Permanent Ban
```sql
-- Create moderation action
INSERT INTO moderation_actions (
  admin_user_id,
  target_user_id,
  action_type,
  reason,
  details
) VALUES (
  :admin_id,
  :user_id,
  'ban',
  :reason,
  jsonb_build_object('report_id', :report_id, 'permanent', true)
);

-- Update user profile
UPDATE profiles
SET account_status = 'banned',
    ban_reason = :reason,
    banned_at = NOW()
WHERE id = :user_id;

-- Optionally: Soft delete all user content
-- (Keep in database for legal/audit, hide from public)
```

**Banned User Experience:**
- Cannot log in
- Redirect to "Account Suspended" page
- Shows reason for ban
- Link to appeal process (if applicable)

#### 5. Delete Content
```sql
-- Soft delete (preferred)
UPDATE activities
SET deleted = true,
    deleted_at = NOW(),
    deleted_by = :admin_id,
    deletion_reason = :reason
WHERE id = :activity_id;

-- OR for comments:
UPDATE comments
SET deleted = true,
    deleted_at = NOW(),
    deleted_by = :admin_id,
    deletion_reason = :reason
WHERE id = :comment_id;
```

**Why Soft Delete?**
- Audit trail preserved
- Legal compliance (may need to show content later)
- Pattern detection (identify repeat offenders)
- Can restore if decision reversed

---

## Community Guidelines

### Public-Facing Document

**URL:** `beenwatching.com/guidelines`

**Sections:**

#### 1. Welcome & Philosophy
```
Been Watching is a community for TV and movie lovers to share what they're watching, discover new content, and connect with others who share their interests.

Our Community Guidelines help ensure Been Watching remains:
• Safe and welcoming for everyone
• Respectful and constructive
• Focused on TV and movies
• Free from spam and abuse
```

#### 2. What's Allowed ✅
- Honest opinions about shows and movies
- Constructive criticism
- Sharing recommendations
- Respectful disagreement
- Discussion of content within shows (spoiler tags encouraged)

#### 3. What's Not Allowed ❌

**Harassment & Bullying**
- Personal attacks on other users
- Targeted, repeated unwanted contact
- Threats of any kind
- Doxxing (sharing personal information)
- Encouraging others to harass someone

**Spam & Manipulation**
- Repetitive, identical content
- Mass following/unfollowing
- Artificial engagement (coordinated likes, etc.)
- Commercial promotions unrelated to TV/movies
- Bot accounts

**Hate Speech**
- Content attacking people based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics
- Slurs or dehumanizing language
- Symbols or imagery of hate groups

**Inappropriate Content**
- Sexually explicit material
- Graphic violence or gore (outside of show/movie discussion)
- Self-harm or suicide content
- Content exploiting or endangering children

**Impersonation**
- Pretending to be another person, brand, or organization
- Fake celebrity or public figure accounts
- Misleading profile information

#### 4. Enforcement
```
Violations may result in:
1. Warning - First offenses (usually)
2. Temporary Suspension - 1-30 days
3. Permanent Ban - Severe or repeated violations

We review all reports within 24 hours and apply these guidelines consistently.
```

#### 5. Reporting & Appeals
```
Report: Use the report button (⋯ menu) on any content
Appeal: Email appeals@beenwatching.com within 7 days
Questions: Email support@beenwatching.com
```

---

## Database Schema

### Enhanced Schema (Adds to existing tables)

```sql
-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who reported
  reporter_user_id UUID NOT NULL REFERENCES profiles(id),

  -- What was reported (one of these will be set)
  reported_user_id UUID REFERENCES profiles(id),
  reported_activity_id UUID REFERENCES activities(id),
  reported_comment_id UUID REFERENCES comments(id),
  reported_show_note_id UUID REFERENCES show_comments(id),

  -- Report details
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'harassment',
    'hate_speech',
    'inappropriate_content',
    'impersonation',
    'other'
  )),
  description TEXT, -- Optional additional context

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'actioned',
    'dismissed'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN (
    'low',
    'normal',
    'high',
    'urgent'
  )),

  -- Admin review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  dismissal_reason TEXT, -- If dismissed, why?

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT report_target_check CHECK (
    (reported_user_id IS NOT NULL)::INTEGER +
    (reported_activity_id IS NOT NULL)::INTEGER +
    (reported_comment_id IS NOT NULL)::INTEGER +
    (reported_show_note_id IS NOT NULL)::INTEGER = 1
  )
);

-- Indexes for performance
CREATE INDEX idx_reports_status ON reports(status, priority, created_at DESC);
CREATE INDEX idx_reports_reporter ON reports(reporter_user_id, created_at DESC);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id) WHERE reported_user_id IS NOT NULL;
CREATE INDEX idx_reports_reviewed_by ON reports(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- ============================================
-- MODERATION ACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who did it
  admin_user_id UUID NOT NULL REFERENCES profiles(id),

  -- To whom
  target_user_id UUID NOT NULL REFERENCES profiles(id),

  -- What action
  action_type TEXT NOT NULL CHECK (action_type IN (
    'warn',
    'suspend',
    'ban',
    'delete_content',
    'restore'
  )),

  -- Why
  reason TEXT NOT NULL, -- Admin-written explanation
  details JSONB, -- Additional structured data

  -- For suspensions
  expires_at TIMESTAMPTZ, -- When suspension ends

  -- Link to report (if applicable)
  related_report_id UUID REFERENCES reports(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_user_id, created_at DESC);
CREATE INDEX idx_moderation_actions_admin ON moderation_actions(admin_user_id, created_at DESC);
CREATE INDEX idx_moderation_actions_type ON moderation_actions(action_type, created_at DESC);

-- ============================================
-- UPDATE PROFILES TABLE
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'
CHECK (account_status IN ('active', 'warned', 'suspended', 'banned'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Index for moderation queries
CREATE INDEX idx_profiles_account_status ON profiles(account_status);

-- ============================================
-- SOFT DELETE COLUMNS (Add to existing tables)
-- ============================================
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE show_comments
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Indexes for soft delete queries
CREATE INDEX idx_activities_deleted ON activities(deleted, created_at DESC);
CREATE INDEX idx_comments_deleted ON comments(deleted, created_at DESC);
CREATE INDEX idx_show_comments_deleted ON show_comments(deleted, created_at DESC);

-- ============================================
-- BLOCK/MUTE FUNCTIONALITY
-- ============================================
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user_id UUID NOT NULL REFERENCES profiles(id),
  blocked_user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_user_id, blocked_user_id)
);

CREATE TABLE IF NOT EXISTS user_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_user_id UUID NOT NULL REFERENCES profiles(id),
  muted_user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(muter_user_id, muted_user_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_user_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_user_id);
CREATE INDEX idx_user_mutes_muter ON user_mutes(muter_user_id);
CREATE INDEX idx_user_mutes_muted ON user_mutes(muted_user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is suspended (expired suspensions auto-restore)
CREATE OR REPLACE FUNCTION check_user_suspension(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  status TEXT;
  suspended_until TIMESTAMPTZ;
BEGIN
  SELECT account_status, profiles.suspended_until
  INTO status, suspended_until
  FROM profiles
  WHERE id = user_id;

  -- If suspended but time expired, restore account
  IF status = 'suspended' AND suspended_until IS NOT NULL AND NOW() > suspended_until THEN
    UPDATE profiles
    SET account_status = 'active',
        suspended_until = NULL
    WHERE id = user_id;
    RETURN false;
  END IF;

  RETURN status IN ('suspended', 'banned');
END;
$$ LANGUAGE plpgsql;

-- Get strike count for user
CREATE OR REPLACE FUNCTION get_user_strike_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM moderation_actions
  WHERE target_user_id = user_id
  AND action_type IN ('warn', 'suspend')
  AND created_at > NOW() - INTERVAL '90 days'; -- Only count strikes from last 90 days
$$ LANGUAGE sql;

-- Auto-prioritize reports with multiple reporters
CREATE OR REPLACE FUNCTION auto_prioritize_reports()
RETURNS TRIGGER AS $$
BEGIN
  -- If same user/content reported by multiple people, bump priority
  UPDATE reports
  SET priority = CASE
    WHEN (
      SELECT COUNT(DISTINCT reporter_user_id)
      FROM reports r2
      WHERE r2.reported_user_id = NEW.reported_user_id
      AND r2.status = 'pending'
    ) >= 3 THEN 'urgent'
    WHEN (
      SELECT COUNT(DISTINCT reporter_user_id)
      FROM reports r2
      WHERE r2.reported_user_id = NEW.reported_user_id
      AND r2.status = 'pending'
    ) >= 2 THEN 'high'
    ELSE priority
  END
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_prioritize_reports
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION auto_prioritize_reports();
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1) ✅ COMPLETED (2025-10-30)

**Database Setup:**
- [x] Create reports table (schema designed)
- [x] Create moderation_actions table (schema designed)
- [x] Add account_status columns to profiles (schema designed)
- [x] Add soft delete columns to content tables (schema designed)
- [x] Create indexes (schema designed)
- [ ] Run database migrations (pending)

**User-Facing:**
- [x] ~~Add report button to activity cards~~ (removed - activities don't need reporting)
- [x] Add report button to comments (via DropdownMenu)
- [x] Add report button to user profiles (UserCard + profile page)
- [x] Build report modal component (ReportModal.tsx)
- [x] Implement report submission (direct Supabase insert)

**Admin-Facing:**
- [x] Basic reports queue page (/admin/moderation/reports)
- [x] Display pending reports (overview dashboard)
- [x] Flagged content page (/admin/moderation/flagged)
- [x] Moderation log page (/admin/moderation/log)
- [x] Ban list page (/admin/moderation/bans)
- [ ] Dismiss report functionality (UI ready, backend pending)

**Testing:**
- [ ] Submit test reports
- [ ] Verify database records created
- [ ] Test dismiss functionality

**Implementation Notes:**
- Created reusable DropdownMenu component for three-dot menus
- Used styled-jsx to fix event handler errors in Client Components
- Only reporting user-generated content (comments, profiles) per best practices
- Fixed AppHeader avatar display issue

### Phase 2: Moderation Actions (Week 2)

**Admin Tools:**
- [ ] Report detail view
- [ ] Warning action implementation
- [ ] Suspension action implementation
- [ ] Ban action implementation
- [ ] Content deletion implementation

**User Experience:**
- [ ] Suspended user flow (can view, can't post)
- [ ] Banned user flow (can't log in)
- [ ] Warning notification (in-app + email)

**Notifications:**
- [ ] Email templates for warnings
- [ ] Email templates for suspensions
- [ ] Email templates for bans

### Phase 3: Prevention & Scale (Week 3+)

**User-Facing:**
- [ ] Block user functionality
- [ ] Mute user functionality
- [ ] Appeal process page

**Admin Enhancements:**
- [ ] Pattern detection (repeat offenders)
- [ ] Bulk moderation actions
- [ ] Moderation statistics dashboard
- [ ] Community Guidelines page

**Automation (Future):**
- [ ] Auto-flag spam patterns
- [ ] Auto-flag hate speech (using AI/ML)
- [ ] Auto-delete obvious spam
- [ ] Proactive detection

---

## Automation & Scaling

### When to Automate (Not Now, But Plan Ahead)

**Alpha (10-100 users):** Manual review is fine and preferred
**Beta (100-500 users):** Consider basic automation
**Scale (1000+ users):** Automation required

### Automation Levels

#### Level 1: Detection Only (Beta Stage)
- Flag suspicious patterns
- Still requires human review
- No automatic actions

**Patterns to Detect:**
```sql
-- Spam pattern: Many identical comments
SELECT user_id, content, COUNT(*)
FROM comments
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id, content
HAVING COUNT(*) >= 5;

-- Bot pattern: Rapid rating creation
SELECT user_id, COUNT(*) as rating_count
FROM ratings
WHERE created_at > NOW() - INTERVAL '5 minutes'
GROUP BY user_id
HAVING COUNT(*) >= 20;

-- Harassment pattern: Multiple comments on one user's content
SELECT c.user_id as commenter, a.user_id as target, COUNT(*) as comment_count
FROM comments c
JOIN activities a ON c.activity_id = a.id
WHERE c.created_at > NOW() - INTERVAL '24 hours'
GROUP BY c.user_id, a.user_id
HAVING COUNT(*) >= 10;
```

#### Level 2: Automatic Actions (Scale Stage)
- Auto-delete obvious spam
- Auto-suspend proven bot accounts
- Auto-flag for review

**Only automate when:**
- Pattern is 99%+ accurate
- Action is reversible
- Human review happens within 24 hours

### Third-Party Tools (If Needed at Scale)

**Content Moderation APIs:**
- **Perspective API** (Google) - Toxicity detection
- **OpenAI Moderation API** - Hate speech, violence, sexual content
- **Microsoft Azure Content Moderator**

**When to Use:**
- 1000+ reports per month
- Budget for API costs ($0.001-0.01 per check)
- Need faster response times

**Implementation:**
```typescript
// Example: Check comment for toxicity before posting
import Perspective from 'perspective-api-client';

async function checkCommentToxicity(text: string) {
  const perspective = new Perspective({ apiKey: process.env.PERSPECTIVE_API_KEY });

  const result = await perspective.analyze({
    comment: { text },
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      INSULT: {},
      THREAT: {}
    }
  });

  const toxicity = result.attributeScores.TOXICITY.summaryScore.value;

  if (toxicity > 0.8) {
    // Auto-flag for review
    return { allowed: false, reason: 'high_toxicity' };
  } else if (toxicity > 0.6) {
    // Post but flag
    return { allowed: true, flagged: true };
  }

  return { allowed: true, flagged: false };
}
```

---

## Legal & Safety Considerations

### Required Pages (Legal Compliance)

1. **Community Guidelines** - What's allowed/not allowed
2. **Terms of Service** - Legal agreement
3. **Privacy Policy** - How data is used
4. **DMCA Policy** - Copyright infringement process

### Data Retention

**Reports:**
- Keep indefinitely (legal protection)
- Anonymize reporter after 90 days (privacy)

**Moderation Actions:**
- Keep indefinitely (audit trail)
- Required for legal defense

**Deleted Content:**
- Soft delete (keep in database)
- Hide from public view
- Retain for 30-90 days minimum

### Liability Protection (IMPORTANT)

**Section 230 Protection (US):**
- You're not liable for user-generated content
- BUT you must moderate in good faith
- Cannot be arbitrary or discriminatory

**Best Practices:**
1. Have clear, public Community Guidelines
2. Enforce them consistently
3. Document all moderation decisions
4. Provide appeal process
5. Respond to legal requests promptly

### When to Involve Legal/Law Enforcement

**Immediate Law Enforcement Contact:**
- Credible threats of violence
- Child exploitation content
- Terrorism or extremism
- Human trafficking

**Legal Consultation:**
- Copyright disputes (DMCA claims)
- Defamation claims
- Subpoenas or legal requests
- High-profile account bans

**Do NOT:**
- Try to investigate crimes yourself
- Warn users who may be under investigation
- Delete evidence of illegal activity (preserve and report)

---

## Success Metrics

### Alpha Stage Goals

- [ ] Average report review time < 24 hours
- [ ] 100% of reports reviewed by admins
- [ ] Zero false positives (wrongly banned users)
- [ ] Clear moderation decision documentation

### Beta Stage Goals

- [ ] Average report review time < 12 hours
- [ ] < 5% report appeal rate
- [ ] < 1% of users with warnings/suspensions
- [ ] Consistent enforcement (no bias)

### Scale Stage Goals

- [ ] Average report review time < 4 hours
- [ ] 90%+ report accuracy (correct decisions)
- [ ] < 0.5% of users banned
- [ ] Positive community sentiment

---

## Appendix

### Report Statistics Dashboard (Admin)

**Metrics to Track:**

1. **Volume Metrics:**
   - Total reports (daily, weekly, monthly)
   - Reports by category
   - Reports by status (pending, actioned, dismissed)

2. **Response Metrics:**
   - Average time to review
   - % reviewed within 24 hours
   - Admin workload distribution

3. **Action Metrics:**
   - Warnings issued
   - Suspensions issued
   - Bans issued
   - Content deletions

4. **Quality Metrics:**
   - Appeal rate
   - False report rate
   - Repeat offender rate

### Templates for Notifications

**Warning Email Template:**
```
Subject: Community Guidelines Reminder - Action Required

Hi @{username},

We're reaching out about a recent action on Been Watching that didn't align with our Community Guidelines.

What Happened:
{description of violation}

The Reported Content:
"{exact content}"

What This Means:
• This is a formal warning
• Your account remains active
• Future violations may result in suspension or ban

What You Should Do:
1. Review our Community Guidelines: {link}
2. Avoid similar behavior in the future
3. Reach out if you have questions: support@beenwatching.com

You can appeal this decision within 7 days: {appeal_link}

We believe in second chances and want you to remain part of our community. Thanks for your understanding.

- The Been Watching Team
```

**Suspension Email Template:**
```
Subject: Account Suspended - {duration}

Hi @{username},

Your Been Watching account has been temporarily suspended.

Reason: {reason}

Duration: {days} days (until {date})

What This Means:
• You can still view content
• You cannot post, rate, comment, or follow
• This suspension will automatically lift on {date}

What You Can Do:
• Review our Community Guidelines: {link}
• Appeal this decision (within 7 days): {appeal_link}
• Contact support with questions: support@beenwatching.com

We take these actions seriously to keep Been Watching safe and welcoming for everyone.

- The Been Watching Team
```

---

## Conclusion

This reporting and moderation system is designed to:

✅ **Start simple** - Manual review for alpha stage
✅ **Scale gracefully** - Database schema supports automation later
✅ **Protect users** - Clear guidelines, fast response times
✅ **Protect the platform** - Legal compliance, audit trails
✅ **Stay fair** - Transparent process, appeals allowed

The key is to implement the foundation now (Phase 1) so you're ready as you grow, but not over-engineer before you need it.

---

**Next Steps:**
1. ✅ ~~Review and approve this design~~ (COMPLETED)
2. ⏳ Create and run database migrations (NEXT)
3. ✅ ~~Build user-facing report button~~ (COMPLETED)
4. ✅ ~~Build admin reports queue~~ (COMPLETED)
5. ⏳ Write Community Guidelines page (PENDING)
6. ⏳ Test with alpha users (PENDING)
7. ⏳ Implement moderation action handlers (PENDING)

**Questions to Resolve:**
- Who will be primary moderators? (You? Delegate?)
- Email address for appeals? (appeals@beenwatching.com)
- How many warnings before suspension? (Suggestion: 3 strikes)
- Auto-delete content on ban, or keep visible? (Suggestion: delete)

---

## Implementation Update (2025-10-30)

### Completed Work ✅
- Built all 5 moderation admin pages (overview, reports, flagged, log, bans)
- Created ReportModal component with 6 report categories
- Created reusable DropdownMenu component
- Integrated reporting into comments (ActivityCard)
- Integrated reporting into user profiles (UserCard + profile page)
- Fixed AppHeader avatar display issue
- Applied glassmorphism theme consistently

### Files Created
- `/app/admin/moderation/page.tsx` - Server component for stats
- `/app/admin/moderation/ModerationOverview.tsx` - Overview dashboard
- `/app/admin/moderation/reports/page.tsx` - Reports queue
- `/app/admin/moderation/flagged/page.tsx` - Flagged content
- `/app/admin/moderation/log/page.tsx` - Moderation log
- `/app/admin/moderation/bans/page.tsx` - Ban list
- `/components/moderation/ReportModal.tsx` - Report submission modal
- `/components/ui/DropdownMenu.tsx` - Three-dot menu component

### Files Modified
- `/components/feed/ActivityCard.tsx` - Added comment reporting
- `/components/friends/UserCard.tsx` - Added user reporting
- `/app/[username]/page.tsx` - Added profile reporting + fixed avatar

### Pending Work ⏳
- Run database migrations to create tables
- Implement moderation action handlers (backend)
- Add email notifications
- Create Community Guidelines page
- Test reporting flow end-to-end
- Implement block/mute functionality

### Key Decisions Made
1. **Only report user-generated content:** Comments and profiles only, NOT activity cards (ratings/watching status)
2. **Three-dot menu pattern:** Industry standard from Instagram/Twitter
3. **Anonymous reporting:** Reporter identity not revealed
4. **Styled-jsx for hover states:** Avoids event handler errors in Client Components

---

**Document Status:** ✅ Phase 1 Complete - Testing Ready
**Version:** 1.1
**Date:** October 29, 2025 (Updated: October 30, 2025)
**Next Review:** After database migrations and testing

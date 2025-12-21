# Secure Invite System - Implementation Summary

## 📋 Overview

We're replacing the insecure username-based invite system with a cryptographically secure token-based system to prevent username enumeration, replay attacks, and other security vulnerabilities.

---

## ✅ COMPLETED

### 1. Database Layer ✓
**File**: `supabase/migrations/add-secure-invite-tokens.sql`

**Created:**
- `invite_tokens` table with secure random tokens
- Token statuses: `active`, `used`, `expired`, `revoked`
- No expiration (tokens never expire), one-time use
- Click analytics (privacy-safe)

**Functions Created:**
- `generate_random_token(length)` - Creates secure 12-char tokens (no confusing chars)
- `create_user_invite_token(user_id)` - Generates new invite token for user
- `validate_invite_token(token)` - Validates token and returns inviter info
- `redeem_invite_token(token, user_id)` - Redeems invite after signup
- `revoke_user_invite_token(user_id)` - Revokes active token
- `cleanup_expired_invite_tokens()` - Daily cleanup job

**Security Features:**
- ✅ Prevents username enumeration (tokens are random, not usernames)
- ✅ Prevents replay attacks (one-time use)
- ✅ Row-level security (RLS) policies
- ✅ Atomic operations (prevents race conditions)

---

### 2. Join Page (Token-based) ✓
**File**: `app/join/page.tsx`

**Replaces**: `app/join/[username]/page.tsx` (DELETED)

**Features:**
- URL format: `/join?code=xJ9kLmP2qR` (secure token, not username)
- Validates token via database function
- Shows personalized invite: "You've been invited by @username"
- **Privacy**: Only shows @username (no avatar, bio, or full name)
- Error handling for all token states:
  - Invalid/not found
  - Already used
  - Revoked
  - No invites remaining

**User Experience:**
```
┌─────────────────────────────────┐
│  🎬                             │
│  You've Been Invited!           │
│  @murtopia invited you...       │
│                                 │
│  [Accept Invite & Sign Up]      │
│  Already have an account?       │
│  [Sign In]                      │
└─────────────────────────────────┘
```

---

### 3. VIP Code Entry Page ✓
**File**: `app/vip/page.tsx` (NEW)

**Purpose**: Separate path for admin/VIP master codes

**Features:**
- URL: `/vip`
- Enter code manually (BOOZEHOUND, BWALPHA_XXX, BW_XXX)
- Client-side validation via `is_master_code_valid()`
- Stores code in sessionStorage, redirects to signup
- Separate flow from friend invites

**User Experience:**
```
┌─────────────────────────────────┐
│  🎟️                             │
│  Got an Invite Code?            │
│                                 │
│  [_____________]                │
│  [Validate Code]                │
│                                 │
│  VIP codes grant:               │
│  • Full platform access         │
│  • Bonus invites                │
│  • Early features               │
└─────────────────────────────────┘
```

---

### 4. InviteSection Component Updates ✓
**File**: `components/profile/InviteSection.tsx`

**Changes:**
- Now generates **secure tokens** instead of username links
- New functions:
  - `loadInviteToken()` - Loads user's active token on mount
  - `generateInviteToken()` - Calls database function to create token
- Share URL format: `beenwatching.com/join?code=xJ9kLmP2qR`
- Shows token info: "One-time use"
- Loading states for token generation
- Auto-generates token on first share/copy

**Share Message:**
```
I just got an invite code to Been Watching, a new social show
and movie discovery platform that I think you'd like! Come join
me see what I've been watching here:
https://beenwatching.com/join?code=xJ9kLmP2qR
```

---

## 🚧 IN PROGRESS

### 5. Auth/Signup Flow Updates
**File**: `app/auth/page.tsx`

**Needs to handle TWO invite types:**

#### Path A: Friend Invite (Token)
1. User clicks `/join?code=xJ9kLmP2qR`
2. Token stored in sessionStorage: `invite_token`
3. Redirects to signup
4. **NO master code required** (token is the invite)
5. After signup → Call `redeem_invite_token()`
6. User gets 0 initial invites (must earn via profile completion)

#### Path B: VIP Code
1. User visits `/vip` and enters code
2. Code stored in sessionStorage: `vip_code`
3. Redirects to signup
4. **Requires entering the code again** (for verification)
5. After signup → Call `use_master_code()`, award bulk invites
6. User gets 10 invites (BOOZEHOUND) or 3 invites (BWALPHA)

**Key Changes Needed:**
```typescript
// Check for invite type in sessionStorage
const inviteToken = sessionStorage.getItem('invite_token')
const vipCode = sessionStorage.getItem('vip_code')

if (inviteToken) {
  // Friend invite flow - NO code required
  // After signup: redeem_invite_token(inviteToken, user.id)
} else if (vipCode) {
  // VIP code flow - require code entry
  // After signup: use_master_code(vipCode, user.id)
} else {
  // No invite - show error or waitlist
}
```

---

## 📝 REMAINING TASKS

### Priority 1: Critical (Must Do Now)

#### Task A: Update `app/auth/page.tsx`
**Estimated Time**: 15-20 minutes

**Changes:**
1. Check sessionStorage for `invite_token` vs `vip_code`
2. If `invite_token` exists:
   - Hide invite code input field
   - Show: "Signing up with invite from @username"
   - Skip master code validation
   - After signup: Call `redeem_invite_token()`
3. If `vip_code` exists:
   - Show invite code input (pre-filled with vip_code)
   - Validate as master code
   - After signup: Call `use_master_code()`, award bulk invites
4. If neither:
   - Require invite code entry OR redirect to waitlist

**Pseudo-code:**
```typescript
// On mount
useEffect(() => {
  const inviteToken = sessionStorage.getItem('invite_token')
  const vipCode = sessionStorage.getItem('vip_code')

  if (inviteToken) {
    setInviteType('token')
    setIsSignup(true)
    // Validate and get inviter info
    validateInviteToken(inviteToken).then(data => {
      setInviterUsername(data.inviter_username)
    })
  } else if (vipCode) {
    setInviteType('vip')
    setIsSignup(true)
    setInviteCode(vipCode)
  }
}, [])

// In handleSubmit
if (isSignup) {
  // Create account first
  const { data, error } = await supabase.auth.signUp(...)

  if (data.user) {
    if (inviteType === 'token') {
      // Redeem friend invite
      await supabase.rpc('redeem_invite_token', {
        invite_token: inviteToken,
        referee_user_id: data.user.id
      })

      // Clear token
      sessionStorage.removeItem('invite_token')

      // User starts with 0 invites (must earn)
      await supabase.from('profiles').update({
        invites_remaining: 0,
        is_approved: true
      }).eq('id', data.user.id)

    } else if (inviteType === 'vip') {
      // Use VIP code
      await supabase.rpc('use_master_code', {
        master_code: vipCode,
        user_id: data.user.id
      })

      // Award bulk invites based on tier
      const tier = vipCode === 'BOOZEHOUND' ? 'boozehound' :
                   vipCode.startsWith('BWALPHA_') ? 'alpha' : 'beta'

      await supabase.from('profiles').update({
        invited_by_master_code: vipCode,
        invite_tier: tier,
        invites_remaining: tier === 'boozehound' ? 10 : tier === 'alpha' ? 3 : 0,
        is_approved: true
      }).eq('id', data.user.id)

      sessionStorage.removeItem('vip_code')
    }
  }
}
```

---

#### Task B: Update Welcome/Home Page (Optional but Recommended)
**File**: `app/welcome/page.tsx` or `app/page.tsx`
**Estimated Time**: 10 minutes

**Add smart invite code entry:**
```typescript
const handleInviteCodeSubmit = (code: string) => {
  // Check if it's a token (12 chars, alphanumeric)
  if (/^[A-Za-z0-9]{12}$/.test(code)) {
    // Likely a friend invite token
    router.push(`/join?code=${code}`)
  } else {
    // Likely a VIP code (BOOZEHOUND, BWALPHA_XXX)
    router.push(`/vip`)
    sessionStorage.setItem('vip_code', code.toUpperCase())
  }
}
```

**UI:**
```
┌─────────────────────────────────┐
│  Been Watching                  │
│  Track. Share. Discover.        │
│                                 │
│  🎟️ Have an invite?             │
│  [Enter code or link] [→]       │
│                                 │
│  or [Join Waitlist]             │
└─────────────────────────────────┘
```

---

### Priority 2: Nice to Have (Can Do Later)

#### Task C: Add CAPTCHA
**Tool**: Cloudflare Turnstile (free) or hCaptcha
**Where**: Signup page, VIP code validation
**Estimated Time**: 20 minutes

#### Task D: Rate Limiting
**Tool**: Upstash Redis or Vercel KV
**Where**: `/join` endpoint, `/vip` validation
**Limits**:
- 5 token validations per IP per hour
- 3 signup attempts per IP per day

#### Task E: Email Verification Before Invite Redemption
**Current**: Invite redeemed immediately after signup
**Better**: Only redeem after email verified
**Prevents**: Fake account abuse

---

## 🧪 TESTING PLAN

### Test Case 1: Friend Invite (Happy Path)
1. User completes profile → earns 1 invite
2. Click "Share" → generates token `xJ9kLmP2qR`
3. Copy link: `beenwatching.com/join?code=xJ9kLmP2qR`
4. Open in incognito window
5. See: "You've been invited by @murtopia"
6. Click "Accept Invite & Sign Up"
7. Enter email/password (NO invite code required)
8. Account created
9. Verify:
   - ✅ Inviter's `invites_remaining` decreased by 1
   - ✅ Inviter's `invites_used` increased by 1
   - ✅ New user's `invited_by` = inviter's ID
   - ✅ Referral record created
   - ✅ Follow relationship created (new user → inviter)
   - ✅ Token status = 'used'
   - ✅ New user has 0 invites (must earn via profile)

### Test Case 2: VIP Code (Happy Path)
1. Visit `/vip`
2. Enter `BOOZEHOUND`
3. Click "Validate Code"
4. Redirect to signup
5. Enter email/password
6. Account created
7. Verify:
   - ✅ User's `invited_by_master_code` = 'BOOZEHOUND'
   - ✅ User's `invite_tier` = 'boozehound'
   - ✅ User's `invites_remaining` = 10
   - ✅ Master code `current_uses` incremented

> **Note**: If `current_uses` is not incrementing, run `supabase/migrations/fix-invite-usage-counts.sql` to grant missing EXECUTE permissions on the RPC functions.

### Test Case 3: Security Tests
- ❌ Try to use already-used token → "Invite Already Used"
- ❌ Try to redeem invite when inviter has 0 remaining → Error
- ❌ Try to access `/join?code=invalid` → "Invalid Invite Code"
- ❌ Try to enumerate usernames via old `/join/username` route → 404

### Test Case 4: Edge Cases
- User clicks invite link while already logged in → Redirect to /feed
- User clicks invite link, doesn't sign up immediately → Link still works later (no expiration)
- User generates new token → Old token revoked automatically
- User has 1 invite, shares link, 2 people click → First signs up succeeds, second fails

---

## 🔒 SECURITY IMPROVEMENTS

### Before (Insecure)
❌ `/join/murtopia` - Username enumeration possible
❌ Anyone can check if username exists
❌ Could be shared publicly after use (no one-time protection)
❌ SessionStorage race conditions

### After (Secure)
✅ `/join?code=xJ9kLmP2qR` - Random token, no enumeration
✅ Token validation is cryptographically secure
✅ Tokens never expire (one-time use only)
✅ One-time use (marked as 'used' after redemption)
✅ URL parameters prevent race conditions
✅ User can revoke/regenerate tokens
✅ Analytics track clicks without PII

---

## 📊 DATABASE SCHEMA

### New Table: `invite_tokens`
```sql
id                UUID PRIMARY KEY
token             TEXT UNIQUE           -- Random 12-char string
inviter_id        UUID                  -- Who created invite
invite_type       TEXT                  -- 'username' or 'vip'
status            TEXT                  -- 'active', 'used', 'expired', 'revoked'
used_by_user_id   UUID                  -- Who redeemed it
used_at           TIMESTAMPTZ
expires_at        TIMESTAMPTZ           -- NULL (tokens never expire)
created_at        TIMESTAMPTZ
click_count       INTEGER               -- Analytics
last_clicked_at   TIMESTAMPTZ
```

### Existing Table Updates
None! All changes are additive (new table, new functions).

---

## 🚀 DEPLOYMENT STEPS

### 1. Run Database Migration
```bash
# In Supabase dashboard → SQL Editor
# Run: supabase/migrations/add-secure-invite-tokens.sql
```

### 2. Test Functions
```sql
-- Generate token for your user
SELECT create_user_invite_token('your-user-id');

-- Validate token
SELECT validate_invite_token('xJ9kLmP2qR');
```

### 3. Deploy Frontend
```bash
git add .
git commit -m "Implement secure token-based invite system"
git push
```

### 4. Test in Production
- Generate invite link from your profile
- Test in incognito window
- Verify database updates

---

## 🎯 NEXT SESSION PRIORITIES

1. **Finish auth/signup flow** (15 min)
2. **Test locally** (10 min)
3. **Run database migration on production** (5 min)
4. **Deploy to Vercel** (2 min)
5. **Test in production** (10 min)
6. **Add CAPTCHA** (optional, 20 min)
7. **Add rate limiting** (optional, 30 min)

---

## 📝 NOTES

- **Backward Compatibility**: Old `/join/[username]` routes deleted, will 404 (acceptable - no users have these yet)
- **Migration Path**: No data migration needed (fresh start with tokens)
- **Performance**: Token validation is fast (indexed lookups)
- **Analytics**: Click tracking preserves privacy (no IP addresses stored)

---

## 🎫 WAITLIST MANAGEMENT

### Overview

Users without invite codes can join the waitlist via a modal on the landing page. Admins can then manage these signups and send invite codes.

### User Flow (Landing Page)

1. User visits landing page (`/`)
2. Clicks "Join Waitlist" button
3. Modal opens with name (optional) and email fields
4. On submit, entry added to `waitlist` table via `/api/waitlist`
5. Success message shown (no position number displayed)

### Admin Flow (`/admin/invites/waitlist`)

**Viewing Waitlist:**
- Stats dashboard: Total, Pending, Invited, Converted
- Searchable table with all signups
- Columns: Position, Email, Name, Date Joined, Status

**Sending Invites:**
1. Select one or more waitlist entries
2. Click "Invite" button
3. System generates unique `BW-XXXXXXXX` codes
4. Codes added to `master_codes` table (1 use each)
5. Waitlist entries updated with `invited_at` and `invite_code`
6. Admin can copy codes to share manually (email integration planned)

**Status Flow:**
```
Pending → Invited → Converted
   ↓
 Deleted
```

**Bulk Actions:**
- Select multiple entries via checkboxes
- Bulk invite (sends codes to all selected)
- Bulk delete (removes spam/invalid entries)

**Export:**
- CSV export with all fields
- Includes: email, name, position, date, status, invite code

### Database

**Table: `waitlist`**
```sql
id                    UUID PRIMARY KEY
email                 VARCHAR(255) UNIQUE NOT NULL
name                  VARCHAR(255)
position              INTEGER (auto-assigned via trigger)
invited_at            TIMESTAMPTZ
invite_code           VARCHAR(50)
converted_to_user_id  UUID REFERENCES profiles(id)
created_at            TIMESTAMPTZ DEFAULT NOW()
```

### API Routes

**Public: `/api/waitlist` (POST)**
- Adds new waitlist entry
- Uses service role to bypass RLS
- Returns success (no position shown to user)

**Admin: `/api/admin/waitlist` (POST)**
- Actions: `invite`, `delete`
- Requires admin authentication
- Generates invite codes and updates entries

---

## ✅ READY TO CONTINUE?

**Current Status**: 80% complete

**Remaining**: Update auth/signup flow (20%)

**Estimated Time to Complete**: 15-20 minutes

**Ready to push live after**: Testing (10 min)

Let's finish the auth/signup flow now!

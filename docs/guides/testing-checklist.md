# Testing Checklist - Recent Updates

**Date**: October 25, 2025
**Session**: Invite System V2, URL Restructure, and Bug Fixes

---

## 🎯 Invite System V2

### Profile Completion Requirements
- [ ] **Visit `/profile` page**
- [ ] **Check invite section displays 6 completion tasks:**
  - [ ] ☐ Add avatar
  - [ ] ☐ Write bio
  - [ ] ☐ Select top 3 shows
  - [ ] ☐ Add shows to Want to Watch
  - [ ] ☐ Add shows to Currently Watching
  - [ ] ☐ Add shows to Watched
- [ ] **Complete all 6 tasks**
- [ ] **Verify "Share" button appears after completion**
- [ ] **Verify invite count shows "1 invite available"**

### Invite Sharing
- [ ] **Click "Share" button**
- [ ] **On iOS/Mac with Safari:** Native share sheet appears
- [ ] **On other browsers:** Link copied to clipboard notification
- [ ] **Verify share URL format:** `beenwatching.app/join/[your-username]`
- [ ] **Test invite link in incognito/private window**
- [ ] **Verify landing page shows:**
  - [ ] Your name/avatar
  - [ ] "Join Been Watching" CTA
  - [ ] Sign up button

### Invite Redemption
- [ ] **Share invite link with test user**
- [ ] **Test user clicks link and signs up**
- [ ] **Verify your invite count decreases to 0**
- [ ] **Verify "⏳ Invite Used" status appears**
- [ ] **Verify test user auto-follows you**
- [ ] **Check your follower count increased by 1**

### Referral Dashboard
- [ ] **Visit `/profile` page**
- [ ] **Scroll to "People You've Invited" section**
- [ ] **Verify invited user appears with:**
  - [ ] Their avatar
  - [ ] Their display name
  - [ ] Status badge (Pending/Joined/Active)
  - [ ] Joined date
- [ ] **Click on invited user**
- [ ] **Verify navigates to their profile**

### Used Invite Links
- [ ] **After invite is used, share same link to another person**
- [ ] **Verify they see "Invite link already used"**
- [ ] **Verify waitlist CTA appears**

---

## 🔗 URL Structure Improvements

### Profile URL Changes
- [ ] **Visit your profile**
- [ ] **Verify URL is:** `beenwatching.app/[username]` (not `/user/[username]`)
- [ ] **Click on another user from feed**
- [ ] **Verify their URL is:** `beenwatching.app/[their-username]`
- [ ] **Test old URL format:** `beenwatching.app/user/[username]`
- [ ] **Verify old URLs still work OR redirect to new format**

### Internal Links
- [ ] **Check feed activity cards link to new URL format**
- [ ] **Check notification clicks link to new URL format**
- [ ] **Check search results link to new URL format**
- [ ] **Check referral dashboard links to new URL format**
- [ ] **Check follower/following lists link to new URL format**
- [ ] **Check Top 3 shows on user profiles link correctly**

---

## 🐛 Bug Fixes

### Watch List Removal
- [ ] **Go to `/myshows` page**
- [ ] **Find a show in your "Watched" list**
- [ ] **Click the poster to open detail modal**
- [ ] **Click "✓ Watched" button to uncheck**
- [ ] **Verify confirmation dialog appears**
- [ ] **Confirm removal**
- [ ] **Verify show is removed from list**
- [ ] **Repeat test for "Want to Watch" list**
- [ ] **Repeat test for "Currently Watching" list**
- [ ] **Test removal from search modal**
- [ ] **Test removal from feed page**

### Year Display Bug
- [ ] **Search for "Starship" (2024 movie)**
- [ ] **Verify year shows as "2024" (not "20240")**
- [ ] **Check year in search results**
- [ ] **Check year in detail modal**
- [ ] **Check year in your watch lists**
- [ ] **Check year in feed activities**
- [ ] **Test with other 2024 movies/shows**
- [ ] **Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R) if still seeing old data**

### Top 3 Shows Styling

#### Dark Mode Empty Slots
- [ ] **Switch to dark mode**
- [ ] **Visit a user profile with incomplete Top 3** (e.g., `/toddw493`)
- [ ] **Verify empty slots show:**
  - [ ] Dark background (not white boxes)
  - [ ] "+" icon visible
  - [ ] "Not set" text visible
  - [ ] Dashed border outline
  - [ ] Numbered badge (1, 2, 3)

#### Glowing Outline
- [ ] **Visit your `/myshows` page**
- [ ] **Note the orange glow around your Top 3 shows**
- [ ] **Visit another user's profile with Top 3 shows**
- [ ] **Verify their Top 3 shows have same orange glow**
- [ ] **Verify glow matches your myshows page exactly**

#### Light Mode Comparison
- [ ] **Switch to light mode**
- [ ] **Visit same user profile**
- [ ] **Verify empty slots show light gray dashed border**
- [ ] **Verify filled slots still have orange glow**

---

## 👥 User Migrations

### Todd's Account (toddw493@gmail.com)
- [ ] **Visit `/toddw493` profile**
- [ ] **Verify profile shows:**
  - [ ] 57 total shows
  - [ ] Want to Watch: 3 shows
  - [ ] Currently Watching: 2 shows
  - [ ] Watched: 52 shows
- [ ] **Check watched shows have ratings (meh/like/love icons)**
- [ ] **Verify Top 3 shows are set** (if Todd completed them)
- [ ] **Test clicking on Todd's shows to view details**

---

## 🎨 Theme Testing

### Dark Mode
- [ ] **Enable dark mode**
- [ ] **Test all sections above in dark mode**
- [ ] **Verify no white boxes or contrast issues**
- [ ] **Check invite section styling**
- [ ] **Check referral dashboard styling**
- [ ] **Check Top 3 empty slots**

### Light Mode
- [ ] **Enable light mode**
- [ ] **Test all sections above in light mode**
- [ ] **Verify proper contrast and readability**

---

## 🔒 Edge Cases & Security

### Reserved Usernames
- [ ] **Try to register with username:** `join`
- [ ] **Verify it's rejected**
- [ ] **Try other reserved names:** `feed`, `profile`, `myshows`, `admin`, `api`
- [ ] **All should be rejected**

### Invite Race Conditions
- [ ] **Share one invite link to multiple people**
- [ ] **Have them sign up at same time**
- [ ] **Verify only first person gets the invite**
- [ ] **Verify others see "no longer available"**

### Profile Completion Edge Cases
- [ ] **Complete 5 out of 6 tasks**
- [ ] **Verify no invite awarded yet**
- [ ] **Complete 6th task**
- [ ] **Verify invite immediately appears**
- [ ] **Refresh page**
- [ ] **Verify invite persists**

---

## 📱 Cross-Browser Testing

### Desktop Browsers
- [ ] **Chrome** - Test all features
- [ ] **Firefox** - Test all features
- [ ] **Safari** - Test all features (especially native share)
- [ ] **Edge** - Test all features

### Mobile Browsers
- [ ] **iOS Safari** - Test native share sheet
- [ ] **iOS Chrome** - Test fallback copy to clipboard
- [ ] **Android Chrome** - Test Web Share API
- [ ] **Mobile responsive design** - All pages look good

---

## 🚀 Production Deployment

### Vercel Deployment
- [ ] **Check Vercel dashboard for successful build**
- [ ] **Verify no TypeScript errors**
- [ ] **Verify no build warnings**
- [ ] **Check deployment logs for issues**

### Database Migration
- [ ] **Verify `add-invite-system-v2.sql` ran successfully**
- [ ] **Check new columns exist:**
  - [ ] `profiles.profile_invite_earned`
  - [ ] `profiles.invited_by`
- [ ] **Check new table exists:** `referrals`
- [ ] **Check new functions exist:**
  - [ ] `check_profile_completion()`
  - [ ] `award_profile_completion_invite()`
  - [ ] `redeem_invite()`

---

## 🎯 Priority Issues to Watch For

### High Priority
- ⚠️ Year still showing "20240" after hard refresh
- ⚠️ Watch list removal not working in certain modals
- ⚠️ Invite links not generating correctly
- ⚠️ Auto-follow not triggering

### Medium Priority
- ⚠️ Top 3 glow not appearing on some profiles
- ⚠️ Empty slots showing white in dark mode
- ⚠️ Referral dashboard not loading

### Low Priority
- ⚠️ Share button style inconsistencies
- ⚠️ Minor animation glitches

---

## 📝 Notes

**Known Issues:**
- Year display fix may require hard refresh due to browser caching
- 4 shows failed to import for Todd (TMDB lookup issues)

**Completed Features:**
- ✅ Invite System V2 with profile completion
- ✅ URL restructure from `/user/[username]` to `/[username]`
- ✅ Watch list removal bug fixed
- ✅ Year display bug fixed
- ✅ Top 3 styling improvements
- ✅ Todd's data migration (57 shows)
- ✅ Referral dashboard
- ✅ Auto-follow system

---

## 🐛 Report Issues

If you find any bugs during testing, note:
1. **What were you doing?** (exact steps)
2. **What did you expect?** (expected behavior)
3. **What happened instead?** (actual behavior)
4. **Screenshot?** (if visual issue)
5. **Browser/device?** (environment)
6. **Console errors?** (if any)

---

**Happy Testing! 🎉**

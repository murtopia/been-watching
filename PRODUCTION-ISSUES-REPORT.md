# Production Issues Report - Feed Cards Preview

**Date:** November 25, 2025  
**Environment:** https://beenwatching.com/admin/design-assets/feed-cards  
**Severity:** Medium (Admin preview only, not user-facing)

---

## 🔴 Critical Issues Found

### 1. Icons Showing as Emoji Instead of SVG

**Location:** Back card action buttons  
**Current State:** Shows ➕💬↗️ (emoji characters)  
**Expected State:** SVG icons from sprite sheet  
**Impact:** Visual inconsistency, accessibility issues

**Root Cause:**
- Production is using old code that has inline emoji in the JSX
- Icon component not being used or sprite sheet missing
- Old version: `<button>➕</button>`
- New version: `<button><Icon name="plus" size={22} /></button>`

---

### 2. Missing Icons

**Locations:**
- **Top right (Menu button):** Menu dots icon completely missing
- **Side actions:** Heart/Plus/Comment icons missing or broken
- **Comment tab:** Comment icon rendering incorrectly
- **Close button:** X icon rendering incorrectly  
- **Send button:** Send icon missing from input area

**Root Cause:**
- Icon component not rendering properly on production
- Sprite sheet file missing from `/public/icons/feed-sprite.svg` path
- Cache-busting version mismatch

---

### 3. Incorrect Sample Data

| Field | Production (Wrong) | Local (Correct) |
|-------|-------------------|-----------------|
| Username | Sarah Mitchell | Sarah Miller |
| Genres | Crime, Drama, Thriller | Crime, Drama |
| Front Title | "Breaking Bad Season 5" | "Breaking Bad" |
| Status Text | "Cards 2-7" | "Cards 2-8" |

**Root Cause:**
- Production using old page.tsx with outdated sample data
- Title logic changed to not include season on front card

---

## 🟡 Moderate Issues

### 4. Inconsistent Component Versions

**Evidence:**
- UserActivityCard.tsx on production is older version
- Icon.tsx on production missing recent fixes
- globals.css missing recent feed card styles

**Impact:**
- Missing pointer-events fix for icons
- Missing recent CSS improvements
- Potential interaction bugs

---

## 🔵 Technical Analysis

### File Version Comparison

| File | Local Version | Production Version | Status |
|------|--------------|-------------------|---------|
| UserActivityCard.tsx | 1,825 lines | Unknown (older) | ❌ Out of sync |
| Icon.tsx | 182 lines | Unknown (older) | ❌ Out of sync |
| feed-sprite.svg | 521 lines | Missing/old | ❌ Out of sync |
| page.tsx | 514 lines | Unknown (older) | ❌ Out of sync |
| globals.css | 940 lines | Unknown (older) | ❌ Out of sync |

---

## 🎯 Impact Assessment

### User Impact: **NONE**
- Issue only affects admin preview page
- No user-facing features impacted
- No production app routes affected

### Development Impact: **HIGH**
- Cannot accurately test mobile on production URL
- Cannot share production link for review
- Confusion between local and production state

### Business Impact: **LOW**
- Only delays Card 1 mobile testing
- Does not block Cards 2-8 development
- No customer-facing issues

---

## 🔧 Required Fixes

### Immediate Actions

1. **Deploy UserActivityCard.tsx**
   - Replaces emoji with Icon components
   - Fixes all icon rendering issues
   - Adds correct interaction logic

2. **Deploy Icon.tsx**
   - Enables sprite sheet icon system
   - Includes pointer-events fix
   - Proper state management

3. **Deploy feed-sprite.svg**
   - Provides all icon definitions
   - Must be at exact path: `/public/icons/feed-sprite.svg`
   - Version: 20250119a

4. **Deploy page.tsx**
   - Updates sample data
   - Correct component imports
   - Fixed title display logic

5. **Deploy globals.css**
   - Feed card styling
   - Rating icon wrappers
   - Synopsis collapse styles

---

## 📊 Root Cause Analysis

### Why Production is Different

**Theory:** Production was deployed before recent React card conversion work completed

**Timeline:**
1. HTML cards created and approved ✅
2. Production deployed with partial React conversion 🟡
3. React conversion completed locally ✅
4. Production not updated ❌

**Evidence:**
- Sample data matches early development versions
- Icon usage suggests pre-sprite sheet implementation  
- Component structure indicates older architecture

---

## ✅ Verification Checklist

After deployment, verify these specific elements:

### Desktop Testing
- [ ] Navigate to https://beenwatching.com/admin/design-assets/feed-cards
- [ ] **Top right:** Menu dots icon visible (not blank)
- [ ] **Username:** Shows "Sarah Miller"
- [ ] **Genres:** Shows "Crime, Drama" (no Thriller)
- [ ] **Side actions:** Three SVG icons visible (heart, plus, comment)
- [ ] **Click menu:** Card flips to back side
- [ ] **Back actions:** Three SVG icons (not ➕💬↗️)
- [ ] **Click +:** Modal opens with 6 rating/watchlist options
- [ ] **All modal icons:** Six SVG icons visible
- [ ] **Click comment:** Tab slides up from bottom
- [ ] **Comment tab:** Comment icon and X button visible
- [ ] **Input area:** Send button icon visible
- [ ] **Status text:** Shows "Cards 2-8"

### Mobile Testing
- [ ] Open on mobile device
- [ ] All desktop tests pass
- [ ] Touch interactions work
- [ ] Icons properly sized
- [ ] No layout breaks

---

## 🚀 Deployment Priority

**Priority Level:** Medium  
**Recommended Timing:** Next available deployment window  
**Risk Level:** Low (admin-only route)

### Pre-Deployment
- [x] Create deployment checklist
- [x] Document all issues
- [x] Identify required files
- [ ] Get deployment approval
- [ ] Schedule deployment window

### During Deployment
- [ ] Backup current production files
- [ ] Upload 5 required files
- [ ] Rebuild Next.js app
- [ ] Deploy build output
- [ ] Clear CDN cache (if applicable)

### Post-Deployment
- [ ] Verify on production URL
- [ ] Test all checklist items
- [ ] Test on mobile device
- [ ] Update documentation
- [ ] Close this issue
- [ ] Proceed to Cards 2-8

---

## 📱 User Screenshot Analysis

Based on the mobile screenshot provided:

**Circled Issue 1 (Top right):** Menu dots icon missing  
**Solution:** Icon component will render menu-dots from sprite

**Circled Issue 2 (Bottom left):** Comment tab icons wrong  
**Solution:** Icon components will render comment and close icons

**Circled Issue 3 (Right side):** Side action icons missing  
**Solution:** Icon components will render heart-nav, plus, comment

**Circled Issue 4 (Bottom input):** Send icon missing, styling off  
**Solution:** Icon component will render send icon

---

## 💡 Prevention Recommendations

1. **Set up deployment checklist** for future preview pages
2. **Verify production matches local** before marking features complete
3. **Test on production URL** as part of QA process
4. **Use version tags** in file comments for tracking
5. **Document last deployed date** in component files

---

## 📞 Next Steps

1. Review this report
2. Review deployment checklist
3. Schedule deployment
4. Execute deployment plan
5. Verify all fixes
6. Resume mobile testing with correct production code

---

**Report Status:** COMPLETE  
**Action Required:** Schedule deployment  
**Blocking:** Mobile testing of Card 1  
**Dependencies:** None (can deploy independently)






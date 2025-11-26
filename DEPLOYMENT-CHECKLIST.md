# Feed Cards Preview Page - Deployment Checklist

**Date:** November 25, 2025  
**Purpose:** Sync production feed-cards preview page to match local staging  
**Risk Level:** LOW (Only affects `/admin/design-assets/feed-cards` route)

---

## 🔍 Problem Summary

**Local Staging (localhost:3000):** ✅ Correct SVG icons, updated data  
**Production (beenwatching.com):** ❌ Shows emoji instead of icons, old sample data

---

## 📋 Files That MUST Be Deployed

### 1. Core Component Files

#### `/components/feed/UserActivityCard.tsx` (1,825 lines)
**Why:** Contains all Icon component usage with correct sprite sheet references
- Uses `<Icon>` component properly throughout
- References sprite icons: `heart`, `heart-nav`, `plus`, `comment`, `menu-dots`, `send`, `close`, etc.
- Has correct interaction logic and state management

**Key Icon Usage (verified correct):**
- Line 1288: `<Icon name="menu-dots" size={20} color="white" />` - Menu button
- Lines 1320-1325: Activity badge icons (heart, play)
- Lines 1360-1382: Side action icons (heart-nav, plus, comment)
- Line 1394: `<Icon name="comment" size={16} color="white" />` - Comment tab
- Line 1400: `<Icon name="close" size={14} color="white" />` - Close button
- Line 1426: `<Icon name="send" size={16} color="white" />` - Send button

---

#### `/components/ui/Icon.tsx` (182 lines)
**Why:** Sprite sheet integration component
- Line 150: References `/icons/feed-sprite.svg?v=20250119a#${iconId}`
- Handles state mapping (default, active, filled)
- Maps icon names to sprite IDs correctly
- Critical pointer-events fix on line 147

**Key Features:**
- Stateful icons array (lines 52-64)
- Icon ID resolution with state suffixes
- Cache-busted sprite reference with version `?v=20250119a`

---

### 2. Static Assets

#### `/public/icons/feed-sprite.svg` (521 lines total)
**Why:** Contains ALL icon definitions used by Icon component
- Must be deployed to exact path: `/public/icons/feed-sprite.svg`
- Contains 50+ icon symbols including all states (default, active, filled)

**Critical Icons Included:**
- `heart-outline`, `heart-filled`, `heart-default`, `heart-active`
- `heart-nav-default`, `heart-nav-active`
- `plus`, `plus-small`
- `comment`
- `share`, `share-default`, `share-c-default`
- `close`, `close-default`, `close-c-default`
- `menu-dots`
- `send`
- `thumbs-up-default`, `thumbs-up-active`
- `meh-face-default`, `meh-face-active`
- `bookmark-default`, `bookmark-active`
- `play-default`, `play-active`
- `check-default`, `check-active`
- `star-gold`

---

### 3. Preview Page

#### `/app/admin/design-assets/feed-cards/page.tsx` (514 lines)
**Why:** Updated sample data and correct component usage
- Line 25: `name: 'Sarah Miller'` (not "Sarah Mitchell")
- Line 26: `username: 'sarahmiller'`
- Line 48: `genres: ['Crime', 'Drama']` (not including 'Thriller')
- Line 46: `title: 'Breaking Bad'` (not "Breaking Bad Season 5")
- Uses UserActivityCard with proper data structure

---

### 4. Global Styles

#### `/app/globals.css` (940 lines total)
**Why:** Contains feed card-specific styles
- Lines 715-728: `.back-synopsis` and `.collapsed` styles
- Lines 730-736: `.read-more` link styles
- Lines 741-810: Friends ratings section styles
- Lines 775-805: `.rating-icon-wrapper` and active states

**Critical Styles:**
```css
.rating-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  ...
}

.rating-icon-wrapper.active-user-rating {
  background: rgba(255, 59, 92, 0.15);
  border: 2px solid #FF3B5C;
}
```

---

## 🎯 Deployment Steps

### Option A: Manual File Upload (Safest)

```bash
# 1. Upload component files
/components/feed/UserActivityCard.tsx → production
/components/ui/Icon.tsx → production

# 2. Upload sprite sheet to exact path
/public/icons/feed-sprite.svg → production

# 3. Upload preview page
/app/admin/design-assets/feed-cards/page.tsx → production

# 4. Upload styles
/app/globals.css → production

# 5. Rebuild Next.js (if using static export)
npm run build

# 6. Deploy build output
```

---

### Option B: Git Deploy (If Using CI/CD)

```bash
# Ensure these files are committed
git status

# Should show these files as modified/staged:
# - components/feed/UserActivityCard.tsx
# - components/ui/Icon.tsx
# - public/icons/feed-sprite.svg
# - app/admin/design-assets/feed-cards/page.tsx
# - app/globals.css

# Deploy to production branch
git push production main
```

---

## ✅ Verification Steps

After deployment, test on production:

### Desktop Browser
1. Navigate to `https://beenwatching.com/admin/design-assets/feed-cards`
2. **Verify icons render as SVG (not emoji):**
   - Top right: Menu dots icon visible
   - Side actions: Heart/Plus/Comment icons visible (not emoji)
   - Comment tab: Comment icon visible, close X icon visible
   - Input area: Send button icon visible
   - Back card actions: Plus/Comment/Share icons (not ➕💬↗️)
3. **Verify sample data:**
   - Username: "Sarah Miller" (not "Sarah Mitchell")
   - Genres: "Crime, Drama" (no "Thriller")
   - Title: "Breaking Bad" (not "Breaking Bad Season 5" on front)
4. **Test interactions:**
   - Click menu dots → card flips
   - Click + button → modal opens with 6 icons
   - Click heart → fills with color
   - Click comment → tab slides up

### Mobile Browser
1. Open on actual mobile device or DevTools mobile viewport
2. Verify all icons render correctly
3. Test touch interactions
4. Verify layout matches desktop expectations

---

## 🚨 Production Impact Assessment

### Routes Affected
- ✅ `/admin/design-assets/feed-cards` - Preview page (LOW traffic, admin only)

### Routes NOT Affected
- ❌ Main app routes (`/`, `/feed`, `/profile`, etc.)
- ❌ User-facing features
- ❌ Authentication flows
- ❌ API endpoints
- ❌ Database operations

### Risk Level: **LOW**
- Only admin preview pages affected
- No user-facing feature changes
- No database migrations
- No API changes
- Can rollback easily by reverting files

---

## 🔄 Rollback Plan

If issues occur:

```bash
# Revert to previous commit
git revert HEAD --no-commit

# Or restore specific files
git checkout HEAD~1 -- components/feed/UserActivityCard.tsx
git checkout HEAD~1 -- components/ui/Icon.tsx
git checkout HEAD~1 -- public/icons/feed-sprite.svg
git checkout HEAD~1 -- app/admin/design-assets/feed-cards/page.tsx

# Rebuild and redeploy
npm run build
```

---

## 📝 Known Differences (Before → After)

| Element | Production (OLD) | After Deployment (NEW) |
|---------|------------------|------------------------|
| Username | Sarah Mitchell | Sarah Miller |
| Genres | Crime, Drama, Thriller | Crime, Drama |
| Front title | "Breaking Bad Season 5" | "Breaking Bad" |
| Menu icon | Missing/broken | SVG icon visible |
| Side actions | Emoji/missing | SVG icons |
| Comment tab | Icons broken | SVG icons |
| Send button | Missing/broken | SVG icon |
| Back actions | ➕💬↗️ (emoji) | SVG icons |
| Status text | "Cards 2-7" | "Cards 2-8" |

---

## 🎬 Post-Deployment Tasks

- [ ] Test on production URL
- [ ] Verify all icons render correctly
- [ ] Test on mobile device
- [ ] Update documentation with deployment date
- [ ] Mark Card 1 as production-ready
- [ ] Begin development on Cards 2-8

---

## 📞 Support

If issues arise during deployment:
- Check browser console for errors
- Verify sprite sheet path is accessible: `/icons/feed-sprite.svg`
- Check Next.js build output for errors
- Verify all files uploaded to correct paths

---

**Prepared by:** AI Assistant  
**Date:** November 25, 2025  
**Status:** READY FOR DEPLOYMENT




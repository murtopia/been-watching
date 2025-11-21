# Session Notes: Character Counter Implementation

## Date: 2025-11-20

## Objective
Implement a 280-character counter for the comment input box on the UserActivityCard back side.

## Current Status: IN PROGRESS - STYLING ISSUES

The character counter functionality is working (tracks input, enforces 280 char limit), but visual styling doesn't match the design requirements despite multiple attempts.

---

## What We've Implemented

### 1. Character Counter Functionality
- **File**: `/components/feed/UserActivityCard.tsx`
- **Line 133**: Added state: `const [showCommentText, setShowCommentText] = useState('')`
- **Lines 1558-1572**: Added textarea with character tracking
- **Lines 1558-1560**: Character counter display showing "X/280"

### 2. Current Layout Structure (Lines 1556-1575)
```jsx
<div className="comment-input-wrapper">
  <div className="comment-textarea-container">
    <div className="comment-char-count">
      {showCommentText.length}/280
    </div>
    <textarea
      ref={commentInputRef}
      className="comment-input"
      placeholder="Share your thoughts about this show..."
      value={showCommentText}
      onChange={(e) => {
        if (e.target.value.length <= 280) {
          setShowCommentText(e.target.value)
        }
      }}
      maxLength={280}
    ></textarea>
  </div>
  <button className="comment-submit-btn">Post Comment</button>
</div>
```

### 3. Current Styling (Lines 1138-1191)

**Counter Positioning:**
```css
.comment-textarea-container {
  position: relative;
}

.comment-char-count {
  position: absolute;
  top: -1.25rem;
  right: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  line-height: 1;
}
```

**Textarea:**
```css
.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 13px;
  outline: none;
  resize: none;
  min-height: 80px;
}
```

**Button (matches approved HTML):**
```css
.comment-submit-btn {
  align-self: flex-end;
  padding: 6px 16px;
  background: linear-gradient(135deg, #FF006E, #FF8E53);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 8px;
}
```

---

## THE PROBLEM

Despite setting identical CSS values in both `globals.css` and the component's scoped `<style jsx>` block, the visual rendering doesn't match expectations.

### Root Cause Discovery
**styled-jsx scoping**: Next.js uses styled-jsx which creates scoped styles. Global CSS cannot reach inside components with scoped styles. All styles MUST be in the component's `<style jsx>` block starting at line 210.

### What We've Tried (Chronologically)

1. **Attempt 1**: Added styles to `globals.css` ’ Not applied (scoping issue)
2. **Attempt 2**: Added `!important` flags ’ Still not applied
3. **Attempt 3**: Killed/restarted dev server multiple times ’ No effect
4. **Attempt 4**: Discovered scoping issue, moved styles to component's `<style jsx>` block ’ Partially working
5. **Attempt 5**: Repositioned counter from below textarea to above it
6. **Current**: Counter positioned above textarea, but styling still not matching user's expectations

### Specific Styling Issues Reported by User

1. **Character counter font size**: Set to 11px but user reports it doesn't look right
2. **Counter position**: Now above textarea (correct), but exact positioning may need adjustment
3. **Button styling**: Fixed to match approved HTML (6px border-radius, not 20px)

---

## Reference Files

### Approved Design Reference
- **File**: `/public/card-1-standalone.html`
- **Lines 855-870**: Approved button styling
  - `border-radius: 6px`
  - `padding: 6px 16px`
  - `font-size: 12px`
  - `font-weight: 600`
  - `background: linear-gradient(135deg, #FF006E, #FF8E53)`

- **Lines 833-848**: Approved textarea styling
  - `font-size: 13px`
  - `padding: 8px 12px`
  - `border-radius: 8px`
  - `min-height: 60px`

**Note**: Original approved HTML does NOT have a character counter - this is a new addition.

### Live Site Reference
User provided screenshot from https://beenwatching.com/myshows showing character counter in a modal. The counter appears smaller than placeholder text, which is the intended design direction.

---

## Key Technical Constraints

1. **All styles must be in component's scoped `<style jsx>` block** (starts line 210)
2. **globals.css is ineffective** for this component due to styled-jsx scoping
3. **Character limit**: 280 characters (hardcoded, matches Twitter/X)
4. **Font sizes**: Textarea at 13px, counter at 11px (smaller)
5. **Design system**: Must match approved HTML mockup styling

---

## Next Steps for Resolver

### Immediate Actions Needed

1. **Test the current implementation** at http://localhost:3003
   - Verify counter appears above textarea
   - Check if font-size looks appropriate
   - Confirm button matches approved design

2. **If styling still doesn't match:**
   - Take screenshot and compare to user's marked-up mockup
   - Adjust counter position (`top`, `right` values in line 1166-1167)
   - Try different font-sizes (user may prefer 10px or 12px instead of 11px)
   - Check if `letter-spacing` or other typography properties affect appearance

3. **Potential CSS tweaks to try:**
```css
.comment-char-count {
  position: absolute;
  top: -1.5rem;  /* Try different negative values */
  right: 0.25rem;  /* Try small positive values for padding from edge */
  font-size: 10px;  /* Try 10px, 11px, or 12px */
  color: rgba(255, 255, 255, 0.4);  /* Try different opacity */
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;  /* Try adding letter spacing */
}
```

### Questions to Ask User

1. Should the counter have more/less spacing from the textarea?
2. Should the font-size be smaller (10px) or larger (12px)?
3. Should the counter be lighter/darker in color?
4. Is the positioning left/right aligned correctly?

### Files to Modify

**Primary file**: `/components/feed/UserActivityCard.tsx`
- **State**: Line 133
- **JSX structure**: Lines 1556-1575
- **Scoped styles**: Lines 1138-1191 (within the larger `<style jsx>` block starting at line 210)

**Do NOT modify**: `/app/globals.css` (ineffective due to scoping)

---

## Development Environment

- **Dev server**: Running on http://localhost:3003 (port 3000 was in use)
- **Process ID**: Background bash 50a069
- **Framework**: Next.js 15.5.4 with Turbopack
- **Styling**: styled-jsx (scoped CSS-in-JS)

---

## Session History Summary

This is a continuation of a previous session that ran out of context. The conversation has been primarily focused on:

1. Implementing character counter functionality  DONE
2. Matching font-size to placeholder text L ONGOING ISSUE
3. Removing unwanted borders/bubbles  DONE
4. Fixing button gradient styling  DONE
5. Repositioning counter above textarea  DONE
6. Fine-tuning visual appearance   IN PROGRESS

The user has been patient through multiple attempts and server restarts. They've provided visual mockups and references to guide the implementation.

---

## Important Notes

- **User is okay with counter being smaller than placeholder text**
- **Live site reference provided** shows counter should be subtle and smaller
- **Approved HTML mockup** is at `/public/card-1-standalone.html`
- **Multiple hard refreshes attempted** - caching is not the issue
- **styled-jsx scoping** is the key constraint to remember

---

## Git Commit Message Suggestion

```
Add character counter to comment input on UserActivityCard

- Implement 280-character limit with real-time counter
- Position counter above textarea in upper-right corner
- Match button styling to approved HTML design (6px radius)
- Update textarea font-size to 13px per approved design
- Counter displays as "X/280" in smaller 11px font

Note: Visual styling still being refined based on user feedback.
This commit preserves a working version before further adjustments.
```

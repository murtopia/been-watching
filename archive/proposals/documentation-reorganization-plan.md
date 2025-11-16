# Documentation Reorganization Plan

**Date:** November 6, 2025
**Current Status:** 64 markdown files across multiple locations
**Goal:** Implement best practice documentation structure for maintainability and discoverability

---

## Executive Summary

This project currently has 64 markdown files scattered across root, docs/, scripts/, and supabase/ directories. Many files are outdated session notes, have overlapping content, or are difficult to discover. This plan proposes a comprehensive reorganization based on industry best practices for 2025.

**Key Findings:**
- **61 files in root directory** - Most should be relocated
- **Duplicate content** - Multiple files covering same topics (e.g., DOCUMENTATION-INDEX.md and docs/README.md)
- **Outdated session notes** - 14+ session files from October 2025 sessions that should be archived
- **Poor discoverability** - New developers struggle to find relevant documentation
- **Inconsistent naming** - Mix of CAPS, kebab-case, and descriptive names

---

## Current State Assessment

### File Distribution
```
Root directory:    47 markdown files (TOO MANY)
docs/:             11 markdown files
scripts/:           1 markdown file
supabase/:          1 markdown file
node_modules/:      [excluded]
```

### Categories Identified

1. **Core Documentation (Essential)** - 8 files
   - README.md
   - CHANGELOG.md
   - DEVELOPER-ONBOARDING.md
   - PROJECT-COMPLETE-OVERVIEW.md
   - DOCUMENTATION-INDEX.md (has duplicate in docs/)
   - DEPLOYMENT-GUIDE.md
   - TESTING-CHECKLIST.md
   - ROADMAP-CURRENT.md

2. **Feature Planning** - 10 files
   - ADMIN-CONSOLE-STATUS.md
   - ADMIN-CONSOLE-UPGRADE-PLAN.md
   - ADMIN-USER-MANAGEMENT-UPGRADE.md
   - ENHANCED-FEED-PLAN.md
   - ENHANCED-FEED-IMPLEMENTATION.md
   - SETTINGS-HUB-PLAN.md
   - SOCIAL-SYSTEM-IMPLEMENTATION.md
   - USER-PROFILE-ENHANCEMENTS.md
   - ACTIVITY-CARD-TEMPLATES.md
   - enhanced-feed-documentation.md

3. **Admin & Moderation** - 5 files
   - ADMIN-ROLE-MIGRATION-INSTRUCTIONS.md
   - AI-ASSISTED-MODERATION.md
   - USER-REPORTING-SYSTEM.md
   - SOCIAL-ACTIVITY-STRATEGY.md
   - SECURE-INVITE-SYSTEM-IMPLEMENTATION.md

4. **Analytics & Tracking** - 4 files
   - POSTHOG-SETUP-GUIDE.md
   - POSTHOG-IMPLEMENTATION-PROGRESS.md
   - POSTHOG-COMPLETE-SUMMARY.md

5. **Session Notes (Historical)** - 14 files
   - SESSION-2025-01-21-DARK-MODE.md
   - SESSION-2025-01-22-OAUTH-THEME-UPDATES.md
   - SESSION-INVITE-SYSTEM-V2-FIXES-OCT25.md
   - SESSION-STATUS-2025-10-19.md
   - SESSION-STATUS-2025-10-20.md
   - SESSION-SUMMARY-2025-10-13.md
   - SESSION-SUMMARY-2025-10-26.md
   - SESSION-SUMMARY-2025-10-27.md
   - SESSION-SUMMARY-2025-10-30.md
   - SESSION-UPDATE-2025-10-20.md
   - docs/SESSION-2025-10-19.md
   - docs/SESSION-SUMMARY-COMMENTS-AND-UX.md
   - docs/SESSION-SUMMARY-LANDING-PAGE-AND-OAUTH.md
   - FEED-MOCKUP-SESSION-NOTES.md

6. **Project Status** - 4 files
   - PROJECT-STATUS.md
   - PROJECT-STATUS-OCTOBER-2025.md
   - CURRENT-STATE-AND-ACTION-PLAN.md
   - SOCIAL-SYSTEM-PROGRESS-105K.md

7. **Roadmaps** - 3 files
   - ROADMAP-2025.md
   - ROADMAP-CHANGELOG.md
   - ROADMAP-CURRENT.md (most recent)

8. **Design & Mockups** - 3 files
   - DESIGN-SYSTEM-AUDIT.md
   - PROFILE-DARK-MODE-MOCKUP.md
   - potential_activitycards.md

9. **Migration & Setup** - 4 files
   - MIGRATION-INSTRUCTIONS.md
   - BOOZEHOUNDS-MIGRATION-PLAN.md
   - README-SETUP.md
   - supabase/INVITE-SYSTEM-SETUP.md

10. **docs/ folder (Existing)** - 11 files
    - README.md (duplicate index)
    - API_DOCUMENTATION.md
    - ARCHITECTURE.md
    - CURRENT-STATE.md
    - DEVELOPER_GUIDE.md
    - DOCUMENTATION_SUMMARY.md
    - FEATURE_HISTORY.md
    - GIT_CONVENTIONS.md
    - PROJECT_OVERVIEW.md
    - TODO.md
    - SHOW-NOTES-IMPLEMENTATION.md

### Key Issues Identified

1. **Too many files in root** (47 files makes navigation difficult)
2. **Duplicate/overlapping content:**
   - DOCUMENTATION-INDEX.md vs docs/README.md
   - PROJECT-COMPLETE-OVERVIEW.md vs docs/PROJECT_OVERVIEW.md
   - DEVELOPER-ONBOARDING.md vs docs/DEVELOPER_GUIDE.md
3. **Outdated session notes cluttering root**
4. **No clear archive for historical documents**
5. **Inconsistent file naming** (CAPS vs kebab-case)
6. **No clear separation of active vs archived content**

---

## Proposed Folder Structure

Based on industry best practices (MkDocs, GitBook, Docusaurus patterns) and 2025 documentation standards:

```
been-watching-v2/
├── README.md                          # Project overview (stays in root)
├── CHANGELOG.md                       # Version history (stays in root)
├── CONTRIBUTING.md                    # Contribution guidelines (create)
├── LICENSE.md                         # License file (if needed)
│
├── docs/                              # Main documentation hub
│   ├── README.md                      # Documentation index
│   │
│   ├── getting-started/               # NEW: Onboarding & setup
│   │   ├── README.md                  # Quick start guide
│   │   ├── installation.md            # Detailed setup
│   │   ├── developer-onboarding.md    # From DEVELOPER-ONBOARDING.md
│   │   ├── deployment.md              # From DEPLOYMENT-GUIDE.md
│   │   └── troubleshooting.md         # Common issues
│   │
│   ├── architecture/                  # Technical architecture
│   │   ├── README.md                  # Architecture overview
│   │   ├── overview.md                # From PROJECT-COMPLETE-OVERVIEW.md
│   │   ├── system-architecture.md     # From docs/ARCHITECTURE.md
│   │   ├── database-schema.md         # Extract from overview docs
│   │   ├── api-design.md              # From docs/API_DOCUMENTATION.md
│   │   └── design-system.md           # From DESIGN-SYSTEM-AUDIT.md
│   │
│   ├── features/                      # Feature documentation
│   │   ├── README.md                  # Feature index
│   │   ├── admin-console.md           # From ADMIN-CONSOLE-STATUS.md
│   │   ├── moderation-system.md       # From USER-REPORTING-SYSTEM.md
│   │   ├── invite-system.md           # From SECURE-INVITE-SYSTEM-IMPLEMENTATION.md
│   │   ├── social-features.md         # From SOCIAL-SYSTEM-IMPLEMENTATION.md
│   │   ├── analytics.md               # From POSTHOG-COMPLETE-SUMMARY.md
│   │   ├── feed-system.md             # From ENHANCED-FEED-IMPLEMENTATION.md
│   │   └── theme-system.md            # Extract from session notes
│   │
│   ├── guides/                        # How-to guides
│   │   ├── README.md                  # Guide index
│   │   ├── developer-guide.md         # From docs/DEVELOPER_GUIDE.md
│   │   ├── testing-guide.md           # From TESTING-CHECKLIST.md
│   │   ├── migration-guide.md         # From MIGRATION-INSTRUCTIONS.md
│   │   ├── git-workflow.md            # From docs/GIT_CONVENTIONS.md
│   │   └── posthog-setup.md           # From POSTHOG-SETUP-GUIDE.md
│   │
│   ├── planning/                      # NEW: Project planning
│   │   ├── README.md                  # Planning overview
│   │   ├── roadmap-2025.md            # From ROADMAP-CURRENT.md
│   │   ├── feature-history.md         # From docs/FEATURE_HISTORY.md
│   │   ├── current-status.md          # Consolidated from status files
│   │   └── todo.md                    # From docs/TODO.md
│   │
│   ├── design/                        # NEW: Design documentation
│   │   ├── README.md                  # Design overview
│   │   ├── mockups/                   # Design mockups
│   │   │   ├── profile-dark-mode.md   # From PROFILE-DARK-MODE-MOCKUP.md
│   │   │   ├── activity-cards.md      # From ACTIVITY-CARD-TEMPLATES.md
│   │   │   └── feed-comparison.md     # From mockup files
│   │   └── component-library.md       # Future: component docs
│   │
│   └── reference/                     # Reference documentation
│       ├── README.md                  # Reference index
│       ├── api-reference.md           # API endpoints
│       ├── database-schema.md         # Database reference
│       ├── environment-variables.md   # Env var reference
│       └── glossary.md                # Terms and definitions
│
├── .github/                           # GitHub-specific docs
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│
├── scripts/                           # Scripts with docs
│   ├── README.md                      # Scripts overview
│   ├── MIGRATION_REVIEW.md            # Stays here
│   └── [script files]
│
├── supabase/                          # Database docs
│   ├── README.md                      # Supabase overview
│   ├── migrations/                    # Migration files
│   └── docs/                          # NEW: Supabase-specific docs
│       ├── schema-design.md
│       ├── rls-policies.md
│       └── migration-guide.md
│
└── archive/                           # NEW: Historical documents
    ├── README.md                      # Archive index with dates
    ├── sessions/                      # Session notes
    │   ├── 2025-01/
    │   │   ├── session-2025-01-21-dark-mode.md
    │   │   └── session-2025-01-22-oauth-theme-updates.md
    │   └── 2025-10/
    │       ├── session-2025-10-13.md
    │       ├── session-2025-10-19.md
    │       ├── session-2025-10-20.md
    │       ├── session-2025-10-26.md
    │       ├── session-2025-10-27.md
    │       └── session-2025-10-30.md
    ├── deprecated/                    # Deprecated docs
    │   ├── README-SETUP.md            # Old setup guide
    │   ├── PROJECT-STATUS-OCTOBER-2025.md
    │   └── ROADMAP-CHANGELOG.md
    └── proposals/                     # Completed proposals
        ├── admin-console-upgrade-plan.md
        ├── enhanced-feed-plan.md
        ├── settings-hub-plan.md
        └── social-activity-strategy.md
```

---

## Detailed File Migration Plan

### Files to Keep in Root (6 files)

| Current File | Action | Reason |
|-------------|--------|--------|
| README.md | KEEP | Entry point for GitHub |
| CHANGELOG.md | KEEP | Version history at root |
| CONTRIBUTING.md | CREATE | Standard practice |
| LICENSE.md | CREATE (if needed) | Legal requirement |
| .gitignore | KEEP | Git configuration |
| .env.example | KEEP | Environment template |

### Files to Move to docs/getting-started/ (5 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| DEVELOPER-ONBOARDING.md | docs/getting-started/developer-onboarding.md | Primary onboarding guide |
| DEPLOYMENT-GUIDE.md | docs/getting-started/deployment.md | Deployment instructions |
| README-SETUP.md | archive/deprecated/README-SETUP.md | Outdated, archive it |
| TESTING-CHECKLIST.md | docs/guides/testing-guide.md | Move to guides |

### Files to Move to docs/architecture/ (6 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| PROJECT-COMPLETE-OVERVIEW.md | docs/architecture/overview.md | Consolidate with PROJECT_OVERVIEW.md |
| docs/ARCHITECTURE.md | docs/architecture/system-architecture.md | Detailed architecture |
| docs/API_DOCUMENTATION.md | docs/architecture/api-design.md | API architecture |
| DESIGN-SYSTEM-AUDIT.md | docs/architecture/design-system.md | Design architecture |
| docs/PROJECT_OVERVIEW.md | CONSOLIDATE | Merge with overview.md |

### Files to Move to docs/features/ (11 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| ADMIN-CONSOLE-STATUS.md | docs/features/admin-console.md | Current implementation |
| ADMIN-USER-MANAGEMENT-UPGRADE.md | archive/proposals/ | Archive completed proposal |
| ADMIN-CONSOLE-UPGRADE-PLAN.md | archive/proposals/ | Archive completed proposal |
| ADMIN-ROLE-MIGRATION-INSTRUCTIONS.md | docs/guides/migration-guide.md | Add as section |
| USER-REPORTING-SYSTEM.md | docs/features/moderation-system.md | Feature documentation |
| AI-ASSISTED-MODERATION.md | docs/features/moderation-system.md | Merge into moderation |
| SECURE-INVITE-SYSTEM-IMPLEMENTATION.md | docs/features/invite-system.md | Feature documentation |
| SOCIAL-SYSTEM-IMPLEMENTATION.md | docs/features/social-features.md | Feature documentation |
| SOCIAL-ACTIVITY-STRATEGY.md | archive/proposals/ | Archive strategy doc |
| SOCIAL-SYSTEM-PROGRESS-105K.md | archive/sessions/2025-10/ | Archive progress note |
| USER-PROFILE-ENHANCEMENTS.md | docs/features/social-features.md | Merge into social |

### Files to Move to docs/features/ - Analytics (3 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| POSTHOG-COMPLETE-SUMMARY.md | docs/features/analytics.md | Main analytics doc |
| POSTHOG-SETUP-GUIDE.md | docs/guides/posthog-setup.md | Setup guide |
| POSTHOG-IMPLEMENTATION-PROGRESS.md | archive/deprecated/ | Archive progress notes |

### Files to Move to docs/features/ - Feed System (3 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| ENHANCED-FEED-IMPLEMENTATION.md | docs/features/feed-system.md | Feature documentation |
| ENHANCED-FEED-PLAN.md | archive/proposals/ | Archive completed plan |
| enhanced-feed-documentation.md | DELETE or MERGE | Duplicate/outdated |

### Files to Move to docs/planning/ (7 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| ROADMAP-CURRENT.md | docs/planning/roadmap-2025.md | Current roadmap |
| ROADMAP-2025.md | CONSOLIDATE | Merge with CURRENT |
| ROADMAP-CHANGELOG.md | archive/deprecated/ | Archive old changelog |
| docs/TODO.md | docs/planning/todo.md | Task tracking |
| docs/FEATURE_HISTORY.md | docs/planning/feature-history.md | Historical tracking |
| PROJECT-STATUS.md | CONSOLIDATE | Merge into current-status.md |
| PROJECT-STATUS-OCTOBER-2025.md | archive/deprecated/ | Archive old status |
| CURRENT-STATE-AND-ACTION-PLAN.md | docs/planning/current-status.md | Current state |

### Files to Move to docs/design/ (4 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| PROFILE-DARK-MODE-MOCKUP.md | docs/design/mockups/profile-dark-mode.md | Design mockup |
| ACTIVITY-CARD-TEMPLATES.md | docs/design/mockups/activity-cards.md | Design mockup |
| potential_activitycards.md | DELETE or MERGE | Duplicate content |
| FEED-MOCKUP-SESSION-NOTES.md | archive/sessions/2025-10/ | Archive session note |

### Files to Move to docs/guides/ (5 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| docs/DEVELOPER_GUIDE.md | docs/guides/developer-guide.md | How-to guide |
| docs/GIT_CONVENTIONS.md | docs/guides/git-workflow.md | Git guide |
| MIGRATION-INSTRUCTIONS.md | docs/guides/migration-guide.md | Migration guide |
| BOOZEHOUNDS-MIGRATION-PLAN.md | archive/deprecated/ | Completed migration |
| supabase/INVITE-SYSTEM-SETUP.md | docs/guides/supabase-setup.md | Supabase guide |

### Files to Move to docs/ (Reference) (2 files)

| Current File | New Location | Notes |
|-------------|--------------|-------|
| DOCUMENTATION-INDEX.md | DELETE | Replace with docs/README.md |
| docs/DOCUMENTATION_SUMMARY.md | DELETE | Consolidate into README |

### Session Notes to Archive (14 files)

All session notes should be moved to `archive/sessions/` organized by year-month:

**2025-01 sessions:**
- SESSION-2025-01-21-DARK-MODE.md → archive/sessions/2025-01/
- SESSION-2025-01-22-OAUTH-THEME-UPDATES.md → archive/sessions/2025-01/

**2025-10 sessions:**
- SESSION-STATUS-2025-10-19.md → archive/sessions/2025-10/
- SESSION-STATUS-2025-10-20.md → archive/sessions/2025-10/
- SESSION-SUMMARY-2025-10-13.md → archive/sessions/2025-10/
- SESSION-SUMMARY-2025-10-26.md → archive/sessions/2025-10/
- SESSION-SUMMARY-2025-10-27.md → archive/sessions/2025-10/
- SESSION-SUMMARY-2025-10-30.md → archive/sessions/2025-10/
- SESSION-UPDATE-2025-10-20.md → archive/sessions/2025-10/
- SESSION-INVITE-SYSTEM-V2-FIXES-OCT25.md → archive/sessions/2025-10/
- docs/SESSION-2025-10-19.md → archive/sessions/2025-10/
- docs/SESSION-SUMMARY-COMMENTS-AND-UX.md → archive/sessions/2025-10/
- docs/SESSION-SUMMARY-LANDING-PAGE-AND-OAUTH.md → archive/sessions/2025-10/
- FEED-MOCKUP-SESSION-NOTES.md → archive/sessions/2025-10/

### Files to Delete (3 files)

| File | Reason |
|------|--------|
| DOCUMENTATION-INDEX.md | Replaced by docs/README.md |
| docs/DOCUMENTATION_SUMMARY.md | Consolidated into docs/README.md |
| potential_activitycards.md | Duplicate of ACTIVITY-CARD-TEMPLATES.md |

### Files in scripts/ and supabase/ (2 files)

| Current File | Action | Notes |
|-------------|--------|-------|
| scripts/MIGRATION_REVIEW.md | KEEP | Stays with scripts |
| supabase/INVITE-SYSTEM-SETUP.md | MOVE | Move to docs/guides/ or archive |

---

## Documentation Standards & Guidelines

### File Naming Conventions

**Adopt consistent kebab-case naming:**

```
✅ GOOD:
- developer-onboarding.md
- api-design.md
- social-features.md

❌ BAD:
- DEVELOPER-ONBOARDING.md (all caps)
- API_DOCUMENTATION.md (underscores)
- socialFeatures.md (camelCase)
```

**Exceptions:**
- README.md (standard convention)
- CHANGELOG.md (standard convention)
- CONTRIBUTING.md (standard convention)
- LICENSE.md (standard convention)

### Folder Naming Conventions

Use lowercase with hyphens:
- `getting-started/`
- `architecture/`
- `guides/`
- NOT `Getting-Started/` or `GUIDES/`

### Documentation Template

Every folder should have a README.md with this structure:

```markdown
# [Folder Name]

Brief description of what this folder contains.

## Contents

- [File 1](./file-1.md) - Description
- [File 2](./file-2.md) - Description

## Related Documentation

- Link to related docs
```

### Metadata Standards

Every document should start with:

```markdown
# Document Title

**Last Updated:** YYYY-MM-DD
**Status:** [Active | Deprecated | Draft]
**Audience:** [Developers | Users | Admins]

Brief 1-2 sentence description.
```

### Cross-Linking Best Practices

Use relative links:
```markdown
✅ GOOD:
See [Architecture Overview](../architecture/overview.md)

❌ BAD:
See Architecture Overview (no link)
See /docs/architecture/overview.md (absolute path)
```

---

## Implementation Plan

### Phase 1: Setup New Structure (Day 1)

**Tasks:**
1. Create new folder structure
2. Create README.md files for each folder
3. Update root README.md with new documentation links
4. Create CONTRIBUTING.md

**Commands:**
```bash
# Create folder structure
mkdir -p docs/{getting-started,architecture,features,guides,planning,design/mockups,reference}
mkdir -p archive/{sessions/{2025-01,2025-10},deprecated,proposals}

# Create README files
touch docs/getting-started/README.md
touch docs/architecture/README.md
touch docs/features/README.md
touch docs/guides/README.md
touch docs/planning/README.md
touch docs/design/README.md
touch docs/reference/README.md
touch archive/README.md
```

### Phase 2: Move Files (Day 2-3)

**Priority Order:**

1. **Archive session notes first** (cleans up root directory)
2. **Move getting-started docs** (immediate value for new devs)
3. **Move architecture docs** (core technical docs)
4. **Move feature docs** (current implementation)
5. **Move guides** (how-to documentation)
6. **Move planning docs** (roadmap, status)
7. **Move design docs** (mockups, designs)

**Git Strategy:**
```bash
# Use git mv to preserve history
git mv DEVELOPER-ONBOARDING.md docs/getting-started/developer-onboarding.md
git mv SESSION-SUMMARY-2025-10-30.md archive/sessions/2025-10/

# Commit in batches
git commit -m "docs: reorganize getting-started documentation"
git commit -m "docs: archive October 2025 session notes"
```

### Phase 3: Update Cross-References (Day 3-4)

**Tasks:**
1. Update all internal links in moved files
2. Update links in code comments
3. Update links in README files
4. Test all links

**Tool to help:**
```bash
# Find all markdown links
grep -r "\[.*\](.*\.md)" docs/ --include="*.md"

# Find broken links (manual verification needed)
```

### Phase 4: Consolidate & Cleanup (Day 4-5)

**Tasks:**
1. Merge duplicate content:
   - PROJECT-COMPLETE-OVERVIEW.md + docs/PROJECT_OVERVIEW.md
   - ROADMAP-CURRENT.md + ROADMAP-2025.md
   - Multiple status files into one
2. Delete obsolete files
3. Update documentation index
4. Create new consolidated files where needed

### Phase 5: Documentation Review (Day 5)

**Tasks:**
1. Review each folder for completeness
2. Ensure every folder has README.md
3. Verify all cross-links work
4. Update main README.md
5. Test navigation from developer perspective

---

## Before & After Comparison

### Root Directory Before (47 files)
```
been-watching-v2/
├── ACTIVITY-CARD-TEMPLATES.md
├── ADMIN-CONSOLE-STATUS.md
├── ADMIN-CONSOLE-UPGRADE-PLAN.md
├── ADMIN-ROLE-MIGRATION-INSTRUCTIONS.md
├── ADMIN-USER-MANAGEMENT-UPGRADE.md
├── AI-ASSISTED-MODERATION.md
├── BOOZEHOUNDS-MIGRATION-PLAN.md
├── CHANGELOG.md
├── CURRENT-STATE-AND-ACTION-PLAN.md
├── DEPLOYMENT-GUIDE.md
├── DESIGN-SYSTEM-AUDIT.md
├── DEVELOPER-ONBOARDING.md
├── DOCUMENTATION-INDEX.md
├── ENHANCED-FEED-IMPLEMENTATION.md
├── ENHANCED-FEED-PLAN.md
├── FEED-MOCKUP-SESSION-NOTES.md
├── MIGRATION-INSTRUCTIONS.md
├── POSTHOG-COMPLETE-SUMMARY.md
├── POSTHOG-IMPLEMENTATION-PROGRESS.md
├── POSTHOG-SETUP-GUIDE.md
├── PROFILE-DARK-MODE-MOCKUP.md
├── PROJECT-COMPLETE-OVERVIEW.md
├── PROJECT-STATUS-OCTOBER-2025.md
├── PROJECT-STATUS.md
├── README-SETUP.md
├── README.md
├── ROADMAP-2025.md
├── ROADMAP-CHANGELOG.md
├── ROADMAP-CURRENT.md
├── SECURE-INVITE-SYSTEM-IMPLEMENTATION.md
├── SESSION-2025-01-21-DARK-MODE.md
├── SESSION-2025-01-22-OAUTH-THEME-UPDATES.md
├── SESSION-INVITE-SYSTEM-V2-FIXES-OCT25.md
├── SESSION-STATUS-2025-10-19.md
├── SESSION-STATUS-2025-10-20.md
├── SESSION-SUMMARY-2025-10-13.md
├── SESSION-SUMMARY-2025-10-26.md
├── SESSION-SUMMARY-2025-10-27.md
├── SESSION-SUMMARY-2025-10-30.md
├── SESSION-UPDATE-2025-10-20.md
├── SETTINGS-HUB-PLAN.md
├── SOCIAL-ACTIVITY-STRATEGY.md
├── SOCIAL-SYSTEM-IMPLEMENTATION.md
├── SOCIAL-SYSTEM-PROGRESS-105K.md
├── TESTING-CHECKLIST.md
├── USER-PROFILE-ENHANCEMENTS.md
├── USER-REPORTING-SYSTEM.md
├── enhanced-feed-documentation.md
└── potential_activitycards.md
```

### Root Directory After (6 files)
```
been-watching-v2/
├── README.md                # Project overview
├── CHANGELOG.md             # Version history
├── CONTRIBUTING.md          # How to contribute
├── LICENSE.md               # License (if applicable)
├── package.json             # Project dependencies
├── .env.example             # Environment template
├── .gitignore               # Git configuration
└── docs/                    # All documentation here
```

---

## Success Metrics

### Quantitative Goals

- **Root directory:** Reduce from 47 to 6 markdown files
- **Archive rate:** 14 session notes archived
- **Consolidation:** 3-5 duplicate files merged
- **Navigation depth:** Max 3 clicks to any document
- **Broken links:** 0 broken internal links

### Qualitative Goals

- New developers can find setup guide in < 30 seconds
- Clear separation of active vs archived content
- Consistent naming across all documentation
- Easy to maintain and update
- Clear information hierarchy

---

## Maintenance Guidelines

### When Creating New Documentation

1. **Determine category:**
   - Is it architecture? → `docs/architecture/`
   - Is it a guide? → `docs/guides/`
   - Is it feature documentation? → `docs/features/`
   - Is it planning? → `docs/planning/`

2. **Follow naming convention:**
   - Use kebab-case: `my-new-feature.md`
   - Use descriptive names
   - Avoid dates in filenames (unless session notes)

3. **Add metadata:**
   ```markdown
   # My New Feature

   **Last Updated:** YYYY-MM-DD
   **Status:** Active
   **Audience:** Developers
   ```

4. **Update folder README:**
   - Add entry to table of contents
   - Link to the new document

### When Archiving Documentation

1. **Move to archive:**
   ```bash
   git mv docs/features/old-feature.md archive/deprecated/
   ```

2. **Update status:**
   ```markdown
   **Status:** Deprecated - See [new-feature.md](../docs/features/new-feature.md)
   ```

3. **Update cross-references:**
   - Update any links pointing to archived doc
   - Add redirect note in old location if needed

### Monthly Maintenance

**First of month tasks:**
1. Review docs/planning/todo.md
2. Update docs/planning/current-status.md
3. Archive completed session notes from previous month
4. Check for outdated documentation
5. Verify all links still work

---

## Risk Assessment & Mitigation

### Risks

1. **Broken links after migration**
   - **Mitigation:** Use git mv to preserve history, update links systematically

2. **Developer confusion during transition**
   - **Mitigation:** Announce changes, provide migration guide, old links redirect

3. **Time investment**
   - **Mitigation:** Phased approach, can pause between phases

4. **Lost context from session notes**
   - **Mitigation:** Archive, don't delete; keep chronological organization

### Rollback Plan

If issues arise:
```bash
# Git makes rollback easy
git revert [commit-hash]

# Or reset to before reorganization
git reset --hard [commit-before-reorg]
```

---

## Alternative Approaches Considered

### Option A: Minimal Changes
**Keep current structure, just archive session notes**

**Pros:**
- Quick to implement
- Low risk

**Cons:**
- Doesn't solve discoverability issues
- Root still cluttered
- No long-term improvement

**Decision:** Rejected - doesn't address core issues

### Option B: Documentation Website (MkDocs/Docusaurus)
**Generate static site from markdown**

**Pros:**
- Beautiful navigation
- Search functionality
- Versioning support

**Cons:**
- Requires build setup
- Maintenance overhead
- Overkill for team size

**Decision:** Deferred - consider for v1.0 release

### Option C: Wiki-Based (GitHub Wiki)
**Move all docs to GitHub Wiki**

**Pros:**
- Built-in navigation
- Easy to edit

**Cons:**
- Separate from codebase
- No version control integration
- Harder to maintain

**Decision:** Rejected - prefer docs-as-code approach

---

## Recommended Approach

**Proceed with proposed folder structure (Main Plan)**

**Rationale:**
1. Follows industry best practices (MkDocs structure)
2. Balances organization with simplicity
3. Works with existing markdown files
4. Easy to maintain
5. Scalable for future growth
6. Preserves git history
7. No additional tooling required

---

## Next Steps

### Immediate Actions (This Week)

1. **Review this plan** with team
2. **Get approval** for structural changes
3. **Create new folder structure**
4. **Start with Phase 1** (setup)

### Short Term (Next 2 Weeks)

1. **Complete migration** (Phases 2-3)
2. **Update cross-references** (Phase 4)
3. **Consolidate duplicates** (Phase 5)
4. **Test navigation**

### Long Term (Next Month)

1. **Monitor usage patterns**
2. **Gather feedback** from new developers
3. **Refine structure** as needed
4. **Create contribution guide**

---

## Questions for Discussion

1. **Should we use a documentation generator** (MkDocs) now or later?
2. **How should we handle versioned documentation** for v1.0 vs v2.0?
3. **Should session notes be kept indefinitely** or deleted after 6 months?
4. **Who owns documentation maintenance** going forward?
5. **Should we create a documentation review process** for PRs?

---

## Appendix: Documentation Best Practices 2025

### Industry Standards

**Source:** Research from Atlassian, Technical Writer HQ, NinjaOne, 2025

**Key Principles:**
1. **Structure over quantity** - Organized docs beat comprehensive but chaotic docs
2. **Discoverability first** - Users should find info in < 30 seconds
3. **Living documents** - Update as part of daily workflow (15-20% of dev time)
4. **Templates** - Standardize structure for consistency
5. **Visual aids** - Diagrams improve comprehension
6. **Accessibility** - Works with screen readers, clear hierarchy
7. **Version control** - Docs in git alongside code

### Recommended Tools

**For Future Consideration:**
- **MkDocs** - Simple static site generator for project docs
- **Docusaurus** - React-based documentation framework
- **GitBook** - Documentation platform with nice UI
- **Docsify** - On-the-fly markdown documentation

**Current Choice:**
- **Markdown + Git** - Simplest, most maintainable for team size

---

## Conclusion

This reorganization will transform the documentation from cluttered and hard to navigate into a well-organized, maintainable knowledge base. The proposed structure follows 2025 best practices while remaining simple enough for a small team to maintain.

**Expected Benefits:**
- 87% reduction in root directory clutter (47 → 6 files)
- Clear information architecture
- Faster onboarding for new developers
- Easier to maintain and update
- Better discoverability
- Professional appearance

**Time Investment:**
- Phase 1 (Setup): 2-3 hours
- Phase 2 (Migration): 4-6 hours
- Phase 3 (Update Links): 3-4 hours
- Phase 4 (Consolidation): 2-3 hours
- Phase 5 (Review): 1-2 hours
- **Total:** ~15-20 hours over 5 days

**Recommended Start Date:** This week
**Target Completion:** Within 2 weeks

---

**Document Version:** 1.0
**Created:** November 6, 2025
**Author:** Documentation Audit Team
**Status:** Proposal - Awaiting Approval

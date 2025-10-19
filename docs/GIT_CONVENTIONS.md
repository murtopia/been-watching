# Git Conventions

This document outlines the Git workflow, branching strategy, and commit message conventions for the Been Watching project.

## Table of Contents
- [Branching Strategy](#branching-strategy)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Release Process](#release-process)

---

## Branching Strategy

### Branch Types

#### `main` (Protected)
- **Purpose**: Production-ready code
- **Protection**: Requires PR approval, all checks must pass
- **Deploy Target**: Production environment
- **Naming**: Always `main`

#### `develop` (Optional)
- **Purpose**: Integration branch for features
- **Protection**: Recommended
- **Deploy Target**: Staging environment (if exists)
- **Naming**: Always `develop`

#### Feature Branches
- **Purpose**: New features or enhancements
- **Naming Convention**: `feature/<feature-name>`
- **Examples**:
  - `feature/social-feed`
  - `feature/top-3-shows`
  - `feature/avatar-upload`
- **Branch From**: `main` or `develop`
- **Merge Into**: `main` or `develop`

#### Bug Fix Branches
- **Purpose**: Bug fixes
- **Naming Convention**: `fix/<bug-description>`
- **Examples**:
  - `fix/search-modal-crash`
  - `fix/rating-not-saving`
  - `fix/profile-loading-error`
- **Branch From**: `main` or `develop`
- **Merge Into**: `main` or `develop`

#### Hotfix Branches
- **Purpose**: Critical production bugs
- **Naming Convention**: `hotfix/<issue-description>`
- **Examples**:
  - `hotfix/auth-bypass`
  - `hotfix/data-leak`
- **Branch From**: `main`
- **Merge Into**: `main` (and backport to `develop`)

#### Documentation Branches
- **Purpose**: Documentation updates
- **Naming Convention**: `docs/<doc-name>`
- **Examples**:
  - `docs/api-documentation`
  - `docs/developer-guide`
- **Branch From**: `main`
- **Merge Into**: `main`

#### Refactor Branches
- **Purpose**: Code refactoring without new features
- **Naming Convention**: `refactor/<component-name>`
- **Examples**:
  - `refactor/search-modal`
  - `refactor/media-card`
- **Branch From**: `main` or `develop`
- **Merge Into**: `main` or `develop`

### Branch Lifecycle

```
1. Create Branch
   git checkout -b feature/new-feature main

2. Work on Feature
   git add .
   git commit -m "feat: add new feature"

3. Push to Remote
   git push -u origin feature/new-feature

4. Create Pull Request
   - On GitHub
   - Request review

5. Address Feedback
   git add .
   git commit -m "fix: address PR feedback"
   git push

6. Merge PR
   - Squash and merge (recommended)
   - Or merge commit

7. Delete Branch
   git branch -d feature/new-feature
   git push origin --delete feature/new-feature
```

---

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, whitespace)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or correcting tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: Changes to CI configuration
- **build**: Changes that affect the build system or dependencies
- **revert**: Reverts a previous commit

### Scope (Optional)

The scope should be the name of the component or module affected:

- `auth`: Authentication
- `search`: Search functionality
- `profile`: Profile page
- `api`: API routes
- `db`: Database
- `ui`: UI components
- `nav`: Navigation

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep it under 50 characters

### Body (Optional)

- Explain **what** and **why**, not **how**
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### Examples

#### Simple Feature
```
feat(search): add debouncing to search input

Reduces API calls by waiting 300ms after user stops typing
before sending the search request.
```

#### Bug Fix
```
fix(profile): fix top 3 shows modal crash

The modal was trying to use TVSeasonCard with wrong props.
Created custom SeasonSelectCard component instead.

Fixes #42
```

#### Breaking Change
```
feat(api): change user media endpoint response format

BREAKING CHANGE: The /api/user-media endpoint now returns
data in { data: [] } format instead of returning the array directly.

Update all calls to access response.data instead of response.
```

#### Documentation
```
docs: add API documentation

Added comprehensive API docs covering all TMDB proxy routes
and user media endpoints with examples.
```

#### Refactor
```
refactor(media-card): extract poster component

Extracted poster rendering logic into separate PosterImage
component for better reusability.
```

#### Multiple Changes (Avoid)
```
# ❌ Bad - too many changes in one commit
feat: add top 3, fix search, update docs

# ✅ Good - separate commits
feat(profile): add top 3 shows feature
fix(search): fix season display bug
docs: update feature history
```

---

## Pull Request Guidelines

### Before Creating PR

1. **Update your branch** with latest main
   ```bash
   git checkout main
   git pull
   git checkout feature/your-feature
   git rebase main
   ```

2. **Test your changes**
   - Run the app locally
   - Check for console errors
   - Test all affected functionality
   - Run linter: `npm run lint`

3. **Review your changes**
   ```bash
   git diff main
   ```

4. **Clean commit history**
   - Squash fixup commits if needed
   - Ensure commit messages follow conventions

### PR Title Format

Follow commit message format:
```
feat(search): add season-by-season display
fix(auth): resolve login redirect issue
docs: update developer guide
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update

## Changes Made
- List specific changes
- One per line
- Be detailed

## Testing
Describe how you tested these changes:
- [ ] Tested locally
- [ ] Tested on multiple browsers
- [ ] Tested edge cases

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Related to #456

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] No console errors
```

### Review Process

1. **Create PR** on GitHub
2. **Request review** from team member
3. **Address feedback** - make changes and push
4. **Re-request review** after changes
5. **Merge** once approved

### Merge Strategy

**Recommended**: Squash and Merge
- Keeps main branch history clean
- One commit per feature
- Easy to revert if needed

**Alternative**: Merge Commit
- Preserves full commit history
- Use for major features with important commit history

**Avoid**: Rebase and Merge
- Can cause confusion with force pushes

---

## Release Process

### Version Numbers

Follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: 1.2.3
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Pre-Release Versions

```
0.1.0-alpha    # Alpha release
0.1.0-beta     # Beta release
0.1.0-rc.1     # Release candidate
```

### Creating a Release

1. **Update version** in `package.json`
   ```bash
   npm version minor  # or major, patch
   ```

2. **Update CHANGELOG.md**
   - Add release notes
   - List all changes
   - Credit contributors

3. **Create release branch** (optional)
   ```bash
   git checkout -b release/v1.2.0
   ```

4. **Tag the release**
   ```bash
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin v1.2.0
   ```

5. **Create GitHub Release**
   - Go to GitHub Releases
   - Draft new release
   - Select tag
   - Add release notes
   - Publish

### Release Notes Template

```markdown
# Version 1.2.0 - 2025-01-XX

## 🎉 New Features
- Feature 1 description (#123)
- Feature 2 description (#124)

## 🐛 Bug Fixes
- Fix 1 description (#125)
- Fix 2 description (#126)

## 🔧 Improvements
- Improvement 1 (#127)
- Improvement 2 (#128)

## 📖 Documentation
- Updated API docs
- Added architecture guide

## ⚠️ Breaking Changes
- Breaking change description
- Migration guide

## 👥 Contributors
- @username1
- @username2

## 📦 Dependencies
- Updated dependency X to v2.0
- Added new dependency Y

Full changelog: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

---

## Git Commands Reference

### Common Workflows

#### Start New Feature
```bash
git checkout main
git pull
git checkout -b feature/new-feature
```

#### Commit Changes
```bash
git add .
git commit -m "feat(scope): description"
```

#### Update Feature Branch
```bash
git checkout main
git pull
git checkout feature/new-feature
git rebase main
```

#### Squash Commits
```bash
# Interactive rebase last 3 commits
git rebase -i HEAD~3

# In editor, change 'pick' to 'squash' for commits to combine
```

#### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

#### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

#### View Commit History
```bash
git log --oneline --graph --all
```

#### Stash Changes
```bash
git stash
git stash pop
```

---

## Best Practices

### Do's ✅

- **Commit often** - Small, focused commits
- **Write clear messages** - Explain why, not just what
- **Test before committing** - Ensure code works
- **Keep branches up to date** - Rebase regularly
- **Review your own PRs first** - Catch obvious issues
- **Request specific reviewers** - For domain expertise
- **Respond to feedback promptly** - Keep PRs moving

### Don'ts ❌

- **Don't commit directly to main** - Always use PRs
- **Don't force push to shared branches** - Can cause conflicts
- **Don't commit large files** - Use .gitignore
- **Don't commit secrets** - Use environment variables
- **Don't leave PRs stale** - Merge or close them
- **Don't make unrelated changes** - Keep PRs focused
- **Don't rewrite public history** - Only rebase local branches

---

## Troubleshooting

### Merge Conflicts

```bash
# Update your branch
git checkout main
git pull
git checkout feature/your-feature
git rebase main

# If conflicts occur
# 1. Resolve conflicts in your editor
# 2. Stage resolved files
git add .

# 3. Continue rebase
git rebase --continue

# 4. Force push (only if you haven't shared the branch)
git push --force-with-lease
```

### Accidentally Committed to Main

```bash
# Create a branch from current state
git branch feature/oops

# Reset main to remote state
git checkout main
git reset --hard origin/main

# Continue work on the branch
git checkout feature/oops
```

### Need to Fix Last Commit Message

```bash
git commit --amend -m "new message"

# If already pushed (use with caution)
git push --force-with-lease
```

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)

---

**Last Updated**: January 2025

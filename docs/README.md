# Been Watching - Documentation Index

**Last Updated:** January 2025
**Version:** 2.0 (Consolidated Structure)

This index helps you find the right documentation for your needs.

---

## 🚀 Start Here

### New to the Project?
**Start with:** [Developer Onboarding](getting-started/developer-onboarding.md)

This guide will:
- Set up your development environment
- Explain core concepts and architecture
- Show you how to complete common tasks
- Get you coding in 30 minutes

### Want to Understand the Big Picture?
**Read:** [Project Overview](architecture/project-overview.md)

This document covers:
- What Been Watching is and why it exists
- Complete feature list and capabilities
- Technology stack and architecture decisions
- Database schema and key patterns
- Design system and brand guidelines

### Planning Your Next Feature?
**Check:** [Roadmap](planning/roadmap.md) ⭐ **PRIMARY ROADMAP**

This roadmap includes:
- Priority matrix (Critical → High → Medium → Nice to Have)
- Detailed feature specifications with Nick's questions
- Version milestones (v0.2.0 → v0.5.0 → v1.0.0)
- Success metrics and goals
- Features we're intentionally NOT building
- Marketing & growth strategy
- Technical debt to address

---

## 📁 Documentation Structure

### `/getting-started` - New Developer Onboarding
- **[developer-onboarding.md](getting-started/developer-onboarding.md)** 📄 - Complete onboarding guide
- **[setup.md](getting-started/setup.md)** 🔧 - Environment setup instructions

### `/architecture` - System Design
- **[project-overview.md](architecture/project-overview.md)** 📄 - High-level architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed technical architecture

### `/features` - Feature Documentation

#### Core Features (Consolidated)
- **[analytics.md](features/analytics.md)** 📄 **CONSOLIDATED**
  - PostHog integration (17+ events)
  - Privacy-first implementation
  - Dashboard setup and testing
  - Complete API reference
  - *Consolidated from: 3 PostHog documents*

- **[feed-system.md](features/feed-system.md)** 📄 **CONSOLIDATED**
  - TikTok-inspired full-screen design
  - Recommendation engine (collaborative + content-based)
  - Release notifications (TV, theatrical, streaming)
  - Activity aggregation (1-minute grouping)
  - Complete database schema and API endpoints
  - Design system specs (glassmorphism, typography)
  - *Consolidated from: 3 feed documents*

#### Social Features
- **[social-activity-strategy.md](features/social-activity-strategy.md)** 📝 - Social features philosophy
- **[social-system-implementation.md](features/social-system-implementation.md)** - Friends/follow system
- **[user-profile-enhancements.md](features/user-profile-enhancements.md)** - Profile features
- **[invite-system.md](features/invite-system.md)** - Secure invite system

#### Admin & Moderation
- **[admin-console-status.md](features/admin-console-status.md)** 📊 - Admin console status
- **[ai-moderation.md](features/ai-moderation.md)** - AI-assisted moderation
- **[user-reporting.md](features/user-reporting.md)** - User reporting system

### `/planning` - Roadmaps & Status

#### Current Planning
- **[roadmap.md](planning/roadmap.md)** 📄 ⭐ **PRIMARY - CONSOLIDATED**
  - All current priorities and future plans
  - Nick's questions and ideas integrated
  - Complete version timeline
  - *Consolidated from: 2 roadmap documents*

- **[project-status-current.md](planning/project-status-current.md)** 📊 - Current status
- **[current-state-action-plan.md](planning/current-state-action-plan.md)** - Action items

#### Feature Planning
- **[feed-plan.md](planning/feed-plan.md)** 📝 - Feed system planning
- **[admin-console-upgrade-plan.md](planning/admin-console-upgrade-plan.md)** - Admin roadmap
- **[admin-user-management-upgrade.md](planning/admin-user-management-upgrade.md)** - User management
- **[boozehounds-migration-plan.md](planning/boozehounds-migration-plan.md)** - Alpha migration
- **[settings-hub-plan.md](planning/settings-hub-plan.md)** - Settings hub design

### `/guides` - How-To Documentation
- **[deployment.md](guides/deployment.md)** 🔧 - Deployment guide
- **[posthog-setup.md](guides/posthog-setup.md)** 🔧 - PostHog setup walkthrough
- **[admin-role-migration.md](guides/admin-role-migration.md)** - Admin role setup
- **[migration-instructions.md](guides/migration-instructions.md)** - Data migration
- **[testing-checklist.md](guides/testing-checklist.md)** - Pre-deployment testing

### `/design` - Design System & Mockups
- **[design-system-audit.md](design/design-system-audit.md)** 🎨 - Design system audit
- **[activity-card-templates.md](design/activity-card-templates.md)** - Card designs
- **[activity-card-types.md](design/activity-card-types.md)** - Card specifications
- **[profile-dark-mode-mockup.md](design/profile-dark-mode-mockup.md)** - Dark mode design

#### Interactive Mockups (`/public`)
- `feed-component-mockups.html` - Feed component examples
- `feed-comparison-mockup.html` - Feed design comparison
- `tiktok-activity-cards-complete.html` - TikTok-style feed
- `single-card-interactive.html` - Interactive card demo
- `breaking-bad-glass-overlay-v2.html` - Glassmorphism demo

### `/reference` - Technical Reference
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[GIT_CONVENTIONS.md](GIT_CONVENTIONS.md)** - Git workflow
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Development guidelines
- **[FEATURE_HISTORY.md](FEATURE_HISTORY.md)** - Feature timeline

---

## 🔍 Finding What You Need

### By Feature Area

#### Analytics & Tracking
- **Setup**: [PostHog Setup Guide](guides/posthog-setup.md)
- **Reference**: [Analytics Documentation](features/analytics.md) ← **Consolidated**
- **Events**: 17+ tracked events with examples

#### Activity Feed
- **Complete Docs**: [Feed System](features/feed-system.md) ← **Consolidated**
- **Design**: [Activity Card Templates](design/activity-card-templates.md)
- **Mockups**: `/public/feed-component-mockups.html`
- **Planning**: [Feed Plan](planning/feed-plan.md)

#### Social Features
- **Strategy**: [Social Activity Strategy](features/social-activity-strategy.md)
- **Implementation**: [Social System Implementation](features/social-system-implementation.md)
- **Profiles**: [User Profile Enhancements](features/user-profile-enhancements.md)
- **Taste Match**: Algorithm in Project Overview

#### Admin Tools
- **Status**: [Admin Console Status](features/admin-console-status.md)
- **Planning**: [Admin Console Upgrade Plan](planning/admin-console-upgrade-plan.md)
- **Moderation**: [AI Moderation](features/ai-moderation.md)

#### User Management
- **Invites**: [Invite System](features/invite-system.md)
- **Reporting**: [User Reporting System](features/user-reporting.md)
- **Migration**: [Migration Instructions](guides/migration-instructions.md)

---

### By Task

#### Setting Up Development Environment
1. [Setup Guide](getting-started/setup.md)
2. [Developer Onboarding](getting-started/developer-onboarding.md)
3. [PostHog Setup](guides/posthog-setup.md)

#### Understanding the Codebase
1. [Project Overview](architecture/project-overview.md)
2. [Architecture](ARCHITECTURE.md)
3. [API Documentation](API_DOCUMENTATION.md)
4. [Feature History](FEATURE_HISTORY.md)

#### Implementing a Feature
1. Check [Roadmap](planning/roadmap.md) for priorities
2. Read relevant feature doc in [/features](features/)
3. Follow [Git Conventions](GIT_CONVENTIONS.md)
4. Use [Testing Checklist](guides/testing-checklist.md)

#### Deploying to Production
1. [Testing Checklist](guides/testing-checklist.md)
2. [Deployment Guide](guides/deployment.md)

---

## 📊 Project Status

### Current Phase
**Alpha Testing (v0.2.0)** - Private alpha with 10+ users

### Next Milestones
- **v0.2.0 (Feb 2025)**: Beta release with 50-100 users
- **v0.5.0 (Mar 2025)**: Public beta with invite codes
- **v1.0.0 (May 2025)**: Public launch

See [Roadmap](planning/roadmap.md) for complete timeline and priorities.

---

## 🔥 Top Priorities (Next 2 Weeks)

From the [Roadmap](planning/roadmap.md):

1. **Episode-Level Tracking** ⭐
   - Track episode progress for TV shows
   - Progress bars and "Next Episode" button
   - MVP: 2-3 days

2. **Show Notes Feature** ⭐
   - 280-character micro-reviews (killer feature!)
   - Public/private notes
   - Activity feed integration
   - MVP: 3-4 days

3. **Notification System** ✅
   - Already complete!
   - May need refinements based on feedback

---

## 📚 Session Documentation

Historical session notes documenting development progress:

### Recent Sessions (January 2025)
- **[SESSION-2025-01-22](SESSION-2025-01-22-OAUTH-THEME-UPDATES.md)** - OAuth & theme updates
- **[SESSION-2025-01-21](SESSION-2025-01-21-DARK-MODE.md)** - Dark mode implementation

### October 2025 Sessions
- **[SESSION-2025-10-20 (Update)](SESSION-UPDATE-2025-10-20.md)** - Activity feed fixes & Top 3 Shows
- **[SESSION-2025-10-20 (Status)](SESSION-STATUS-2025-10-20.md)** - OAuth fixes & landing page
- **[SESSION-2025-10-19](SESSION-STATUS-2025-10-19.md)** - Data migration & watch status
- **[SESSION-2025-10-13](SESSION-SUMMARY-2025-10-13.md)** - Instagram-like activity features

**All session notes:** [`../archive/sessions/`](../archive/sessions/)

---

## 📝 Recent Updates

### January 2025 - Documentation Consolidation
- ✅ Consolidated all major documentation
- ✅ Created 3 authoritative documents:
  - [Analytics](features/analytics.md) - From 3 PostHog docs
  - [Feed System](features/feed-system.md) - From 3 feed docs
  - [Roadmap](planning/roadmap.md) - From 2 roadmap docs
- ✅ Organized documentation structure
- ✅ Moved 47 files from root → organized folders
- ✅ Archived historical documents

### Recent Features Completed
- ✅ Notification system with real-time updates
- ✅ Social discovery system (taste match)
- ✅ Season-specific TV tracking
- ✅ Dark mode support

See [CHANGELOG.md](../CHANGELOG.md) for full history.

---

## 🎨 Design Philosophy

Been Watching embraces:
- **Content First**: Poster art as the hero
- **Mobile Native**: Thumb-friendly zones and familiar gestures
- **Progressive Disclosure**: Essential info first, details on demand
- **Glassmorphism**: Modern iOS aesthetic with transparency effects
- **TikTok-Inspired**: Full-screen immersive cards

See [Design System Audit](design/design-system-audit.md) and [Feed System](features/feed-system.md) for details.

---

## 🤝 Contributing

### Before Starting Work

1. Check [Roadmap](planning/roadmap.md) for current priorities
2. Read relevant feature documentation
3. Follow [Git Conventions](GIT_CONVENTIONS.md)
4. Review [Developer Guide](DEVELOPER_GUIDE.md)

### Development Workflow

1. Create feature branch from `main`
2. Follow coding standards in [Developer Guide](DEVELOPER_GUIDE.md)
3. Test thoroughly using [Testing Checklist](guides/testing-checklist.md)
4. Submit pull request with clear description

---

## 📚 External Resources

- **Next.js 15**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **TMDB API**: https://developers.themoviedb.org/3
- **PostHog**: https://posthog.com/docs

---

## 🔗 Quick Links

| Category | Document | Status |
|----------|----------|--------|
| 🚀 **Roadmap** | [planning/roadmap.md](planning/roadmap.md) | ✅ Consolidated |
| 📊 **Analytics** | [features/analytics.md](features/analytics.md) | ✅ Consolidated |
| 📱 **Feed System** | [features/feed-system.md](features/feed-system.md) | ✅ Consolidated |
| 👥 **Social Features** | [features/social-activity-strategy.md](features/social-activity-strategy.md) | Active |
| ⚙️ **Admin Console** | [features/admin-console-status.md](features/admin-console-status.md) | Active |
| 🎨 **Design System** | [design/design-system-audit.md](design/design-system-audit.md) | Active |
| 🔧 **Setup Guide** | [getting-started/setup.md](getting-started/setup.md) | Active |
| 🚢 **Deployment** | [guides/deployment.md](guides/deployment.md) | Active |

---

## 📌 Documentation Legend

- 📄 **Core Documentation** - Essential reading
- 📝 **Planning Docs** - Feature planning and design
- 🔧 **Setup Guides** - Installation and configuration
- 📊 **Status Reports** - Current state and progress
- 🎨 **Design Docs** - Visual design and UI specs
- ✅ **Consolidated** - Multiple docs merged into one authoritative source

---

## ❓ Need Help?

### Documentation Not Clear?
- Check the [Project Overview](architecture/project-overview.md)
- Review the [API Documentation](API_DOCUMENTATION.md)
- Look at code comments in relevant files

### Feature Not Documented?
- Check [FEATURE_HISTORY.md](FEATURE_HISTORY.md)
- Review git history: `git log --all --grep="feature-name"`
- Check [archived session notes](../archive/sessions/)

### Something Broken?
- See [Testing Checklist](guides/testing-checklist.md)
- Check [CURRENT-STATE.md](CURRENT-STATE.md)
- Review recent changes in [CHANGELOG.md](../CHANGELOG.md)

### Looking for Old Documentation?
- **Archived Files**: [`../archive/deprecated/`](../archive/deprecated/)
- **Session Notes**: [`../archive/sessions/`](../archive/sessions/)
- **Consolidation Summary**: [`../DOCUMENTATION-CONSOLIDATION-SUMMARY.md`](../DOCUMENTATION-CONSOLIDATION-SUMMARY.md)

---

## 📋 Documentation Maintenance

### When You Make Changes

**Always Update:**
- [CHANGELOG.md](../CHANGELOG.md) - Add entry for your change
- Create session doc for major features

**Update if Changed:**
- [Roadmap](planning/roadmap.md) - Mark features complete, add new priorities
- [Project Overview](architecture/project-overview.md) - For architecture changes
- [Developer Onboarding](getting-started/developer-onboarding.md) - For setup changes

**Review Periodically:**
- [Roadmap](planning/roadmap.md) - Review priorities monthly
- This index - Update when adding new docs

---

## ✨ Quick Reference

### Most Important Files for:

**New Developers:**
1. [Developer Onboarding](getting-started/developer-onboarding.md)
2. [Project Overview](architecture/project-overview.md)
3. [Roadmap](planning/roadmap.md)

**Understanding a Feature:**
1. Search [/features](features/) directory
2. Check [Roadmap](planning/roadmap.md) for status
3. Review [CHANGELOG.md](../CHANGELOG.md) for history

**Planning New Work:**
1. [Roadmap](planning/roadmap.md) - See priorities
2. GitHub Issues - See current bugs/requests
3. [Project Status](planning/project-status-current.md) - Check what's complete

**Deploying Changes:**
1. [Deployment Guide](guides/deployment.md)
2. [Testing Checklist](guides/testing-checklist.md)

---

**Happy Coding! 🎬**

For questions or updates, contact: **hello@beenwatching.com**

---

*Last Updated: January 2025*
*Documentation Version: 2.0 (Consolidated Structure)*
*Project Version: v0.2.0 (Alpha)*

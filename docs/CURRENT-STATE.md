# Been Watching - Current State
**Last Updated**: October 19, 2025

## 🚀 Production Status

### Live Application
- **URL**: https://been-watching-v2-fvupf24l4-nick-murtos-projects.vercel.app/
- **Platform**: Vercel
- **Auto-Deploy**: ✅ Enabled (GitHub main branch)
- **Status**: ✅ Live and Functional

### GitHub Repository
- **URL**: https://github.com/murtopia/been-watching
- **Branch**: main
- **Latest Commit**: "Fix watch status UI bugs and complete data migration" (af7fda5)

---

## 📊 Application Overview

### What is Been Watching?
A social TV/movie tracking app where users can:
- Track what they want to watch, are watching, and have watched
- Rate shows (meh/like/love)
- Share their Top 3 shows
- Follow friends and see their activity
- Discover new content via TMDB integration

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (Email/Password + Google OAuth)
- **API**: The Movie Database (TMDB) API
- **Styling**: Inline styles (no CSS framework)
- **Deployment**: Vercel

---

## 🎨 Design System

### Colors
- **Primary Gradient**: `linear-gradient(135deg, #e94d88 0%, #f27121 100%)`
  - Pink: #e94d88
  - Orange: #f27121
- **Backgrounds**:
  - Page: #ffffff (white)
  - Cards: #ffffff with subtle borders
- **Text**:
  - Primary: #1a1a1a
  - Secondary: #666
- **Borders**: #f0f0f0

### Special Effects
- **Glassmorphism** (auth page only):
  - `background: rgba(255, 255, 255, 0.55)`
  - `backdrop-filter: blur(30px) saturate(180%)`
  - `border: 1px solid rgba(255, 255, 255, 0.18)`

### Key UI Components
- **Top 3 Shows**: Enhanced gradient styling with hover effects
- **Search Modal**: Dual-button system (clear vs close)
- **Rating Buttons**: Fire emoji system (meh/like/love)
- **Watch Status Pills**: Want/Watching/Watched with gradient highlights

---

## 👥 User Data Status

### Nick (murtopia)
- ✅ **131 shows imported**
  - Want to Watch: 26
  - Watching: 13
  - Watched: 92
- ✅ Profile complete with avatar
- ✅ Top 3 shows configured
- ✅ Admin access enabled

### Boozehounds (Ready for Import)
- 📁 Todd's data: Ready in migration file
- 📁 Taylor's data: Ready in migration file
- 📁 Pat's data: Ready in migration file
- ⏳ Not yet imported - awaiting user request

---

## 🔑 Key Features

### Authentication ✅
- Email/password signup and login
- Google OAuth integration
- Invite code system (BOOZEHOUND, BWALPHA_*)
- Password reset flow
- Logout functionality on all pages

### Watch Status Management ✅
- Add shows to Want/Watching/Watched lists
- Rate shows (meh/like/love)
- View shows in grid or list mode
- Search TMDB for shows/movies
- Season-level tracking for TV shows
- Delete with confirmation dialog

### Profile Features ✅
- Avatar upload
- Display name and bio
- Privacy settings (public/private account)
- Top 3 shows selection
- Stats display (want/watching/watched counts)
- Invite code display and tracking

### Admin Features ✅
- User management dashboard
- Profile editing for all users
- System-wide settings

### Social Features 🚧
- Following/followers (UI ready, needs backend)
- Activity feed (UI ready, needs backend)
- Friend suggestions (UI ready, needs backend)

---

## 📁 Project Structure

```
been-watching-v2/
├── app/
│   ├── auth/page.tsx          # Login/signup with glassmorphism
│   ├── myshows/page.tsx       # Main watch list page
│   ├── profile/page.tsx       # User profile
│   ├── admin/page.tsx         # Admin dashboard
│   └── layout.tsx             # Root layout
├── components/
│   ├── media/
│   │   ├── MediaCard.tsx      # Show/movie card display
│   │   ├── MediaDetailModal.tsx  # Show details popup
│   │   └── MediaBadges.tsx    # Rating/status UI
│   ├── search/
│   │   ├── SearchModal.tsx    # TMDB search interface
│   │   └── TVSeasonCard.tsx   # Season selection
│   ├── profile/
│   │   ├── EditProfileModal.tsx
│   │   ├── AvatarUploadModal.tsx
│   │   └── TopShowModal.tsx   # Top 3 selection
│   └── navigation/
│       └── BottomNav.tsx      # Mobile nav bar
├── scripts/
│   └── import-nick-only.js    # Data migration script
├── database/
│   └── schema.sql             # Database structure
└── docs/
    ├── SESSION-2025-10-19.md  # Latest session notes
    └── CURRENT-STATE.md       # This file
```

---

## 🗃️ Database Schema

### Key Tables
- **profiles**: User info, settings, top shows
- **media**: Show/movie metadata from TMDB
- **watch_status**: User's watch lists (want/watching/watched)
- **ratings**: User ratings (meh/like/love)
- **follows**: Social connections (future)
- **master_codes**: Invite code system

### Important Notes
- **Media IDs**: Format is `{type}-{tmdb_id}` or `tv-{tmdb_id}-s{season}`
  - Movies: `movie-12345`
  - TV Seasons: `tv-12345-s1`, `tv-12345-s2`, etc.
- **NEVER** store full TV series - always individual seasons
- **Rating Values**: 'meh', 'like', 'love' (NOT meh/good/fire)

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No Dark Mode** - All white design only
2. **No Social Features** - Following/feed not implemented
3. **No Notifications** - System not built yet
4. **Desktop Only** - Mobile responsive but not optimized
5. **TMDB Rate Limits** - Need to add error handling

### Technical Debt
- Inline styles instead of CSS-in-JS or Tailwind
- No TypeScript strict mode
- ESLint and TS errors suppressed for deployment
- Missing E2E tests
- No error boundary components

---

## 🎯 Future Enhancements

### High Priority
1. **Dark Mode** - Needs professional React developer
2. **Social Feed** - Activity from followed users
3. **Notifications** - New followers, friend activity
4. **Mobile App** - React Native version

### Medium Priority
1. **Watchlist Sharing** - Share lists with friends
2. **Comments/Reviews** - Discuss shows with friends
3. **Recommendations** - AI-powered suggestions
4. **Statistics** - Viewing habits analytics

### Low Priority
1. **Import from other services** - Letterboxd, IMDb, etc.
2. **Browser extension** - Quick add from streaming sites
3. **Calendar integration** - Track air dates
4. **Collections** - Themed lists

---

## 🔐 Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TMDB_API_KEY=
```

---

## 🚨 Important Rules for Developers

1. **TV Shows = Individual Seasons** - Never track full series
2. **Media ID Format** - Always `type-id` or `tv-id-sN`
3. **Rating System** - meh/like/love (not numeric)
4. **Pink-to-Orange Gradient** - Primary brand identity
5. **Glassmorphism** - Keep auth page aesthetic
6. **No Dark Mode Yet** - Reverted, needs expert implementation

---

## 📞 Support & Handoff

### For Next Developer
- Review `docs/SESSION-2025-10-19.md` for recent changes
- Check git history starting from commit `af7fda5`
- All dark mode files have been removed - clean slate
- Search modal and Top 3 shows recently enhanced

### Quick Start
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Deployment
```bash
git push origin main
# Auto-deploys to Vercel
```

---

**Status**: ✅ Stable and ready for continued development

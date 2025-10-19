# Been Watching - Social TV/Movie Tracking App

A modern, social platform for tracking and sharing what you've been watching. Built with Next.js 15, TypeScript, Supabase, and TMDB API.

![Status](https://img.shields.io/badge/status-alpha-orange)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.x-blue)

## ✨ Features

### Current Features
- 🔐 **Authentication** - Email/password signup and login via Supabase
- 🔍 **Search** - Find any TV show or movie from TMDB's massive database
- 📺 **Track Shows** - Add shows to your collection with ratings and status
- 🎬 **Season Tracking** - Track TV shows on a per-season basis
- ⭐ **Ratings** - Rate content 1-5 stars
- 📊 **My Shows** - View and manage all your tracked content
- 👤 **Profile** - Personal profile with Top 3 shows (in progress)
- 🎨 **Liquid Glass Design** - Beautiful semi-transparent UI with gradient accents

### Coming Soon
- 👥 Social features (follow friends, activity feed)
- 📈 Statistics dashboard
- 🎯 Enhanced filtering and sorting
- 🔔 Notifications
- 📱 Mobile optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account ([Sign up free](https://supabase.com))
- TMDB API key ([Get one free](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd been-watching-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Set up the database**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Navigate to SQL Editor
   - Run the migration in `supabase/add-profile-features.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
been-watching-v2/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── tmdb/                # TMDB API proxy
│   │   └── user-media/          # User media endpoints
│   ├── myshows/                 # My Shows page
│   ├── profile/                 # Profile page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (trending)
├── components/                   # React components
│   ├── auth/                    # Authentication
│   ├── media/                   # Media cards & modals
│   ├── navigation/              # Navigation bar
│   ├── profile/                 # Profile components
│   └── search/                  # Search modal
├── docs/                        # Documentation
│   ├── TODO.md                  # Task list
│   ├── PROJECT_OVERVIEW.md      # Architecture guide
│   ├── DEVELOPER_GUIDE.md       # Developer onboarding
│   └── FEATURE_HISTORY.md       # Development history
├── lib/                         # Utilities
├── supabase/                    # Database migrations
├── .env.local                   # Environment variables (not in git)
└── package.json
```

## 🎨 Design System

### Color Palette
- **Background**: Dark gradient (#0a0a0a → #1a0a1a)
- **Glass Panels**: Semi-transparent white (rgba(255,255,255,0.1))
- **Accent**: Pink to orange gradient (#e94d88 → #f27121)
- **Text**: White with varying opacity

### Key Design Patterns
- **Liquid Glass**: Semi-transparent panels with backdrop blur
- **Smooth Animations**: Gentle transitions and hover effects
- **Card-Based Layout**: Consistent card design across features
- **Gradient Accents**: Pink-to-orange gradient for CTAs and highlights

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: React 19 + CSS-in-JS
- **Build Tool**: Turbopack

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **External Data**: [TMDB API](https://www.themoviedb.org/documentation/api)

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety

## 📖 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[TODO.md](docs/TODO.md)** - Prioritized task list and roadmap
- **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - High-level architecture and design decisions
- **[DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Guide for contributing developers
- **[FEATURE_HISTORY.md](docs/FEATURE_HISTORY.md)** - Development history and changelog
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API endpoints reference
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture diagrams
- **[GIT_CONVENTIONS.md](docs/GIT_CONVENTIONS.md)** - Git workflow and commit standards

## 🔑 Key Features Explained

### Season-Specific Tracking
Unlike other tracking apps, Been Watching lets you track TV shows by individual season. Each season can have its own rating and status.

**Season ID Format**: `tv-{tmdbId}-s{seasonNumber}`
- Example: `tv-110492-s1` = "High Potential - Season 1"

### Top 3 Shows
Showcase your favorite shows on your profile. The Top 3 feature uses JSONB storage for flexible data structure and fast reads.

### TMDB Integration
All movie/TV data comes from The Movie Database (TMDB) via secure API proxy routes, keeping your API key hidden from the client.

## 🚧 Development

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages (see [GIT_CONVENTIONS.md](docs/GIT_CONVENTIONS.md))
5. Submit a pull request

### Database Migrations

To run a new migration:

1. Create SQL file in `/supabase/`
2. Test locally in Supabase SQL Editor
3. Document in migration history
4. Commit the SQL file

## 🐛 Known Issues

- Next.js 15 async params warnings in some API routes
- Mobile responsiveness needs improvement
- Loading states missing in some components
- TypeScript uses `any` in several places

See [TODO.md](docs/TODO.md) for full list of issues and planned fixes.

## 🤝 Contributing

Contributions are welcome! Please read the [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) before getting started.

### Quick Contribution Guide

1. Check [TODO.md](docs/TODO.md) for available tasks
2. Assign yourself an issue or create a new one
3. Follow the development workflow above
4. Ensure code passes linting
5. Submit a PR with clear description

## 📄 License

This project is currently under development. License TBD.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for their incredible API
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting recommendations

## 📞 Contact & Support

- **Issues**: Please report bugs via GitHub Issues
- **Documentation**: Check the `/docs` folder
- **Questions**: Refer to [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)

## 🗺️ Roadmap

### Version 0.2.0 - Social Features
- Follow/unfollow users
- Activity feed
- Friend suggestions
- Privacy controls

### Version 0.3.0 - Enhanced Tracking
- Advanced filtering and sorting
- Statistics dashboard
- Custom lists
- Watchlist management

### Version 0.4.0 - Polish
- Mobile optimization
- Performance improvements
- Accessibility enhancements
- SEO optimization

### Version 1.0.0 - Production Release
- All core features complete
- Full test coverage
- Production deployment
- Public launch

See [TODO.md](docs/TODO.md) for detailed task breakdown.

---

**Built with ❤️ using Next.js, Supabase, and TMDB**

**Current Version**: 0.1.0 (Alpha)
**Last Updated**: January 2025
**Status**: Active Development

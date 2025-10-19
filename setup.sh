#!/bin/bash

# Been Watching - Automated Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🎬 Been Watching - Setup Script"
echo "================================"
echo ""

# Check Node.js installation
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm installation
echo "📦 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check for .env.local file
echo "🔐 Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found"
    echo "📝 Creating .env.local from .env.example..."

    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local"
        echo ""
        echo "🔧 IMPORTANT: Edit .env.local and add your credentials:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - TMDB_API_KEY"
        echo ""
        echo "Get Supabase credentials: https://app.supabase.com/project/_/settings/api"
        echo "Get TMDB API key: https://www.themoviedb.org/settings/api"
    else
        echo "❌ .env.example file not found"
        exit 1
    fi
else
    echo "✅ .env.local file exists"

    # Check if environment variables are set
    source .env.local

    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your_supabase_project_url" ]; then
        echo "⚠️  NEXT_PUBLIC_SUPABASE_URL is not set"
    else
        echo "✅ Supabase URL configured"
    fi

    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your_supabase_anon_key" ]; then
        echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
    else
        echo "✅ Supabase anon key configured"
    fi

    if [ -z "$TMDB_API_KEY" ] || [ "$TMDB_API_KEY" = "your_tmdb_api_key" ]; then
        echo "⚠️  TMDB_API_KEY is not set"
    else
        echo "✅ TMDB API key configured"
    fi
fi
echo ""

# Database setup reminder
echo "🗄️  Database Setup"
echo "=================="
echo "Don't forget to run the database migrations!"
echo ""
echo "Steps:"
echo "1. Go to https://app.supabase.com"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Open and run: supabase/add-profile-features.sql"
echo ""

# Git setup check
echo "📚 Git Configuration"
echo "===================="
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"

    # Check if .gitignore exists
    if [ -f ".gitignore" ]; then
        if grep -q ".env.local" .gitignore; then
            echo "✅ .env.local is in .gitignore"
        else
            echo "⚠️  Adding .env.local to .gitignore..."
            echo ".env.local" >> .gitignore
        fi
    fi
else
    echo "⚠️  Git repository not initialized"
    echo "Run: git init"
fi
echo ""

# Documentation check
echo "📖 Documentation"
echo "================"
if [ -d "docs" ]; then
    echo "✅ Documentation folder exists"
    echo "   - docs/TODO.md - Task list"
    echo "   - docs/DEVELOPER_GUIDE.md - Developer guide"
    echo "   - docs/PROJECT_OVERVIEW.md - Project overview"
    echo "   - docs/API_DOCUMENTATION.md - API reference"
else
    echo "⚠️  docs folder not found"
fi
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Configure .env.local with your credentials (if not done)"
echo "2. Run database migrations in Supabase SQL Editor"
echo "3. Start the development server: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For help, check:"
echo "- README.md - Quick start guide"
echo "- docs/DEVELOPER_GUIDE.md - Detailed development guide"
echo "- docs/TODO.md - Feature roadmap"
echo ""
echo "Happy coding! 🚀"

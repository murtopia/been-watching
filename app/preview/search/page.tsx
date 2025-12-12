'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import SearchModalEnhanced from '@/components/search/SearchModalEnhanced'
import AppHeader from '@/components/navigation/AppHeader'

export default function SearchPreview() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const colors = useThemeColors()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleSelectMedia = async (media: any, rating?: string, status?: string) => {
    if (!user) {
      console.log('No user logged in - would prompt login')
      return
    }

    const supabase = createClient()
    
    // Determine media_id format
    let mediaId: string
    if (typeof media.id === 'string' && media.id.startsWith('tv-')) {
      // Already formatted (season-specific)
      mediaId = media.id
    } else {
      // Need to format
      mediaId = media.media_type === 'movie' ? `movie-${media.id}` : `tv-${media.id}`
    }

    // Save rating if provided
    if (rating !== undefined) {
      if (rating === null) {
        await supabase
          .from('ratings')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
      } else {
        await supabase
          .from('ratings')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            rating: rating,
            media_title: media.title || media.name,
            media_poster: media.poster_path,
            media_type: media.media_type
          }, { onConflict: 'user_id,media_id' })
      }
    }

    // Save status if provided
    if (status !== undefined) {
      if (status === null) {
        await supabase
          .from('watch_status')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
      } else {
        await supabase
          .from('watch_status')
          .upsert({
            user_id: user.id,
            media_id: mediaId,
            status: status,
            media_title: media.title || media.name,
            media_poster: media.poster_path,
            media_type: media.media_type
          }, { onConflict: 'user_id,media_id' })
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.pageBg,
      color: colors.textPrimary
    }}>
      <AppHeader showLogo showThemeToggle />
      
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '100px 20px 120px'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem',
          background: colors.brandGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Search Modal Preview
        </h1>
        <p style={{ 
          color: colors.textSecondary, 
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          Testing the enhanced search with trending suggestions.
        </p>

        {/* Info Card */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: colors.glassBorder
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
            ✨ New Features
          </h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              <span style={{ color: colors.brandPink }}>🔥</span>
              <span>Shows <strong style={{ color: colors.textPrimary }}>trending content</strong> when search is empty</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              <span style={{ color: colors.brandPink }}>✓</span>
              <span><strong style={{ color: colors.textPrimary }}>Excludes shows</strong> you already have in any watchlist</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              <span style={{ color: colors.brandPink }}>🎬</span>
              <span>Filter trending by <strong style={{ color: colors.textPrimary }}>All / TV / Movies</strong></span>
            </li>
          </ul>
        </div>

        {/* Login Status */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          border: colors.glassBorder,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: user ? '#22c55e' : '#ef4444'
          }} />
          <span style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
            {user ? `Logged in as ${user.email}` : 'Not logged in - watchlist filtering disabled'}
          </span>
        </div>

        {/* Open Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            background: colors.brandGradient,
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>+</span>
          Open Search Modal
        </button>

        {/* Test Instructions */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          borderRadius: '12px',
          background: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
          border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: colors.brandBlue }}>
            📋 Test Checklist
          </h3>
          <ol style={{ 
            margin: 0, 
            paddingLeft: '1.25rem',
            color: colors.textSecondary,
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <li>Open modal → should see "Trending This Week" section</li>
            <li>Shows you've added should NOT appear in trending</li>
            <li>Filter tabs should filter trending content too</li>
            <li>Type to search → trending hides, search results appear</li>
            <li>Clear search → trending returns</li>
          </ol>
        </div>
      </div>

      {/* Enhanced Search Modal */}
      <SearchModalEnhanced
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMedia={handleSelectMedia}
        user={user}
      />
    </div>
  )
}


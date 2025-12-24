'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useThemeColors } from '@/hooks/useThemeColors'
import SearchModalEnhanced from '@/components/search/SearchModalEnhanced'
import AppHeader from '@/components/navigation/AppHeader'

export default function SearchPreview() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const colors = useThemeColors()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        setProfile(profileData)
      }
    })
  }, [])

  const handleSelectMedia = async (media: any, rating?: string, status?: string) => {
    // The SearchModalEnhanced now handles saving directly
    console.log('Media selected:', media.title, 'Rating:', rating, 'Status:', status)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bgGradient,
      color: colors.textPrimary
    }}>
      <AppHeader showThemeToggle />
      
      <div style={{
        maxWidth: '398px',
        margin: '0 auto',
        padding: '100px 20px 120px'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem',
          color: colors.goldAccent,
          WebkitTextFillColor: 'transparent'
        }}>
          Search Modal Preview
        </h1>
        <p style={{ 
          color: colors.textSecondary, 
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          Redesigned search with ShowDetailCard integration.
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
            ✨ New Design
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
              <span style={{ color: colors.goldAccent }}>📝</span>
              <span><strong style={{ color: colors.textPrimary }}>"Add or Rate a Show"</strong> header with close icon</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              <span style={{ color: colors.goldAccent }}>🔥</span>
              <span><strong style={{ color: colors.textPrimary }}>6 trending cards</strong> in 3x2 grid</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              <span style={{ color: colors.goldAccent }}>🎬</span>
              <span>Tap card opens <strong style={{ color: colors.textPrimary }}>ShowDetailCard modal</strong></span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.textSecondary, fontSize: '0.9rem' }}>
              <span style={{ color: colors.goldAccent }}>✓</span>
              <span>Modal <strong style={{ color: colors.textPrimary }}>stays open</strong> after rating/adding</span>
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
            background: `linear-gradient(135deg, ${colors.goldAccent}, ${colors.goldAccent}dd)`,
            border: 'none',
            color: '#000',
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
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: colors.goldAccent }}>
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
            <li>Open modal → see 6 trending cards in grid</li>
            <li>Tap a card → ShowDetailCard opens</li>
            <li>Rate or add to watchlist → modal stays open</li>
            <li>Close detail card → back to search modal</li>
            <li>Type to search → grid shows results</li>
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
        profile={profile}
      />
    </div>
  )
}

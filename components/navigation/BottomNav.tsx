'use client'

import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function BottomNav({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const router = useRouter()
  const colors = useThemeColors()

  const handleNavClick = (action: string) => {
    if (action === 'search') {
      onSearchOpen?.()
    } else {
      router.push(action)
    }
  }

  const pillButtonStyle: React.CSSProperties = {
    width: '100px',
    background: colors.goldGlassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: colors.goldBorder,
    borderRadius: '24px',
    padding: '14px 0',
    color: colors.isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  }

  const plusButtonStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: colors.goldGlassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: colors.goldBorder,
    color: colors.isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
    fontSize: '28px',
    fontWeight: 300,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      {/* HOME Button */}
      <button
        onClick={() => handleNavClick('/feed')}
        style={pillButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.background = colors.isDark 
            ? 'rgba(255, 193, 37, 0.25)' 
            : 'rgba(255, 193, 37, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = colors.goldGlassBg
        }}
      >
        HOME
      </button>

      {/* Plus Button */}
      <button
        onClick={() => handleNavClick('search')}
        style={plusButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.background = colors.isDark 
            ? 'rgba(255, 193, 37, 0.25)' 
            : 'rgba(255, 193, 37, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = colors.goldGlassBg
        }}
      >
        +
      </button>

      {/* LISTS Button */}
      <button
        onClick={() => handleNavClick('/myshows')}
        style={pillButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.background = colors.isDark 
            ? 'rgba(255, 193, 37, 0.25)' 
            : 'rgba(255, 193, 37, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.background = colors.goldGlassBg
        }}
      >
        LISTS
      </button>
    </nav>
  )
}

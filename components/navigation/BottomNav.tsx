'use client'

import { useRouter } from 'next/navigation'

export default function BottomNav({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const router = useRouter()

  const handleNavClick = (action: string) => {
    if (action === 'search') {
      onSearchOpen?.()
    } else {
      router.push(action)
    }
  }

  const pillButtonStyle: React.CSSProperties = {
    width: '100px',
    background: 'rgba(60, 60, 70, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '14px 0',
    color: 'rgba(255, 255, 255, 0.9)',
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
    background: 'rgba(60, 60, 70, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.95)',
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
      >
        HOME
      </button>

      {/* Plus Button */}
      <button
        onClick={() => handleNavClick('search')}
        style={plusButtonStyle}
      >
        +
      </button>

      {/* SHOWS Button */}
      <button
        onClick={() => handleNavClick('/myshows')}
        style={pillButtonStyle}
      >
        SHOWS
      </button>
    </nav>
  )
}
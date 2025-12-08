'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BottomNavPreview() {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  const handleNavClick = (destination: string) => {
    if (destination === 'search') {
      setSearchOpen(true)
      setTimeout(() => setSearchOpen(false), 1500) // Auto-close for demo
    } else {
      console.log(`Navigate to: ${destination}`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
      paddingBottom: '120px'
    }}>
      {/* Sample Cards */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '20px'
      }}>
        {/* Card 1 */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '2/3',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'url(https://image.tmdb.org/t/p/w500/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg) center/cover',
            opacity: 0.6
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              background: 'rgba(138, 43, 226, 0.8)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px',
              display: 'inline-block'
            }}>
              👍 Because you liked Breaking Bad
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Better Call Saul</h3>
            <p style={{ fontSize: '14px', opacity: 0.7, margin: '4px 0 0' }}>2022 • Drama • ⭐ 8.9</p>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '2/3',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'url(https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhvvjoQ6wKeUs.jpg) center/cover',
            opacity: 0.6
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              background: 'rgba(236, 72, 153, 0.8)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '8px',
              display: 'inline-block'
            }}>
              ❤️ Your Friends Loved This
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>The Bear</h3>
            <p style={{ fontSize: '14px', opacity: 0.7, margin: '4px 0 0' }}>2024 • Drama • ⭐ 8.7</p>
          </div>
        </div>
      </div>

      {/* Search Modal Indicator */}
      {searchOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          padding: '20px 40px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 200
        }}>
          🔍 Search would open here
        </div>
      )}

      {/* NEW BOTTOM NAV - SVG-based */}
      <nav style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100
      }}>
        {/* 
          Dimensions calculated from inner elements:
          - HOME/SHOWS buttons: 100px wide, ~48px tall
          - Plus button: 64px, outer ring ~80px
          - Padding: 8px around buttons
          - Total pill width: 8 + 100 + 8 + 64 + 8 + 100 + 8 = 296px → 300px
          - Pill body height: 8 + 48 + 8 = 64px
          - Circle extends 8px above/below → total height: 80px
        */}
        <div style={{ position: 'relative', width: '296px', height: '80px' }}>
          {/* SVG outer shape - pill with center circle bump */}
          <svg 
            width="296" 
            height="80" 
            viewBox="0 0 296 80" 
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* 
              Pill body: y=8 to y=72 (64px tall)
              Circle: center at (148, 40), radius 40 → y=0 to y=80
              At y=8: x = 148 ± √(1600 - 1024) = 148 ± 24 = 124 and 172
              At y=72: same intersection points
            */}
            <path 
              d={`
                M 32, 8
                L 124, 8
                A 40,40 0 0 0 148, 0
                A 40,40 0 0 0 172, 8
                L 264, 8
                A 24,24 0 0 1 288, 32
                L 288, 48
                A 24,24 0 0 1 264, 72
                L 172, 72
                A 40,40 0 0 0 148, 80
                A 40,40 0 0 0 124, 72
                L 32, 72
                A 24,24 0 0 1 8, 48
                L 8, 32
                A 24,24 0 0 1 32, 8
                Z
              `}
              fill="rgba(30, 30, 40, 0.85)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          </svg>

          {/* Content layer */}
          <div style={{
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 12px',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            {/* HOME Button */}
            <button
              onClick={() => handleNavClick('/feed')}
              style={{
                width: '100px',
                background: 'rgba(60, 60, 70, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '12px 0',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              HOME
            </button>

            {/* SHOWS Button */}
            <button
              onClick={() => handleNavClick('/myshows')}
              style={{
                width: '100px',
                background: 'rgba(60, 60, 70, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '12px 0',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              SHOWS
            </button>
          </div>

          {/* Plus Button - centered */}
          <button
            onClick={() => handleNavClick('search')}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(60, 60, 70, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '28px',
              fontWeight: 300,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
          >
            +
          </button>
        </div>
      </nav>
    </div>
  )
}


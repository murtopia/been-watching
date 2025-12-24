'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function LiquidGlassPreview() {
  const colors = useThemeColors()
  const [intensity, setIntensity] = useState(50) // Displacement scale (0-150)
  const [blurAmount, setBlurAmount] = useState(3)
  const [showComparison, setShowComparison] = useState(true)

  return (
    <div style={{
      minHeight: '200vh', // Extra tall to enable scrolling
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Fixed background image - same as home page */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('/landing-bg.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }} />
      
      {/* Dark overlay for readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1
      }} />
      {/* SVG Filter Definition - Hidden */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {/* Liquid Glass Filter */}
          <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.01 0.01" 
              numOctaves="1" 
              seed="5" 
              result="turbulence" 
            />
            <feComponentTransfer in="turbulence" result="mapped">
              <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
              <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
              <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
            </feComponentTransfer>
            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
            <feSpecularLighting 
              in="softMap" 
              surfaceScale="5" 
              specularConstant="1" 
              specularExponent="100" 
              lightingColor="white" 
              result="specLight"
            >
              <fePointLight x="-200" y="-200" z="300" />
            </feSpecularLighting>
            <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="softMap" 
              scale={intensity} 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>

          {/* Subtle version for smaller elements */}
          <filter id="liquid-glass-subtle" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="1" seed="3" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
            <feDisplacementMap in="SourceGraphic" in2="softMap" scale={intensity * 0.3} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Content - positioned above background */}
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <h1 style={{ 
          color: colors.goldAccent, 
          fontSize: '2rem', 
          fontWeight: '700', 
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          Liquid Glass Effect Preview
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          Testing macOS Tahoe-inspired liquid glass for Been Watching — scroll to see the effect!
        </p>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          padding: '1.25rem',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${colors.goldAccent}33`
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', color: colors.textSecondary, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Distortion Intensity: {intensity}
            </label>
            <input
              type="range"
              min="0"
              max="150"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              style={{ width: '100%', accentColor: colors.goldAccent }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', color: colors.textSecondary, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Blur Amount: {blurAmount}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={blurAmount}
              onChange={(e) => setBlurAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: colors.goldAccent }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: colors.textSecondary, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Show Comparison
            </label>
            <button
              onClick={() => setShowComparison(!showComparison)}
              style={{
                padding: '0.5rem 1rem',
                background: showComparison ? colors.goldAccent : colors.buttonBg,
                color: showComparison ? '#000' : colors.textSecondary,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {showComparison ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        {showComparison && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Current Glassmorphism
            </h3>
              <div style={{
                padding: '1rem 1.5rem',
                background: 'rgba(255, 193, 37, 0.15)', // goldGlassBg
                backdropFilter: `blur(${blurAmount}px)`,
                WebkitBackdropFilter: `blur(${blurAmount}px)`,
                border: `1px solid ${colors.goldAccent}`, // goldBorder
                borderRadius: '16px',
                color: '#ffffff', // White text
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 193, 37, 0.1)'
              }}>
                <span style={{ fontWeight: '600' }}>Standard Glass</span>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                  Current gold glassmorphism (no distortion)
                </p>
              </div>
            </div>
            <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Liquid Glass Effect
            </h3>
              <LiquidGlassCard blurAmount={blurAmount} colors={colors}>
                <span style={{ fontWeight: '600' }}>Liquid Glass</span>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                  With SVG distortion filter applied
                </p>
              </LiquidGlassCard>
            </div>
          </div>
        )}

        {/* Use Case Examples */}
        <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Potential Use Cases
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Navigation Pill */}
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Bottom Navigation Bar
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '0.75rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <NavIcon label="Feed" active />
                  <NavIcon label="Search" />
                  <NavIcon label="Profile" />
                </div>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Action Buttons */}
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Floating Action Buttons
            </h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '0.75rem 1.25rem' }} subtle>
                <span style={{ fontSize: '0.875rem' }}>❤️ 42</span>
              </LiquidGlassCard>
              <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '0.75rem 1.25rem' }} subtle>
                <span style={{ fontSize: '0.875rem' }}>💬 12</span>
              </LiquidGlassCard>
              <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '0.75rem 1.25rem' }} subtle>
                <span style={{ fontSize: '0.875rem' }}>+ Add</span>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Modal Header */}
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Modal Header
            </h3>
            <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontWeight: '600' }}>Rate This Show</span>
                <button style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  fontSize: '1rem'
                }}>
                  ✕
                </button>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Toast Notification */}
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Toast Notification
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>✓</span>
                  <span>Added to your watchlist</span>
                </div>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Card Overlay */}
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              Card Action Overlay
            </h3>
            <div style={{ 
              width: '200px', 
              height: '300px', 
              margin: '0 auto',
              borderRadius: '16px',
              background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f23 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img 
                src="https://image.tmdb.org/t/p/w300/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg" 
                alt="Show poster"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
              />
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
                <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '0.75rem 1rem' }} subtle>
                  <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                    <span>👍</span>
                    <span>❤️</span>
                    <span>👎</span>
                  </div>
                </LiquidGlassCard>
              </div>
            </div>
          </div>

        </div>

        {/* Performance Note */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${colors.goldAccent}33`
        }}>
          <h3 style={{ color: colors.goldAccent, marginBottom: '0.5rem', fontSize: '1rem' }}>
            ⚠️ Performance Considerations
          </h3>
          <ul style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem' }}>
            <li>SVG filters are GPU-intensive - test on mobile devices</li>
            <li>Consider using the "subtle" variant for smaller/numerous elements</li>
            <li>May need fallback for older browsers (Safari 14 and below)</li>
            <li>Reduce intensity for production (50-80 recommended vs 150)</li>
          </ul>
        </div>
        
        {/* Extra spacing for scrolling */}
        <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3rem' }}>
          <LiquidGlassCard blurAmount={blurAmount} colors={colors} style={{ padding: '2rem 3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔮</div>
              <div style={{ fontWeight: '600', fontSize: '1.25rem' }}>Keep scrolling!</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>Watch how the glass distorts the background</div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>

      <style jsx global>{`
        /* Liquid Glass Animation - Gold Theme */
        .liquid-glass-wrapper {
          position: relative;
          display: flex;
          overflow: hidden;
          cursor: default;
          box-shadow:
            0 6px 12px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 193, 37, 0.1);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.5);
        }

        .liquid-glass-wrapper:hover {
          transform: scale(1.02);
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.35),
            0 0 30px rgba(255, 193, 37, 0.2);
        }
      `}</style>
    </div>
  )
}

// Liquid Glass Card Component - Matches Been Watching Gold Theme
function LiquidGlassCard({ 
  children, 
  blurAmount, 
  colors, 
  style = {},
  subtle = false 
}: { 
  children: React.ReactNode
  blurAmount: number
  colors: any
  style?: React.CSSProperties
  subtle?: boolean
}) {
  return (
    <div 
      className="liquid-glass-wrapper"
      style={{
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        ...style
      }}
    >
      {/* Effect Layer - Blur + Distortion */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        filter: subtle ? 'url(#liquid-glass-subtle)' : 'url(#liquid-glass)',
        overflow: 'hidden',
        isolation: 'isolate',
        borderRadius: 'inherit'
      }} />

      {/* Tint Layer - Gold glass background (matches goldGlassBg) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'rgba(255, 193, 37, 0.15)', // goldGlassBg
        borderRadius: 'inherit'
      }} />

      {/* Shine Layer - Gold edge highlights */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        overflow: 'hidden',
        borderRadius: 'inherit',
        boxShadow: `inset 1px 1px 0 0 rgba(255, 193, 37, 0.3), inset -1px -1px 0 0 rgba(255, 193, 37, 0.15)`
      }} />

      {/* Border - Matches goldBorder (1px solid #FFC125) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        borderRadius: 'inherit',
        border: `1px solid ${colors.goldAccent}` // Exact match: 1px solid #FFC125
      }} />

      {/* Content Layer */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#ffffff' // White text to match site
      }}>
        {children}
      </div>
    </div>
  )
}

// Simple Nav Icon
function NavIcon({ label, active = false }: { label: string; active?: boolean }) {
  const colors = useThemeColors()
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem',
      opacity: active ? 1 : 0.6,
      color: active ? colors.goldAccent : colors.textPrimary
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        background: active ? colors.goldAccent : 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem'
      }}>
        {label === 'Feed' ? '📺' : label === 'Search' ? '🔍' : '👤'}
      </div>
      <span style={{ fontSize: '0.625rem', fontWeight: '500' }}>{label}</span>
    </div>
  )
}


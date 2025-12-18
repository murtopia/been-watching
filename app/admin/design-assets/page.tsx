'use client'

import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Palette, Grid3x3, Package } from 'lucide-react'
import DesignAssetsNav from './DesignAssetsNav'

export default function DesignAssetsPage() {
  const router = useRouter()
  const colors = useThemeColors()

  const sections = [
    {
      icon: Grid3x3,
      title: 'Icon Library',
      description: 'Browse all 40+ SVG icons with state variations and theme support',
      href: '/admin/design-assets/icons',
      color: '#A855F7',
      coming: false
    },
    {
      icon: Palette,
      title: 'Card Preview Gallery',
      description: 'Preview all 7 feed card types with interactive navigation',
      href: '/admin/design-assets/cards',
      color: '#F59E0B',
      coming: false
    },
    {
      icon: Package,
      title: 'Component Showcase',
      description: 'Explore 29 reusable UI components with code examples',
      href: '/admin/design-assets/components',
      color: '#3B82F6',
      coming: false
    }
  ]

  return (
    <>
      <style>{`
        .design-assets-page {
          padding: 1rem;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .section-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          width: 100%;
        }
        .section-card {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .design-assets-page {
            padding: 2rem;
          }
          .section-cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            max-width: 1200px;
          }
        }
      `}</style>
      <div className="design-assets-page">
        {/* Sub Navigation */}
        <DesignAssetsNav />

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 0.5rem 0'
          }}>
            Design Assets
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            margin: 0
          }}>
            Centralized design system components, icons, and preview tools for the Enhanced Activity Feed
          </p>
        </div>

        {/* Section Cards */}
        <div className="section-cards-grid">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.href}
              className="section-card"
              onClick={() => router.push(section.href)}
              style={{
                background: colors.cardBg,
                border: colors.cardBorder,
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left',
                cursor: section.coming ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: section.coming ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!section.coming) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!section.coming) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {/* Color accent bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: section.color
              }} />

              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${section.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Icon size={24} color={section.color} />
              </div>

              {/* Content */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.textPrimary,
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {section.title}
                {section.coming && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: colors.textSecondary
                  }}>
                    Coming Soon
                  </span>
                )}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0,
                lineHeight: 1.5
              }}>
                {section.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Info Section */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: colors.isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
        border: `1px solid ${colors.isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)'}`,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 0.75rem 0'
        }}>
          About Design Assets
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '1.5rem',
          color: colors.textSecondary,
          fontSize: '0.875rem',
          lineHeight: 1.8
        }}>
          <li>Icon Library: 40+ SVG icons with state variations and ~92% file size reduction via sprite sheet</li>
          <li>Card Preview Gallery: Interactive preview of all 7 feed card types from approved HTML designs</li>
          <li>Component Showcase: 29 reusable UI components organized into 9 categories with code examples</li>
          <li>All components support dark/light themes and follow consistent design tokens</li>
          <li>Complete design system documentation available in <code style={{ background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>/docs/design/</code></li>
        </ul>
      </div>
      </div>
    </>
  )
}

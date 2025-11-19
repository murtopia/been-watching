'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Icon } from '@/components/ui/Icon'
import { Copy, Download, Check } from 'lucide-react'
import DesignAssetsNav from '../DesignAssetsNav'

// Icon definition interface
interface IconDefinition {
  name: string
  states: string[]
  description: string
  usage: string
  displayName?: string
  color?: string
  specialIcon?: boolean
}

// All available icons organized by category
const iconCategories: Record<string, IconDefinition[]> = {
  'Action Icons': [
    { name: 'heart-nav', states: ['default', 'active'], description: 'Side action like button • 24px in 40px circle • Circle BG stays same', usage: 'circle-only', displayName: 'heart-nav' },
    { name: 'plus', states: ['default'], description: 'Quick Action bubble launcher • 24px in 40px circle', usage: 'circle-only' },
    { name: 'plus-small', states: ['default'], description: 'Badge overlay • 12px standalone', usage: 'standalone' },
    { name: 'comment', states: ['default'], description: 'Comment action • 24px in 40px circle', usage: 'circle' },
    { name: 'share', states: ['default'], description: 'Share action • 24px in 40px circle', usage: 'circle' },
    { name: 'close', states: ['default'], description: 'Close/dismiss • 20px in 36px circle', usage: 'circle' },
    { name: 'menu-dots', states: ['default'], description: 'Menu/options • 24px in 40px circle', usage: 'circle' },
    { name: 'send', states: ['default'], description: 'Send comment • 18px in 32px circle', usage: 'circle' },
  ],
  'Rating Icons': [
    { name: 'meh-face', states: ['default', 'active'], description: 'Meh rating • 24px in 42px circle', usage: 'circle' },
    { name: 'thumbs-up', states: ['default', 'active'], description: 'Like rating • 24px in 42px circle', usage: 'circle' },
    { name: 'heart', states: ['default', 'active'], description: 'Love rating • 24px in 42px circle', usage: 'circle', displayName: 'love' },
  ],
  'Watchlist Icons': [
    { name: 'bookmark', states: ['default', 'active'], description: 'Want to Watch • 24px in 48px circle', usage: 'circle', displayName: 'want-to-watch' },
    { name: 'play', states: ['default', 'active'], description: 'Watching status • 24px in 48px circle', usage: 'circle', displayName: 'watching' },
    { name: 'check', states: ['default', 'active'], description: 'Watched status • 24px in 48px circle', usage: 'circle', displayName: 'watched' },
    { name: 'bookmark-plus', states: ['default'], description: 'Want to Watch compact • 24px in 42px circle', usage: 'circle', displayName: 'instant-add' },
  ],
  'Badge/Info Icons': [
    { name: 'clock', states: ['default'], description: 'Coming Soon badge • 16px standalone', usage: 'standalone' },
    { name: 'bell', states: ['default', 'active'], description: 'Reminder/notify • 24px in 40px circle', usage: 'circle' },
    { name: 'tv-screen', states: ['default'], description: 'Now Streaming badge • 16px standalone', usage: 'standalone' },
    { name: 'trophy', states: ['default'], description: 'Top 3 badge • 16px standalone', usage: 'standalone' },
    { name: 'link-chain', states: ['default'], description: 'Find Friends badge • 16px standalone', usage: 'standalone' },
    { name: 'star', states: ['default', 'active', 'half'], description: 'Rating display • 14px standalone', usage: 'standalone' },
    { name: 'sparkles', states: ['default', 'gold'], description: 'AI recs badge • 16px standalone', usage: 'standalone' },
  ],
  'Gold Star Variations': [
    { name: 'star-gold', states: ['default'], description: 'Rating star (#FFD700) • Solid gold for ratings like "8.6"', usage: 'standalone', displayName: 'star-rating-gold' },
    { name: 'star-featured', states: ['default'], description: 'Featured star (two-tone) • Gold/orange for "Top Show" badges', usage: 'standalone', specialIcon: true, displayName: 'star-featured-gold' },
    { name: 'sparkles', states: ['gold'], description: 'AI sparkles gold (#FFD700) • For premium/featured AI recommendations', usage: 'standalone', color: '#FFD700', displayName: 'sparkles-gold' },
  ],
  'Navigation Icons': [
    { name: 'arrow-right', states: ['default'], description: 'Forward nav • 20px standalone', usage: 'standalone' },
    { name: 'chevron-down', states: ['default'], description: 'Expand dropdown • 20px standalone', usage: 'standalone' },
    { name: 'chevron-up', states: ['default'], description: 'Collapse • 20px standalone', usage: 'standalone' },
    { name: 'chevron-left', states: ['default'], description: 'Back nav • 20px standalone', usage: 'standalone' },
    { name: 'chevron-right', states: ['default'], description: 'Next nav • 20px standalone', usage: 'standalone' },
  ],
  'Social Icons': [
    { name: 'user', states: ['default'], description: 'Single user avatar • 20px standalone', usage: 'standalone' },
    { name: 'users', states: ['default'], description: 'Multiple users • 20px standalone', usage: 'standalone' },
  ],
  'Utility Icons': [
    { name: 'info', states: ['default'], description: 'Information • 18px standalone', usage: 'standalone' },
    { name: 'flag', states: ['default'], description: 'Report content • 18px standalone', usage: 'standalone' },
    { name: 'trash', states: ['default'], description: 'Delete • 18px standalone', usage: 'standalone' },
    { name: 'search', states: ['default'], description: 'Search • 20px standalone', usage: 'standalone' },
    { name: 'filter', states: ['default'], description: 'Filter options • 20px standalone', usage: 'standalone' },
  ],
}

export default function IconLibraryPage() {
  const colors = useThemeColors()
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark')

  const totalIcons = Object.values(iconCategories).reduce((sum, icons) => sum + icons.length, 0)

  const copyIconName = (name: string) => {
    navigator.clipboard.writeText(name)
    setCopiedIcon(name)
    setTimeout(() => setCopiedIcon(null), 2000)
  }

  const downloadSpriteSheet = () => {
    window.open('/icons/feed-sprite.svg', '_blank')
  }

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      {/* Sub Navigation */}
      <DesignAssetsNav />

      {/* Sticky Controls Container - aligned to the right */}
      <div style={{
        position: 'sticky',
        top: '1rem',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '2rem',
        paddingRight: '20px' // Move 20px to the left from the right edge
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          {/* Download Button */}
          <button
            onClick={downloadSpriteSheet}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: colors.cardBorder,
              borderRadius: '8px',
              color: colors.textPrimary,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <Download size={16} />
            Download Sprite
          </button>

          {/* Theme Toggle */}
          <div style={{
            background: colors.cardBg,
            border: colors.cardBorder,
            borderRadius: '8px',
            padding: '0.25rem',
            display: 'flex',
            gap: '0.25rem',
            boxShadow: colors.isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => setSelectedTheme('dark')}
              style={{
                padding: '0.5rem 1rem',
                background: selectedTheme === 'dark' ? colors.brandPink : 'transparent',
                color: selectedTheme === 'dark' ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Dark
            </button>
            <button
              onClick={() => setSelectedTheme('light')}
              style={{
                padding: '0.5rem 1rem',
                background: selectedTheme === 'light' ? colors.brandPink : 'transparent',
                color: selectedTheme === 'light' ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Light
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: '0 0 0.5rem 0'
        }}>
          Icon Library
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          margin: 0
        }}>
          {totalIcons} icons • SVG sprite sheet • ~92% file size reduction
        </p>
      </div>

      {/* Icon Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {Object.entries(iconCategories).map(([category, icons]) => (
          <div key={category}>
            {/* Category Header */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: '0 0 1rem 0'
            }}>
              {category}
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: colors.textSecondary
              }}>
                ({icons.length})
              </span>
            </h2>

            {/* Icon Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {icons.map((icon) => (
                <div
                  key={icon.name}
                  style={{
                    background: colors.cardBg,
                    border: colors.cardBorder,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Icon Name & Copy */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <code style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: colors.brandPink,
                      fontFamily: 'monospace'
                    }}>
                      {icon.displayName || icon.name}
                    </code>
                    <button
                      onClick={() => copyIconName(icon.name)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedIcon === icon.name ? '#34D399' : colors.textSecondary,
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (copiedIcon !== icon.name) {
                          e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                      title="Copy icon name"
                    >
                      {copiedIcon === icon.name ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.75rem',
                    color: colors.textSecondary,
                    margin: '0 0 1.5rem 0'
                  }}>
                    {icon.description}
                  </p>

                  {/* Icon Previews */}
                  <div style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '2rem 1rem',
                    background: selectedTheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    {/* Show icon in circle if it's meant to be used that way */}
                    {(icon.usage === 'circle' || icon.usage === 'circle-only') && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                          marginBottom: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          In Circle
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '1.5rem',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {icon.states.includes('default') || icon.states.includes('outline') ? (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: selectedTheme === 'dark'
                                  ? 'rgba(255, 255, 255, 0.1)'
                                  : 'rgba(0, 0, 0, 0.05)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: selectedTheme === 'dark'
                                  ? '1px solid rgba(255, 255, 255, 0.2)'
                                  : '1px solid rgba(0, 0, 0, 0.1)'
                              }}>
                                <Icon
                                  name={icon.name}
                                  state="default"
                                  size={icon.name === 'heart-nav' ? 40 : icon.name === 'plus' ? 30 : 32}
                                  theme={selectedTheme}
                                  color={selectedTheme === 'dark' ? 'white' : undefined}
                                />
                              </div>
                              <div style={{
                                fontSize: '0.625rem',
                                color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                                marginTop: '0.5rem'
                              }}>
                                {icon.name}-default
                              </div>
                            </div>
                          ) : null}

                          {(icon.states.includes('filled') || icon.states.includes('active')) ? (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: (icon.name === 'heart' || icon.name === 'thumbs-up' || icon.name === 'meh-face' || icon.name === 'bookmark' || icon.name === 'check' || icon.name === 'play' || icon.name === 'bell')
                                  ? 'rgba(255, 59, 92, 0.15)'
                                  : selectedTheme === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.05)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: (icon.name === 'heart' || icon.name === 'thumbs-up' || icon.name === 'meh-face' || icon.name === 'bookmark' || icon.name === 'check' || icon.name === 'play' || icon.name === 'bell')
                                  ? '2px solid #FF3B5C'
                                  : selectedTheme === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.2)'
                                    : '1px solid rgba(0, 0, 0, 0.1)'
                              }}>
                                <Icon
                                  name={icon.name}
                                  state="active"
                                  size={icon.name === 'heart-nav' ? 40 : 32}
                                  theme={selectedTheme}
                                />
                              </div>
                              <div style={{
                                fontSize: '0.625rem',
                                color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                                marginTop: '0.5rem'
                              }}>
                                {icon.name}-active
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Show standalone version (only if not circle-only) */}
                    {icon.usage !== 'circle-only' && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                          marginBottom: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {icon.usage === 'standalone' ? 'Standalone' : 'Without Circle'}
                        </div>
                      <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {icon.states.includes('default') || icon.states.includes('outline') ? (
                          <div style={{ textAlign: 'center' }}>
                            {icon.specialIcon ? (
                              <svg width="48px" height="48px" viewBox="0 0 24 24" style={{ display: 'inline-block' }}>
                                <use xlinkHref={`/icons/feed-sprite.svg?v=8#${icon.name}`} />
                              </svg>
                            ) : (
                              <Icon
                                name={icon.name}
                                state="default"
                                size={48}
                                theme={selectedTheme}
                              />
                            )}
                            <div style={{
                              fontSize: '0.625rem',
                              color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                              marginTop: '0.5rem'
                            }}>
                              {icon.name}-default
                            </div>
                          </div>
                        ) : null}

                        {(icon.states.includes('filled') || icon.states.includes('active')) ? (
                          <div style={{ textAlign: 'center' }}>
                            <Icon
                              name={icon.name}
                              state="active"
                              size={48}
                              theme={selectedTheme}
                            />
                            <div style={{
                              fontSize: '0.625rem',
                              color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                              marginTop: '0.5rem'
                            }}>
                              {icon.name}-active
                            </div>
                          </div>
                        ) : null}

                        {icon.states.includes('half') ? (
                          <div style={{ textAlign: 'center' }}>
                            <Icon
                              name="star-half"
                              size={48}
                              theme={selectedTheme}
                            />
                            <div style={{
                              fontSize: '0.625rem',
                              color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                              marginTop: '0.5rem'
                            }}>
                              half
                            </div>
                          </div>
                        ) : null}

                        {icon.states.includes('gold') ? (
                          <div style={{ textAlign: 'center' }}>
                            <Icon
                              name={icon.name}
                              size={48}
                              theme={selectedTheme}
                              color={icon.color || '#FFD700'}
                            />
                            <div style={{
                              fontSize: '0.625rem',
                              color: selectedTheme === 'dark' ? '#9CA3AF' : '#4B5563',
                              marginTop: '0.5rem'
                            }}>
                              {icon.name}-gold
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Usage Example */}
                  <div style={{
                    background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: colors.textSecondary,
                    overflowX: 'auto'
                  }}>
                    <code>{`<Icon name="${icon.name}" size={24} />`}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 0.75rem 0'
        }}>
          Usage Tips
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '1.5rem',
          color: colors.textSecondary,
          fontSize: '0.875rem',
          lineHeight: 1.8
        }}>
          <li>All icons use <code style={{ background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>currentColor</code> for dynamic theming</li>
          <li>Icons with multiple states (outline/filled) toggle via <code style={{ background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>state</code> prop</li>
          <li>Sprite sheet is cached for 1 year in production (1 day in development)</li>
          <li>File size: ~3.4 KB (minified & gzipped) vs ~110 KB for inline SVGs</li>
          <li>Full documentation: <code style={{ background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>/components/ui/Icon.md</code></li>
        </ul>
      </div>
    </div>
  )
}

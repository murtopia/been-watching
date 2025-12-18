'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Icon } from '@/components/ui/Icon'
import { ChevronLeft, ChevronRight, ExternalLink, Info } from 'lucide-react'
import DesignAssetsNav from '../DesignAssetsNav'

// Card type definitions matching the documentation
const cardTypes = [
  {
    id: 1,
    title: 'User Activity Card',
    description: 'Friend rated a show (Template A)',
    file: '/card-1-standalone.html',
    template: 'A',
    category: 'Friend Activity',
    distribution: '50%',
    features: ['Grouped activities', 'My Take', 'Flip animation', 'Social actions'],
  },
  {
    id: 2,
    title: 'Because You Liked',
    description: 'AI recommendation (Template B)',
    file: '/card-2-standalone.html',
    template: 'B',
    category: 'AI Recommendations',
    distribution: '20%',
    features: ['ML-based', 'Match score', 'Why card', 'Quick actions'],
  },
  {
    id: 3,
    title: 'Your Friends Loved',
    description: 'Social recommendation (Template B)',
    file: '/card-3-standalone.html',
    template: 'B',
    category: 'Social Recommendations',
    distribution: '15%',
    features: ['Friend consensus', 'Avatar stack', 'Social proof', 'Quick actions'],
  },
  {
    id: 4,
    title: 'New Season Alert',
    description: 'Coming soon notification (Template B)',
    file: '/card-4-standalone.html',
    template: 'B',
    category: 'Release Notifications',
    distribution: '10%',
    features: ['Countdown', 'Remind me', 'Quick actions', 'Release date'],
  },
  {
    id: 5,
    title: 'Now Streaming',
    description: 'Now available notification (Template B)',
    file: '/card-5-standalone.html',
    template: 'B',
    category: 'Release Notifications',
    distribution: '10%',
    features: ['Platform badge', 'Quick actions', 'Just added', 'Streaming info'],
  },
  {
    id: 6,
    title: 'Top 3 Update',
    description: 'Friend updated top 3 (Template A)',
    file: '/card-6-standalone.html',
    template: 'A',
    category: 'Friend Activity',
    distribution: '50%',
    features: ['List update', 'Social context', 'Flip animation', 'Quick actions'],
  },
  {
    id: 7,
    title: 'Find New Friends',
    description: 'Friend suggestions (Template C)',
    file: '/card-7-standalone.html',
    template: 'C',
    category: 'Follow Suggestions',
    distribution: '5%',
    features: ['Carousel', 'Mutual friends', 'Quick follow', 'No flip'],
  },
  {
    id: 8,
    title: 'You Might Like',
    description: 'AI recommendation (Template B)',
    file: '/card-8-standalone.html',
    template: 'B',
    category: 'AI Recommendations',
    distribution: '20%',
    features: ['ML-based', 'Generic AI rec', 'Quick actions', 'No source show'],
  },
]

export default function CardPreviewPage() {
  const colors = useThemeColors()
  const [selectedCard, setSelectedCard] = useState(cardTypes[0])
  const [iframeKey, setIframeKey] = useState(0)

  const handleCardChange = (direction: 'prev' | 'next') => {
    const currentIndex = cardTypes.findIndex(c => c.id === selectedCard.id)
    let newIndex

    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? cardTypes.length - 1 : currentIndex - 1
    } else {
      newIndex = currentIndex === cardTypes.length - 1 ? 0 : currentIndex + 1
    }

    setSelectedCard(cardTypes[newIndex])
    setIframeKey(prev => prev + 1) // Force iframe reload
  }

  const openInNewTab = () => {
    window.open(selectedCard.file, '_blank')
  }

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'A': return '#FF3B5C' // Pink for friend activity
      case 'B': return '#3B82F6' // Blue for recommendations
      case 'C': return '#A855F7' // Purple for unique template
      default: return colors.textSecondary
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Friend Activity': return '#FF3B5C'
      case 'AI Recommendations': return '#A855F7'
      case 'Social Recommendations': return '#34D399'
      case 'Release Notifications': return '#F59E0B'
      case 'Follow Suggestions': return '#3B82F6'
      default: return colors.textSecondary
    }
  }

  return (
    <>
      <style>{`
        .card-preview-page {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }
        .admin-cards-grid {
          display: grid;
          grid-template-columns: minmax(300px, 400px) 1fr;
          gap: 2rem;
          align-items: start;
        }
        .card-nav-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .card-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
        }
        @media (max-width: 900px) {
          .admin-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-cards-grid > div:first-child {
            order: 2;
          }
          .admin-cards-grid > div:last-child {
            order: 1;
          }
        }
        @media (max-width: 768px) {
          .card-preview-page {
            padding: 1rem;
          }
          .card-nav-controls {
            flex-direction: column;
          }
          .card-nav-controls > div:first-of-type {
            order: -1;
            margin-bottom: 0.5rem;
          }
          .card-nav-buttons-row {
            display: flex;
            width: 100%;
            gap: 0.5rem;
          }
          .card-nav-buttons-row button {
            flex: 1;
            justify-content: center;
          }
          .card-details-grid,
          .features-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 400px) {
          .card-details-grid,
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="card-preview-page">
        {/* Sub Navigation */}
        <DesignAssetsNav />

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 0.5rem 0'
          }}>
            Card Preview Gallery
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            margin: 0
          }}>
            Preview all 8 enhanced feed card types • 3 templates • 5 categories
          </p>
        </div>

        {/* Open in New Tab */}
        <button
          onClick={openInNewTab}
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
          <ExternalLink size={16} />
          Open in New Tab
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="admin-cards-grid">
        {/* Left Sidebar - Card Selector */}
        <div>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: '0 0 1rem 0'
          }}>
            Card Types
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cardTypes.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCard(card)
                  setIframeKey(prev => prev + 1)
                }}
                style={{
                  background: selectedCard.id === card.id
                    ? colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    : colors.cardBg,
                  border: selectedCard.id === card.id
                    ? `2px solid ${colors.goldAccent}`
                    : colors.cardBorder,
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (selectedCard.id !== card.id) {
                    e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCard.id !== card.id) {
                    e.currentTarget.style.background = colors.cardBg
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: getTemplateColor(card.template),
                    background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    Template {card.template}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: colors.textSecondary
                  }}>
                    Card {card.id}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: colors.textPrimary,
                  margin: '0 0 0.25rem 0'
                }}>
                  {card.title}
                </h3>

                <p style={{
                  fontSize: '0.75rem',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  {card.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Preview & Details */}
        <div>
          {/* Card Navigation */}
          <div className="card-nav-controls">
            <button
              onClick={() => handleCardChange('prev')}
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
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div style={{ textAlign: 'center', minWidth: 0 }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: colors.textPrimary
              }}>
                {selectedCard.title}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                marginTop: '0.25rem'
              }}>
                Card {selectedCard.id} of {cardTypes.length}
              </div>
            </div>

            <button
              onClick={() => handleCardChange('next')}
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
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Card Preview */}
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <iframe
              key={iframeKey}
              src={selectedCard.file}
              style={{
                width: '398px',
                minWidth: '398px',
                height: '645px',
                border: 'none',
                display: 'block'
              }}
              title={selectedCard.title}
              onLoad={(e) => {
                try {
                  const iframe = e.target as HTMLIFrameElement
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                  if (iframeDoc) {
                    // Inject CSS to hide navigation and clean up the display
                    const style = iframeDoc.createElement('style')
                    style.textContent = `
                      #cardNav, #themeSwitcher { display: none !important; }
                      body {
                        background: transparent !important;
                        padding: 0 !important;
                        display: block !important;
                        min-height: auto !important;
                        overflow: visible !important;
                      }
                      .card-container {
                        margin: 0 !important;
                      }
                    `
                    iframeDoc.head.appendChild(style)
                  }
                } catch (err) {
                  console.error('Could not inject iframe styles:', err)
                }
              }}
            />
          </div>

          {/* Card Details */}
          <div className="card-details-grid">
            {/* Template Info */}
            <div style={{
              background: colors.cardBg,
              border: colors.cardBorder,
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem'
              }}>
                Template
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: getTemplateColor(selectedCard.template)
              }}>
                Template {selectedCard.template}
              </div>
            </div>

            {/* Category */}
            <div style={{
              background: colors.cardBg,
              border: colors.cardBorder,
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem'
              }}>
                Category
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: getCategoryColor(selectedCard.category)
              }}>
                {selectedCard.category}
              </div>
            </div>

            {/* Distribution */}
            <div style={{
              background: colors.cardBg,
              border: colors.cardBorder,
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem'
              }}>
                Feed Distribution
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: colors.goldAccent
              }}>
                {selectedCard.distribution}
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{
            background: colors.cardBg,
            border: colors.cardBorder,
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: '0 0 1rem 0'
            }}>
              Key Features
            </h3>
            <div className="features-grid">
              {selectedCard.features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '8px'
                  }}
                >
                  <Icon name="check" state="filled" size={16} color="#34D399" />
                  <span style={{
                    fontSize: '0.875rem',
                    color: colors.textPrimary
                  }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        border: `1px solid ${colors.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
        borderRadius: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <Info size={20} color="#3B82F6" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: '0 0 0.5rem 0'
            }}>
              About These Cards
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              lineHeight: 1.6,
              margin: 0
            }}>
              These are the approved HTML card designs that will be converted to React components.
              Each card is interactive and includes flip animations, social actions, and responsive layouts.
              Cards are grouped into 3 templates (A, B, C) for code reusability.
              The feed algorithm distributes these cards based on the percentages shown above to create
              an engaging, personalized experience for each user.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

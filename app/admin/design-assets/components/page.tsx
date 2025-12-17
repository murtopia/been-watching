'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { Icon, IconSize } from '@/components/ui/Icon'
import { Copy, Check, Info } from 'lucide-react'
import DesignAssetsNav from '../DesignAssetsNav'

// Component categories from the design system
const componentCategories = {
  'Glassmorphic Components': [
    {
      name: 'GlassmorphicPanel',
      description: 'Frosted glass effect container',
      props: ['variant: "default" | "elevated" | "inset"', 'children: ReactNode'],
      example: {
        code: '<GlassmorphicPanel variant="default">\n  Content here\n</GlassmorphicPanel>',
        preview: 'glassmorphic-panel'
      }
    },
    {
      name: 'GlassmorphicButton',
      description: 'Button with glassmorphic effect',
      props: ['onClick: () => void', 'variant: "primary" | "secondary"', 'children: ReactNode'],
      example: {
        code: '<GlassmorphicButton variant="primary">\n  Click Me\n</GlassmorphicButton>',
        preview: 'glassmorphic-button'
      }
    }
  ],
  'Badge Components': [
    {
      name: 'BadgePill',
      description: 'Pill-shaped badge with icon',
      props: ['icon: IconName', 'label: string', 'variant: "default" | "accent"', 'size: "sm" | "md"'],
      example: {
        code: '<BadgePill\n  icon="clock"\n  label="Coming Soon"\n  variant="accent"\n/>',
        preview: 'badge-pill'
      }
    },
    {
      name: 'PlatformBadge',
      description: 'Streaming platform indicator',
      props: ['platform: "netflix" | "hulu" | "disney" | ...', 'size: "sm" | "md"'],
      example: {
        code: '<PlatformBadge platform="netflix" size="md" />',
        preview: 'platform-badge'
      }
    },
    {
      name: 'MatchScoreBadge',
      description: 'AI match percentage display',
      props: ['score: number', 'size: "sm" | "md"'],
      example: {
        code: '<MatchScoreBadge score={94} size="md" />',
        preview: 'match-score-badge'
      }
    }
  ],
  'Button Components': [
    {
      name: 'CircularActionButton',
      description: 'Circular button with icon and state',
      props: ['icon: IconName', 'state: "default" | "active"', 'onClick: () => void', 'ariaLabel: string'],
      example: {
        code: '<CircularActionButton\n  icon="heart"\n  state={isLiked ? "active" : "default"}\n  onClick={handleLike}\n  ariaLabel="Like"\n/>',
        preview: 'circular-action-button'
      }
    },
    {
      name: 'QuickActionButton',
      description: 'Action button with label',
      props: ['icon: IconName', 'label: string', 'onClick: () => void', 'variant: "primary" | "secondary"'],
      example: {
        code: '<QuickActionButton\n  icon="bookmark"\n  label="Want to Watch"\n  onClick={handleAdd}\n/>',
        preview: 'quick-action-button'
      }
    },
    {
      name: 'RatingButton',
      description: 'Rating selector button (Meh/Like/Love)',
      props: ['rating: "meh" | "like" | "love"', 'isSelected: boolean', 'onClick: () => void'],
      example: {
        code: '<RatingButton\n  rating="love"\n  isSelected={selectedRating === "love"}\n  onClick={() => setRating("love")}\n/>',
        preview: 'rating-button'
      }
    }
  ],
  'Avatar Components': [
    {
      name: 'Avatar',
      description: 'User profile avatar',
      props: ['src: string', 'alt: string', 'size: "sm" | "md" | "lg"', 'border?: boolean'],
      example: {
        code: '<Avatar\n  src={user.avatar}\n  alt={user.name}\n  size="md"\n  border\n/>',
        preview: 'avatar'
      }
    },
    {
      name: 'AvatarStack',
      description: 'Overlapping avatar group',
      props: ['users: User[]', 'maxVisible: number', 'size: "sm" | "md"'],
      example: {
        code: '<AvatarStack\n  users={friendsWhoLoved}\n  maxVisible={3}\n  size="sm"\n/>',
        preview: 'avatar-stack'
      }
    }
  ],
  'Card Components': [
    {
      name: 'MediaCard',
      description: 'Show/movie card with poster',
      props: ['media: Media', 'variant: "compact" | "detailed"', 'showActions?: boolean'],
      example: {
        code: '<MediaCard\n  media={show}\n  variant="compact"\n  showActions\n/>',
        preview: 'media-card'
      }
    },
    {
      name: 'ActivityCard',
      description: 'Friend activity display',
      props: ['activity: Activity', 'onFlip?: () => void'],
      example: {
        code: '<ActivityCard\n  activity={friendActivity}\n  onFlip={handleFlip}\n/>',
        preview: 'activity-card'
      }
    },
    {
      name: 'RecommendationCard',
      description: 'AI/social recommendation card',
      props: ['recommendation: Recommendation', 'type: "ai" | "social"'],
      example: {
        code: '<RecommendationCard\n  recommendation={rec}\n  type="ai"\n/>',
        preview: 'recommendation-card'
      }
    }
  ],
  'Comment Components': [
    {
      name: 'CommentCard',
      description: 'Comment with avatar and actions',
      props: ['comment: Comment', 'onLike: () => void', 'onReply: () => void'],
      example: {
        code: '<CommentCard\n  comment={comment}\n  onLike={handleLike}\n  onReply={handleReply}\n/>',
        preview: 'comment-card'
      }
    },
    {
      name: 'CommentInput',
      description: 'Comment compose input',
      props: ['onSubmit: (text: string) => void', 'placeholder?: string', 'maxLength: number'],
      example: {
        code: '<CommentInput\n  onSubmit={handleComment}\n  placeholder="Add a comment..."\n  maxLength={280}\n/>',
        preview: 'comment-input'
      }
    }
  ],
  'Status Components': [
    {
      name: 'WatchStatusButton',
      description: 'Watch status selector',
      props: ['status: "want" | "watching" | "watched"', 'isActive: boolean', 'onClick: () => void'],
      example: {
        code: '<WatchStatusButton\n  status="watched"\n  isActive={currentStatus === "watched"}\n  onClick={handleStatusChange}\n/>',
        preview: 'watch-status-button'
      }
    },
    {
      name: 'ProgressBar',
      description: 'Episode/season progress indicator',
      props: ['current: number', 'total: number', 'variant: "thin" | "thick"'],
      example: {
        code: '<ProgressBar\n  current={5}\n  total={10}\n  variant="thick"\n/>',
        preview: 'progress-bar'
      }
    }
  ],
  'Layout Components': [
    {
      name: 'FeedCard',
      description: 'Main feed card container',
      props: ['children: ReactNode', 'onFlip?: () => void', 'canFlip?: boolean'],
      example: {
        code: '<FeedCard canFlip onFlip={handleFlip}>\n  <FeedCard.Front>\n    Front content\n  </FeedCard.Front>\n  <FeedCard.Back>\n    Back content\n  </FeedCard.Back>\n</FeedCard>',
        preview: 'feed-card'
      }
    },
    {
      name: 'CardHeader',
      description: 'Card header with avatar and user info',
      props: ['user: User', 'timestamp: Date', 'action?: string'],
      example: {
        code: '<CardHeader\n  user={friend}\n  timestamp={activity.created_at}\n  action="rated"\n/>',
        preview: 'card-header'
      }
    },
    {
      name: 'CardFooter',
      description: 'Card footer with social actions',
      props: ['likes: number', 'comments: number', 'onLike: () => void', 'onComment: () => void'],
      example: {
        code: '<CardFooter\n  likes={24}\n  comments={8}\n  onLike={handleLike}\n  onComment={handleComment}\n/>',
        preview: 'card-footer'
      }
    }
  ],
  'Utility Components': [
    {
      name: 'LoadingSpinner',
      description: 'Loading indicator',
      props: ['size: "sm" | "md" | "lg"', 'color?: string'],
      example: {
        code: '<LoadingSpinner size="md" />',
        preview: 'loading-spinner'
      }
    },
    {
      name: 'EmptyState',
      description: 'Empty content placeholder',
      props: ['icon: IconName', 'title: string', 'description: string', 'action?: ReactNode'],
      example: {
        code: '<EmptyState\n  icon="users"\n  title="No friends yet"\n  description="Start following to see activity"\n/>',
        preview: 'empty-state'
      }
    },
    {
      name: 'ErrorBoundary',
      description: 'Error fallback UI',
      props: ['children: ReactNode', 'fallback?: ReactNode'],
      example: {
        code: '<ErrorBoundary>\n  <YourComponent />\n</ErrorBoundary>',
        preview: 'error-boundary'
      }
    }
  ]
}

export default function ComponentShowcasePage() {
  const colors = useThemeColors()
  const [copiedComponent, setCopiedComponent] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const totalComponents = Object.values(componentCategories).reduce((sum, components) => sum + components.length, 0)

  const copyComponentCode = (code: string, name: string) => {
    navigator.clipboard.writeText(code)
    setCopiedComponent(name)
    setTimeout(() => setCopiedComponent(null), 2000)
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Glassmorphic Components': '#A855F7',
      'Badge Components': '#F59E0B',
      'Button Components': '#3B82F6',
      'Avatar Components': '#34D399',
      'Card Components': '#FF3B5C',
      'Comment Components': '#8B5CF6',
      'Status Components': '#10B981',
      'Layout Components': '#EF4444',
      'Utility Components': '#6B7280'
    }
    return colorMap[category] || colors.textSecondary
  }

  return (
    <div style={{ padding: '2rem' }}>
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
            Component Showcase
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            margin: 0
          }}>
            {totalComponents} reusable components • 9 categories • Consistent design system
          </p>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '0.5rem 0.75rem',
              background: selectedCategory === null ? colors.goldAccent : colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: selectedCategory === null ? 'white' : colors.textSecondary,
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All
          </button>
          {Object.keys(componentCategories).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '0.5rem 0.75rem',
                background: selectedCategory === category ? colors.goldAccent : colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: selectedCategory === category ? 'white' : colors.textSecondary,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {category.replace(' Components', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Component Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {Object.entries(componentCategories)
          .filter(([category]) => !selectedCategory || category === selectedCategory)
          .map(([category, components]) => (
            <div key={category}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '4px',
                  height: '24px',
                  background: getCategoryColor(category),
                  borderRadius: '2px'
                }} />
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: colors.textPrimary,
                  margin: 0
                }}>
                  {category}
                </h2>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: colors.textSecondary
                }}>
                  ({components.length})
                </span>
              </div>

              {/* Component Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1rem'
              }}>
                {components.map((component) => (
                  <div
                    key={component.name}
                    style={{
                      background: colors.cardBg,
                      border: colors.cardBorder,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Component Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <code style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: getCategoryColor(category),
                          fontFamily: 'monospace'
                        }}>
                          {component.name}
                        </code>
                        <p style={{
                          fontSize: '0.75rem',
                          color: colors.textSecondary,
                          margin: '0.25rem 0 0 0'
                        }}>
                          {component.description}
                        </p>
                      </div>

                      <button
                        onClick={() => copyComponentCode(component.example.code, component.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedComponent === component.name ? '#34D399' : colors.textSecondary,
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        title="Copy example code"
                      >
                        {copiedComponent === component.name ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>

                    {/* Props */}
                    <div style={{
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      background: colors.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.5rem'
                      }}>
                        Props
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        {component.props.map((prop, index) => (
                          <code
                            key={index}
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              color: colors.textSecondary,
                              lineHeight: 1.6
                            }}
                          >
                            {prop}
                          </code>
                        ))}
                      </div>
                    </div>

                    {/* Example Code */}
                    <div style={{
                      background: colors.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.5rem'
                      }}>
                        Example
                      </div>
                      <code style={{
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        color: colors.textPrimary,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.6
                      }}>
                        {component.example.code}
                      </code>
                    </div>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.625rem',
                      background: colors.isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                      border: `1px solid ${colors.isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.2)'}`,
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#F59E0B'
                    }}>
                      <Icon name="info" size={12} color="#F59E0B" />
                      To be implemented
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
              Component Implementation Status
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '1.5rem',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              lineHeight: 1.8
            }}>
              <li>All components follow the design system specifications in <code style={{ background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>/docs/design/component-library-spec.md</code></li>
              <li>These components will be extracted from the approved HTML card designs</li>
              <li>Each component uses the Icon system for consistent iconography</li>
              <li>All components support dark/light themes via the <code style={{ background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>useThemeColors</code> hook</li>
              <li>Components are designed for maximum reusability across all 7 card types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

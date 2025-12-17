'use client'

import { useState } from 'react'
import Link from 'next/link'
import ModerationNav from './ModerationNav'
import { useThemeColors } from '@/hooks/useThemeColors'

interface ModerationOverviewProps {
  stats: {
    pendingReports: number
    totalReports: number
    reportsLast24h: number
    flaggedContent: number
    bannedUsers: number
  }
}

export default function ModerationOverview({ stats }: ModerationOverviewProps) {
  const colors = useThemeColors()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const cards = [
    {
      id: 'reports',
      label: 'Pending Reports',
      value: stats.pendingReports,
      subtitle: `${stats.totalReports} total`,
      href: '/admin/moderation/reports',
      color: stats.pendingReports > 0 ? '#ef4444' : '#4CAF50',
      icon: '🚨'
    },
    {
      id: 'recent',
      label: 'Reports (24h)',
      value: stats.reportsLast24h,
      subtitle: 'Last 24 hours',
      href: '/admin/moderation/reports',
      color: '#4A90E2',
      icon: '📊'
    },
    {
      id: 'flagged',
      label: 'Flagged Content',
      value: stats.flaggedContent,
      subtitle: 'Needs review',
      href: '/admin/moderation/flagged',
      color: '#FFC107',
      icon: '⚠️'
    },
    {
      id: 'log',
      label: 'Moderation Log',
      value: '-',
      subtitle: 'View history',
      href: '/admin/moderation/log',
      color: '#9C27B0',
      icon: '📝'
    },
    {
      id: 'banned',
      label: 'Banned Users',
      value: stats.bannedUsers,
      subtitle: 'Active bans',
      href: '/admin/moderation/bans',
      color: '#F44336',
      icon: '🚫'
    }
  ]

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Sub-navigation */}
      <ModerationNav />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          Moderation
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Manage reports, flagged content, and user moderation
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              border: colors.cardBorder,
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.2s',
              cursor: 'pointer',
              transform: hoveredCard === card.id ? 'translateY(-2px)' : 'none',
              boxShadow: hoveredCard === card.id ? `0 8px 20px ${colors.goldAccent}1A` : 'none'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  {card.label}
                </div>
                <div style={{
                  fontSize: '1.5rem'
                }}>
                  {card.icon}
                </div>
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: colors.textPrimary,
                marginBottom: '0.5rem',
                lineHeight: 1
              }}>
                {card.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: colors.textSecondary
              }}>
                {card.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '2rem',
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: '0 0 1rem 0'
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <Link
            href="/admin/moderation/reports"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              transition: 'background 0.2s',
              border: colors.cardBorder
            }}
          >
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.25rem'
            }}>
              Review Pending Reports
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>
              Handle user-reported content
            </div>
          </Link>

          <Link
            href="/admin/moderation/flagged"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              transition: 'background 0.2s',
              border: colors.cardBorder
            }}
          >
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.25rem'
            }}>
              Review Flagged Content
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>
              Check auto-flagged items
            </div>
          </Link>

          <Link
            href="/admin/moderation/bans"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              transition: 'background 0.2s',
              border: colors.cardBorder
            }}
          >
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: '0.25rem'
            }}>
              Manage Bans
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary
            }}>
              View and update banned users
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

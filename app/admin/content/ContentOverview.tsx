'use client'

import Link from 'next/link'
import { useState } from 'react'
import ContentNav from './ContentNav'

interface Stats {
  totalActivities: number
  activitiesLast24h: number
  totalRatings: number
  ratingsLast24h: number
  totalSearches: number
  searchesLast24h: number
}

export default function ContentOverview({ stats }: { stats: Stats }) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  const sections = [
    {
      title: 'Recent Activity',
      description: 'Real-time feed of all user actions across the platform',
      href: '/admin/content/activity',
      icon: '📊',
      stats: [
        { label: 'Total Activities', value: stats.totalActivities },
        { label: 'Last 24h', value: stats.activitiesLast24h }
      ]
    },
    {
      title: 'Ratings & Reviews',
      description: 'All user ratings and reviews across movies and TV shows',
      href: '/admin/content/ratings',
      icon: '⭐',
      stats: [
        { label: 'Total Ratings', value: stats.totalRatings },
        { label: 'Last 24h', value: stats.ratingsLast24h }
      ]
    },
    {
      title: 'Top Media',
      description: 'Most popular movies and TV shows by ratings and watchlist additions',
      href: '/admin/content/top',
      icon: '🏆',
      stats: [
        { label: 'View Rankings', value: '→' }
      ]
    },
    {
      title: 'Search Activity',
      description: 'User search queries and search performance metrics',
      href: '/admin/content/search',
      icon: '🔍',
      stats: [
        { label: 'Total Searches', value: stats.totalSearches },
        { label: 'Last 24h', value: stats.searchesLast24h }
      ]
    }
  ]

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Sub-navigation */}
      <ContentNav />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          Engagement
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Monitor user activity, ratings, trending media, and search behavior
        </p>
      </div>

      {/* Section Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div
              style={{
                background: 'var(--card-bg)',
                border: hoveredCard === section.href ? '1px solid var(--brand-pink)' : 'var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transform: hoveredCard === section.href ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredCard === section.href ? '0 4px 12px rgba(233, 77, 136, 0.15)' : 'none'
              }}
              onMouseEnter={() => setHoveredCard(section.href)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Icon & Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--background)',
                  borderRadius: '8px'
                }}>
                  {section.icon}
                </div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  {section.title}
                </h2>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: '0 0 1.5rem 0',
                flex: 1
              }}>
                {section.description}
              </p>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: section.stats.length > 1 ? '1fr 1fr' : '1fr',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: 'var(--border)'
              }}>
                {section.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem'
                    }}>
                      {stat.label}
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'var(--card-bg)',
        border: 'var(--border)',
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 1rem 0'
        }}>
          Quick Access
        </h3>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <Link href="/admin/content/activity" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #E94D88 0%, #C2185B 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: hoveredButton === 'activity' ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={() => setHoveredButton('activity')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              View Live Activity Feed
            </button>
          </Link>
          <Link href="/admin/content/top" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: `1px solid ${hoveredButton === 'top' ? 'var(--brand-pink)' : 'var(--border-color)'}`,
                borderRadius: '8px',
                color: hoveredButton === 'top' ? 'var(--brand-pink)' : 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={() => setHoveredButton('top')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              See Top Rated Content
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

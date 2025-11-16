'use client'

import Link from 'next/link'
import { useState } from 'react'
import MessagingNav from './MessagingNav'

export default function MessagingOverview() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const sections = [
    {
      title: 'Activity Announcements',
      description: 'Send targeted in-app announcements to users with custom actions and tracking',
      href: '/admin/messaging/announcements',
      icon: '📢',
      stats: [
        { label: 'Manage Announcements', value: '→' }
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
      <MessagingNav />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0'
        }}>
          Push Messaging
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          Send targeted messages and announcements to users
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

      {/* Info Box */}
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
          margin: '0 0 0.5rem 0'
        }}>
          About Push Messaging
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: 1.6
        }}>
          Send targeted messages to users to keep them engaged and informed about new features,
          updates, and important announcements. Track engagement metrics to understand how users
          interact with your messages.
        </p>
      </div>
    </div>
  )
}

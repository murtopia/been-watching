'use client'

import { useState, useEffect } from 'react'
import posthog from 'posthog-js'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics-consent')
    if (consent === null) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const acceptAnalytics = () => {
    localStorage.setItem('analytics-consent', 'true')
    posthog.opt_in_capturing()
    setShowBanner(false)

    // Capture consent event
    posthog.capture('analytics_consent_given', {
      consent_type: 'accept',
    })
  }

  const declineAnalytics = () => {
    localStorage.setItem('analytics-consent', 'false')
    posthog.opt_out_capturing()
    setShowBanner(false)

    // Note: We can still capture this event before opting out
    posthog.capture('analytics_consent_given', {
      consent_type: 'decline',
    })
  }

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: '1.5',
            color: '#1a1a1a',
          }}>
            <strong>We value your privacy.</strong> We use analytics to improve your experience and understand how you use Been Watching.
            No personal data is sold or shared with third parties.{' '}
            <a
              href="/privacy"
              target="_blank"
              style={{
                color: '#f97316',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Learn more
            </a>
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={declineAnalytics}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#4b5563',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Decline
          </button>

          <button
            onClick={acceptAnalytics}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.3)'
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

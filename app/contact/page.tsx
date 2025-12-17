'use client'

import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'
import { Mail, MessageSquare, Newspaper } from 'lucide-react'

export default function ContactPage() {
  const colors = useThemeColors()

  const contactOptions = [
    {
      icon: Mail,
      title: 'General Inquiries',
      description: 'For general questions, feedback, or support',
      email: 'hello@beenwatching.com'
    },
    {
      icon: MessageSquare,
      title: 'Technical Support',
      description: 'Having trouble? Need help with your account?',
      email: 'support@beenwatching.com'
    },
    {
      icon: Newspaper,
      title: 'Press & Media',
      description: 'Media inquiries and press kit requests',
      email: 'press@beenwatching.com'
    }
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '398px',
          margin: '0 auto',
          padding: '2rem 1rem',
          flex: 1,
        }}
      >
        {/* Back Button */}
        <a
          href="/"
          style={{
            color: colors.goldAccent,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: '1.5rem',
          }}
        >
          ← Back to Home
        </a>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            Contact Us
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '1rem' }}>
            We'd love to hear from you
          </p>
        </div>

        {/* Contact Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {contactOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <div
                key={index}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: colors.surfaceBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={20} color={colors.textSecondary} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '0.25rem' }}>
                      {option.title}
                    </h2>
                    <p style={{ color: colors.textSecondary, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      {option.description}
                    </p>
                    <a
                      href={`mailto:${option.email}`}
                      style={{
                        color: colors.goldAccent,
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      {option.email}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Response Time */}
        <div
          style={{
            background: 'transparent',
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '0.25rem' }}>
            Response Time
          </h3>
          <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            We typically respond within 24-48 hours during business days
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}

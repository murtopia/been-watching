'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Footer from '@/components/navigation/Footer'

export default function HelpPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666'

  const faqs = [
    {
      question: 'How do I add a show or movie to my list?',
      answer: 'Click the search icon in the bottom navigation, search for the show or movie you want to add, then select it and choose whether you want to watch it, are currently watching it, or have already watched it.'
    },
    {
      question: 'Can I follow my friends?',
      answer: 'Yes! Go to your profile page and click on the "Discover" tab to find friends. You can search by username or find suggested friends based on similar taste.'
    },
    {
      question: 'How do ratings work?',
      answer: 'You can rate shows and movies on a simple scale: Love it, Like it, or Meh. Your ratings help us recommend content and show your taste to friends.'
    },
    {
      question: 'What are Top 3 shows?',
      answer: 'Top 3 shows are your all-time favorite shows displayed prominently on your profile. You can set them from your profile page to showcase your taste to friends.'
    },
    {
      question: 'How do I see what my friends are watching?',
      answer: 'Your home feed shows activity from people you follow, including what they\'re watching, their ratings, and their comments.'
    },
    {
      question: 'Can I make my profile private?',
      answer: 'Yes! Go to your profile settings and toggle the "Private Profile" option. When private, only approved followers can see your activity.'
    },
    {
      question: 'How do invite codes work?',
      answer: 'During our alpha phase, Been Watching is invite-only. Each user gets a limited number of invite codes to share with friends. You can find your invite codes on your profile page.'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account from your profile settings. This action is permanent and will remove all your data from our servers.'
    }
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Theme Toggle */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 100,
        }}
      >
        <ThemeToggle />
      </div>

      {/* Content */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '4rem auto',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem',
            }}
          >
            Help Center
          </h1>
          <p style={{ color: textSecondary, fontSize: '1.125rem' }}>
            Frequently asked questions
          </p>
        </div>

        {/* FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: cardBg,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${cardBorder}`,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: isDark
                  ? '0 10px 30px rgba(0, 0, 0, 0.3)'
                  : '0 10px 30px rgba(0, 0, 0, 0.05)',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: textPrimary,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                <span>{faq.question}</span>
                <span style={{ fontSize: '1.5rem', color: '#e94d88' }}>
                  {openFaq === index ? '−' : '+'}
                </span>
              </button>
              {openFaq === index && (
                <div
                  style={{
                    padding: '0 1.25rem 1.25rem',
                    color: textSecondary,
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: isDark
              ? '0 20px 60px rgba(0, 0, 0, 0.5)'
              : '0 20px 60px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: textPrimary, marginBottom: '0.75rem' }}>
            Still need help?
          </h3>
          <p style={{ color: textSecondary, marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            Can't find what you're looking for? We're here to help.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 600,
            }}
          >
            Contact Support
          </a>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a
            href="/"
            style={{
              color: textSecondary,
              textDecoration: 'none',
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', width: '100%' }}>
        <Footer variant="full" />
      </div>
    </div>
  )
}

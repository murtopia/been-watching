'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function HelpPage() {
  const colors = useThemeColors()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
            Help Center
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '1rem' }}>
            Frequently asked questions
          </p>
        </div>

        {/* FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.borderColor}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: colors.textPrimary,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  gap: '1rem',
                }}
              >
                <span>{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp size={20} color={colors.goldAccent} style={{ flexShrink: 0 }} />
                ) : (
                  <ChevronDown size={20} color={colors.goldAccent} style={{ flexShrink: 0 }} />
                )}
              </button>
              {openFaq === index && (
                <div
                  style={{
                    padding: '0 1rem 1rem',
                    color: colors.textSecondary,
                    fontSize: '0.875rem',
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
            background: 'transparent',
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '0.5rem' }}>
            Still need help?
          </h3>
          <p style={{ color: colors.textSecondary, marginBottom: '1rem', fontSize: '0.875rem' }}>
            Can't find what you're looking for? We're here to help.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: colors.goldAccent,
              color: '#000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}

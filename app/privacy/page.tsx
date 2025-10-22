'use client'

import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function PrivacyPage() {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : '#ffffff'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666'

  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'

  return (
    <div style={{
      minHeight: '100vh',
      background: bgGradient,
      color: textPrimary,
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: cardBg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${cardBorder}`,
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: isDarkMode
          ? '0 20px 60px rgba(0, 0, 0, 0.5)'
          : '0 20px 60px rgba(0, 0, 0, 0.08)',
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <a
            href="/"
            style={{
              padding: '0.5rem 1rem',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
              borderRadius: '8px',
              color: textPrimary,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ← Back
          </a>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Privacy Policy
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Last updated: January 22, 2025
          </p>
        </div>

        {/* Content */}
        <div style={{ lineHeight: 1.8, color: textSecondary }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              1. Introduction
            </h2>
            <p>
              Welcome to Been Watching ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              2. Information We Collect
            </h2>
            <h3 style={{ color: textPrimary, fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Information you provide to us:
            </h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Account information (email address, username, display name)</li>
              <li>Profile information (bio, avatar, top shows)</li>
              <li>Content you create (ratings, watch status, notes, comments)</li>
              <li>Social interactions (follows, likes, comments)</li>
            </ul>

            <h3 style={{ color: textPrimary, fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Information collected automatically:
            </h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Usage data (pages visited, features used)</li>
              <li>Device information (browser type, operating system)</li>
              <li>Log data (IP address, access times)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Provide and maintain our service</li>
              <li>Personalize your experience and show recommendations</li>
              <li>Enable social features (following, activity feed, notifications)</li>
              <li>Send service-related communications</li>
              <li>Improve and develop new features</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              4. Information Sharing
            </h2>
            <p>We do not sell your personal information. We may share your information:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong>With other users:</strong> Your public profile, ratings, and activities are visible to other users based on your privacy settings</li>
              <li><strong>With service providers:</strong> We use third-party services including:
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Supabase (authentication and database)</li>
                  <li>Vercel (hosting)</li>
                  <li>The Movie Database (TMDB) (media information)</li>
                  <li>Sentry (error tracking)</li>
                </ul>
              </li>
              <li><strong>For legal reasons:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              5. Google OAuth
            </h2>
            <p>
              When you sign in with Google, we receive basic profile information (email, name) from Google. We use this only for account creation and authentication. We do not access your Google data beyond what's necessary for sign-in.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              6. Data Retention
            </h2>
            <p>
              We retain your information for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where we're required to retain it for legal purposes.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Control your privacy settings</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              8. Security
            </h2>
            <p>
              We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure. We use industry-standard encryption and security practices.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              9. Children's Privacy
            </h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              10. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes by posting a notice on our service or sending you an email.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              11. Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy, please contact us at:
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Email:</strong> <a href="mailto:privacy@beenwatching.com" style={{ color: '#e94d88', textDecoration: 'none' }}>privacy@beenwatching.com</a>
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              12. California Privacy Rights (CCPA)
            </h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, delete your information, and opt-out of the sale of personal information (note: we do not sell your information).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

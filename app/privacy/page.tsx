'use client'

import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'

export default function PrivacyPage() {
  const colors = useThemeColors()

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
            Privacy Policy
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Last updated: January 22, 2025
          </p>
        </div>

        {/* Content */}
        <div style={{ lineHeight: 1.8, color: colors.textSecondary, fontSize: '0.9375rem' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              1. Introduction
            </h2>
            <p>
              Welcome to Been Watching ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              2. Information We Collect
            </h2>
            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Information you provide to us:
            </h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>Account information (email address, username, display name)</li>
              <li>Profile information (bio, avatar, top shows)</li>
              <li>Content you create (ratings, watch status, notes, comments)</li>
              <li>Social interactions (follows, likes, comments)</li>
            </ul>

            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Information collected automatically:
            </h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>Usage data (pages visited, features used)</li>
              <li>Device information (browser type, operating system)</li>
              <li>Log data (IP address, access times)</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>Provide and maintain our service</li>
              <li>Personalize your experience and show recommendations</li>
              <li>Enable social features (following, activity feed, notifications)</li>
              <li>Send service-related communications</li>
              <li>Improve and develop new features</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              4. Information Sharing
            </h2>
            <p>We do not sell your personal information. We may share your information:</p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li><strong style={{ color: colors.textPrimary }}>With other users:</strong> Your public profile, ratings, and activities are visible to other users based on your privacy settings</li>
              <li><strong style={{ color: colors.textPrimary }}>With service providers:</strong> We use third-party services including Supabase, Vercel, TMDB, and Sentry</li>
              <li><strong style={{ color: colors.textPrimary }}>For legal reasons:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              5. Google OAuth
            </h2>
            <p>
              When you sign in with Google, we receive basic profile information (email, name) from Google. We use this only for account creation and authentication. We do not access your Google data beyond what's necessary for sign-in.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              6. Data Retention
            </h2>
            <p>
              We retain your information for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where we're required to retain it for legal purposes.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Control your privacy settings</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              8. Security
            </h2>
            <p>
              We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure. We use industry-standard encryption and security practices.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              9. Children's Privacy
            </h2>
            <p>
              Our service is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              10. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes by posting a notice on our service or sending you an email.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              11. Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy, please contact us at:{' '}
              <a href="mailto:privacy@beenwatching.com" style={{ color: colors.goldAccent, textDecoration: 'none', fontWeight: 600 }}>
                privacy@beenwatching.com
              </a>
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              12. California Privacy Rights (CCPA)
            </h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, delete your information, and opt-out of the sale of personal information (note: we do not sell your information).
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}

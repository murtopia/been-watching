'use client'

import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.875rem' }}>
            Last updated: January 22, 2025
          </p>
        </div>

        {/* Content */}
        <div style={{ lineHeight: 1.8, color: textSecondary }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Been Watching ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              2. Description of Service
            </h2>
            <p>
              Been Watching is a social platform for tracking and discovering TV shows and movies. The Service allows you to:
            </p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Track what you're watching, want to watch, and have watched</li>
              <li>Rate and review shows and movies</li>
              <li>Follow friends and see their viewing activity</li>
              <li>Discover new content based on your taste and friend recommendations</li>
              <li>Write notes and comments about shows</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              3. User Accounts
            </h2>
            <h3 style={{ color: textPrimary, fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Account Creation
            </h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>You must be at least 13 years old to use the Service</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not share your account with others</li>
              <li>During our invite-only phase, you need a valid invite code to sign up</li>
            </ul>

            <h3 style={{ color: textPrimary, fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Account Security
            </h3>
            <p>
              You are responsible for all activity that occurs under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              4. User Content and Conduct
            </h2>
            <h3 style={{ color: textPrimary, fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Your Content
            </h3>
            <p>
              You retain ownership of content you post (ratings, notes, comments, etc.). By posting content, you grant us a license to use, display, and distribute it as part of the Service.
            </p>

            <h3 style={{ color: textPrimary, fontSize: '1.125rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Prohibited Conduct
            </h3>
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Spam, advertise, or solicit other users</li>
              <li>Post spoilers without appropriate warnings</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use automated tools (bots, scrapers) without permission</li>
              <li>Harass, bully, or abuse other users</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              5. Content Moderation
            </h2>
            <p>
              We reserve the right to remove any content or suspend any account that violates these Terms or is otherwise harmful to the community. We may also remove content or accounts at our discretion.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              6. Privacy
            </h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" style={{ color: '#e94d88', textDecoration: 'none' }}>Privacy Policy</a>.
              Please review it to understand how we collect and use your information.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              7. Third-Party Content
            </h2>
            <p>
              The Service uses data from The Movie Database (TMDB) and other third-party sources. We do not own or control this content and are not responsible for its accuracy.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              8. Intellectual Property
            </h2>
            <p>
              The Service and its original content (excluding user content) are owned by Been Watching and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Movie and TV show information, images, and metadata are provided by TMDB and are subject to their terms of use.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              9. Disclaimer of Warranties
            </h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              10. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BEEN WATCHING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              11. Termination
            </h2>
            <p>
              We may terminate or suspend your account at any time, with or without notice, for violations of these Terms or for any other reason. You may also delete your account at any time through your profile settings.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting a notice on the Service or sending you an email. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              13. Dispute Resolution
            </h2>
            <p>
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              14. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              15. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Email:</strong> <a href="mailto:legal@beenwatching.com" style={{ color: '#e94d88', textDecoration: 'none' }}>legal@beenwatching.com</a>
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ color: textPrimary, fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              16. Invite System
            </h2>
            <p>
              During our invite-only phase:
            </p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>You must have a valid invite code to create an account</li>
              <li>You may receive personal invite codes to share with friends</li>
              <li>Abuse of the invite system may result in account suspension</li>
              <li>We reserve the right to revoke invite codes at any time</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

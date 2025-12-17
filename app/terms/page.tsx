'use client'

import { useThemeColors } from '@/hooks/useThemeColors'
import Footer from '@/components/navigation/Footer'

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
            Last updated: January 22, 2025
          </p>
        </div>

        {/* Content */}
        <div style={{ lineHeight: 1.8, color: colors.textSecondary, fontSize: '0.9375rem' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Been Watching ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              2. Description of Service
            </h2>
            <p>
              Been Watching is a social platform for tracking and discovering TV shows and movies. The Service allows you to:
            </p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>Track what you're watching, want to watch, and have watched</li>
              <li>Rate and review shows and movies</li>
              <li>Follow friends and see their viewing activity</li>
              <li>Discover new content based on your taste and friend recommendations</li>
              <li>Write notes and comments about shows</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              3. User Accounts
            </h2>
            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Account Creation
            </h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>You must be at least 13 years old to use the Service</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not share your account with others</li>
              <li>During our invite-only phase, you need a valid invite code to sign up</li>
            </ul>

            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Account Security
            </h3>
            <p>
              You are responsible for all activity that occurs under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              4. User Content and Conduct
            </h2>
            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Your Content
            </h3>
            <p>
              You retain ownership of content you post (ratings, notes, comments, etc.). By posting content, you grant us a license to use, display, and distribute it as part of the Service.
            </p>

            <h3 style={{ color: colors.textPrimary, fontSize: '1rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
              Prohibited Conduct
            </h3>
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: '1.25rem' }}>
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

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              5. Content Moderation
            </h2>
            <p>
              We reserve the right to remove any content or suspend any account that violates these Terms or is otherwise harmful to the community. We may also remove content or accounts at our discretion.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              6. Privacy
            </h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" style={{ color: colors.goldAccent, textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>.
              Please review it to understand how we collect and use your information.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              7. Third-Party Content
            </h2>
            <p>
              The Service uses data from The Movie Database (TMDB) and other third-party sources. We do not own or control this content and are not responsible for its accuracy.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              8. Intellectual Property
            </h2>
            <p>
              The Service and its original content (excluding user content) are owned by Been Watching and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Movie and TV show information, images, and metadata are provided by TMDB and are subject to their terms of use.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              9. Disclaimer of Warranties
            </h2>
            <p style={{ textTransform: 'uppercase', fontSize: '0.8125rem' }}>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              10. Limitation of Liability
            </h2>
            <p style={{ textTransform: 'uppercase', fontSize: '0.8125rem' }}>
              To the maximum extent permitted by law, Been Watching shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              11. Termination
            </h2>
            <p>
              We may terminate or suspend your account at any time, with or without notice, for violations of these Terms or for any other reason. You may also delete your account at any time through your profile settings.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting a notice on the Service or sending you an email. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              13. Dispute Resolution
            </h2>
            <p>
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              14. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              15. Contact
            </h2>
            <p>
              If you have questions about these Terms, please contact us at:{' '}
              <a href="mailto:legal@beenwatching.com" style={{ color: colors.goldAccent, textDecoration: 'none', fontWeight: 600 }}>
                legal@beenwatching.com
              </a>
            </p>
          </section>

          <div style={{ height: '1px', background: colors.dividerColor, margin: '1.5rem 0' }} />

          <section>
            <h2 style={{ color: colors.textPrimary, fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              16. Invite System
            </h2>
            <p>During our invite-only phase:</p>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li>You must have a valid invite code to create an account</li>
              <li>You may receive personal invite codes to share with friends</li>
              <li>Abuse of the invite system may result in account suspension</li>
              <li>We reserve the right to revoke invite codes at any time</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="full" />
    </div>
  )
}

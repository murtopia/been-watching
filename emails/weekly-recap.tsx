import * as React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Heading,
  Hr,
} from '@react-email/components'

interface WeeklyRecapEmailProps {
  userName: string
  friendActivities: Array<{
    friendName: string
    friendUsername: string
    action: string
    mediaTitle: string
    rating?: number
    comment?: string
  }>
  weekStart: string
  weekEnd: string
}

export default function WeeklyRecapEmail({
  userName = 'there',
  friendActivities = [],
  weekStart = 'Nov 1',
  weekEnd = 'Nov 8',
}: WeeklyRecapEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>🎬 Your Weekly Recap</Heading>
            <Text style={subheading}>
              {weekStart} - {weekEnd}
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={text}>Hey {userName}! 👋</Text>
            <Text style={text}>
              Here's what your friends have been watching this week:
            </Text>
          </Section>

          {/* Friend Activity */}
          {friendActivities.length > 0 ? (
            <Section style={section}>
              {friendActivities.map((activity, index) => (
                <div key={index} style={activityCard}>
                  <Text style={activityText}>
                    <strong style={friendName}>{activity.friendName}</strong>{' '}
                    {activity.action}{' '}
                    <strong style={mediaTitle}>{activity.mediaTitle}</strong>
                  </Text>

                  {activity.rating && (
                    <Text style={ratingText}>
                      {'★'.repeat(activity.rating)}{'☆'.repeat(5 - activity.rating)}
                    </Text>
                  )}

                  {activity.comment && (
                    <Text style={commentText}>"{activity.comment}"</Text>
                  )}

                  <Text style={usernameText}>
                    <Link
                      href={`https://beenwatching.com/${activity.friendUsername}`}
                      style={link}
                    >
                      @{activity.friendUsername}
                    </Link>
                  </Text>

                  {index < friendActivities.length - 1 && <Hr style={divider} />}
                </div>
              ))}
            </Section>
          ) : (
            <Section style={section}>
              <Text style={text}>
                No new activity from your friends this week. Invite more friends to see what they're watching!
              </Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Link
              href="https://beenwatching.com/feed"
              style={button}
            >
              See Full Activity Feed
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you opted in to weekly recap emails.
            </Text>
            <Text style={footerText}>
              <Link href="https://beenwatching.com/profile/settings/notifications" style={footerLink}>
                Update email preferences
              </Link>
              {' · '}
              <Link href="https://beenwatching.com/profile/settings/notifications" style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  padding: '0',
}

const subheading = {
  color: '#666666',
  fontSize: '16px',
  margin: '0',
}

const section = {
  padding: '24px 32px',
}

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const activityCard = {
  marginBottom: '16px',
}

const activityText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const friendName = {
  color: '#FFC125',
  fontWeight: '600',
}

const mediaTitle = {
  color: '#3b82f6',
  fontWeight: '600',
}

const ratingText = {
  color: '#f59e0b',
  fontSize: '18px',
  margin: '4px 0',
}

const commentText = {
  color: '#666666',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  margin: '8px 0',
  padding: '8px 12px',
  backgroundColor: '#f9fafb',
  borderLeft: '3px solid #FFC125',
}

const usernameText = {
  color: '#666666',
  fontSize: '14px',
  margin: '4px 0 0',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const ctaSection = {
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#FFC125',
  borderRadius: '8px',
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  padding: '24px 32px',
  borderTop: '1px solid #e5e7eb',
}

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

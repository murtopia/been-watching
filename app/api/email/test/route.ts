import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import WeeklyRecapEmail from '@/emails/weekly-recap'
import { checkAdminAccess } from '@/utils/admin/permissions'

// Initialize Resend lazily to avoid build-time errors when env var is not available
let resend: Resend | null = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication and admin status
    const { hasAccess, userId } = await checkAdminAccess()

    if (!hasAccess || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user auth data for email
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Get user profile info for the test email
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', userId)
      .single()

    // Generate sample email data
    const sampleData = {
      userName: profile?.display_name || profile?.username || 'there',
      friendActivities: [
        {
          friendName: 'Taylor',
          friendUsername: 'taylormurto',
          action: 'rated',
          mediaTitle: 'Breaking Bad',
          rating: 5,
          comment: 'Best show ever made. Every season gets better!'
        },
        {
          friendName: 'Todd',
          friendUsername: 'toddles',
          action: 'watched',
          mediaTitle: 'The Godfather',
        },
        {
          friendName: 'Mossy',
          friendUsername: 'mossy',
          action: 'is watching',
          mediaTitle: 'Succession',
          comment: 'Season 2 is incredible so far'
        }
      ],
      weekStart: 'Nov 1',
      weekEnd: 'Nov 8'
    }

    // Render the email template
    const emailHtml = await render(WeeklyRecapEmail(sampleData))

    // Send test email directly via Resend
    const { data, error } = await getResend().emails.send({
      from: 'Been Watching <hello@boxoffice.beenwatching.com>',
      to: [user.email!],
      subject: `[TEST] Your Weekly Recap - ${sampleData.weekStart} to ${sampleData.weekEnd}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${user.email}`,
      messageId: data?.id
    })

  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}

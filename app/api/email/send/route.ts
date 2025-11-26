import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'
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
    const { hasAccess } = await checkAdminAccess()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      campaignId,
      to,
      subject,
      html,
      testMode = false
    } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    // Send email via Resend
    const { data, error } = await getResend().emails.send({
      from: 'Been Watching <hello@boxoffice.beenwatching.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If this is a campaign email (not test mode), track the send
    if (campaignId && !testMode) {
      const emailAddress = Array.isArray(to) ? to[0] : to

      // Get user_id from email
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', emailAddress)
        .single()

      if (recipientProfile) {
        // Record the send
        await supabase
          .from('email_sends')
          .insert({
            campaign_id: campaignId,
            user_id: recipientProfile.id,
            email_address: emailAddress,
            resend_id: data?.id,
            status: 'sent',
            sent_at: new Date().toISOString()
          })

        // Update campaign stats
        await supabase.rpc('increment_campaign_sent', {
          campaign_id: campaignId
        })
      }
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      testMode
    })

  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

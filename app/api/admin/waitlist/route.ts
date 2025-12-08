import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like O, 0, I, 1
  let code = 'BW-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user is an admin
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          }
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, admin_role')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin && !profile?.admin_role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, ids } = await request.json()

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    switch (action) {
      case 'delete': {
        const { error } = await supabaseAdmin
          .from('waitlist')
          .delete()
          .in('id', ids)

        if (error) {
          console.error('Delete error:', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      }

      case 'invite': {
        // Generate codes and update waitlist entries
        const codes: Record<string, string> = {}
        const updates = []

        for (const id of ids) {
          const code = generateInviteCode()
          codes[id] = code
          
          // Create the invite code in master_codes table
          updates.push(
            supabaseAdmin
              .from('master_codes')
              .insert({
                code,
                type: 'waitlist',
                max_uses: 1,
                is_active: true
              })
          )

          // Update the waitlist entry
          updates.push(
            supabaseAdmin
              .from('waitlist')
              .update({
                invited_at: new Date().toISOString(),
                invite_code: code
              })
              .eq('id', id)
          )
        }

        // Execute all updates
        const results = await Promise.all(updates)
        const errors = results.filter(r => r.error)
        
        if (errors.length > 0) {
          console.error('Invite errors:', errors.map(e => e.error))
          return NextResponse.json({ 
            error: 'Some invites failed',
            details: errors.map(e => e.error?.message) 
          }, { status: 500 })
        }

        // TODO: Send actual invite emails here
        // For now, just return the codes so admin can manually share them

        return NextResponse.json({ success: true, codes })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    console.error('Admin waitlist API error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}


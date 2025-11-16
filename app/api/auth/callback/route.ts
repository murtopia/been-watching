import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user info to check if this is signup or login
      const { data: { user } } = await supabase.auth.getUser()
      const isNewUser = user?.created_at && new Date(user.created_at).getTime() > Date.now() - 5000 // Created in last 5 seconds

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // Create redirect URL with tracking params
      const redirectUrl = isLocalEnv
        ? `${origin}${next}`
        : forwardedHost
          ? `https://${forwardedHost}${next}`
          : `${origin}${next}`

      // Add query params to trigger tracking on client side
      const url = new URL(redirectUrl)
      url.searchParams.set('oauth_callback', 'true')
      url.searchParams.set('oauth_action', isNewUser ? 'signup' : 'login')
      if (user) {
        url.searchParams.set('user_id', user.id)
      }

      return NextResponse.redirect(url.toString())
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
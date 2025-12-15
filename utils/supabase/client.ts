import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // During build/prerender, env vars may not be available
  // Return a dummy client that will be replaced at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}
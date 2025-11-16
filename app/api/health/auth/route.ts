import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Try to get the current session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        { status: 'error', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Authentication service operational'
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

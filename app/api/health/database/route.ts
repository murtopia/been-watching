import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Try to query the database
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json(
        { status: 'error', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection successful'
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

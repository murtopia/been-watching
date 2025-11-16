import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'API is responsive',
    timestamp: new Date().toISOString()
  })
}

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.TMDB_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { status: 'error', error: 'TMDB API key not configured' },
        { status: 500 }
      )
    }

    // Test TMDB API with a simple request
    const response = await fetch(
      `https://api.themoviedb.org/3/configuration?api_key=${apiKey}`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', error: 'TMDB API request failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'TMDB API accessible'
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

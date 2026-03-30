import { NextResponse } from 'next/server'

export const revalidate = 86400 // cache for 24 hours

export async function GET() {
  const PLACE_ID = process.env.GOOGLE_PLACES_PLACE_ID
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY

  if (!PLACE_ID || !API_KEY) {
    return NextResponse.json(
      { error: 'Google Places not configured', reviews: null },
      { status: 503 }
    )
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${API_KEY}`

  try {
    const response = await fetch(url, { next: { revalidate: 86400 } })
    const data = await response.json()

    if (!data.result?.reviews) {
      return NextResponse.json(
        { error: 'No reviews found', reviews: null },
        { status: 404 }
      )
    }

    const reviews = data.result.reviews
      .filter((r: { rating: number }) => r.rating >= 4)
      .sort((a: { time: number }, b: { time: number }) => b.time - a.time)
      .slice(0, 20)

    return NextResponse.json(
      {
        reviews,
        overall_rating: data.result.rating,
        total_ratings: data.result.user_ratings_total,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reviews', reviews: null },
      { status: 500 }
    )
  }
}

const PLACE_ID = 'ChIJmca2LsTZCUgRHUn8HZt5nUw'

export interface GoogleReview {
  authorName: string
  rating: number
  text: string
  relativeTimeDescription: string
  profilePhotoUrl: string
  time: number
}

export interface PlaceDetails {
  name: string
  rating: number
  totalReviews: number
  reviews: GoogleReview[]
  url: string
}

// Fetch real reviews from Google Places API at build time / server-side
export async function fetchGoogleReviews(): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    console.warn('[GoogleReviews] GOOGLE_PLACES_API_KEY not set')
    return null
  }

  console.log('[GoogleReviews] API key found, fetching reviews...')

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=newest&key=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    const data = await res.json()
    console.log('[GoogleReviews] API response status:', data.status)

    if (data.status !== 'OK') {
      console.error('[GoogleReviews] API error:', data.status, data.error_message || '')
      // If the Places API isn't enabled or key is wrong, try Places API (New)
      if (data.status === 'REQUEST_DENIED') {
        console.error('[GoogleReviews] Try enabling "Places API" at console.cloud.google.com/apis')
      }
      return null
    }

    const place = data.result

    console.log('[GoogleReviews] Got', place.reviews?.length || 0, 'reviews for', place.name)

    return {
      name: place.name || 'Jamaica House Brand',
      rating: place.rating || 5,
      totalReviews: place.user_ratings_total || 148,
      url: place.url || `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
      reviews: (place.reviews || []).map((r: Record<string, unknown>) => ({
        authorName: r.author_name as string,
        rating: r.rating as number,
        text: r.text as string,
        relativeTimeDescription: r.relative_time_description as string,
        profilePhotoUrl: r.profile_photo_url as string,
        time: r.time as number,
      })),
    }
  } catch (err) {
    console.error('[GoogleReviews] Fetch failed:', err)
    return null
  }
}

export const GOOGLE_PLACE_ID = PLACE_ID

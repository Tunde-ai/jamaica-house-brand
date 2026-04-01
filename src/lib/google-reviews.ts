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
    console.warn('GOOGLE_PLACES_API_KEY not set — Google Reviews will not load')
    return null
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=newest&key=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!res.ok) {
      console.error('Google Places API error:', res.status)
      return null
    }

    const data = await res.json()

    if (data.status !== 'OK' || !data.result) {
      console.error('Google Places API returned:', data.status)
      return null
    }

    const place = data.result

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
    console.error('Failed to fetch Google reviews:', err)
    return null
  }
}

export const GOOGLE_PLACE_ID = PLACE_ID

'use client'

import { useEffect, useState } from 'react'
import { testimonials as fallbackTestimonials } from '@/data/testimonials'
import StarRating from '@/components/ui/StarRating'

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url?: string
  relative_time_description?: string
}

interface ReviewDisplay {
  id: string
  name: string
  quote: string
  rating: number
  location?: string
  date?: string
  isGoogle?: boolean
}

const REVIEWS_PER_VIEW = 4

function pickDailySet(reviews: ReviewDisplay[]): ReviewDisplay[] {
  if (reviews.length <= REVIEWS_PER_VIEW) return reviews
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const startIndex = (dayIndex * REVIEWS_PER_VIEW) % reviews.length
  const set: ReviewDisplay[] = []
  for (let i = 0; i < REVIEWS_PER_VIEW; i++) {
    set.push(reviews[(startIndex + i) % reviews.length])
  }
  return set
}

function googleToDisplay(review: GoogleReview, index: number): ReviewDisplay {
  return {
    id: `google-${index}`,
    name: review.author_name,
    quote: review.text,
    rating: review.rating,
    date: new Date(review.time * 1000).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    isGoogle: true,
  }
}

export default function SocialProof() {
  const [visibleReviews, setVisibleReviews] = useState<ReviewDisplay[]>(
    pickDailySet(fallbackTestimonials)
  )
  const [isGoogle, setIsGoogle] = useState(false)

  useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const res = await fetch('/api/google-reviews')
        if (!res.ok) return
        const data = await res.json()
        if (data.reviews?.length > 0) {
          const mapped = data.reviews.map(googleToDisplay)
          setVisibleReviews(pickDailySet(mapped))
          setIsGoogle(true)
        }
      } catch {
        // Keep fallback testimonials on error
      }
    }
    fetchGoogleReviews()
  }, [])

  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
          What Our Customers Say
        </h2>
        {isGoogle && (
          <p className="text-gray-500 text-sm text-center mb-12">
            Real reviews from Google
          </p>
        )}
        {!isGoogle && <div className="mb-12" />}

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 border border-brand-gold/10 rounded-lg p-6"
            >
              <StarRating rating={review.rating} showValue={false} />
              <blockquote className="text-gray-300 italic mt-4 leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{review.name}</p>
                  {review.location && (
                    <p className="text-gray-500 text-sm">{review.location}</p>
                  )}
                  {review.date && (
                    <p className="text-gray-500 text-sm">{review.date}</p>
                  )}
                </div>
                {review.isGoogle && (
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-label="Google Review"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Leave a review CTA */}
        {isGoogle && process.env.NEXT_PUBLIC_GOOGLE_PLACES_PLACE_ID && (
          <div className="text-center mt-10">
            <a
              href={`https://search.google.com/local/writereview?placeid=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_PLACE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-brand-gold text-black font-semibold rounded-lg hover:bg-brand-gold/90 transition-colors"
            >
              Leave Us a Google Review
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { googleBusinessInfo } from '@/data/google-reviews'
import { sanitizeJsonLd } from '@/lib/seo'

const PLACE_ID = googleBusinessInfo.placeId

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function GoogleReviews() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Elfsight Google Reviews widget script
    const existing = document.querySelector('script[src*="elfsight.com"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://static.elfsight.com/platform/platform.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const reviewSchemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: googleBusinessInfo.businessName,
    '@id': `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: googleBusinessInfo.averageRating.toString(),
      reviewCount: googleBusinessInfo.totalReviews.toString(),
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <section className="py-16 sm:py-24 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(reviewSchemaJsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GoogleIcon />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              What Our Customers Say
            </h2>
          </div>
          <p className="text-gray-400 text-sm">
            {googleBusinessInfo.totalReviews} reviews on Google · {googleBusinessInfo.averageRating} out of 5 stars
          </p>
        </div>

        {/* Live Google Reviews Widget via Google Maps embed */}
        <div ref={widgetRef} className="rounded-xl overflow-hidden">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m3!3e0!4m0!4m0!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus&q=place_id:${PLACE_ID}`}
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Jamaica House Brand on Google Maps"
            className="w-full"
          />
        </div>

        {/* Direct links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <a
            href={`https://search.google.com/local/reviews?placeid=${PLACE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/5 border border-brand-gold/20 text-white px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <GoogleIcon />
            Read All {googleBusinessInfo.totalReviews} Reviews
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href={`https://search.google.com/local/writereview?placeid=${PLACE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-5 py-2.5 rounded-lg hover:bg-brand-gold/20 transition-colors text-sm font-medium"
          >
            <GoogleIcon />
            Leave a Review
          </a>
        </div>
      </div>
    </section>
  )
}

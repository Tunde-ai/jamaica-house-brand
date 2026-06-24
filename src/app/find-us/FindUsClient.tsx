'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  type RetailLocation,
  type LocationCategory,
  categoryLabels,
  categoryColors,
} from '@/data/retail-locations'

// ─── Haversine distance (miles) ───────────────────────────────
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Simple US zip → rough lat/lng lookup ─────────────────────
// First 3 digits of zip → approximate center. Good enough for
// "nearest store" sorting without a geocoding API.
const ZIP_PREFIX_COORDS: Record<string, [number, number]> = {
  '330': [25.76, -80.19],   // Miami
  '331': [25.76, -80.19],   // Miami
  '332': [28.54, -81.38],   // Orlando
  '333': [26.12, -80.14],   // Fort Lauderdale / Broward
  '334': [27.95, -82.46],   // Tampa
  '335': [27.95, -82.46],   // Tampa
  '336': [30.33, -81.66],   // Jacksonville
  '337': [30.44, -84.28],   // Tallahassee
  '338': [26.64, -81.87],   // Fort Myers
  '339': [26.64, -81.87],   // Fort Myers
  '340': [18.35, -64.93],   // USVI
  '100': [40.71, -74.01],   // NYC
  '101': [40.71, -74.01],
  '104': [40.71, -74.01],
  '110': [40.71, -74.01],
  '112': [40.71, -74.01],   // Brooklyn
  '303': [33.75, -84.39],   // Atlanta
  '304': [33.75, -84.39],
  '200': [38.91, -77.04],   // DC
  '770': [29.76, -95.37],   // Houston
  '750': [32.78, -96.80],   // Dallas
  '606': [41.88, -87.63],   // Chicago
  '900': [34.05, -118.24],  // LA
}

function estimateCoordsFromZip(zip: string): [number, number] | null {
  const prefix = zip.substring(0, 3)
  return ZIP_PREFIX_COORDS[prefix] || null
}

// ─── Component ────────────────────────────────────────────────

export default function FindUsClient({
  locations,
}: {
  locations: RetailLocation[]
}) {
  const [zipCode, setZipCode] = useState('')
  const [activeFilter, setActiveFilter] = useState<LocationCategory | 'all'>('all')
  const [searchCoords, setSearchCoords] = useState<[number, number] | null>(null)
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Unique categories present in data
  const categories = useMemo(() => {
    const cats = new Set(locations.map((l) => l.category))
    return Array.from(cats) as LocationCategory[]
  }, [locations])

  // Filter + sort locations
  const displayLocations = useMemo(() => {
    let filtered = locations
    if (activeFilter !== 'all') {
      filtered = filtered.filter((l) => l.category === activeFilter)
    }

    if (searchCoords) {
      // Sort by distance
      return filtered
        .map((loc) => {
          const dist = loc.coordinates
            ? haversine(searchCoords[0], searchCoords[1], loc.coordinates.lat, loc.coordinates.lng)
            : 9999
          return { ...loc, distance: dist }
        })
        .sort((a, b) => a.distance - b.distance)
    }

    return filtered.map((loc) => ({ ...loc, distance: undefined as number | undefined }))
  }, [locations, activeFilter, searchCoords])

  function handleZipSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchError('')
    setHasSearched(true)

    const cleaned = zipCode.trim()
    if (!/^\d{5}$/.test(cleaned)) {
      setSearchError('Please enter a valid 5-digit zip code.')
      setSearchCoords(null)
      return
    }

    const coords = estimateCoordsFromZip(cleaned)
    if (coords) {
      setSearchCoords(coords)
    } else {
      // Still show results but can't sort by distance
      setSearchCoords(null)
      setSearchError('')
    }
  }

  function clearSearch() {
    setZipCode('')
    setSearchCoords(null)
    setSearchError('')
    setHasSearched(false)
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/story/hero.jpg"
          alt="Jerk skewers on a flaming grill"
          fill
          priority
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center relative z-10">
          <p className="text-brand-gold font-semibold tracking-widest text-sm uppercase mb-4">
            Where to Buy
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Find Our Sauce Near You
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            From grocery shelves to restaurant tables — discover where to get
            Jamaica House Brand authentic jerk sauce in your neighborhood.
          </p>
        </div>
      </section>

      {/* Gold accent strip */}
      <div className="bg-brand-gold py-2.5 overflow-hidden">
        <p className="text-brand-dark text-xs sm:text-sm font-bold tracking-widest text-center whitespace-nowrap">
          AVAILABLE IN STORES · RESTAURANTS · FARMERS MARKETS · ONLINE AT JAMAICAHOUSEBRAND.COM
        </p>
      </div>

      {/* ── Zip Code Finder ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-brand-gold/20 bg-gradient-to-b from-brand-green/30 to-brand-dark p-6 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Search by Zip Code
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Enter your zip code and we&apos;ll show you the closest locations
            carrying our sauces.
          </p>

          <form
            onSubmit={handleZipSearch}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
          >
            <div className="relative w-full sm:w-auto sm:flex-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter zip code"
                className="w-full rounded-lg border border-brand-gold/30 bg-brand-dark px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-center sm:text-left"
              />
              {zipCode && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-gold text-brand-dark font-semibold hover:bg-brand-gold-light transition-colors"
            >
              Find Locations
            </button>
          </form>

          {searchError && (
            <p className="text-red-400 text-sm mt-3">{searchError}</p>
          )}

          {searchCoords && !searchError && (
            <p className="text-brand-gold text-sm mt-3">
              Showing locations sorted by distance from {zipCode}
            </p>
          )}
        </div>
      </section>

      {/* ── Category Filters ────────────────────────────────── */}
      {categories.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === 'all'
                  ? 'bg-brand-gold text-brand-dark border-brand-gold'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-brand-gold/40 hover:text-white'
              }`}
            >
              All Locations
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeFilter === cat
                    ? 'bg-brand-gold text-brand-dark border-brand-gold'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-brand-gold/40 hover:text-white'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Location Cards ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {displayLocations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No locations found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We&apos;re expanding fast! Don&apos;t see a store near you?
              Scroll down to request one — we&apos;d love to bring JHB to your area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                distance={location.distance}
              />
            ))}
          </div>
        )}

        {displayLocations.length > 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            Showing {displayLocations.length} location{displayLocations.length !== 1 ? 's' : ''}
          </p>
        )}
      </section>

      {/* ── Can't Find Us? / Inquiry ────────────────────────── */}
      <StoreRequestSection />

      {/* ── Shop Online CTA ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-16 sm:pb-24">
        <div className="rounded-2xl bg-brand-green p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Can&apos;t Make It to a Store?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Order directly from us and get authentic jerk sauce delivered to
            your door. Free shipping on orders over $50.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark px-8 py-3 rounded-lg font-semibold hover:bg-brand-gold-light transition-colors"
          >
            Shop Online
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  )
}

// ─── Location Card ──────────────────────────────────────────────

function LocationCard({
  location,
  distance,
}: {
  location: RetailLocation
  distance?: number
}) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${location.address}, ${location.city}, ${location.state} ${location.zip}`
  )}`

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-brand-gold/40 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg leading-tight group-hover:text-brand-gold transition-colors">
            {location.name}
          </h3>
          <span
            className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              categoryColors[location.category]
            }`}
          >
            {categoryLabels[location.category]}
          </span>
        </div>
        {location.isNew && (
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-brand-gold text-brand-dark text-xs font-bold uppercase tracking-wide">
            New
          </span>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-gray-400 text-sm mb-1">
        <svg className="w-4 h-4 mt-0.5 shrink-0 text-brand-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <div>
          <p>{location.address}</p>
          <p>{location.city}, {location.state} {location.zip}</p>
        </div>
      </div>

      {/* Phone */}
      {location.phone && (
        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
          <svg className="w-4 h-4 shrink-0 text-brand-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          <a href={`tel:${location.phone}`} className="hover:text-brand-gold transition-colors">
            {location.phone}
          </a>
        </div>
      )}

      {/* Distance badge */}
      {distance !== undefined && distance < 9000 && (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            ~{Math.round(distance)} miles away
          </span>
        </div>
      )}

      {/* Products carried */}
      {location.products && location.products.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {location.products.map((product) => (
            <span
              key={product}
              className="px-2 py-0.5 rounded-full bg-white/5 text-gray-400 text-xs border border-white/5"
            >
              {product}
            </span>
          ))}
        </div>
      )}

      {/* Spacer + actions */}
      <div className="flex-1" />
      <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold text-brand-dark text-sm font-semibold hover:bg-brand-gold-light transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Directions
        </a>
        {location.phone && (
          <a
            href={`tel:${location.phone}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-brand-gold/30 text-brand-gold text-sm font-medium hover:bg-brand-gold/10 transition-colors"
            aria-label={`Call ${location.name}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Store Request / Inquiry Section ────────────────────────────

function StoreRequestSection() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/store-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          zipCode: formData.get('requestZip'),
          storeName: formData.get('storeName'),
          message: formData.get('message'),
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        form.reset()
      }
    } catch {
      // Silently handle - form stays visible for retry
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-brand-gold/20 bg-brand-dark p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Don&apos;t See a Store Near You?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            We&apos;re growing every month. Tell us where you&apos;d like to see
            Jamaica House Brand and we&apos;ll work to make it happen.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Request Received!
            </h3>
            <p className="text-gray-400">
              Thanks for letting us know. We&apos;ll reach out to stores in your
              area and keep you updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="First & last name"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="requestZip" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Zip Code
                </label>
                <input
                  id="requestZip"
                  name="requestZip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  required
                  placeholder="33025"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                />
              </div>
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-300 mb-1">
                  Suggested Store <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  placeholder="e.g., Publix on Main St"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Message <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                placeholder="Anything else you'd like us to know..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-brand-gold text-brand-dark font-semibold hover:bg-brand-gold-light transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Request This Area'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

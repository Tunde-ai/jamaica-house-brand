'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CateringHero() {
  const scrollToForm = () => {
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative py-32 md:py-40 px-4 text-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/story/catering-hero.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-dark" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <span className="inline-block text-brand-gold text-sm font-semibold tracking-widest uppercase mb-4">
          Catering Services
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Bring the <span className="text-brand-gold">Island Flavor</span> to Your Event
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          From intimate gatherings to large-scale events, Jamaica House delivers authentic
          Caribbean cuisine that turns any occasion into a celebration. 30+ years of restaurant
          heritage, now at your venue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={scrollToForm}
            className="bg-brand-gold text-brand-dark font-bold px-8 py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg"
          >
            Get Your Custom Quote
          </button>
          <Link
            href="/catering-menu"
            className="border-2 border-brand-gold text-brand-gold font-bold px-8 py-4 rounded-lg hover:bg-brand-gold/10 transition-colors text-lg inline-flex items-center justify-center gap-2 group"
          >
            <span>Order by the Tray</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

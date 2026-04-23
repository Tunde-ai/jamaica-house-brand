'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CateringMenuHero() {
  const scrollToForm = () => {
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative py-32 md:py-40 px-4 text-center overflow-hidden">
      {/* Background Image - using a catering/food spread image */}
      <Image
        src="/images/story/catering-hero.jpg"
        alt="Jamaican food spread with jerk chicken and sides"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/60 to-brand-dark/80" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <span className="inline-block text-brand-gold text-sm font-semibold tracking-widest uppercase mb-4">
          Order by the Tray
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Feed Your Crowd, <span className="text-brand-gold">Jamaica Style</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          Authentic Jamaican flavors for any gathering. From backyard parties to corporate events,
          our tray catering brings 30+ years of restaurant heritage straight to your table.
          Small trays serve 15, large trays serve 35-40.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={scrollToForm}
            className="bg-brand-gold text-brand-dark font-bold px-8 py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg min-w-[200px]"
          >
            Order Your Trays
          </button>
          <Link
            href="/catering-services"
            className="border-2 border-brand-gold text-brand-gold font-bold px-8 py-4 rounded-lg hover:bg-brand-gold/10 transition-colors text-lg min-w-[200px]"
          >
            Full Service Catering
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-gold">15+</div>
            <div className="text-sm text-gray-400">Small Tray Serves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-gold">35-40</div>
            <div className="text-sm text-gray-400">Large Tray Serves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-gold">Free</div>
            <div className="text-sm text-gray-400">Pickup Always</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-gold">7 Day</div>
            <div className="text-sm text-gray-400">Notice Required</div>
          </div>
        </div>
      </div>
    </section>
  )
}
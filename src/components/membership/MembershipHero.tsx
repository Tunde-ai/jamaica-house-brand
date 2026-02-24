'use client'

import Image from 'next/image'

export default function MembershipHero() {
  return (
    <section className="relative py-32 md:py-40 px-4 text-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/story/family-hero.jpg"
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
          Yearly Subscription
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          JOIN THE <span className="text-brand-gold">FLAVOR FAMILY</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-6">
          Get authentic Jamaica House sauces delivered to your door quarterly.
          Pay once a year, receive 4 shipments, and never run out of flavor.
        </p>

        {/* Use cases */}
        <div className="flex justify-center gap-3 md:gap-6 mb-4">
          {['Marinating', 'Grilling', 'Dipping'].map((use, idx) => (
            <span key={use} className="flex items-center text-white text-lg md:text-2xl font-bold tracking-wide uppercase">
              {use}
              {idx < 2 && <span className="ml-3 md:ml-6 text-brand-gold">—</span>}
            </span>
          ))}
        </div>

        {/* Health callouts */}
        <div className="flex justify-center gap-4 md:gap-8 mb-10">
          <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-semibold px-4 py-1.5 rounded-full">
            Low Sodium
          </span>
          <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-semibold px-4 py-1.5 rounded-full">
            Zero Calories
          </span>
        </div>

        {/* Perks banner */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {[
            'Exclusive Members-Only Pricing',
            'FREE Shipping Always',
            'Special Edition Access',
          ].map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-gray-300">
              <svg className="w-5 h-5 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

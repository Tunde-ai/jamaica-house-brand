'use client'

import { useInView } from 'react-intersection-observer'
import { pricingTiers } from '@/data/catering'

export default function PricingTable() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Pricing based on guest count. Larger events get better rates. All packages include setup,
            serving staff, and cleanup.
          </p>
        </div>

        <div
          className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Table header */}
          <div className="grid grid-cols-3 bg-brand-gold/10 border-b border-white/10 px-6 py-4">
            <span className="text-brand-gold font-semibold">Guest Count</span>
            <span className="text-brand-gold font-semibold text-center">Per Person</span>
            <span className="text-brand-gold font-semibold text-right">Includes</span>
          </div>

          {/* Table rows */}
          {pricingTiers.map((tier, idx) => (
            <div
              key={tier.guestRange}
              className={`grid grid-cols-3 px-6 py-4 items-center transition-all duration-500 ${
                idx < pricingTiers.length - 1 ? 'border-b border-white/5' : ''
              } ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
              style={{ transitionDelay: `${300 + idx * 100}ms` }}
            >
              <span className="text-white font-medium">{tier.guestRange} guests</span>
              <span className="text-white text-center text-lg font-bold">
                ${tier.pricePerPerson}
              </span>
              <span className="text-gray-400 text-sm text-right">{tier.includes}</span>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm text-center mt-6">
          * Prices may vary based on menu selection and event specifics. Contact us for a custom quote.
        </p>
      </div>
    </section>
  )
}

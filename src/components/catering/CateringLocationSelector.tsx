'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CateringLocationSelector() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-brand-dark to-black/90">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Catering Experience
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Whether you're planning a large event or craving authentic street food,
            we have the perfect catering solution for your location and needs.
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* South Florida - Traditional Catering */}
          <div
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform ${
              hoveredCard === 'florida' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
            onMouseEnter={() => setHoveredCard('florida')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80 z-10" />
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/images/catering-tray-spread.jpg)', // Add actual image
                  backgroundPosition: 'center center',
                }}
              />
            </div>

            <div className="relative z-20 p-8 min-h-[400px] flex flex-col justify-between">
              {/* Location Badge */}
              <div className="mb-4">
                <span className="inline-block bg-brand-gold text-black px-4 py-2 rounded-full font-bold text-sm">
                  🌴 SOUTH FLORIDA
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Traditional Catering
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Full-service catering with authentic Jamaican trays. Perfect for large events,
                  weddings, corporate functions, and celebrations. Professional setup and
                  serving included.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    <span className="text-gray-300 text-sm">Large tray servings (15-40 people)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    <span className="text-gray-300 text-sm">Full menu: Jerk chicken, curry goat, oxtail & more</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    <span className="text-gray-300 text-sm">35-mile delivery radius from South Florida</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                    <span className="text-gray-300 text-sm">Professional setup & serving utensils</span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="text-brand-gold font-bold text-lg">$75 - $290 per tray</div>
                  <div className="text-gray-400 text-sm">Based on tray size and protein choice</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href="/catering-menu"
                  className="block w-full text-center py-3 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors"
                >
                  Order Tray Catering
                </Link>
                <Link
                  href="#traditional-catering"
                  className="block w-full text-center py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-black transition-colors"
                >
                  Get Custom Quote
                </Link>
              </div>
            </div>
          </div>

          {/* Atlanta - Street Series */}
          <div
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform ${
              hoveredCard === 'atlanta' ? 'scale-105' : 'hover:scale-[1.02]'
            }`}
            onMouseEnter={() => setHoveredCard('atlanta')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 via-black/60 to-black/90 z-10" />
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/images/street-food-plate.jpg)', // Add actual image
                  backgroundPosition: 'center center',
                }}
              />
            </div>

            <div className="relative z-20 p-8 min-h-[400px] flex flex-col justify-between">
              {/* Location Badge */}
              <div className="mb-4">
                <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                  🍑 ATLANTA STREET SERIES
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Street Food Plates
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Individual meal plates with authentic Jamaican street food vibes.
                  Perfect for smaller groups, casual events, and pre-orders.
                  Fresh, made-to-order plates.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-300 text-sm">Individual meal plates ($15-$28 each)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-300 text-sm">Jerk chicken, ribs, sausage, steaks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-300 text-sm">30-mile delivery radius from Atlanta</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-300 text-sm">Pickup & delivery options available</span>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <div className="text-red-400 font-bold text-lg">$15 - $28 per plate</div>
                  <div className="text-gray-400 text-sm">$50 minimum order • $15 delivery fee</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href="/catering-services/atlanta-street-series"
                  className="block w-full text-center py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Order Street Series
                </Link>
                <Link
                  href="#atlanta-info"
                  className="block w-full text-center py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-black transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Help Section */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-3">Not Sure Which Option?</h3>
          <p className="text-gray-400 mb-4">
            Our team is here to help you choose the perfect catering solution for your event.
          </p>
          <a
            href="tel:(786) 709-1027"
            className="inline-flex items-center gap-2 bg-white/10 border border-brand-gold/30 text-brand-gold px-6 py-3 rounded-lg hover:bg-brand-gold/20 transition-colors font-medium"
          >
            📞 Call us at (786) 709-1027
          </a>
        </div>
      </div>
    </section>
  )
}
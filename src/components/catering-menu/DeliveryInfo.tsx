'use client'

import { useInView } from 'react-intersection-observer'
import { deliveryTiers } from '@/data/catering-menu'

export default function DeliveryInfo() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section ref={ref} className="py-20 px-4 bg-brand-dark">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Delivery & Pickup
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            Delivery Information
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose pickup (always free) or delivery with transparent pricing based on distance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Delivery Pricing Table */}
          <div
            className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="bg-brand-gold/10 border-b border-white/10 px-6 py-4">
              <h3 className="text-brand-gold font-semibold text-lg">Delivery Zones</h3>
            </div>

            <div className="divide-y divide-white/5">
              {deliveryTiers.map((tier, index) => (
                <div
                  key={tier.distance}
                  className={`px-6 py-6 flex justify-between items-center transition-all duration-500 ${
                    inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="text-white font-medium text-lg">{tier.distance}</div>
                    {tier.freeThreshold && (
                      <div className="text-gray-400 text-sm">
                        Free on orders $250+
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">
                      {tier.fee === 0 ? 'FREE' : `$${tier.fee}`}
                    </div>
                    {tier.freeThreshold && tier.fee > 0 && (
                      <div className="text-gray-500 text-sm">delivery fee</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-white/5">
              <p className="text-gray-400 text-sm">
                Select your event location above to see delivery options and pricing
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div
            className={`space-y-8 transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {/* Pickup Info */}
            <div className="bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 border border-brand-gold/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📍</div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Free Pickup Always</h4>
                  <p className="text-gray-300 mb-3">
                    Save on delivery fees by picking up your order at our Miami Gardens location.
                    We'll have everything ready and packed for easy transport.
                  </p>
                  <div className="text-sm text-gray-400">
                    <strong>Pickup Location:</strong><br />
                    Jamaica House Miami Gardens<br />
                    (Address provided with order confirmation)
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Features */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                Delivery Features
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-brand-gold text-lg">✓</span>
                  <span>Insulated transport bags to keep food hot</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-gold text-lg">✓</span>
                  <span>Setup assistance for large orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-gold text-lg">✓</span>
                  <span>All serving utensils included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-gold text-lg">✓</span>
                  <span>Delivery time window provided</span>
                </li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-3">Important Notes</h5>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• All orders require 7-day advance notice</li>
                <li>• Delivery fee charged per order, not per tray</li>
                <li>• Large orders (10+ trays) may include complimentary setup</li>
                <li>• Contact us for deliveries beyond 35 miles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
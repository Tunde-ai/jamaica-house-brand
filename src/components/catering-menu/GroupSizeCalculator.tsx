'use client'

import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { calculateTrayRecommendation } from '@/data/catering-menu'

export default function GroupSizeCalculator() {
  const [guestCount, setGuestCount] = useState('')
  const [recommendation, setRecommendation] = useState<ReturnType<typeof calculateTrayRecommendation> | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const handleCalculate = () => {
    const count = parseInt(guestCount)
    if (isNaN(count) || count <= 0) {
      alert('Please enter a valid number of guests')
      return
    }

    const result = calculateTrayRecommendation(count)
    setRecommendation(result)
    setShowResults(true)

    // Scroll to results
    setTimeout(() => {
      document.getElementById('calculator-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 100)
  }

  const handleReset = () => {
    setGuestCount('')
    setRecommendation(null)
    setShowResults(false)
  }

  return (
    <section ref={ref} className="py-20 px-4 bg-brand-dark">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Group Size Calculator
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            How Many Trays Do I Need?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Enter your guest count and we'll recommend the perfect number of trays for your event
          </p>
        </div>

        {/* Calculator Input */}
        <div
          className={`bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-6 items-end justify-center">
            <div className="flex-1 max-w-xs">
              <label htmlFor="guest-count" className="block text-white font-medium mb-3">
                Number of Guests
              </label>
              <input
                type="number"
                id="guest-count"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="Enter guest count"
                min="1"
                max="1000"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                disabled={!guestCount}
                className="bg-brand-gold text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              {showResults && (
                <button
                  onClick={handleReset}
                  className="border border-brand-gold text-brand-gold font-medium px-6 py-3 rounded-lg hover:bg-brand-gold/10 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {showResults && recommendation && (
          <div
            id="calculator-results"
            className="bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 border border-brand-gold/20 rounded-2xl p-8 transition-all duration-700 opacity-100 translate-y-0"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Recommendation for {guestCount} Guests
              </h3>
              {recommendation.note && (
                <p className="text-brand-gold font-medium">{recommendation.note}</p>
              )}
            </div>

            {recommendation.proteins === 0 && recommendation.starches === 0 && recommendation.sides === 0 ? (
              // Special case for under 15 guests
              <div className="text-center">
                <div className="bg-brand-gold/20 border border-brand-gold/40 rounded-lg p-6 mb-6">
                  <h4 className="text-brand-gold font-bold text-lg mb-2">
                    Individual Portions Recommended
                  </h4>
                  <p className="text-gray-300">
                    For gatherings under 15 people, we recommend ordering individual portions
                    instead of full trays to avoid waste and get better value.
                  </p>
                </div>
                <button
                  onClick={() => window.open('tel:+17867091027', '_self')}
                  className="bg-brand-gold text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors"
                >
                  Call Us: (786) 709-1027
                </button>
              </div>
            ) : (
              // Standard recommendations
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🍗</div>
                  <h4 className="text-white font-bold text-xl mb-2">Proteins</h4>
                  <div className="text-3xl font-bold text-brand-gold mb-2">
                    {recommendation.proteins}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Large trays recommended
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🍚</div>
                  <h4 className="text-white font-bold text-xl mb-2">Starches</h4>
                  <div className="text-3xl font-bold text-brand-gold mb-2">
                    {recommendation.starches}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Large trays recommended
                  </p>
                </div>

                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🥬</div>
                  <h4 className="text-white font-bold text-xl mb-2">Sides</h4>
                  <div className="text-3xl font-bold text-brand-gold mb-2">
                    {recommendation.sides}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Large trays recommended
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 text-sm text-center">
                💡 <strong>Pro Tip:</strong> This is a general recommendation.
                Consider your guests' appetites, event duration, and whether you're serving appetizers or desserts.
                For custom recommendations, use our quote form below.
              </p>
            </div>

            {/* CTA to Form */}
            <div className="text-center mt-8">
              <button
                onClick={() =>
                  document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-brand-gold text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors"
              >
                Request Your Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
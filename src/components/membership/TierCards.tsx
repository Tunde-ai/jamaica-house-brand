'use client'

import { membershipTiers } from '@/data/membership'

interface TierCardsProps {
  onSelectTier: (tierId: string) => void
}

export default function TierCards({ onSelectTier }: TierCardsProps) {
  const handleSelect = (tierId: string) => {
    onSelectTier(tierId)
    document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Choose Your Plan
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Pick the Plan That Fits Your Flavor
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {membershipTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white/5 border rounded-2xl p-8 flex flex-col ${
                tier.highlight
                  ? 'border-brand-gold shadow-lg shadow-brand-gold/10'
                  : 'border-white/10'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-dark text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-brand-gold">${tier.price}</span>
                <span className="text-gray-400">/{tier.interval}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    {feature.included ? (
                      <svg className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSelect(tier.id)}
                className={`w-full font-bold py-4 rounded-lg transition-colors text-lg ${
                  tier.highlight
                    ? 'bg-brand-gold text-brand-dark hover:bg-brand-gold-light'
                    : 'border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark'
                }`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

export default function MembershipHero() {
  return (
    <section className="relative py-24 px-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/95 to-brand-dark" />

      <div className="relative max-w-4xl mx-auto">
        <span className="inline-block text-brand-gold text-sm font-semibold tracking-widest uppercase mb-4">
          Monthly Subscription
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          JOIN THE <span className="text-brand-gold">FLAVOR FAMILY</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Get authentic Jamaica House sauces delivered to your door every month.
          Save money, never run out, and enjoy exclusive member perks.
        </p>

        {/* Perks banner */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {[
            'Free Shipping',
            'Cancel Anytime',
            'Exclusive Recipes',
            'Member Discounts',
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

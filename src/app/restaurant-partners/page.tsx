import type { Metadata } from 'next'
import RestaurantOrderForm from './RestaurantOrderForm'

export const metadata: Metadata = {
  title: 'Wholesale Partners | Jamaica House Brand',
  description:
    'Wholesale pricing for restaurants. Authentic Jamaican Jerk Sauce — 1-gallon BOH format or 5oz table bottles. 30+ years of Caribbean heritage.',
}

export default function RestaurantPartnersPage() {
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero */}
      <section className="relative bg-brand-green overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center relative z-10">
          <p className="text-brand-gold font-semibold tracking-widest text-sm uppercase mb-4">
            Wholesale Partner Program
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Bring the Caribbean to Your Kitchen
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            30+ years of Caribbean heritage in every bottle. Wholesale pricing for restaurants, caterers, and food service.
          </p>

          {/* Intro badge */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-gold flex flex-col items-center justify-center text-brand-dark shadow-lg">
            <span className="text-xs font-bold uppercase leading-tight">3-Month</span>
            <span className="text-sm sm:text-base font-extrabold leading-tight">Intro</span>
            <span className="text-xs font-bold uppercase leading-tight">Pricing</span>
          </div>
        </div>
      </section>

      {/* Gold accent strip */}
      <div className="bg-brand-gold py-2.5 overflow-hidden">
        <p className="text-brand-dark text-xs sm:text-sm font-bold tracking-widest text-center whitespace-nowrap">
          SCOTCH BONNET · ALLSPICE · THYME · ZERO CALORIES · LOW SODIUM · ALL NATURAL
        </p>
      </div>

      {/* Two-column promo */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BOH */}
          <div className="rounded-2xl bg-brand-green p-8 text-white">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-2">Back of House</p>
            <h2 className="text-3xl font-bold mb-1">Kitchen</h2>
            <p className="text-4xl font-extrabold text-brand-gold mb-6">
              1 Gallon = $65 <span className="text-base font-normal text-white/60">(intro)</span>
            </p>
            <p className="text-sm text-brand-gold font-semibold mb-4">✓ Includes Free Shipping</p>
            <ul className="space-y-3 text-white/90">
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">→</span>
                Marinades, glazes, wings — one jug covers a full weekend service
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">→</span>
                Batch cocktail spice — Jerk Margaritas, Rum Punch
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-0.5">→</span>
                Burger &amp; sandwich spreads customers ask about
              </li>
            </ul>
          </div>

          {/* FOH */}
          <div className="rounded-2xl bg-brand-gold p-8 text-brand-dark">
            <p className="font-semibold text-sm uppercase tracking-wider mb-2 text-brand-dark/70">Front of House</p>
            <h2 className="text-3xl font-bold mb-1">Table</h2>
            <p className="text-4xl font-extrabold mb-6">
              Case 12×5oz = $75
            </p>
            <p className="text-sm font-semibold mb-4 text-brand-dark/70">✓ Includes Free Shipping</p>
            <ul className="space-y-3 text-brand-dark/90">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">→</span>
                Branded table bottles your guests take home
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">→</span>
                Zero calories / low sodium — dietary-friendly condiment
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">→</span>
                Tell the 30-year family recipe story at every table
              </li>
            </ul>
          </div>
        </div>

        {/* Ingredient pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {[
            '🌶 Scotch Bonnet',
            '🌿 Allspice',
            '🌱 Thyme',
            '⚡ Sweet Heat',
            '✅ Zero Calories',
            '🔬 Low Sodium',
            '🚫 No Artificial Preservatives',
          ].map((pill) => (
            <span
              key={pill}
              className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs sm:text-sm font-medium border border-white/10"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* Escovitch Picklez Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-2xl bg-gradient-to-r from-brand-green to-brand-green/80 p-8 sm:p-12 text-white">
          <div className="text-center mb-8">
            <p className="text-brand-gold font-semibold text-sm uppercase tracking-wider mb-2">Caribbean Probiotic</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Escovitch Picklez</h2>
            <p className="text-4xl font-extrabold text-brand-gold mb-2">
              Case 12×12oz = $75 <span className="text-base font-normal text-white/80">includes shipping</span>
            </p>
            <p className="text-white/90 max-w-2xl mx-auto">
              Traditional Caribbean fermented vegetables — the perfect probiotic condiment for gut health and authentic flavor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredients & Benefits */}
            <div>
              <h3 className="text-xl font-bold text-brand-gold mb-4">What&apos;s Inside</h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🥕</span>
                  <strong>Carrots:</strong> Natural sweetness and beta-carotene
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🥬</span>
                  <strong>Cabbage:</strong> Crunchy texture and vitamin C
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🌶️</span>
                  <strong>Scotch Bonnet Peppers:</strong> Authentic Caribbean heat
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🍋</span>
                  <strong>Vinegar-Fermented:</strong> Natural preservation & probiotics
                </li>
              </ul>
            </div>

            {/* Restaurant Benefits */}
            <div>
              <h3 className="text-xl font-bold text-brand-gold mb-4">Restaurant Benefits</h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🦠</span>
                  <strong>Excellent Probiotic:</strong> Live cultures for gut health
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🥘</span>
                  <strong>Cuts Rich Dishes:</strong> Acidity balances heavy foods
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">📦</span>
                  <strong>Shelf-Stable:</strong> Long-lasting refrigerated storage
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-gold mt-0.5">🌟</span>
                  <strong>Authentic Caribbean:</strong> Traditional Escovitch recipe
                </li>
              </ul>
            </div>
          </div>

          {/* Usage Ideas */}
          <div className="mt-8 p-6 bg-black/20 rounded-lg">
            <h4 className="text-lg font-bold text-brand-gold mb-3">Perfect With:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Fried Fish',
                'Jerk Chicken',
                'Rice & Peas',
                'Curry Dishes',
                'Grilled Meats',
                'Tacos & Wraps',
                'Caribbean Platters'
              ].map((dish) => (
                <span
                  key={dish}
                  className="px-3 py-1.5 rounded-full bg-brand-gold/20 text-brand-gold text-sm font-medium"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="max-w-4xl mx-auto px-4 pb-16 sm:pb-24">
        <div className="rounded-2xl border border-brand-gold/20 bg-brand-dark p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
            Place Your Order
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Fill out the form below and we&apos;ll confirm within 1 business day.
          </p>
          <RestaurantOrderForm />
        </div>
      </section>
    </div>
  )
}

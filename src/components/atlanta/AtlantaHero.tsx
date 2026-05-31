'use client'

export default function AtlantaHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 z-10" />
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/jerk-chicken-plate.jpg)', // Add actual image
            backgroundPosition: 'center center',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        {/* Street Series Logo/Title */}
        <div className="mb-6">
          <div className="inline-block">
            <h1 className="text-6xl md:text-8xl font-bold text-brand-gold mb-2 tracking-wider">
              JAMAICA HOUSE
            </h1>
            <div className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-widest">
              STREET SERIES
            </div>
            <div className="text-lg md:text-xl text-brand-gold font-medium tracking-widest">
              ATLANTA
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <p className="text-xl md:text-2xl text-white font-medium mb-2">
            FRESH FLAVORS • STREET STYLE • MADE WITH LOVE
          </p>
          <p className="text-lg text-gray-300">
            Authentic Jamaican street food delivered to your door in Atlanta
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors text-lg"
          >
            Order Now
          </button>
          <button
            onClick={() => document.getElementById('service-area')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-black transition-colors text-lg"
          >
            Check Service Area
          </button>
        </div>

        {/* Quick Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-brand-gold/20">
            <div className="text-2xl font-bold text-brand-gold">30 Mile</div>
            <div className="text-white">Delivery Radius</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-brand-gold/20">
            <div className="text-2xl font-bold text-brand-gold">$15</div>
            <div className="text-white">Delivery Fee</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-brand-gold/20">
            <div className="text-2xl font-bold text-brand-gold">$50</div>
            <div className="text-white">Minimum Order</div>
          </div>
        </div>
      </div>
    </section>
  )
}
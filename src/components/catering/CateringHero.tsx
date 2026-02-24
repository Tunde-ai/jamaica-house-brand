'use client'

export default function CateringHero() {
  const scrollToForm = () => {
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative py-24 px-4 text-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/95 to-brand-dark" />

      <div className="relative max-w-4xl mx-auto">
        <span className="inline-block text-brand-gold text-sm font-semibold tracking-widest uppercase mb-4">
          Catering Services
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Bring the <span className="text-brand-gold">Island Flavor</span> to Your Event
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          From intimate gatherings to large-scale events, Jamaica House delivers authentic
          Caribbean cuisine that turns any occasion into a celebration. 30+ years of restaurant
          heritage, now at your venue.
        </p>
        <button
          type="button"
          onClick={scrollToForm}
          className="bg-brand-gold text-brand-dark font-bold px-8 py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg"
        >
          Get Your Custom Quote
        </button>
      </div>
    </section>
  )
}

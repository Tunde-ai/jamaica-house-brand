import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden isolate bg-black z-10">
      {/* Full-bleed background image */}
      <Image
        src="/images/story/hero-landing.jpg"
        alt="Jamaica House Brand Jerk Sauce — Taste 100 Years of Jamaica in Every Bite"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top z-0"
      />
      {/* Gradient overlay — transparent top, dark bottom */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.85) 100%)'
      }} />

      {/* Content anchored to bottom */}
      <div className="relative z-[2] w-full max-w-3xl mx-auto text-center px-4 sm:px-6 pb-10 pt-6">
        {/* Heritage badge */}
        <span className="inline-block bg-brand-gold text-brand-dark text-xs sm:text-sm font-bold uppercase tracking-[0.1em] px-4 py-2 mb-4">
          100-Year Family Recipe
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
          Taste 100 Years of Jamaica<br className="hidden sm:block" /> in Every Bite
        </h1>

        <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto mb-6 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
          Handcrafted from a 100-year family recipe and perfected over 30+ years in our family-owned Jamaica House restaurant chain. Now bottled for your kitchen.
        </p>

        {/* Marinate / Grill / Dip */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8 flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-sm sm:text-base uppercase tracking-[0.1em]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Marinate</span>
            <span className="text-white/70 text-xs max-w-[140px] leading-snug">Deep, bold island flavor for chicken, pork & seafood</span>
          </div>
          <div className="w-0.5 h-10 bg-brand-gold hidden sm:block" aria-hidden="true" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-sm sm:text-base uppercase tracking-[0.1em]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Grill</span>
            <span className="text-white/70 text-xs max-w-[140px] leading-snug">Brush on for caramelized, smoky jerk perfection</span>
          </div>
          <div className="w-0.5 h-10 bg-brand-gold hidden sm:block" aria-hidden="true" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-sm sm:text-base uppercase tracking-[0.1em]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Dip</span>
            <span className="text-white/70 text-xs max-w-[140px] leading-snug">Serve as a table sauce with wings, fries & more</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-block bg-brand-gold text-white font-semibold text-base px-8 py-3.5 hover:bg-brand-gold-dark transition-colors w-full sm:w-auto text-center"
          >
            Order Now
          </Link>
          <a
            href="#products"
            className="inline-block border-2 border-white text-white font-semibold text-base px-8 py-3.5 hover:bg-white hover:text-brand-dark transition-colors w-full sm:w-auto text-center"
          >
            View Products
          </a>
        </div>
      </div>
    </section>
  )
}

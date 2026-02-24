import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background lifestyle photo */}
      <Image
        src="/images/story/hero.jpg"
        alt="Jamaican jerk grilling"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            {/* Full-color logo */}
            <Image
              src="/images/branding/logo-full.jpg"
              alt="Jamaica House Brand"
              width={80}
              height={80}
              className="rounded-sm mb-6"
            />

            <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-4">
              Since 1994
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              30 Years of Flavor.{' '}
              <span className="text-brand-gold">One Legendary Sauce.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-lg mb-8">
              Authentic Jamaican Jerk Sauce — The Family Recipe, Now on Every Table
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-block bg-brand-gold text-brand-dark font-bold text-lg px-10 py-4 rounded-lg hover:bg-brand-gold-light transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/our-story"
                className="inline-block border-2 border-brand-gold text-brand-gold font-bold text-lg px-10 py-4 rounded-lg hover:bg-brand-gold/10 transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>

          {/* Right — Product group shot (desktop only) */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <Image
                src="/images/products/product-group.jpg"
                alt="Jamaica House Brand product collection"
                fill
                sizes="(max-width: 1024px) 0vw, 400px"
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

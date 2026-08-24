import Link from 'next/link'

export default function OrderDirect() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left — Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Order Direct
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Experience authentic Jamaican heritage delivered to your door.
              Order directly from our website or through Amazon for nationwide shipping.
            </p>

            <div className="inline-block bg-brand-gold text-white font-bold tracking-[0.1em] px-4 py-2.5 my-4">
              <strong>WELCOME10</strong> — Save 10% on your first order
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mt-4">
              <span className="text-brand-gold font-bold">Wholesale & bulk orders?</span>{' '}
              We offer competitive wholesale pricing with flexible terms for restaurants, retailers, and distributors.{' '}
              <Link
                href="/wholesale-partners"
                className="text-brand-gold underline hover:text-brand-gold-light transition-colors"
              >
                Learn about wholesale partnerships.
              </Link>
            </p>
          </div>

          {/* Right — CTAs */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Order Now</h3>

            <div className="space-y-4">
              <Link
                href="/shop"
                className="block bg-brand-gold text-white font-semibold text-lg px-8 py-4 text-center hover:bg-brand-gold-dark transition-colors"
              >
                Order from Our Website
              </Link>

              <a
                href="https://www.amazon.com/dp/B0D915BFRN"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-brand-dark text-white border-2 border-white/20 font-semibold text-lg px-8 py-4 text-center hover:border-brand-gold hover:text-brand-gold transition-colors"
              >
                Order on Amazon
              </a>
            </div>

            <p className="text-gray-500 text-sm text-center mt-6">
              Secure checkout &bull; Fast shipping &bull; Family business guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

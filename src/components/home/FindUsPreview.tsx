import Link from 'next/link'

const restaurants = [
  'Chalkboard Wings & BBQ',
  'The Trading Post',
  "Grumpy Gary's at Dockers",
  'Oleta River Grill',
  'La Catrachita of Miami',
]

const retailers = [
  'Flow Grocer Miami',
  'My Market & Deli',
  'Caribbean Best Market',
  'La Madame Caribbean Market',
  'FA&M West Indian & American Grocery',
  'Heritage Halal Market',
  'Marina Blue Mini Mart',
  'Wells Market Bayparc',
]

export default function FindUsPreview() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Find Us Near You
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Available at restaurants and retail locations across South Florida, plus nationwide on Amazon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-3xl mx-auto text-center">
          {/* Restaurants */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Restaurants</h3>
            <ul className="space-y-0">
              {restaurants.map((name) => (
                <li key={name} className="py-2.5 border-b border-white/10 text-gray-300 last:border-b-0">
                  {name}
                </li>
              ))}
            </ul>
          </div>

          {/* Retail */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Retail & Grocery</h3>
            <ul className="space-y-0">
              {retailers.map((name) => (
                <li key={name} className="py-2.5 border-b border-white/10 text-gray-300 last:border-b-0">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nationwide + Wholesale + CTA */}
        <div className="text-center mt-10 space-y-3">
          <p className="text-gray-300">
            <span className="text-brand-gold font-bold">Nationwide:</span>{' '}
            Available on{' '}
            <a
              href="https://www.amazon.com/dp/B0D915BFRN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold underline hover:text-brand-gold-light transition-colors"
            >
              Amazon
            </a>{' '}
            with free Prime shipping.
          </p>
          <p className="text-gray-300">
            <span className="text-brand-gold font-bold">Wholesale inquiries:</span>{' '}
            <a
              href="mailto:olatunde@jamaicahousebrand.com"
              className="text-brand-gold underline hover:text-brand-gold-light transition-colors"
            >
              olatunde@jamaicahousebrand.com
            </a>
          </p>
          <div className="pt-4">
            <Link
              href="/find-us"
              className="inline-block bg-brand-dark text-white border-2 border-brand-gold font-semibold px-8 py-3 hover:bg-brand-gold hover:text-brand-dark transition-colors"
            >
              View All Locations
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

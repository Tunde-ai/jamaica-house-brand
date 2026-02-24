import { Metadata } from 'next'
import { products } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

export const metadata: Metadata = {
  title: 'Shop Authentic Jamaican Sauces',
  description: 'Browse our collection of handcrafted Jamaican sauces. Original Jerk Sauce in 2oz, 5oz, and 10oz sizes, plus our Escovitch Pikliz.',
  openGraph: {
    title: 'Shop Jamaica House Brand Sauces',
    description: 'Handcrafted Jamaican sauces from a 30-year family recipe.',
  },
}

export default function ShopPage() {
  return (
    <div className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Shop Our Sauces
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-4">
            Handcrafted from a 30-year family recipe. Zero calories. All natural.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {['Marinating', 'Grilling', 'Dipping'].map((use, idx) => (
              <span key={use} className="flex items-center text-white text-sm md:text-base font-bold tracking-wide uppercase">
                {use}
                {idx < 2 && <span className="ml-3 text-brand-gold">—</span>}
              </span>
            ))}
            <span className="mx-2 text-white/20">|</span>
            <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold px-3 py-1 rounded-full">
              Low Sodium
            </span>
            <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold px-3 py-1 rounded-full">
              Zero Calories
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

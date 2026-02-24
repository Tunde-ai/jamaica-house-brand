import Link from 'next/link'
import { products } from '@/data/products'
import ProductCard from '@/components/ui/ProductCard'

export default function HomeProductGrid() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <p className="text-brand-gold uppercase tracking-widest text-sm text-center mb-2">
          Handcrafted Excellence
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Our Products
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          From our kitchen to yours — authentic Jamaican flavors crafted with 30 years of expertise and all-natural ingredients.
        </p>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all link */}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-block border-2 border-brand-gold text-brand-gold font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold/10 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

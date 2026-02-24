import Image from 'next/image'
import { Product } from '@/types/product'
import { formatPrice } from '@/lib/utils'
import { getProductById } from '@/data/products'
import StarRating from '@/components/ui/StarRating'

interface ProductInfoProps {
  product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const savings = product.compareAtPrice
    ? product.compareAtPrice - product.price
    : 0

  const bundleProducts = product.bundleItems
    ?.map((id) => getProductById(id))
    .filter(Boolean) as Product[] | undefined

  return (
    <div>
      {/* Product Name and Size */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {product.name}
      </h1>
      <span className="text-lg text-gray-400 mb-4 block">
        {product.size}
      </span>

      {/* Star Rating */}
      <StarRating rating={product.rating} />

      {/* Price */}
      <div className="mt-4 mb-6 flex items-center gap-3">
        <span className="text-3xl font-bold text-brand-gold">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && (
          <>
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
              You save {formatPrice(savings)}
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <hr className="border-brand-gold/20 my-6" />

      {/* Bundle Contents */}
      {bundleProducts && bundleProducts.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              What&apos;s Included
            </h2>
            <div className="space-y-3">
              {bundleProducts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                >
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-gray-400 text-xs">{item.size}</p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <hr className="border-brand-gold/20 my-6" />
        </>
      )}

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          About This Product
        </h2>
        <p className="text-gray-300 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* In Stock Indicator */}
      <div className="mt-4">
        {product.inStock ? (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>In Stock</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Out of Stock</span>
          </div>
        )}
      </div>
    </div>
  )
}

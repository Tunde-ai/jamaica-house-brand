'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 5000 // $50.00 in cents

export default function FreeShippingBar() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  if (!mounted) {
    // SSR-safe: render the empty-cart state statically
    return (
      <div className="bg-brand-dark border-b border-brand-gold/20 py-2 px-4 text-center text-sm text-gray-400">
        Free shipping on $50+ orders
      </div>
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  return (
    <div className="bg-brand-dark border-b border-brand-gold/20 py-2 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Message */}
        <p className="text-center text-sm mb-1.5">
          {subtotal === 0 ? (
            <span className="text-gray-400">Free shipping on $50+ orders</span>
          ) : subtotal >= FREE_SHIPPING_THRESHOLD ? (
            <span className="text-brand-gold font-semibold">You qualify for FREE shipping!</span>
          ) : (
            <span className="text-gray-300">
              Add <span className="text-brand-gold font-semibold">{formatPrice(remaining)}</span> more for free shipping
            </span>
          )}
        </p>

        {/* Progress bar — only show when cart has items */}
        {subtotal > 0 && (
          <div className="w-full max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: '#D4A843',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

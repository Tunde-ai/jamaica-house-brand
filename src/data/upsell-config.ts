export interface UpsellOffer {
  productId: string
  name: string
  size: string
  image: string
  originalPrice: number // cents
  offerPrice: number // cents
  savingsText: string
}

/**
 * Returns a contextual upsell offer based on what's already in the cart.
 */
export function getUpsellOffer(cartItemIds: string[]): UpsellOffer {
  const hasSauce = cartItemIds.some((id) =>
    id.startsWith('jerk-sauce')
  )
  const hasPikliz = cartItemIds.some((id) => id.includes('pikliz'))
  const hasBundle = cartItemIds.some((id) => id.includes('bundle'))

  if (hasBundle) {
    // Already has the bundle — upsell the big bottle
    return {
      productId: 'jerk-sauce-10oz',
      name: 'Original Jerk Sauce',
      size: '10oz',
      image: '/images/products/jerk-sauce-10oz.jpg',
      originalPrice: 1899,
      offerPrice: 1599,
      savingsText: 'Save $3.00',
    }
  }

  if (hasSauce && !hasPikliz) {
    // Has sauce only — suggest pikliz
    return {
      productId: 'escovitch-pikliz-12oz',
      name: 'Escovitch Pikliz',
      size: '12oz',
      image: '/images/products/pikliz-12oz.jpg',
      originalPrice: 1199,
      offerPrice: 999,
      savingsText: 'Save $2.00',
    }
  }

  if (hasPikliz && !hasSauce) {
    // Has pikliz only — suggest 5oz sauce
    return {
      productId: 'jerk-sauce-5oz',
      name: 'Original Jerk Sauce',
      size: '5oz',
      image: '/images/products/jerk-sauce-5oz.jpg',
      originalPrice: 1199,
      offerPrice: 999,
      savingsText: 'Save $2.00',
    }
  }

  // Default — suggest the bundle
  return {
    productId: 'jamaica-house-bundle',
    name: 'Jamaica House Bundle',
    size: '5oz + 12oz',
    image: '/images/products/product-group.jpg',
    originalPrice: 1999,
    offerPrice: 1699,
    savingsText: 'Save $3.00',
  }
}

export const downsellOffer: UpsellOffer = {
  productId: 'jerk-sauce-5oz',
  name: 'Original Jerk Sauce',
  size: '5oz',
  image: '/images/products/jerk-sauce-5oz.jpg',
  originalPrice: 1199,
  offerPrice: 999,
  savingsText: 'Save $2.00',
}

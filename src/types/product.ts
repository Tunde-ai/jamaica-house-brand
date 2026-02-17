export interface Product {
  id: string
  name: string
  description: string
  price: number // in cents to avoid floating-point errors
  size: string
  image: string
  slug: string
  category: 'sauce' | 'pikliz'
  inStock: boolean
  stripeProductId?: string // Optional - will be set in Phase 3 (Stripe integration)
  stripePriceId?: string
}

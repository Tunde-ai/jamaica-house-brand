import { Product } from '@/types/product'

export const products: Product[] = [
  {
    id: 'jerk-sauce-2oz',
    name: 'Original Jerk Sauce',
    description: 'Authentic Jamaican jerk sauce crafted from the family recipe that built three restaurants. Features allspice, thyme, and Scotch bonnet peppers. Zero calories, all natural ingredients.',
    price: 699, // $6.99 in cents
    size: '2oz',
    image: '/images/products/jerk-sauce-2oz.jpg',
    slug: 'jerk-sauce-2oz',
    category: 'sauce',
    inStock: true,
    rating: 4.8,
    callouts: ['Zero Calories', 'All Natural', '30-Year Recipe'],
    images: [
      '/images/products/jerk-sauce-2oz.jpg',
    ],
  },
  {
    id: 'jerk-sauce-5oz',
    name: 'Original Jerk Sauce',
    description: 'Authentic Jamaican jerk sauce crafted from the family recipe that built three restaurants. Features allspice, thyme, and Scotch bonnet peppers. Zero calories, all natural ingredients.',
    price: 1199, // $11.99 in cents
    size: '5oz',
    image: '/images/products/jerk-sauce-5oz.jpg',
    slug: 'jerk-sauce-5oz',
    category: 'sauce',
    inStock: true,
    rating: 4.9,
    callouts: ['Zero Calories', 'All Natural', '30-Year Recipe'],
    images: [
      '/images/products/jerk-sauce-5oz.jpg',
    ],
  },
  {
    id: 'jerk-sauce-10oz',
    name: 'Original Jerk Sauce',
    description: 'Authentic Jamaican jerk sauce crafted from the family recipe that built three restaurants. Features allspice, thyme, and Scotch bonnet peppers. Zero calories, all natural ingredients.',
    price: 1899, // $18.99 in cents
    size: '10oz',
    image: '/images/products/jerk-sauce-10oz.jpg',
    slug: 'jerk-sauce-10oz',
    category: 'sauce',
    inStock: true,
    rating: 4.7,
    callouts: ['Zero Calories', 'All Natural', '30-Year Recipe'],
    images: [
      '/images/products/jerk-sauce-10oz.jpg',
    ],
  },
  {
    id: 'escovitch-pikliz-12oz',
    name: 'Escovitch Pikliz',
    description: 'Spicy Jamaican pickled vegetable relish with habanero peppers, carrots, onions, and vinegar. Perfect accompaniment to jerk chicken and grilled meats.',
    price: 1199, // $11.99 in cents
    size: '12oz',
    image: '/images/products/pikliz-12oz.jpg',
    slug: 'escovitch-pikliz-12oz',
    category: 'pikliz',
    inStock: true,
    rating: 4.6,
    callouts: ['All Natural', 'Handcrafted', 'Authentic Recipe'],
    images: [
      '/images/products/pikliz-12oz.jpg',
    ],
  },
  {
    id: 'jamaica-house-bundle',
    name: 'Jamaica House Bundle',
    description: 'The perfect starter pack — get our 2oz and 5oz Original Jerk Sauce plus our signature Escovitch Pikliz at a bundled discount. Everything you need to bring authentic Jamaican flavor to your kitchen.',
    price: 2499, // $24.99 in cents
    compareAtPrice: 3097, // $30.97 (6.99 + 11.99 + 11.99)
    size: '2oz + 5oz + 12oz',
    image: '/images/products/product-group.jpg',
    slug: 'jamaica-house-bundle',
    category: 'bundle',
    inStock: true,
    rating: 5.0,
    callouts: ['Best Value', 'Save $6', 'Complete Set'],
    images: [
      '/images/products/product-group.jpg',
    ],
    bundleItems: ['jerk-sauce-2oz', 'jerk-sauce-5oz', 'escovitch-pikliz-12oz'],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

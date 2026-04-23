export interface TrayItem {
  name: string
  description: string
  smallPrice: number
  largePrice: number
}

export interface TrayCategory {
  id: string
  title: string
  items: TrayItem[]
}

export interface DeliveryTier {
  distance: string
  fee: number
  freeThreshold?: number
}

export interface TraySize {
  id: 'small' | 'large'
  name: string
  serves: string
}

export const traySizes: TraySize[] = [
  { id: 'small', name: 'Small', serves: '~15 people' },
  { id: 'large', name: 'Large', serves: '35-40 people' },
]

export const trayCategories: TrayCategory[] = [
  {
    id: 'proteins',
    title: 'Proteins',
    items: [
      {
        name: 'Jerk Chicken Bone-In',
        description: 'Slow-marinated chicken in our signature jerk sauce',
        smallPrice: 75,
        largePrice: 140,
      },
      {
        name: 'Jerk Chicken Boneless',
        description: 'Tender boneless jerk chicken pieces',
        smallPrice: 85,
        largePrice: 160,
      },
      {
        name: 'Curry Goat',
        description: 'Traditional Jamaican curry goat, fall-off-the-bone tender',
        smallPrice: 110,
        largePrice: 220,
      },
      {
        name: 'Brown Stew Chicken',
        description: 'Classic Jamaican brown stew with rich gravy',
        smallPrice: 75,
        largePrice: 140,
      },
      {
        name: 'Oxtail Stew',
        description: 'Slow-braised oxtail with butter beans',
        smallPrice: 150,
        largePrice: 290,
      },
      {
        name: 'Escovitch Fish',
        description: 'Crispy fried fish topped with pickled vegetables',
        smallPrice: 90,
        largePrice: 170,
      },
      {
        name: 'Jerk Shrimp',
        description: 'Succulent shrimp with jerk seasoning',
        smallPrice: 95,
        largePrice: 180,
      },
      {
        name: 'Ackee & Saltfish',
        description: 'Jamaica\'s national dish with traditional seasonings',
        smallPrice: 80,
        largePrice: 150,
      },
    ],
  },
  {
    id: 'starches',
    title: 'Starches',
    items: [
      {
        name: 'Rice & Peas',
        description: 'Coconut rice with kidney beans and scotch bonnet',
        smallPrice: 35,
        largePrice: 65,
      },
      {
        name: 'White Rice',
        description: 'Perfectly steamed jasmine rice',
        smallPrice: 30,
        largePrice: 55,
      },
      {
        name: 'Festival',
        description: 'Sweet fried cornmeal dumplings',
        smallPrice: 35,
        largePrice: 65,
      },
      {
        name: 'Boiled Dumplings',
        description: 'Traditional flour dumplings',
        smallPrice: 30,
        largePrice: 55,
      },
      {
        name: 'Roasted Breadfruit',
        description: 'Caribbean breadfruit, roasted to perfection',
        smallPrice: 40,
        largePrice: 75,
      },
    ],
  },
  {
    id: 'sides',
    title: 'Sides',
    items: [
      {
        name: 'Steamed Cabbage',
        description: 'Seasoned cabbage with carrots and onions',
        smallPrice: 30,
        largePrice: 55,
      },
      {
        name: 'Callaloo',
        description: 'Jamaican greens sautéed with garlic and herbs',
        smallPrice: 35,
        largePrice: 65,
      },
      {
        name: 'Sweet Plantains',
        description: 'Caramelized ripe plantains',
        smallPrice: 35,
        largePrice: 65,
      },
      {
        name: 'Mac & Cheese',
        description: 'Creamy baked macaroni and cheese',
        smallPrice: 40,
        largePrice: 75,
      },
      {
        name: 'Coleslaw',
        description: 'Fresh Caribbean-style coleslaw',
        smallPrice: 25,
        largePrice: 45,
      },
    ],
  },
]

export const deliveryTiers: DeliveryTier[] = [
  {
    distance: 'Pickup',
    fee: 0,
  },
  {
    distance: 'Within 10 miles',
    fee: 0,
    freeThreshold: 250,
  },
  {
    distance: '11-20 miles',
    fee: 25,
  },
  {
    distance: '21-35 miles',
    fee: 45,
  },
]

export interface GroupSizeRecommendation {
  proteins: number
  starches: number
  sides: number
  note?: string
}

export function calculateTrayRecommendation(guestCount: number): GroupSizeRecommendation {
  if (guestCount < 15) {
    return {
      proteins: 0,
      starches: 0,
      sides: 0,
      note: 'For small gatherings under 15 people, we recommend individual portions. Please contact us directly.',
    }
  }

  // Calculate based on large trays (35-40 people each)
  const largeTrayCount = Math.ceil(guestCount / 35)

  if (guestCount <= 40) {
    return {
      proteins: 2, // Large trays
      starches: 2, // Large trays
      sides: 2,   // Large trays
      note: 'Perfect for your gathering size!',
    }
  } else if (guestCount <= 70) {
    return {
      proteins: 2, // Large trays
      starches: 2, // Large trays
      sides: 1,   // Large tray
      note: 'Great for medium-sized events.',
    }
  } else {
    return {
      proteins: largeTrayCount,
      starches: largeTrayCount,
      sides: Math.max(1, Math.floor(largeTrayCount * 0.7)), // Slightly fewer sides
      note: `Recommended for ${guestCount} guests. All large trays.`,
    }
  }
}

export const howItWorksSteps = [
  {
    step: 1,
    title: 'Choose Your Trays',
    description: 'Select from our authentic Jamaican proteins, starches, and sides',
    icon: '🍽️',
  },
  {
    step: 2,
    title: 'Pick Up or Delivery',
    description: 'Free pickup always available. Delivery options with transparent pricing',
    icon: '🚗',
  },
  {
    step: 3,
    title: 'Feast!',
    description: '30+ years of restaurant heritage delivered to your event',
    icon: '🎉',
  },
]

export const cateringFeatures = [
  'All trays include serving utensils',
  'Disposable plates and napkins available',
  'Setup and cleanup assistance on large orders',
  'Custom menu combinations welcome',
  '7-day advance notice required',
  'Dietary accommodations available',
]
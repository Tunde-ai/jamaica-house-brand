export interface StreetSeriesItem {
  id: string
  name: string
  description: string
  price: number
  requiredSides?: number // How many sides to choose (0 = no sides, 1+ = must choose)
  maxSides?: number // Maximum sides allowed
  image?: string
  spiceLevel?: 'mild' | 'medium' | 'hot'
  popular?: boolean
}

export interface StreetSeriesCategory {
  id: string
  title: string
  items: StreetSeriesItem[]
}

export interface AtlantaServiceArea {
  zipCode: string
  radius: number // miles
  deliveryFee: number
  minimumOrder: {
    pickup: number
    delivery: number
  }
  partnerInfo: {
    name: string
    phone: string
    email: string
    address: string
  }
}

// Atlanta Street Series Menu Data
export const atlantaStreetSeriesMenu: StreetSeriesCategory[] = [
  {
    id: 'meats-mains',
    title: 'Meats / Mains',
    items: [
      {
        id: 'jerk-chicken',
        name: 'Jerk Chicken',
        description: 'Authentic jerk chicken plate - choose your sides',
        price: 15,
        requiredSides: 1,
        maxSides: 2,
        spiceLevel: 'medium',
        popular: true,
        image: '/images/recipes/authentic-jerk-chicken.jpg',
      },
      {
        id: 'pork-ribs',
        name: 'Pork Ribs',
        description: 'Tender pork ribs - choose your sides',
        price: 18,
        requiredSides: 1,
        maxSides: 2,
        spiceLevel: 'mild',
        image: '/images/recipes/jerk-chicken-wings.jpg',
      },
      {
        id: 'jerk-sausage',
        name: 'Jerk Sausage',
        description: 'Spiced jerk sausage plate - choose your sides',
        price: 17,
        requiredSides: 1,
        maxSides: 2,
        spiceLevel: 'hot',
      },
      {
        id: 'bbq-short-ribs',
        name: 'BBQ Short Ribs',
        description: 'BBQ short ribs with Jamaican hot sauce - choose your sides',
        price: 22,
        requiredSides: 1,
        maxSides: 2,
        spiceLevel: 'hot',
        popular: true,
        image: '/images/recipes/jerk-salmon-rice-peas.jpg',
      },
    ],
  },
  {
    id: 'steaks',
    title: 'Steaks',
    items: [
      {
        id: 'ribeye-steak',
        name: 'Ribeye Steak',
        description: 'Grilled ribeye with your choice of sides',
        price: 28,
        requiredSides: 2,
        maxSides: 3,
        spiceLevel: 'mild',
        image: '/images/recipes/pikliz-burger.jpg',
      },
      {
        id: 'ny-strip',
        name: 'NY Strip Steak',
        description: 'New York strip with signature seasoning',
        price: 26,
        requiredSides: 2,
        maxSides: 3,
        spiceLevel: 'mild',
        image: '/images/recipes/escovitch-fish.jpg',
      },
    ],
  },
]

// Atlanta Service Area Configuration
export const atlantaServiceArea: AtlantaServiceArea = {
  zipCode: '30316', // Partner's ZIP code
  radius: 30,
  deliveryFee: 15,
  minimumOrder: {
    pickup: 15, // Much lower minimum for pickup - just one plate
    delivery: 30, // Reasonable minimum for delivery to cover costs
  },
  partnerInfo: {
    name: 'Atlanta Partner', // Update with actual name
    phone: '+1-XXX-XXX-XXXX', // Update with actual phone
    email: 'atlanta@jamaicahousebrand.com', // Update with actual email
    address: 'Atlanta, GA 30316', // Update with actual address
  },
}

// Side Options for Atlanta Street Series
export const atlantaSideOptions = [
  { id: 'mac-cheese', name: 'Mac & Cheese', description: 'Creamy baked macaroni and cheese' },
  { id: 'green-mac', name: 'Green Mac', description: 'Mac and cheese with greens' },
  { id: 'rice-peas', name: 'Rice & Peas', description: 'Coconut rice with kidney beans' },
  { id: 'plantains', name: 'Sweet Plantains', description: 'Caramelized ripe plantains' },
  { id: 'cabbage', name: 'Steamed Cabbage', description: 'Seasoned cabbage with carrots' },
  { id: 'coleslaw', name: 'Coleslaw', description: 'Fresh Caribbean-style coleslaw' },
]

// Pickup Locations in Atlanta
export const atlantaPickupLocations = [
  {
    id: 'main-location',
    name: 'Atlanta Main Location',
    address: 'Atlanta, GA 30316', // Update with actual address when available
    hours: 'Mon-Fri: 11am-8pm, Sat-Sun: 12pm-9pm',
    phone: '+1-XXX-XXX-XXXX', // Update with partner's phone
  },
  // Add more pickup locations as needed
]

// Delivery Time Slots for Atlanta
export const atlantaDeliverySlots = [
  { time: '11:00 AM - 12:00 PM', available: true },
  { time: '12:00 PM - 1:00 PM', available: true },
  { time: '1:00 PM - 2:00 PM', available: true },
  { time: '5:00 PM - 6:00 PM', available: true },
  { time: '6:00 PM - 7:00 PM', available: true },
  { time: '7:00 PM - 8:00 PM', available: true },
]
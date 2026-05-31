export interface StreetSeriesItem {
  id: string
  name: string
  description: string
  price: number
  sides: string[]
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
  minimumOrder: number
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
        description: 'Authentic jerk chicken served with mac & cheese',
        price: 15,
        sides: ['Mac & Cheese'],
        spiceLevel: 'medium',
        popular: true,
      },
      {
        id: 'pork-ribs',
        name: 'Pork Ribs',
        description: 'Tender pork ribs - meal plate',
        price: 18,
        sides: ['Choice of 2 sides'],
        spiceLevel: 'mild',
      },
      {
        id: 'jerk-sausage',
        name: 'Jerk Sausage',
        description: 'Spiced jerk sausage - pork plate',
        price: 17,
        sides: ['Choice of 2 sides'],
        spiceLevel: 'hot',
      },
      {
        id: 'bbq-short-ribs',
        name: 'BBQ Short Ribs',
        description: 'BBQ short ribs with Jamaican hot sauce',
        price: 22,
        sides: ['Jamaican Hot Plate'],
        spiceLevel: 'hot',
        popular: true,
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
        description: 'Grilled ribeye with choice of sides',
        price: 28,
        sides: ['Mac & Cheese', 'Green Mac'],
        spiceLevel: 'mild',
      },
      {
        id: 'ny-strip',
        name: 'NY Strip Steak',
        description: 'New York strip with signature seasoning',
        price: 26,
        sides: ['Mac & Cheese', 'Green Mac'],
        spiceLevel: 'mild',
      },
    ],
  },
]

// Atlanta Service Area Configuration
export const atlantaServiceArea: AtlantaServiceArea = {
  zipCode: '30309', // Partner's ZIP code - update this
  radius: 30,
  deliveryFee: 15,
  minimumOrder: 50,
  partnerInfo: {
    name: 'Atlanta Partner', // Update with actual name
    phone: '+1-XXX-XXX-XXXX', // Update with actual phone
    email: 'atlanta@jamaicahousebrand.com', // Update with actual email
    address: 'Atlanta, GA 30309', // Update with actual address
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
    address: 'TBD - Partner Address', // Update with actual address
    hours: 'Mon-Fri: 11am-8pm, Sat-Sun: 12pm-9pm',
    phone: '+1-XXX-XXX-XXXX',
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
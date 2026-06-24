export type LocationCategory = 'grocery' | 'specialty' | 'restaurant' | 'market' | 'convenience'

export interface RetailLocation {
  id: string
  name: string
  category: LocationCategory
  address: string
  city: string
  state: string
  zip: string
  phone?: string
  hours?: string
  website?: string
  /** lat/lng for distance calculations and future map integration */
  coordinates?: { lat: number; lng: number }
  /** Which JHB products this location carries */
  products?: string[]
  isNew?: boolean
}

export const categoryLabels: Record<LocationCategory, string> = {
  grocery: 'Grocery Store',
  specialty: 'Specialty / Gourmet',
  restaurant: 'Restaurant',
  market: 'Farmers Market',
  convenience: 'Convenience Store',
}

export const categoryColors: Record<LocationCategory, string> = {
  grocery: 'bg-green-500/20 text-green-400 border-green-500/30',
  specialty: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  restaurant: 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
  market: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  convenience: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

/**
 * Retail locations where JHB sauces are available for purchase.
 *
 * Sourced from JHB Command Center — active retail accounts,
 * CLOSED_WON leads, and locations with product placed.
 *
 * To add a new location, add an entry here. The /find-us page will
 * automatically pick it up. Use `isNew: true` to show a "NEW" badge.
 */
export const retailLocations: RetailLocation[] = [
  // ═══════════════════════════════════════════════════════════════
  // JAMAICA HOUSE RESTAURANTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'jamaica-house-miami',
    name: 'Jamaica House Restaurant — Miami',
    category: 'restaurant',
    address: '19555 NW 2nd Ave',
    city: 'Miami',
    state: 'FL',
    zip: '33169',
    phone: '(305) 651-0083',
    coordinates: { lat: 25.9420, lng: -80.1987 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
  },
  {
    id: 'jamaica-house-broward',
    name: 'Jamaica House Restaurant — Broward',
    category: 'restaurant',
    address: '3351 W Broward Blvd',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33312',
    phone: '(954) 530-2698',
    coordinates: { lat: 26.1185, lng: -80.1788 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
  },

  // ═══════════════════════════════════════════════════════════════
  // MIAMI METRO — Retail & Markets
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'flow-grocer-miami',
    name: 'Flow Grocer',
    category: 'specialty',
    address: '698 NE 1st Ave, Suite G182',
    city: 'Miami',
    state: 'FL',
    zip: '33132',
    phone: '(305) 395-5864',
    coordinates: { lat: 25.7740, lng: -80.1910 },
    products: ['Original Jerk Sauce'],
    isNew: true,
  },
  {
    id: 'caribbean-best-market',
    name: 'Caribbean Best Market',
    category: 'grocery',
    address: '255 NE 167th St',
    city: 'Miami',
    state: 'FL',
    zip: '33162',
    phone: '(305) 974-5771',
    coordinates: { lat: 25.9290, lng: -80.1870 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
  },
  {
    id: 'marina-blue-mini-mart',
    name: 'Marina Blue Mini Mart',
    category: 'convenience',
    address: '888 Biscayne Blvd',
    city: 'Miami',
    state: 'FL',
    zip: '33132',
    phone: '(305) 379-8005',
    coordinates: { lat: 25.7830, lng: -80.1880 },
    products: ['Original Jerk Sauce'],
  },
  {
    id: 'wells-market-bayparc',
    name: 'Wells Market Bayparc',
    category: 'convenience',
    address: '1756 N Bayshore Dr #124',
    city: 'Miami',
    state: 'FL',
    zip: '33132',
    coordinates: { lat: 25.7890, lng: -80.1860 },
    products: ['Original Jerk Sauce'],
    isNew: true,
  },
  {
    id: 'fa-m-west-indian-grocery',
    name: 'FA&M West Indian & American Grocery',
    category: 'grocery',
    address: 'NW 2nd Ave',
    city: 'Miami',
    state: 'FL',
    zip: '33168',
    phone: '(305) 653-2384',
    coordinates: { lat: 25.8900, lng: -80.2000 },
    products: ['Original Jerk Sauce'],
  },
  {
    id: 'trading-post-miami',
    name: 'The Trading Post',
    category: 'convenience',
    address: '1717 N Bayshore Dr, Suite 126',
    city: 'Miami',
    state: 'FL',
    zip: '33132',
    coordinates: { lat: 25.7895, lng: -80.1855 },
    products: ['Original Jerk Sauce'],
    isNew: true,
  },
  {
    id: 'la-catrachita-miami',
    name: 'La Catrachita of Miami',
    category: 'convenience',
    address: '222 NE 25th St, Suite 103',
    city: 'Miami',
    state: 'FL',
    zip: '33137',
    phone: '(305) 576-6314',
    coordinates: { lat: 25.7980, lng: -80.1900 },
    products: ['Original Jerk Sauce'],
    isNew: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // FORT LAUDERDALE — Retail & Markets
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'westside-market',
    name: 'Westside Market',
    category: 'market',
    address: '1029 W Las Olas',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33312',
    phone: '(954) 618-6988',
    coordinates: { lat: 26.1180, lng: -80.1550 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
  },
  {
    id: 'my-market-deli',
    name: 'My Market & Deli',
    category: 'convenience',
    address: '229 SW 17th St',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33315',
    phone: '(954) 410-8858',
    coordinates: { lat: 26.1040, lng: -80.1470 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
  },
  {
    id: 'la-madame-caribbean',
    name: 'La Madame Caribbean Market',
    category: 'grocery',
    address: '1548 NE 4th Ave',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33304',
    phone: '(954) 314-7489',
    coordinates: { lat: 26.1370, lng: -80.1370 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
  },
  {
    id: 'circle-t',
    name: 'Circle T Food Store',
    category: 'convenience',
    address: '522 NE 3rd Ave',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33301',
    phone: '(954) 462-4639',
    coordinates: { lat: 26.1250, lng: -80.1380 },
    products: ['Original Jerk Sauce'],
  },
  // Wilton Wings & Pizza — prospect (following up with manager)
  {
    id: 'grumpy-garys',
    name: "Grumpy Gary's at Dockers",
    category: 'restaurant',
    address: '318 N Federal Hwy',
    city: 'Dania Beach',
    state: 'FL',
    zip: '33004',
    phone: '(754) 400-7241',
    coordinates: { lat: 26.0600, lng: -80.1370 },
    products: ['Original Jerk Sauce'],
    isNew: true,
  },
  {
    id: 'brothers-farmers-market',
    name: 'Brothers Farmers Market',
    category: 'market',
    address: '3431 Hiatus Rd',
    city: 'Sunrise',
    state: 'FL',
    zip: '33351',
    phone: '(954) 865-7346',
    coordinates: { lat: 26.1490, lng: -80.3210 },
    products: ['Original Jerk Sauce', 'Escovitch Pikliz'],
    isNew: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // DEERFIELD BEACH / BOCA RATON
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ideal-deli-food-basket',
    name: 'Ideal Deli Food Basket Kitchen',
    category: 'grocery',
    address: '202 W Hillsboro Blvd',
    city: 'Deerfield Beach',
    state: 'FL',
    zip: '33441',
    phone: '(954) 421-6444',
    coordinates: { lat: 26.3187, lng: -80.1010 },
    products: ['Original Jerk Sauce'],
  },
  // 1st Food & Deli Market — prospect (likelihood 1/5, not confirmed)
  // Uptown Market Cafe — prospect (quoted, not closed yet)

  // ═══════════════════════════════════════════════════════════════
  // ATLANTA, GA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'heritage-halal-market',
    name: 'Heritage Halal Market',
    category: 'specialty',
    address: '536 Fayetteville Rd SE',
    city: 'Atlanta',
    state: 'GA',
    zip: '30316',
    phone: '(404) 370-0270',
    coordinates: { lat: 33.7270, lng: -84.3520 },
    products: ['Original Jerk Sauce'],
    isNew: true,
  },
]

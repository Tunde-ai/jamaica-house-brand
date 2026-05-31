import { atlantaServiceArea } from '@/data/atlanta-street-series'

export type ServiceLocation = 'south-florida' | 'atlanta'

export interface LocationConfig {
  id: ServiceLocation
  name: string
  displayName: string
  zipCode: string
  radius: number
  deliveryFee: number
  minimumOrder: number
  menuType: 'traditional' | 'tray' | 'street-series'
  menuPath: string
  isActive: boolean
  partnerInfo?: {
    name: string
    phone: string
    email: string
    address: string
  }
}

export const locationConfigs: Record<ServiceLocation, LocationConfig> = {
  'south-florida': {
    id: 'south-florida',
    name: 'south-florida',
    displayName: 'South Florida',
    zipCode: '33025', // Miramar area
    radius: 35,
    deliveryFee: 25,
    minimumOrder: 250,
    menuType: 'tray',
    menuPath: '/catering-menu',
    isActive: true,
  },
  'atlanta': {
    id: 'atlanta',
    name: 'atlanta',
    displayName: 'Atlanta Street Series',
    zipCode: atlantaServiceArea.zipCode,
    radius: atlantaServiceArea.radius,
    deliveryFee: atlantaServiceArea.deliveryFee,
    minimumOrder: atlantaServiceArea.minimumOrder,
    menuType: 'street-series',
    menuPath: '/catering-services/atlanta-street-series',
    isActive: true,
    partnerInfo: atlantaServiceArea.partnerInfo,
  },
}

// Calculate distance between two ZIP codes (simplified - in production use a proper geocoding API)
export async function calculateDistance(fromZip: string, toZip: string): Promise<number> {
  // This is a simplified calculation
  // In production, use a service like Google Maps Distance Matrix API

  // For now, return a mock distance for development
  // TODO: Implement actual ZIP code distance calculation
  return Math.random() * 50
}

// Check if a ZIP code is within service area
export async function isZipInServiceArea(zipCode: string, location: ServiceLocation): Promise<boolean> {
  const config = locationConfigs[location]

  if (!config.isActive) {
    return false
  }

  try {
    const distance = await calculateDistance(config.zipCode, zipCode)
    return distance <= config.radius
  } catch (error) {
    console.error('Error calculating distance:', error)
    return false
  }
}

// Get delivery fee for a ZIP code and location
export async function getDeliveryFee(zipCode: string, location: ServiceLocation): Promise<number> {
  const config = locationConfigs[location]

  if (!await isZipInServiceArea(zipCode, location)) {
    throw new Error(`ZIP code ${zipCode} is outside ${config.displayName} service area`)
  }

  const distance = await calculateDistance(config.zipCode, zipCode)

  if (location === 'south-florida') {
    // South Florida has tiered delivery pricing
    if (distance <= 10) return 0
    if (distance <= 20) return 25
    if (distance <= 35) return 45
    return config.deliveryFee
  }

  if (location === 'atlanta') {
    // Atlanta has flat delivery fee
    return config.deliveryFee
  }

  return config.deliveryFee
}

// Get available locations for a ZIP code
export async function getAvailableLocations(zipCode: string): Promise<LocationConfig[]> {
  const available: LocationConfig[] = []

  for (const location of Object.values(locationConfigs)) {
    if (location.isActive && await isZipInServiceArea(zipCode, location.id)) {
      available.push(location)
    }
  }

  return available
}

// Validate minimum order for location
export function validateMinimumOrder(orderTotal: number, location: ServiceLocation): boolean {
  const config = locationConfigs[location]
  return orderTotal >= config.minimumOrder
}

// Get partner notification info
export function getPartnerInfo(location: ServiceLocation) {
  const config = locationConfigs[location]
  return config.partnerInfo || null
}
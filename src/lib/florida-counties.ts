export type ServiceAreaStatus = 'in_area' | 'tier_2' | 'out_of_area'

export interface FloridaCounty {
  name: string
  status: ServiceAreaStatus
}

export const FLORIDA_COUNTIES: FloridaCounty[] = [
  // Primary Service Area (in_area)
  { name: 'Miami-Dade', status: 'in_area' as ServiceAreaStatus },
  { name: 'Broward', status: 'in_area' as ServiceAreaStatus },
  { name: 'Palm Beach', status: 'in_area' as ServiceAreaStatus },
  { name: 'Monroe', status: 'in_area' as ServiceAreaStatus }, // Florida Keys

  // Tier 2 (premium pricing, manual review)
  { name: 'Martin', status: 'tier_2' as ServiceAreaStatus },
  { name: 'St. Lucie', status: 'tier_2' as ServiceAreaStatus },
  { name: 'Indian River', status: 'tier_2' as ServiceAreaStatus },
  { name: 'Collier', status: 'tier_2' as ServiceAreaStatus },
  { name: 'Orange', status: 'tier_2' as ServiceAreaStatus }, // Central Florida
  { name: 'Osceola', status: 'tier_2' as ServiceAreaStatus }, // Central Florida
  { name: 'Seminole', status: 'tier_2' as ServiceAreaStatus }, // Central Florida

  // All other Florida counties (out_of_area)
  { name: 'Alachua', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Baker', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Bay', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Bradford', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Brevard', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Calhoun', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Charlotte', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Citrus', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Clay', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Columbia', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'DeSoto', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Dixie', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Duval', status: 'out_of_area' as ServiceAreaStatus }, // Jacksonville
  { name: 'Escambia', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Flagler', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Franklin', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Gadsden', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Gilchrist', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Glades', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Gulf', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Hamilton', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Hardee', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Hendry', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Hernando', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Highlands', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Hillsborough', status: 'out_of_area' as ServiceAreaStatus }, // Tampa
  { name: 'Holmes', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Jackson', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Jefferson', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Lafayette', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Lake', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Lee', status: 'out_of_area' as ServiceAreaStatus }, // Fort Myers
  { name: 'Leon', status: 'out_of_area' as ServiceAreaStatus }, // Tallahassee
  { name: 'Levy', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Liberty', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Madison', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Manatee', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Marion', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Nassau', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Okaloosa', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Okeechobee', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Pasco', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Pinellas', status: 'out_of_area' as ServiceAreaStatus }, // St. Petersburg
  { name: 'Polk', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Putnam', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Santa Rosa', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Sarasota', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'St. Johns', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Sumter', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Suwannee', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Taylor', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Union', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Volusia', status: 'out_of_area' as ServiceAreaStatus }, // Daytona
  { name: 'Wakulla', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Walton', status: 'out_of_area' as ServiceAreaStatus },
  { name: 'Washington', status: 'out_of_area' as ServiceAreaStatus },
].sort((a, b) => a.name.localeCompare(b.name))

export const SERVICE_AREA_COUNTIES = FLORIDA_COUNTIES.filter(c => c.status === 'in_area')
export const TIER_2_COUNTIES = FLORIDA_COUNTIES.filter(c => c.status === 'tier_2')
export const OUT_OF_AREA_COUNTIES = FLORIDA_COUNTIES.filter(c => c.status === 'out_of_area')

export function getCountyStatus(countyName: string): ServiceAreaStatus {
  const county = FLORIDA_COUNTIES.find(c =>
    c.name.toLowerCase() === countyName.toLowerCase()
  )
  return county?.status || 'out_of_area'
}

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

// Caribbean area codes that often appear as US numbers but indicate international
export const CARIBBEAN_AREA_CODES = [
  '242', // Bahamas
  '246', // Barbados
  '264', // Anguilla
  '268', // Antigua and Barbuda
  '284', // British Virgin Islands
  '340', // US Virgin Islands (technically US but typically not FL events)
  '345', // Cayman Islands
  '441', // Bermuda
  '473', // Grenada
  '649', // Turks and Caicos
  '664', // Montserrat
  '721', // Sint Maarten
  '758', // Saint Lucia
  '767', // Dominica
  '784', // Saint Vincent and the Grenadines
  '787', // Puerto Rico
  '809', // Dominican Republic
  '829', // Dominican Republic
  '849', // Dominican Republic
  '868', // Trinidad and Tobago
  '869', // Saint Kitts and Nevis
  '876', // Jamaica
  '939', // Puerto Rico
]
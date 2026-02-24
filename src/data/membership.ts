export interface TierFeature {
  text: string
  included: boolean
}

export interface MembershipTier {
  id: string
  name: string
  price: number
  interval: string
  description: string
  features: TierFeature[]
  highlight?: boolean
}

export interface MemberStat {
  value: string
  label: string
}

export const membershipTiers: MembershipTier[] = [
  {
    id: 'standard',
    name: 'Standard Annual',
    price: 75,
    interval: 'year',
    description: '13 bottles of our 5oz Jerk Sauce — low sodium, zero calories. Shipped quarterly.',
    features: [
      { text: '13 bottles (5oz) delivered quarterly', included: true },
      { text: 'Only $5.77 per bottle', included: true },
      { text: 'Low sodium & zero calories', included: true },
      { text: 'FREE bonus gift bottle', included: true },
      { text: 'FREE shipping on all 4 shipments', included: true },
      { text: '15% off first year for new members', included: true },
      { text: 'Exclusive member recipes', included: false },
      { text: 'VIP event invitations', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Annual',
    price: 125,
    interval: 'year',
    description: '13 bottles of our 10oz Jerk Sauce — low sodium, zero calories. Shipped quarterly.',
    highlight: true,
    features: [
      { text: '13 bottles (10oz) delivered quarterly', included: true },
      { text: 'Only $9.62 per bottle', included: true },
      { text: 'Low sodium & zero calories', included: true },
      { text: 'FREE bonus gift bottle', included: true },
      { text: 'FREE shipping on all 4 shipments', included: true },
      { text: '15% off first year for new members', included: true },
      { text: 'Exclusive member recipes', included: true },
      { text: 'VIP event invitations', included: true },
    ],
  },
]

export const memberStats: MemberStat[] = [
  { value: '30+', label: 'Years Family Recipe' },
  { value: '92%', label: 'Customer Return Rate' },
  { value: 'FREE', label: 'Shipping Always' },
  { value: '26%', label: 'Maximum Savings' },
]

export const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
]

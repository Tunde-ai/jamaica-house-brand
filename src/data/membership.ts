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
    name: 'Standard',
    price: 75,
    interval: 'month',
    description: 'Perfect for sauce lovers who want a monthly taste of Jamaica.',
    features: [
      { text: '2 bottles of Jerk Sauce per month', included: true },
      { text: '1 bottle of Pikliz per month', included: true },
      { text: 'Free shipping on subscription orders', included: true },
      { text: 'Early access to new products', included: true },
      { text: '10% off all shop orders', included: true },
      { text: 'Exclusive member recipes', included: false },
      { text: 'Birthday bonus bottle', included: false },
      { text: 'VIP event invitations', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 125,
    interval: 'month',
    description: 'The ultimate Jamaica House experience for true flavor enthusiasts.',
    highlight: true,
    features: [
      { text: '4 bottles of Jerk Sauce per month', included: true },
      { text: '2 bottles of Pikliz per month', included: true },
      { text: 'Free shipping on ALL orders', included: true },
      { text: 'Early access to new products', included: true },
      { text: '20% off all shop orders', included: true },
      { text: 'Exclusive member recipes', included: true },
      { text: 'Birthday bonus bottle', included: true },
      { text: 'VIP event invitations', included: true },
    ],
  },
]

export const memberStats: MemberStat[] = [
  { value: '30+', label: 'Years of Flavor' },
  { value: '92%', label: 'Members Return' },
  { value: 'FREE', label: 'Shipping Included' },
  { value: '26%', label: 'Average Savings' },
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

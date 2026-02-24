export interface MenuItem {
  name: string
  description: string
}

export interface MenuCategory {
  id: string
  title: string
  items: MenuItem[]
}

export interface PricingTier {
  guestRange: string
  pricePerPerson: number
  includes: string
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'proteins',
    title: 'Proteins',
    items: [
      { name: 'Jerk Chicken', description: 'Slow-marinated in our signature jerk sauce' },
      { name: 'Curry Goat', description: 'Tender goat simmered in Jamaican curry' },
      { name: 'Oxtail', description: 'Braised oxtail with butter beans' },
      { name: 'Brown Stew Chicken', description: 'Classic Jamaican brown stew' },
      { name: 'Escovitch Fish', description: 'Fried fish topped with pickled vegetables' },
      { name: 'Curry Chicken', description: 'Bone-in chicken in rich curry sauce' },
    ],
  },
  {
    id: 'sides',
    title: 'Sides',
    items: [
      { name: 'Rice & Peas', description: 'Coconut milk rice with kidney beans' },
      { name: 'Fried Plantains', description: 'Sweet ripe plantains, golden fried' },
      { name: 'Festival', description: 'Sweet fried cornmeal dumplings' },
      { name: 'Steamed Cabbage', description: 'Seasoned cabbage with carrots' },
      { name: 'Mac & Cheese', description: 'Creamy baked macaroni and cheese' },
      { name: 'Coleslaw', description: 'Fresh Caribbean-style coleslaw' },
    ],
  },
  {
    id: 'beverages',
    title: 'Beverages',
    items: [
      { name: 'Sorrel Punch', description: 'Traditional hibiscus drink with ginger' },
      { name: 'Jamaican Fruit Punch', description: 'Tropical fruit blend' },
      { name: 'Ginger Beer', description: 'Spicy homemade ginger brew' },
      { name: 'Lemonade', description: 'Fresh-squeezed with a Caribbean twist' },
      { name: 'Bottled Water', description: 'Chilled spring water' },
      { name: 'Iced Tea', description: 'Sweetened or unsweetened' },
    ],
  },
]

export const pricingTiers: PricingTier[] = [
  { guestRange: '20–50', pricePerPerson: 25, includes: '2 proteins, 3 sides, 1 beverage' },
  { guestRange: '51–100', pricePerPerson: 22, includes: '2 proteins, 3 sides, 2 beverages' },
  { guestRange: '101–200', pricePerPerson: 20, includes: '3 proteins, 4 sides, 2 beverages' },
  { guestRange: '201–500', pricePerPerson: 18, includes: '3 proteins, 4 sides, 2 beverages' },
  { guestRange: '500+', pricePerPerson: 15, includes: 'Custom menu — call for details' },
]

export const guestCountOptions = [
  '20–50',
  '51–100',
  '101–200',
  '201–500',
  '500+',
]

export const eventTypes = [
  'Wedding',
  'Corporate Event',
  'Birthday Party',
  'Family Reunion',
  'Church Event',
  'Holiday Party',
  'Graduation',
  'Other',
]

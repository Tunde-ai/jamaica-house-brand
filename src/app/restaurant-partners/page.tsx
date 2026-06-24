import { redirect } from 'next/navigation'

// Old URL — permanently redirect to /wholesale-partners
export default function RestaurantPartnersPage() {
  redirect('/wholesale-partners')
}

import { Metadata } from 'next'
import MembershipHero from '@/components/membership/MembershipHero'
import MembershipPageClient from '@/components/membership/MembershipPageClient'

export const metadata: Metadata = {
  title: 'Family Members',
  description:
    'Join the Jamaica House Flavor Family. Monthly subscription plans starting at $75/month with free shipping, exclusive recipes, and member discounts.',
  openGraph: {
    title: 'Family Members - Jamaica House Brand',
    description:
      'Monthly sauce subscriptions with free shipping and exclusive perks. Standard ($75/mo) and Premium ($125/mo) plans available.',
  },
}

export default function FamilyMembersPage() {
  return (
    <main className="bg-brand-dark">
      <MembershipHero />
      <MembershipPageClient />
    </main>
  )
}

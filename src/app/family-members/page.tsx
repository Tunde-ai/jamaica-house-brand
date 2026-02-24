import { Metadata } from 'next'
import MembershipHero from '@/components/membership/MembershipHero'
import MembershipPageClient from '@/components/membership/MembershipPageClient'

export const metadata: Metadata = {
  title: 'Family Members',
  description:
    'Join the Jamaica House Flavor Family. Annual plans starting at $75/year with quarterly delivery, free shipping, and member perks.',
  openGraph: {
    title: 'Family Members - Jamaica House Brand',
    description:
      'Annual sauce subscriptions with quarterly delivery and free shipping. Standard ($75/yr) and Premium ($125/yr) plans available.',
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

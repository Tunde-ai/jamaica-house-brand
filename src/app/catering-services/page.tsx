import { Metadata } from 'next'
import CateringHero from '@/components/catering/CateringHero'
import CateringMenu from '@/components/catering/CateringMenu'
import PricingTable from '@/components/catering/PricingTable'
import CateringQuoteForm from '@/components/catering/CateringQuoteForm'

export const metadata: Metadata = {
  title: 'Catering Services',
  description:
    'Bring authentic Jamaican flavor to your next event. Jamaica House Brand catering offers jerk chicken, curry goat, oxtail, and more for 20 to 500+ guests.',
  openGraph: {
    title: 'Catering Services - Jamaica House Brand',
    description:
      'Authentic Jamaican catering for weddings, corporate events, and parties. 30+ years of restaurant heritage.',
  },
}

export default function CateringServicesPage() {
  return (
    <main className="bg-brand-dark">
      <CateringHero />
      <CateringMenu />
      <PricingTable />
      <CateringQuoteForm />
    </main>
  )
}

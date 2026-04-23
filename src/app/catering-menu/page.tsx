import { Metadata } from 'next'
import CateringMenuHero from '@/components/catering-menu/CateringMenuHero'
import HowItWorks from '@/components/catering-menu/HowItWorks'
import TrayMenuPricing from '@/components/catering-menu/TrayMenuPricing'
import GroupSizeCalculator from '@/components/catering-menu/GroupSizeCalculator'
import DeliveryInfo from '@/components/catering-menu/DeliveryInfo'
import CateringMenuQuoteForm from '@/components/catering-menu/CateringMenuQuoteForm'

export const metadata: Metadata = {
  title: 'Catering Menu - Order by the Tray',
  description:
    'Feed your crowd, Jamaica style! Order authentic Jamaican food by the tray. Jerk chicken, curry goat, oxtail, rice & peas and more. Small trays serve 15, large trays serve 35-40. Free pickup, delivery available.',
  openGraph: {
    title: 'Catering Menu - Order by the Tray | Jamaica House Brand',
    description:
      'Authentic Jamaican catering trays for your event. Jerk chicken, curry goat, oxtail and more. Small and large tray options available.',
  },
}

export default function CateringMenuPage() {
  return (
    <main className="bg-brand-dark">
      <CateringMenuHero />
      <HowItWorks />
      <TrayMenuPricing />
      <GroupSizeCalculator />
      <DeliveryInfo />
      <CateringMenuQuoteForm />
    </main>
  )
}
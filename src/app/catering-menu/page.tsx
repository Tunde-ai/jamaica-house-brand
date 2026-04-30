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

interface PageProps {
  searchParams: Promise<{
    quote_requested?: string
    error?: string
  }>
}

export default async function CateringMenuPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <main className="bg-brand-dark">
      <CateringMenuHero />

      {/* Quote Confirmation Banner */}
      {params.quote_requested && (
        <div className="bg-green-500/20 border border-green-400/30 px-4 py-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-white text-xl font-bold mb-2">Quote Request Received!</h3>
            <p className="text-gray-300 mb-3">
              We'll email you a detailed quote within 24 hours for order #{params.quote_requested}
            </p>
            <div className="text-sm text-gray-400">
              <p>📲 Check your inbox for confirmation</p>
              <p>📞 Questions? Call us at (786) 709-1027</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {params.error && (
        <div className="bg-red-500/20 border border-red-400/30 px-4 py-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-white text-xl font-bold mb-2">Payment Cancelled</h3>
            <p className="text-gray-300 mb-3">
              No worries! You can still request a quote or try payment again.
            </p>
            <div className="text-sm text-gray-400">
              <p>💬 Need help? Call us at (786) 709-1027</p>
            </div>
          </div>
        </div>
      )}

      <HowItWorks />
      <TrayMenuPricing />
      <GroupSizeCalculator />
      <DeliveryInfo />
      <CateringMenuQuoteForm />
    </main>
  )
}
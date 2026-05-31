import { Metadata } from 'next'
import AtlantaStreetSeriesMenu from '@/components/atlanta/AtlantaStreetSeriesMenu'
import AtlantaHero from '@/components/atlanta/AtlantaHero'
import LocationServiceBanner from '@/components/catering/LocationServiceBanner'

export const metadata: Metadata = {
  title: 'Atlanta Street Series | Jamaica House Brand - Authentic Jamaican Street Food',
  description: 'Order authentic Jamaican street food in Atlanta. Jerk chicken, pork ribs, steaks and more. Individual meal plates available for delivery within 30 miles of Atlanta.',
  openGraph: {
    title: 'Atlanta Street Series | Jamaica House Brand',
    description: 'Authentic Jamaican street food delivered in Atlanta. Individual meal plates, pickup and delivery available.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://jamaicahousebrand.com/catering-services/atlanta-street-series',
  },
}

export default function AtlantaStreetSeriesPage() {
  return (
    <>
      <LocationServiceBanner />
      <AtlantaHero />
      <AtlantaStreetSeriesMenu />
    </>
  )
}
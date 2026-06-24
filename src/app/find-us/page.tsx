import { Metadata } from 'next'
import { generateBreadcrumbJsonLd, sanitizeJsonLd } from '@/lib/seo'
import { retailLocations } from '@/data/retail-locations'
import FindUsClient from './FindUsClient'

export const metadata: Metadata = {
  title: 'Find Us — Where to Buy Jamaica House Brand Jerk Sauce',
  description:
    'Find Jamaica House Brand authentic jerk sauce near you. Browse our retail locations across South Florida or search by zip code to find the closest store carrying our sauces.',
  openGraph: {
    title: 'Find Us — Jamaica House Brand',
    description:
      'Find authentic Jamaican jerk sauce near you. Retail locations, restaurants, and specialty stores carrying Jamaica House Brand.',
  },
  alternates: {
    canonical: 'https://jamaicahousebrand.com/find-us',
  },
}

export default function FindUsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: 'https://jamaicahousebrand.com' },
    { name: 'Find Us', url: 'https://jamaicahousebrand.com/find-us' },
  ])

  return (
    <div className="min-h-screen bg-brand-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(breadcrumbJsonLd) }}
      />
      <FindUsClient locations={retailLocations} />
    </div>
  )
}

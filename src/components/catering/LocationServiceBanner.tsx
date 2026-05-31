'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { locationConfigs } from '@/lib/location-service'

export default function LocationServiceBanner() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)

  // Determine current location based on path
  const getCurrentLocation = () => {
    if (pathname.includes('atlanta')) return 'atlanta'
    if (pathname.includes('catering')) return 'south-florida'
    return null
  }

  const currentLocation = getCurrentLocation()

  // Don't show banner if not on a catering page
  if (!currentLocation) return null

  const otherLocation = currentLocation === 'atlanta' ? 'south-florida' : 'atlanta'
  const currentConfig = locationConfigs[currentLocation]
  const otherConfig = locationConfigs[otherLocation]

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-brand-gold/90 to-yellow-500/90 text-black">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span className="font-bold">
                {currentConfig.displayName}
              </span>
            </div>
            <div className="text-sm">
              Service area: {currentConfig.radius} mile radius
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              Looking for {otherConfig.displayName}?
            </div>
            <Link
              href={otherConfig.menuPath}
              className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Switch to {otherConfig.displayName}
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-black hover:text-gray-600 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
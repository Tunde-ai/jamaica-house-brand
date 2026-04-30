'use client'

import { useEffect, useRef } from 'react'

export default function TrackPurchase({
  value,
  currency = 'USD',
  orderId,
}: {
  value: number
  currency?: string
  orderId?: string
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    const dollarValue = value / 100 // Convert cents to dollars

    // Facebook Pixel tracking
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        value: dollarValue,
        currency,
        ...(orderId && { content_ids: [orderId] }),
      })
    }

    // Google Ads conversion tracking
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // Track purchase conversion
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: dollarValue,
        currency: currency,
        items: [{
          item_id: 'hot_sauce_order',
          item_name: 'Jamaica House Brand Hot Sauce',
          category: 'food',
          quantity: 1,
          price: dollarValue
        }]
      })

      // Track specific Google Ads conversion (you'll get this ID when setting up conversion in Google Ads)
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
        value: dollarValue,
        currency: currency,
        transaction_id: orderId,
      })
    }
  }, [value, currency, orderId])

  return null
}

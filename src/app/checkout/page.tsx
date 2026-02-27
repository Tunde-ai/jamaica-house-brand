'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Elements } from '@stripe/react-stripe-js'
import { getStripeClient } from '@/lib/stripe-client'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'
import { getUpsellOffer, downsellOffer, UpsellOffer } from '@/data/upsell-config'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import UpsellModal from '@/components/checkout/UpsellModal'

type CheckoutStep = 'form' | 'processing' | 'upsell' | 'downsell' | 'complete'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [hydrated, setHydrated] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('form')
  const [isUpsellProcessing, setIsUpsellProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    paymentIntentId: string
    customerId: string
  } | null>(null)

  // Rehydrate cart from localStorage
  useEffect(() => {
    useCartStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  // Redirect to shop if cart is empty (after hydration)
  useEffect(() => {
    if (hydrated && items.length === 0 && step === 'form') {
      router.push('/shop')
    }
  }, [hydrated, items.length, step, router])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const upsellOffer = getUpsellOffer(items.map((i) => i.id))

  function handlePaymentSuccess(data: { paymentIntentId: string; customerId: string }) {
    setPaymentData(data)
    setStep('upsell')
  }

  async function handleUpsellAccept(offer: UpsellOffer) {
    if (!paymentData) return
    setIsUpsellProcessing(true)

    try {
      const res = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: paymentData.customerId,
          productId: offer.productId,
          productName: offer.name,
          productSize: offer.size,
          amount: offer.offerPrice,
          originalPaymentIntentId: paymentData.paymentIntentId,
        }),
      })

      // Whether it succeeds or fails, proceed (main order is already paid)
      await res.json()
    } catch {
      // Upsell failed — still continue
    } finally {
      setIsUpsellProcessing(false)
      completeCheckout()
    }
  }

  function handleUpsellDecline() {
    if (step === 'upsell') {
      setStep('downsell')
    } else {
      completeCheckout()
    }
  }

  function completeCheckout() {
    setStep('complete')
    clearCart()
    router.push(`/success?payment_intent_id=${paymentData?.paymentIntentId}`)
  }

  // Show nothing until hydrated
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Empty cart — will redirect
  if (items.length === 0 && step === 'form') {
    return null
  }

  const currentUpsellOffer = step === 'downsell' ? downsellOffer : upsellOffer

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <Elements stripe={getStripeClient()}>
                <CheckoutForm onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          </div>

          {/* Right: Order Summary (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {item.size} x {item.quantity}
                      </p>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {item.isSample ? 'FREE' : formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-gray-400 text-xs">Calculated next step</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-brand-gold font-bold text-lg">
                    {formatPrice(subtotal)}+
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure 256-bit SSL encryption
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  All major cards accepted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upsell / Downsell Modal */}
      <UpsellModal
        isOpen={step === 'upsell' || step === 'downsell'}
        offer={currentUpsellOffer}
        onAccept={() => handleUpsellAccept(currentUpsellOffer)}
        onDecline={handleUpsellDecline}
        isProcessing={isUpsellProcessing}
      />
    </div>
  )
}

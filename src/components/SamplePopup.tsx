'use client'

import { Fragment, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { useCartStore } from '@/lib/cart-store'
import { products } from '@/data/products'
import { formatPrice } from '@/lib/utils'

const STORAGE_KEY = 'jhb-sample-popup-shown'
const POPUP_DELAY = 2000

export default function SamplePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const { addItem, openCart } = useCartStore()

  // Registration form state
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return

    const timer = setTimeout(() => {
      setIsOpen(true)
      localStorage.setItem(STORAGE_KEY, 'true')
    }, POPUP_DELAY)

    return () => clearTimeout(timer)
  }, [])

  const handleGetSample = () => {
    setStep(2)
  }

  const handleRegisterSubmit = async () => {
    setError('')

    if (!firstName.trim()) {
      setError('Please enter your first name.')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          emailOptIn,
          smsOptIn,
        }),
      })
    } catch {
      // Network error — still give them the sample
      console.error('[SamplePopup] Subscribe request failed')
    }

    addItem({
      id: 'free-sample-2oz',
      name: 'FREE 2oz Jerk Sauce Sample',
      price: 599,
      image: '/images/products/jerk-sauce-2oz.jpg',
      size: '2oz',
      originalPrice: 699,
      isSample: true,
    })

    setIsSubmitting(false)
    setStep(3)
  }

  const handleAddUpsell = (product: typeof products[0]) => {
    const discountedPrice = Math.round(product.price * 0.75)
    addItem({
      id: `${product.id}-upsell-25`,
      name: product.name,
      price: discountedPrice,
      image: product.image,
      size: product.size,
      originalPrice: product.price,
    })
    setIsOpen(false)
    openCart()
  }

  const handleDismiss = () => {
    setIsOpen(false)
    if (step === 3) {
      openCart()
    }
  }

  const upsellProducts = products.filter(
    (p) => p.id !== 'jerk-sauce-2oz'
  )

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleDismiss} className="relative z-50">
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md bg-brand-dark border border-brand-gold/30 rounded-xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
                aria-label="Close popup"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {step === 1 ? (
                /* Step 1 — Hook */
                <div className="p-6 text-center">
                  <Image
                    src="/images/branding/logo-full.jpg"
                    alt="Jamaica House Brand"
                    width={60}
                    height={60}
                    className="rounded-sm mx-auto mb-4"
                  />
                  <DialogTitle className="text-2xl font-bold text-white mb-1">
                    Get a FREE 2oz Sample
                  </DialogTitle>
                  <p className="text-brand-gold font-semibold mb-4">
                    Just Pay $5.99 Shipping
                  </p>
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <Image
                      src="/images/products/jerk-sauce-2oz.jpg"
                      alt="Jamaica House Brand 2oz Jerk Sauce"
                      fill
                      sizes="160px"
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetSample}
                    className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg"
                  >
                    Get My Free Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="mt-3 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    No thanks
                  </button>
                </div>
              ) : step === 2 ? (
                /* Step 2 — Registration */
                <div className="p-6">
                  <DialogTitle className="text-xl font-bold text-white text-center mb-1">
                    Claim Your Free Sample
                  </DialogTitle>
                  <p className="text-gray-400 text-center text-sm mb-5">
                    Enter your info and we&apos;ll add the sample to your cart
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="popup-firstName" className="block text-sm text-gray-300 mb-1">
                        First Name <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        id="popup-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Your first name"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="popup-email" className="block text-sm text-gray-300 mb-1">
                        Email <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        id="popup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="popup-phone" className="block text-sm text-gray-300 mb-1">
                        Phone <span className="text-gray-500 text-xs">(optional)</span>
                      </label>
                      <input
                        id="popup-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Add your number for shipping updates &amp; exclusive deals
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailOptIn}
                          onChange={(e) => setEmailOptIn(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/10 text-brand-gold focus:ring-brand-gold"
                        />
                        <span className="text-gray-400 text-xs leading-tight">
                          Send me recipes, deals &amp; new drops
                        </span>
                      </label>

                      {phone.trim() && (
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smsOptIn}
                            onChange={(e) => setSmsOptIn(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/10 text-brand-gold focus:ring-brand-gold"
                          />
                          <span className="text-gray-400 text-xs leading-tight">
                            Text me exclusive offers
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm mt-3">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-5 bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Claim My Free Sample'}
                  </button>
                </div>
              ) : (
                /* Step 3 — Upsell */
                <div className="p-6">
                  <DialogTitle className="text-xl font-bold text-white text-center mb-1">
                    25% Off Any Additional Item
                  </DialogTitle>
                  <p className="text-gray-400 text-center text-sm mb-6">
                    Add to your order at a special discount
                  </p>

                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {upsellProducts.map((product) => {
                      const discountedPrice = Math.round(product.price * 0.75)
                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
                        >
                          <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                              {product.name}
                            </p>
                            <p className="text-gray-400 text-xs">{product.size}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-brand-gold font-bold text-sm">
                                {formatPrice(discountedPrice)}
                              </span>
                              <span className="text-gray-500 line-through text-xs">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddUpsell(product)}
                            className="bg-brand-gold text-brand-dark font-semibold text-sm px-4 py-2 rounded-md hover:bg-brand-gold-light transition-colors flex-shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full mt-4 text-gray-400 hover:text-white text-sm transition-colors text-center py-2"
                  >
                    No Thanks, View My Cart
                  </button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

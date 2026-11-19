'use client'

import { Fragment, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { useCartStore } from '@/lib/cart-store'

const SESSION_KEY = 'jhb-flash-sale-shown'
const POPUP_DELAY = 2000

// Flash Sale: 20oz (2×10oz) for $20
const FLASH_SALE_PRICE = 2000 // $20.00 in cents
const ORIGINAL_PRICE = 3998   // $39.98 (2 × $19.99)

export default function FlashSalePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
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
    if (sessionStorage.getItem(SESSION_KEY)) return

    const timer = setTimeout(() => {
      setIsOpen(true)
      sessionStorage.setItem(SESSION_KEY, 'true')
    }, POPUP_DELAY)

    return () => clearTimeout(timer)
  }, [])

  const handleClaimDeal = () => {
    setStep(2)
  }

  const handleSubmit = async () => {
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
      console.error('[FlashSalePopup] Subscribe request failed')
    }

    // Add the flash sale 2-pack to cart at $20
    addItem({
      id: 'flash-sale-20oz',
      name: 'FLASH SALE — Original Jerk Sauce 20oz',
      price: FLASH_SALE_PRICE,
      image: '/images/products/jerk-sauce-10oz.jpg',
      size: '2 × 10oz (20oz Total)',
      originalPrice: ORIGINAL_PRICE,
    })

    setIsSubmitting(false)
    setIsOpen(false)
    openCart()
  }

  const handleDismiss = () => {
    setIsOpen(false)
  }

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
                /* Step 1 — Flash Sale Hook */
                <div className="p-6 text-center">
                  {/* Flash badge */}
                  <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4 animate-pulse">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                    </svg>
                    Flash Sale
                  </div>

                  <DialogTitle className="text-3xl font-bold text-white mb-1">
                    20oz for $20
                  </DialogTitle>
                  <p className="text-brand-gold font-semibold text-lg mb-1">
                    That&apos;s 50% Off!
                  </p>
                  <p className="text-gray-400 text-sm mb-5">
                    Two 10oz bottles of our Original Jerk Sauce
                  </p>

                  {/* Product image */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <Image
                      src="/images/products/jerk-sauce-10oz.jpg"
                      alt="Jamaica House Brand Original Jerk Sauce 10oz"
                      fill
                      sizes="192px"
                      className="object-contain"
                    />
                    {/* Second bottle peek */}
                    <div className="absolute -right-4 top-2 w-32 h-32 opacity-60 rotate-12">
                      <Image
                        src="/images/products/jerk-sauce-10oz.jpg"
                        alt=""
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Price display */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-gray-500 line-through text-xl">$39.98</span>
                    <span className="text-white font-bold text-4xl">$20</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClaimDeal}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors text-lg"
                  >
                    Claim This Deal
                  </button>
                  <p className="text-gray-500 text-xs mt-3">
                    Limited time only. While supplies last.
                  </p>
                </div>
              ) : (
                /* Step 2 — Email capture + add to cart */
                <div className="p-6">
                  <DialogTitle className="text-xl font-bold text-white text-center mb-1">
                    Almost There!
                  </DialogTitle>
                  <p className="text-gray-400 text-center text-sm mb-5">
                    Enter your info to unlock the $20 deal
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="flash-firstName" className="block text-sm text-gray-300 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="flash-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Your first name"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="flash-email" className="block text-sm text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="flash-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="flash-phone" className="block text-sm text-gray-300 mb-1">
                        Phone <span className="text-gray-500 text-xs">(optional)</span>
                      </label>
                      <input
                        id="flash-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                      />
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
                          Send me deals, recipes &amp; new drops
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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-5 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding to Cart...' : 'Add to Cart — $20'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full mt-3 text-gray-400 hover:text-white text-sm transition-colors text-center py-2"
                  >
                    No thanks
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

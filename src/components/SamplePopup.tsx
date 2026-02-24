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
  const [step, setStep] = useState<1 | 2>(1)
  const { addItem, openCart } = useCartStore()

  useEffect(() => {
    // Only show once per visitor
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return

    const timer = setTimeout(() => {
      setIsOpen(true)
      localStorage.setItem(STORAGE_KEY, 'true')
    }, POPUP_DELAY)

    return () => clearTimeout(timer)
  }, [])

  const handleGetSample = () => {
    addItem({
      id: 'free-sample-2oz',
      name: 'FREE 2oz Jerk Sauce Sample',
      price: 599,
      image: '/images/products/jerk-sauce-2oz.jpg',
      size: '2oz',
      originalPrice: 699,
      isSample: true,
    })
    setStep(2)
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
    if (step === 2) {
      openCart()
    }
  }

  // Products available for upsell (exclude 2oz since they already get a sample)
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
                /* Step 1 — Free Sample */
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
              ) : (
                /* Step 2 — Upsell */
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

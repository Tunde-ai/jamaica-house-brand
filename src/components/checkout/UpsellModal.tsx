'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { formatPrice } from '@/lib/utils'
import type { UpsellOffer } from '@/data/upsell-config'

interface UpsellModalProps {
  isOpen: boolean
  offer: UpsellOffer
  onAccept: () => Promise<void>
  onDecline: () => void
  isProcessing: boolean
}

export default function UpsellModal({
  isOpen,
  offer,
  onAccept,
  onDecline,
  isProcessing,
}: UpsellModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => {}} className="relative z-50">
        {/* Backdrop — not dismissible */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </TransitionChild>

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
              <div className="p-6 text-center">
                {/* Badge */}
                <div className="inline-block bg-brand-gold/20 text-brand-gold text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                  One-Time Offer
                </div>

                <DialogTitle className="text-2xl font-bold text-white mb-2">
                  Wait! Add This to Your Order
                </DialogTitle>
                <p className="text-gray-400 text-sm mb-6">
                  Special price — only available right now
                </p>

                {/* Product image */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    sizes="192px"
                    className="object-contain"
                  />
                </div>

                {/* Product info */}
                <h3 className="text-white font-semibold text-lg">
                  {offer.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">{offer.size}</p>

                {/* Pricing */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-gray-500 line-through text-lg">
                    {formatPrice(offer.originalPrice)}
                  </span>
                  <span className="text-brand-gold font-bold text-2xl">
                    {formatPrice(offer.offerPrice)}
                  </span>
                </div>
                <p className="text-green-400 text-sm font-medium mb-6">
                  {offer.savingsText}
                </p>

                {/* Accept button */}
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={isProcessing}
                  className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Adding...' : 'Yes, Add to My Order!'}
                </button>

                {/* Decline link */}
                <button
                  type="button"
                  onClick={onDecline}
                  disabled={isProcessing}
                  className="mt-4 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
                >
                  No thanks, I don&apos;t want this deal
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

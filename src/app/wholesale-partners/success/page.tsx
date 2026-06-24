import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Order Confirmed | Jamaica House Brand',
}

export default function RestaurantOrderSuccessPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="max-w-md text-center py-20">
        <div className="w-20 h-20 rounded-full bg-brand-green/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Payment Received!
        </h1>

        <p className="text-gray-300 mb-8">
          Your wholesale order is confirmed. We&apos;ll be in touch within 24 hours to coordinate delivery. Check your email for a receipt.
        </p>

        <div className="bg-white/5 border border-brand-gold/20 rounded-xl p-6 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-brand-gold mt-0.5">1.</span>
            <p className="text-sm text-gray-300">We&apos;ll confirm your delivery date and logistics</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-brand-gold mt-0.5">2.</span>
            <p className="text-sm text-gray-300">Your order will be prepared and packaged</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-brand-gold mt-0.5">3.</span>
            <p className="text-sm text-gray-300">Delivery or pickup as scheduled</p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Questions? Call <a href="tel:7867091027" className="text-brand-gold hover:underline">786-709-1027</a>
        </p>

        <Link
          href="/"
          className="inline-block bg-brand-green text-white font-bold px-8 py-3 rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

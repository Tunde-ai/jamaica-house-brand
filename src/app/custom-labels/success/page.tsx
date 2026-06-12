import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Order Confirmed — Custom Labels',
}

export default function CustomLabelSuccessPage() {
  return (
    <div className="py-20 sm:py-28 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Order Submitted!
        </h1>

        <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto">
          Thank you for your custom label order. Here&apos;s what happens next:
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-left mb-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-dark font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">1</div>
            <div>
              <div className="font-semibold text-white">Label Proof (within 48 hours)</div>
              <div className="text-sm text-gray-400">Our design team will create a professional label proof and email it to you for approval.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-dark font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">2</div>
            <div>
              <div className="font-semibold text-white">Your Approval</div>
              <div className="text-sm text-gray-400">Review the proof. Request any changes — we&apos;ll revise until it&apos;s perfect.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-dark font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">3</div>
            <div>
              <div className="font-semibold text-white">Production Photos</div>
              <div className="text-sm text-gray-400">We produce your custom bottles and send you photos so you can see exactly what you&apos;re getting.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-dark font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">4</div>
            <div>
              <div className="font-semibold text-white">Pay &amp; Ship</div>
              <div className="text-sm text-gray-400">Once you confirm, we send a payment link. Pay in full and we ship directly to you.</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Questions? Email us at <a href="mailto:olatunde@jamaicahousebrand.com" className="text-brand-gold hover:underline">olatunde@jamaicahousebrand.com</a>
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-brand-gold text-brand-dark font-bold px-8 py-3 rounded-lg hover:bg-brand-gold-light transition-colors"
          >
            Shop More Sauces
          </Link>
          <Link
            href="/"
            className="border border-white/20 text-white font-bold px-8 py-3 rounded-lg hover:border-brand-gold hover:text-brand-gold transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

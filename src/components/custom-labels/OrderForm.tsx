'use client'

import { useState } from 'react'
import type { LabelData } from './LabelEditor'

const PRICE_PER_CASE = 8000 // $80.00 in cents
const MIN_CASES = 2
const BOTTLES_PER_CASE = 12

interface OrderFormProps {
  labelData: LabelData
}

export default function OrderForm({ labelData }: OrderFormProps) {
  const [cases, setCases] = useState(MIN_CASES)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const totalBottles = cases * BOTTLES_PER_CASE
  const setupFee = cases <= 5 ? 15000 : 30000 // $150 for 5 or less, $300 for 6+
  const subtotal = (cases * PRICE_PER_CASE) + setupFee

  const isValid =
    contactName.trim() &&
    contactEmail.trim() &&
    labelData.line1.trim() &&
    cases >= MIN_CASES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    try {
      const res = await fetch('/api/custom-label-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cases,
          totalBottles,
          subtotal,
          contactName,
          contactEmail,
          contactPhone,
          eventDate,
          notes,
          labelData,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        alert(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again or contact us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-brand-gold mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-2xl font-bold text-white mb-2">Order Submitted!</h3>
        <p className="text-gray-300">
          We&apos;ll create a professional label proof and email it to you for approval. Once approved, we&apos;ll produce your bottles and send photos before requesting payment.
          Check your email at <strong>{contactEmail}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Quantity Selector */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Order Quantity</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400">Cases (12 bottles each)</div>
              <div className="text-xs text-gray-500 mt-0.5">Minimum {MIN_CASES} cases</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCases(Math.max(MIN_CASES, cases - 1))}
                disabled={cases <= MIN_CASES}
                className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="text-3xl font-bold text-white w-12 text-center">{cases}</span>
              <button
                type="button"
                onClick={() => setCases(cases + 1)}
                className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{cases} cases × $80.00</span>
              <span className="text-white">${(cases * PRICE_PER_CASE / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Label setup &amp; design fee</span>
              <span className="text-white">${(setupFee / 100).toFixed(2)}</span>
            </div>
            {cases > 5 && (
              <div className="text-xs text-gray-500 italic">
                Higher volume setup fee for 6+ cases
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total bottles</span>
              <span className="text-white">{totalBottles} bottles</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-brand-gold">Total Due</span>
                <span className="text-brand-gold text-xl">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Full payment required before shipping. We&apos;ll send photos of your completed bottles for approval first.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="contactName" className="block text-sm text-gray-400 mb-1">Full Name *</label>
            <input
              id="contactName"
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm text-gray-400 mb-1">Email *</label>
            <input
              id="contactEmail"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm text-gray-400 mb-1">Phone</label>
            <input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-sm text-gray-400 mb-1">Event Date</label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="notes" className="block text-sm text-gray-400 mb-1">Special Instructions</label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific design requests, color preferences, or delivery instructions..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-white mb-2">How It Works</h4>
        <ol className="text-sm text-gray-400 space-y-1 mb-6 list-decimal list-inside">
          <li>Submit your order and label details below</li>
          <li>We create a professional label proof and email it for your approval</li>
          <li>Once approved, we produce your custom bottles</li>
          <li>We send you photos of the completed bottles for final confirmation</li>
          <li>Pay in full and we ship directly to you</li>
        </ol>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full bg-brand-gold text-brand-dark font-bold text-lg py-4 rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : `Submit Order — ${cases} Cases (${totalBottles} Bottles)`}
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          No payment required now. You&apos;ll approve the label proof and see photos of your completed bottles before paying.
        </p>
      </div>
    </form>
  )
}

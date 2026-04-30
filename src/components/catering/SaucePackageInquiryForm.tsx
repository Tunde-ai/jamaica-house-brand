'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

const GUEST_COUNT_OPTIONS = ['1–25', '26–50', '51–100', '100+']

interface SaucePackageInquiryFormProps {
  onBackToCarering: () => void
}

export default function SaucePackageInquiryForm({ onBackToCarering }: SaucePackageInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    shippingCity: '',
    shippingStateCountry: '',
    shippingPostalCode: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/sauce-package-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-12">
          <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Sauce Package Request Received!</h3>
          <p className="text-gray-400">
            Thanks! We'll send sauce package pricing within 48 hours.
          </p>
          <button
            onClick={onBackToCarering}
            className="mt-6 inline-flex items-center text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catering Form
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={onBackToCarering}
            className="inline-flex items-center text-brand-gold hover:text-brand-gold-light transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catering Form
          </button>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            We Ship Nationwide 🌎
          </h2>
          <p className="text-gray-400 mt-4">
            We don't cater outside South Florida — but we can ship our jerk sauce, escovitch,
            and pikliz to your event.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sauce-name" className="block text-sm text-gray-300 mb-1">
                Full Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="sauce-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="sauce-email" className="block text-sm text-gray-300 mb-1">
                Email <span className="text-brand-gold">*</span>
              </label>
              <input
                id="sauce-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Phone & Event Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sauce-phone" className="block text-sm text-gray-300 mb-1">
                Phone <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="sauce-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="sauce-eventDate" className="block text-sm text-gray-300 mb-1">
                Event Date <span className="text-brand-gold">*</span>
              </label>
              <input
                id="sauce-eventDate"
                name="eventDate"
                type="date"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <label htmlFor="sauce-guestCount" className="block text-sm text-gray-300 mb-1">
              Guest Count <span className="text-brand-gold">*</span>
            </label>
            <select
              id="sauce-guestCount"
              name="guestCount"
              required
              value={formData.guestCount}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
            >
              <option value="" className="bg-brand-dark">Select guest count</option>
              {GUEST_COUNT_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-brand-dark">{option} guests</option>
              ))}
            </select>
          </div>

          {/* Shipping Destination */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Shipping Destination</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sauce-shippingCity" className="block text-sm text-gray-300 mb-1">
                  City <span className="text-brand-gold">*</span>
                </label>
                <input
                  id="sauce-shippingCity"
                  name="shippingCity"
                  type="text"
                  required
                  value={formData.shippingCity}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <div>
                <label htmlFor="sauce-shippingStateCountry" className="block text-sm text-gray-300 mb-1">
                  State/Country <span className="text-brand-gold">*</span>
                </label>
                <input
                  id="sauce-shippingStateCountry"
                  name="shippingStateCountry"
                  type="text"
                  required
                  value={formData.shippingStateCountry}
                  onChange={handleChange}
                  placeholder="State or Country"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>
            <div className="max-w-sm">
              <label htmlFor="sauce-shippingPostalCode" className="block text-sm text-gray-300 mb-1">
                Postal Code <span className="text-brand-gold">*</span>
              </label>
              <input
                id="sauce-shippingPostalCode"
                name="shippingPostalCode"
                type="text"
                required
                value={formData.shippingPostalCode}
                onChange={handleChange}
                placeholder="ZIP or Postal Code"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="sauce-notes" className="block text-sm text-gray-300 mb-1">
              Notes <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="sauce-notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Sauce preferences, special requests, or other details..."
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-brand-red text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Request Sauce Package Quote'}
          </button>
        </form>
      </div>
    </section>
  )
}
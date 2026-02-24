'use client'

import { useState } from 'react'
import { guestCountOptions, eventTypes } from '@/data/catering'

export default function CateringQuoteForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    venue: '',
    proteins: '',
    message: '',
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
      const res = await fetch('/api/catering-quote', {
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
      <section id="quote-form" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-12">
          <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Quote Request Received!</h3>
          <p className="text-gray-400">
            Thank you for your interest in Jamaica House catering. Our team will review your request
            and get back to you within 24 hours with a custom quote.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="quote-form" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Get Started
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Request a Custom Quote
          </h2>
          <p className="text-gray-400 mt-4">
            Tell us about your event and we&apos;ll put together a personalized catering package.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="catering-name" className="block text-sm text-gray-300 mb-1">
                Full Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="catering-name"
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
              <label htmlFor="catering-email" className="block text-sm text-gray-300 mb-1">
                Email <span className="text-brand-gold">*</span>
              </label>
              <input
                id="catering-email"
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

          {/* Phone & Event Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="catering-phone" className="block text-sm text-gray-300 mb-1">
                Phone <span className="text-brand-gold">*</span>
              </label>
              <input
                id="catering-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="catering-eventType" className="block text-sm text-gray-300 mb-1">
                Event Type <span className="text-brand-gold">*</span>
              </label>
              <select
                id="catering-eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="" className="bg-brand-dark">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type} className="bg-brand-dark">{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Date & Guest Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="catering-eventDate" className="block text-sm text-gray-300 mb-1">
                Event Date <span className="text-brand-gold">*</span>
              </label>
              <input
                id="catering-eventDate"
                name="eventDate"
                type="date"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="catering-guestCount" className="block text-sm text-gray-300 mb-1">
                Guest Count <span className="text-brand-gold">*</span>
              </label>
              <select
                id="catering-guestCount"
                name="guestCount"
                required
                value={formData.guestCount}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="" className="bg-brand-dark">Select guest count</option>
                {guestCountOptions.map((option) => (
                  <option key={option} value={option} className="bg-brand-dark">{option} guests</option>
                ))}
              </select>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label htmlFor="catering-venue" className="block text-sm text-gray-300 mb-1">
              Venue / Location
            </label>
            <input
              id="catering-venue"
              name="venue"
              type="text"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Venue name or address"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {/* Preferred Proteins */}
          <div>
            <label htmlFor="catering-proteins" className="block text-sm text-gray-300 mb-1">
              Preferred Proteins
            </label>
            <input
              id="catering-proteins"
              name="proteins"
              type="text"
              value={formData.proteins}
              onChange={handleChange}
              placeholder="e.g., Jerk Chicken, Oxtail, Curry Goat"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="catering-message" className="block text-sm text-gray-300 mb-1">
              Additional Details
            </label>
            <textarea
              id="catering-message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Any dietary requirements, special requests, or other details..."
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
            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>
    </section>
  )
}

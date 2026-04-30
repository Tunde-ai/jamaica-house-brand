'use client'

import { useState, useEffect } from 'react'
import { guestCountOptions, eventTypes } from '@/data/catering'
import ServiceAreaBanner from './ServiceAreaBanner'
import SaucePackageInquiryForm from './SaucePackageInquiryForm'
import {
  FLORIDA_COUNTIES,
  US_STATES,
  SERVICE_AREA_COUNTIES,
  TIER_2_COUNTIES,
  OUT_OF_AREA_COUNTIES,
  type ServiceAreaStatus
} from '@/lib/florida-counties'
import { validatePhoneNumber } from '@/lib/phone-validation'

type FormMode = 'catering' | 'sauce-package'

export default function CateringQuoteForm() {
  const [mode, setMode] = useState<FormMode>('catering')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    venueState: 'Florida',
    venueCounty: '',
    venue: '',
    proteins: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [phoneWarning, setPhoneWarning] = useState('')
  const [countyNotice, setCountyNotice] = useState('')

  // Handle phone number validation on blur
  const handlePhoneBlur = () => {
    if (!formData.phone) return

    const validation = validatePhoneNumber(formData.phone)

    if (validation.isCaribbean || validation.isInternational) {
      setPhoneWarning(
        "We noticed this looks like an international number. Please confirm the event is in South Florida, or use the link below for sauce shipments."
      )
    } else {
      setPhoneWarning('')
    }
  }

  // Handle state change
  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      venueState: value,
      venueCounty: '' // Reset county when state changes
    }))

    // If non-Florida or Outside US, show sauce package form
    if (value === 'Outside US') {
      setMode('sauce-package')
    }

    setCountyNotice('')
  }

  // Handle county change
  const handleCountyChange = (value: string) => {
    setFormData(prev => ({ ...prev, venueCounty: value }))

    // Show notice based on county selection
    if (value) {
      const county = FLORIDA_COUNTIES.find(c => c.name === value)
      if (county) {
        if (county.status === 'tier_2') {
          setCountyNotice('Premium pricing applies. We\'ll confirm availability on follow-up.')
        } else if (county.status === 'out_of_area') {
          setCountyNotice('Premium pricing applies. We\'ll confirm availability on follow-up.')
        } else {
          setCountyNotice('')
        }
      }
    } else {
      setCountyNotice('')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === 'venueState') {
      handleStateChange(value)
    } else if (name === 'venueCounty') {
      handleCountyChange(value)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
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

  // Determine confirmation message based on service area
  const getConfirmationMessage = () => {
    if (formData.venueState === 'Florida' && formData.venueCounty) {
      const county = FLORIDA_COUNTIES.find(c => c.name === formData.venueCounty)
      if (county?.status === 'in_area') {
        return 'Thanks! Tunde will reach out within 24 hours to discuss your event.'
      } else if (county?.status === 'tier_2') {
        return 'Thanks! We\'ll confirm availability and send pricing within 48 hours.'
      }
    }
    return 'Thank you for your interest in Jamaica House catering. Our team will review your request and get back to you within 24 hours with a custom quote.'
  }

  // Show sauce package form if mode is switched
  if (mode === 'sauce-package') {
    return (
      <SaucePackageInquiryForm
        onBackToCarering={() => {
          setMode('catering')
          setFormData(prev => ({ ...prev, venueState: 'Florida' }))
        }}
      />
    )
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
            {getConfirmationMessage()}
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

        {/* Service Area Banner */}
        <ServiceAreaBanner />

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
                onBlur={handlePhoneBlur}
                placeholder="(555) 123-4567"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
              {phoneWarning && (
                <div className="mt-2 p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-lg">
                  <p className="text-sm text-brand-gold-light">{phoneWarning}</p>
                  <button
                    type="button"
                    onClick={() => setMode('sauce-package')}
                    className="mt-2 text-sm text-brand-gold hover:text-brand-gold-light underline"
                  >
                    Switch to Sauce Package Inquiry
                  </button>
                </div>
              )}
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

          {/* Venue State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="catering-venueState" className="block text-sm text-gray-300 mb-1">
                Venue State <span className="text-brand-gold">*</span>
              </label>
              <select
                id="catering-venueState"
                name="venueState"
                required
                value={formData.venueState}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="Florida" className="bg-brand-dark">Florida</option>
                {US_STATES.filter(state => state !== 'Florida').map((state) => (
                  <option key={state} value={state} className="bg-brand-dark">{state}</option>
                ))}
                <option value="Outside US" className="bg-brand-dark">Outside US</option>
              </select>
            </div>

            {/* Venue County (only show if Florida selected) */}
            {formData.venueState === 'Florida' && (
              <div>
                <label htmlFor="catering-venueCounty" className="block text-sm text-gray-300 mb-1">
                  Venue County <span className="text-brand-gold">*</span>
                </label>
                <select
                  id="catering-venueCounty"
                  name="venueCounty"
                  required
                  value={formData.venueCounty}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                >
                  <option value="" className="bg-brand-dark">Select county</option>

                  <optgroup label="✅ Service Area" className="bg-brand-dark">
                    {SERVICE_AREA_COUNTIES.map((county) => (
                      <option key={county.name} value={county.name} className="bg-brand-dark">
                        {county.name} County
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="⚠️ Tier 2 (Premium)" className="bg-brand-dark">
                    {TIER_2_COUNTIES.map((county) => (
                      <option key={county.name} value={county.name} className="bg-brand-dark">
                        {county.name} County
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="⚠️ Other Florida — Limited Availability" className="bg-brand-dark">
                    {OUT_OF_AREA_COUNTIES.map((county) => (
                      <option key={county.name} value={county.name} className="bg-brand-dark">
                        {county.name} County
                      </option>
                    ))}
                  </optgroup>
                </select>

                {countyNotice && (
                  <p className="mt-2 text-sm text-brand-gold-light">{countyNotice}</p>
                )}
              </div>
            )}
          </div>

          {/* Show different message if non-Florida state */}
          {formData.venueState && formData.venueState !== 'Florida' && formData.venueState !== 'Outside US' && (
            <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4">
              <p className="text-brand-gold-light text-sm">
                We don't currently provide catering outside of Florida. Would you like to inquire about
                shipping our sauces to your event instead?
              </p>
              <button
                type="button"
                onClick={() => setMode('sauce-package')}
                className="mt-3 text-sm bg-brand-gold text-brand-dark px-4 py-2 rounded-lg hover:bg-brand-gold-light transition-colors"
              >
                Switch to Sauce Package Inquiry
              </button>
            </div>
          )}

          {/* Only show remaining fields if Florida and in service area */}
          {(formData.venueState === 'Florida' || !formData.venueState) && (
            <>
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
            </>
          )}

          {error && (
            <p className="text-brand-red text-sm">{error}</p>
          )}

          {/* Only show submit button for Florida events */}
          {(formData.venueState === 'Florida' || !formData.venueState) && (
            <button
              type="submit"
              disabled={isSubmitting || (formData.venueState === 'Florida' && !formData.venueCounty)}
              className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          )}
        </form>
      </div>
    </section>
  )
}
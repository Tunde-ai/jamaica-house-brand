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
type ServiceArea = 'miami' | 'jamaica' | 'atlanta' | 'other'

export default function CateringQuoteForm() {
  const [mode, setMode] = useState<FormMode>('catering')
  const [serviceArea, setServiceArea] = useState<ServiceArea>('miami')
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
    serviceArea: 'miami' as ServiceArea,
    jamaicaAddress: '',
    atlantaAddress: '',
    otherLocationDetails: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [phoneWarning, setPhoneWarning] = useState('')
  const [countyNotice, setCountyNotice] = useState('')

  // Handle service area change
  const handleServiceAreaChange = (area: ServiceArea) => {
    setServiceArea(area)
    setFormData(prev => ({
      ...prev,
      serviceArea: area,
      // Reset location fields when changing areas
      jamaicaAddress: area === 'jamaica' ? prev.jamaicaAddress : '',
      atlantaAddress: area === 'atlanta' ? prev.atlantaAddress : '',
      otherLocationDetails: area === 'other' ? prev.otherLocationDetails : '',
      // Reset venue fields
      venueState: area === 'miami' ? 'Florida' : '',
      venueCounty: area === 'miami' ? prev.venueCounty : '',
    }))
    setCountyNotice('')
    setPhoneWarning('')
  }

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

    // Additional client-side validation
    if (serviceArea === 'jamaica' && !formData.jamaicaAddress.trim()) {
      setError('Please provide the event address for Jamaica delivery.')
      setIsSubmitting(false)
      return
    }

    if (serviceArea === 'atlanta' && !formData.atlantaAddress.trim()) {
      setError('Please provide the event address for Atlanta delivery.')
      setIsSubmitting(false)
      return
    }

    if (serviceArea === 'other' && !formData.otherLocationDetails.trim()) {
      setError('Please provide details about your event location.')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/catering-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceArea,
        }),
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
    switch (serviceArea) {
      case 'miami':
        if (formData.venueState === 'Florida' && formData.venueCounty) {
          const county = FLORIDA_COUNTIES.find(c => c.name === formData.venueCounty)
          if (county?.status === 'in_area') {
            return 'Thanks! Tunde will reach out within 24 hours to discuss your event in Miami/Broward.'
          } else if (county?.status === 'tier_2') {
            return 'Thanks! We\'ll confirm availability and send pricing within 48 hours for your Miami/Broward event.'
          }
        }
        return 'Thank you for your Miami/Broward catering request. Our team will review and get back to you within 24 hours.'

      case 'jamaica':
        return 'Thank you for your Jamaica catering request! We\'ll review your event details and location, then reach out within 24 hours with availability and custom pricing for your Jamaica event.'

      case 'atlanta':
        return 'Thank you for your Atlanta catering request! Our Atlanta partner will review your event details and reach out within 24 hours with availability and custom pricing for your Georgia event.'

      case 'other':
        return 'Thank you for your catering inquiry! We\'ll review your location details and determine if we can service your area. Our team will get back to you as soon as possible.'

      default:
        return 'Thank you for your interest in Jamaica House catering. Our team will review your request and get back to you within 24 hours with a custom quote.'
    }
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
          {/* Service Area Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Service Area</h3>
              <p className="text-gray-400 text-sm mb-4">Select your event location to see available delivery options and pricing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${serviceArea === 'miami'
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-white/20 bg-white/5 hover:border-brand-gold/50'
                }
              `}>
                <input
                  type="radio"
                  name="serviceArea"
                  value="miami"
                  checked={serviceArea === 'miami'}
                  onChange={() => handleServiceAreaChange('miami')}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                  ${serviceArea === 'miami' ? 'border-brand-gold' : 'border-white/40'}
                `}>
                  {serviceArea === 'miami' && (
                    <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                  )}
                </div>
                <span className="text-white font-medium">Miami/Broward, Florida</span>
              </label>

              <label className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${serviceArea === 'jamaica'
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-white/20 bg-white/5 hover:border-brand-gold/50'
                }
              `}>
                <input
                  type="radio"
                  name="serviceArea"
                  value="jamaica"
                  checked={serviceArea === 'jamaica'}
                  onChange={() => handleServiceAreaChange('jamaica')}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                  ${serviceArea === 'jamaica' ? 'border-brand-gold' : 'border-white/40'}
                `}>
                  {serviceArea === 'jamaica' && (
                    <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                  )}
                </div>
                <span className="text-white font-medium">Jamaica</span>
              </label>

              <label className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${serviceArea === 'atlanta'
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-white/20 bg-white/5 hover:border-brand-gold/50'
                }
              `}>
                <input
                  type="radio"
                  name="serviceArea"
                  value="atlanta"
                  checked={serviceArea === 'atlanta'}
                  onChange={() => handleServiceAreaChange('atlanta')}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                  ${serviceArea === 'atlanta' ? 'border-brand-gold' : 'border-white/40'}
                `}>
                  {serviceArea === 'atlanta' && (
                    <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                  )}
                </div>
                <span className="text-white font-medium">Atlanta, Georgia</span>
              </label>

              <label className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${serviceArea === 'other'
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-white/20 bg-white/5 hover:border-brand-gold/50'
                }
              `}>
                <input
                  type="radio"
                  name="serviceArea"
                  value="other"
                  checked={serviceArea === 'other'}
                  onChange={() => handleServiceAreaChange('other')}
                  className="sr-only"
                />
                <div className={`
                  w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                  ${serviceArea === 'other' ? 'border-brand-gold' : 'border-white/40'}
                `}>
                  {serviceArea === 'other' && (
                    <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                  )}
                </div>
                <span className="text-white font-medium">Other Location</span>
              </label>
            </div>

            {/* Service Area Info Messages */}
            {serviceArea === 'miami' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Miami/Broward Delivery Zones</h4>
                <div className="space-y-1 text-sm text-green-300">
                  <div className="flex justify-between">
                    <span><strong>Pickup:</strong></span>
                    <span className="text-green-400 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Within 10 miles:</span>
                    <span className="text-green-400 font-semibold">FREE on orders $250+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>11-20 miles:</span>
                    <span className="text-brand-gold font-semibold">$25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>21-35 miles:</span>
                    <span className="text-brand-gold font-semibold">$45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beyond 35 miles:</span>
                    <span className="text-gray-400">Contact us for pricing</span>
                  </div>
                </div>
                <p className="text-xs text-green-300 mt-2">7-day advance notice required. Fees per order, not per tray.</p>
              </div>
            )}

            {serviceArea === 'jamaica' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">🇯🇲</span>
                  <h4 className="text-blue-400 font-medium">Jamaica Delivery</h4>
                </div>
                <p className="text-blue-300 text-sm mb-3">
                  Please provide your event address so we can confirm availability and send custom pricing for Jamaica delivery.
                </p>
                <div>
                  <label htmlFor="jamaica-address" className="block text-sm text-blue-300 mb-2">
                    Event Address & Details <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    id="jamaica-address"
                    name="jamaicaAddress"
                    rows={3}
                    required={serviceArea === 'jamaica'}
                    value={formData.jamaicaAddress}
                    onChange={handleChange}
                    placeholder="Please include the full address, venue name (if applicable), and any special access instructions for your event location in Jamaica."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
                  />
                </div>
                <p className="text-xs text-blue-300 mt-2">We'll reach out within 24 hours with availability and pricing for your Jamaica location.</p>
              </div>
            )}

            {serviceArea === 'atlanta' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">🏢</span>
                  <h4 className="text-purple-400 font-medium">Atlanta Area Delivery</h4>
                </div>
                <p className="text-purple-300 text-sm mb-3">
                  Please provide your event address so we can confirm availability and send custom pricing for Atlanta area delivery.
                </p>
                <div>
                  <label htmlFor="atlanta-address" className="block text-sm text-purple-300 mb-2">
                    Event Address & Details <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    id="atlanta-address"
                    name="atlantaAddress"
                    rows={3}
                    required={serviceArea === 'atlanta'}
                    value={formData.atlantaAddress}
                    onChange={handleChange}
                    placeholder="Please include the full address, venue name (if applicable), and any special access instructions for your event location in Atlanta, Georgia."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
                  />
                </div>
                <p className="text-xs text-purple-300 mt-2">We'll reach out within 24 hours with availability and pricing for your Atlanta location.</p>
              </div>
            )}

            {serviceArea === 'other' && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">❓</span>
                  <h4 className="text-orange-400 font-medium">Other Location</h4>
                </div>
                <p className="text-orange-300 text-sm mb-3">
                  Contact us to check if we can service your area. We're always exploring new locations!
                </p>
                <div>
                  <label htmlFor="other-location" className="block text-sm text-orange-300 mb-2">
                    Location Details <span className="text-brand-gold">*</span>
                  </label>
                  <textarea
                    id="other-location"
                    name="otherLocationDetails"
                    rows={3}
                    required={serviceArea === 'other'}
                    value={formData.otherLocationDetails}
                    onChange={handleChange}
                    placeholder="Please tell us about your event location - city, state, venue details, and any other information that would help us determine if we can serve your area."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors resize-none"
                  />
                </div>
                <p className="text-xs text-orange-300 mt-2">We'll review your request and get back to you as soon as possible.</p>
              </div>
            )}
          </div>
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

          {/* Venue State/County (only show for Miami service area) */}
          {serviceArea === 'miami' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="catering-venueState" className="block text-sm text-gray-300 mb-1">
                  Venue State <span className="text-brand-gold">*</span>
                </label>
                <select
                  id="catering-venueState"
                  name="venueState"
                  required={serviceArea === 'miami'}
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
                    required={serviceArea === 'miami'}
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
          )}

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

          {/* Show remaining fields for all service areas */}
          {(
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

          {/* Submit button - show for all service areas */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              (serviceArea === 'miami' && formData.venueState === 'Florida' && !formData.venueCounty) ||
              (serviceArea === 'jamaica' && !formData.jamaicaAddress.trim()) ||
              (serviceArea === 'atlanta' && !formData.atlantaAddress.trim()) ||
              (serviceArea === 'other' && !formData.otherLocationDetails.trim())
            }
            className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      </div>
    </section>
  )
}
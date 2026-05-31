'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { trayCategories, deliveryTiers } from '@/data/catering-menu'
import { earlyBookingDiscounts } from '@/lib/discounts/early-booking'
import type { DiscountOffer, DiscountApplication } from '@/lib/discounts/early-booking'

type ServiceArea = 'miami' | 'jamaica' | 'atlanta' | 'other'

interface FormData {
  name: string
  email: string
  phone: string
  eventDate: string
  guestCount: string
  deliveryMethod: 'pickup' | 'delivery'
  zipCode: string
  selectedItems: {
    [key: string]: {
      small: number
      large: number
    }
  }
  notes: string
  actionType: 'quote_only' | 'pay_deposit'
  serviceArea: ServiceArea
  jamaicaAddress: string
  atlantaAddress: string
  otherLocationDetails: string
}

interface FormErrors {
  [key: string]: string
}

export default function CateringMenuQuoteForm() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [availableOffers, setAvailableOffers] = useState<DiscountOffer[]>([])
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null)
  const [discountApplication, setDiscountApplication] = useState<DiscountApplication | null>(null)

  const [serviceArea, setServiceArea] = useState<ServiceArea>('miami')

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
      // Reset delivery fields
      zipCode: area === 'miami' ? prev.zipCode : '',
    }))
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    deliveryMethod: 'pickup',
    zipCode: '',
    selectedItems: {},
    notes: '',
    actionType: 'pay_deposit',
    serviceArea: 'miami',
    jamaicaAddress: '',
    atlantaAddress: '',
    otherLocationDetails: '',
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Basic required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required'
    if (!formData.guestCount.trim()) newErrors.guestCount = 'Guest count is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{10,}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Guest count validation
    const guestCount = parseInt(formData.guestCount)
    if (formData.guestCount && (isNaN(guestCount) || guestCount < 1)) {
      newErrors.guestCount = 'Please enter a valid number of guests'
    }

    // Event date validation (7-day minimum notice)
    if (formData.eventDate) {
      const eventDate = new Date(formData.eventDate)
      const today = new Date()
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      if (eventDate < sevenDaysFromNow) {
        newErrors.eventDate = 'Orders require 7 days advance notice. Please call us directly for urgent requests.'
      }
    }

    // Service area specific validation
    if (formData.serviceArea === 'jamaica' && !formData.jamaicaAddress.trim()) {
      newErrors.jamaicaAddress = 'Please provide the event address for Jamaica delivery'
    }

    if (formData.serviceArea === 'atlanta' && !formData.atlantaAddress.trim()) {
      newErrors.atlantaAddress = 'Please provide the event address for Atlanta delivery'
    }

    if (formData.serviceArea === 'other' && !formData.otherLocationDetails.trim()) {
      newErrors.otherLocationDetails = 'Please provide details about your event location'
    }

    // Delivery method validation (only for Miami area)
    if (formData.serviceArea === 'miami' && formData.deliveryMethod === 'delivery' && !formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required for delivery'
    }

    // Check if any items are selected
    const hasSelectedItems = Object.values(formData.selectedItems).some(
      item => item.small > 0 || item.large > 0
    )
    if (!hasSelectedItems) {
      newErrors.selectedItems = 'Please select at least one tray'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateDeliveryFee = (): number => {
    if (formData.deliveryMethod === 'pickup') return 0

    // This is a simplified calculation - in reality, you'd use a distance API
    // For now, we'll base it on ZIP code ranges (this is just for demo)
    const zipCode = formData.zipCode
    if (!zipCode) return 0

    // Simplified zone calculation based on ZIP (this would be more sophisticated in reality)
    const zip = parseInt(zipCode.substring(0, 3))
    if (zip >= 330 && zip <= 334) return 0 // Within 10 miles, but still need to check order total
    if (zip >= 320 && zip <= 339) return 25 // 11-20 miles
    return 45 // 21-35 miles
  }

  const calculateOrderTotal = (): number => {
    return Object.entries(formData.selectedItems).reduce((total, [itemName, quantities]) => {
      const item = trayCategories
        .flatMap(cat => cat.items)
        .find(item => item.name === itemName)

      if (!item) return total

      return total + (quantities.small * item.smallPrice) + (quantities.large * item.largePrice)
    }, 0)
  }

  // Update available discounts when order details change
  useEffect(() => {
    if (formData.eventDate && calculateOrderTotal() > 0) {
      const orderTotal = calculateOrderTotal()
      const offers = earlyBookingDiscounts.getAvailableOffers(orderTotal, formData.eventDate)
      setAvailableOffers(offers)

      // Auto-select best offer for pay_deposit mode
      if (formData.actionType === 'pay_deposit' && offers.length > 0) {
        const bestOffer = earlyBookingDiscounts.getBestOffer(orderTotal, formData.eventDate)
        if (bestOffer) {
          setSelectedDiscount(bestOffer.id)
          const discount = earlyBookingDiscounts.calculateDiscount(orderTotal, formData.eventDate, bestOffer.id)
          setDiscountApplication(discount)
        }
      } else if (formData.actionType === 'quote_only') {
        setSelectedDiscount(null)
        setDiscountApplication(null)
      }
    } else {
      setAvailableOffers([])
      setSelectedDiscount(null)
      setDiscountApplication(null)
    }
  }, [formData.selectedItems, formData.eventDate, formData.actionType])

  const applyDiscount = (offerId: string) => {
    const orderTotal = calculateOrderTotal()
    const discount = earlyBookingDiscounts.calculateDiscount(orderTotal, formData.eventDate, offerId)
    setSelectedDiscount(offerId)
    setDiscountApplication(discount)
  }

  const removeDiscount = () => {
    setSelectedDiscount(null)
    setDiscountApplication(null)
  }

  const updateItemQuantity = (itemName: string, size: 'small' | 'large', quantity: number) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: {
        ...prev.selectedItems,
        [itemName]: {
          ...prev.selectedItems[itemName],
          [size]: Math.max(0, quantity),
        },
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const orderTotal = calculateOrderTotal()
      const deliveryFee = calculateDeliveryFee()
      const finalDeliveryFee = formData.deliveryMethod === 'pickup'
        ? 0
        : orderTotal >= 250 && deliveryFee === 0
        ? 0
        : deliveryFee

      const response = await fetch('/api/catering-menu-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orderTotal,
          deliveryFee: finalDeliveryFee,
          discountApplication,
          selectedDiscountId: selectedDiscount,
          finalTotal: discountApplication ? discountApplication.finalTotal + finalDeliveryFee - (discountApplication.originalTotal - orderTotal) : orderTotal + finalDeliveryFee,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          eventDate: '',
          guestCount: '',
          deliveryMethod: 'pickup',
          zipCode: '',
          selectedItems: {},
          notes: '',
          actionType: 'pay_deposit',
          serviceArea: 'miami',
          jamaicaAddress: '',
          atlantaAddress: '',
          otherLocationDetails: '',
        })
      } else {
        throw new Error('Failed to submit quote request')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('There was an error submitting your request. Please try again or call us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-20 px-4 bg-brand-dark">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 border border-brand-gold/30 rounded-2xl p-8">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-4">Quote Request Received!</h3>
            <p className="text-gray-300 mb-6">
              Thank you for your catering request. We'll review your order and get back to you
              within 24 hours with a detailed quote and next steps.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📧 Confirmation sent to your email</p>
              <p>📞 Questions? Call us at (786) 709-1027</p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-brand-gold hover:text-brand-gold-light transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </section>
    )
  }

  const orderTotal = calculateOrderTotal()
  const deliveryFee = formData.deliveryMethod === 'pickup' ? 0 : calculateDeliveryFee()
  const finalDeliveryFee = orderTotal >= 250 && deliveryFee === 0 ? 0 : deliveryFee
  const subtotalWithDelivery = orderTotal + finalDeliveryFee
  const discountAmount = discountApplication?.discountAmount || 0
  const finalTotal = discountApplication ? discountApplication.finalTotal + finalDeliveryFee - (discountApplication.originalTotal - orderTotal) : subtotalWithDelivery

  return (
    <section id="quote-form" ref={ref} className="py-20 px-4 bg-brand-dark">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Request a Quote
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            Place Your Tray Order
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Fill out the form below and we'll get back to you with a detailed quote within 24 hours
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div
            className={`bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h3 className="text-white font-bold text-xl mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-white font-medium mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="(xxx) xxx-xxxx"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="guestCount" className="block text-white font-medium mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  id="guestCount"
                  value={formData.guestCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="Enter guest count"
                  min="1"
                />
                {errors.guestCount && <p className="text-red-400 text-sm mt-1">{errors.guestCount}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="eventDate" className="block text-white font-medium mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="eventDate"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                {errors.eventDate && <p className="text-red-400 text-sm mt-1">{errors.eventDate}</p>}
              </div>
            </div>
          </div>

          {/* Service Area Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">Service Area</h3>
            <p className="text-gray-400 mb-6">Select your event location to see available delivery options and pricing.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <label className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${serviceArea === 'miami'
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-white/20 hover:border-brand-gold/50'
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
                  : 'border-white/20 hover:border-brand-gold/50'
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
                  : 'border-white/20 hover:border-brand-gold/50'
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
                  : 'border-white/20 hover:border-brand-gold/50'
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
                <h4 className="text-green-400 font-medium mb-3">Miami/Broward Delivery Zones</h4>
                <div className="space-y-2 text-sm text-green-300">
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
                <p className="text-xs text-green-300 mt-3">7-day advance notice required. Fees per order, not per tray.</p>
              </div>
            )}

            {serviceArea === 'jamaica' && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">🇯🇲</span>
                  <h4 className="text-blue-400 font-medium">Jamaica Delivery</h4>
                </div>
                <p className="text-blue-300 text-sm mb-4">
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
                    value={formData.jamaicaAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, jamaicaAddress: e.target.value }))}
                    placeholder="Please include the full address, venue name (if applicable), and any special access instructions for your event location in Jamaica."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                  />
                  {errors.jamaicaAddress && <p className="text-red-400 text-sm mt-1">{errors.jamaicaAddress}</p>}
                </div>
                <p className="text-xs text-blue-300 mt-3">We'll reach out within 24 hours with availability and pricing for your Jamaica location.</p>
              </div>
            )}

            {serviceArea === 'atlanta' && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">🏢</span>
                  <h4 className="text-purple-400 font-medium">Atlanta Area Delivery</h4>
                </div>
                <p className="text-purple-300 text-sm mb-4">
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
                    value={formData.atlantaAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, atlantaAddress: e.target.value }))}
                    placeholder="Please include the full address, venue name (if applicable), and any special access instructions for your event location in Atlanta, Georgia."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                  />
                  {errors.atlantaAddress && <p className="text-red-400 text-sm mt-1">{errors.atlantaAddress}</p>}
                </div>
                <p className="text-xs text-purple-300 mt-3">We'll reach out within 24 hours with availability and pricing for your Atlanta location.</p>
              </div>
            )}

            {serviceArea === 'other' && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-2">❓</span>
                  <h4 className="text-orange-400 font-medium">Other Location</h4>
                </div>
                <p className="text-orange-300 text-sm mb-4">
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
                    value={formData.otherLocationDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherLocationDetails: e.target.value }))}
                    placeholder="Please tell us about your event location - city, state, venue details, and any other information that would help us determine if we can serve your area."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
                  />
                  {errors.otherLocationDetails && <p className="text-red-400 text-sm mt-1">{errors.otherLocationDetails}</p>}
                </div>
                <p className="text-xs text-orange-300 mt-3">We'll review your request and get back to you as soon as possible.</p>
              </div>
            )}
          </div>

          {/* Delivery Method - Only show for Miami area */}
          {serviceArea === 'miami' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-6">Delivery Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.deliveryMethod === 'pickup'
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }))}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={() => {}}
                    className="text-brand-gold"
                  />
                  <span className="text-white font-medium">Free Pickup</span>
                  <span className="bg-brand-gold text-brand-dark px-2 py-1 rounded text-xs font-bold">
                    FREE
                  </span>
                </div>
                <p className="text-gray-400 text-sm ml-6">
                  Pick up your order at our Miami Gardens location
                </p>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.deliveryMethod === 'delivery'
                    ? 'border-brand-gold bg-brand-gold/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'delivery' }))}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={() => {}}
                    className="text-brand-gold"
                  />
                  <span className="text-white font-medium">Delivery</span>
                </div>
                <p className="text-gray-400 text-sm ml-6">
                  We'll deliver to your location (fees apply)
                </p>
              </div>
            </div>

            {formData.deliveryMethod === 'delivery' && (
              <div className="mt-6">
                <label htmlFor="zipCode" className="block text-white font-medium mb-2">
                  Delivery ZIP Code *
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full max-w-xs px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  placeholder="33169"
                />
                {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                {deliveryFee > 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Estimated delivery fee: ${deliveryFee}
                    {orderTotal >= 250 && deliveryFee === 0 && " (FREE on orders $250+)"}
                  </p>
                )}
              </div>
            )}
            </div>
          )}

          {/* Tray Selection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-6">Select Your Trays</h3>
            {errors.selectedItems && (
              <p className="text-red-400 text-sm mb-4">{errors.selectedItems}</p>
            )}

            {trayCategories.map((category) => (
              <div key={category.id} className="mb-8">
                <h4 className="text-brand-gold font-semibold text-lg mb-4">{category.title}</h4>
                <div className="space-y-4">
                  {category.items.map((item) => {
                    const quantities = formData.selectedItems[item.name] || { small: 0, large: 0 }
                    return (
                      <div key={item.name} className="border border-white/10 rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="text-white font-medium text-lg">{item.name}</h5>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-white text-sm min-w-[60px]">Small ($${item.smallPrice}):</span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.name, 'small', quantities.small - 1)}
                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded text-white font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-white font-medium">
                                {quantities.small}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.name, 'small', quantities.small + 1)}
                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded text-white font-bold"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-white text-sm min-w-[60px]">Large ($${item.largePrice}):</span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.name, 'large', quantities.large - 1)}
                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded text-white font-bold"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-white font-medium">
                                {quantities.large}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.name, 'large', quantities.large + 1)}
                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded text-white font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Early Booking Discounts */}
          {availableOffers.length > 0 && formData.actionType === 'pay_deposit' && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-400/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎁</span>
                <h3 className="text-white font-bold text-xl">Limited Time Savings!</h3>
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                  EXCLUSIVE
                </span>
              </div>

              <div className="space-y-3">
                {availableOffers.map((offer) => {
                  const isSelected = selectedDiscount === offer.id
                  const urgencyMessage = earlyBookingDiscounts.generateUrgencyMessage(offer)

                  return (
                    <div
                      key={offer.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-white/20 hover:border-green-400/50'
                      }`}
                      onClick={() => applyDiscount(offer.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-semibold">{offer.name}</span>
                            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                              {offer.badge}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{offer.description}</p>
                          <div className="text-green-400 text-sm font-medium mb-2">
                            {urgencyMessage}
                          </div>
                          <div className="text-gray-400 text-xs space-y-1">
                            {offer.conditions.map((condition, idx) => (
                              <div key={idx}>• {condition}</div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-lg">
                            Save ${((orderTotal * offer.discountPercentage) / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {selectedDiscount && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={removeDiscount}
                      className="text-gray-400 hover:text-white text-sm underline"
                    >
                      Remove discount
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          {orderTotal > 0 && (
            <div className="bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Order Summary</h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-white">
                  <span>Subtotal:</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Delivery Fee:</span>
                  <span>${finalDeliveryFee.toFixed(2)}</span>
                </div>
                {discountApplication && (
                  <div className="flex justify-between text-green-400 font-semibold">
                    <span>Discount ({discountApplication.discountPercentage}% off):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-brand-gold/20 pt-2 flex justify-between text-white font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    {discountApplication && (
                      <span className="line-through text-gray-500 text-base mr-2">
                        ${subtotalWithDelivery.toFixed(2)}
                      </span>
                    )}
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
                {discountApplication && (
                  <div className="text-center">
                    <div className="text-green-400 font-semibold text-lg">
                      🎉 {discountApplication.savingsMessage}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Type Selection */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold text-lg mb-3">🤔 What would you like to do?</h4>

                {/* Pay Deposit Option */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.actionType === 'pay_deposit'
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, actionType: 'pay_deposit' }))}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="actionType"
                      value="pay_deposit"
                      checked={formData.actionType === 'pay_deposit'}
                      onChange={() => {}}
                      className="text-brand-gold mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold">🎯 Secure Your Date Now</span>
                        <span className="bg-brand-gold text-brand-dark px-2 py-1 rounded text-xs font-bold">
                          RECOMMENDED
                        </span>
                      </div>
                      <div className="text-gray-300 text-sm space-y-1">
                        <div>• Pay $${Math.round(finalTotal * 0.33).toFixed(2)} deposit (33%)</div>
                        {discountApplication && (
                          <div className="text-green-400 font-semibold">
                            • 🎁 {discountApplication.discountPercentage}% instant discount applied!
                          </div>
                        )}
                        <div>• 🔒 Your date is instantly reserved</div>
                        <div>• ⚡ No waiting - immediate confirmation</div>
                        <div>• 💳 Balance due 2 weeks before event</div>
                        <div>• 🔄 Flexible refund policy</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quote Only Option */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.actionType === 'quote_only'
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, actionType: 'quote_only' }))}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="actionType"
                      value="quote_only"
                      checked={formData.actionType === 'quote_only'}
                      onChange={() => {}}
                      className="text-brand-gold mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold">📝 Get Quote First</span>
                      </div>
                      <div className="text-gray-300 text-sm space-y-1">
                        <div>• We'll email you a detailed quote</div>
                        <div>• ⏱️ Response within 24 hours</div>
                        <div>• 💬 Opportunity to discuss modifications</div>
                        <div>• ⚠️ Date not reserved until deposit paid</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label htmlFor="notes" className="block text-white font-medium mb-3">
              Special Requests or Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
              placeholder="Any dietary restrictions, setup requirements, or special requests?"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-gold text-brand-dark font-bold px-12 py-4 rounded-lg hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? 'Processing...' :
                formData.actionType === 'pay_deposit'
                  ? `🚀 Secure Date - Pay $${Math.round(finalTotal * 0.33).toFixed(2)} Deposit${discountApplication ? ' (Discounted!)' : ''}`
                  : '📝 Request Quote Only'
              }
            </button>
            <p className="text-gray-500 text-sm mt-4">
              {formData.actionType === 'pay_deposit'
                ? 'Your date will be instantly reserved with payment confirmation'
                : 'We\'ll respond within 24 hours with your detailed quote'
              }
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCartStore, CartItem } from '@/lib/cart-store'
import { formatPrice } from '@/lib/utils'
import { usStates } from '@/data/membership'

type Step = 'shipping' | 'payment'

interface ShippingData {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zip: string
}

interface CheckoutFormProps {
  onPaymentSuccess: (data: {
    paymentIntentId: string
    customerId: string
  }) => void
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
}

export default function CheckoutForm({ onPaymentSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { items } = useCartStore()

  const [step, setStep] = useState<Step>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Shipping form state
  const [shipping, setShipping] = useState<ShippingData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })
  const [shippingOption, setShippingOption] = useState('standard')

  // Payment intent data from Step 1
  const [clientSecret, setClientSecret] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isFreeShipping = subtotal >= 5000
  const shippingCost =
    shippingOption === 'express'
      ? 1299
      : isFreeShipping || shippingOption === 'free'
        ? 0
        : 599
  const total = subtotal + shippingCost

  function updateField(field: keyof ShippingData, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function validateShipping(): boolean {
    if (!shipping.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!shipping.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!shipping.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      setError('Valid email is required')
      return false
    }
    if (!shipping.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!shipping.city.trim()) {
      setError('City is required')
      return false
    }
    if (!shipping.state) {
      setError('State is required')
      return false
    }
    if (!shipping.zip.trim() || !/^\d{5}(-\d{4})?$/.test(shipping.zip.trim())) {
      setError('Valid ZIP code is required (e.g. 12345)')
      return false
    }
    return true
  }

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!validateShipping()) return

    setIsProcessing(true)

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          shipping,
          shippingOption: isFreeShipping && shippingOption !== 'express' ? 'free' : shippingOption,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to initialize payment')
        setIsProcessing(false)
        return
      }

      setClientSecret(data.clientSecret)
      setCustomerId(data.customerId)
      setPaymentIntentId(data.paymentIntentId)
      setStep('payment')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      return
    }

    setIsProcessing(true)

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shipping.firstName} ${shipping.lastName}`,
              email: shipping.email,
              address: {
                line1: shipping.address,
                city: shipping.city,
                state: shipping.state,
                postal_code: shipping.zip,
                country: 'US',
              },
            },
          },
        }
      )

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess({ paymentIntentId, customerId })
      }
    } catch {
      setError('Payment processing failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const inputClass =
    'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors'

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => step === 'payment' && setStep('shipping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            step === 'shipping'
              ? 'bg-brand-gold text-brand-dark'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current">
            1
          </span>
          Shipping
        </button>
        <div className="w-8 h-px bg-white/20" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            step === 'payment'
              ? 'bg-brand-gold text-brand-dark'
              : 'bg-white/5 text-gray-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current">
            2
          </span>
          Payment
        </div>
      </div>

      {/* Step 1: Shipping */}
      <div className={step === 'shipping' ? 'block' : 'hidden'}>
        <form onSubmit={handleShippingSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm text-gray-300 mb-1">
                First Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={shipping.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="John"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm text-gray-300 mb-1">
                Last Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={shipping.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Doe"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email <span className="text-brand-gold">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={shipping.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="you@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm text-gray-300 mb-1">
              Address <span className="text-brand-gold">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={shipping.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="123 Main St"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm text-gray-300 mb-1">
                City <span className="text-brand-gold">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={shipping.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Miami"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm text-gray-300 mb-1">
                State <span className="text-brand-gold">*</span>
              </label>
              <select
                id="state"
                value={shipping.state}
                onChange={(e) => updateField('state', e.target.value)}
                className={`${inputClass} ${!shipping.state ? 'text-gray-500' : ''}`}
              >
                <option value="">Select state</option>
                {usStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-1/2">
            <label htmlFor="zip" className="block text-sm text-gray-300 mb-1">
              ZIP Code <span className="text-brand-gold">*</span>
            </label>
            <input
              id="zip"
              type="text"
              value={shipping.zip}
              onChange={(e) => updateField('zip', e.target.value)}
              placeholder="33101"
              className={inputClass}
              maxLength={10}
            />
          </div>

          {/* Shipping Options */}
          <div className="pt-4">
            <p className="text-sm text-gray-300 mb-3 font-medium">Shipping Method</p>
            <div className="space-y-2">
              {isFreeShipping && (
                <label className="flex items-center gap-3 bg-white/5 rounded-lg p-3 cursor-pointer border border-white/10 hover:border-brand-gold/30 transition-colors">
                  <input
                    type="radio"
                    name="shipping"
                    value="free"
                    checked={shippingOption === 'free'}
                    onChange={() => setShippingOption('free')}
                    className="text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="flex-1 text-white text-sm">Free Shipping</span>
                  <span className="text-green-400 text-sm font-medium">FREE</span>
                </label>
              )}
              <label className="flex items-center gap-3 bg-white/5 rounded-lg p-3 cursor-pointer border border-white/10 hover:border-brand-gold/30 transition-colors">
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingOption === 'standard'}
                  onChange={() => setShippingOption('standard')}
                  className="text-brand-gold focus:ring-brand-gold"
                />
                <div className="flex-1">
                  <span className="text-white text-sm">Standard Shipping</span>
                  <span className="text-gray-500 text-xs block">5-7 business days</span>
                </div>
                <span className="text-white text-sm">$5.99</span>
              </label>
              <label className="flex items-center gap-3 bg-white/5 rounded-lg p-3 cursor-pointer border border-white/10 hover:border-brand-gold/30 transition-colors">
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingOption === 'express'}
                  onChange={() => setShippingOption('express')}
                  className="text-brand-gold focus:ring-brand-gold"
                />
                <div className="flex-1">
                  <span className="text-white text-sm">Express Shipping</span>
                  <span className="text-gray-500 text-xs block">2-3 business days</span>
                </div>
                <span className="text-white text-sm">$12.99</span>
              </label>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isProcessing ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>
      </div>

      {/* Step 2: Payment */}
      <div className={step === 'payment' ? 'block' : 'hidden'}>
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-300 mb-3 font-medium">Card Details</p>
            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-4">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-2">Shipping to:</p>
            <p className="text-white text-sm">
              {shipping.firstName} {shipping.lastName}
            </p>
            <p className="text-gray-400 text-sm">
              {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
            </p>
            <button
              type="button"
              onClick={() => setStep('shipping')}
              className="text-brand-gold text-xs mt-2 hover:text-brand-gold-light transition-colors"
            >
              Edit shipping info
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing Payment...' : `Pay ${formatPrice(total)}`}
          </button>

          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by Stripe
          </div>
        </form>
      </div>
    </div>
  )
}

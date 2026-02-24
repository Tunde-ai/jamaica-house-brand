'use client'

import { useState, useEffect } from 'react'
import { membershipTiers } from '@/data/membership'
import { usStates } from '@/data/membership'

interface MembershipSignupFormProps {
  selectedTier: string
}

export default function MembershipSignupForm({ selectedTier }: MembershipSignupFormProps) {
  const [formData, setFormData] = useState({
    tier: selectedTier || 'standard',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    agreeTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedTier) {
      setFormData((prev) => ({ ...prev, tier: selectedTier }))
    }
  }, [selectedTier])

  const selectedPlan = membershipTiers.find((t) => t.id === formData.tier)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/membership-signup', {
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
      <section id="signup-form" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-12">
          <div className="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Welcome to the Family!</h3>
          <p className="text-gray-400">
            Your {selectedPlan?.name} membership signup has been received. We&apos;ll send you a
            confirmation email with next steps to get your first shipment on the way.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="signup-form" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Sign Up
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Start Your Membership
          </h2>
          <p className="text-gray-400 mt-4">
            Fill out the form below to join the Flavor Family. Stripe billing will be set up after
            confirmation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          {/* Plan Selection */}
          <div>
            <label htmlFor="membership-tier" className="block text-sm text-gray-300 mb-1">
              Selected Plan <span className="text-brand-gold">*</span>
            </label>
            <select
              id="membership-tier"
              name="tier"
              required
              value={formData.tier}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
            >
              {membershipTiers.map((tier) => (
                <option key={tier.id} value={tier.id} className="bg-brand-dark">
                  {tier.name} — ${tier.price}/{tier.interval}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="membership-firstName" className="block text-sm text-gray-300 mb-1">
                First Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="membership-firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="membership-lastName" className="block text-sm text-gray-300 mb-1">
                Last Name <span className="text-brand-gold">*</span>
              </label>
              <input
                id="membership-lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="membership-email" className="block text-sm text-gray-300 mb-1">
                Email <span className="text-brand-gold">*</span>
              </label>
              <input
                id="membership-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="membership-phone" className="block text-sm text-gray-300 mb-1">
                Phone <span className="text-brand-gold">*</span>
              </label>
              <input
                id="membership-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label htmlFor="membership-address" className="block text-sm text-gray-300 mb-1">
              Shipping Address <span className="text-brand-gold">*</span>
            </label>
            <input
              id="membership-address"
              name="address"
              type="text"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="membership-city" className="block text-sm text-gray-300 mb-1">
                City <span className="text-brand-gold">*</span>
              </label>
              <input
                id="membership-city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="membership-state" className="block text-sm text-gray-300 mb-1">
                State <span className="text-brand-gold">*</span>
              </label>
              <select
                id="membership-state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
              >
                <option value="" className="bg-brand-dark">State</option>
                {usStates.map((state) => (
                  <option key={state} value={state} className="bg-brand-dark">{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="membership-zip" className="block text-sm text-gray-300 mb-1">
                ZIP Code <span className="text-brand-gold">*</span>
              </label>
              <input
                id="membership-zip"
                name="zip"
                type="text"
                required
                value={formData.zip}
                onChange={handleChange}
                placeholder="ZIP"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/10 text-brand-gold focus:ring-brand-gold"
            />
            <span className="text-gray-400 text-sm leading-tight">
              I agree to the terms and conditions. I understand that my subscription will be billed
              monthly and I can cancel at any time.
            </span>
          </label>

          {error && (
            <p className="text-brand-red text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.agreeTerms}
            className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-lg hover:bg-brand-gold-light transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Submitting...'
              : `Join ${selectedPlan?.name ?? 'Plan'} — $${selectedPlan?.price ?? ''}/${selectedPlan?.interval ?? 'mo'}`}
          </button>
        </form>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { atlantaDeliverySlots } from '@/data/atlanta-street-series'
import { isZipInServiceArea, getDeliveryFee } from '@/lib/location-service'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  sides?: string[]
}

interface OrderFormProps {
  cart: OrderItem[]
  total: number
  onClose: () => void
  initialDeliveryMethod?: 'pickup' | 'delivery'
}

interface FormData {
  name: string
  email: string
  phone: string
  orderDate: string
  orderTime: string
  deliveryMethod: 'pickup' | 'delivery'
  zipCode: string
  address: string
  notes: string
}

export default function AtlantaOrderForm({ cart, total, onClose, initialDeliveryMethod = 'pickup' }: OrderFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    orderDate: '',
    orderTime: '',
    deliveryMethod: initialDeliveryMethod,
    zipCode: '',
    address: '',
    notes: '',
  })

  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isValidZip, setIsValidZip] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zipError, setZipError] = useState('')

  // Get tomorrow as minimum date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Check ZIP code validity and calculate delivery fee
  useEffect(() => {
    const checkZipCode = async () => {
      if (formData.zipCode.length === 5) {
        try {
          const valid = await isZipInServiceArea(formData.zipCode, 'atlanta')
          setIsValidZip(valid)

          if (valid && formData.deliveryMethod === 'delivery') {
            const fee = await getDeliveryFee(formData.zipCode, 'atlanta')
            setDeliveryFee(fee)
            setZipError('')
          } else if (!valid) {
            setZipError('Sorry, we don\'t deliver to this ZIP code. Pickup is still available.')
            setDeliveryFee(0)
          } else {
            setDeliveryFee(0)
            setZipError('')
          }
        } catch (error) {
          setIsValidZip(false)
          setZipError('Unable to verify ZIP code')
        }
      } else {
        setIsValidZip(false)
        setZipError('')
        setDeliveryFee(0)
      }
    }

    checkZipCode()
  }, [formData.zipCode, formData.deliveryMethod])

  const finalTotal = total + deliveryFee
  const tax = finalTotal * 0.08 // 8% tax estimate
  const grandTotal = finalTotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit order to API
      const response = await fetch('/api/atlanta-street-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: formData,
          cart,
          pricing: {
            subtotal: total,
            deliveryFee,
            tax,
            total: grandTotal,
          },
        }),
      })

      if (response.ok) {
        // Redirect to payment or success page
        const { checkoutUrl } = await response.json()
        if (checkoutUrl) {
          window.location.href = checkoutUrl
        }
      } else {
        alert('Failed to submit order. Please try again.')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-brand-gold/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Complete Your Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-brand-gold mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h3 className="text-lg font-semibold text-brand-gold mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Time Slot *
                  </label>
                  <select
                    required
                    value={formData.orderTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="">Select time...</option>
                    {atlantaDeliverySlots.map((slot) => (
                      <option key={slot.time} value={slot.time} disabled={!slot.available}>
                        {slot.time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <h3 className="text-lg font-semibold text-brand-gold mb-4">Delivery Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-white/20 rounded-lg cursor-pointer hover:border-brand-gold/50">
                  <input
                    type="radio"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value as 'pickup' | 'delivery' }))}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${formData.deliveryMethod === 'pickup' ? 'bg-brand-gold border-brand-gold' : 'border-white/40'}`} />
                  <div>
                    <div className="text-white font-medium">Pickup</div>
                    <div className="text-gray-400 text-sm">Free</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-white/20 rounded-lg cursor-pointer hover:border-brand-gold/50">
                  <input
                    type="radio"
                    value="delivery"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value as 'pickup' | 'delivery' }))}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${formData.deliveryMethod === 'delivery' ? 'bg-brand-gold border-brand-gold' : 'border-white/40'}`} />
                  <div>
                    <div className="text-white font-medium">Delivery</div>
                    <div className="text-gray-400 text-sm">${deliveryFee}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Address Information */}
            {formData.deliveryMethod === 'delivery' && (
              <div>
                <h3 className="text-lg font-semibold text-brand-gold mb-4">Delivery Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                    />
                    {zipError && (
                      <p className="text-red-400 text-sm mt-1">{zipError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Full Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                      placeholder="Street address, apartment #, city, state"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Special Instructions
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                placeholder="Any special requests or instructions..."
              />
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-white">
                    <span>Delivery Fee:</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white">
                  <span>Tax (est.):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-brand-gold border-t border-white/20 pt-2">
                  <span>Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/40 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (formData.deliveryMethod === 'delivery' && !isValidZip)}
                className="flex-1 py-3 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { atlantaStreetSeriesMenu, atlantaSideOptions, atlantaServiceArea, type StreetSeriesItem } from '@/data/atlanta-street-series'
import AtlantaOrderForm from './AtlantaOrderForm'
import Image from 'next/image'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  sides?: string[]
  notes?: string
}

interface SidesSelectionModalProps {
  item: StreetSeriesItem
  onAddToCart: (selectedSides: string[]) => void
  onClose: () => void
}

function SpiceLevelIndicator({ level }: { level?: 'mild' | 'medium' | 'hot' }) {
  if (!level) return null

  const icons = {
    mild: '🌶️',
    medium: '🌶️🌶️',
    hot: '🌶️🌶️🌶️',
  }

  const colors = {
    mild: 'text-green-500',
    medium: 'text-yellow-500',
    hot: 'text-red-500',
  }

  return (
    <span className={`text-sm ${colors[level]} ml-2`} title={`${level} spice level`}>
      {icons[level]}
    </span>
  )
}

function SidesSelectionModal({ item, onAddToCart, onClose }: SidesSelectionModalProps) {
  const [selectedSides, setSelectedSides] = useState<string[]>([])

  const requiredSides = item.requiredSides || 0
  const maxSides = item.maxSides || 2
  const canProceed = selectedSides.length >= requiredSides

  const toggleSide = (sideId: string, sideName: string) => {
    setSelectedSides(prev => {
      if (prev.includes(sideName)) {
        return prev.filter(s => s !== sideName)
      } else if (prev.length < maxSides) {
        return [...prev, sideName]
      }
      return prev
    })
  }

  const handleAddToCart = () => {
    onAddToCart(selectedSides)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-dark border border-brand-gold/20 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Choose Your Sides</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">×</button>
        </div>

        <div className="mb-4">
          <h4 className="text-brand-gold font-bold">{item.name}</h4>
          <p className="text-gray-400 text-sm">
            {requiredSides > 0
              ? `Choose ${requiredSides}${maxSides > requiredSides ? ` to ${maxSides}` : ''} sides`
              : `Choose up to ${maxSides} sides (optional)`
            }
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {atlantaSideOptions.map((side) => {
            const isSelected = selectedSides.includes(side.name)
            const canSelect = !isSelected && selectedSides.length < maxSides

            return (
              <button
                key={side.id}
                onClick={() => toggleSide(side.id, side.name)}
                disabled={!isSelected && !canSelect}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-brand-gold/20 border-brand-gold text-white'
                    : canSelect
                    ? 'bg-white/5 border-white/10 text-white hover:border-brand-gold/50'
                    : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{side.name}</p>
                    <p className="text-sm text-gray-400">{side.description}</p>
                  </div>
                  {isSelected && <span className="text-brand-gold">✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!canProceed}
            className="flex-1 py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AtlantaStreetSeriesMenu() {
  const [cart, setCart] = useState<OrderItem[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showSidesModal, setShowSidesModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StreetSeriesItem | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')

  const addToCart = (itemId: string, itemName: string, itemPrice: number, selectedSides?: string[]) => {
    setCart(prev => {
      // Create unique cart item ID based on item + sides combination
      const cartItemId = `${itemId}-${selectedSides?.sort().join('-') || 'no-sides'}`
      const existingItem = prev.find(item =>
        item.id === cartItemId || (item.id.startsWith(itemId) && JSON.stringify(item.sides?.sort()) === JSON.stringify(selectedSides?.sort()))
      )

      if (existingItem) {
        return prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, {
          id: cartItemId,
          name: itemName,
          price: itemPrice,
          quantity: 1,
          sides: selectedSides,
        }]
      }
    })
  }

  const handleItemClick = (item: StreetSeriesItem) => {
    if (item.requiredSides && item.requiredSides > 0) {
      setSelectedItem(item)
      setShowSidesModal(true)
    } else {
      // Item doesn't require sides, add directly
      addToCart(item.id, item.name, item.price, [])
    }
  }

  const handleSidesSelection = (selectedSides: string[]) => {
    if (selectedItem) {
      addToCart(selectedItem.id, selectedItem.name, selectedItem.price, selectedSides)
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const minimumOrder = deliveryMethod === 'pickup' ? atlantaServiceArea.minimumOrder.pickup : atlantaServiceArea.minimumOrder.delivery

  return (
    <div className="py-16 px-4" id="menu">
      <div className="max-w-6xl mx-auto">
        {/* Menu Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Street Series Menu
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Individual meal plates featuring authentic Jamaican street food.
            Each plate is made fresh to order with premium ingredients.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            {atlantaStreetSeriesMenu.map((category) => (
              <div key={category.id} className="mb-12">
                <h3 className="text-2xl font-bold text-brand-gold mb-6 border-b border-brand-gold/30 pb-2">
                  {category.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/5 border border-brand-gold/10 rounded-lg overflow-hidden hover:border-brand-gold/30 transition-colors"
                    >
                      {/* Item Image */}
                      {item.image && (
                        <div className="relative h-48">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          {item.popular && (
                            <span className="absolute top-3 right-3 px-2 py-1 bg-brand-gold text-black text-xs font-bold rounded">
                              POPULAR
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        {/* Item Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-xl font-bold text-white">
                                {item.name}
                              </h4>
                              <SpiceLevelIndicator level={item.spiceLevel} />
                              {item.popular && !item.image && (
                                <span className="ml-2 px-2 py-1 bg-brand-gold/20 text-brand-gold text-xs font-bold rounded">
                                  POPULAR
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xl font-bold text-brand-gold">
                            ${item.price}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-sm mb-3">
                          {item.description}
                        </p>

                        {/* Sides Information */}
                        <div className="mb-4">
                          {item.requiredSides && item.requiredSides > 0 ? (
                            <p className="text-xs text-gray-400">
                              Choose {item.requiredSides}{item.maxSides && item.maxSides > item.requiredSides ? ` to ${item.maxSides}` : ''} sides
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">
                              {item.maxSides ? `Up to ${item.maxSides} sides available` : 'No sides included'}
                            </p>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleItemClick(item)}
                          className="w-full py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors"
                        >
                          {item.requiredSides && item.requiredSides > 0
                            ? `Choose Sides - $${item.price}`
                            : `Add to Cart - $${item.price}`
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Side Options Reference */}
            <div className="bg-white/5 border border-brand-gold/10 rounded-lg p-6">
              <h3 className="text-xl font-bold text-brand-gold mb-4">Available Sides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {atlantaSideOptions.map((side) => (
                  <div key={side.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{side.name}</p>
                      <p className="text-gray-400 text-sm">{side.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/5 border border-brand-gold/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Your Order ({cartItemCount} items)
                </h3>

                {/* Delivery Method Toggle */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Order Type:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        deliveryMethod === 'pickup'
                          ? 'bg-brand-gold text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Pickup (${atlantaServiceArea.minimumOrder.pickup}+ min)
                    </button>
                    <button
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        deliveryMethod === 'delivery'
                          ? 'bg-brand-gold text-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Delivery (${atlantaServiceArea.minimumOrder.delivery}+ min)
                    </button>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="border-b border-white/10 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </div>
                          {item.sides && (
                            <p className="text-gray-400 text-xs mb-2">
                              {item.sides.join(', ')}
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-white/10 rounded text-white hover:bg-white/20"
                              >
                                −
                              </button>
                              <span className="text-white w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-white/10 rounded text-white hover:bg-white/20"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-brand-gold font-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Total */}
                    <div className="border-t border-white/20 pt-4 mb-6">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-white font-bold">Subtotal:</span>
                        <span className="text-brand-gold font-bold">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        Delivery fee and taxes calculated at checkout
                      </p>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={() => setShowOrderForm(true)}
                      disabled={cartTotal < minimumOrder}
                      className="w-full py-3 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cartTotal < minimumOrder
                        ? `Minimum $${minimumOrder} (Need $${(minimumOrder - cartTotal).toFixed(2)} more)`
                        : deliveryMethod === 'pickup'
                          ? 'Place Pre-Order'
                          : 'Proceed to Checkout'
                      }
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sides Selection Modal */}
      {showSidesModal && selectedItem && (
        <SidesSelectionModal
          item={selectedItem}
          onAddToCart={handleSidesSelection}
          onClose={() => {
            setShowSidesModal(false)
            setSelectedItem(null)
          }}
        />
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <AtlantaOrderForm
          cart={cart}
          total={cartTotal}
          onClose={() => setShowOrderForm(false)}
          initialDeliveryMethod={deliveryMethod}
        />
      )}
    </div>
  )
}
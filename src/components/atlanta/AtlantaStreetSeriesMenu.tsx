'use client'

import { useState } from 'react'
import { atlantaStreetSeriesMenu, atlantaSideOptions } from '@/data/atlanta-street-series'
import AtlantaOrderForm from './AtlantaOrderForm'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  sides?: string[]
  notes?: string
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

export default function AtlantaStreetSeriesMenu() {
  const [cart, setCart] = useState<OrderItem[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)

  const addToCart = (itemId: string, itemName: string, itemPrice: number, selectedSides?: string[]) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId)
      if (existingItem) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, {
          id: itemId,
          name: itemName,
          price: itemPrice,
          quantity: 1,
          sides: selectedSides,
        }]
      }
    })
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
                      className="bg-white/5 border border-brand-gold/10 rounded-lg p-6 hover:border-brand-gold/30 transition-colors"
                    >
                      {/* Item Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-xl font-bold text-white">
                              {item.name}
                            </h4>
                            <SpiceLevelIndicator level={item.spiceLevel} />
                            {item.popular && (
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

                      {/* Sides */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-1">Includes:</p>
                        <p className="text-sm text-white">
                          {item.sides.join(' • ')}
                        </p>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item.id, item.name, item.price, item.sides)}
                        className="w-full py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors"
                      >
                        Add to Cart - ${item.price}
                      </button>
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
                      disabled={cartTotal < 50}
                      className="w-full py-3 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cartTotal < 50
                        ? `Minimum $50 (Need $${(50 - cartTotal).toFixed(2)} more)`
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

      {/* Order Form Modal */}
      {showOrderForm && (
        <AtlantaOrderForm
          cart={cart}
          total={cartTotal}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  )
}
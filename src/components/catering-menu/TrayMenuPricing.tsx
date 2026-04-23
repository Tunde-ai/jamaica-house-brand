'use client'

import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { trayCategories, traySizes } from '@/data/catering-menu'

export default function TrayMenuPricing() {
  const [activeCategory, setActiveCategory] = useState('proteins')
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="tray-menu" ref={ref} className="py-20 px-4 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Tray Menu
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            Tray Menu & Pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            All trays come with serving utensils. Choose from our authentic Jamaican dishes.
          </p>

          {/* Tray Size Legend */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {traySizes.map((size) => (
              <div key={size.id} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded ${size.id === 'small' ? 'bg-brand-gold/60' : 'bg-brand-gold'}`} />
                <span className="text-gray-300">
                  <span className="font-semibold text-white">{size.name}</span> - {size.serves}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {trayCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-brand-gold text-brand-dark'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Active Category Content */}
        {trayCategories.map((category) => (
          <div
            key={category.id}
            className={`transition-all duration-500 ${
              activeCategory === category.id
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 absolute pointer-events-none'
            } ${inView ? '' : 'opacity-0 translate-y-8'}`}
          >
            {activeCategory === category.id && (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="bg-brand-gold/10 border-b border-white/10 px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <span className="text-brand-gold font-semibold text-lg">
                        {category.title}
                      </span>
                    </div>
                    <div className="text-brand-gold font-semibold text-center">
                      Small (~15)
                    </div>
                    <div className="text-brand-gold font-semibold text-center">
                      Large (35-40)
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-white/5">
                  {category.items.map((item, index) => (
                    <div
                      key={item.name}
                      className={`px-6 py-6 transition-all duration-500 hover:bg-white/5 ${
                        inView
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-4'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        {/* Item Details */}
                        <div className="md:col-span-2">
                          <h4 className="text-white font-bold text-lg mb-2">
                            {item.name}
                          </h4>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Small Tray Price */}
                        <div className="text-center">
                          <div className="text-white text-xl font-bold">
                            ${item.smallPrice}
                          </div>
                          <div className="text-gray-500 text-xs">per tray</div>
                        </div>

                        {/* Large Tray Price */}
                        <div className="text-center">
                          <div className="text-white text-xl font-bold">
                            ${item.largePrice}
                          </div>
                          <div className="text-gray-500 text-xs">per tray</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Mobile-Optimized Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            * All prices include serving utensils. Disposable plates and napkins available upon request.
          </p>
        </div>
      </div>
    </section>
  )
}
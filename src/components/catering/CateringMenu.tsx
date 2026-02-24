'use client'

import { useInView } from 'react-intersection-observer'
import { menuCategories } from '@/data/catering'

export default function CateringMenu() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Our Menu
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Choose Your Spread
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Mix and match from our selection of authentic Jamaican dishes to create the perfect menu for your event.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuCategories.map((category, idx) => (
            <div
              key={category.id}
              className={`bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-700 ${
                inView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <h3 className="text-2xl font-bold text-brand-gold mb-6">{category.title}</h3>
              <ul className="space-y-4">
                {category.items.map((item) => (
                  <li key={item.name}>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useInView } from 'react-intersection-observer'
import { memberStats } from '@/data/membership'

export default function MemberStats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section ref={ref} className="py-16 px-4 border-y border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {memberStats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-brand-gold mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { useInView } from 'react-intersection-observer'
import { howItWorksSteps } from '@/data/catering-menu'

export default function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section ref={ref} className="py-20 px-4 bg-brand-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-brand-gold text-sm font-semibold tracking-widest uppercase">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Three easy steps to bring authentic Jamaican flavor to your next gathering
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.step}
              className={`text-center transition-all duration-700 ${
                inView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Step Number & Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-gold text-brand-dark rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>

              {/* Connector Line (except for last step) */}
              {index < howItWorksSteps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 transform translate-x-8 w-32 h-0.5 bg-brand-gold/30" />
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button
            type="button"
            onClick={() =>
              document.getElementById('tray-menu')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-brand-gold/10 border border-brand-gold text-brand-gold font-semibold px-8 py-3 rounded-lg hover:bg-brand-gold/20 transition-colors"
          >
            View Tray Menu & Pricing
          </button>
        </div>
      </div>
    </section>
  )
}
'use client'

import { useState } from 'react'
import Image from 'next/image'
import LabelEditor, { type LabelData } from '@/components/custom-labels/LabelEditor'
import OrderForm from '@/components/custom-labels/OrderForm'

const USE_CASES = [
  {
    title: 'Corporate Events',
    description: 'Client gifts, company BBQs, team celebrations, and trade show giveaways with your brand front and center.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    title: 'Birthday Parties',
    description: 'Give your guests something they\'ll actually use. Custom party favors with the birthday person\'s name and date.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
      </svg>
    ),
  },
  {
    title: 'Weddings',
    description: 'Unique wedding favors your guests will love. Add the couple\'s names, date, and a personal touch.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: 'Gift Boxes',
    description: 'Holidays, thank-you gifts, housewarming presents — add a personal message and make it unforgettable.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
]

const STEPS = [
  { step: '1', title: 'Design', description: 'Pick a template, add your text and logo' },
  { step: '2', title: 'Approve', description: 'We create a professional proof for your approval' },
  { step: '3', title: 'Produce', description: 'We bottle your sauce and send you photos to confirm' },
  { step: '4', title: 'Pay & Ship', description: 'Pay in full, we ship directly to you' },
]

export default function CustomLabelsClient() {
  const [labelData, setLabelData] = useState<LabelData>({
    template: 'corporate',
    line1: '',
    line2: '',
    line3: '',
    logoUrl: null,
    logoFileName: null,
  })

  const [showEditor, setShowEditor] = useState(false)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark to-brand-dark/95" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-4">
                Custom Label Service
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Your Brand.{' '}
                <span className="text-brand-gold">Our Legendary Sauce.</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-lg mb-8">
                Create custom-labeled Jamaica House Brand jerk sauce bottles for corporate events, birthday parties, weddings, and gifts. Your logo, your message — our 30-year family recipe inside every bottle.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => {
                    setShowEditor(true)
                    setTimeout(() => {
                      document.getElementById('label-editor')?.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  className="inline-block bg-brand-gold text-brand-dark font-bold text-lg px-10 py-4 rounded-lg hover:bg-brand-gold-light transition-colors"
                >
                  Start Designing
                </button>
                <a
                  href="#how-it-works"
                  className="inline-block border-2 border-white/20 text-white font-bold text-lg px-10 py-4 rounded-lg hover:border-brand-gold hover:text-brand-gold transition-colors"
                >
                  How It Works
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-brand-gold font-bold">$80</span>/case
                </span>
                <span className="text-white/20">|</span>
                <span>12 bottles per case</span>
                <span className="text-white/20">|</span>
                <span>2-case minimum</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src="/images/products/jerk-sauce-5oz.jpg"
                  alt="Custom label jerk sauce bottle"
                  width={320}
                  height={420}
                  className="rounded-xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-brand-gold text-brand-dark font-bold text-sm px-4 py-2 rounded-lg shadow-lg">
                  Your Label Here
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Perfect For Any Occasion
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            From boardrooms to backyards — give people something memorable with your name on it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-brand-gold/30 transition-colors"
              >
                <div className="text-brand-gold mb-4">{uc.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-400">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, idx) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-gold text-brand-dark font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.description}</p>
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-6 text-gray-600">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple Pricing
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 max-w-lg mx-auto">
            <div className="text-6xl font-bold text-brand-gold mb-2">$80</div>
            <div className="text-gray-400 text-lg mb-6">per case of 12 bottles</div>
            <div className="space-y-3 text-left mb-8">
              {[
                'Custom-designed label with your branding',
                'Jamaica House Brand Original Jerk Sauce (5oz)',
                'Professional label proof for approval',
                'Shipping included for 5+ cases',
                'Full payment before shipping — see your bottles first',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-brand-gold mt-0.5">✓</span>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              2-case minimum (24 bottles) · $6.67 per bottle
            </div>
            <button
              onClick={() => {
                setShowEditor(true)
                setTimeout(() => {
                  document.getElementById('label-editor')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="w-full bg-brand-gold text-brand-dark font-bold text-lg py-4 rounded-lg hover:bg-brand-gold-light transition-colors"
            >
              Start Your Custom Order
            </button>
          </div>
        </div>
      </section>

      {/* Label Editor & Order Form */}
      {showEditor && (
        <section id="label-editor" className="py-16 sm:py-20 px-4 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
              Design Your Label
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
              Customize your label below. This is a starting point — our design team will refine it
              and send you a professional proof before printing.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <LabelEditor labelData={labelData} onUpdate={setLabelData} />
              <OrderForm labelData={labelData} />
            </div>
          </div>
        </section>
      )}

      {/* CTA if editor not shown yet */}
      {!showEditor && (
        <section className="py-16 sm:py-20 px-4 bg-white/[0.02]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Design your custom label in minutes. No commitment until you approve the proof.
            </p>
            <button
              onClick={() => {
                setShowEditor(true)
                setTimeout(() => {
                  document.getElementById('label-editor')?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="bg-brand-gold text-brand-dark font-bold text-lg px-12 py-4 rounded-lg hover:bg-brand-gold-light transition-colors"
            >
              Start Designing Your Label
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

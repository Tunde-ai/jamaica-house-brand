import { MapPin } from 'lucide-react'

export default function ServiceAreaBanner() {
  return (
    <div className="bg-brand-green/20 border border-brand-green/30 rounded-xl p-4 mb-8">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <MapPin className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <h3 className="text-brand-gold font-semibold text-sm mb-2">
            📍 Service Area: South Florida Only
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            We currently provide catering in Miami-Dade, Broward, Palm Beach, and
            Monroe counties. Outside our area?{' '}
            <span className="text-brand-gold-light">
              Ask about shipping our sauces nationwide.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
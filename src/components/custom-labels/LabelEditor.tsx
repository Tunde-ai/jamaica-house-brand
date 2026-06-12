'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

const TEMPLATES = [
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Clean & professional',
    accentColor: '#0a1628',
    textColor: '#0a1628',
  },
  {
    id: 'celebration',
    name: 'Celebration',
    description: 'Bold & festive',
    accentColor: '#C74B2A',
    textColor: '#C74B2A',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Classic gold',
    accentColor: '#D4A843',
    textColor: '#5C4A1E',
  },
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Island vibes',
    accentColor: '#2D5016',
    textColor: '#2D5016',
  },
]

export interface LabelData {
  template: string
  line1: string
  line2: string
  line3: string
  logoUrl: string | null
  logoFileName: string | null
}

interface LabelEditorProps {
  labelData: LabelData
  onUpdate: (data: LabelData) => void
}

export default function LabelEditor({ labelData, onUpdate }: LabelEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const selectedTemplate = TEMPLATES.find(t => t.id === labelData.template) || TEMPLATES[0]

  function handleFileUpload(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }
    const url = URL.createObjectURL(file)
    onUpdate({ ...labelData, logoUrl: url, logoFileName: file.name })
  }

  return (
    <div className="space-y-8">
      {/* Template Picker */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Choose a Template</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onUpdate({ ...labelData, template: t.id })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                labelData.template === t.id
                  ? 'border-brand-gold bg-brand-gold/10'
                  : 'border-white/10 hover:border-white/30 bg-white/5'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full mb-2"
                style={{ backgroundColor: t.accentColor }}
              />
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-gray-400">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Your Custom Text</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="line1" className="block text-sm text-gray-400 mb-1">
              Headline (e.g., company name, event title)
            </label>
            <input
              id="line1"
              type="text"
              maxLength={30}
              value={labelData.line1}
              onChange={(e) => onUpdate({ ...labelData, line1: e.target.value })}
              placeholder="Smith & Co Annual BBQ"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{labelData.line1.length}/30</div>
          </div>
          <div>
            <label htmlFor="line2" className="block text-sm text-gray-400 mb-1">
              Subline (e.g., date, occasion)
            </label>
            <input
              id="line2"
              type="text"
              maxLength={35}
              value={labelData.line2}
              onChange={(e) => onUpdate({ ...labelData, line2: e.target.value })}
              placeholder="July 4th, 2026"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{labelData.line2.length}/35</div>
          </div>
          <div>
            <label htmlFor="line3" className="block text-sm text-gray-400 mb-1">
              Message (optional — e.g., "Thank you for coming!")
            </label>
            <input
              id="line3"
              type="text"
              maxLength={40}
              value={labelData.line3}
              onChange={(e) => onUpdate({ ...labelData, line3: e.target.value })}
              placeholder="Bringing the heat since 1994"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">{labelData.line3.length}/40</div>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Upload Your Logo <span className="text-sm font-normal text-gray-400">(optional)</span></h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFileUpload(file)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-gold bg-brand-gold/10'
              : labelData.logoUrl
                ? 'border-brand-gold/40 bg-brand-gold/5'
                : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          {labelData.logoUrl ? (
            <div className="space-y-3">
              <img
                src={labelData.logoUrl}
                alt="Uploaded logo"
                className="max-h-16 mx-auto object-contain"
              />
              <p className="text-sm text-gray-400">{labelData.logoFileName}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate({ ...labelData, logoUrl: null, logoFileName: null })
                }}
                className="text-xs text-brand-red hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-400">Drag & drop your logo or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG — max 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Live Preview</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex justify-center">
          <div className="relative w-[300px]">
            {/* Bottle base */}
            <Image
              src="/images/products/jerk-sauce-5oz.jpg"
              alt="Jerk sauce bottle"
              width={300}
              height={400}
              className="rounded-lg"
            />
            {/* Custom label overlay */}
            <div
              className="absolute inset-x-4 top-[30%] bottom-[25%] rounded-md flex flex-col items-center justify-center px-3 py-2 text-center"
              style={{
                backgroundColor: 'rgba(250, 248, 245, 0.92)',
                border: `2px solid ${selectedTemplate.accentColor}`,
              }}
            >
              {labelData.logoUrl && (
                <img
                  src={labelData.logoUrl}
                  alt="Custom logo"
                  className="max-h-8 max-w-[80%] object-contain mb-1"
                />
              )}
              {labelData.line1 && (
                <div
                  className="font-bold text-sm leading-tight"
                  style={{ color: selectedTemplate.textColor }}
                >
                  {labelData.line1}
                </div>
              )}
              {labelData.line2 && (
                <div
                  className="text-xs mt-0.5"
                  style={{ color: selectedTemplate.textColor, opacity: 0.7 }}
                >
                  {labelData.line2}
                </div>
              )}
              {/* JHB branding always present */}
              <div className="mt-1 pt-1 border-t w-full" style={{ borderColor: selectedTemplate.accentColor + '40' }}>
                <div className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: selectedTemplate.textColor, opacity: 0.5 }}>
                  Jamaica House Brand
                </div>
                <div className="text-[8px]" style={{ color: selectedTemplate.textColor, opacity: 0.4 }}>
                  Original Jerk Sauce
                </div>
              </div>
              {labelData.line3 && (
                <div
                  className="text-[8px] italic mt-0.5"
                  style={{ color: selectedTemplate.textColor, opacity: 0.6 }}
                >
                  {labelData.line3}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This is an approximate preview. Final label will be professionally designed and sent for your approval before printing.
        </p>
      </div>
    </div>
  )
}

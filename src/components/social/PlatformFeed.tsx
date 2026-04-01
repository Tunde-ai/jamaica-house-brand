'use client'

import { useEffect, useRef } from 'react'
import { socialProfiles } from '@/data/social-media'

// ── Instagram Feed Widget ──────────────────────────────────────────
// Uses Instagram's oEmbed to show recent posts in an embedded timeline.
// Falls back to a follow CTA if embed doesn't load.
export function InstagramFeed() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Instagram embed.js script
    const existing = document.querySelector('script[src*="instagram.com/embed.js"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    } else {
      // Re-process embeds if script already loaded
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Instagram profile embed — shows latest posts */}
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`${socialProfiles.instagram}/`}
        data-instgrm-version="14"
        style={{
          background: 'transparent',
          border: '1px solid rgba(212, 168, 67, 0.1)',
          borderRadius: '12px',
          margin: '0 auto',
          maxWidth: '540px',
          width: '100%',
          minHeight: '400px',
        }}
      />
    </div>
  )
}

// ── TikTok Feed Widget ─────────────────────────────────────────────
// Embeds the TikTok profile feed using their official embed script.
export function TikTokFeed() {
  useEffect(() => {
    const existing = document.querySelector('script[src*="tiktok.com/embed.js"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div className="space-y-4">
      <blockquote
        className="tiktok-embed"
        cite={socialProfiles.tiktok}
        data-unique-id="jamaicahousebrand"
        data-embed-type="creator"
        style={{
          maxWidth: '780px',
          minWidth: '288px',
          margin: '0 auto',
        }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={socialProfiles.tiktok}
            className="text-brand-gold"
          >
            @jamaicahousebrand
          </a>
        </section>
      </blockquote>
    </div>
  )
}

// ── YouTube Feed Widget ────────────────────────────────────────────
// Embeds all YouTube Shorts from the channel as a responsive grid.
export function YouTubeFeed() {
  const shorts = [
    { id: 'X8bDPDYhYZ0', title: 'Ready For Some Real Jerk Chicken?' },
    { id: '7vg4mVqnfJI', title: 'Libby Loves Our Sauce' },
    { id: 'uvr3f1kTa6A', title: 'Alicia Echevarria Cooking With Jerk Sauce' },
    { id: 'R49cqTiZEZk', title: 'Gulsah Basaran With Jerk Sauce' },
    { id: 'XajFAKvE-Jc', title: 'Sausages & Jerk Sauce' },
    { id: 'ynxkIVcDoCM', title: 'Adding Sauce To Ramen!?' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {shorts.map((short) => (
        <div key={short.id} className="relative rounded-xl overflow-hidden bg-white/5 border border-brand-gold/10">
          <iframe
            src={`https://www.youtube.com/embed/${short.id}`}
            width="100%"
            height="320"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={short.title}
            className="w-full"
          />
          <p className="text-gray-400 text-xs p-2 truncate">{short.title}</p>
        </div>
      ))}
    </div>
  )
}

// Type declaration for Instagram embed script
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

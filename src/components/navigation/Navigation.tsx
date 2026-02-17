'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navItems = [
  { name: 'Shop', href: '/shop' },
  { name: 'Our Story', href: '/our-story' },
  { name: 'Recipes', href: '/recipes' },
  { name: 'Subscribe', href: '/subscribe', comingSoon: true },
  { name: 'Cart', href: '/cart' },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-brand-dark border-b border-brand-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/hummingbird-logo.svg"
              alt="Jamaica House Brand"
              width={40}
              height={40}
              priority
            />
            <span className="text-white font-bold text-lg hidden sm:inline">
              Jamaica House
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-brand-gold transition-colors text-sm font-medium"
              >
                {item.name}
                {item.comingSoon && (
                  <span className="ml-1 text-xs text-brand-gold opacity-75">
                    (Soon)
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button - MUST be 44x44px minimum */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden w-11 h-11 flex items-center justify-center text-white hover:text-brand-gold transition-colors"
          >
            <span className="sr-only">
              {mobileMenuOpen ? 'Close menu' : 'Open menu'}
            </span>
            {/* Hamburger icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-brand-gold/10 mt-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-white hover:text-brand-gold transition-colors text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
                {item.comingSoon && (
                  <span className="ml-2 text-xs text-brand-gold opacity-75">
                    (Coming Soon)
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

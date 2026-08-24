import Link from 'next/link'
import Image from 'next/image'

export default function BrandStory() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-brand-dark">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
          {/* Left — Chef Anthony photo */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden max-w-sm mx-auto md:mx-0 w-full">
            <Image
              src="/images/story/chef-anthony.jpg"
              alt="Chef Anthony, carrying on the Jamaica House legacy"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-top"
            />
          </div>

          {/* Right — Heritage story */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              The Original Jamaica House Restaurant Legacy
            </h2>

            <p className="text-gray-300 text-lg leading-relaxed mb-5 max-w-[65ch]">
              For over 30 years, Chef Anthony Vincent Amos Jr. perfected these recipes
              at the original Jamaica House Restaurant. Each sauce carries the authentic
              flavors that made his restaurant a destination for those seeking real Jamaican cuisine.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed mb-5 max-w-[65ch]">
              Today, we bring that same uncompromising authenticity to South Florida&apos;s
              farmers markets and directly to your kitchen. Every bottle contains
              three decades of culinary heritage.
            </p>

            <p className="text-brand-gold text-lg font-bold leading-relaxed mb-6">
              &ldquo;Real Jamaican flavor deserves real Jamaican recipes.&rdquo;<br />
              — Chef Anthony Vincent Amos Jr.
            </p>

            <Link
              href="/our-story"
              className="inline-block bg-brand-dark text-white border-2 border-brand-gold font-semibold px-8 py-3 hover:bg-brand-gold hover:text-brand-dark transition-colors"
            >
              Read Our Full Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

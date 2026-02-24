import Link from 'next/link'
import Image from 'next/image'

export default function BrandStory() {
  return (
    <section className="py-16 sm:py-24 px-4 bg-brand-dark">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left column - Chef Anthony photo with logo overlay */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src="/images/story/chef-anthony.jpg"
              alt="Chef Anthony, founder of Jamaica House Brand"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Gradient + logo overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4">
              <Image
                src="/images/branding/logo-full.jpg"
                alt="Jamaica House Brand"
                width={60}
                height={60}
                className="rounded-sm"
              />
            </div>
          </div>

          {/* Right column - Story text */}
          <div>
            <p className="text-brand-gold uppercase tracking-widest text-sm mb-4">
              Our Story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              From Our Kitchen to Yours
            </h2>
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                Born in New York to Jamaican parents, Chef Anthony grew up immersed in the rich flavors of his heritage. His father built the Jamaica House restaurant legacy — three thriving locations in South Florida.
              </p>
              <p>
                When 92% of customers started asking to buy the sauce by the bottle, we knew we had something special.
              </p>
              <p>
                Now Chef Anthony is extending the family legacy by bringing that same authentic recipe from the restaurant kitchen to every table in America.
              </p>
            </div>
            <Link
              href="/our-story"
              className="text-brand-gold hover:text-brand-gold-light font-medium mt-6 inline-block transition-colors"
            >
              Read Our Full Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

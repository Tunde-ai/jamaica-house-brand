'use client'

import Image from 'next/image'
import { useInView } from 'react-intersection-observer'

interface ScrollSectionProps {
  title: string
  content: string
  image: string
  imageAlt: string
  layout: 'text-left' | 'text-right' | 'centered'
}

export default function ScrollSection({
  title,
  content,
  image,
  imageAlt,
  layout,
}: ScrollSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  return (
    <section
      ref={ref}
      className={`min-h-[80vh] py-24 px-4 md:px-8 transition-all duration-1000 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {layout === 'centered' ? (
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-gold mb-6">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-12 max-w-3xl mx-auto">
              {content}
            </p>
            <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1152px"
              />
            </div>
          </div>
        ) : (
          <div
            className={`flex flex-col ${
              layout === 'text-right' ? 'md:flex-row-reverse' : 'md:flex-row'
            } items-center gap-12`}
          >
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-bold text-brand-gold mb-6">
                {title}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                {content}
              </p>
            </div>

            {/* Image */}
            <div className="flex-1 relative w-full h-[400px] md:h-[500px]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 576px"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

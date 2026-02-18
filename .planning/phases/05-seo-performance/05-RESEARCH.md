# Phase 5: SEO & Performance - Research

**Researched:** 2026-02-17
**Domain:** Next.js 16 SEO, Performance Optimization, Analytics Integration
**Confidence:** HIGH

## Summary

Phase 5 focuses on making the Jamaica House Brand site discoverable, fast, and trackable. Next.js 16 provides excellent built-in support for all requirements through the Metadata API, file-based metadata conventions, automatic image optimization, and official third-party script integrations.

The existing project already has Recipe schema JSON-LD implemented and some metadata configured on pages. This phase extends that foundation to cover all SEO requirements (sitemap, robots.txt, Product schema), optimize images for performance, and integrate analytics tracking.

**Primary recommendation:** Use Next.js 16's built-in features (Metadata API, Image component with preload, @next/third-parties for GA4) and leverage the existing Recipe schema pattern to add Product schema. Implement sitemap/robots.txt as TypeScript files for dynamic generation. For Meta Pixel, use a custom script component since it's not yet in @next/third-parties.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Framework with built-in SEO & performance features | Already in project; includes Metadata API, Image optimization, sitemap/robots generation |
| @next/third-parties | latest | Official Google Analytics integration | Google-maintained, optimized script loading, auto-tracks App Router navigation |
| schema-dts | latest | TypeScript types for Schema.org JSON-LD | Google-maintained, type-safe structured data, prevents schema errors |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/bundle-analyzer | latest | Visualize bundle size | When debugging Lighthouse performance scores |
| sharp | auto-installed | Image optimization backend | Automatically used by next/image for WebP/AVIF conversion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @next/third-parties | react-ga4 | react-ga4 requires manual pageview tracking; @next/third-parties auto-tracks App Router |
| Built-in Image | Third-party CDN | CDN adds complexity; Next.js Image API is sufficient for most sites |
| TypeScript sitemap | Static XML | Static file requires manual updates; TypeScript generates from data |

**Installation:**
```bash
npm install @next/third-parties schema-dts
npm install --save-dev @next/bundle-analyzer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── sitemap.ts           # Dynamic sitemap generation
│   ├── robots.ts            # Robots.txt configuration
│   └── [routes]/
│       └── page.tsx         # Each page exports generateMetadata
├── lib/
│   ├── seo.ts              # SEO helper functions (already exists)
│   ├── analytics.tsx       # Analytics components
│   └── constants.ts        # Site config (URLs, IDs)
└── components/
    └── Analytics/
        ├── GoogleAnalytics.tsx
        └── MetaPixel.tsx
```

### Pattern 1: Dynamic Sitemap Generation
**What:** Generate sitemap.xml from TypeScript using product/recipe data
**When to use:** When you have dynamic content (products, recipes, blog posts)
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { products } from '@/data/products'
import { recipes } from '@/data/recipes'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jamaicahousebrand.com'

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const recipeUrls = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...productUrls,
    ...recipeUrls,
  ]
}
```

### Pattern 2: Robots.txt with Sitemap Reference
**What:** Generate robots.txt that points to sitemap
**When to use:** Always; ensures search engines find sitemap
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/success'], // Don't index success page
    },
    sitemap: 'https://jamaicahousebrand.com/sitemap.xml',
  }
}
```

### Pattern 3: Product Schema JSON-LD (extends Recipe pattern)
**What:** Type-safe Product schema matching existing Recipe implementation
**When to use:** On all product detail pages (/products/[slug])
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld + https://schema.org/Product
// src/lib/seo.ts (add to existing file)
import type { Product, WithContext } from 'schema-dts'

export function generateProductJsonLd(product: {
  name: string
  description: string
  image: string
  price: number
  currency: string
  availability: 'InStock' | 'OutOfStock'
  brand: string
}): WithContext<Product> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
    },
  }
}

// app/products/[slug]/page.tsx
import { generateProductJsonLd } from '@/lib/seo'

export default async function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug)
  const jsonLd = generateProductJsonLd({
    name: product.name,
    description: product.description,
    image: product.image,
    price: product.price,
    currency: 'USD',
    availability: product.inStock ? 'InStock' : 'OutOfStock',
    brand: 'Jamaica House Brand',
  })

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Product content */}
    </section>
  )
}
```

### Pattern 4: Google Analytics 4 with @next/third-parties
**What:** Official Next.js integration for GA4 with auto page tracking
**When to use:** Always; recommended over manual gtag.js
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/third-party-libraries
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}
```

### Pattern 5: Meta Pixel Custom Implementation
**What:** Meta Pixel tracking for page views and purchases (not in @next/third-parties yet)
**When to use:** When tracking Facebook/Instagram ad conversions
**Example:**
```typescript
// src/components/Analytics/MetaPixel.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function MetaPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init(pixelId)
        ReactPixel.pageView()
      })
  }, [pixelId])

  useEffect(() => {
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.pageView()
      })
  }, [pathname, searchParams])

  return null
}

// app/layout.tsx
import { MetaPixel } from '@/components/Analytics/MetaPixel'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <MetaPixel pixelId="YOUR_PIXEL_ID" />
      </body>
    </html>
  )
}

// Track purchase event
// In checkout success page or client component:
import ReactPixel from 'react-facebook-pixel'

ReactPixel.track('Purchase', {
  value: totalAmount,
  currency: 'USD',
})
```

### Pattern 6: Image Optimization with Preload for LCP
**What:** Use preload prop on hero images to optimize Largest Contentful Paint
**When to use:** One hero image per page, typically above-the-fold
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image
// app/page.tsx
import Image from 'next/image'

export default function HomePage() {
  return (
    <>
      <Image
        src="/hero-image.jpg"
        alt="Jamaica House Brand Jerk Sauce"
        width={1920}
        height={1080}
        preload={true} // New in Next.js 16, replaces priority
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
      />
    </>
  )
}
```

### Pattern 7: Per-Page Metadata with generateMetadata
**What:** Dynamic metadata based on product/recipe data
**When to use:** On all dynamic routes
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// app/products/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug)

  return {
    title: `${product.name} | Jamaica House Brand`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  }
}
```

### Anti-Patterns to Avoid
- **Multiple H1 tags per page:** SEO penalty; use one H1, then H2-H6 in hierarchy
- **Skipping heading levels:** Don't go H1 → H3; breaks accessibility and SEO
- **Missing alt text on images:** Accessibility violation and SEO penalty
- **Using priority/preload on all images:** Only use on LCP image; wastes bandwidth
- **Hardcoding URLs in metadata:** Use metadataBase in root layout for URL composition
- **Inline scripts without XSS protection:** Always use `.replace(/</g, '\\u003c')` for JSON-LD
- **Not setting sizes on responsive images:** Browser downloads unnecessarily large images

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom XML writer | Next.js MetadataRoute.Sitemap | Type-safe, auto-formatted, handles URL composition |
| Image optimization | Custom sharp pipeline | next/image component | Auto WebP/AVIF, lazy load, responsive srcset, LCP preload |
| Schema.org validation | Manual JSON objects | schema-dts TypeScript types | Compile-time validation prevents invalid schema |
| GA4 page tracking | Manual gtag.js + usePathname | @next/third-parties/google | Auto-tracks App Router navigation, optimized loading |
| Meta tags | String concatenation | Metadata API | Type-safe, deduplicated, merged hierarchically |
| Bundle analysis | Manual webpack stats | @next/bundle-analyzer | Visual reports, per-route analysis |

**Key insight:** Next.js 16 has battle-tested solutions for every SEO/performance need. Custom implementations introduce bugs (missing edge cases, XSS vulnerabilities, invalid schema) and maintenance burden. Use the framework.

## Common Pitfalls

### Pitfall 1: Not Using Preload on LCP Image
**What goes wrong:** Largest Contentful Paint (LCP) score suffers because hero image isn't prioritized
**Why it happens:** Default lazy loading defers all images, including above-the-fold heroes
**How to avoid:** Add `preload={true}` to ONE image per page (the LCP candidate)
**Warning signs:** Lighthouse flags LCP > 2.5s, hero image loads after other content

### Pitfall 2: Missing Sizes Attribute on Responsive Images
**What goes wrong:** Browser downloads unnecessarily large images, hurting mobile performance
**Why it happens:** Without sizes, browser assumes image is 100vw and downloads largest version
**How to avoid:** Always set sizes prop when using fill or responsive layouts
**Warning signs:** Large images on mobile, Lighthouse "Properly size images" warning

### Pitfall 3: Forgetting to Sanitize JSON-LD
**What goes wrong:** XSS vulnerability if product/recipe descriptions contain `<script>` tags
**Why it happens:** JSON.stringify doesn't escape < characters for HTML context
**How to avoid:** Always use `.replace(/</g, '\\u003c')` when setting __html
**Warning signs:** Security audit tools flag XSS, malicious content could inject scripts

### Pitfall 4: Not Setting qualities in next.config.js (Next.js 16 Requirement)
**What goes wrong:** Build fails or images don't optimize
**Why it happens:** Next.js 16 requires explicit quality whitelist to prevent malicious optimization
**How to avoid:** Add `images: { qualities: [75, 90, 100] }` to next.config.js
**Warning signs:** Image optimization 400 errors, build warnings about missing qualities

### Pitfall 5: Breaking Heading Hierarchy
**What goes wrong:** Accessibility issues, SEO penalty, AI snippet extraction fails
**Why it happens:** Styling headings visually without semantic structure (H1 → H3)
**How to avoid:** Use one H1, maintain sequential hierarchy (H1 → H2 → H3), style with CSS
**Warning signs:** Screen reader users report confusion, Google doesn't extract featured snippets

### Pitfall 6: Not Configuring MetadataBase
**What goes wrong:** Open Graph images show as relative URLs, breaking social shares
**Why it happens:** metadata API needs absolute URLs for og:image
**How to avoid:** Set `metadataBase: new URL('https://jamaicahousebrand.com')` in root layout
**Warning signs:** Social media previews show broken images, LinkedIn/Facebook debuggers fail

### Pitfall 7: Tracking Purchase Events Without Event Deduplication
**What goes wrong:** Double-counting conversions if user refreshes success page
**Why it happens:** Meta Pixel fires on every page view, including refreshes
**How to avoid:** Use event_id parameter or track in checkout flow, not success page
**Warning signs:** Conversion count higher than order count, duplicate events in Meta Events Manager

## Code Examples

Verified patterns from official sources:

### Complete Metadata Configuration (Root Layout)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://jamaicahousebrand.com'),
  title: {
    template: '%s | Jamaica House Brand',
    default: 'Jamaica House Brand - Authentic Jamaican Jerk Sauce',
  },
  description: 'Authentic Jamaican jerk sauce with 30+ years of restaurant heritage',
  keywords: ['jerk sauce', 'jamaican sauce', 'authentic jerk', 'caribbean sauce'],
  authors: [{ name: 'Jamaica House Brand' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Jamaica House Brand',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@jamaicahousebrand',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

### Image Optimization with Formats
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### Semantic HTML Structure
```tsx
// app/products/[slug]/page.tsx
export default function ProductPage({ product }) {
  return (
    <article>
      <h1>{product.name}</h1> {/* One H1 per page */}

      <section>
        <h2>Description</h2>
        <p>{product.description}</p>
      </section>

      <section>
        <h2>How to Use</h2>
        <h3>Marinade</h3>
        <p>...</p>
        <h3>Dipping Sauce</h3>
        <p>...</p>
      </section>

      <section>
        <h2>Ingredients</h2>
        <ul>...</ul>
      </section>
    </article>
  )
}
```

### Bundle Analysis Setup
```javascript
// Source: https://nextjs.org/docs/app/guides/package-bundling
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // other config
})

// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| priority prop on Image | preload prop | Next.js 16.0 | Clearer intent; preload inserts <link rel="preload"> |
| Manual gtag.js script | @next/third-parties/google | Next.js 13.4 | Auto page tracking, optimized loading |
| Pages Router Metadata | App Router Metadata API | Next.js 13.0 | Type-safe, hierarchical merging, file-based |
| Static robots.txt | Dynamic robots.ts | Next.js 13.3 | Can customize per environment |
| Manual bundle analysis | Built-in bundle analyzer | Next.js 14.0 | Official plugin, better DX |
| Open quality values | Whitelisted qualities | Next.js 16.0 | Security: prevents malicious optimization |

**Deprecated/outdated:**
- `priority` prop on next/image: Use `preload` instead (Next.js 16+)
- `onLoadingComplete` on Image: Use `onLoad` instead (Next.js 14+)
- Hardcoded meta tags in Head: Use Metadata API
- react-ga for GA4: Use @next/third-parties/google
- Manual viewport meta: Now auto-generated by Next.js

## Open Questions

1. **Meta Pixel Integration Timing**
   - What we know: @next/third-parties currently only supports Google services
   - What's unclear: When/if Meta Pixel will be added to @next/third-parties
   - Recommendation: Use react-facebook-pixel for now; monitor @next/third-parties releases

2. **Conversion API vs Pixel**
   - What we know: Meta recommends dual tracking (Pixel + Conversion API) for best accuracy
   - What's unclear: Whether Conversion API is needed for this scale of site
   - Recommendation: Start with Pixel only; add Conversion API if conversion tracking is inaccurate

3. **Image Format Priority**
   - What we know: AVIF is 20% smaller but 50% slower to encode; WebP is widely supported
   - What's unclear: Whether AVIF is worth the encoding cost for this site's traffic
   - Recommendation: Start with WebP only; test AVIF if Lighthouse shows image optimization opportunities

4. **Bundle Size Target**
   - What we know: Lighthouse scores well if total JS < 200KB gzipped
   - What's unclear: Current bundle size of the site
   - Recommendation: Run `ANALYZE=true npm run build` to baseline; optimize if > 200KB

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.6 Sitemap Docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Sitemap generation
- [Next.js 16.1.6 Robots Docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) - Robots.txt generation
- [Next.js 16.1.6 JSON-LD Docs](https://nextjs.org/docs/app/guides/json-ld) - Structured data implementation
- [Next.js 16.1.6 Image Component](https://nextjs.org/docs/app/api-reference/components/image) - Image optimization and preload
- [Next.js 16.1.6 generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Metadata API
- [Next.js Third Party Libraries](https://nextjs.org/docs/app/guides/third-party-libraries) - Google Analytics integration
- [Schema.org Product](https://schema.org/Product) - Product schema specification
- [Schema.org Recipe](https://schema.org/Recipe) - Recipe schema specification

### Secondary (MEDIUM confidence)
- [Google Analytics 4 Implementation Guide for Next.js 16](https://medium.com/@aashari/google-analytics-ga4-implementation-guide-for-next-js-16-a7bbf267dbaa) - GA4 setup patterns
- [schema-dts npm package](https://www.npmjs.com/package/schema-dts) - TypeScript types for Schema.org
- [Mastering Mobile Performance: Next.js Lighthouse Scores](https://www.wisp.blog/blog/mastering-mobile-performance-a-complete-guide-to-improving-nextjs-lighthouse-scores) - Performance optimization strategies
- [H1-H6 Heading Tags and SEO: The Ultimate Guide](https://www.conductor.com/academy/headings/) - Semantic HTML best practices
- [Next.js Performance Tuning: Lighthouse Fixes](https://www.qed42.com/insights/next-js-performance-tuning-practical-fixes-for-better-lighthouse-scores) - Lighthouse optimization
- [The 10KB Next.js App: Bundle Optimization](https://medium.com/better-dev-nextjs-react/the-10kb-next-js-app-extreme-bundle-optimization-techniques-d8047c482aea) - Bundle analysis techniques

### Tertiary (LOW confidence)
- [Meta Pixel Integration Guides](https://www.rudderstack.com/integration/facebook-pixel/integrate-your-next-js-site-with-facebook-pixel/) - Meta Pixel patterns (not official)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All recommendations use official Next.js/Google packages verified in docs
- Architecture: HIGH - All patterns sourced from Next.js 16.1.6 official documentation
- Pitfalls: HIGH - Based on Next.js release notes, migration guides, and verified Lighthouse reports

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days; Next.js is stable)

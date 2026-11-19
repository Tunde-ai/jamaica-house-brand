import React from 'react'

// ============================================================================
// WeeklyMarketing — Hiya-style promotional email
// ============================================================================
// Product images link directly to jamaicahousebrand.com/shop.
// Inline styles only — email clients strip CSS classes.
// ============================================================================

const SITE_URL = 'https://jamaicahousebrand.com'
const SHOP_URL = `${SITE_URL}/shop`

interface ProductBlock {
  name: string
  size: string
  price: string
  salePrice?: string
  image: string
  slug: string
  badge?: string
}

interface WeeklyMarketingEmailProps {
  firstName?: string
  headline: string
  subheadline: string
  heroImage?: string
  products: ProductBlock[]
  footerText?: string
}

export function WeeklyMarketingEmail({
  firstName,
  headline,
  subheadline,
  heroImage,
  products,
  footerText,
}: WeeklyMarketingEmailProps) {
  const greeting = firstName ? `Hey ${firstName},` : 'Hey there,'

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FAF8F5', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '24px 16px' }}>
                {/* Top nav bar — like Hiya */}
                <table role="presentation" style={{ width: '600px', maxWidth: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: 'left' }}>
                                <a href={SHOP_URL} style={{ color: '#2D5016', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                                  Shop
                                </a>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ display: 'inline-block', width: '40px', height: '40px', backgroundColor: '#D4A843', borderRadius: '50%', lineHeight: '40px', fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>
                                  JH
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <a href={`${SITE_URL}/recipes`} style={{ color: '#2D5016', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                                  Recipes
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Main card */}
                <table role="presentation" style={{ width: '600px', maxWidth: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <tbody>
                    {/* Hero section */}
                    {heroImage && (
                      <tr>
                        <td>
                          <a href={SHOP_URL} style={{ display: 'block' }}>
                            <img src={heroImage} alt={headline} style={{ width: '100%', display: 'block', maxHeight: '280px', objectFit: 'cover' }} />
                          </a>
                        </td>
                      </tr>
                    )}

                    {/* Headline + greeting */}
                    <tr>
                      <td style={{ padding: '32px 32px 16px' }}>
                        <p style={{ margin: '0 0 8px', color: '#666', fontSize: '15px' }}>{greeting}</p>
                        <h1 style={{ margin: '0 0 8px', color: '#1A1A1A', fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                          {headline}
                        </h1>
                        <p style={{ margin: 0, color: '#555', fontSize: '15px', lineHeight: 1.5 }}>
                          {subheadline}
                        </p>
                      </td>
                    </tr>

                    {/* Flash Sale Banner */}
                    <tr>
                      <td style={{ padding: '0 32px 16px' }}>
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#DC2626', borderRadius: '8px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>
                                  Flash Sale
                                </p>
                                <p style={{ margin: 0, color: '#FFFFFF', fontSize: '24px', fontWeight: 700 }}>
                                  20oz for $20 — 50% Off!
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Product Grid */}
                    <tr>
                      <td style={{ padding: '0 24px 24px' }}>
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {/* Render products in rows of 2 */}
                            {Array.from({ length: Math.ceil(products.length / 2) }).map((_, rowIdx) => {
                              const left = products[rowIdx * 2]
                              const right = products[rowIdx * 2 + 1]
                              return (
                                <tr key={rowIdx}>
                                  <td style={{ width: '50%', padding: '8px', verticalAlign: 'top' }}>
                                    <ProductCell product={left} />
                                  </td>
                                  <td style={{ width: '50%', padding: '8px', verticalAlign: 'top' }}>
                                    {right ? <ProductCell product={right} /> : null}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* CTA Button */}
                    <tr>
                      <td style={{ padding: '0 32px 32px', textAlign: 'center' }}>
                        <a
                          href={SHOP_URL}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#2D5016',
                            color: '#FFFFFF',
                            fontSize: '16px',
                            fontWeight: 700,
                            padding: '14px 40px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}
                        >
                          Shop All Sauces
                        </a>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ backgroundColor: '#1A1A1A', padding: '24px 32px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: '36px', height: '36px', backgroundColor: '#D4A843', borderRadius: '50%', lineHeight: '36px', fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
                          JH
                        </span>
                        <p style={{ margin: '12px 0 4px', color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>
                          Jamaica House Brand
                        </p>
                        <p style={{ margin: '0 0 12px', color: '#888', fontSize: '12px' }}>
                          {footerText || 'Authentic Jamaican Jerk Sauce — 30 Years of Flavor'}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '11px' }}>
                          <a href={`${SITE_URL}/unsubscribe`} style={{ color: '#888', textDecoration: 'underline' }}>
                            Unsubscribe
                          </a>
                          {' | '}
                          <a href={SITE_URL} style={{ color: '#888', textDecoration: 'underline' }}>
                            jamaicahousebrand.com
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

function ProductCell({ product }: { product: ProductBlock }) {
  const productUrl = `${SITE_URL}/shop/${product.slug}`

  return (
    <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#FAF8F5', borderRadius: '8px', overflow: 'hidden' }}>
      <tbody>
        <tr>
          <td style={{ textAlign: 'center', padding: '12px 12px 0', position: 'relative' as const }}>
            <a href={productUrl} style={{ display: 'block' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '120px', height: '120px', objectFit: 'contain', display: 'inline-block' }}
              />
            </a>
            {product.badge && (
              <span style={{ display: 'inline-block', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', marginTop: '4px' }}>
                {product.badge}
              </span>
            )}
          </td>
        </tr>
        <tr>
          <td style={{ padding: '8px 12px 4px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#1A1A1A', fontSize: '13px', fontWeight: 600 }}>{product.name}</p>
            <p style={{ margin: '2px 0 0', color: '#888', fontSize: '11px' }}>{product.size}</p>
          </td>
        </tr>
        <tr>
          <td style={{ padding: '4px 12px 12px', textAlign: 'center' }}>
            {product.salePrice ? (
              <>
                <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '12px', marginRight: '6px' }}>{product.price}</span>
                <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '15px' }}>{product.salePrice}</span>
              </>
            ) : (
              <span style={{ color: '#1A1A1A', fontWeight: 700, fontSize: '15px' }}>{product.price}</span>
            )}
          </td>
        </tr>
        <tr>
          <td style={{ padding: '0 12px 12px', textAlign: 'center' }}>
            <a
              href={productUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#D4A843',
                color: '#1A1A1A',
                fontSize: '12px',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Shop Now
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// Default product set for the weekly email
export const DEFAULT_PRODUCTS: ProductBlock[] = [
  {
    name: 'Original Jerk Sauce',
    size: '5oz',
    price: '$11.99',
    image: `${SITE_URL}/images/products/jerk-sauce-5oz.jpg`,
    slug: 'jerk-sauce-5oz',
  },
  {
    name: 'Original Jerk Sauce',
    size: '10oz',
    price: '$19.99',
    image: `${SITE_URL}/images/products/jerk-sauce-10oz.jpg`,
    slug: 'jerk-sauce-10oz',
  },
  {
    name: 'Escovitch Pikliz',
    size: '12oz',
    price: '$11.99',
    image: `${SITE_URL}/images/products/pikliz-12oz.jpg`,
    slug: 'escovitch-pikliz-12oz',
  },
  {
    name: '20oz Flash Sale Deal',
    size: '2 x 10oz',
    price: '$39.98',
    salePrice: '$20.00',
    image: `${SITE_URL}/images/products/jerk-sauce-10oz.jpg`,
    slug: 'jerk-sauce-10oz-2pack',
    badge: 'FLASH SALE',
  },
]

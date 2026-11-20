import React from 'react'

// ============================================================================
// WelcomeEmail — Sent immediately when someone subscribes
// ============================================================================

const SITE_URL = 'https://jamaicahousebrand.com'
const SHOP_URL = `${SITE_URL}/shop`

interface WelcomeEmailProps {
  firstName: string
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
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
              <td align="center" style={{ padding: '32px 16px' }}>
                <table role="presentation" style={{ width: '600px', maxWidth: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{ backgroundColor: '#1A1A1A', padding: '40px 32px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: '56px', height: '56px', backgroundColor: '#D4A843', borderRadius: '50%', lineHeight: '56px', fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>
                          JH
                        </span>
                        <h1 style={{ margin: '16px 0 0', color: '#FFFFFF', fontSize: '26px', fontWeight: 700 }}>
                          Welcome to the Family, {firstName}!
                        </h1>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: '32px', backgroundColor: '#FAF8F5' }}>
                        <p style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          Hey {firstName},
                        </p>
                        <p style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          Thanks for joining Jamaica House Brand! You&apos;re now part of a community that&apos;s been enjoying authentic Jamaican flavor for over 30 years.
                        </p>
                        <p style={{ margin: '0 0 24px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          Here&apos;s what you can expect from us:
                        </p>

                        {/* Benefits list */}
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                          <tbody>
                            {[
                              { icon: '🔥', text: 'Exclusive deals & flash sales before anyone else' },
                              { icon: '🍗', text: 'Authentic Jamaican recipes using our sauces' },
                              { icon: '🆕', text: 'First look at new products & flavors' },
                              { icon: '📦', text: 'Free shipping on orders over $50' },
                            ].map((item, i) => (
                              <tr key={i}>
                                <td style={{ padding: '8px 0', verticalAlign: 'top', width: '32px' }}>
                                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                </td>
                                <td style={{ padding: '8px 0 8px 8px', color: '#333', fontSize: '15px', lineHeight: 1.5 }}>
                                  {item.text}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Flash Sale callout */}
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#DC2626', borderRadius: '8px', marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>
                                  Your First Deal
                                </p>
                                <p style={{ margin: '0 0 12px', color: '#FFFFFF', fontSize: '22px', fontWeight: 700 }}>
                                  20oz for $20 — 50% Off!
                                </p>
                                <a
                                  href={SHOP_URL}
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: '#FFFFFF',
                                    color: '#DC2626',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    padding: '10px 28px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                  }}
                                >
                                  Shop the Deal
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ margin: '0 0 24px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          From our family to yours — welcome aboard.
                        </p>

                        {/* CTA */}
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: 'center' }}>
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
                                  Browse Our Sauces
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                          Authentic Jamaican Jerk Sauce — 30 Years of Flavor
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '11px' }}>
                          <a href={`${SITE_URL}/unsubscribe`} style={{ color: '#888', textDecoration: 'underline' }}>Unsubscribe</a>
                          {' | '}
                          <a href={SITE_URL} style={{ color: '#888', textDecoration: 'underline' }}>jamaicahousebrand.com</a>
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

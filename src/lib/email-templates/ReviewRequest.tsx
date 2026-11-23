import React from 'react'

// ============================================================================
// ReviewRequest — "Record a Review, Get a Free Bottle" campaign email
// ============================================================================

const SITE_URL = 'https://jamaicahousebrand.com'
const REVIEW_LINK = 'https://share.voicemason.com/r/jrdcpqn572'

interface ReviewRequestEmailProps {
  firstName?: string
}

export function ReviewRequestEmail({ firstName }: ReviewRequestEmailProps) {
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
              <td align="center" style={{ padding: '32px 16px' }}>
                <table role="presentation" style={{ width: '600px', maxWidth: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{ backgroundColor: '#1A1A1A', padding: '40px 32px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', width: '56px', height: '56px', backgroundColor: '#D4A843', borderRadius: '50%', lineHeight: '56px', fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>
                          JH
                        </span>
                        <h1 style={{ margin: '16px 0 0', color: '#FFFFFF', fontSize: '24px', fontWeight: 700 }}>
                          We&apos;d Love to Hear From You
                        </h1>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: '32px', backgroundColor: '#FAF8F5' }}>
                        <p style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          {greeting}
                        </p>
                        <p style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          Thank you for being a Jamaica House Brand customer! We hope you&apos;ve been enjoying our sauces.
                        </p>
                        <p style={{ margin: '0 0 24px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          We have a small favor to ask &mdash; and a thank you gift for your time:
                        </p>

                        {/* Offer Box */}
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#2D5016', borderRadius: '10px', marginBottom: '24px' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '28px 24px', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 8px', color: '#D4A843', fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>
                                  Record a Quick Review
                                </p>
                                <p style={{ margin: '0 0 16px', color: '#FFFFFF', fontSize: '22px', fontWeight: 700, lineHeight: 1.3 }}>
                                  Get a FREE Bottle on Us
                                </p>
                                <p style={{ margin: '0 0 20px', color: '#A8C896', fontSize: '14px', lineHeight: 1.5 }}>
                                  Record a short video review showing your bottle and telling us what you think. That&apos;s it &mdash; we&apos;ll send you a free bottle as our thank you.
                                </p>
                                <a
                                  href={REVIEW_LINK}
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: '#D4A843',
                                    color: '#1A1A1A',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    padding: '14px 36px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                  }}
                                >
                                  Record My Review
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* How it works */}
                        <p style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', fontWeight: 700 }}>
                          How it works:
                        </p>
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                          <tbody>
                            {[
                              { step: '1', text: 'Click the button above to open the review recorder' },
                              { step: '2', text: 'Grab your bottle and record a quick video (30 seconds is perfect!)' },
                              { step: '3', text: 'Tell us what you love about the sauce, how you use it, your favorite recipe' },
                              { step: '4', text: 'Submit your review and reply to this email to let us know' },
                            ].map((item) => (
                              <tr key={item.step}>
                                <td style={{ padding: '6px 0', verticalAlign: 'top', width: '32px' }}>
                                  <span style={{ display: 'inline-block', width: '24px', height: '24px', backgroundColor: '#D4A843', borderRadius: '50%', lineHeight: '24px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>
                                    {item.step}
                                  </span>
                                </td>
                                <td style={{ padding: '6px 0 6px 10px', color: '#333', fontSize: '15px', lineHeight: 1.5 }}>
                                  {item.text}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <p style={{ margin: '0 0 16px', color: '#333', fontSize: '16px', lineHeight: 1.6 }}>
                          Once we receive your review, we&apos;ll ship out your free bottle right away. It&apos;s our way of saying thank you for supporting a family brand with over 30 years of history.
                        </p>

                        <p style={{ margin: '0 0 24px', color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
                          P.S. &mdash; While you&apos;re at it, a Google review goes a long way too! <a href="https://g.page/r/jamaicahousebrand/review" style={{ color: '#2D5016', textDecoration: 'underline' }}>Leave a Google Review</a>
                        </p>

                        {/* CTA repeat */}
                        <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ textAlign: 'center' }}>
                                <a
                                  href={REVIEW_LINK}
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
                                  Record My Review
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
                          Authentic Jamaican Jerk Sauce &mdash; 30 Years of Flavor
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

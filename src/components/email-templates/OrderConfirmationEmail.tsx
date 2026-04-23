interface OrderConfirmationEmailProps {
  customerName: string
  orderId: string
  eventDate: string
  guestCount: number
  orderTotal: number
  depositAmount: number
  balanceDue: number
  selectedItems: Array<{
    name: string
    smallQty: number
    largeQty: number
    smallPrice: number
    largePrice: number
  }>
  deliveryMethod: 'pickup' | 'delivery'
  deliveryAddress?: string
  specialRequests?: string
  depositPaymentUrl: string
  quoteOnlyUrl: string
}

export default function OrderConfirmationEmail({
  customerName,
  orderId,
  eventDate,
  guestCount,
  orderTotal,
  depositAmount,
  balanceDue,
  selectedItems,
  deliveryMethod,
  deliveryAddress,
  specialRequests,
  depositPaymentUrl,
  quoteOnlyUrl,
}: OrderConfirmationEmailProps) {
  const firstName = customerName.split(' ')[0]
  const eventDateFormatted = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #d4a843 0%, #b8902f 100%)',
        color: '#1a1a1a',
        padding: '30px 20px',
        textAlign: 'center',
        borderRadius: '8px 8px 0 0',
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
          🎉 Your Catering Order is Ready!
        </h1>
        <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>
          Choose how you'd like to proceed, {firstName}
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '30px 20px', backgroundColor: '#f9f9f9' }}>
        <p style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
          Hi {firstName}! 👋
        </p>

        <p style={{ fontSize: '16px', color: '#333', marginBottom: '25px', lineHeight: '1.5' }}>
          Thanks for choosing Jamaica House Brand for your event on <strong>{eventDateFormatted}</strong>!
          We're excited to bring authentic Jamaican flavors to your <strong>{guestCount} guests</strong>.
        </p>

        {/* Order Summary */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '2px solid #d4a843',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
        }}>
          <h2 style={{ color: '#1a1a1a', marginTop: '0', marginBottom: '15px', fontSize: '20px' }}>
            📋 Your Order Summary
          </h2>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#333' }}>Order ID:</strong> {orderId}<br/>
            <strong style={{ color: '#333' }}>Event Date:</strong> {eventDateFormatted}<br/>
            <strong style={{ color: '#333' }}>Guest Count:</strong> {guestCount}<br/>
            <strong style={{ color: '#333' }}>Service Type:</strong> {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
            {deliveryAddress && (
              <>
                <br/><strong style={{ color: '#333' }}>Delivery Address:</strong> {deliveryAddress}
              </>
            )}
          </div>

          <h3 style={{ color: '#d4a843', marginBottom: '10px', fontSize: '16px' }}>Tray Selection:</h3>
          <div style={{ fontSize: '14px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
            {selectedItems.map((item, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <strong>{item.name}:</strong>{' '}
                {item.smallQty > 0 && `${item.smallQty} Small`}
                {item.smallQty > 0 && item.largeQty > 0 && ', '}
                {item.largeQty > 0 && `${item.largeQty} Large`}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Order Total:</span>
              <span style={{ fontWeight: 'bold' }}>${orderTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#d4a843' }}>
              <span>33% Deposit:</span>
              <span style={{ fontWeight: 'bold' }}>${depositAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Balance Due:</span>
              <span>${balanceDue.toFixed(2)}</span>
            </div>
          </div>

          {specialRequests && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff4e6', borderRadius: '4px', borderLeft: '4px solid #d4a843' }}>
              <strong style={{ color: '#333' }}>Special Requests:</strong><br/>
              {specialRequests}
            </div>
          )}
        </div>

        {/* Two Options */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '30px',
        }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px 20px',
            borderBottom: '1px solid #ddd',
          }}>
            <h2 style={{ margin: '0', fontSize: '18px', color: '#1a1a1a' }}>
              🤔 What would you like to do next?
            </h2>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Option 1: Pay Deposit */}
            <div style={{
              border: '2px solid #d4a843',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: '#fffaf0',
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#d4a843', fontSize: '18px' }}>
                🎯 RECOMMENDED: Secure Your Date Now
              </h3>
              <ul style={{ color: '#333', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li><strong>Pay ${depositAmount.toFixed(2)} deposit (33%)</strong></li>
                <li>🔒 <strong>Your date is instantly reserved</strong></li>
                <li>⚡ No waiting - immediate confirmation</li>
                <li>💳 Balance due 2 weeks before event</li>
                <li>🔄 Flexible refund policy</li>
              </ul>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a
                  href={depositPaymentUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#d4a843',
                    color: '#1a1a1a',
                    padding: '15px 30px',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  🚀 PAY DEPOSIT & RESERVE DATE - ${depositAmount.toFixed(2)}
                </a>
              </div>
            </div>

            {/* Option 2: Quote Only */}
            <div style={{
              border: '2px solid #ccc',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '18px' }}>
                📝 Get Quote First
              </h3>
              <ul style={{ color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>We'll email you a detailed quote</li>
                <li>⏱️ Response within 24 hours</li>
                <li>💬 Opportunity to discuss modifications</li>
                <li>⚠️ Date not reserved until deposit paid</li>
              </ul>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a
                  href={quoteOnlyUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#6c757d',
                    color: '#ffffff',
                    padding: '12px 25px',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  📧 REQUEST QUOTE ONLY
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Policy */}
        <div style={{
          backgroundColor: '#e8f4f8',
          border: '1px solid #b8e6f1',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '25px',
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '16px' }}>
            🔄 Flexible Refund Policy
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
            <li><strong>21+ days before:</strong> 100% refund</li>
            <li><strong>14-20 days:</strong> 75% refund</li>
            <li><strong>7-13 days:</strong> 50% refund</li>
            <li><strong>3-6 days:</strong> 25% refund</li>
            <li><strong>Less than 3 days:</strong> Non-refundable</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '25px',
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '16px' }}>
            📞 Questions? We're Here to Help!
          </h3>
          <p style={{ margin: '0', color: '#333', fontSize: '14px' }}>
            <strong>Call/Text:</strong> <a href="tel:+17867091027" style={{ color: '#d4a843' }}>(786) 709-1027</a><br/>
            <strong>Email:</strong> <a href="mailto:olatunde@jamaicahousebrand.com" style={{ color: '#d4a843' }}>olatunde@jamaicahousebrand.com</a><br/>
            <strong>Hours:</strong> Mon-Fri 9AM-6PM EST
          </p>
        </div>

        <p style={{ fontSize: '16px', color: '#333', marginBottom: '0' }}>
          Thank you for choosing Jamaica House Brand! 🇯🇲<br/>
          <em style={{ color: '#666' }}>30+ Years of Authentic Jamaican Flavor</em>
        </p>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        padding: '20px',
        textAlign: 'center',
        fontSize: '12px',
        borderRadius: '0 0 8px 8px',
      }}>
        <p style={{ margin: '0' }}>
          Jamaica House Brand LLC<br/>
          200 S. Andrews Ave Ste 504 #1168, Fort Lauderdale, FL 33301
        </p>
      </div>
    </div>
  )
}
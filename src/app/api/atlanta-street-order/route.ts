import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import Stripe from 'stripe'
import { atlantaServiceArea } from '@/data/atlanta-street-series'

const resend = new Resend(process.env.RESEND_API_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  sides?: string[]
}

interface OrderData {
  name: string
  email: string
  phone: string
  orderDate: string
  orderTime: string
  deliveryMethod: 'pickup' | 'delivery'
  zipCode: string
  address: string
  notes: string
}

interface PricingData {
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const { orderData, cart, pricing }: {
      orderData: OrderData
      cart: OrderItem[]
      pricing: PricingData
    } = await request.json()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        // Food items
        ...cart.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.name} (${item.quantity}x)`,
              description: item.sides ? `Includes: ${item.sides.join(', ')}` : undefined,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        // Delivery fee (if applicable)
        ...(pricing.deliveryFee > 0 ? [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Delivery Fee',
              description: `Delivery to ${orderData.zipCode}`,
            },
            unit_amount: Math.round(pricing.deliveryFee * 100),
          },
          quantity: 1,
        }] : []),
      ],
      metadata: {
        orderType: 'atlanta-street-series',
        customerName: orderData.name,
        customerEmail: orderData.email,
        customerPhone: orderData.phone,
        orderDate: orderData.orderDate,
        orderTime: orderData.orderTime,
        deliveryMethod: orderData.deliveryMethod,
        zipCode: orderData.zipCode,
        address: orderData.address,
        notes: orderData.notes || '',
        cartItems: JSON.stringify(cart),
        subtotal: pricing.subtotal.toString(),
        deliveryFee: pricing.deliveryFee.toString(),
        tax: pricing.tax.toString(),
        total: pricing.total.toString(),
      },
      customer_email: orderData.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/catering-services/atlanta-street-series`,
      automatic_tax: {
        enabled: true,
      },
      payment_intent_data: {
        description: `Atlanta Street Series Order - ${orderData.name}`,
      },
    })

    // Send notification email to Atlanta partner (don't wait for payment completion for this initial notification)
    try {
      await sendPartnerNotification({
        orderData,
        cart,
        pricing,
        sessionId: session.id,
        paymentStatus: 'pending'
      })
    } catch (emailError) {
      console.error('Failed to send partner notification:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Atlanta order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

async function sendPartnerNotification({
  orderData,
  cart,
  pricing,
  sessionId,
  paymentStatus = 'pending'
}: {
  orderData: OrderData
  cart: OrderItem[]
  pricing: PricingData
  sessionId: string
  paymentStatus: 'pending' | 'completed' | 'failed'
}) {
  const partner = atlantaServiceArea.partnerInfo

  // Format order items for email
  const orderItemsHtml = cart.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong>
        ${item.sides ? `<br><small style="color: #666;">Includes: ${item.sides.join(', ')}</small>` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const statusColor = {
    pending: '#f59e0b',
    completed: '#10b981',
    failed: '#ef4444'
  }[paymentStatus]

  const statusText = {
    pending: 'Payment Pending',
    completed: 'Payment Completed',
    failed: 'Payment Failed'
  }[paymentStatus]

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="color: #d4af37; margin: 0;">Jamaica House Brand</h1>
        <h2 style="color: white; margin: 10px 0;">Atlanta Street Series - New Order</h2>
        <div style="background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold;">
          ${statusText}
        </div>
      </div>

      <div style="padding: 20px; background: white;">
        <h3 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Order Details</h3>

        <div style="margin-bottom: 20px;">
          <strong>Order Date:</strong> ${orderData.orderDate}<br>
          <strong>Order Time:</strong> ${orderData.orderTime}<br>
          <strong>Method:</strong> ${orderData.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
          ${orderData.deliveryMethod === 'delivery' ? `<br><strong>Address:</strong> ${orderData.address}` : ''}
        </div>

        <h3 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Customer Information</h3>
        <div style="margin-bottom: 20px;">
          <strong>Name:</strong> ${orderData.name}<br>
          <strong>Email:</strong> ${orderData.email}<br>
          <strong>Phone:</strong> ${orderData.phone}
          ${orderData.notes ? `<br><strong>Notes:</strong> ${orderData.notes}` : ''}
        </div>

        <h3 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d4af37;">Item</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #d4af37;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d4af37;">Unit Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d4af37;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
        </table>

        <div style="border-top: 2px solid #d4af37; padding-top: 15px;">
          <div style="text-align: right;">
            <div><strong>Subtotal: $${pricing.subtotal.toFixed(2)}</strong></div>
            ${pricing.deliveryFee > 0 ? `<div>Delivery Fee: $${pricing.deliveryFee.toFixed(2)}</div>` : ''}
            <div>Tax: $${pricing.tax.toFixed(2)}</div>
            <div style="font-size: 18px; color: #d4af37; margin-top: 10px;"><strong>Total: $${pricing.total.toFixed(2)}</strong></div>
          </div>
        </div>

        ${paymentStatus === 'pending' ? `
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <strong>⏳ Payment Pending</strong><br>
            This is a preliminary notification. You'll receive another email once payment is completed.
            <br><small>Session ID: ${sessionId}</small>
          </div>
        ` : ''}
      </div>

      <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>Jamaica House Brand Atlanta Street Series<br>
        This is an automated notification. For questions, contact support.</p>
      </div>
    </div>
  `

  await resend.emails.send({
    from: 'Jamaica House Brand <orders@jamaicahousebrand.com>',
    to: [partner.email],
    cc: ['orders@jamaicahousebrand.com'], // Also send to main orders email
    subject: `🍴 New Atlanta Street Series Order - ${orderData.name} (${statusText})`,
    html: emailHtml,
  })
}
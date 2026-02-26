import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'

async function sendSlackNotification(session: Stripe.Checkout.Session) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const total = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A'
  const email = session.customer_details?.email || 'No email'
  const shippingDetails = session.collected_information?.shipping_details
  const name = shippingDetails?.name || session.customer_details?.name || 'N/A'
  const address = shippingDetails?.address
  const addressLine = address
    ? `${address.line1 || ''}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.state} ${address.postal_code}`
    : 'No address'
  const shipping = session.shipping_cost?.amount_total != null
    ? session.shipping_cost.amount_total === 0
      ? 'Free Shipping'
      : `$${(session.shipping_cost.amount_total / 100).toFixed(2)}`
    : 'N/A'
  const items = session.line_items?.data
    .map((item) => `• ${item.quantity}x ${item.description}`)
    .join('\n') || 'Items not available'

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🛒 New Order Received!' },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Total:*\n${total}` },
            { type: 'mrkdwn', text: `*Shipping:*\n${shipping}` },
            { type: 'mrkdwn', text: `*Customer:*\n${email}` },
            { type: 'mrkdwn', text: `*Ship To:*\n${name}` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Address:*\n${addressLine}` },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Items:*\n${items}` },
        },
      ],
    }),
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text() // CRITICAL: Use raw body text for signature verification
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle event types
  switch (event.type) {
    case 'checkout.session.completed': {
      // Retrieve full session with line items for the Slack notification
      const session = await getStripe().checkout.sessions.retrieve(
        (event.data.object as Stripe.Checkout.Session).id,
        { expand: ['line_items', 'collected_information'] }
      )

      // Log order details — source of truth for payment confirmation
      console.log('Order completed:', {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email,
      })

      // Send Slack notification (fire-and-forget — don't block Stripe response)
      sendSlackNotification(session).catch((err) =>
        console.error('Slack notification failed:', err)
      )

      break
    }
    default:
      // Log unhandled event types (informational, not an error)
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Return 200 immediately — Stripe requires fast response
  return NextResponse.json({ received: true })
}

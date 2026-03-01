import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'

async function sendFulfillmentEmail(session: Stripe.Checkout.Session) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) return

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  const total = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A'
  const customerEmail = session.customer_details?.email || 'No email provided'
  const shippingDetails = session.collected_information?.shipping_details
  const customerName = shippingDetails?.name || session.customer_details?.name || 'N/A'
  const address = shippingDetails?.address
  const shippingCost = session.shipping_cost?.amount_total != null
    ? session.shipping_cost.amount_total === 0
      ? 'Free Shipping'
      : `$${(session.shipping_cost.amount_total / 100).toFixed(2)}`
    : 'N/A'

  const itemRows = session.line_items?.data
    .map((item) => {
      const unitPrice = item.amount_total != null && item.quantity
        ? `$${(item.amount_total / item.quantity / 100).toFixed(2)}`
        : 'N/A'
      const lineTotal = item.amount_total != null
        ? `$${(item.amount_total / 100).toFixed(2)}`
        : 'N/A'
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description || 'Item'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${unitPrice}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${lineTotal}</td>
        </tr>`
    })
    .join('') || '<tr><td colspan="4" style="padding: 10px;">No items available</td></tr>'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #d4a437; margin: 0; font-size: 24px;">New Order Received</h1>
      </div>

      <div style="padding: 24px; background: #fff;">
        <p style="font-size: 14px; color: #666; margin-top: 0;">Order ID: <strong>${session.id}</strong></p>

        <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Customer Details</h2>
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 4px 0; color: #666; width: 120px;">Name:</td><td><strong>${customerName}</strong></td></tr>
          <tr><td style="padding: 4px 0; color: #666;">Email:</td><td><strong>${customerEmail}</strong></td></tr>
        </table>

        <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Shipping Address</h2>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          ${customerName}<br>
          ${address ? `${address.line1 || ''}${address.line2 ? `<br>${address.line2}` : ''}<br>${address.city}, ${address.state} ${address.postal_code}<br>${address.country || 'US'}` : 'No address provided'}
        </p>

        <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Items Ordered</h2>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
          <tr><td style="padding: 4px 0; color: #666;">Shipping:</td><td style="text-align: right;">${shippingCost}</td></tr>
          <tr style="font-size: 18px; font-weight: bold;"><td style="padding: 8px 0; border-top: 2px solid #333;">Total Paid:</td><td style="text-align: right; padding: 8px 0; border-top: 2px solid #333;">${total}</td></tr>
        </table>
      </div>

      <div style="background: #1a1a2e; padding: 16px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">Jamaica House Brand — Order Fulfillment Notification</p>
      </div>
    </div>`

  await transporter.sendMail({
    from: '"Jamaica House Brand Orders" <olatunde@jamaicahousebrand.com>',
    to: 'olatunde@jamaicahousebrand.com',
    subject: `New Order — ${customerName} — ${total}`,
    html,
  })
}

async function postToCommandCenter(payload: {
  orderId: string
  customerEmail: string
  firstName: string
  lastName: string
  phone?: string
  items: { name: string; qty: number; price: number }[]
  shippingCost: number
  orderTotal: number
  orderDate: string
}) {
  const webhookUrl = process.env.COMMAND_CENTER_WEBHOOK_URL
  const webhookKey = process.env.COMMAND_CENTER_WEBHOOK_API_KEY

  if (!webhookUrl) {
    console.log('COMMAND_CENTER_WEBHOOK_URL not set — skipping')
    return
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (webhookKey) headers['Authorization'] = `Bearer ${webhookKey}`

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Command Center webhook ${response.status}: ${text}`)
  }

  const data = await response.json()
  console.log('Command Center webhook success:', data)
}

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

      // Build Command Center payload
      const ccShipping = session.collected_information?.shipping_details
      const ccName = ccShipping?.name || session.customer_details?.name || ''
      const ccNameParts = ccName.split(' ')
      const ccItems = session.line_items?.data.map((item) => ({
        name: item.description || 'Item',
        qty: item.quantity || 1,
        price: item.amount_total != null && item.quantity
          ? Number((item.amount_total / item.quantity / 100).toFixed(2))
          : 0,
      })) || []

      // Send notifications — must await before returning so Vercel doesn't kill the function
      await Promise.allSettled([
        sendSlackNotification(session),
        sendFulfillmentEmail(session),
        postToCommandCenter({
          orderId: session.id,
          customerEmail: session.customer_details?.email || '',
          firstName: ccNameParts[0] || '',
          lastName: ccNameParts.slice(1).join(' ') || '',
          phone: session.customer_details?.phone || undefined,
          items: ccItems,
          shippingCost: (session.shipping_cost?.amount_total || 0) / 100,
          orderTotal: (session.amount_total || 0) / 100,
          orderDate: new Date().toISOString(),
        }),
      ]).then((results) => {
        const labels = ['Slack notification', 'Fulfillment email', 'Command Center webhook']
        results.forEach((result, i) => {
          if (result.status === 'rejected') {
            console.error(`${labels[i]} failed:`, result.reason)
          }
        })
      })

      break
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Only handle our custom checkout PaymentIntents
      if (paymentIntent.metadata.source !== 'jamaica-house-brand-checkout') break

      const isUpsell = paymentIntent.metadata.type === 'post_purchase_upsell'
      const total = `$${(paymentIntent.amount / 100).toFixed(2)}`
      const customerName = paymentIntent.metadata.customer_name || 'N/A'
      const customerEmail = paymentIntent.metadata.customer_email || ''
      const shippingAddress = paymentIntent.metadata.shipping_address || ''
      const shippingCost = paymentIntent.metadata.shipping_cost
        ? paymentIntent.metadata.shipping_cost === '0'
          ? 'Free Shipping'
          : `$${(parseInt(paymentIntent.metadata.shipping_cost) / 100).toFixed(2)}`
        : 'N/A'

      let items: { id: string; name: string; price: number; quantity: number }[] = []
      try {
        items = JSON.parse(paymentIntent.metadata.items || '[]')
      } catch {
        // metadata parsing failed
      }

      const label = isUpsell ? 'Upsell Added' : 'New Order Received'

      console.log(`${label}:`, {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        customerEmail,
        isUpsell,
      })

      // If we can resolve the customer, get their email from the Customer object
      let resolvedEmail = customerEmail
      if (!resolvedEmail && paymentIntent.customer) {
        try {
          const customer = await getStripe().customers.retrieve(
            typeof paymentIntent.customer === 'string'
              ? paymentIntent.customer
              : paymentIntent.customer.id
          )
          if (customer && !customer.deleted) {
            resolvedEmail = customer.email || ''
          }
        } catch {
          // Customer retrieval failed
        }
      }

      // Send fulfillment email
      const appPassword = process.env.GMAIL_APP_PASSWORD
      if (appPassword) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'olatunde@jamaicahousebrand.com',
            pass: appPassword,
          },
        })

        const itemRows = items.length > 0
          ? items.map((item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity / 100).toFixed(2)}</td>
            </tr>`).join('')
          : '<tr><td colspan="4" style="padding: 10px;">No items available</td></tr>'

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: #1a1a2e; padding: 24px; text-align: center;">
              <h1 style="color: #d4a437; margin: 0; font-size: 24px;">${label}</h1>
            </div>
            <div style="padding: 24px; background: #fff;">
              <p style="font-size: 14px; color: #666; margin-top: 0;">Payment ID: <strong>${paymentIntent.id}</strong></p>
              ${isUpsell ? `<p style="font-size: 14px; color: #666;">Original Order: <strong>${paymentIntent.metadata.original_payment_intent}</strong></p>` : ''}
              <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Customer Details</h2>
              <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
                <tr><td style="padding: 4px 0; color: #666; width: 120px;">Name:</td><td><strong>${customerName}</strong></td></tr>
                <tr><td style="padding: 4px 0; color: #666;">Email:</td><td><strong>${resolvedEmail || 'N/A'}</strong></td></tr>
              </table>
              ${!isUpsell ? `
              <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Shipping Address</h2>
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">${shippingAddress || 'No address provided'}</p>
              ` : ''}
              <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Items Ordered</h2>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background: #f8f8f8;">
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
                ${!isUpsell ? `<tr><td style="padding: 4px 0; color: #666;">Shipping:</td><td style="text-align: right;">${shippingCost}</td></tr>` : ''}
                <tr style="font-size: 18px; font-weight: bold;"><td style="padding: 8px 0; border-top: 2px solid #333;">Total Paid:</td><td style="text-align: right; padding: 8px 0; border-top: 2px solid #333;">${total}</td></tr>
              </table>
            </div>
            <div style="background: #1a1a2e; padding: 16px; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">Jamaica House Brand — Order Fulfillment Notification</p>
            </div>
          </div>`

        try {
          await transporter.sendMail({
            from: '"Jamaica House Brand Orders" <olatunde@jamaicahousebrand.com>',
            to: 'olatunde@jamaicahousebrand.com',
            subject: `${label} — ${customerName} — ${total}`,
            html,
          })
        } catch (emailErr) {
          console.error('PaymentIntent fulfillment email failed:', emailErr)
        }
      }

      // Send Slack notification
      const webhookUrl = process.env.SLACK_WEBHOOK_URL
      if (webhookUrl) {
        const itemsList = items.length > 0
          ? items.map((item) => `\u2022 ${item.quantity}x ${item.name}`).join('\n')
          : 'Items not available'

        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blocks: [
                {
                  type: 'header',
                  text: { type: 'plain_text', text: isUpsell ? '\u2B06\uFE0F Upsell Added!' : '\uD83D\uDED2 New Order Received!' },
                },
                {
                  type: 'section',
                  fields: [
                    { type: 'mrkdwn', text: `*Total:*\n${total}` },
                    ...(isUpsell ? [] : [{ type: 'mrkdwn', text: `*Shipping:*\n${shippingCost}` }]),
                    { type: 'mrkdwn', text: `*Customer:*\n${resolvedEmail || 'N/A'}` },
                    { type: 'mrkdwn', text: `*Name:*\n${customerName}` },
                  ],
                },
                ...(!isUpsell && shippingAddress ? [{
                  type: 'section',
                  text: { type: 'mrkdwn', text: `*Address:*\n${shippingAddress}` },
                }] : []),
                {
                  type: 'section',
                  text: { type: 'mrkdwn', text: `*Items:*\n${itemsList}` },
                },
              ],
            }),
          })
        } catch (slackErr) {
          console.error('PaymentIntent Slack notification failed:', slackErr)
        }
      }

      // Post to Command Center
      const piNameParts = customerName.split(' ')
      const piItems = items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: Number((item.price / 100).toFixed(2)),
      }))
      try {
        await postToCommandCenter({
          orderId: paymentIntent.id,
          customerEmail: resolvedEmail || '',
          firstName: piNameParts[0] || '',
          lastName: piNameParts.slice(1).join(' ') || '',
          items: piItems,
          shippingCost: parseInt(paymentIntent.metadata.shipping_cost || '0') / 100,
          orderTotal: paymentIntent.amount / 100,
          orderDate: new Date().toISOString(),
        })
      } catch (ccErr) {
        console.error('PaymentIntent Command Center webhook failed:', ccErr)
      }

      break
    }
    default:
      // Log unhandled event types (informational, not an error)
      console.log(`Unhandled event type: ${event.type}`)
  }

  // Return 200 immediately — Stripe requires fast response
  return NextResponse.json({ received: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import { db } from '@/lib/database'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { onOrderComplete as mailchimpSync } from '@/lib/mailchimp-sync'
import { calculateShipping, type ShippingItem } from '@/lib/shipping-calc'
import { sendOrderConfirmationEmail } from '@/lib/customer-emails'

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
  promoCode?: string
  promoDiscount?: number
  shippingAddressLine1?: string
  shippingAddressLine2?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
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

async function handleCateringPayment(session: Stripe.Checkout.Session) {
  console.log('[stripe-webhook] Handling catering payment:', session.id)

  try {
    // Check if this is a catering payment
    const paymentType = session.metadata?.paymentType
    const dbOrderId = session.metadata?.dbOrderId
    const orderId = session.metadata?.orderId
    const paymentId = session.metadata?.paymentId

    if (paymentType !== 'catering_deposit' || !dbOrderId || !paymentId) {
      console.log('[stripe-webhook] Not a catering payment, skipping')
      return
    }

    console.log('[stripe-webhook] Processing catering deposit payment:', {
      sessionId: session.id,
      orderId,
      dbOrderId,
      paymentId,
      amount: session.amount_total
    })

    // Update payment status
    await db.updatePaymentStatus(paymentId, 'succeeded', {
      charge_id: session.payment_intent as string,
      payment_intent_id: session.payment_intent as string
    })

    // Update order status
    await db.updateOrder(dbOrderId, {
      payment_status: 'deposit_paid',
      status: 'confirmed',
      workflow_stage: 'deposit_received'
    })

    // Track lead activity
    const order = await db.getOrder(dbOrderId)
    if (order?.customer_id) {
      await db.trackLeadActivity({
        customer_id: order.customer_id,
        order_id: dbOrderId,
        activity_type: 'deposit_paid',
        description: `Deposit payment of $${(session.amount_total! / 100).toFixed(2)} received`,
        metadata: {
          stripe_session_id: session.id,
          amount: session.amount_total! / 100
        }
      })

      // Update customer stats
      await db.updateCustomerStats(order.customer_id, session.amount_total! / 100)
    }

    console.log('[stripe-webhook] Catering payment processed successfully')

    // Send catering-specific notifications
    await sendCateringDepositNotification(session, order)

  } catch (error) {
    console.error('[stripe-webhook] Error processing catering payment:', error)
    throw error
  }
}

async function sendCateringDepositNotification(
  session: Stripe.Checkout.Session,
  order: any
) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) return

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A'
  const customerEmail = session.customer_details?.email || order?.customer?.email || 'No email'
  const customerName = order?.customer?.name || 'Customer'
  const orderNumber = order?.order_number || session.metadata?.orderId || 'Unknown'

  await transporter.sendMail({
    from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
    to: 'olatunde@jamaicahousebrand.com',
    subject: `🎉 DEPOSIT RECEIVED: ${orderNumber} - ${amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">💰 Deposit Received!</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Order: ${orderNumber}</p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #28a745; margin-top: 0;">Payment Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Customer:</td><td>${customerName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Deposit Amount:</td><td style="font-size: 18px; font-weight: bold; color: #28a745;">${amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Event Date:</td><td>${order?.event_date || 'Not available'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Guest Count:</td><td>${order?.guest_count || 'Not available'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Status:</td><td style="color: #28a745; font-weight: bold;">CONFIRMED ✅</td></tr>
          </table>

          <div style="background: #d4f8d4; border: 1px solid #28a745; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #28a745;">🎯 Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Order is confirmed and date reserved</li>
              <li>Balance payment will be due 2 weeks before event</li>
              <li>Customer will receive automated reminders</li>
            </ul>
          </div>

          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
            Payment processed: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
          </p>
        </div>
      </div>
    `,
  })

  console.log('[stripe-webhook] Catering deposit notification sent')
}

async function handleWholesaleOrder(session: Stripe.Checkout.Session) {
  console.log('[stripe-webhook] Processing wholesale order:', session.id)

  const meta = session.metadata || {}
  const total = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A'
  const businessName = meta.business_name || 'Unknown Business'
  const contactName = meta.contact_name || 'Unknown'
  const phone = meta.phone || ''
  const email = session.customer_details?.email || ''
  const deliveryMethod = meta.delivery_method || 'local'
  const deliveryAddress = meta.delivery_address || ''
  const requestedDate = meta.requested_date || ''
  const notes = meta.notes || ''
  const qtyGallon = parseInt(meta.qty_gallon || '0')
  const qtyCase = parseInt(meta.qty_case || '0')
  const qtyEscovitch = parseInt(meta.qty_escovitch || '0')

  const lineItems: string[] = []
  if (qtyGallon > 0) lineItems.push(`${qtyGallon}× Gallon`)
  if (qtyCase > 0) lineItems.push(`${qtyCase}× 5oz Case`)
  if (qtyEscovitch > 0) lineItems.push(`${qtyEscovitch}× Pikliz Case`)

  const deliveryLabel = deliveryMethod === 'local' ? 'Local Delivery (Free)'
    : deliveryMethod === 'pickup' ? `Pickup — ${deliveryAddress}`
    : `Shipping to ${deliveryAddress}`

  // 1. Slack notification
  const slackUrl = process.env.SLACK_WEBHOOK_URL
  if (slackUrl) {
    try {
      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: `🌶️ WHOLESALE ORDER PAID — ${total}` },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Business:*\n${businessName}` },
                { type: 'mrkdwn', text: `*Contact:*\n${contactName}` },
                { type: 'mrkdwn', text: `*Phone:*\n<tel:${phone}|${phone}>` },
                { type: 'mrkdwn', text: `*Email:*\n<mailto:${email}|${email}>` },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Order:* ${lineItems.join(' · ')}\n*Delivery:* ${deliveryLabel}\n*Requested Date:* ${requestedDate || 'Not specified'}\n*Total Paid:* ${total}`,
              },
            },
            ...(notes ? [{
              type: 'section' as const,
              text: { type: 'mrkdwn' as const, text: `*Notes:* ${notes}` },
            }] : []),
            {
              type: 'context',
              elements: [{
                type: 'mrkdwn',
                text: `✅ Payment confirmed via Stripe · <https://command-center.jamaicahousebrand.com/dashboard/restaurant-leads|View in Command Center>`,
              }],
            },
          ],
        }),
      })
    } catch (err) {
      console.error('[wholesale-webhook] Slack failed:', err)
    }
  }

  // 2. Fulfillment email
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (appPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'olatunde@jamaicahousebrand.com', pass: appPassword },
      })

      const firstName = contactName.split(' ')[0]

      await Promise.allSettled([
        // Internal notification
        transporter.sendMail({
          from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
          to: 'olatunde@jamaicahousebrand.com',
          subject: `🌶️ WHOLESALE ORDER PAID — ${businessName} — ${total}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#2D5016;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
                <h1 style="color:#D4A843;margin:0;font-size:22px;">Wholesale Order — PAID</h1>
              </div>
              <div style="padding:20px;background:#f9f9f9;border-radius:0 0 8px 8px;">
                <table style="width:100%;font-size:14px;">
                  <tr><td style="padding:6px 0;font-weight:bold;width:130px;">Business:</td><td>${businessName}</td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Contact:</td><td>${contactName}</td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Phone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Delivery:</td><td>${deliveryLabel}</td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Requested Date:</td><td>${requestedDate || 'Not specified'}</td></tr>
                </table>
                <hr style="margin:16px 0;">
                <table style="width:100%;font-size:14px;">
                  ${qtyGallon > 0 ? `<tr><td>Jerk Sauce · 1 Gallon</td><td style="text-align:right;">×${qtyGallon}</td><td style="text-align:right;">$${(qtyGallon * 50).toFixed(2)}</td></tr>` : ''}
                  ${qtyCase > 0 ? `<tr><td>Jerk Sauce · 5oz Case</td><td style="text-align:right;">×${qtyCase}</td><td style="text-align:right;">$${(qtyCase * 72).toFixed(2)}</td></tr>` : ''}
                  ${qtyEscovitch > 0 ? `<tr><td>Escovitch Pikliz Case</td><td style="text-align:right;">×${qtyEscovitch}</td><td style="text-align:right;">$${(qtyEscovitch * 72).toFixed(2)}</td></tr>` : ''}
                </table>
                <div style="background:#2D5016;color:#fff;padding:12px;border-radius:6px;margin-top:16px;text-align:center;font-size:18px;font-weight:bold;">
                  Total Paid: ${total}
                </div>
                ${notes ? `<p style="margin-top:12px;font-size:13px;color:#666;"><strong>Notes:</strong> ${notes}</p>` : ''}
              </div>
            </div>`,
        }),
        // Customer confirmation
        transporter.sendMail({
          from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
          to: email,
          subject: `Order confirmed, ${firstName}! 🌶️`,
          text: `Hi ${firstName},\n\nYour wholesale order for ${businessName} is confirmed and paid! Here's what's next:\n\n${deliveryMethod === 'pickup' ? `Your order will be ready for pickup at ${deliveryAddress}. We'll call you when it's ready.` : deliveryMethod === 'local' ? `We'll deliver to ${deliveryAddress}. We'll confirm your delivery window.` : `We'll ship to ${deliveryAddress} and send you tracking info.`}\n\nOrder: ${lineItems.join(', ')}\nTotal Paid: ${total}\n\nQuestions? Call 786-709-1027.\n\n— Tunde\nJamaica House Brand`,
        }),
      ])
    } catch (err) {
      console.error('[wholesale-webhook] Email failed:', err)
    }
  }

  // 3. Sync to Command Center as lead
  try {
    const ccUrl = process.env.COMMAND_CENTER_WEBHOOK_URL?.replace('/incoming-order', '/incoming-lead')
    const ccKey = process.env.COMMAND_CENTER_WEBHOOK_API_KEY
    if (ccUrl && ccKey) {
      await fetch(ccUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ccKey}` },
        body: JSON.stringify({
          businessName,
          contactName,
          phone,
          email,
          deliveryAddress,
          deliveryMethod,
          requestedDate,
          qtyGallon,
          qtyCase,
          qtyEscovitch,
          priceGallon: 50,
          priceCase: 72,
          priceEscovitch: 72,
          orderTotal: (session.amount_total || 0) / 100,
          paymentMethod: 'Stripe',
          paymentStatus: 'paid',
          paidAmount: (session.amount_total || 0) / 100,
          paidDate: new Date().toISOString(),
          paymentRef: session.payment_intent || session.id,
          notes: notes || null,
          status: 'CLOSED_WON',
          source: 'stripe-wholesale',
          taxCertFileName: null,
        }),
      })
    }
  } catch (err) {
    console.error('[wholesale-webhook] CC sync failed:', err)
  }

  console.log('[stripe-webhook] Wholesale order processed:', businessName, total)
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
        paymentType: session.metadata?.paymentType
      })

      // Handle catering payments
      if (session.metadata?.paymentType === 'catering_deposit') {
        await handleCateringPayment(session)
        return NextResponse.json({ received: true })
      }

      // Handle wholesale restaurant orders
      if (session.metadata?.order_type === 'wholesale') {
        await handleWholesaleOrder(session)
        return NextResponse.json({ received: true })
      }

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

      // Shipping summary for fulfillment records
      const shippingItems: ShippingItem[] = ccItems.map((item) => ({
        productId: item.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        qty: item.qty,
      }))
      const shippingInfo = calculateShipping(shippingItems)
      console.log(`Shipping: Box ${shippingInfo.boxSize} | ${shippingInfo.carrier}`)

      // Build email data for customer confirmation
      const customerEmail = session.customer_details?.email || ''
      const customerFirstName = ccNameParts[0] || 'Customer'
      const emailItems = ccItems.map((item) => ({
        name: item.name,
        quantity: item.qty,
        price: item.price * item.qty,
      }))
      const emailShippingCost = (session.shipping_cost?.amount_total || 0) / 100
      const emailOrderTotal = (session.amount_total || 0) / 100

      // Send notifications — must await before returning so Vercel doesn't kill the function
      await Promise.allSettled([
        sendSlackNotification(session),
        sendFulfillmentEmail(session),
        sendOrderConfirmationEmail({
          customerFirstName,
          customerEmail,
          orderId: session.id,
          items: emailItems,
          shippingCost: emailShippingCost,
          orderTotal: emailOrderTotal,
        }),
        postToCommandCenter({
          orderId: session.id,
          customerEmail,
          firstName: ccNameParts[0] || '',
          lastName: ccNameParts.slice(1).join(' ') || '',
          phone: session.customer_details?.phone || undefined,
          items: ccItems,
          shippingCost: emailShippingCost,
          orderTotal: emailOrderTotal,
          orderDate: new Date().toISOString(),
          promoCode: session.metadata?.promoCode || undefined,
          promoDiscount: session.metadata?.promoDiscount
            ? parseFloat(session.metadata.promoDiscount)
            : undefined,
          shippingAddressLine1: ccShipping?.address?.line1 || undefined,
          shippingAddressLine2: ccShipping?.address?.line2 || undefined,
          shippingCity: ccShipping?.address?.city || undefined,
          shippingState: ccShipping?.address?.state || undefined,
          shippingZip: ccShipping?.address?.postal_code || undefined,
          shippingCountry: ccShipping?.address?.country || 'US',
        }),
        mailchimpSync({
          customerEmail,
          firstName: ccNameParts[0] || '',
          lastName: ccNameParts.slice(1).join(' ') || '',
          phone: session.customer_details?.phone || undefined,
          items: shippingItems.map((si) => ({ productId: si.productId, qty: si.qty })),
        }),
      ]).then((results) => {
        const labels = ['Slack notification', 'Fulfillment email', 'Customer confirmation email', 'Command Center webhook + inventory fulfillment', 'Mailchimp sync']
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

      // Prepare all data for parallel execution
      const usedPromoCode = paymentIntent.metadata.promoCode
      const piNameParts = customerName.split(' ')
      const piItems = items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: Number((item.price / 100).toFixed(2)),
      }))
      const piShippingCost = parseInt(paymentIntent.metadata.shipping_cost || '0') / 100
      const piOrderTotal = paymentIntent.amount / 100

      // Build fulfillment email HTML
      const itemRows = items.length > 0
        ? items.map((item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity / 100).toFixed(2)}</td>
            </tr>`).join('')
        : '<tr><td colspan="4" style="padding: 10px;">No items available</td></tr>'

      const fulfillmentHtml = `
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

      // Build Slack blocks
      const itemsList = items.length > 0
        ? items.map((item) => `\u2022 ${item.quantity}x ${item.name}`).join('\n')
        : 'Items not available'
      const slackBlocks = [
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
      ]

      // Run ALL notifications in parallel — must complete before Vercel kills the function
      await Promise.allSettled([
        // 1. Fulfillment email to owner
        (async () => {
          const appPassword = process.env.GMAIL_APP_PASSWORD
          if (!appPassword) return
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'olatunde@jamaicahousebrand.com', pass: appPassword },
          })
          await transporter.sendMail({
            from: '"Jamaica House Brand Orders" <olatunde@jamaicahousebrand.com>',
            to: 'olatunde@jamaicahousebrand.com',
            subject: `${label} — ${customerName} — ${total}`,
            html: fulfillmentHtml,
          })
        })(),
        // 2. Slack notification
        (async () => {
          const slackUrl = process.env.SLACK_WEBHOOK_URL
          if (!slackUrl) return
          await fetch(slackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocks: slackBlocks }),
          })
        })(),
        // 3. Promo code usage increment
        (async () => {
          if (!usedPromoCode) return
          const { data: promo } = await getSupabase()
            .from('promo_codes')
            .select('usage_count')
            .eq('code', usedPromoCode)
            .single()
          if (promo) {
            await getSupabase()
              .from('promo_codes')
              .update({ usage_count: promo.usage_count + 1 })
              .eq('code', usedPromoCode)
          }
        })(),
        // 4. Command Center webhook + inventory fulfillment
        postToCommandCenter({
          orderId: paymentIntent.id,
          customerEmail: resolvedEmail || '',
          firstName: piNameParts[0] || '',
          lastName: piNameParts.slice(1).join(' ') || '',
          items: piItems,
          shippingCost: piShippingCost,
          orderTotal: piOrderTotal,
          orderDate: new Date().toISOString(),
          promoCode: usedPromoCode || undefined,
          promoDiscount: paymentIntent.metadata.promoDiscount
            ? parseInt(paymentIntent.metadata.promoDiscount) / 100
            : undefined,
          shippingAddressLine1: paymentIntent.shipping?.address?.line1 || paymentIntent.metadata.shipping_line1 || paymentIntent.metadata.shipping_address?.split(',')[0]?.trim() || undefined,
          shippingAddressLine2: paymentIntent.shipping?.address?.line2 || paymentIntent.metadata.shipping_line2 || undefined,
          shippingCity: paymentIntent.shipping?.address?.city || paymentIntent.metadata.shipping_city || undefined,
          shippingState: paymentIntent.shipping?.address?.state || paymentIntent.metadata.shipping_state || undefined,
          shippingZip: paymentIntent.shipping?.address?.postal_code || paymentIntent.metadata.shipping_zip || undefined,
          shippingCountry: paymentIntent.shipping?.address?.country || 'US',
        }),
        // 5. Customer confirmation email
        resolvedEmail ? sendOrderConfirmationEmail({
          customerFirstName: piNameParts[0] || 'Customer',
          customerEmail: resolvedEmail,
          orderId: paymentIntent.id,
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: (item.price * item.quantity) / 100,
          })),
          shippingCost: piShippingCost,
          orderTotal: piOrderTotal,
        }) : Promise.resolve(),
        // 6. Mailchimp sync
        mailchimpSync({
          customerEmail: resolvedEmail || '',
          firstName: piNameParts[0] || '',
          lastName: piNameParts.slice(1).join(' ') || '',
          phone: undefined,
          items: items.map((item) => ({
            productId: item.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            qty: item.quantity,
          })),
        }),
      ]).then((results) => {
        const labels = ['Fulfillment email', 'Slack notification', 'Promo increment', 'Command Center webhook', 'Customer confirmation email', 'Mailchimp sync']
        results.forEach((result, i) => {
          if (result.status === 'rejected') {
            console.error(`PI ${labels[i]} failed:`, result.reason)
          }
        })
      })

      break
    }
    case 'payment_intent.payment_failed': {
      const failedPI = event.data.object as Stripe.PaymentIntent
      const failAmount = `$${(failedPI.amount / 100).toFixed(2)}`
      const failEmail = failedPI.metadata?.customer_email || failedPI.receipt_email || 'Unknown'
      const failName = failedPI.metadata?.customer_name || 'Unknown'
      const failReason = failedPI.last_payment_error?.message || 'Unknown reason'

      console.error('[stripe-webhook] Payment failed:', {
        id: failedPI.id,
        amount: failAmount,
        email: failEmail,
        reason: failReason,
      })

      // Slack alert for failed payment
      const slackUrl = process.env.SLACK_WEBHOOK_URL
      if (slackUrl) {
        try {
          await fetch(slackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blocks: [
                {
                  type: 'header',
                  text: { type: 'plain_text', text: '❌ Payment Failed' },
                },
                {
                  type: 'section',
                  fields: [
                    { type: 'mrkdwn', text: `*Amount:*\n${failAmount}` },
                    { type: 'mrkdwn', text: `*Customer:*\n${failEmail}` },
                    { type: 'mrkdwn', text: `*Name:*\n${failName}` },
                    { type: 'mrkdwn', text: `*Reason:*\n${failReason}` },
                  ],
                },
                {
                  type: 'context',
                  elements: [{
                    type: 'mrkdwn',
                    text: `Payment Intent: ${failedPI.id}`,
                  }],
                },
              ],
            }),
          })
        } catch (err) {
          console.error('[stripe-webhook] Slack failed payment notification error:', err)
        }
      }

      break
    }

    case 'checkout.session.expired': {
      const expiredSession = event.data.object as Stripe.Checkout.Session
      const expEmail = expiredSession.customer_details?.email || 'Unknown'
      const expAmount = expiredSession.amount_total
        ? `$${(expiredSession.amount_total / 100).toFixed(2)}`
        : 'N/A'

      console.log('[stripe-webhook] Checkout session expired (abandoned cart):', {
        id: expiredSession.id,
        email: expEmail,
        amount: expAmount,
      })

      // Slack alert for abandoned cart
      const slackUrlExp = process.env.SLACK_WEBHOOK_URL
      if (slackUrlExp) {
        try {
          const recoveryUrl = expiredSession.after_expiration?.recovery?.url
          await fetch(slackUrlExp, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blocks: [
                {
                  type: 'header',
                  text: { type: 'plain_text', text: '🛒 Abandoned Cart' },
                },
                {
                  type: 'section',
                  fields: [
                    { type: 'mrkdwn', text: `*Cart Value:*\n${expAmount}` },
                    { type: 'mrkdwn', text: `*Customer:*\n${expEmail}` },
                  ],
                },
                ...(recoveryUrl ? [{
                  type: 'section' as const,
                  text: { type: 'mrkdwn' as const, text: `*Recovery Link:*\n<${recoveryUrl}|Send to customer>` },
                }] : []),
                {
                  type: 'context',
                  elements: [{
                    type: 'mrkdwn',
                    text: `Session: ${expiredSession.id} · Stripe sends a recovery email automatically if customer provided their email.`,
                  }],
                },
              ],
            }),
          })
        } catch (err) {
          console.error('[stripe-webhook] Slack abandoned cart notification error:', err)
        }
      }

      // Send abandoned cart recovery email via Resend if we have the customer email
      if (expEmail && expEmail !== 'Unknown' && process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend')
          const resendClient = new Resend(process.env.RESEND_API_KEY)
          const recoveryUrl = expiredSession.after_expiration?.recovery?.url

          await resendClient.emails.send({
            from: 'Jamaica House Brand <orders@jamaicahousebrand.com>',
            to: expEmail,
            subject: 'You left something behind! 🌶️',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background: #1a1a2e; padding: 24px; text-align: center;">
                  <h1 style="color: #d4a437; margin: 0; font-size: 24px;">Still thinking it over?</h1>
                </div>
                <div style="padding: 24px; background: #fff;">
                  <p style="font-size: 16px; line-height: 1.6;">
                    Hey! We noticed you didn't finish your order. No worries — your cart is waiting for you.
                  </p>
                  <p style="font-size: 16px; line-height: 1.6;">
                    Our authentic Jamaican jerk sauce is handmade in small batches and sells out fast. Don't miss out!
                  </p>
                  ${recoveryUrl ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${recoveryUrl}" style="background: #d4a437; color: #1a1a2e; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; display: inline-block;">Complete Your Order</a>
                  </div>
                  ` : `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://jamaicahousebrand.com/shop" style="background: #d4a437; color: #1a1a2e; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; display: inline-block;">Visit Our Shop</a>
                  </div>
                  `}
                  <p style="font-size: 14px; color: #666;">
                    Questions? Reply to this email or call us at 786-709-1027.
                  </p>
                </div>
                <div style="background: #1a1a2e; padding: 16px; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">Jamaica House Brand — Bold Caribbean Flavor in Every Drop</p>
                </div>
              </div>
            `,
          })
          console.log('[stripe-webhook] Abandoned cart email sent to:', expEmail)
        } catch (err) {
          console.error('[stripe-webhook] Abandoned cart email failed:', err)
        }
      }

      break
    }

    case 'checkout.session.async_payment_failed': {
      const asyncFailSession = event.data.object as Stripe.Checkout.Session
      const asyncEmail = asyncFailSession.customer_details?.email || 'Unknown'
      const asyncAmount = asyncFailSession.amount_total
        ? `$${(asyncFailSession.amount_total / 100).toFixed(2)}`
        : 'N/A'

      console.error('[stripe-webhook] Async payment failed:', asyncFailSession.id)

      const slackUrlAsync = process.env.SLACK_WEBHOOK_URL
      if (slackUrlAsync) {
        try {
          await fetch(slackUrlAsync, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blocks: [
                {
                  type: 'header',
                  text: { type: 'plain_text', text: '⚠️ Async Payment Failed' },
                },
                {
                  type: 'section',
                  fields: [
                    { type: 'mrkdwn', text: `*Amount:*\n${asyncAmount}` },
                    { type: 'mrkdwn', text: `*Customer:*\n${asyncEmail}` },
                  ],
                },
              ],
            }),
          })
        } catch (err) {
          console.error('[stripe-webhook] Slack async payment notification error:', err)
        }
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

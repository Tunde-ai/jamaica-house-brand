import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface OrderPayload {
  businessName: string
  contactName: string
  phone: string
  email: string
  deliveryAddress: string
  requestedDate: string
  qtyGallon: number
  qtyCase: number
  qtyEscovitch: number
  paymentMethod: string
  notes: string
  taxCertBase64: string | null
  taxCertFileName: string | null
}

async function sendSlackAlert(body: OrderPayload, orderTotal: number) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const lineItems: string[] = []
  if (body.qtyGallon > 0) lineItems.push(`${body.qtyGallon}× Gallon`)
  if (body.qtyCase > 0) lineItems.push(`${body.qtyCase}× 5oz Case`)
  if (body.qtyEscovitch > 0) lineItems.push(`${body.qtyEscovitch}× Pikliz Case`)

  const payload = {
    text: `🌶️ NEW WHOLESALE LEAD — $${orderTotal.toFixed(0)}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🌶️ NEW WHOLESALE LEAD — $${orderTotal.toFixed(0)}`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Business:*\n${body.businessName}` },
          { type: 'mrkdwn', text: `*Contact:*\n${body.contactName}` },
          { type: 'mrkdwn', text: `*Phone:*\n<tel:${body.phone}|${body.phone}>` },
          { type: 'mrkdwn', text: `*Email:*\n<mailto:${body.email}|${body.email}>` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Order:* ${lineItems.join(' · ') || 'No items'}\n*Delivery:* ${body.requestedDate || 'Not specified'}\n*Address:* ${body.deliveryAddress || 'Not provided'}\n*Payment:* ${body.paymentMethod || 'Not specified'}`,
        },
      },
      ...(body.notes ? [{
        type: 'section',
        text: { type: 'mrkdwn', text: `*Notes:* ${body.notes}` },
      }] : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `⏱️ Respond fast — leads contacted within 5 minutes are 9× more likely to convert. View in <https://command-center-psi-nine.vercel.app/dashboard/restaurant-leads|Command Center>`,
          },
        ],
      },
    ],
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[restaurant-order] Slack alert failed:', err)
  }
}

async function sendEmails(body: OrderPayload) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) {
    console.warn('[restaurant-order] GMAIL_APP_PASSWORD not set — skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  const gallonTotal = (body.qtyGallon || 0) * 65
  const caseTotal = (body.qtyCase || 0) * 75
  const escovitchTotal = (body.qtyEscovitch || 0) * 75
  const orderTotal = gallonTotal + caseTotal + escovitchTotal
  const firstName = body.contactName.trim().split(' ')[0]

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  // ── Internal notification ──────────────────────────────────
  const internalText = `
JAMAICA HOUSE BRAND — NEW RESTAURANT PARTNER REQUEST
=====================================================

CONTACT INFO
Business: ${body.businessName}
Contact:  ${body.contactName}
Phone:    ${body.phone}
Email:    ${body.email}
Address:  ${body.deliveryAddress || 'Not provided'}
Delivery: ${body.requestedDate || 'Not specified'}

ORDER DETAILS
─────────────────────────────────────────
Product                              Qty    Total
${body.qtyGallon > 0 ? `Jerk Sauce · 1 Gallon ($65 ea)       ${body.qtyGallon}      $${gallonTotal.toFixed(2)}` : ''}
${body.qtyCase > 0 ? `Jerk Sauce · 5oz Case ($75 ea)        ${body.qtyCase}      $${caseTotal.toFixed(2)}` : ''}
${body.qtyEscovitch > 0 ? `Escovitch / Pikliz · 12oz Case ($75 ea)  ${body.qtyEscovitch}      $${escovitchTotal.toFixed(2)}` : ''}
─────────────────────────────────────────
ORDER TOTAL:                                 $${orderTotal.toFixed(2)}

Payment Method: ${body.paymentMethod || 'Not specified'}

Notes: ${body.notes || 'None'}

Resale Tax Certificate: ${body.taxCertBase64 ? `ATTACHED (${body.taxCertFileName})` : 'Not provided'}

─────────────────────────────────────────
Submitted: ${timestamp}
Source: jamaicahousebrand.com/restaurant-partners
`.trim()

  // ── Customer confirmation — warm, fast-response promise ───────
  const customerText = `
Hi ${firstName},

Thanks so much for reaching out about a wholesale partnership with Jamaica House Brand! I personally received your request for ${body.businessName} and I'm excited to work with you.

YOUR ORDER REQUEST
──────────────────
${body.qtyGallon > 0 ? `Jerk Sauce · 1 Gallon ($65 ea)  ×${body.qtyGallon}  $${gallonTotal.toFixed(2)}` : ''}
${body.qtyCase > 0 ? `Jerk Sauce · 5oz Case ($75 ea)  ×${body.qtyCase}  $${caseTotal.toFixed(2)}` : ''}
${body.qtyEscovitch > 0 ? `Escovitch / Pikliz · 12oz Case ($75 ea)  ×${body.qtyEscovitch}  $${escovitchTotal.toFixed(2)}` : ''}

Estimated Total: $${orderTotal.toFixed(2)}

WHAT HAPPENS NEXT
─────────────────
I'll personally call or email you within 24 hours to confirm pricing, answer any questions, and lock in your delivery date. If you need anything sooner, feel free to text or call me directly at 786-709-1027.

${body.paymentMethod === 'Credit Card' ? `
PAYMENT PROCESSING
─────────────────
We'll send you a secure payment link via email to process your credit card payment. No need to provide card details over the phone - everything is handled securely online.
` : ''}

Looking forward to bringing the island to your kitchen.

— Tunde
Jamaica House Brand
786-709-1027
jamaicahousebrand.com
From Our Family to Yours 🇯🇲
`.trim()

  // Build attachment if tax cert was uploaded
  const attachments = body.taxCertBase64 && body.taxCertFileName
    ? [{ filename: body.taxCertFileName, content: Buffer.from(body.taxCertBase64, 'base64') }]
    : []

  await Promise.allSettled([
    transporter.sendMail({
      from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
      to: 'info@jamaicahousebrand.com',
      replyTo: body.email,
      subject: `🌶️ New Restaurant Order Request — ${body.businessName}`,
      text: internalText,
      attachments,
    }),
    transporter.sendMail({
      from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
      to: body.email,
      subject: `We received your order request, ${firstName}! 🌶️`,
      text: customerText,
    }),
  ])
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderPayload = await request.json()

    if (!body.businessName?.trim()) {
      return NextResponse.json({ error: 'Business name is required.' }, { status: 400 })
    }
    if (!body.contactName?.trim()) {
      return NextResponse.json({ error: 'Contact name is required.' }, { status: 400 })
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const orderTotal = ((body.qtyGallon || 0) * 65) + ((body.qtyCase || 0) * 75) + ((body.qtyEscovitch || 0) * 75)
    if (orderTotal === 0) {
      return NextResponse.json({ error: 'Please add at least one product.' }, { status: 400 })
    }

    try {
      await sendEmails(body)
    } catch (emailError) {
      console.error('[restaurant-order] Email send failed:', emailError)
    }

    // Slack alert — fast response trigger
    try {
      await sendSlackAlert(body, orderTotal)
    } catch (slackError) {
      console.error('[restaurant-order] Slack alert failed:', slackError)
    }

    // Also POST to command center as a lead (non-blocking)
    try {
      const ccUrl = process.env.COMMAND_CENTER_WEBHOOK_URL?.replace('/incoming-order', '/incoming-lead')
      const ccKey = process.env.COMMAND_CENTER_WEBHOOK_API_KEY
      if (ccUrl && ccKey) {
        console.log('[restaurant-order] Attempting Command Center sync...')
        const response = await fetch(ccUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ccKey}`,
          },
          body: JSON.stringify({
            businessName: body.businessName,
            contactName: body.contactName,
            phone: body.phone,
            email: body.email,
            deliveryAddress: body.deliveryAddress,
            requestedDate: body.requestedDate,
            qtyGallon: body.qtyGallon,
            qtyCase: body.qtyCase,
            qtyEscovitch: body.qtyEscovitch,
            paymentMethod: body.paymentMethod,
            notes: body.notes,
            taxCertFileName: body.taxCertFileName,
          }),
        })

        if (!response.ok) {
          console.error('[restaurant-order] Command Center responded with:', response.status, await response.text())
        } else {
          console.log('[restaurant-order] Command Center sync successful')
        }
      } else {
        console.log('[restaurant-order] Command Center webhook not configured')
      }
    } catch (ccError) {
      console.error('[restaurant-order] Command Center lead sync failed:', ccError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[restaurant-order] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process order request. Please try again.' },
      { status: 500 }
    )
  }
}

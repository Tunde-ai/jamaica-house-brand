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

  const gallonTotal = (body.qtyGallon || 0) * 50
  const caseTotal = (body.qtyCase || 0) * 60
  const escovitchTotal = (body.qtyEscovitch || 0) * 72
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
${body.qtyGallon > 0 ? `Jerk Sauce · 1 Gallon ($50 ea)       ${body.qtyGallon}      $${gallonTotal.toFixed(2)}` : ''}
${body.qtyCase > 0 ? `Jerk Sauce · 5oz Case ($60 ea)        ${body.qtyCase}      $${caseTotal.toFixed(2)}` : ''}
${body.qtyEscovitch > 0 ? `Escovitch / Pikliz · 12oz Case ($72 ea)  ${body.qtyEscovitch}      $${escovitchTotal.toFixed(2)}` : ''}
─────────────────────────────────────────
ORDER TOTAL:                                 $${orderTotal.toFixed(2)}

Payment Method: ${body.paymentMethod || 'Not specified'}

Notes: ${body.notes || 'None'}

Resale Tax Certificate: ${body.taxCertBase64 ? `ATTACHED (${body.taxCertFileName})` : 'Not provided'}

─────────────────────────────────────────
Submitted: ${timestamp}
Source: jamaicahousebrand.com/restaurant-partners
`.trim()

  // ── Customer confirmation ──────────────────────────────────
  const customerText = `
Hi ${firstName},

Thanks for reaching out to Jamaica House Brand! We've received your order request and will be in touch within 1 business day to confirm your order and arrange delivery.

YOUR ORDER SUMMARY
──────────────────
${body.qtyGallon > 0 ? `Jerk Sauce · 1 Gallon ($50 ea)  ×${body.qtyGallon}  $${gallonTotal.toFixed(2)}` : ''}
${body.qtyCase > 0 ? `Jerk Sauce · 5oz Case ($60 ea)  ×${body.qtyCase}  $${caseTotal.toFixed(2)}` : ''}
${body.qtyEscovitch > 0 ? `Escovitch / Pikliz · 12oz Case ($72 ea)  ×${body.qtyEscovitch}  $${escovitchTotal.toFixed(2)}` : ''}

Order Total: $${orderTotal.toFixed(2)}
Payment Method: ${body.paymentMethod || 'Not specified'}

Questions? Call us at 786-709-1027 or reply to this email.

— The Jamaica House Brand Team
From Our Family to Yours 🇯🇲
jamaicahousebrand.com
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

    const orderTotal = ((body.qtyGallon || 0) * 50) + ((body.qtyCase || 0) * 60) + ((body.qtyEscovitch || 0) * 72)
    if (orderTotal === 0) {
      return NextResponse.json({ error: 'Please add at least one product.' }, { status: 400 })
    }

    try {
      await sendEmails(body)
    } catch (emailError) {
      console.error('[restaurant-order] Email send failed:', emailError)
    }

    // Also POST to command center as a lead (non-blocking)
    try {
      const ccUrl = process.env.COMMAND_CENTER_WEBHOOK_URL?.replace('/incoming-order', '/incoming-lead')
      const ccKey = process.env.COMMAND_CENTER_WEBHOOK_API_KEY
      if (ccUrl && ccKey) {
        await fetch(ccUrl, {
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

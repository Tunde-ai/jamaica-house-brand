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
  paymentMethod: string
  notes: string
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
  const orderTotal = gallonTotal + caseTotal
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
─────────────────────────────────────────
ORDER TOTAL:                                 $${orderTotal.toFixed(2)}

Payment Method: ${body.paymentMethod || 'Not specified'}

Notes: ${body.notes || 'None'}

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

Order Total: $${orderTotal.toFixed(2)}
Payment Method: ${body.paymentMethod || 'Not specified'}

Questions? Call us at 786-709-1027 or reply to this email.

— The Jamaica House Brand Team
From Our Family to Yours 🇯🇲
jamaicahousebrand.com
`.trim()

  await Promise.allSettled([
    transporter.sendMail({
      from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
      to: 'info@jamaicahousebrand.com',
      replyTo: body.email,
      subject: `🌶️ New Restaurant Order Request — ${body.businessName}`,
      text: internalText,
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

    const orderTotal = ((body.qtyGallon || 0) * 50) + ((body.qtyCase || 0) * 60)
    if (orderTotal === 0) {
      return NextResponse.json({ error: 'Please add at least one product.' }, { status: 400 })
    }

    try {
      await sendEmails(body)
    } catch (emailError) {
      console.error('[restaurant-order] Email send failed:', emailError)
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

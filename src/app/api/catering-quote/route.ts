import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface CateringQuoteBody {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  guestCount: string
  venue: string
  proteins: string
  message: string
}

async function sendQuoteNotification(body: CateringQuoteBody) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) {
    console.warn('[catering-quote] GMAIL_APP_PASSWORD not set — skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  await transporter.sendMail({
    from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
    to: 'info@jamaicahousebrand.com',
    replyTo: body.email,
    subject: `New Catering Quote Request — ${body.eventType} (${body.guestCount} guests)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a017; padding-bottom: 10px;">
          New Catering Quote Request
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">Name</td>
            <td style="padding: 8px 12px;">${body.name}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
            <td style="padding: 8px 12px;"><a href="mailto:${body.email}">${body.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td>
            <td style="padding: 8px 12px;"><a href="tel:${body.phone}">${body.phone}</a></td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Event Type</td>
            <td style="padding: 8px 12px;">${body.eventType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Event Date</td>
            <td style="padding: 8px 12px;">${body.eventDate}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Guest Count</td>
            <td style="padding: 8px 12px;">${body.guestCount}</td>
          </tr>
          ${body.venue ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Venue</td>
            <td style="padding: 8px 12px;">${body.venue}</td>
          </tr>` : ''}
          ${body.proteins ? `
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Preferred Proteins</td>
            <td style="padding: 8px 12px;">${body.proteins}</td>
          </tr>` : ''}
        </table>

        ${body.message ? `
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-left: 3px solid #d4a017; border-radius: 4px;">
          <strong style="color: #555;">Additional Details:</strong>
          <p style="margin: 8px 0 0; color: #333;">${body.message}</p>
        </div>` : ''}

        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Reply directly to this email to respond to the customer.
        </p>
      </div>
    `,
  })

  console.log('[catering-quote] Notification email sent to info@jamaicahousebrand.com')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CateringQuoteBody
    const { name, email, phone, eventType, eventDate, guestCount } = body

    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return NextResponse.json(
        { error: 'Name, email, phone, event type, date, and guest count are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    console.log('[catering-quote] New quote request:', {
      ...body,
      timestamp: new Date().toISOString(),
    })

    // Send email notification
    try {
      await sendQuoteNotification(body)
    } catch (emailErr) {
      console.error('[catering-quote] Email send failed:', emailErr)
      // Don't fail the request — the quote was still received
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[catering-quote] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}

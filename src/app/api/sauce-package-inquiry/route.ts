import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface SaucePackageBody {
  name: string
  email: string
  phone: string
  eventDate: string
  guestCount: string
  shippingCity: string
  shippingStateCountry: string
  shippingPostalCode: string
  notes: string
}

async function sendSaucePackageNotification(body: SaucePackageBody) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) {
    console.warn('[sauce-package-inquiry] GMAIL_APP_PASSWORD not set — skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'olatunde@jamaicahousebrand.com',
      pass: appPassword,
    },
  })

  const shippingDestination = `${body.shippingCity}, ${body.shippingStateCountry} ${body.shippingPostalCode}`.trim()

  await transporter.sendMail({
    from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
    to: 'olatunde@jamaicahousebrand.com',
    replyTo: body.email,
    subject: `[SAUCE PACKAGE INQUIRY] ${body.name} - Ship to ${body.shippingCity}, ${body.shippingStateCountry}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a017; padding-bottom: 10px;">
          🌎 Sauce Package Inquiry
        </h2>
        <p style="background: #e8f4f8; padding: 12px; border-left: 3px solid #2196f3; margin: 16px 0;">
          <strong>Note:</strong> This inquiry was redirected from the catering form because the customer is outside our South Florida service area.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">Name</td>
            <td style="padding: 8px 12px;">${body.name}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
            <td style="padding: 8px 12px;"><a href="mailto:${body.email}">${body.email}</a></td>
          </tr>
          ${body.phone ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td>
            <td style="padding: 8px 12px;"><a href="tel:${body.phone}">${body.phone}</a></td>
          </tr>` : ''}
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Event Date</td>
            <td style="padding: 8px 12px;">${body.eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Guest Count</td>
            <td style="padding: 8px 12px;">${body.guestCount}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Shipping Destination</td>
            <td style="padding: 8px 12px;"><strong>${shippingDestination}</strong></td>
          </tr>
        </table>

        ${body.notes ? `
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-left: 3px solid #d4a017; border-radius: 4px;">
          <strong style="color: #555;">Notes:</strong>
          <p style="margin: 8px 0 0; color: #333;">${body.notes}</p>
        </div>` : ''}

        <div style="margin-top: 24px; padding: 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;">
          <h3 style="color: #856404; margin: 0 0 8px;">💡 Sauce Package Suggestions</h3>
          <ul style="color: #856404; margin: 8px 0; padding-left: 20px;">
            <li>Jerk sauce bottles (1-2 per 10 guests recommended)</li>
            <li>Escovitch sauce (pairs well with seafood)</li>
            <li>Pikliz (spicy pickled vegetables - crowd favorite)</li>
            <li>Consider bulk pricing for 50+ guests</li>
          </ul>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Reply directly to this email to respond to the customer.
        </p>
      </div>
    `,
  })

  console.log('[sauce-package-inquiry] Notification email sent to olatunde@jamaicahousebrand.com')
}

async function sendSlackNotification(body: SaucePackageBody) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const shippingDestination = `${body.shippingCity}, ${body.shippingStateCountry} ${body.shippingPostalCode}`.trim()

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🌎 Sauce Package Inquiry' },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: ':information_source: *Redirected from catering form (out-of-area)*' }
          ]
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${body.name}` },
            { type: 'mrkdwn', text: `*Email:*\n${body.email}` },
            { type: 'mrkdwn', text: `*Event Date:*\n${body.eventDate}` },
            { type: 'mrkdwn', text: `*Guests:*\n${body.guestCount}` },
          ],
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Ship To:*\n${shippingDestination}` },
            ...(body.phone ? [{ type: 'mrkdwn', text: `*Phone:*\n${body.phone}` }] : []),
          ],
        },
        ...(body.notes ? [{
          type: 'section',
          text: { type: 'mrkdwn', text: `*Notes:*\n${body.notes}` },
        }] : []),
      ],
    }),
  })

  console.log('[sauce-package-inquiry] Slack notification sent')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaucePackageBody
    const { name, email, eventDate, guestCount, shippingCity, shippingStateCountry, shippingPostalCode } = body

    if (!name || !email || !eventDate || !guestCount || !shippingCity || !shippingStateCountry || !shippingPostalCode) {
      return NextResponse.json(
        { error: 'Name, email, event date, guest count, and complete shipping address are required' },
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

    console.log('[sauce-package-inquiry] New sauce package request:', {
      ...body,
      timestamp: new Date().toISOString(),
    })

    // Send email + Slack notifications
    await Promise.allSettled([
      sendSaucePackageNotification(body),
      sendSlackNotification(body),
    ]).then((results) => {
      const labels = ['Email', 'Slack']
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[sauce-package-inquiry] ${labels[i]} failed:`, r.reason)
      })
    })

    return NextResponse.json({
      success: true,
      leadType: 'sauce_package'
    })
  } catch (error) {
    console.error('[sauce-package-inquiry] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit sauce package inquiry' },
      { status: 500 }
    )
  }
}
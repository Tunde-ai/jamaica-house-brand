import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface MembershipSignupBody {
  tier: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  agreeTerms: boolean
}

async function sendSignupNotification(body: MembershipSignupBody) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) {
    console.warn('[membership-signup] GMAIL_APP_PASSWORD not set — skipping email')
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
    to: 'olatunde@jamaicahousebrand.com',
    replyTo: body.email,
    subject: `New Family Member Signup — ${body.tier} (${body.firstName} ${body.lastName})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a017; padding-bottom: 10px;">
          New Family Member Signup
        </h2>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">Tier</td>
            <td style="padding: 8px 12px; font-weight: bold; color: #d4a017;">${body.tier}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Name</td>
            <td style="padding: 8px 12px;">${body.firstName} ${body.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
            <td style="padding: 8px 12px;"><a href="mailto:${body.email}">${body.email}</a></td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td>
            <td style="padding: 8px 12px;"><a href="tel:${body.phone}">${body.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Address</td>
            <td style="padding: 8px 12px;">${body.address}<br>${body.city}, ${body.state} ${body.zip}</td>
          </tr>
        </table>

        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Reply directly to this email to respond to the customer.
        </p>
      </div>
    `,
  })

  console.log('[membership-signup] Notification email sent to olatunde@jamaicahousebrand.com')
}

async function sendSlackNotification(body: MembershipSignupBody) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '\uD83D\uDC51 New Family Member Signup' },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Tier:*\n${body.tier}` },
            { type: 'mrkdwn', text: `*Name:*\n${body.firstName} ${body.lastName}` },
            { type: 'mrkdwn', text: `*Email:*\n${body.email}` },
            { type: 'mrkdwn', text: `*Phone:*\n${body.phone}` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Address:*\n${body.address}\n${body.city}, ${body.state} ${body.zip}` },
        },
      ],
    }),
  })

  console.log('[membership-signup] Slack notification sent')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MembershipSignupBody
    const { tier, firstName, lastName, email, phone, address, city, state, zip, agreeTerms } = body

    if (!tier || !firstName || !lastName || !email || !phone || !address || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!agreeTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
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

    console.log('[membership-signup] New signup:', {
      ...body,
      timestamp: new Date().toISOString(),
    })

    // Send email + Slack notifications
    await Promise.allSettled([
      sendSignupNotification(body),
      sendSlackNotification(body),
    ]).then((results) => {
      const labels = ['Email', 'Slack']
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[membership-signup] ${labels[i]} failed:`, r.reason)
      })
    })

    // Stripe subscription creation deferred to future phase
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[membership-signup] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit signup' },
      { status: 500 }
    )
  }
}

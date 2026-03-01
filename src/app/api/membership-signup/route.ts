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
    to: 'info@jamaicahousebrand.com',
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

  console.log('[membership-signup] Notification email sent to info@jamaicahousebrand.com')
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

    // Send email notification
    try {
      await sendSignupNotification(body)
    } catch (emailErr) {
      console.error('[membership-signup] Email send failed:', emailErr)
      // Don't fail the request — the signup was still received
    }

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

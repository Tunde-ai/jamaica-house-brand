import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getCountyStatus, type ServiceAreaStatus } from '@/lib/florida-counties'

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
  // New service area fields
  venueState?: string
  venueCounty?: string
  serviceAreaStatus?: ServiceAreaStatus
  phoneCountryCode?: string
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

  // Determine email subject prefix based on service area status
  const statusLabels = {
    in_area: 'IN_AREA',
    tier_2: 'TIER_2',
    out_of_area: 'OUT_OF_AREA'
  }
  const statusLabel = body.serviceAreaStatus ? statusLabels[body.serviceAreaStatus] : 'UNKNOWN'

  // Determine response timeline based on status
  const responseTimeline = {
    in_area: '24 hours',
    tier_2: '48 hours (availability confirmation)',
    out_of_area: '48 hours (limited availability)'
  }
  const timeline = body.serviceAreaStatus ? responseTimeline[body.serviceAreaStatus] : '48 hours'

  await transporter.sendMail({
    from: '"Jamaica House Brand" <olatunde@jamaicahousebrand.com>',
    to: 'olatunde@jamaicahousebrand.com',
    replyTo: body.email,
    subject: `[CATERING INQUIRY - ${statusLabel}] ${body.name} - ${body.eventDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a017; padding-bottom: 10px;">
          🍽️ Catering Quote Request
        </h2>

        ${body.serviceAreaStatus ? `
        <div style="margin: 16px 0; padding: 12px; border-radius: 6px; ${
          body.serviceAreaStatus === 'in_area' ? 'background: #e8f5e8; border: 1px solid #4caf50;' :
          body.serviceAreaStatus === 'tier_2' ? 'background: #fff3cd; border: 1px solid #ffc107;' :
          'background: #f8d7da; border: 1px solid #dc3545;'
        }">
          <strong style="color: ${
            body.serviceAreaStatus === 'in_area' ? '#2e7d32' :
            body.serviceAreaStatus === 'tier_2' ? '#856404' :
            '#721c24'
          };">
            Service Area: ${
              body.serviceAreaStatus === 'in_area' ? '✅ Primary Service Area' :
              body.serviceAreaStatus === 'tier_2' ? '⚠️ Tier 2 (Premium Pricing)' :
              '❌ Out of Area'
            }
          </strong>
          <br>
          <span style="color: #555; font-size: 14px;">
            Expected response time: ${timeline}
          </span>
        </div>` : ''}

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
          ${body.venueState && body.venueCounty ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Location</td>
            <td style="padding: 8px 12px;">${body.venueCounty} County, ${body.venueState}</td>
          </tr>` : ''}
          ${body.venue ? `
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Venue</td>
            <td style="padding: 8px 12px;">${body.venue}</td>
          </tr>` : ''}
          ${body.proteins ? `
          <tr>
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

  console.log('[catering-quote] Notification email sent to olatunde@jamaicahousebrand.com')
}

async function sendSlackNotification(body: CateringQuoteBody) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const statusEmojis = {
    in_area: ':white_check_mark:',
    tier_2: ':warning:',
    out_of_area: ':x:'
  }
  const statusEmoji = body.serviceAreaStatus ? statusEmojis[body.serviceAreaStatus] : ':question:'

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: `🍽️ Catering Quote Request ${statusEmoji}` },
        },
        ...(body.serviceAreaStatus ? [{
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Service Area:* ${
                body.serviceAreaStatus === 'in_area' ? 'Primary Service Area' :
                body.serviceAreaStatus === 'tier_2' ? 'Tier 2 (Premium Pricing)' :
                'Out of Area'
              }`
            }
          ]
        }] : []),
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${body.name}` },
            { type: 'mrkdwn', text: `*Email:*\n${body.email}` },
            { type: 'mrkdwn', text: `*Phone:*\n${body.phone}` },
            { type: 'mrkdwn', text: `*Event Type:*\n${body.eventType}` },
          ],
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Event Date:*\n${body.eventDate}` },
            { type: 'mrkdwn', text: `*Guests:*\n${body.guestCount}` },
            ...(body.venueState && body.venueCounty ? [{ type: 'mrkdwn', text: `*Location:*\n${body.venueCounty} County, ${body.venueState}` }] : []),
            ...(body.venue ? [{ type: 'mrkdwn', text: `*Venue:*\n${body.venue}` }] : []),
          ],
        },
        ...(body.proteins ? [{
          type: 'section',
          fields: [{ type: 'mrkdwn', text: `*Proteins:*\n${body.proteins}` }],
        }] : []),
        ...(body.message ? [{
          type: 'section',
          text: { type: 'mrkdwn', text: `*Additional Details:*\n${body.message}` },
        }] : []),
      ],
    }),
  })

  console.log('[catering-quote] Slack notification sent')
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CateringQuoteBody
    const { name, email, phone, eventType, eventDate, guestCount, venueState, venueCounty } = body

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

    // Determine service area status
    let serviceAreaStatus: ServiceAreaStatus = 'out_of_area'
    if (venueState === 'Florida' && venueCounty) {
      serviceAreaStatus = getCountyStatus(venueCounty)
    }

    // Add service area metadata to body
    body.serviceAreaStatus = serviceAreaStatus

    console.log('[catering-quote] New quote request:', {
      ...body,
      serviceAreaStatus,
      timestamp: new Date().toISOString(),
    })

    // Send email + Slack notifications
    await Promise.allSettled([
      sendQuoteNotification(body),
      sendSlackNotification(body),
    ]).then((results) => {
      const labels = ['Email', 'Slack']
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[catering-quote] ${labels[i]} failed:`, r.reason)
      })
    })

    return NextResponse.json({
      success: true,
      leadType: 'catering',
      serviceAreaStatus
    })
  } catch (error) {
    console.error('[catering-quote] Request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}
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
  // Location fields
  venueState?: string
  venueCounty?: string
  serviceAreaStatus?: ServiceAreaStatus
  phoneCountryCode?: string
  // New service area selection
  serviceArea: 'miami' | 'jamaica' | 'atlanta' | 'other'
  jamaicaAddress?: string
  atlantaAddress?: string
  otherLocationDetails?: string
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

  // Determine email subject prefix based on service area
  const serviceAreaLabels = {
    miami: 'MIAMI/BROWARD',
    jamaica: 'JAMAICA',
    atlanta: 'ATLANTA',
    other: 'OTHER_LOCATION'
  }
  const serviceAreaLabel = serviceAreaLabels[body.serviceArea]

  // Fallback to legacy status labels for Miami area
  const statusLabels = {
    in_area: 'IN_AREA',
    tier_2: 'TIER_2',
    out_of_area: 'OUT_OF_AREA'
  }
  const statusLabel = (body.serviceArea === 'miami' && body.serviceAreaStatus)
    ? statusLabels[body.serviceAreaStatus]
    : serviceAreaLabel

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

        <div style="margin: 16px 0; padding: 12px; border-radius: 6px; ${
          body.serviceArea === 'miami' ? 'background: #e8f5e8; border: 1px solid #4caf50;' :
          body.serviceArea === 'jamaica' ? 'background: #e3f2fd; border: 1px solid #2196f3;' :
          body.serviceArea === 'atlanta' ? 'background: #f3e5f5; border: 1px solid #9c27b0;' :
          'background: #fff3e0; border: 1px solid #ff9800;'
        }">
          <strong style="color: ${
            body.serviceArea === 'miami' ? '#2e7d32' :
            body.serviceArea === 'jamaica' ? '#1565c0' :
            body.serviceArea === 'atlanta' ? '#7b1fa2' :
            '#ef6c00'
          };">
            Service Area: ${
              body.serviceArea === 'miami' ? '🇺🇸 Miami/Broward, Florida' :
              body.serviceArea === 'jamaica' ? '🇯🇲 Jamaica' :
              body.serviceArea === 'atlanta' ? '🏢 Atlanta, Georgia' :
              '❓ Other Location'
            }
          </strong>
          <br>
          <span style="color: #555; font-size: 14px;">
            ${body.serviceArea === 'miami' && body.serviceAreaStatus
              ? `Expected response time: ${timeline}`
              : 'Expected response time: 24 hours with custom pricing'
            }
          </span>
        </div>

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
          ${body.serviceArea === 'miami' && body.venueState && body.venueCounty ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Location</td>
            <td style="padding: 8px 12px;">${body.venueCounty} County, ${body.venueState}</td>
          </tr>` : ''}
          ${body.serviceArea === 'jamaica' && body.jamaicaAddress ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">🇯🇲 Jamaica Address</td>
            <td style="padding: 8px 12px; white-space: pre-wrap;">${body.jamaicaAddress}</td>
          </tr>` : ''}
          ${body.serviceArea === 'atlanta' && body.atlantaAddress ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">🏢 Atlanta Address</td>
            <td style="padding: 8px 12px; white-space: pre-wrap;">${body.atlantaAddress}</td>
          </tr>` : ''}
          ${body.serviceArea === 'other' && body.otherLocationDetails ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">❓ Location Details</td>
            <td style="padding: 8px 12px; white-space: pre-wrap;">${body.otherLocationDetails}</td>
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
    const {
      name, email, phone, eventType, eventDate, guestCount,
      venueState, venueCounty, serviceArea,
      jamaicaAddress, atlantaAddress, otherLocationDetails
    } = body

    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return NextResponse.json(
        { error: 'Name, email, phone, event type, date, and guest count are required' },
        { status: 400 }
      )
    }

    // Validate service area specific requirements
    if (serviceArea === 'jamaica' && !jamaicaAddress?.trim()) {
      return NextResponse.json(
        { error: 'Please provide the event address for Jamaica delivery' },
        { status: 400 }
      )
    }

    if (serviceArea === 'atlanta' && !atlantaAddress?.trim()) {
      return NextResponse.json(
        { error: 'Please provide the event address for Atlanta delivery' },
        { status: 400 }
      )
    }

    if (serviceArea === 'other' && !otherLocationDetails?.trim()) {
      return NextResponse.json(
        { error: 'Please provide details about your event location' },
        { status: 400 }
      )
    }

    if (serviceArea === 'miami' && venueState === 'Florida' && !venueCounty) {
      return NextResponse.json(
        { error: 'Please select your venue county for Miami/Broward events' },
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
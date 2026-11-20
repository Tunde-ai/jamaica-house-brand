import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface CustomLabelOrder {
  cases: number
  totalBottles: number
  subtotal: number
  contactName: string
  contactEmail: string
  contactPhone: string
  eventDate: string
  notes: string
  labelData: {
    template: string
    line1: string
    line2: string
    line3: string
    logoUrl: string | null
    logoFileName: string | null
  }
}

async function sendSlackNotification(order: CustomLabelOrder, total: number, setupFee: number) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL?.trim()
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🏷️ Custom Label Order Received!' },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Customer:*\n${order.contactName}` },
            { type: 'mrkdwn', text: `*Email:*\n${order.contactEmail}` },
            { type: 'mrkdwn', text: `*Phone:*\n${order.contactPhone || 'N/A'}` },
            { type: 'mrkdwn', text: `*Event Date:*\n${order.eventDate || 'N/A'}` },
          ],
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Cases:*\n${order.cases} (${order.totalBottles} bottles)` },
            { type: 'mrkdwn', text: `*Total:*\n$${(total / 100).toFixed(2)}` },
            { type: 'mrkdwn', text: `*Template:*\n${order.labelData.template}` },
            { type: 'mrkdwn', text: `*Label Text:*\n"${order.labelData.line1}"` },
          ],
        },
        ...(order.notes ? [{
          type: 'section' as const,
          text: { type: 'mrkdwn' as const, text: `*Notes:* ${order.notes}` },
        }] : []),
      ],
    }),
  })

  console.log('[custom-label-order] Slack notification sent')
}

async function sendInternalEmail(order: CustomLabelOrder, total: number, setupFee: number) {
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (!appPassword) return

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
    replyTo: order.contactEmail,
    subject: `🏷️ Custom Label Order — ${order.contactName} — ${order.cases} cases — $${(total / 100).toFixed(2)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4a017; padding-bottom: 10px;">
          🏷️ Custom Label Order
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555; width: 140px;">Name</td><td style="padding: 8px 12px;">${order.contactName}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${order.contactEmail}">${order.contactEmail}</a></td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td><td style="padding: 8px 12px;">${order.contactPhone || 'N/A'}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Event Date</td><td style="padding: 8px 12px;">${order.eventDate || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Cases</td><td style="padding: 8px 12px;">${order.cases} (${order.totalBottles} bottles)</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Setup Fee</td><td style="padding: 8px 12px;">$${(setupFee / 100).toFixed(2)}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555; font-size: 16px;">Total</td><td style="padding: 8px 12px; font-weight: bold; font-size: 16px;">$${(total / 100).toFixed(2)}</td></tr>
        </table>
        <h3 style="margin-top: 20px; color: #1a1a1a;">Label Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Template</td><td style="padding: 8px 12px;">${order.labelData.template}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Line 1</td><td style="padding: 8px 12px;">${order.labelData.line1}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Line 2</td><td style="padding: 8px 12px;">${order.labelData.line2 || '—'}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Line 3</td><td style="padding: 8px 12px;">${order.labelData.line3 || '—'}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Logo</td><td style="padding: 8px 12px;">${order.labelData.logoFileName || 'None'}</td></tr>
        </table>
        ${order.notes ? `<div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-left: 3px solid #d4a017;"><strong>Notes:</strong> ${order.notes}</div>` : ''}
        <p style="margin-top: 24px; font-size: 12px; color: #999;">Reply directly to this email to respond to the customer.</p>
      </div>
    `,
  })

  console.log('[custom-label-order] Internal email sent')
}

export async function POST(request: NextRequest) {
  try {
    const order: CustomLabelOrder = await request.json()

    // Validate required fields
    if (!order.contactName || !order.contactEmail || !order.labelData.line1) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (order.cases < 2) {
      return NextResponse.json(
        { error: 'Minimum order is 2 cases' },
        { status: 400 }
      )
    }

    // Calculate pricing server-side (don't trust client)
    const setupFee = order.cases <= 5 ? 15000 : 30000
    const fullTotal = (order.cases * 8000) + setupFee

    console.log('[custom-label-order] New order:', {
      contact: order.contactName,
      email: order.contactEmail,
      cases: order.cases,
      total: `$${(fullTotal / 100).toFixed(2)}`,
    })

    // Send notifications
    await Promise.allSettled([
      sendInternalEmail(order, fullTotal, setupFee),
      sendSlackNotification(order, fullTotal, setupFee),
    ]).then((results) => {
      const labels = ['Email', 'Slack']
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[custom-label-order] ${labels[i]} failed:`, r.reason)
      })
    })

    // Return success — no Stripe session needed yet
    // Payment link will be sent manually after label proof approval + bottle photos
    return NextResponse.json({
      success: true,
      orderSummary: {
        cases: order.cases,
        totalBottles: order.totalBottles,
        setupFee: setupFee / 100,
        total: fullTotal / 100,
      },
    })
  } catch (error) {
    console.error('[custom-label-order] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

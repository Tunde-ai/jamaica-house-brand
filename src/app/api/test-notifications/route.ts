import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

// TEMPORARY — test endpoint to verify Slack + email notifications
// Remove after confirming notifications work
export async function GET() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  // Dynamically import the webhook module's notification functions
  // Instead, we duplicate minimal logic here to avoid export changes
  const nodemailer = await import('nodemailer')

  const mockSession = {
    id: 'cs_test_mock_123',
    amount_total: 1298,
    customer_details: {
      email: 'testcustomer@example.com',
      name: 'Test Customer',
    },
    collected_information: {
      shipping_details: {
        name: 'Test Customer',
        address: {
          line1: '123 Test Street',
          line2: null,
          city: 'Miami',
          state: 'FL',
          postal_code: '33101',
          country: 'US',
        },
      },
    },
    shipping_cost: {
      amount_total: 599,
    },
    line_items: {
      data: [
        { description: 'Jerk Sauce (2oz)', quantity: 1, amount_total: 699 },
      ],
    },
  }

  const results: Record<string, string> = {}

  // Test Slack
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '🧪 Test Order Notification' },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: '*Total:*\n$12.98' },
                { type: 'mrkdwn', text: '*Shipping:*\n$5.99' },
                { type: 'mrkdwn', text: '*Customer:*\ntestcustomer@example.com' },
                { type: 'mrkdwn', text: '*Ship To:*\nTest Customer' },
              ],
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: '*Address:*\n123 Test Street, Miami, FL 33101' },
            },
            {
              type: 'section',
              text: { type: 'mrkdwn', text: '*Items:*\n• 1x Jerk Sauce (2oz)' },
            },
          ],
        }),
      })
      results.slack = res.ok ? 'sent' : `failed (${res.status})`
    } catch (err) {
      results.slack = `error: ${err}`
    }
  } else {
    results.slack = 'skipped (no SLACK_WEBHOOK_URL)'
  }

  // Test Email
  const appPassword = process.env.GMAIL_APP_PASSWORD
  if (appPassword) {
    try {
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: 'olatunde@jamaicahousebrand.com',
          pass: appPassword,
        },
      })

      await transporter.sendMail({
        from: '"Jamaica House Brand Orders" <olatunde@jamaicahousebrand.com>',
        to: 'olatunde@jamaicahousebrand.com',
        subject: 'Test Order — Test Customer — $12.98',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: #1a1a2e; padding: 24px; text-align: center;">
              <h1 style="color: #d4a437; margin: 0; font-size: 24px;">Test Order Notification</h1>
            </div>
            <div style="padding: 24px; background: #fff;">
              <p>This is a test email to confirm notifications are working.</p>
              <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Customer Details</h2>
              <p><strong>Name:</strong> Test Customer<br><strong>Email:</strong> testcustomer@example.com</p>
              <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Shipping Address</h2>
              <p>123 Test Street<br>Miami, FL 33101<br>US</p>
              <h2 style="font-size: 18px; border-bottom: 2px solid #d4a437; padding-bottom: 8px;">Items Ordered</h2>
              <p>1x Jerk Sauce (2oz) — $6.99</p>
              <p><strong>Shipping:</strong> $5.99</p>
              <p style="font-size: 18px;"><strong>Total: $12.98</strong></p>
            </div>
            <div style="background: #1a1a2e; padding: 16px; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">Jamaica House Brand — Test Notification</p>
            </div>
          </div>`,
      })
      results.email = 'sent'
    } catch (err) {
      results.email = `error: ${err}`
    }
  } else {
    results.email = 'skipped (no GMAIL_APP_PASSWORD)'
  }

  return NextResponse.json(results)
}

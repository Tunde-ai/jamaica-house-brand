import { NextRequest, NextResponse } from 'next/server'

interface StoreRequestPayload {
  name: string
  email: string
  zipCode: string
  storeName?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: StoreRequestPayload = await req.json()

    if (!body.name || !body.email || !body.zipCode) {
      return NextResponse.json(
        { error: 'Name, email, and zip code are required.' },
        { status: 400 }
      )
    }

    // Send Slack notification
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📍 STORE LOCATION REQUEST`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `📍 New Store Location Request`,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Name:*\n${body.name}` },
                { type: 'mrkdwn', text: `*Email:*\n${body.email}` },
                { type: 'mrkdwn', text: `*Zip Code:*\n${body.zipCode}` },
                {
                  type: 'mrkdwn',
                  text: `*Suggested Store:*\n${body.storeName || 'Not specified'}`,
                },
              ],
            },
            ...(body.message
              ? [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: `*Message:*\n${body.message}`,
                    },
                  },
                ]
              : []),
          ],
        }),
      }).catch(() => {
        // Non-critical — don't fail the request if Slack is down
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing store request:', error)
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    )
  }
}

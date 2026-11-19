import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WeeklyMarketingEmail, DEFAULT_PRODUCTS } from '@/lib/email-templates/WeeklyMarketing'

// =============================================================================
// Weekly Marketing Email Cron
// Pulls subscribers from Mailchimp audience and sends the weekly promo email
// via Resend. Scheduled every Monday at 10 AM ET.
//
// Sends in batches of 50 to stay within Resend rate limits.
// Skips contacts tagged 'unsubscribed' in Mailchimp.
// =============================================================================

const BATCH_SIZE = 50
const BATCH_DELAY_MS = 1500

interface MailchimpMember {
  email_address: string
  merge_fields: { FNAME?: string }
  status: string
}

interface MailchimpResponse {
  members: MailchimpMember[]
  total_items: number
}

async function getMailchimpSubscribers(): Promise<{ email: string; firstName: string }[]> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const listId = process.env.MAILCHIMP_AUDIENCE_ID || process.env.MAILCHIMP_LIST_ID
  const server = process.env.MAILCHIMP_SERVER || apiKey?.split('-').pop()

  if (!apiKey || !listId || !server) {
    console.warn('[weekly-marketing] Mailchimp not configured')
    return []
  }

  const subscribers: { email: string; firstName: string }[] = []
  let offset = 0
  const count = 200

  // Paginate through the full audience
  while (true) {
    const url = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members?status=subscribed&count=${count}&offset=${offset}&fields=members.email_address,members.merge_fields,members.status,total_items`

    const res = await fetch(url, {
      headers: {
        Authorization: `apikey ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.error('[weekly-marketing] Mailchimp fetch error:', res.status, await res.text())
      break
    }

    const data = (await res.json()) as MailchimpResponse

    for (const member of data.members) {
      if (member.status === 'subscribed') {
        subscribers.push({
          email: member.email_address,
          firstName: member.merge_fields?.FNAME || '',
        })
      }
    }

    offset += count
    if (offset >= data.total_items) break
  }

  return subscribers
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[weekly-marketing] RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Pull subscribers from Mailchimp
    const subscribers = await getMailchimpSubscribers()

    if (subscribers.length === 0) {
      console.log('[weekly-marketing] No subscribers found — skipping')
      return NextResponse.json({ sent: 0, message: 'No subscribers' })
    }

    console.log(`[weekly-marketing] Sending to ${subscribers.length} subscribers`)

    let sent = 0
    let failed = 0

    // Send in batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map(async (sub) => {
          const html = await render(
            WeeklyMarketingEmail({
              firstName: sub.firstName || undefined,
              headline: 'Flash Sale: 20oz for $20',
              subheadline: 'Two bottles of our Original Jerk Sauce at 50% off. Limited time — grab yours before they\'re gone.',
              products: DEFAULT_PRODUCTS,
            })
          )

          return resend.emails.send({
            from: 'Jamaica House Brand <hello@jamaicahousebrand.com>',
            to: sub.email,
            subject: 'Flash Sale: 20oz of Jerk Sauce for $20 — 50% Off!',
            html,
          })
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          sent++
        } else {
          failed++
          console.error('[weekly-marketing] Send failed:', result.reason)
        }
      }

      // Respect rate limits between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await delay(BATCH_DELAY_MS)
      }
    }

    console.log(`[weekly-marketing] Complete: ${sent} sent, ${failed} failed`)

    return NextResponse.json({
      sent,
      failed,
      total: subscribers.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[weekly-marketing] Cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

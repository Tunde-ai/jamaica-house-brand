import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { Resend } from 'resend'

// =============================================================================
// Abandoned Cart Recovery Cron
// Scans for incomplete PaymentIntents from the custom checkout flow and sends
// recovery emails via Resend. Runs every 2 hours.
//
// Targets PaymentIntents that:
//   - Have source: 'jamaica-house-brand-checkout' in metadata
//   - Were created 1–48 hours ago (gives customer time, avoids spam on old ones)
//   - Have status: requires_payment_method OR requires_confirmation
//   - Have a customer_email in metadata
// =============================================================================

const ONE_HOUR_MS = 60 * 60 * 1000
const FORTY_EIGHT_HOURS_MS = 48 * ONE_HOUR_MS

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[abandoned-cart] RESEND_API_KEY not set — skipping')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  try {
    const stripe = getStripe()
    const resend = new Resend(process.env.RESEND_API_KEY)
    const now = Date.now()

    // Search for incomplete PaymentIntents created in the 1–48 hour window
    const createdAfter = Math.floor((now - FORTY_EIGHT_HOURS_MS) / 1000)
    const createdBefore = Math.floor((now - ONE_HOUR_MS) / 1000)

    // Fetch PaymentIntents that haven't succeeded
    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: createdAfter, lte: createdBefore },
      limit: 100,
    })

    const abandoned = paymentIntents.data.filter((pi) => {
      const isOurCheckout = pi.metadata?.source === 'jamaica-house-brand-checkout'
      const isIncomplete =
        pi.status === 'requires_payment_method' ||
        pi.status === 'requires_confirmation' ||
        pi.status === 'requires_action'
      const hasEmail = !!pi.metadata?.customer_email
      // Skip upsells — those are secondary charges, not abandoned carts
      const isNotUpsell = pi.metadata?.type !== 'post_purchase_upsell'
      // Skip if we already sent a recovery email
      const notAlreadySent = !pi.metadata?.recovery_email_sent

      return isOurCheckout && isIncomplete && hasEmail && isNotUpsell && notAlreadySent
    })

    console.log(`[abandoned-cart] Found ${abandoned.length} abandoned carts in window`)

    let emailsSent = 0
    let emailsFailed = 0

    for (const pi of abandoned) {
      const email = pi.metadata.customer_email
      const name = pi.metadata.customer_name?.split(' ')[0] || ''
      const amount = `$${(pi.amount / 100).toFixed(2)}`

      // Parse items from metadata
      let itemsHtml = ''
      try {
        const items: { name: string; price: number; quantity: number }[] =
          JSON.parse(pi.metadata.items || '[]')
        itemsHtml = items
          .map(
            (item) =>
              `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">×${item.quantity}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${item.price === 0 ? 'FREE' : `$${(item.price / 100).toFixed(2)}`}</td>
              </tr>`
          )
          .join('')
      } catch {
        // If items can't be parsed, skip the table
      }

      const greeting = name ? `Hey ${name},` : 'Hey there,'

      try {
        await resend.emails.send({
          from: 'Jamaica House Brand <orders@jamaicahousebrand.com>',
          to: email,
          subject: 'You left something behind! 🌶️',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="background: #1a1a2e; padding: 24px; text-align: center;">
                <h1 style="color: #d4a437; margin: 0; font-size: 24px;">Still thinking it over?</h1>
              </div>
              <div style="padding: 24px; background: #fff;">
                <p style="font-size: 16px; line-height: 1.6;">
                  ${greeting}
                </p>
                <p style="font-size: 16px; line-height: 1.6;">
                  We noticed you didn't finish your order. No worries — just wanted to make sure nothing went wrong on our end!
                </p>
                ${itemsHtml ? `
                <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="background: #f8f8f8;">
                      <th style="padding: 8px; text-align: left;">Item</th>
                      <th style="padding: 8px; text-align: center;">Qty</th>
                      <th style="padding: 8px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <p style="font-size: 14px; color: #666;">Cart total: <strong>${amount}</strong> (including shipping)</p>
                ` : ''}
                <p style="font-size: 16px; line-height: 1.6;">
                  Our authentic Jamaican jerk sauce is handmade in small batches and sells out fast. Don't miss out!
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://jamaicahousebrand.com/shop" style="background: #d4a437; color: #1a1a2e; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; display: inline-block;">Complete Your Order</a>
                </div>
                <p style="font-size: 14px; color: #666;">
                  Questions? Reply to this email or call us at (754) 261-4918.
                </p>
              </div>
              <div style="background: #1a1a2e; padding: 16px; text-align: center;">
                <p style="color: #888; font-size: 12px; margin: 0;">Jamaica House Brand — Bold Caribbean Flavor in Every Drop</p>
              </div>
            </div>
          `,
        })

        emailsSent++
        console.log(`[abandoned-cart] Recovery email sent to: ${email}`)

        // Cancel the PaymentIntent so we don't email them again on the next run
        await stripe.paymentIntents.cancel(pi.id).catch(() => {
          // If cancel fails (e.g. already canceled), that's fine — just update metadata
        })

        // Mark as recovery-sent so we never double-email
        await stripe.paymentIntents.update(pi.id, {
          metadata: { ...pi.metadata, recovery_email_sent: new Date().toISOString() },
        }).catch(() => {
          // Best-effort metadata update
        })
      } catch (err) {
        emailsFailed++
        console.error(`[abandoned-cart] Failed to send to ${email}:`, err)
      }
    }

    // Slack summary if any abandoned carts were found
    const slackUrl = process.env.SLACK_WEBHOOK_URL?.trim()
    if (slackUrl && abandoned.length > 0) {
      try {
        await fetch(slackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [
              {
                type: 'header',
                text: { type: 'plain_text', text: `🛒 Abandoned Cart Recovery — ${emailsSent} email${emailsSent !== 1 ? 's' : ''} sent` },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: abandoned
                    .map((pi) => {
                      const email = pi.metadata.customer_email
                      const name = pi.metadata.customer_name || 'Unknown'
                      const amt = `$${(pi.amount / 100).toFixed(2)}`
                      const age = Math.round((now - pi.created * 1000) / ONE_HOUR_MS)
                      return `• *${name}* (${email}) — ${amt} — ${age}h ago`
                    })
                    .join('\n'),
                },
              },
              ...(emailsFailed > 0
                ? [{
                    type: 'context' as const,
                    elements: [{ type: 'mrkdwn' as const, text: `⚠️ ${emailsFailed} email${emailsFailed !== 1 ? 's' : ''} failed to send` }],
                  }]
                : []),
            ],
          }),
        })
      } catch (err) {
        console.error('[abandoned-cart] Slack notification failed:', err)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      abandonedFound: abandoned.length,
      emailsSent,
      emailsFailed,
    })
  } catch (error) {
    console.error('[abandoned-cart] Cron failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

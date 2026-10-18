import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// Vercel Cron — Unaddressed Order Reminders
// Runs once daily (4 PM UTC / noon ET). Finds orders still sitting in
// early statuses (quote_requested, deposit_paid) that haven't moved in 4+ hours.
// Sends Slack + email reminders so nothing falls through the cracks.

const STALE_THRESHOLD_HOURS = 4
const REMINDER_COOLDOWN_HOURS = 22 // won't re-remind for the same order within this window

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[order-reminders] Checking for unaddressed orders...')

    const supabase = getSupabase()
    const cutoff = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString()

    // Find orders in early statuses that were created/updated before the cutoff
    const { data: staleOrders, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_status,
        total_amount, event_date, created_at, updated_at,
        customer:customers(name, email, phone)
      `)
      .in('status', ['quote_requested', 'deposit_paid'])
      .lt('updated_at', cutoff)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[order-reminders] DB query failed:', error)
      throw new Error(`Database query failed: ${error.message}`)
    }

    if (!staleOrders || staleOrders.length === 0) {
      console.log('[order-reminders] No stale orders found')
      return NextResponse.json({
        success: true,
        staleOrders: 0,
        reminded: 0,
        timestamp: new Date().toISOString(),
      })
    }

    // Filter out orders we already reminded about recently
    // Check lead_activities for recent reminder entries
    const orderIds = staleOrders.map((o) => o.id)
    const cooldownCutoff = new Date(
      Date.now() - REMINDER_COOLDOWN_HOURS * 60 * 60 * 1000
    ).toISOString()

    const { data: recentReminders } = await supabase
      .from('lead_activities')
      .select('order_id')
      .in('order_id', orderIds)
      .eq('activity_type', 'follow_up_sent')
      .gte('created_at', cooldownCutoff)

    const recentlyRemindedIds = new Set(
      (recentReminders || []).map((r) => r.order_id)
    )
    const ordersToRemind = staleOrders.filter(
      (o) => !recentlyRemindedIds.has(o.id)
    )

    if (ordersToRemind.length === 0) {
      console.log(
        '[order-reminders] All stale orders already reminded recently'
      )
      return NextResponse.json({
        success: true,
        staleOrders: staleOrders.length,
        reminded: 0,
        skippedCooldown: staleOrders.length,
        timestamp: new Date().toISOString(),
      })
    }

    // Send reminders
    await Promise.allSettled([
      sendSlackReminder(ordersToRemind),
      sendEmailReminder(ordersToRemind),
    ])

    // Log reminder activities so we don't spam
    const activities = ordersToRemind.map((order) => {
      const customer = order.customer as any
      return {
        customer_id: undefined as string | undefined,
        order_id: order.id,
        activity_type: 'follow_up_sent' as const,
        description: `Auto-reminder: order ${order.order_number} unaddressed for ${hoursAgo(order.updated_at)}h`,
        metadata: { source: 'cron-order-reminders', status: order.status },
      }
    })

    // We need customer_id for lead_activities — pull from orders
    for (const order of ordersToRemind) {
      const { data: fullOrder } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('id', order.id)
        .single()
      const act = activities.find((a) => a.order_id === order.id)
      if (act && fullOrder) {
        act.customer_id = fullOrder.customer_id
      }
    }

    const validActivities = activities.filter((a) => a.customer_id)
    if (validActivities.length > 0) {
      await supabase.from('lead_activities').insert(validActivities)
    }

    console.log(
      `[order-reminders] Reminded about ${ordersToRemind.length} orders`
    )

    return NextResponse.json({
      success: true,
      staleOrders: staleOrders.length,
      reminded: ordersToRemind.length,
      skippedCooldown: staleOrders.length - ordersToRemind.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[order-reminders] Failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// ---- Helpers ----

function hoursAgo(dateStr: string): number {
  return Math.round(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
  )
}

function formatOrderLine(order: any): string {
  const customer = order.customer as any
  const name = customer?.name || 'Unknown'
  const email = customer?.email || ''
  const total = order.total_amount
    ? `$${Number(order.total_amount).toFixed(2)}`
    : 'N/A'
  const hours = hoursAgo(order.updated_at)
  const status =
    order.status === 'quote_requested' ? 'Quote Requested' : 'Deposit Paid'
  return `${name} — ${total} — ${status} — waiting ${hours}h\n   ${email} · Order ${order.order_number}`
}

async function sendSlackReminder(orders: any[]) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const orderLines = orders
    .map((o) => {
      const customer = o.customer as any
      const name = customer?.name || 'Unknown'
      const total = o.total_amount
        ? `$${Number(o.total_amount).toFixed(2)}`
        : 'N/A'
      const hours = hoursAgo(o.updated_at)
      const status =
        o.status === 'quote_requested' ? 'Quote Requested' : 'Deposit Paid'
      return `• *${name}* — ${total} — ${status} — _${hours}h ago_`
    })
    .join('\n')

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `⏰ ${orders.length} Order${orders.length > 1 ? 's' : ''} Waiting on You`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `These orders haven't been addressed yet:\n\n${orderLines}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'Auto-reminder · <https://command-center.jamaicahousebrand.com|Open Command Center>',
              },
            ],
          },
        ],
      }),
    })
  } catch (err) {
    console.error('[order-reminders] Slack failed:', err)
  }
}

async function sendEmailReminder(orders: any[]) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return

  const adminEmail =
    process.env.ADMIN_EMAIL || 'tunde@jamaicahousebrand.com'

  const orderRows = orders
    .map((o) => {
      const customer = o.customer as any
      const name = customer?.name || 'Unknown'
      const email = customer?.email || ''
      const total = o.total_amount
        ? `$${Number(o.total_amount).toFixed(2)}`
        : 'N/A'
      const hours = hoursAgo(o.updated_at)
      const status =
        o.status === 'quote_requested' ? 'Quote Requested' : 'Deposit Paid'
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${total}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${status}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #c00; font-weight: bold;">${hours}h</td>
        </tr>`
    })
    .join('')

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Jamaica House Brand <alerts@jamaicahousebrand.com>',
        to: [adminEmail],
        subject: `⏰ ${orders.length} unaddressed order${orders.length > 1 ? 's' : ''} — action needed`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
            <div style="background: #1a1a2e; padding: 20px; text-align: center;">
              <h1 style="color: #d4a437; margin: 0; font-size: 20px;">Orders Waiting on You</h1>
            </div>
            <div style="padding: 20px; background: #fff;">
              <p style="font-size: 14px; color: #666; margin-top: 0;">
                As of ${timestamp}, these orders haven't been responded to yet:
              </p>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f8f8;">
                    <th style="padding: 10px; text-align: left;">Customer</th>
                    <th style="padding: 10px; text-align: left;">Email</th>
                    <th style="padding: 10px; text-align: left;">Total</th>
                    <th style="padding: 10px; text-align: left;">Status</th>
                    <th style="padding: 10px; text-align: left;">Waiting</th>
                  </tr>
                </thead>
                <tbody>${orderRows}</tbody>
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://command-center.jamaicahousebrand.com"
                   style="display: inline-block; background: #d4a437; color: #1a1a2e; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Open Command Center
                </a>
              </div>
            </div>
            <div style="padding: 12px 20px; background: #f4f4f4; text-align: center;">
              <p style="color: #999; font-size: 11px; margin: 0;">Auto-reminder from Jamaica House Brand</p>
            </div>
          </div>
        `,
      }),
    })
  } catch (err) {
    console.error('[order-reminders] Email failed:', err)
  }
}
